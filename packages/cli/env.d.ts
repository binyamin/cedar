declare module 'process' {
	global {
		namespace NodeJS {
			interface ProcessEnv {
				CEDAR_MODE: 'build' | 'serve';
				NODE_ENV?: string;
			}
		}
	}
}
