/// <reference path="../cli/env.d.ts" />
import path from 'node:path';
import { env } from 'node:process';

import nunjucksPlugin from '@binyamin/cedar-nunjucks';
import postcssPlugin from '@binyamin/cedar-postcss';
import esbuildPlugin from '@binyamin/cedar-esbuild';

import atImport from 'postcss-import';
import csso from 'postcss-csso';

import getData from './get-data.js';

export const postcssPlugins = { atImport, csso };

/**
 *
 * @param {import('.').Options} options
 * @returns {import("@binyamin/cedar/types").Config}
 */
async function preset(options) {
	options.src ??= 'src';
	options.dest ??= 'out';

	options.nunjucks ??= {};
	options.postcss ??= {};
	options.postcss.plugins ??= [atImport(), csso()];
	options.esbuild ??= {};

	const data = {
		cedar: {
			livereload:
				'<script defer src="http://localhost:35729/livereload.js"></script>',
			mode: env.CEDAR_MODE,
			env: 'dev',
		},
	};

	if (env.NODE_ENV) {
		if (/^dev(elopment)?$/i.test(env.NODE_ENV)) {
			data.cedar.env = 'dev';
		} else if (/^prod(uction)?$/i.test(env.NODE_ENV)) {
			data.cedar.env = 'prod';
		} else {
			data.cedar.env = env.NODE_ENV;
		}
	}

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
			postcssPlugin(options.postcss),
			esbuildPlugin(options.esbuild),
			...(options.plugins ?? []),
		],
	};
}

export default preset;
