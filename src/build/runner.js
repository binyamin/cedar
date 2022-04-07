import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isPromise } from 'node:util/types';

import { walk, writeFile } from '../utils/fs.js';
import { createDebug } from '../utils/log.js';

const debug = createDebug('runner');

/**
 *
 * @param {string} path
 * @returns {Promise<import('./plugin.js').File>}
 */
async function createFile(path) {
	return {
		path,
		contents: await fs.readFile(path, 'utf-8'),
		destination: undefined,
	};
}

class Runner {
	/** @type {import('./plugin.js').Options} */
	#config;

	/** @type {import('./plugin.js').PluginMain[]} */
	#plugins = [];

	constructor(options) {
		this.#config = options;
	}

	/**
	 *
	 * @param {import('./plugin.js').Plugin} plugin
	 * @param {{}} options
	 * @returns {this}
	 */
	use(plugin, options) {
		const p = plugin(this.#config, options ?? {});
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
					const value = plugin.exec(file);
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
