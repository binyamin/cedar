import path from 'node:path';
import fs from 'node:fs/promises';

import createRunner from '@cedar/runner';
import nunjucksPlugin from '@cedar/plugin-nunjucks';
import postcssPlugin from '@cedar/plugin-postcss';

/**
 *
 * Given a raw command-line option, checks for and removes
 * the leading equal sign.
 *
 * @param {string} value
 * @returns {string}
 */
export function parseOption(value) {
	if (value[0] === '=') {
		value = value.slice(1);
	}

	return value;
}

/**
 *
 * @param {import("./types").Config} config
 */
export function builder(config) {
	config.plugins = [nunjucksPlugin, postcssPlugin];

	/**
	 *
	 * @param {string[] | string} paths
	 * @returns {Promise<import("@cedar/runner/lib/runner").Result>}
	 */
	function process(paths) {
		let runner = createRunner({
			src: config.src,
			dest: config.dest,
		});

		for (const p of config.plugins) {
			runner = runner.use(p);
		}

		return runner.process(paths);
	}

	/**
	 * Process and write files, and return their contents.
	 *
	 * @param {string[]} [paths] Only render the files at these paths.
	 * @returns {Promise<import('@cedar/runner').File[]>} The output file objects
	 */
	async function write(paths) {
		const result = paths ? await process(paths) : await process();
		await result.write();
		return result.files;
	}

	return write;
}

/**
 * @access private
 *
 * Given a list of file-paths, load the first one which exists.
 *
 * @summary Utility function, so we can easily look for multiple
 * config files.
 *
 * @param {string[]} files List of file-paths
 * @returns {Promise<unknown>} The default export of the first
 * file which resolves. May be `void`.
 */
async function tryLoad(...files) {
	const results = [];
	for (let file of files) {
		file = path.resolve(file);

		try {
			/* eslint-disable-next-line no-await-in-loop */
			await fs.access(file);
			results.push(import(file));
		} catch (error) {
			if (error.code === 'ENOENT') {
				continue;
			}

			throw error;
		}
	}

	const [contents] = await Promise.all(results);
	return contents?.default ?? contents;
}

/**
 *
 * Loads the given config file, or the default config file.
 *
 * @param {string} [file] Load this file instead of the default
 * file.
 * @returns {Promise<import('./types').Config | void>} The
 * resolved configuration, or nothing.
 */
export async function loadConfig(file) {
	if (file) {
		return tryLoad(file);
	}

	return tryLoad('cedar.config.js', 'cedar.config.mjs', 'cedar.config.cjs');
}
