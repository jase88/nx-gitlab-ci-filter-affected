import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';

const options = {
  input: {
    type: 'string',
    multiple: false,
    short: 'i',
  },
  output: {
    type: 'string',
    multiple: false,
    short: 'o',
  },
} as const;

export function parseAndValidateArguments(): {
  pipelineOutput: string;
  pipelineInput: string;
} {
  const { NX_GL_PIPELINE_INPUT, NX_GL_PIPELINE_OUTPUT } = process.env;
  const {
    values: { input, output },
  } = parseArgs({ options });

  const pipelineInput = input ?? NX_GL_PIPELINE_INPUT;
  const pipelineOutput = output ?? NX_GL_PIPELINE_OUTPUT;

  if (!pipelineInput) {
    throw new Error(`You need to provide "--${input}" as an argument or "NX_GL_PIPELINE_INPUT" as an environment variable!`);
  }

  if (!existsSync(pipelineInput)) {
    throw new Error(`File "${pipelineInput}" could not be found!`);
  }

  if (!pipelineOutput) {
    throw new Error(`You need to provide "--${output}" as an argument or "NX_GL_PIPELINE_OUTPUT" as an environment variable!`);
  }

  return { pipelineInput, pipelineOutput };
}
