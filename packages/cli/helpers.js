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

/**
 * Utility function, so we can easily look for multiple filenames
 */
async function tryLoad(...files) {
	for (let file of files) {
		file = path.resolve(file);

		try {
			/* eslint-disable-next-line no-await-in-loop */
			const config = await import(file);
			return config.default ?? config;
		} catch (error) {
			if (error.code === 'ERR_MODULE_NOT_FOUND') {
				continue;
			}

			throw new Error(error);
		}
	}
}

async function loadConfig(file) {
	if (file) {
		return tryLoad(file);
	}

	return tryLoad('cedar.config.js', 'cedar.config.mjs', 'cedar.config.cjs');
}

export { builder, loadConfig };
