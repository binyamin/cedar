import { File } from './file.js';
import type { Options, Plugin } from './plugin.js';

declare interface Result {
	/**
	 *
	 * Array of file objects. Useful if you want to get the
	 * file's contents as a string.
	 */
	files: File[];

	/**
	 *
	 * Write each file to `file.destination`.
	 */
	write(): Promise<void>;
}

export class Runner {
	#config: Readonly<Options>;
	#plugins: Plugin[];
	#files: File[];

	constructor(options: Options);

	/**
	 *
	 * Add a plugin to the queue. Plugins run in the order
	 * they are added.
	 * @returns The {@link Runner} instance, for chaining.
	 */
	use(plugin: Plugin): this;
	use<T extends (options: any) => Plugin>(
		plugin: T,
		options: Parameters<T>[0],
	): this;

	/**
	 *
	 * Run the plugins.
	 *
	 * @param paths Optionally, provide a path or list of
	 * paths to operate on.
	 */
	process(paths?: string | string[]): Promise<Result>;
}

export default function createRunner(options: Options): Runner;
