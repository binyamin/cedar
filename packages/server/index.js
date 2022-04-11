import FileServer from './lib/http.js';
import Reloader from './lib/reloader.js';
import Watcher from './lib/watcher.js';

class Server {
	#options;

	#http;
	#reload;
	#watcher;

	/**
	 *
	 * @param {import(".").Options} options
	 */
	constructor(options) {
		this.#options = Object.assign(
			{
				watchDir: options.publicDir,
				port: 3000,
			},
			options,
		);

		this.#http = new FileServer({
			dir: this.#options.publicDir,
		});

		this.#reload = new Reloader();

		this.#watcher = new Watcher(this.#options.watchDir);
	}

	async start() {
		await Promise.all([
			this.#reload.listen(),
			this.#http.listen(this.#options.port),
		]);
		this.#watcher.start();
	}

	on(event, callback) {
		switch (event) {
			case 'change':
				this.#watcher.on('change', callback);
				break;
			default:
		}
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
