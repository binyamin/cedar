import Server from '@cedar/server';
import { program } from 'commander';
import debug from 'debug';

import { builder, loadConfig } from './helpers.js';

program
	.name('cedar')
	.version('0.1.0', '-v, --version')
	.option('-d, --debug', 'print debugging information', false)
	.option(
		'-o, --output <path>',
		'Define the output directory',
		(value) => {
			if (value[0] === '=') {
				value = value.slice(1);
			}

			return value;
		},
		'out',
	)
	.option(
		'-c, --config <path>',
		'Specify the path to a config file',
		(value) => {
			if (value[0] === '=') {
				value = value.slice(1);
			}

			return value;
		},
	);

program.hook('preAction', async (_cmd, _action) => {
	if (program.getOptionValue('debug')) debug.enable('cedar:*');

	program.setOptionValue(
		'config',
		await loadConfig(program.getOptionValue('config')),
	);
});

program
	.command('build <input>', {
		isDefault: true,
		hidden: true,
	})
	.description('Build the site')
	.action(async (input, _options, _cmd) => {
		const { output, config } = program.optsWithGlobals();
		const build = builder(
			config || {
				src: input,
				dest: output,
			},
		);

		console.log(
			`Building ${config?.src || input} => ${config?.dest || output}`,
		);
		console.time('Time');

		const stats = await build();

		// Build stats
		console.group('Done');
		console.timeEnd('Time');
		console.log('Read: %f files', stats.length);
		console.log('Wrote: %f files', stats.filter((f) => f.destination).length);
		console.groupEnd();
	});

program
	.command('serve <input>')
	.description('server the given folder')
	.option('-p, --port <number>', 'Port number', 3000)
	.action(async (input, options, _cmd) => {
		const { output, config } = program.optsWithGlobals();
		console.log(`Serving "${config?.src || input}" on port ${options.port}...`);

		const build = builder(
			config || {
				src: input,
				dest: output,
			},
		);

		const server = new Server({
			publicDir: config?.dest || output,
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
