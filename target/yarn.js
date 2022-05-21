import { run, yarnInstall, buildLog } from 'build-strap';
import cleanYarn from './cleanYarn';

export const yarnFiles = ['./package.json', './yarn.lock'];

// Download javascript dependencies (using yarn)
export default async function yarn(clean = process.argv.includes('--clean-yarn')) {
  if (clean) {
    await run(cleanYarn);
  }
  if (process.argv.includes('--no-yarn')) {
    buildLog('Skipping due to --no-yarn');
    return;
  }
  await yarnInstall();
}
