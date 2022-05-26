import { program } from 'commander';
import debug from 'debug';

import * as commands from './commands/index.js';
import { parseOption } from './helpers.js';

program
	.name('cedar')
	.version('0.1.0', '-v, --version')
	.description('A set of tools for building static sites')
	.showSuggestionAfterError(true)
	.option('-d, --debug', 'print debugging information', false)
	.option(
		'-o, --output <path>',
		'Define the output directory',
		parseOption,
		'out',
	)
	.option(
		'-c, --config <path>',
		'Specify the path to a config file',
		parseOption,
	);

program.hook('preAction', async (_cmd, _action) => {
	if (program.getOptionValue('debug')) debug.enable('cedar:*');
});

program.addCommand(commands.build);
program.addCommand(commands.serve);

await program.parseAsync();
