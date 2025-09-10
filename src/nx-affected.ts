import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

async function runNxShowProjectsAffected(target: string, projects?: Set<string>) {
	const projectsFilter = projects ? ` --projects=${Array.from(projects).join(',')}` : '';
	const nxShowProjectsAffected = `npx nx show projects --affected --json --with-target=${target}${projectsFilter}`;

	try {
		return execPromise(nxShowProjectsAffected);
	} catch (error) {
		throw new Error(`Error occurred calling "${nxShowProjectsAffected}": ${error.message}`);
	}
}

export async function getAffectedProjectsByTarget(target: string, projects?: Set<string>) {
	const { stdout, stderr } = await runNxShowProjectsAffected(target, projects);

	if (stderr) {
		throw new Error(stderr);
	}

	const projectsAffected = JSON.parse(stdout.toString());
	return new Set(projectsAffected);
}
