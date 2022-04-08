import path from 'node:path';
import { isPromise } from 'node:util/types';

import { walk, writeFile } from '../utils/fs.js';
import { createDebug } from '../utils/log.js';
import { createFile } from './file.js';

const debug = createDebug('runner');

/**
 * @typedef {import("./plugin.js").Options} Options
 * @typedef {import("./plugin.js").Plugin} Plugin
 */

class Runner {
	/**
	 * @type {Readonly<Options>}
	 */
	#config;

	/**
	 * @type {Plugin[]}
	 */
	#plugins = [];

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

		p.state = {};
		p.init({
			global: this.#config,
			state: p.state,
		});
		this.#plugins.push(p);

		return this;
	}

	async process() {
		const filepaths = await walk(this.#config.src);

		const files = await Promise.all(
			filepaths.map((file) => createFile(path.join(this.#config.src, file))),
		);

		const results = [];
		for (let file of files) {
			file.destination = path.join(
				this.#config.dest,
				path.relative(this.#config.src, file.path),
			);

			for (const plugin of this.#plugins) {
				if (plugin.extensions.some((value) => file.path.endsWith(value))) {
					debug('running plugin:%s', plugin.name);

					const value = plugin.onFile({
						global: this.#config,
						state: plugin.state,
						// Prevent user from modifying original object, using `Object.assign`
						file: Object.assign({}, file),
					});

					/* eslint-disable-next-line no-await-in-loop */
					file = isPromise(value) ? await value : value;
				}
			}

			results.push(writeFile(file.destination, file.contents, 'utf-8'));
		}

		await Promise.all(results);
	}
}

function createRunner(options) {
	return new Runner(options);
}

export { Runner };
export default createRunner;
