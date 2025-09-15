import { readFileSync, writeFileSync } from 'node:fs';
import { load, dump } from '@zkochan/js-yaml';
import { resolveFilePath } from './file-utils';

interface GitlabJobWithVariables {
	extends?: string[];
	variables: Record<string, string>;
}

type GitlabItem = GitlabJobWithVariables | Object | string[];
export type GitlabCiYml = Record<string, GitlabItem>;

function isObject(value: unknown) {
	return Object.prototype.toString.call(value) === '[object Object]';
}

export function isGitlabJobWithVariables(item: GitlabItem): item is GitlabJobWithVariables {
	return isObject(item) && isObject(item['variables']);
}

export function readGitlabCiPipelineYml(filename: string) {
	const filePath = resolveFilePath(filename);
	const pipelineYmlContent = readFileSync(filePath, 'utf-8');

	if (pipelineYmlContent.trim() === '') {
		throw new Error(`File "${filename}" is empty!`);
	}

	return load(pipelineYmlContent, { filename }) as GitlabCiYml;
}

export function writeGitlabCiPipelineYml(filename: string, content: GitlabCiYml) {
	const pipelineYmlContent = dump(content);

	const filePath = resolveFilePath(filename);
	writeFileSync(filePath, pipelineYmlContent);
}

function checkInput(input: string) {
	// Only allow alphanumeric, dash, underscore, and comma
	if (input && !/^[\w\-\,]+$/.test(input)) {
		throw new Error(`Invalid input: ${input}`);
	}
}

export function getTargetFromJob(job: GitlabJobWithVariables) {
	const target = job.variables['NX_GL_TARGET'];
	checkInput(target);
	return target;
}

export function getProjectFromJob(job: GitlabJobWithVariables): Set<string> | undefined {
	const projects = job.variables['NX_GL_PROJECTS'];
	checkInput(projects);

	if (!projects) {
		return undefined;
	}

	return new Set(projects.split(',').map((projectName) => projectName.trim()));
}

export function writeNotAffectedToJobVariables(job: GitlabJobWithVariables, jobName: string) {
	console.log(`job "${jobName}" was marked as not affected, because no affected projects could be found`);
	job.variables['NX_GL_IS_AFFECTED'] = 'false';
}

export function writeAffectedProjectsToJobVariables(job: GitlabJobWithVariables, affectedProjects: Set<string>, jobName: string) {
	const affectedProjectNames = Array.from(affectedProjects).join(',');
	console.log(`writing affected projects "${affectedProjectNames}" for job "${jobName}"`);
	job.variables['NX_GL_AFFECTED_PROJECTS'] = affectedProjectNames;
	job.variables['NX_GL_IS_AFFECTED'] = 'true';
}
