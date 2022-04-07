import type { Options, Plugin, PluginMain } from './plugin';

declare class Runner {
	readonly #config: Options;
	readonly #plugins: PluginMain[];

	constructor(options: Options);

	use<T extends Plugin>(plugin: T, options?: Parameters<T>[0]): this;

	/**
	 * This should be the last method called
	 */
	process(): Promise<void>;
}

export { Runner };

export default function createRunner(options: Options): Runner;
