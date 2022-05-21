// @flow
import { buildLog, spawn } from 'build-strap';

// Normally handled by eslint, but we get more debug info when run separately
export default async function jest(watch?: boolean = process.argv.includes('--watch')) {
  if (process.argv.includes('--no-jest')) {
    buildLog('Skipping due to --no-jest');
    return;
  }
  const directInvoke = process.argv[2] === 'jest';
  await spawn('jest', directInvoke ? process.argv.slice(3) : watch ? ['--watch'] : [], {
    stdio: 'inherit',
    shell: true,
  });
}
