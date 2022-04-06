import {promises as fs} from 'node:fs';
import path from 'node:path';

import { walk, writeFile } from "../utils/fs.js";
import type { Options, Plugin, PluginMain } from './plugin.js';

class Runner {
    private config: Options;
    private plugins: PluginMain[] = [];
    
    constructor(options: Options) {
        this.config = options;
    }

    use<T extends Plugin>(plugin: T, options?: Parameters<T>[0]) {
        const p = plugin(options ?? {}, this.config);
        this.plugins.push(p);
        return this;
    }

    /**
     * This should be the last method called
     */
    async process() {
        const filepaths = await walk(this.config.src);

        for(const f of filepaths) {
            let file = {
                path: f,
                contents: await fs.readFile(f, 'utf-8'),
                destination: path.join(this.config.dest, path.relative(this.config.src, f))
            }

            this.plugins.forEach(p => {
                file = p(file);
            })

            await writeFile(file.destination, file.contents, 'utf-8');
        }
    }
}

function createRunner(options: Options): Runner {
    return new Runner(options);
}

export { Runner };
export default createRunner;