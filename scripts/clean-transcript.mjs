// Turn a raw transcript into one "[h:mm:ss] text" line per caption.
// Usage: node scripts/clean-transcript.mjs research/transcripts/S1-original.txt > research/transcripts/S1.txt
// Understands:
//   YouTube "Show transcript" copied text:  0:022 seconds Text   /   1:051 minute, 5 seconds Text
//   plain lines:                            0:02 Text   /   [00:01:05] Text
//   .srt and .vtt subtitle files
//   a transcript with no timestamps at all, split by "### Chapter N: title" lines:
//     each line gets a reference "[NN.LLL]" (chapter number, line number within the chapter),
//     so facts can still point to an exact place: source "S1@07.012"
// Lines that are not captions (e.g. "Chapter 1: Intro") are kept as "## Chapter 1: Intro".
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/clean-transcript.mjs <file>'); process.exit(1); }
const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r/g, '');

const pad = (n) => String(n).padStart(2, '0');
function hms(t) {
  const p = t.split(':').map(Number);
  while (p.length < 3) p.unshift(0);
  return `${p[0]}:${pad(p[1])}:${pad(p[2])}`;
}

const out = [];
const isSub = /-->/.test(raw);
const hasTimes = /^\[?\d{1,2}:\d{2}/m.test(raw);
if (!isSub && !hasTimes) {
  // no timestamps: number the lines inside each chapter
  let ch = 0; let n = 0;
  for (let l of raw.split('\n')) {
    l = l.replace(/\\([[\]])/g, '$1').replace(/\s+/g, ' ').trim();
    if (!l) continue;
    const m = l.match(/^#+\s*Chapter\s+(\d+)\s*[:：-]?\s*(.*)$/i);
    if (m) { ch = Number(m[1]); n = 0; out.push(`## Chapter ${m[1]}: ${m[2]}`); continue; }
    if (!ch) { out.push(`## ${l}`); continue; }
    n += 1;
    out.push(`[${pad(ch)}.${String(n).padStart(3, '0')}] ${l}`);
  }
} else if (isSub) {
  // .srt / .vtt: blocks of [index] / start --> end / text lines
  for (const block of raw.split(/\n\s*\n/)) {
    const lines = block.split('\n').filter(Boolean);
    const i = lines.findIndex((l) => l.includes('-->'));
    if (i < 0) continue;
    const start = lines[i].split('-->')[0].trim().replace(',', '.').split('.')[0];
    const text = lines.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) out.push(`[${hms(start)}] ${text}`);
  }
} else {
  const yt = /^(\d{1,2}:\d{2}(?::\d{2})?)(\d+\s+(?:hour|minute|second)s?(?:,\s*\d+\s+(?:hour|minute|second)s?)*)\s*(.*)$/;
  const plain = /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.*)$/;
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    let m = l.match(yt);
    if (m) { out.push(`[${hms(m[1])}] ${m[3].trim()}`); continue; }
    m = l.match(plain);
    if (m) { out.push(`[${hms(m[1])}] ${m[2].trim()}`); continue; }
    // a bare timestamp line followed by its text on the next line
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(l) && lines[i + 1]) { out.push(`[${hms(l)}] ${lines[++i]}`); continue; }
    if (out.length && !/^chapter\b|^الفصل/i.test(l) && !l.startsWith('#')) { out[out.length - 1] += ` ${l}`; continue; }
    out.push(`## ${l.replace(/^#+\s*/, '')}`);
  }
}
process.stdout.write(out.join('\n') + '\n');
console.error(`${out.filter((l) => l.startsWith('[')).length} lines.`);
