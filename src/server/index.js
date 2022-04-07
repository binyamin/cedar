import path from 'node:path';
import { watch as filewatch } from 'chokidar';

import { createDebug } from '../utils/log.js';
import Server from './http.js';
import Reloader from './reloader.js';

/**
 *
 * @param {object} config
 * @param {string} config.dir
 * @param {number} [config.port=3000]
 * @param {({ path: string, file: string }) => void} [changed]
 * @returns {Promise<void>}
 */
async function serve(config, changed) {
	const s = new Server({ dir: config.dir });
	const t = new Reloader();

	await s.listen(config.port);
	await t.listen();

	const debug = createDebug('watcher');

	const watcher = filewatch(config.dir);
	debug('running');

	watcher.on('change', (fpath, _fstats) => {
		const p = '/' + path.relative(config.dir, fpath);
		if (changed) changed({ path: p, file: fpath });
		t.reload(p);
	});
}

export default serve;
