// Check the built website. Run after the build: npm run check:site
// - no fact codes (F001...), HTML comments or {{markers}} left in any page
// - no inline event handlers (onclick=...), which the security policy blocks
// - every page has a title of at most 70 characters and a description
// - every page has lang and dir on <html>, and a skip link target
// - every link and file reference inside the site points to something that exists
// - the placeholder VIDEO_ID is gone (warning only until the episode is set)
import fs from 'node:fs';
import path from 'node:path';

const site = path.resolve(process.argv[2] || 'dist');
const problems = [];
const warnings = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const pages = walk(site).filter((f) => f.endsWith('.html'));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function exists(from, url) {
  let p = url.split('#')[0].split('?')[0];
  if (!p) return true;
  p = decodeURIComponent(p);
  const target = p.startsWith('/') ? path.join(site, p) : path.resolve(path.dirname(from), p);
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(path.join(target, 'index.html'))) return true;
  return fs.existsSync(`${target}.html`);
}

for (const page of pages) {
  const rel = path.relative(site, page);
  const text = fs.readFileSync(page, 'utf8');
  const visible = text.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  if (/\bF\d{3,}\b/.test(visible)) problems.push(`${rel}: fact code in the page text`);
  if (/<!--/.test(text)) problems.push(`${rel}: HTML comment left in the page`);
  if (/\{\{|\}\}/.test(visible)) problems.push(`${rel}: {{marker}} left in the page`);
  if (/<[^>]+\son[a-z]+=/i.test(text)) problems.push(`${rel}: inline event handler`);
  if (rel !== '404.html' && !/<html lang="[a-z]{2}" dir="(ltr|rtl)"/.test(text)) problems.push(`${rel}: <html> needs lang and dir`);
  const title = text.match(/<title>([\s\S]*?)<\/title>/);
  if (!title) problems.push(`${rel}: no title`);
  else if (decode(title[1]).length > 70) problems.push(`${rel}: title over 70 characters`);
  if (!/<meta name="description" content="[^"]{10,}"/.test(text)) problems.push(`${rel}: no description`);
  if (/href="#main"/.test(text) && !/id="main"/.test(text)) problems.push(`${rel}: skip link has no target`);
  if (/VIDEO_ID/.test(text)) warnings.push(`${rel}: placeholder VIDEO_ID (set episode.video in site.config.json)`);
  for (const [, url] of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(url)) continue;
    if (!exists(page, decode(url))) problems.push(`${rel}: broken link ${url}`);
  }
}

warnings.slice(0, 5).forEach((w) => console.log(`warning: ${w}`));
if (warnings.length > 5) console.log(`warning: ...and ${warnings.length - 5} more`);
problems.forEach((p) => console.log(p));
console.log(`${pages.length} pages checked, ${problems.length} problem(s).`);
process.exit(problems.length ? 1 : 0);
