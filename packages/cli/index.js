import Server from '@cedar/server';
import { program } from 'commander';
import debug from 'debug';

import { builder } from './helpers.js';

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

		const build = builder({
			src: input,
			dest: options.output,
		});

		console.log(`Building ${input} => ${options.output}`);
		console.time('build');
		await build();
		console.timeEnd('build');
	});

program
	.command('serve <input>')
	.description('server the given folder')
	.option('-p, --port <number>', 'Port number', 3000)
	.option('-o, --output <path>', 'Define the output directory', 'out')
	.action(async (input, options, _cmd) => {
		console.log(`Serving "${input}" on port ${options.port}...`);

		const build = builder({
			src: input,
			dest: options.output,
		});

		const server = new Server({
			publicDir: options.output,
			watchDir: input,
			port: options.port,
		});

		server.on('change', async (filepath) => {
			// TODO If possible, reuse previous line for
			// this `console.error`
			console.error('File changed - %s', filepath);

			const f = await build(filepath);
			filepath = f[0].destination;
			server.reload(filepath);
		});

		await server.start();
	});

program.parse();

if (program.optsWithGlobals().debug) {
	debug.enable('cedar:*');
}
