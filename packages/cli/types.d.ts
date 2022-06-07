import { type plugin } from '@binyamin/cedar-runner';

declare interface Config {
	src: string;
	dest: string;
	plugins?: plugin[];
}
