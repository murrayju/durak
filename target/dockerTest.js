// @flow
import path from 'path';
import { buildLog, dockerContainerRun } from 'build-strap';
import { getBuilderImage, ensureBuilder, dockerTeardown } from './docker';

// Run automated tests within the docker container
export default async function dockerTest(
  build: boolean = process.argv.includes('--build'),
  integration: boolean = process.argv.includes('--test-integration'),
  useConfig: boolean = process.argv.includes('--use-config'),
  interactive: boolean = !process.argv.includes('--non-interactive'),
) {
  const tag = await ensureBuilder(build);

  const network = `durak-test-integration-${tag}`;
  try {
    // Run the tests in the builder container
    await dockerContainerRun({
      runArgs: [
        '--rm',
        ...(interactive ? ['-it'] : []),
        ...(integration ? [`--network=${network}`] : []),
        ...(useConfig || integration
          ? ['-v', `${path.resolve('./config')}:/opt/build/config`]
          : []),
      ],
      image: await getBuilderImage(tag),
      cmd: [
        'test',
        '--test-only',
        '--test-no-dockerize-deps',
        ...(integration ? ['--test-integration'] : []),
      ],
    });
  } finally {
    // cleanup
    if (integration) {
      buildLog('Cleaning up docker containers...');
      await dockerTeardown();
      buildLog('Cleanup complete!');
    }
  }
}
