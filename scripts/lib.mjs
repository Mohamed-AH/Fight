// Shared helpers for the checks.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

export function readYaml(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? YAML.parse(fs.readFileSync(p, 'utf8')) : null;
}

// "[0:12:34] text" or "[07.012] text" lines -> [{ ts: '0:12:34' | '07.012', text }]
export function loadTranscript(file) {
  return fs.readFileSync(file, 'utf8').split('\n')
    .map((l) => l.match(/^\[(\d+:\d\d:\d\d|\d{2}\.\d{3})\] (.*)$/))
    .filter(Boolean)
    .map((m) => ({ ts: m[1], text: m[2] }));
}

export function norm(s) {
  return String(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...')
    .replace(/[\u064B-\u0652\u0640]/g, '') // Arabic diacritics and tatweel
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

export const FACT_RE = /<!--\s*((?:F\d{3,}\s*)+)-->/g;
export function factIds(text) {
  const ids = [];
  for (const m of text.matchAll(FACT_RE)) ids.push(...m[1].trim().split(/\s+/));
  return ids;
}
