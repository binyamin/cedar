import path from 'node:path';
import { isPromise } from 'node:util/types';

import { walk, writeFile } from './utils/fs.js';
import { createDebug } from './utils/log.js';
import { createFile } from './file.js';

const debug = {
	main: createDebug('runner'),
	plugins: createDebug('plugins'),
};

/**
 * @typedef {import("./plugin.js").Options} Options
 * @typedef {import("./plugin.js").Plugin} Plugin
 * @typedef {import('./file.js').File} File
 */

/**
 *
 * @param {File[]} files
 */
async function write(files) {
	const results = [];

	for (const file of files) {
		if (file.destination) {
			debug.main('Writing "%s" to "%s"', file.path, file.destination);
			results.push(writeFile(file.destination, file.contents, 'utf-8'));
		}
	}

	await Promise.all(results);
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
	 * @type {File[]}
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
				this.#files = await Promise.all(paths.map((p) => createFile(p)));
			} else {
				this.#files = [await createFile(paths)];
			}
		} else {
			const filepaths = await walk(this.#config.src);

			this.#files = await Promise.all(
				filepaths.map((file) => createFile(file)),
			);
		}

		// Note: Because we're using `const file` and not `let file`, we get
		// a reference to the array item itself.
		for (const file of this.#files) {
			file.destination ??= path.join(
				this.#config.dest,
				path.relative(this.#config.src, file.path),
			);

			for (const plugin of this.#plugins) {
				if (plugin.extensions.some((value) => file.path.endsWith(value))) {
					debug.plugins('running plugin:%s on "%s"', plugin.name, file.path);

					const value = plugin.onFile({
						global: this.#config,
						state: plugin.state,
						// Prevent user from modifying original object, using `Object.assign`
						file: Object.assign({}, file),
					});

					/* eslint-disable-next-line no-await-in-loop */
					Object.assign(file, isPromise(value) ? await value : value);
					// Note: because we're using `const file` above, we need to
					// we can't overwrite `file` directly. This is a workaround.
				}
			}
		}

		return {
			files: this.#files,
			write: () => write(this.#files),
		};
	}
}

function createRunner(options) {
	return new Runner(options);
}

export { Runner };
export default createRunner;
