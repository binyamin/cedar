import nunjucks from 'nunjucks';

class Engine extends nunjucks.Environment {
	/**
	 *
	 * @param {object} options
	 * @param {string | string[]} options.dirs
	 */
	constructor(options) {
		const loader = new nunjucks.FileSystemLoader(options.dirs);
		super(loader);
	}
}

/**
 * @param {import("./nunjucks").nunjucks.Options} options
 * @returns {import('../build/plugin').Plugin}
 */
function plugin(options) {
	options.extensions ??= ['.njk'];

	return {
		name: 'nunjucks',
		extensions: options.extensions,
		init(context) {
			context.state.engine = new Engine({
				dirs: context.global.src,
			});
		},
		onFile({ file, ...context }) {
			file.contents = context.state.engine.renderString(file.contents, {});

			const ext = options.extensions
				.filter((ext) => file.destination.endsWith(ext))
				.sort((a, b) => a.length - b.length)[0];

			file.destination = file.destination.replace(new RegExp(ext + '$'), '');
			if (!file.destination.includes('.')) file.destination += '.html';

			return file;
		},
	};
}

export { Engine };
export default plugin;
