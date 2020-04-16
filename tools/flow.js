// @flow
import { buildLog, spawn } from 'build-strap';

// Normally handled by eslint, but we get more debug info when run separately
export default async function flow(
  allBranches?: boolean = process.argv.includes('--show-all-branches'),
  fullCheck?: boolean = process.argv.includes('--flow-full-check'),
) {
  if (process.argv.includes('--no-flow')) {
    buildLog('Skipping due to --no-flow');
    return;
  }
  await spawn(
    'flow',
    [fullCheck ? 'check' : 'status', ...(allBranches ? ['--show-all-branches'] : [])],
    {
      stdio: 'inherit',
      shell: true,
    },
  );
}
