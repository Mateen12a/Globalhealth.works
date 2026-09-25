#!/usr/bin/env node
// Local/preview launcher that mirrors the production topology:
// backend (Express, port 3000) + frontend (Vite dev server, Freebuff's PORT).
// Vite proxies /api, /uploads and /socket.io to the backend (see vite.config.js).
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url)); // repo root (script lives in scripts/)
const node = process.execPath;
const children = [];
let shuttingDown = false;
let backendRestarts = 0;
const MAX_BACKEND_RESTARTS = 5;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try { c.kill('SIGTERM'); } catch { /* already dead */ }
  }
  setTimeout(() => process.exit(0), 300);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function startBackend() {
  // Spawn node directly against the entry point (works in any environment,
  // even where npm is not resolvable from spawned children).
  const child = spawn(node, ['index.js'], {
    cwd: join(root, 'backend'),
    env: { ...process.env, PORT: '3000', FORCE_COLOR: '1' },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  children.push(child);
  child.on('exit', (code) => {
    const i = children.indexOf(child);
    if (i >= 0) children.splice(i, 1);
    if (shuttingDown) return;
    console.log(`[backend] exited (code=${code})`);
    if (backendRestarts < MAX_BACKEND_RESTARTS) {
      backendRestarts += 1;
      console.log(`[backend] restarting (${backendRestarts}/${MAX_BACKEND_RESTARTS}) in 2s…`);
      setTimeout(startBackend, 2000);
    } else {
      console.error('[backend] giving up — check the logs above.');
    }
  });
}

function startFrontend() {
  const child = spawn(node, [
    join(root, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js'),
  ], {
    cwd: join(root, 'frontend'),
    env: { ...process.env, PORT: process.env.PORT || '5000', FORCE_COLOR: '1' },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  children.push(child);
  child.on('exit', (code) => {
    const i = children.indexOf(child);
    if (i >= 0) children.splice(i, 1);
    if (shuttingDown) return;
    console.error(`[frontend] exited (code=${code}) — stopping.`);
    shutdown();
  });
}

console.log('[dev] starting backend (Express, port 3000)…');
startBackend();

setTimeout(() => {
  console.log('[dev] starting frontend (Vite)…');
  startFrontend();
}, 1500);

// Keep the launcher alive until children exit.
setInterval(() => {}, 1 << 30);
