import path from 'node:path';

import { globby } from 'globby';
import postcss from 'postcss';

/**
 *
 * @param {object} options
 * @param {boolean} [options.sourcemap=true] Not yet implemented.
 * (Generate sourcemaps. Default is `true`)
 * @param {string[]} [options.ignored] Process these files,
 * but don't write anything. Useful for partials. Accepts
 * an array of globs. Defaults to any `.pcss` or `.css` file
 * starting with an underscore.
 * @param {import('postcss').AcceptedPlugin[]} [options.plugins] temporary fix for issue 1
 * @returns {import("@cedar/runner").plugin}
 */
const plugin = (options) => ({
	name: 'postcss',
	extensions: ['.css', '.pcss'],
	async init(context) {
		options.sourcemap ??= false; // Change to `true` once implemented
		options.ignored ??= ['**/_*.{pcss,css}'];
		options.plugins ??= [];

		context.state.engine = postcss(options.plugins);

		context.state.ignore = await globby(options.ignored, {
			cwd: context.global.src,
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

		// Print any PostCSS warnings
		if (result.warnings().length > 0) {
			console.group('PostCSS');
			for (const warn of result.warnings()) {
				console.warn(warn.toString());
			}

			console.groupEnd();
		}

		context.file.contents = result.content;
		return context.file;
	},
});

export default plugin;
