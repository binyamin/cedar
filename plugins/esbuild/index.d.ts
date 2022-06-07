import { BuildOptions } from 'esbuild';
import { plugin } from '@binyamin/cedar-runner';

declare namespace esbuildPlugin {
	interface Options {
		/**
		 *
		 * Whether to generate sourcemaps. Ignored when
		 * `options.esbuild` is set.
		 *
		 * @default true
		 */
		sourcemaps?: boolean;

		/**
		 *
		 * Whether to minify the source. Ignored when
		 * `options.esbuild` is set.
		 *
		 * @default false
		 */
		minify?: boolean;

		/**
		 *
		 * Whether to bundle the source. Ignored when
		 * `options.esbuild` is set.
		 *
		 * @note When this is `true`, you must also set
		 * `options.entryPoints`
		 *
		 * @default false
		 */
		bundle?: boolean;

		/**
		 *
		 * Override the default esbuild options.
		 *
		 * @default
		 * {
		 * 	format: 'esm',
		 * 	minify: true,
		 * 	treeShaking: true,
		 * 	platform: 'browser',
		 * 	sourcesContent: false,
		 * }
		 */
		esbuild?: Omit<
			BuildOptions,
			'write' | 'watch' | 'outfile' | 'logLevel' | 'stdin'
		>;

		/**
		 *
		 * Identifies which files were imported, and should
		 * not be written to disk. Relative to `config.src`.
		 *
		 * @note When `bundle` or `esbuild.bundle` is `true`,
		 * this field is required.
		 *
		 * @default undefined
		 */
		entryPoints?: string[];
	}
}

/**
 *
 * Run esbuild on all JS files
 */
declare function esbuildPlugin(options: esbuildPlugin.Options): plugin;

export default esbuildPlugin;
