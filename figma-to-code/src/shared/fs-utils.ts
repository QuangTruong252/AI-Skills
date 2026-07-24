import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeTextFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readTextFile(filePath)) as T;
}

export function pathExists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function walkFiles(dir: string, extensions: string[]): string[] {
  if (!pathExists(dir)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results.sort((a, b) => a.localeCompare(b));
}

/** Resolve package root (figma-to-code/) from any file under it. */
export function packageRootFrom(importMetaUrl: string): string {
  const here = path.dirname(fileURLToPath(importMetaUrl));
  // Walk up until package.json with name figma-to-code or containing src/
  let cur = here;
  for (let i = 0; i < 8; i++) {
    const pkg = path.join(cur, 'package.json');
    if (pathExists(pkg)) {
      try {
        const j = JSON.parse(fs.readFileSync(pkg, 'utf8')) as { name?: string };
        if (j.name === 'figma-to-code') return cur;
      } catch {
        /* continue */
      }
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return path.resolve(here, '..');
}

export function repoRootFromPackage(pkgRoot: string): string {
  return path.resolve(pkgRoot, '..');
}

export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}
