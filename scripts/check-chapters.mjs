// Cross-check the chapters against the fact base. Run: npm run check:chapters
// - every fact code cited in a chapter exists in research/facts.yml
// - every paragraph and bullet cites a fact (<!-- F012 -->) or links to a source,
//   except in sections marked with <!-- explained --> on the line after their heading
// - English and Arabic cite the same facts in each chapter
// - lists facts not used, and used facts still marked check or disputed
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { ROOT, CONFIG, readYaml, factIds } from './lib.mjs';

const facts = Object.fromEntries((readYaml('research/facts.yml') || []).map((f) => [f.id, f]));
let problems = 0;
const bad = (msg) => { console.log(msg); problems++; };
const used = {}; // lang -> Set
const perChapter = {}; // file -> lang -> sorted ids

for (const lang of CONFIG.languages) {
  used[lang] = new Set();
  const dir = path.join(ROOT, 'content', lang);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (!data.chapter) { factIds(content).forEach((i) => { used[lang].add(i); if (!facts[i]) bad(`content/${lang}/${file}: unknown fact ${i}`); }); continue; }
    const rel = `content/${lang}/${file}`;
    const ids = new Set();
    let exempt = false;
    let level = 0;
    const blocks = content.split(/\n\s*\n/);
    for (let b = 0; b < blocks.length; b++) {
      const block = blocks[b].trim();
      if (!block) continue;
      const head = block.match(/^(#{1,6})\s/);
      if (head) {
        const lv = head[1].length;
        if (exempt && lv <= level) exempt = false;
        if (/<!--\s*explained\s*-->/.test(block) || (blocks[b + 1] || '').trim().startsWith('<!-- explained -->')) { exempt = true; level = lv; }
        continue;
      }
      if (/^<!--\s*explained\s*-->$/.test(block)) continue;
      // bullets are checked one by one; tables and HTML (widgets) are skipped
      const items = /^[-*] |^\d+\. /.test(block) ? block.split(/\n(?=[-*] |\d+\. )/) : [block];
      for (const item of items) {
        if (/^\||^<\/?[a-z]/.test(item)) continue;
        const cited = factIds(item);
        cited.forEach((i) => ids.add(i));
        for (const i of cited) if (!facts[i]) bad(`${rel}: unknown fact ${i}`);
        if (!exempt && !cited.length && !/\]\(https?:\/\//.test(item)) bad(`${rel}: no fact code or source link: ${item.slice(0, 70).replace(/\n/g, ' ')}...`);
      }
    }
    ids.forEach((i) => used[lang].add(i));
    (perChapter[file] ||= {})[lang] = [...ids].sort();
  }
}

for (const [file, byLang] of Object.entries(perChapter)) {
  const langs = CONFIG.languages.filter((l) => byLang[l]);
  if (langs.length < CONFIG.languages.length) continue; // translation not written yet
  const [a, b] = langs;
  const onlyA = byLang[a].filter((i) => !byLang[b].includes(i));
  const onlyB = byLang[b].filter((i) => !byLang[a].includes(i));
  if (onlyA.length || onlyB.length) bad(`${file}: languages cite different facts (only ${a}: ${onlyA.join(' ') || '-'}; only ${b}: ${onlyB.join(' ') || '-'})`);
}

for (const lang of CONFIG.languages) {
  if (!used[lang].size) continue;
  const unused = Object.keys(facts).filter((i) => !used[lang].has(i));
  console.log(`[${lang}] facts not used: ${unused.join(' ') || 'none'}`);
  const flagged = [...used[lang]].filter((i) => facts[i] && ['check', 'disputed'].includes(facts[i].status)).sort();
  console.log(`[${lang}] used facts marked check/disputed: ${flagged.join(' ') || 'none'}`);
}
console.log(`${Object.keys(perChapter).length} chapter(s) checked, ${problems} problem(s).`);
process.exit(problems ? 1 : 0);
