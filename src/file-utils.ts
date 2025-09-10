import { resolve } from 'node:path';
import { cwd } from 'node:process';

export function resolveFilePath(filename: string) {
	return resolve(cwd(), filename);
}
