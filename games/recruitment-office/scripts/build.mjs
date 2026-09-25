// Build script for The Recruitment Office.
// Hosting builders run `npm run build` in a Node.js-only image — no dev server,
// no live reload: copy static assets into dist/ and exit.
import { cp, mkdir, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const root = join(scriptDir, '..');
const dist = join(root, 'dist');

// Fresh build each time.
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// The game is a single self-contained index.html plus any art assets.
await cp(join(root, 'index.html'), join(dist, 'index.html'));

// art/ is optional until artwork lands; don't fail the build without it.
try {
  await access(join(root, 'art'));
  await cp(join(root, 'art'), join(dist, 'art'), { recursive: true });
} catch {
  console.log('No art/ directory yet — building index.html only.');
}

console.log('Built dist/ with game assets.');
