export interface Options {
    src: string
    dest: string
}

export type PluginMain = (file: File) => File;
export type Plugin = (options: {}, config?: Options) => PluginMain;

declare interface File {
    path: string
    contents: string
    destination: string
}