import { getAffectedProjectsByTarget } from './nx-affected';
import { parseAndValidateArguments } from './parse-and-validate-arguments';
import {
  getProjectFromJob,
  getTargetFromJob,
  isGitlabJobWithVariables,
  readGitlabCiPipelineYml,
  removeUnaffectedJobFromPipeline,
  writeAffectedProjectsToJobVariables,
  writeGitlabCiPipelineYml,
} from './gitlab-yml-utils';

(async () => {
  const { pipelineInput, pipelineOutput } = parseAndValidateArguments();

  const pipeline = readGitlabCiPipelineYml(pipelineInput);

  for (const [jobName, jobDefinition] of Object.entries(pipeline)) {
    if (!isGitlabJobWithVariables(jobDefinition)) {
      continue;
    }

    const target = getTargetFromJob(jobDefinition);
    const projects = getProjectFromJob(jobDefinition);

    if (!target) {
      continue;
    }

    const filteredAffectedProjects = await getAffectedProjectsByTarget(target, projects);

    if (filteredAffectedProjects.size === 0) {
      removeUnaffectedJobFromPipeline(pipeline, jobName);
    } else {
      writeAffectedProjectsToJobVariables(jobDefinition, filteredAffectedProjects, jobName);
    }
  }

  writeGitlabCiPipelineYml(pipelineOutput, pipeline);
})();
