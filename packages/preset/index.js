import path from 'node:path';

import nunjucksPlugin from '@cedar/plugin-nunjucks';
import postcssPlugin from '@cedar/plugin-postcss';
import atImport from 'postcss-import';
import csso from 'postcss-csso';

import getData from './get-data.js';

/**
 *
 * @param {import('.').Options} options
 * @returns {import("../cli/types").Config}
 */
async function preset(options) {
	options.src ??= 'src';
	options.dest ??= 'out';

	const data = {};

	const njkIgnored = [];

	if (options.nunjucks?.data) {
		if (typeof options.nunjucks.data !== 'string') {
			throw new TypeError('`nunjucks.data` must be a string');
		}

		njkIgnored.push(path.join(options.nunjucks.data, '**', '*'));

		Object.assign(data, await getData(options.nunjucks.data));
	}

	if (options.nunjucks?.templates) {
		njkIgnored.push(path.join(options.nunjucks.templates, '**', '*'));
	}

	return {
		src: options.src,
		dest: options.dest,
		plugins: [
			nunjucksPlugin({
				extensions: ['.html', '.njk'],
				data,
				...(njkIgnored.length > 0 ? { ignored: njkIgnored } : {}),
				filters: options.nunjucks.filters ?? {},
			}),
			postcssPlugin({
				plugins: options.postcss?.plugins ?? [atImport, csso],
				/* eslint-disable prettier/prettier */
				...(options.postcss?.partials
					? {
						ignored: [
							path.join(options.postcss.partials, '**', '*.{pcss,css}'),
						],
					} : {}),
				/* eslint-enable prettier/prettier */
			}),
			...(options.plugins ?? []),
		],
	};
}

export default preset;
