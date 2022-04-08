import type { Options, Plugin } from './plugin';

export class Runner {
	#config: Readonly<Options>;
	#plugins: Plugin[];

	constructor(options: Options);

	use<T extends (options: any) => Plugin>(
		plugin: T,
		options: Parameters<T>[0],
	): this;
	use(plugin: Plugin): this;

	/**
	 * This should be the last method called
	 */
	process(): Promise<void>;
}

export default function createRunner(options: Options): Runner;
