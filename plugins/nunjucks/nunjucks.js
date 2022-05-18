import path from 'node:path';
import { promisify } from 'node:util';
import { isAsyncFunction } from 'node:util/types';

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
	options.data ??= {};

	return {
		name: 'nunjucks',
		extensions: options.extensions,
		async init(context) {
			const engine = new Engine({
				dirs: context.global.src,
			});

			for (const [key, value] of Object.entries(options.data)) {
				engine.addGlobal(key, value);
			}

			for (const [key, value] of Object.entries(options.filters)) {
				if (isAsyncFunction(value)) {
					engine.addFilter(key, value, true);
				} else {
					engine.addFilter(key, value);
				}
			}

			context.state.engine = engine;

			context.state.ignored = await globby(options.ignored, {
				cwd: context.global.src,
			});
		},
		async onFile({ file, ...context }) {
			const isPartial = context.state.ignored.includes(
				path.relative(context.global.src, file.path),
			);

			if (isPartial) {
				file.destination = false;
				return file;
			}

			/** @type {Engine} */
			const engine = context.state.engine;

			file.contents = await promisify(engine.renderString)(file.contents, {});

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
