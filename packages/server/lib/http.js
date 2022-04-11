import http from 'node:http';

import handler from 'serve-handler';

class FileServer {
	#server;
	#dir;

	/**
	 *
	 * @param {object} options
	 * @param {string} options.dir Folder to serve
	 */
	constructor(options) {
		this.#dir = options.dir;

		this.#server = http.createServer((request, response) =>
			handler(request, response, {
				public: this.#dir,
			}),
		);
	}

	/**
	 * Starts the file server
	 *
	 * @param {number} [port=3000] Port number (default: 3000)
	 * @returns {Promise<void>}
	 */
	listen(port = 3000) {
		return new Promise((resolve) => {
			this.#server.listen(port, () => {
				resolve();
			});
		});
	}

	/**
	 * The internal server
	 *
	 * @type {http.Server}
	 */
	get server() {
		return this.#server;
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

export default FileServer;
