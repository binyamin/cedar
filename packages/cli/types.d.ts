import { type plugin } from '@cedar/runner';

declare interface Config {
	src: string;
	dest: string;
	plugins?: plugin[];
}
