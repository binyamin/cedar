import { ConfigureOptions } from 'nunjucks';
import type { plugin } from '@binyamin/cedar-runner';

declare namespace nunjucks {
	type Filter = (
		target: unknown,
		...args: unknown[],
		kwargs?: Record<string, unknown>,
	) => unknown;

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
		 * List of files to read, but not write. This is
		 * useful for partials. Glob-patterns are supported.
		 * The value is relative to `config.src`.
		 *
		 * The default glob pattern ignores all files which
		 * begin with an underscore and end with one of
		 * {@link Options.extensions `options.extensions`}.
		 */
		ignored?: string[];

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
		 *
		 * Custom filters for nunjucks
		 *
		 * @note Async functions are resolved, but returned
		 * Promise objects are not. This is a limitation of
		 * nunjucks.
		 *
		 * @default undefined
		 */
		filters?: Record<string, Filter>;

		/**
		 *
		 * Global data to share between templates.
		 *
		 * @default {}
		 */
		data?: Record<string, any>;

		/**
		 *
		 * Paths to JSON or YAML files, for global data. May
		 * be globs. Relative to the current directory, not
		 * `config.src`.
		 *
		 * @todo
		 *
		 * @default []
		 */
		dataFiles?: string[];

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

/**
 *
 * Compile nunjucks templates.
 */
declare function nunjucks(options: nunjucks.Options): plugin;

export default nunjucks;
