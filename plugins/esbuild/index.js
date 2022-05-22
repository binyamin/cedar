import { transform } from 'esbuild';

/**
 * Run esbuild on all JS files
 *
 * @param {object} options
 * @param {import('esbuild').TransformOptions} [options.esbuild={}]
 * Override the default esbuild options. When set, all other
 * options are ignored.
 *
 * @returns {import('@cedar/runner').plugin}
 */
function esbuildPlugin(options) {
	options.esbuild ??= {
		format: 'esm',
		minify: true,
		treeShaking: true,
	};

	return {
		name: 'esbuild',
		extensions: ['.js', '.mjs', '.cjs'],
		init() {},
		async onFile(ctx) {
			ctx.file.contents = await transform(ctx.file.contents, {
				...options.esbuild,
				sourcefile: ctx.file.path,
			});

			return ctx.file;
		},
	};
}

export default esbuildPlugin;
