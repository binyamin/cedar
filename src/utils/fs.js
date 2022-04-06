import path from 'node:path';
import {promises as fs} from 'node:fs';

export async function mkdir(dir) {
    try {
        await fs.stat(dir);
    } catch (error) {
        if (error.code === "ENOENT") {
            await fs.mkdir(dir, {
                recursive: true
            });
        }
    }
}

/**
 * Write data to a file, making parent directories as needed
 * @param {string} filepath - absolute path to a file
 * @param { string | Uint8Array } data - data to write
 * @param { import("fs").WriteFileOptions } [options] - same as `fs.writeFile()` options
 * @return {Promise<void>}
 */
export async function writeFile(filepath, data, options) {
    const { dir } = path.parse(filepath);
    try {
        await fs.access(dir);
    } catch (error) {
        if(error.code === "ENOENT") await fs.mkdir(dir, { recursive: true })
        else throw new Error(error)
    }
    return await fs.writeFile(filepath, data, options);
}

/**
 * Get all files within subdirectories
 * @param {string} dir directory to crawl
 * @param {string[]} [_fileList] Array which keeps the list of files in-memory
 * @returns {Promise<string[]>}
 */
export async function walk(dir, _fileList = []) {
    const files = await fs.readdir(dir)
    for (const file of files) {
        const stat = await fs.stat(path.join(dir, file))
        if (stat.isDirectory()) {
            _fileList = await walk(path.join(dir, file), _fileList)
        }
        else {
            _fileList.push(path.join(dir, file))
        }
    }
    return _fileList;
}
