import nunjucks from 'nunjucks';

class Engine extends nunjucks.Environment {
    /**
     * 
     * @param {object} options
     * @param {string | string[]} options.dirs
     */
    constructor(options) {
        const loader = new nunjucks.FileSystemLoader(options.dirs);
        super(loader);
    }
}

/**
 * 
 * @param {{}} options 
 * @param {import("../build/runner.js").runner.Options} config 
 * @returns 
 */
function plugin(options, config) {
    const e = new Engine({ dirs: config.src });

    return function(file) {
        if(file.path.endsWith(".njk")) {
            file.destination = file.destination.replace(/\.njk$/, '.html');
            file.contents = e.renderString(file.contents, {});
        }

        return file;
    }
}

export {Engine};
export default plugin;