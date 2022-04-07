import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isPromise } from 'node:util/types';

import { walk, writeFile } from '../utils/fs.js';

async function createFile(path) {
	return {
		path,
		contents: await fs.readFile(path, 'utf-8'),
	};
}

class Runner {
	#config;
	#plugins = [];

	constructor(options) {
		this.#config = options;
	}

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
				const value = plugin(file);
				/* eslint-disable-next-line no-await-in-loop */
				file = isPromise(value) ? await value : value;
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
