import nunjucks from '@binyamin/cedar-nunjucks';
import postcss from '@binyamin/cedar-postcss';
import esbuild from '@binyamin/cedar-esbuild';

import { type AcceptedPlugin } from 'postcss';

import { type Config } from '@binyamin/cedar/types.js';

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
	postcss: postcss.Options & {
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
