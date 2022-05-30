import path from 'node:path';

import { globby } from 'globby';
import postcss from 'postcss';
import reporter from 'postcss-reporter';

/**
 * @private
 *
 * This function ensures that we use the proper API when
 * there are no plugins.
 *
 * If we always used `postcss.process`, there would be no
 * warnings if there were no plugins, since the parser was
 * never invoked.
 *
 * @param {import("postcss").Processor} engine
 * @param {string} css
 * @param {import("postcss").ProcessOptions} options
 * @returns {Promise<import("postcss").Result>}
 */
async function parseCSS(engine, css, options) {
	if (engine.plugins.length > 0) {
		return engine.process(css, options);
	}

	const parseOptions = {};
	if (options.from) parseOptions.from = options.from;
	if (options.map) parseOptions.map = options.map;

	const root = postcss.parse(css, parseOptions);
	return root.toResult(options);
}

/**
 *
 * @type {import('.')['default']}
 */
function plugin(options) {
	options.extensions ??= ['css', 'pcss'];
	options.sourcemap ??= true;
	options.ignored ??= options.extensions.map((ext) => '**/_*.' + ext);
	options.plugins ??= [];
	options.reporter ??= true;

	return {
		name: 'postcss',
		extensions: options.extensions.map((ext) => '.' + ext),
		async init(context) {
			if (options.reporter) options.plugins.push(reporter({ noIcon: true }));

			context.state.engine = postcss(options.plugins);

			context.state.ignore = await globby(options.ignored, {
				cwd: context.global.src,
			});
		},
		async onFile(context) {
			const isPartial = context.state.ignore.includes(
				path.relative(context.global.dest, context.file.path),
			);

			if (isPartial) {
				context.file.data.write = false;
				return;
			}

			context.file.data.rename({ extname: '.css' });

			/** @type {{engine: import('postcss').Processor}} */
			const { engine } = context.state;

			try {
				const result = await parseCSS(engine, context.file.value, {
					from: context.file.history[0],
					to: context.file.path,
					...(options.syntax ? { syntax: options.syntax } : {}),
					/* eslint-disable prettier/prettier */
					...(options.sourcemap ?
						{
							map: {
								prev: context.file.map ?? false,
								inline: false,
								sourcesContent: false,
							},
						}
						: {}),
					/* eslint-enable prettier/prettier */
				});
				context.file.value = result.content;
				context.file.map = result.map.toJSON();
			} catch (error) {
				/** @type {import("postcss").CssSyntaxError[''] | Error} */
				const typedError = error;
				if (typedError.name === 'CssSyntaxError') {
					console.error(typedError.message, typedError.showSourceCode());
				} else {
					throw error;
				}
			}
		},
	};
}

export default plugin;
