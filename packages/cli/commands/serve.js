/// <reference path="../env.d.ts" />
import { env } from 'node:process';

import { createCommand } from 'commander';
import logUpdate from 'log-update';
import Server from '@binyamin/cedar-server';

import { builder, loadConfig } from '../helpers.js';

function logCount(file) {
	logCount.file ??= file;
	logCount.count ??= 0;

	if (logCount.file !== file) {
		logCount.file = file;
		logCount.count = 0;
		logUpdate.done();
	}

	logCount.count++;

	logUpdate(`Changed ${logCount.file} (x${logCount.count})`);
}

export default createCommand('serve')
	.argument('<input>')
	.description('Serve the given folder')
	.option('-p, --port', 'Port number', 3000)
	.action(async function (input, options, program) {
		const { output, config: configFile } = program.optsWithGlobals();

		// `env` must be set before the config is loaded,
		// so configs and presets have access to the values
		env.CEDAR_MODE = 'serve';
		const config = await loadConfig(configFile);

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
			logCount(filepath);

			const f = await build(filepath);
			filepath = f[0].path;
			server.reload(filepath);
		});

		server.on('close', () => {
			logUpdate.done();
		});

		await server.start();
	});
