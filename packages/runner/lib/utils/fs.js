import path from 'node:path';
import { promises as fs } from 'node:fs';

/**
 * Recursively create directories, if they don't exist
 *
 * @param {string} dir Path to evaluate
 * @returns {Promise<void>}
 */
export async function mkdir(dir) {
	try {
		// Don't use `fs.access` before writing, as per node.js docs
		await fs.stat(dir);
	} catch (error) {
		if (error.code === 'ENOENT') {
			await fs.mkdir(dir, {
				recursive: true,
			});
		} else {
			throw new Error(error);
		}
	}
}

/**
 * Write data to a file, making parent directories as needed
 *
 * @param {string} filepath Absolute path to a file
 * @param { Parameters<import("fs/promises").writeFile>[1] } data Data to write
 * @param { import("fs").WriteFileOptions } [options] Same as `fs.writeFile()` options
 * @return {Promise<void>}
 */
export async function writeFile(filepath, data, options) {
	const { dir } = path.parse(filepath);
	await mkdir(dir);

	await fs.writeFile(filepath, data, options);
}

/**
 * Get all files within a directory, recursively
 *
 * @param {string} dir Directory to crawl
 * @returns {Promise<string[]>}
 */
export async function walk(dir) {
	const stat = await fs.stat(dir);

	if (stat.isFile()) {
		return dir;
	}

	const files = await fs.readdir(dir);

	let results = files.map((file) => walk(path.join(dir, file)));

	results = await Promise.all(results);
	results = results.flat();
	// Explanation: resulting files should be relative to `dir`
	results = results.map((file) => path.relative(dir, file));

	return results;
}
