// Every fact's quote must appear in its source transcript at the given timestamp
// (or run on into the next line). Run: npm run check:facts
import path from 'node:path';
import fs from 'node:fs';
import { ROOT, readYaml, loadTranscript, norm } from './lib.mjs';

const facts = readYaml('research/facts.yml') || [];
const sources = readYaml('research/sources.yml') || [];
const transcripts = {};
for (const s of sources) {
  const p = s.transcript && path.join(ROOT, 'research', s.transcript);
  if (p && fs.existsSync(p)) transcripts[s.id] = loadTranscript(p);
}

const STATUSES = new Set(['from-source', 'check', 'disputed', 'opinion', 'verified']);
let problems = 0;
const seen = new Set();
const bad = (msg) => { console.log(msg); problems++; };
for (const f of facts) {
  if (!/^F\d{3,}$/.test(f.id || '')) bad(`${f.id}: id must look like F001`);
  if (seen.has(f.id)) bad(`${f.id}: duplicate id`);
  seen.add(f.id);
  if (!STATUSES.has(f.status)) bad(`${f.id}: unknown status ${f.status}`);
  const [src, ts] = String(f.source || '').split('@');
  const lines = transcripts[src];
  if (!lines) { bad(`${f.id}: no transcript for source ${src}`); continue; }
  const i = lines.findIndex((l) => l.ts === ts);
  if (i < 0) { bad(`${f.id}: no transcript line at ${ts}`); continue; }
  const window = norm(lines.slice(i, i + 2).map((l) => l.text).join(' '));
  if (!f.quote || !window.includes(norm(f.quote))) bad(`${f.id}: quote not found at ${ts}: ${JSON.stringify(f.quote)}`);
}
console.log(`${facts.length} facts checked, ${problems} problem(s).`);
process.exit(problems ? 1 : 0);
