import { yarnUpgrade } from 'build-strap';

// run yarn upgrade
export default async function upgrade({ outdated = process.argv.includes('--outdated') } = {}) {
  await yarnUpgrade({ outdated });
}
