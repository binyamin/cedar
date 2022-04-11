import { FSWatcher } from 'chokidar';

/**
 *
 * Thin wrapper around {@link FSWatcher chokidar.FSWatcher}
 *
 * It just makes chokidar look more like the other classes
 * in this folder (`lib/`).
 */
class Watcher extends FSWatcher {
	#paths;

	/**
	 *
	 * @param {string | string[]} paths
	 * @param {import('chokidar').WatchOptions} [options]
	 */
	constructor(paths, options = {}) {
		super(options);

		this.#paths = paths;
	}

	start() {
		this.add(this.#paths);
	}
}

export default Watcher;
