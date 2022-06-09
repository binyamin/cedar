import { EventEmitter } from 'node:events';

import FileServer from './lib/http.js';
import Reloader from './lib/reloader.js';
import Watcher from './lib/watcher.js';

class Server {
	#options;

	#http;
	#reload;
	#watcher;

	#events;

	/**
	 *
	 * @param {import(".").Options} options
	 */
	constructor(options) {
		this.#options = {
			watchDir: options.publicDir,
			port: 3000,
			...options,
		};

		this.#events = new EventEmitter({
			captureRejections: true,
		});

		this.#http = new FileServer({
			dir: this.#options.publicDir,
		});

		this.#reload = new Reloader();

		this.#watcher = new Watcher(this.#options.watchDir);

		this.#registerEvents();
	}

	#registerEvents() {
		this.#http.server.on('request', (request, response) => {
			this.#events.emit('request', request, response);
		});

		this.#watcher.on('change', (path, stats) => {
			this.#events.emit('change', path, stats);
		});
	}

	get events() {
		return this.#events;
	}

	async start() {
		await Promise.all([
			this.#reload.listen(),
			this.#http.listen(this.#options.port),
		]);
		this.#watcher.start();
	}

	on(eventName, listener) {
		this.events.on(eventName, listener);
	}

	/**
	 *
	 * @param {string | string[]} paths
	 */
	reload(paths) {
		paths = Array.isArray(paths)
			? paths.map((p) => (p.startsWith('/') ? p : '/' + p))
			: '/' + paths;
		this.#reload.reload(paths);
	}

	async close() {
		this.#events.emit('close');

		await Promise.all([
			this.#http.close(),
			this.#reload.close(),
			this.#watcher.close(),
		]);
	}
}

async function createServer(dir, options) {
	const s = new Server({
		publicDir: dir,
	});

	s.on('change', (filepath) => {
		s.reload(filepath);
	});

	if (options.start) await s.start();

	return s;
}

export { createServer };
export default Server;
