import path from 'node:path';

import postcss from 'postcss';
import atImport from 'postcss-import';
import { globby } from 'globby';

/**
 *
 * @param {object} options
 * @param {boolean} [options.sourcemap=true] Not yet implemented.
 * (Generate sourcemaps. Default is `true`)
 * @param {string[]} [options.ignore] Process these files,
 * but don't write anything. Useful for partials. Accepts
 * an array of globs. Defaults to any `.pcss` or `.css` file
 * starting with an underscore.
 * @returns {import("@cedar/runner").plugin}
 */
const plugin = (options) => ({
	name: 'postcss',
	extensions: ['.css', '.pcss'],
	init(context) {
		options.sourcemap ??= false; // Change to `true` once implemented
		options.ignore ??= ['**/_*.{pcss,css}'];

		context.state.engine = postcss().use(atImport());
		globby(options.ignore, {
			cwd: context.global.src,
		}).then((value) => {
			context.state.ignore = value;
		});
	},
	async onFile(context) {
		const isPartial = context.state.ignore.includes(
			path.relative(context.global.src, context.file.path),
		);

		if (isPartial) {
			context.file.destination = false;
			return context.file;
		}

		/** @type {{engine: import('postcss').Processor}} */
		const { engine } = context.state;
		const result = await engine.process(context.file.contents, {
			from: context.file.path,
			to: context.file.destination,
			/* eslint-disable prettier/prettier */
			...(options.sourcemap ?
				{
					map: {
						inline: false,
					},
				}
			: {}),
			/* eslint-enable prettier/prettier */
		});
		context.file.contents = result.content;
		return context.file;
	},
});

export default plugin;
