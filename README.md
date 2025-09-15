# nx-gitlab-ci-filter-affected
`nx-gitlab-ci-filter-affected` is a CLI tool for `nx` monorepo users who use `Gitlab` and want to filter their pipeline jobs dynamically based on nx affected.

An existing Gitlab pipeline is expected as input. In this pipeline, variables can be used to define whether a job is to be filtered using an nx target or one or more nx projects.

`nx-gitlab-ci-filter-affected` reduces jobs of an existing gitlab pipeline to affected projects detected by `nx`.
The detected projects are passed to the job as variables, so that this information can be reused within the jobs.

The reduced pipeline is then written to the file system.

## Why filtering Gitlab CI jobs by nx affected?

Since Gitlab does not yet offer the option of reacting to variables generated at runtime, there are only limited options for not executing jobs if they are not `nx affected`.

One possibility is to write a dynamic pipeline that can then be started by Gitlab as a child pipeline. This is exactly the approach taken with this CLI tool.

## Usage

`npx nx-gitlab-ci-filter-affected --input pipeline.yml --output affected.yml`

The CLI requires an input and output file path relative to the current working directory.

Alternatively you can set the environment variables `NX_GL_PIPELINE_INPUT` and `NX_GL_PIPELINE_OUTPUT`.

### Example

```yaml
calculate-affected:
  image: node:23.2.0-alpine3.20
  variables:
    NX_GL_PIPELINE_INPUT: 'gitlab-ci.all.yml'
    NX_GL_PIPELINE_OUTPUT: 'affected.yml'
  before_script:
    - |
      NX_HEAD=$CI_COMMIT_SHA
      NX_BASE=${CI_MERGE_REQUEST_DIFF_BASE_SHA:-$CI_COMMIT_BEFORE_SHA}
      if [ "$NX_BASE" = "0000000000000000000000000000000000000000" ]; then NX_BASE="origin/$CI_DEFAULT_BRANCH"; fi;
    - git fetch origin $CI_DEFAULT_BRANCH:$CI_DEFAULT_BRANCH
  script:
    - npx nx-gitlab-ci-filter-affected
  artifacts:
    paths:
      - affected.yml

run-affected:
  needs:
    - job: calculate-affected
      artifacts: true
  trigger:
    include:
      - artifact: affected.yml
        job: calculate-affected
```

## Configuration of the pipeline

### Target
Every job has to define a nx target that is used to filter the affected projects.
This is done with the variable `NX_GL_TARGET`.

### Example
```yaml
lint:
  variables:
    NX_GL_TARGET: 'lint'
  script:
    # ...
```

This job will only be available in the pipeline if there is any project affected by the `lint` target.


### Projects
Additionally, to the target there can be a list of projects that are used to filter the affected projects.
This is done with the variable `NX_GL_PROJECTS`. It can be comma separated list of projects or a project pattern. 
```yaml
build-app1:
  variables:
    NX_GL_TARGET: 'build'
    NX_GL_PROJECTS: 'app1'
  script:
    - nx build app1
```

This job will only be available in the pipeline if the target `build` for the project `app1` is affected.

### List of affected projects

Additionally to the filtering of the jobs, the affected projects are passed to the job as a variable.
#### Input
```yaml
lint:
  variables:
    NX_GL_TARGET: 'lint'
  script:
    - echo "Building $NX_GL_AFFECTED_PROJECTS"
```

#### Output
```yaml
lint:
  variables:
    NX_GL_TARGET: 'lint'
    NX_GL_AFFECTED_PROJECTS: 'project1,project2'
  script:
    - echo "Building $NX_GL_AFFECTED_PROJECTS"
```