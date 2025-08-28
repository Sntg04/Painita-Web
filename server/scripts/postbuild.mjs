import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const serverDir = path.resolve(root, 'server');
const clientDir = path.resolve(root, 'client');
const clientDist = path.join(clientDir, 'dist');
const target = path.join(serverDir, 'client_dist');

function run(cmd, cwd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

try {
  // Ensure server deps (in case build step didn’t do it)
  try {
    run('npm ci --omit=dev', serverDir);
  } catch {
    run('npm install --omit=dev', serverDir);
  }

  // Copy client dist into server/client_dist
  if (!fs.existsSync(clientDist)) {
    console.warn('Client dist not found, skipping copy');
    process.exit(0);
  }
  fs.mkdirSync(target, { recursive: true });

  // recursive copy
  function copyDir(src, dst) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const e of entries) {
      const s = path.join(src, e.name);
      const d = path.join(dst, e.name);
      if (e.isDirectory()) {
        fs.mkdirSync(d, { recursive: true });
        copyDir(s, d);
      } else if (e.isFile()) {
        fs.copyFileSync(s, d);
      }
    }
  }

  copyDir(clientDist, target);
  console.log('Client build copied to server/client_dist');
} catch (e) {
  console.error('postbuild failed:', e);
  process.exit(1);
}
