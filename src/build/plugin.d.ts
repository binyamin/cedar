import type { File } from './file.js';

export interface Options {
	src: string;
	dest: string;
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
		state: Record<string, any>;
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
	 *
	 * @todo support returning a promise
	 */
	init(context: Plugin.Context): void;

	/**
	 * Run when a file matches one of the {@link extensions}.
	 *
	 * @todo support returning an array of files (eg, for sourcemaps).
	 */
	onFile(
		context: Plugin.Context & { file: Readonly<File> },
	): File | Promise<File>;
}
