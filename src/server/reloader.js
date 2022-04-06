import {default as tinylr} from 'tiny-lr';
import {createDebug} from '../utils/log.js';

const debug = createDebug("reloader");

/**
 * Live-reload server. Wrapper for `tiny-lr`.
 */
class Reloader {
    #server;

    constructor() {
        this.#server = tinylr();
        debug("loaded");
    }

    /**
     * Start the live-reload server
     * @return {Promise<void>}
     */
    listen() {
        this.#server.listen();
        debug("running");
    }

    get server() {
        return this.#server;
    }

    /**
     * Reload a file
     * @param {string|string[]} paths path(s) to reload
     */
    reload(paths) {
        debug("reloading")
        this.#server.changed({
            body: {
                files: Array.isArray(paths) ? paths : [ paths ]
            }
        })
    }

     /**
     * Close the server
     * 
     * @returns {Promise<void>}
     */
    close() {
        return new Promise((resolve, reject) => {
            debug("exiting");
            this.#server.close(err => {
                if(err) reject(err);
                resolve();
            });
        })
    }
}

export default Reloader;