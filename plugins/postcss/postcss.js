import postcss from 'postcss';
import atImport from 'postcss-import';

/**
 *
 * @param {object} options
 * @param {boolean} [options.sourcemap=true] Not yet implemented.
 * (Generate sourcemaps. Default is `true`)
 * @returns {import("@cedar/runner").plugin}
 */
const plugin = (options) => ({
	name: 'postcss',
	extensions: ['.css', '.pcss'],
	init(context) {
		options.sourcemap ??= false; // Change to `true` once implemented
		context.state.engine = postcss().use(atImport());
	},
	async onFile(context) {
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
