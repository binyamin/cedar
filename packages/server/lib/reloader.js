import tinylr from 'tiny-lr';

/**
 *
 * Live-reload server. Wrapper for `tiny-lr`.
 */
class Reloader {
	#server;

	constructor() {
		this.#server = tinylr();
	}

	/**
	 * Start the live-reload server
	 * @return {Promise<void>}
	 */
	listen() {
		this.#server.listen();
	}

	get server() {
		return this.#server;
	}

	/**
	 * Reload a file
	 *
	 * @param {string|string[]} paths path(s) to reload
	 */
	reload(paths) {
		this.#server.changed({
			body: {
				files: Array.isArray(paths) ? paths : [paths],
			},
		});
	}

	/**
	 * Close the server
	 *
	 * @returns {Promise<void>}
	 */
	close() {
		return new Promise((resolve, reject) => {
			this.#server.close((error) => {
				if (error) {
					reject(error);
				}

				resolve();
			});
		});
	}
}

export default Reloader;
