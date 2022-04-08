import type { Options, Plugin } from './plugin.js';

export class Runner {
	#config: Readonly<Options>;
	#plugins: Plugin[];

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
	 * This should be the last method called
	 */
	process(): Promise<void>;
}

export default function createRunner(options: Options): Runner;
