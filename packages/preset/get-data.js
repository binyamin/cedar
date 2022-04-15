import path from 'node:path';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';

import { walk } from '@nodelib/fs.walk';
import { setProperty } from 'dot-prop';

/**
 *
 * Load a data file. JSON or JS
 *
 * @param {string} file
 * @returns {Promise<unknown>}
 */
async function getFile(file) {
	const ext = path.extname(file);

	if (ext === '.json') {
		return JSON.parse(await fs.readFile(file));
	}

	if (['.js', '.mjs', '.cjs'].includes(ext)) {
		const contents = await import(file);
		return contents.default ?? contents;
	}
}

/**
 *
 * @param {string} dir
 */
async function getData(dir) {
	const data = {};

	const entries = await promisify(walk)(dir);

	/** @type {[string, Record<string, unknown>][]} */
	const files = [];
	for (const entry of entries) {
		files.push(
			new Promise((resolve, reject) => {
				getFile(path.resolve(entry.path))
					.then((value) => {
						resolve([path.relative(dir, entry.path), value]);
					})
					.catch((error) => {
						reject(error);
					});
			}),
		);
	}

	const values = await Promise.all(files);
	for (const [filePath, value] of values) {
		if (!value) continue;

		const segments = filePath.split(path.sep);

		const { name } = path.parse(filePath);

		// Remove file extension from last item
		segments.pop();
		segments.push(name);

		// Children of `foo/index.json` get added under
		// 'foo', instead of under 'foo.index'
		if (name === 'index') segments.pop();

		if (segments.length === 0) {
			Object.assign(data, value);
		} else {
			setProperty(data, segments.join('.'), value);
		}
	}

	return data;
}

export default getData;
