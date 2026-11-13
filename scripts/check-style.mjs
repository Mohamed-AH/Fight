// Catch the obvious signs of machine-written text. Run: npm run check:style
// Fails on stock phrases, dashes used as punctuation, and leftover scaffolding.
// It cannot judge tone: still read the pages aloud before publishing.
// To allow a phrase that is a quote from the episode, add it to "allow" below.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CONFIG } from './lib.mjs';

const RULES = {
  en: [
    // stock vocabulary
    /\b(delve|delves|tapestry|testament to|realm|landscape of|embark|unlock|empower|foster|holistic|seamless|robust|game-changer|transformative|resonates?|nuanced|multifaceted|underscores?|pivotal|vibrant|intricate|beacon|cornerstone|harness|elevate)\b/i,
    // stock phrases
    /\b(it'?s (important|worth) (to note|noting)|it is (important|worth) (to note|noting)|plays? a (crucial|vital|key) role|in today'?s|fast-paced|at its core|in essence|in conclusion|let'?s (dive|explore)|dive into|deep dive|key takeaway|here'?s the thing|the bottom line|simply put|serves as a reminder)\b/i,
    // filler intensifiers and connectives
    /\b(moreover|furthermore|additionally|ultimately|truly|incredibly|remarkably)\b/i,
  ],
  ar: [
    /(مما لا شك فيه|لا شك أن|في عالمنا اليوم|يلعب دورًا|دورًا محوريًا|في نهاية المطاف|علاوة على ذلك|من الجدير بالذكر|تجدر الإشارة|في جوهره|نسيج)/,
  ],
  all: [
    /[—–]/, // em and en dashes: use a comma, colon or full stop
    /\b(TODO|TBD|lorem|placeholder|coming soon)\b|as the site grows|مع نمو الموقع/i,
  ],
};
const allow = [];

let problems = 0;
for (const lang of CONFIG.languages) {
  const dir = path.join(ROOT, 'content', lang);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const lines = fs.readFileSync(path.join(dir, file), 'utf8').split('\n');
    lines.forEach((raw, i) => {
      // ignore links, fact codes and comments
      const line = raw.replace(/\]\([^)]*\)/g, ']').replace(/<!--.*?-->/g, '');
      for (const re of [...(RULES[lang] || []), ...RULES.all]) {
        const m = line.match(re);
        if (m && !allow.some((a) => line.includes(a))) {
          console.log(`content/${lang}/${file}:${i + 1}: "${m[0]}" in: ${line.trim().slice(0, 90)}`);
          problems++;
        }
      }
    });
  }
}
console.log(`style checked, ${problems} problem(s).`);
process.exit(problems ? 1 : 0);
