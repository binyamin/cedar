import nunjucks from '@cedar/plugin-nunjucks';
import esbuild from '@cedar/plugin-esbuild';

import { type AcceptedPlugin } from 'postcss';

import { type Config } from '../cli/types.js';

type PartialDeep<T> = {
	[K in keyof T]?: T[K] extends Record<string, unknown>
		? PartialDeep<T[K]>
		: T[K];
};

declare interface Options extends Omit<Config, 'src'> {
	nunjucks: {
		/**
		 *
		 * Set a folder for templates. Globs supported
		 * (for folders). Relative to `config.src`.
		 *
		 * @default undefined
		 */
		templates: string;
		/**
		 *
		 * Folder for data files. Files may be JS or JSON.
		 * Relative to the current directory, not `config.src`.
		 */
		data: string;

		/**
		 *
		 * Custom filters for nunjucks.
		 *
		 * @default
		 * {}
		 */
		filters: Record<string, nunjucks.Filter>;
	};
	postcss: {
		/**
		 *
		 * Set paths which to parse and not write. Globs
		 * supported. Useful for partials. Relative to `config.src`.
		 *
		 * For the default value, see "@cedar/plugin-postcss"
		 */
		ignored: string[];
		/**
		 *
		 * Array of postcss plugins. Defaults to
		 * postcss-import and postcss-csso.
		 */
		plugins: AcceptedPlugin[];
	};
	esbuild: esbuild.Options;
}

/**
 *
 * Call this function, and export the return value. There's
 * no need to await the promise.
 *
 * @param options All properties are optional
 */
export default function preset(options: PartialDeep<Options>): Promise<Config>;
