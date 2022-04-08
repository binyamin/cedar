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
 * @param {string} config.dir
 * @param {number} [config.port=3000]
 * @param {(path: string) => void | Promise<void>} [changed]
 * A function to run each time there's a file changed. Most
 * likely, you'll want some sort of build function here.
 *
 * @returns {Promise<void>}
 */
async function serve(config, changed) {
	const s = new Server({ dir: config.dir });
	const t = new Reloader();

	await s.listen(config.port);
	await t.listen();

	const watcher = filewatch(config.dir);
	debug('running');

	watcher.on('change', async (fpath, _fstats) => {
		const relativePath = path.relative(config.dir, fpath);
		debug('Changed - /%s', relativePath);

		if (changed) {
			const value = changed(fpath);
			if (isPromise(value)) await value;
		}

		t.reload('/' + relativePath);
	});
}

export default serve;
