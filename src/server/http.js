import http from 'node:http';
import handler from 'serve-handler';
import { createDebug } from '../utils/log.js';

const debug = createDebug("http");

class Server {
    #server;
    #dir;

    /**
     * 
     * @param {object} options 
     * @param {string} options.dir Folder to serve
     */
    constructor(options) {
        this.#dir = options.dir;

        this.#server = http.createServer((req, res) => {
            return handler(req, res, {
                public: this.#dir
            })
        });

        debug("loaded");
    }
    
    /**
     * Starts the file server
     * 
     * @param {number} [port=3000] Port number (default: 3000)
     * @returns {Promise<void>}
     */
    listen(port=3000) {
        return new Promise(resolve => {
            this.#server.listen(port, () => {
                debug("running");
                resolve();
            });
        })
    }

    /**
     * The internal server
     * 
     * @type {http.Server}
     */
    get server() {
        return this.#server;
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

export default Server;