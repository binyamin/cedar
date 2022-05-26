/// <reference path="../env.d.ts" />
import { env } from 'node:process';

import { createCommand } from 'commander';

import { builder, loadConfig } from '../helpers.js';

export default createCommand('build')
	.argument('<input>')
	.description('Build the site')
	.action(async (input, _options, program) => {
		const { output, config: configFile } = program.optsWithGlobals();

		// `env` must be set before the config is loaded,
		// so configs and presets have access to the values
		env.CEDAR_MODE = 'build';
		const config = await loadConfig(configFile);

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
		console.log(
			'Wrote: %f files',
			stats
				.filter((vfile) => vfile.data.write)
				.map((vfile) => (vfile.map ? 2 : 1))
				.reduce((a, b) => a + b, 0),
		);
		console.groupEnd();
	});
