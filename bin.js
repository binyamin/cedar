import path from 'node:path';
import { program } from 'commander';
import debug from 'debug';

import { serve, runner, plugins } from './src/index.js';

/**
 *
 * @param {object} config
 * @param {string} config.src
 * @param {string} config.dest
 */
function build(config) {
	function process(paths) {
		return runner({
			src: config.src,
			dest: config.dest,
		})
			.use(plugins.nunjucks)
			.process(paths);
	}

	/**
	 *
	 * @param {string | string[]} [paths] Only render the files at
	 * these paths. (default: undefined)
	 * @returns {string} The output path
	 */
	return async (paths) => {
		const result = paths ? await process(paths) : await process();
		await result.write();
		return result.files[0].destination;
	};
}

program
	.name('cedar')
	.version('0.1.0', '-v, --version')
	.option('-d, --debug', 'print debugging information', false);

program
	.command('build <input>', {
		isDefault: true,
		hidden: true,
	})
	.description('Build the site')
	.option('-o, --output <path>', 'Define the output directory', 'out')
	.action(async (input, options, _cmd) => {
		if (options.output[0] === '=') {
			options.output = options.output.slice(1);
		}

		console.log(`Building ${input} => ${options.output}`);
		console.time('build');
		await build({
			src: input,
			dest: options.output,
		})();
		console.timeEnd('build');
	});

program
	.command('serve <input>')
	.description('server the given folder')
	.option('-p, --port <number>', 'Port number', 3000)
	.option('-o, --output <path>', 'Define the output directory', 'out')
	.action(async (input, options, _cmd) => {
		console.log(`Serving "${input}" on port ${options.port}...`);

		const builder = build({
			src: input,
			dest: options.output,
		});

		await serve(
			{
				src: input,
				dest: options.output,
				port: options.port,
			},
			async (filepath) => {
				return path.relative(options.output, await builder(filepath));
			},
		);
	});

program.parse();

if (program.optsWithGlobals().debug) {
	debug.enable('cedar:*');
}
