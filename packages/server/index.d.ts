export interface Options {
	/**
	 *
	 * Serve this directory. Also, reload the browser when a change is detected.
	 * The latter can be customized with {@link watchDir `watchDir`}.
	 */
	publicDir: string;

	/**
	 *
	 * Reload the browser tab when a file within changes.
	 * Defaults to the value of {@link publicDir `publicDir`}.
	 *
	 * @default this.publicDir
	 */
	watchDir?: string;

	/**
	 *
	 * The port for the http server.
	 *
	 * @default 3000
	 */
	port?: number;
}

declare class Server {
	constructor(options: Options);

	start(): Promise<void>;

	/**
	 *
	 * Looks like an event-emitter, but isn't one.
	 */
	on(event: string, listener: (...args: any[]) => void): void;

	/**
	 *
	 * Run a function whenever a file changes.
	 *
	 * @example
	 * ```js
	 * server.on('change', (file) => {
	 * 	console.error('File changed - %s', file);
	 * })
	 * ```
	 */
	on(
		event: 'change',
		listener: (
			/**
			 *
			 * Path to the file which changed. Relative to
			 * {@link Options.watchDir `options.watchDir`} (or
			 * {@link Options.publicDir `options.publicDir`},
			 * if the former is not defined).
			 */
			path: string,
		) => void,
	): void;

	/**
	 *
	 * Reload the browser for the given path(s).
	 */
	reload(paths: string | string[]): void;

	close(): Promise<void>;
}

/**
 *
 * Creates a new server, starts it (by default), and
 * returns it.
 */
declare function createServer(
	/**
	 * Folder to serve
	 */
	dir: string,
	options?: {
		/**
		 * Automatically start the server
		 * @default true
		 */
		start?: boolean;
	},
): Promise<Server>;

export { createServer };
export default Server;
