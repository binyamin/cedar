import { isPromise } from 'node:util/types';

import { walk } from './utils/fs.js';
import { createDebug } from './utils/log.js';
import * as fileUtils from './file.js';

const debug = {
	main: createDebug('runner'),
	plugins: createDebug('plugins'),
};

/**
 * @typedef {import("./plugin.js").Options} Options
 * @typedef {import("./plugin.js").Plugin} Plugin
 * @typedef {import('./file.js').File} File
 * @typedef {import("vfile").VFile} vFile
 */

/**
 *
 * @param {vFile[]} files
 */
async function writeAll(files) {
	const results = [];

	for (const file of files) {
		if (file.data.write) {
			debug.main('Writing "%s" to "%s"', file.path, file.dirname);
			results.push(fileUtils.write(file));
		}
	}

	await Promise.all(results);
	fileUtils.report(files);
}

class Runner {
	/**
	 * @type {Readonly<Options>}
	 */
	#config;

	/**
	 * @type {Plugin[]}
	 */
	#plugins = [];

	/**
	 * @type {vFile[]}
	 */
	#files = [];

	constructor(options) {
		// Config object is now read-only. This is to prevent
		// the user from modifying it in-transit.
		this.#config = Object.freeze(options);
	}

	/**
	 *
	 * @param {Plugin | (options: Record<string, any>) => Plugin} plugin
	 * @param {Record<string, any>} [options]
	 * @returns {this}
	 */
	use(plugin, options = {}) {
		const p = typeof plugin === 'function' ? plugin(options) : plugin;

		this.#plugins.push(p);

		return this;
	}

	async process(paths) {
		for (const p of this.#plugins) {
			p.state = {};
			const value = p.init({
				global: this.#config,
				state: p.state,
			});
			/* eslint-disable-next-line no-await-in-loop */
			if (isPromise(value)) await value;
		}

		if (paths) {
			if (Array.isArray(paths)) {
				this.#files = await Promise.all(
					paths.map((p) => fileUtils.create(p)),
				);
			} else {
				this.#files = [await fileUtils.create(paths)];
			}
		} else {
			const filepaths = await walk(this.#config.src);

			this.#files = await Promise.all(
				filepaths.map((file) => fileUtils.create(file)),
			);
		}

		// Note: Because we're using `const file` and not `let file`, we get
		// a reference to the array item itself. This is signficant, because
		// when we pass it to the user, we don't need them to pass it back.
		for (const file of this.#files) {
			file.data.rename({
				path: file.path.replace(this.#config.src, this.#config.dest),
			});

			for (const plugin of this.#plugins) {
				if (plugin.extensions.includes(file.extname)) {
					debug.plugins(
						'running plugin:%s on "%s"',
						plugin.name,
						file.history[0],
					);

					const value = plugin.onFile({
						global: this.#config,
						state: plugin.state,
						file,
					});

					/* eslint-disable-next-line no-await-in-loop */
					if (isPromise(value)) await value;
				}
			}
		}

		return {
			files: this.#files,
			write: () => writeAll(this.#files),
		};
	}
}

function createRunner(options) {
	return new Runner(options);
}

export { Runner };
export default createRunner;
