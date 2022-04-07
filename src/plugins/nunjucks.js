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
 *
 * @param {import("../build/plugin").Options} config
 * @param {{}} _options
 * @returns
 */
function plugin(config, _options) {
	const engine = new Engine({ dirs: config.src });

	return {
		name: 'nunjucks',
		extensions: ['.njk'],
		exec(file) {
			file.destination = file.destination.replace(/\.njk$/, '.html');
			file.contents = engine.renderString(file.contents, {});

			return file;
		},
	};
}

export { Engine };
export default plugin;
