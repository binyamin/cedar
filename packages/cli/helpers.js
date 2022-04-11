import runner from '@cedar/runner';
import nunjucksPlugin from '@cedar/plugin-nunjucks';

/**
 *
 * @param {object} config
 * @param {string} config.src
 * @param {string} config.dest
 */
function builder(config) {
	function process(paths) {
		return runner({
			src: config.src,
			dest: config.dest,
		})
			.use(nunjucksPlugin)
			.process(paths);
	}

	/**
	 *
	 * @param {string | string[]} [paths] Only render the files at
	 * these paths. (default: undefined)
	 * @returns {Promise<import('@cedar/runner').File[]>} The output file objects
	 */
	return async (paths) => {
		const result = paths ? await process(paths) : await process();
		await result.write();
		return result.files;
	};
}

export { builder };
