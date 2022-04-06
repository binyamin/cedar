import runner from './build/runner.js';
import njk from './plugins/nunjucks.js';

/**
 * 
 * @param {object} config 
 * @param {string} config.src 
 * @param {string} config.dest
 */
async function build(config) {
    return await runner({
        src: config.src,
        dest: config.dest
    })
        .use(njk)
        .process();
}

export { default as serve } from "./server/index.js";
export { build };