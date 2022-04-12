import path from 'node:path';

import nunjucksPlugin from '@cedar/plugin-nunjucks';
import postcssPlugin from '@cedar/plugin-postcss';

import atImport from 'postcss-import';
import csso from 'postcss-csso';

/**
 *
 * @param {import('.').Options} options
 * @returns {import(".").Config}
 */
function preset(options) {
	return {
		src: options.src || 'src',
		dest: options.dest || 'out',
		plugins: [
			nunjucksPlugin({
				extensions: ['.html', '.njk'],
				/* eslint-disable prettier/prettier */
				...(options.nunjucks?.templates
					? {
						ignored: [
							path.join(options.nunjucks.templates, '**', '*'),
						],
					} : {}),
				/* eslint-enable prettier/prettier */
			}),
			postcssPlugin({
				plugins: options.postcss?.plugins ?? [atImport, csso],
				/* eslint-disable prettier/prettier */
				...(options.postcss?.partials
					? {
						ignored: [
							path.join(options.postcss.partials, '**', '*'),
						],
					} : {}),
				/* eslint-enable prettier/prettier */
			}),
			...(options.plugins ?? []),
		],
	};
}

export default preset;
