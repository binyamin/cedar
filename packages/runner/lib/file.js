import { promises as fs } from 'node:fs';

/**
 * Represents a file while it's passed between plugins.
 *
 * @typedef File
 * @property {string} path
 * @property {string} contents
 * @property {string|false} destination To disable writing,
 * set this to `false`
 */

/**
 *
 * @param {string} path
 * @returns {Promise<File>}
 */
export async function createFile(path) {
	return {
		path,
		contents: await fs.readFile(path, 'utf-8'),
		destination: undefined,
	};
}