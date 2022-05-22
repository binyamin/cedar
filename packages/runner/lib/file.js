import path from 'node:path';
import { read, write as writeVFile } from 'to-vfile';
import { rename } from 'vfile-rename';

import { mkdir, writeFile } from './utils/fs.js';

export { reporterPretty as report } from 'vfile-reporter-pretty';

/**
 * @typedef {import("vfile").VFile} vFile
 */

/**
 *
 * @param {import('to-vfile').Compatible} options
 * @returns {Promise<vFile>}
 */
export async function create(options) {
	const file = await read(options, 'utf-8');
	file.data.write = true;
	file.data.rename = (renames) => {
		const newFile = rename(file, renames);
		file.map.file = newFile.basename;
	};

	return file;
}

/**
 *
 * @param {vFile} file
 */
export async function write(file) {
	await mkdir(file.dirname);
	await writeVFile(file, 'utf-8');
	if (file.map) {
		await writeFile(
			path.resolve(file.cwd, file.path) + '.map',
			JSON.stringify(file.map),
			'utf-8',
		);
	}
}
