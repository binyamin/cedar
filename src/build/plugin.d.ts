export interface Options {
	src: string;
	dest: string;
}

export interface PluginMain {
	name: string;
	extensions: string[];
	exec(file: File): File | Promise<File>;
}

export type Plugin = (
	config: Options,
	options?: Record<string, unknown>,
) => PluginMain;

declare interface File {
	path: string;
	contents: string;
	destination: string;
}
