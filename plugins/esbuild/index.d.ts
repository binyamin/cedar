import { BuildOptions } from 'esbuild';
import { plugin } from '@cedar/runner';

declare namespace esbuildPlugin {
	interface Options {
		/**
		 * Whether to generate sourcemaps. Ignored when
		 * `options.esbuild` is set.
		 *
		 * @default
		 * true
		 */
		sourcemaps?: boolean;

		/**
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
		 * When `esbuild.bundle` is `true`, this field is
		 * required. It identifies which files were imported,
		 * and should not be written to disk. It should be an
		 * array of paths (strings), relative to `config.src.
		 *
		 * @default
		 * undefined
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
