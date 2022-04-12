import path from 'node:path';

import { globby } from 'globby';
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
 * @param {import("./nunjucks").default.Options} options
 * @returns {import('@cedar/runner').plugin}
 */
function plugin(options) {
	options.extensions ??= ['.njk'];
	options.ignored ??= options.extensions.map((ext) => `**/_*${ext}`);

	return {
		name: 'nunjucks',
		extensions: options.extensions,
		init(context) {
			context.state.engine = new Engine({
				dirs: context.global.src,
			});

			globby(options.ignored, {
				cwd: context.global.src,
			}).then((value) => {
				context.state.ignored = value;
			});
		},
		onFile({ file, ...context }) {
			const isPartial = context.state.ignored.includes(
				path.relative(context.global.src, file.path),
			);

			if (isPartial) {
				file.destination = false;
				return file;
			}

			/** @type {Engine} */
			const engine = context.state.engine;

			file.contents = engine.renderString(file.contents, {});

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