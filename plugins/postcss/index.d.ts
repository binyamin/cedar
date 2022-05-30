import { plugin } from '@cedar/runner';
import * as postcss from 'postcss';

declare namespace postcssPlugin {
	interface Options {
		/**
		 *
		 * Array of file extensions to process (no leading dot).
		 *
		 * @default
		 * ['css', 'pcss']
		 */
		extensions?: string[];

		/**
		 * Whether to generate sourcemaps.
		 *
		 * @default true
		 */
		sourcemap?: boolean;

		/**
		 *
		 * Process these files, but don't write anything.
		 * Useful for partials. Accepts an array of globs.
		 * Relative to `config.src`.
		 *
		 * Defaults to any file whose name begins with an
		 * underscore, and whose extension matches
		 * {@link extensions `options.extensions`}.
		 */
		ignored?: string[];

		/**
		 *
		 * Temporary fix for issue 1
		 *
		 * @default []
		 */
		plugins?: postcss.AcceptedPlugin[];

		/**
		 *
		 * Print PostCSS warnings.
		 *
		 * @default true
		 */
		reporter?: boolean;

		/**
		 *
		 * PostCSS Syntax. Useful for pre-processors.
		 * Temporary fix for issue 1
		 *
		 * @default undefined
		 */
		syntax?: postcss.Syntax;
	}
}

declare function postcssPlugin(options: postcssPlugin.Options): plugin;

export default postcssPlugin;
