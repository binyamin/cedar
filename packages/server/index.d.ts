import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import { RequestListener } from 'node:http';

import TypedEventEmitter from 'typed-emitter';

declare namespace server {
	interface Options {
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

	type EventMap = {
		close: () => void | Promise<void>;
		request: RequestListener;
		change: (path: string, stats?: fs.Stats) => void | Promise<void>;
	};

	class Events extends (EventEmitter as new () => TypedEventEmitter<EventMap>) {}
}

declare class Server {
	/**
	 *
	 * Add an event listener. Alias for `events.on`.
	 */
	on: server.Events['on'];

	constructor(options: server.Options);

	/**
	 *
	 * An Event Emitter
	 *
	 * There are 3 events:
	 * - _change_ - Same as chokidar's  _change_ event
	 * - _close_ - Emitted when the Server's  `close()`
	 * method is called
	 * - _request_ - Connected to a Node.js HTTP server
	 *
	 * @since 0.2.0
	 */
	get events(): server.Events;

	start(): Promise<void>;

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
