// Stages The Recruitment Office into public/ so `vite build` ships it with
// the production bundle (backend serves dist/, so the game becomes available
// at /recruitment-office/ on globalhealth.works).
// Source of truth: ../games/recruitment-office/
import { cp, mkdir, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = join(frontendRoot, '..');
const src = join(repoRoot, 'games', 'recruitment-office');
const dest = join(frontendRoot, 'public', 'recruitment-office');

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(join(src, 'index.html'), join(dest, 'index.html'));

// art/ is optional until artwork lands; don't fail the build without it.
try {
  await access(join(src, 'art'));
  await cp(join(src, 'art'), join(dest, 'art'), { recursive: true });
} catch {
  // no art directory yet
}

console.log('Staged The Recruitment Office into public/recruitment-office/');
