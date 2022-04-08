import path from 'node:path';
import { isPromise } from 'node:util/types';
import { watch as filewatch } from 'chokidar';

import { createDebug } from '../utils/log.js';
import Server from './http.js';
import Reloader from './reloader.js';

const debug = createDebug('watcher');

/**
 *
 * @param {object} config
 * @param {string} config.src
 * @param {string} [config.dest] If using a build step,
 * this should point to the output.
 * @param {number} [config.port=3000]
 * @param {(path: string) => string | Promise<string>} [changed]
 * A function to run each time there's a file changed. Most
 * likely, you'll want some sort of build function here.
 * Returns the output path
 *
 * @returns {Promise<void>}
 */
async function serve(config, changed) {
	const s = new Server({ dir: config.dest ?? config.src });
	const t = new Reloader();

	await s.listen(config.port);
	await t.listen();

	const watcher = filewatch(config.src);
	debug('running');

	watcher.on('change', async (fpath, _fstats) => {
		const relativePath = path.relative(config.src, fpath);
		debug('Changed - %s', relativePath);

		let outputPath = relativePath;
		if (changed) {
			const value = changed(fpath);
			outputPath = isPromise(value) ? await value : value;
		}

		if (!outputPath.startsWith('/')) outputPath = '/' + outputPath;

		t.reload(outputPath);
	});
}

export default serve;
