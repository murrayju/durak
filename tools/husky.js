import { run } from 'build-strap';
import jest from './jest';
import lint from './lint';

// husky gates commits with passing lint + tests
async function husky() {
  await Promise.all([run(jest), run(lint)]);
}

export default husky;
