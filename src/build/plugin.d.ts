export interface Options {
	src: string;
	dest: string;
}

export type PluginMain = (file: File) => File;
export type Plugin = (
	config: Options,
	options?: Record<string, unknown>,
) => PluginMain;

declare interface File {
	path: string;
	contents: string;
	destination: string;
}
