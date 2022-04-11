import { ConfigureOptions, Environment } from 'nunjucks';
import type { Plugin } from '../build/plugin.js';

declare namespace nunjucks {
	type Filter = (
		target: unknown,
		...args: unknown[],
		kwargs?: Record<string, unknown>,
	) => any | Promise<any>;

	type EnvOptions = Pick<
		ConfigureOptions,
		'autoescape' | 'lstripBlocks' | 'tags' | 'trimBlocks' | 'throwOnUndefined'
	>;

	export interface Options {
		/**
		 *
		 * List of file extensions to process. Each
		 * item should begin with a period.
		 *
		 * Note - By default, the `.njk` extension is
		 * special, and works like this:
		 * - "file.njk" becomes "file.html"
		 * - "file.txt.njk" becomes "file.txt"
		 *
		 * To change this behavior, implement the
		 * {@link outExtension} method.
		 *
		 * @default ['.njk']
		 *
		 * @example
		 * ```js
		 * ['.html', '.njk']
		 * ```
		 */
		extensions?: string[];

		/**
		 *
		 * Resolve input file extensions to output extensions.
		 *
		 * @see {@link extensions}
		 *
		 * @todo
		 */

		outExtension?: (ext: string) => string;

		/**
		 * Custom filters for nunjucks
		 *
		 * @default undefined
		 *
		 * @todo
		 */
		filters?: Record<string, Filter>;

		/**
		 *
		 * Global data to share between templates.
		 *
		 * @default undefined;
		 *
		 * @todo
		 */
		data?: Record<string, any>;

		/**
		 *
		 * Configure nunjucks. Only a subset of the
		 * original options is available.
		 *
		 * @todo
		 */
		envOptions?: {
			[K in keyof EnvOptions]: EnvOptions[K];
		};
	}
}

export class Engine extends Environment {
	constructor(options: { dirs: string | string[] });
}

/**
 *
 * Compile nunjucks templates.
 */
declare function nunjucks(options: nunjucks.Options): Plugin;

export default nunjucks;
