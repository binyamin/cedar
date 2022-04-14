import { createCommand } from 'commander';
import Server from '@cedar/server';

import { builder } from '../helpers.js';

export default createCommand('serve')
	.argument('<input>')
	.description('Serve the given folder')
	.option('-p, --port', 'Port number', 3000)
	.action(async function (input, options, program) {
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
