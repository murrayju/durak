import { ESLint } from 'eslint';
import { buildLog, getVersionCode } from 'build-strap';
import fs from 'fs-extra';

// Pass the generated code through eslint,
// which auto-formats it and write out the clean output file
const lintAndWrite = async (code, filePath) => {
  const engine = new ESLint({ fix: true });
  const report = await engine.lintText(code, { filePath });
  await ESLint.outputFixes(report);
  buildLog(`Generated file: ${filePath}`);
};

// Code generation
export default async function generateSrc() {
  if (process.argv.includes('--no-generate-src')) {
    buildLog('Skipping due to --no-generate-src');
    return;
  }

  await fs.ensureDir('./src');
  await lintAndWrite(
    `${await getVersionCode()}\nexport default version;`,
    './src/version._generated_.js',
  );
}
