import debug from 'debug';

const raw = debug('cedar');
export const createDebug = (ns) => raw.extend(ns);
export { raw as debug };
