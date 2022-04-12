import path from 'node:path';

import createRunner from '@cedar/runner';
import nunjucksPlugin from '@cedar/plugin-nunjucks';
import postcssPlugin from '@cedar/plugin-postcss';

/**
 *
 * @param {import("./helpers").Config} config
 */
function builder(config) {
	const plugins = config.plugins ?? [nunjucksPlugin, postcssPlugin];

	function process(paths) {
		let runner = createRunner({
			src: config.src,
			dest: config.dest,
		});

		for (const p of plugins) {
			runner = runner.use(p);
		}

		return runner.process(paths);
	}

	return async (paths) => {
		const result = paths ? await process(paths) : await process();
		await result.write();
		return result.files;
	};
}

async function loadConfig(file) {
	file = file ? file : 'cedar.config.js';
	file = path.resolve(file);
	const config = await import(file);
	return config.default ?? config;
}

export { builder, loadConfig };
