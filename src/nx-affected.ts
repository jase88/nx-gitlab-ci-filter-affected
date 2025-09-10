import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

async function runNxShowProjectsAffected(target: string, projects?: Set<string>): Promise<Set<string>> {
	const projectsFilter = projects ? ` --projects=${Array.from(projects).join(',')}` : '';
	const nxShowProjectsAffected = `npx nx show projects --affected --json --with-target=${target}${projectsFilter}`;

	try {
		const { stdout, stderr } = await execPromise(nxShowProjectsAffected);
		if (stderr) {
			throw new Error(stderr);
		}

		const projectsAffected = JSON.parse(stdout.toString());
		return new Set(projectsAffected);
	} catch (error) {
		throw new Error(`Error occurred calling "${nxShowProjectsAffected}": ${error.message}`);
	}
}

export function getAffectedProjectsByTarget(target: string, projects?: Set<string>) {
	return runNxShowProjectsAffected(target, projects);
}
