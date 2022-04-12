import { type AcceptedPlugin } from 'postcss';
import { Config } from '../cli/helpers.js';

type PartialDeep<T> = {
	[K in keyof T]?: T[K] extends Record<string, unknown>
		? PartialDeep<T[K]>
		: T[K];
};

declare interface Options extends Omit<Config, 'src'> {
	nunjucks: {
		/**
		 *
		 * Set a directory for templates. Globs supported
		 * (for directories).
		 *
		 * @default undefined
		 */
		templates: string;
		/**
		 * Directory for data files
		 *
		 * @todo waiting on upstream feature
		 */
		data: string;
	};
	postcss: {
		/**
		 *
		 * Set a directory for partials. Globs supported
		 * (for directories).
		 *
		 * @default undefined
		 */
		partials: string;
		/**
		 *
		 * Array of postcss plugins. Defaults to
		 * postcss-import and postcss-csso.
		 */
		plugins: AcceptedPlugin[];
	};
}

/**
 *
 * @param options All properties are optional
 */
export default function preset(options: PartialDeep<Options>): Config;
