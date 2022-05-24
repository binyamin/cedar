import path from 'node:path';
import { formatMessages, build } from 'esbuild';

/**
 *
 * Does `object` have a property named `key`?
 *
 * @template {Record<string,any>} T
 * @param {T} object
 * @param {keyof T} key
 * @returns {boolean}
 */
function has(object, key) {
	return key in object;
}

/**
 *
 * @param {import("esbuild").Message[]} errors
 * @param {import("esbuild").Message[]} warnings
 */
async function printMessages(errors, warnings) {
	const messages = [];

	if (errors.length > 0) {
		messages.push(
			...(await formatMessages(errors, {
				kind: 'error',
				color: true,
			})),
		);
	}

	if (warnings.length > 0) {
		messages.push(
			...(await formatMessages(warnings, {
				color: true,
				kind: 'warning',
			})),
		);
	}

	for (const value of messages) {
		console.error(value);
	}
}

/**
 * @type {import('.').default}
 */
function esbuildPlugin(options = {}) {
	options.sourcemaps ??= true;
	options.esbuild ??= {
		format: 'esm',
		minify: true,
		treeShaking: true,
		platform: 'browser',
		sourcemap: options.sourcemaps ? 'linked' : false,
		sourcesContent: false,
	};

	/* eslint-disable prettier/prettier */
	if (
		options.esbuild.bundle
		&& has(options, 'entryPoints') === false
	) {
		throw new Error(
			'When `options.esbuild.bundle` equals `true`,' +
			' you must provide `options.entryPoints`',
		);
	}
	/* eslint-enable prettier/prettier */

	return {
		name: 'esbuild',
		extensions: ['.js', '.mjs', '.cjs', '.ts'],
		init() {},
		async onFile({ file, global }) {
			const toWrite = options.entryPoints ?? [];
			if (
				toWrite.includes(path.relative(global.src, file.history[0])) === false
			) {
				file.data.write = false;
				return;
			}

			file.data.rename({
				extname: '.js',
				/* eslint-disable prettier/prettier */
				...(options.esbuild.minify
					? {
						stem: {
							suffix: '.min',
						},
					} : {}
				),
				/* eslint-enable prettier/prettier */
			});

			const origin = path.join(file.cwd, file.history[0]);
			try {
				const result = await build({
					...options.esbuild,
					stdin: {
						contents: file.value,
						loader: file.extname === '.ts' ? 'ts' : 'js',
						sourcefile: origin,
						resolveDir: path.dirname(origin),
					},
					logLevel: 'silent',
					outfile: file.path,
					write: false,
				});

				for (const outputFile of result.outputFiles.slice(0, 2)) {
					if (outputFile.path.endsWith('.map')) {
						file.map = JSON.parse(outputFile.text);
						file.map.file = path.basename(file.history[0]);
					} else {
						file.value = outputFile.text;
					}
				}

				await printMessages(result.errors, result.warnings);
			} catch (error) {
				if (has(error, 'warnings') && has(error, 'errors')) {
					await printMessages(error.errors, error.warnings);
				} else {
					throw error;
				}
			}
		},
	};
}

export default esbuildPlugin;
