import { type File, type plugin } from '@cedar/runner';

declare interface Config {
	src: string;
	dest: string;
	plugins?: plugin[];
}

/**
 * @param paths Only render the files at these paths.
 * (default: undefined)
 * @returns The output file objects
 */
declare type BuilderReturnType = (paths: string | string[]) => Promise<File[]>;

export function builder(config: Config): BuilderReturnType;

/**
 *
 * @param file Path to a config file. Relative to the current
 * working directory. Defaults to `cedar.config.js`.
 *
 * @returns The contents of the file.
 */
export function loadConfig(file?: string): Promise<Config>;
