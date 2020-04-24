import { run } from 'build-strap';
import start from './start';

// Just an alias for start
async function tdd(...args) {
  await run(start, ...args);
}

export default tdd;
