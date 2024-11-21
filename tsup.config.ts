import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/nx-gitlab-ci-filter-affected.ts'],
  format: ['esm'],
  platform: 'node',
  minify: true,
  splitting: false,
  clean: true,
  publicDir: false,
});
