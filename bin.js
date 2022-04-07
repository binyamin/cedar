import { program } from 'commander';
import debug from 'debug';

import { serve, build } from './src/index.js';

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
		});
		console.timeEnd('build');
	});

program
	.command('serve <input>')
	.description('server the given folder')
	.option('-p, --port <number>', 'Port number', 3000)
	.action(async (input, options, _cmd) => {
		console.log(`Serving "${input}" on port ${options.port}...`);
		await serve({ dir: input, port: options.port });
	});

program.parse();

if (program.optsWithGlobals().debug) {
	debug.enable('cedar:*');
}
