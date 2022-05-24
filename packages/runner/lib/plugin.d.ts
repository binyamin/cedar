import { VFile } from 'vfile';
import { Renames } from 'vfile-rename';

export interface Options {
	src: string;
	dest: string;
}

// Custom data for vfile
declare module 'vfile' {
	/* eslint-disable-next-line @typescript-eslint/naming-convention */
	interface VFileDataMap {
		/**
		 *
		 * Whether this file will be written to disk
		 *
		 * @default
		 * true
		 */
		write: boolean;

		/**
		 * Utility for manipulating the file-path.
		 *
		 * @link
		 * See [vfile/vfile-rename](https://github.com/vfile/vfile-rename) on GitHub
		 */
		rename(options: Renames): void;
	}
}

declare namespace Plugin {
	interface Context {
		/**
		 *
		 * Global configuration. User-defined.
		 */
		global: Readonly<Options>;

		/**
		 *
		 * Use this property to share information between
		 * `init` and `onFile`.
		 */
		state: Record<string, unknown>;

		/**
		 *
		 * Represents a file which can be transformed
		 *
		 * **Tips**:
		 * - For source-maps, use the `file.map` object
		 * - To tell the processor not to write a file, set
		 * the `data.write` field to `false`
		 *
		 * @note Not present for the `onInit` method.
		 */
		file: VFile;
	}
}

/**
 *
 * Note: If you want to provide options, use a function.
 * The user will even get type definitions when setting the
 * options.
 *
 * @example
 * ```js
 * function myPlugin(options) {
 * 	console.log(options.foo);
 * }
 *
 * runner().use(myPlugin, { foo: 'hello' });
 * ```
 */
export interface Plugin {
	/**
	 *
	 * Set the name of the plugin, for user-sanity.
	 */
	name: string;

	/**
	 *
	 * Provide a list of file extensions. This ensures
	 * the plugin is only run when necessary.
	 *
	 * @example
	 * ```js
	 * ['.html', '.njk']
	 * ```
	 */
	extensions: string[];

	/**
	 *
	 * Perform setup actions, using `context.global`.
	 * You can share it with `onFile` by using
	 * `context.state`.
	 */
	init(context: Omit<Plugin.Context, 'file'>): void | Promise<void>;

	/**
	 * Run when a file matches one of the {@link extensions}.
	 *
	 * @todo support returning an array of files (ie. for css-in-js)
	 */
	onFile(context: Plugin.Context): VFile | Promise<VFile>;
}
