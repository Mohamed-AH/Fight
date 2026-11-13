// Static site builder: content/{en,ar}/*.md -> dist/{en,ar}/*.html
// Project settings (names, video, address, colours) come from site.config.json.
// Started from the Claiming Ideas build (github.com/Mohamed-AH/research).
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'dist');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const LANGS = CONFIG.languages;
const UI = CONFIG.ui;
const EXTRA = CONFIG.pages || ['glossary', 'sources'];
const VIDEO = CONFIG.episode.video;
const SITE = CONFIG.url.replace(/\/$/, '');
const VIDEO_ID = (VIDEO.match(/[?&]v=([\w-]+)/) || [])[1] || '';
const urlFor = (lang, slug) => `${SITE}/${lang}/${slug === '00-home' ? '' : slug}`; // Cloudflare Pages serves pages without .html

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugFor = (file) => file.replace(/\.md$/, '');
const hrefFor = (slug) => (slug === '00-home' ? 'index.html' : `${slug}.html`);
const secs = (t) => String(t).split(':').map(Number).reduce((a, b) => a * 60 + b, 0);
const otherLang = (lang) => LANGS.find((l) => l !== lang) || lang;

// a short plain-text summary for search results and link previews
function summarise(html) {
  const m = html.replace(/<blockquote>[\s\S]*?<\/blockquote>/g, '').match(/<p>([\s\S]*?)<\/p>/);
  if (!m) return '';
  let t = m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  if (t.length > 160) t = t.slice(0, 157).replace(/[\s,،.؛:]+[^\s]*$/, '') + '…';
  return t;
}

// Fact codes such as <!-- F012 F013 --> tie a paragraph to research/facts.yml.
// They are for the checks only and never reach the published page.
const stripFacts = (md) => md.replace(/[ \t]*<!--\s*(?:F\d{3,}\s*)+-->/g, '');

function renderMarkdown(md, lang) {
  let html = marked.parse(stripFacts(md), { gfm: true });
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // internal links: foo.md -> foo.html, 00-home.md -> index.html
  html = html.replace(/href="([0-9a-z-]+)\.md(#[^"]*)?"/g, (_, s, h) => `href="${hrefFor(s)}${h || ''}"`);
  // links to a moment in the episode become timestamp chips
  if (VIDEO_ID) {
    const re = new RegExp(`<a href="(https://www\\.youtube\\.com/watch\\?v=${VIDEO_ID}(?:&amp;|&)t=\\d+s)">([^<]+)</a>`, 'g');
    html = html.replace(re, (_, href, text) => `<a class="ts" href="${href}" target="_blank" rel="noopener"><span aria-hidden="true">▶</span>${text}</a>`);
    html = html.replace(/\((<a class="ts"[^>]*>.*?<\/a>)\)/g, (_, a) => `<span class="tsw">(${a})</span>`);
  }
  // other external links open in a new tab
  html = html.replace(/<a href="(https?:\/\/[^"]+)">/g, '<a href="$1" target="_blank" rel="noopener">');
  // in right-to-left pages, a link whose text is Latin (a citation) is isolated as left-to-right,
  // so its brackets and commas stay in order inside the Arabic sentence
  if (UI[lang].dir === 'rtl') html = html.replace(/<a (href="[^"]*"[^>]*)>(?=[A-Za-z])/g, '<a dir="ltr" $1>');
  // tables scroll sideways on phones
  let tableN = 0; // each scrollable table gets a unique accessible name: "Table 1", "Table 2"
  html = html.replace(/<table>/g, () => `<section class="table-wrap" tabindex="0" aria-label="${UI[lang].table} ${++tableN}"><table>`).replace(/<\/table>/g, '</table></section>');
  // header cells say which way they apply
  html = html.replace(/<th>/g, '<th scope="col">').replace(/<th align=/g, '<th scope="col" align=');
  return html;
}

function load(lang) {
  const dir = path.join(ROOT, 'content', lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort().map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    return { file, slug: slugFor(file), data, content };
  });
}

const ICON = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/></svg>',
  prev: '<svg class="dir" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg>',
  next: '<svg class="dir" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

const chaptersOf = (pages) => pages.filter((p) => p.data.chapter).sort((a, b) => a.data.chapter - b.data.chapter);
const num = (n) => String(n).padStart(2, '0');

function sequence(pages) {
  return ['00-home', ...chaptersOf(pages).map((p) => p.slug), ...EXTRA].filter((s) => pages.some((p) => p.slug === s));
}

function extras(lang, pages, cur) {
  const u = UI[lang];
  return EXTRA.map((s) => [s, u[s]])
    .filter(([s]) => pages.some((p) => p.slug === s))
    .map(([s, label]) => `<li class="extra"><a href="${hrefFor(s)}"${cur(s)}>${esc(label)}</a></li>`).join('');
}

function nav(lang, pages, current) {
  const u = UI[lang];
  const cur = (s) => (s === current ? ' aria-current="page"' : '');
  const items = chaptersOf(pages).map((p) => `<li><a href="${hrefFor(p.slug)}"${cur(p.slug)}><span class="n">${num(p.data.chapter)}</span>${esc(p.data.title)}</a></li>`).join('');
  return `<details class="toc"><summary>${u.chapters}</summary><ol>${items}${extras(lang, pages, cur)}</ol></details>`;
}

function drawer(lang, pages, current, otherHref) {
  const u = UI[lang];
  const ol = otherLang(lang);
  const cur = (s) => (s === current ? ' aria-current="page"' : '');
  const items = chaptersOf(pages).map((p) => `<li><a href="${hrefFor(p.slug)}"${cur(p.slug)}><span class="n">${num(p.data.chapter)}</span>${esc(p.data.title)}</a></li>`).join('');
  return `<dialog class="drawer" aria-labelledby="drawer-title">
  <div class="drawer-head">
    <span class="drawer-title" id="drawer-title">${esc(u.site)}</span>
    <button class="icon-btn drawer-close" type="button" aria-label="${u.close}">${ICON.close}</button>
  </div>
  <nav aria-label="${u.menu}">
    <a class="drawer-home" href="index.html"${cur('00-home')}>${ICON.home}<span>${u.home}</span></a>
    <p class="drawer-label">${u.chapters}</p>
    <ol>${items}</ol>
    <ul class="drawer-extra">${extras(lang, pages, cur)}</ul>
  </nav>
  <div class="drawer-foot">
    ${ol !== lang ? `<a class="lang" href="${otherHref}" hreflang="${ol}" lang="${ol}">${u.other}</a>` : ''}
    <button class="theme" type="button" aria-label="${u.theme}" title="${u.theme}"><span aria-hidden="true"></span></button>
  </div>
</dialog>`;
}

function bottomNav(lang, pages, current) {
  const u = UI[lang];
  const seq = sequence(pages);
  const i = seq.indexOf(current);
  const prev = i > 0 ? seq[i - 1] : null;
  const next = i >= 0 && i < seq.length - 1 ? seq[i + 1] : null;
  const link = (s, icon, label, cls) => (s
    ? `<a class="bn ${cls}" href="${hrefFor(s)}">${icon}<span>${label}</span></a>`
    : `<span class="bn ${cls}" aria-disabled="true">${icon}<span>${label}</span></span>`);
  return `<nav class="bottom-nav" aria-label="${u.mainNav}">
  <a class="bn" href="index.html"${current === '00-home' ? ' aria-current="page"' : ''}>${ICON.home}<span>${u.home}</span></a>
  ${link(prev, ICON.prev, u.prev, 'prev')}
  <button class="bn open-menu" type="button" aria-haspopup="dialog">${ICON.menu}<span>${u.chapters}</span></button>
  ${link(next, ICON.next, u.next, 'next')}
</nav>`;
}

function layout({ lang, title, body, slug, pages, description, bodyClass = '' }) {
  const u = UI[lang];
  const ol = otherLang(lang);
  const otherExists = ol !== lang && fs.existsSync(path.join(ROOT, 'content', ol, `${slug}.md`));
  const otherHref = otherExists ? `../${ol}/${hrefFor(slug)}` : `../${ol}/index.html`;
  const isHome = slug === '00-home';
  const fullTitle = isHome ? u.site : `${title} · ${u.site}`;
  const og = fs.existsSync(path.join(ROOT, 'site', 'assets', `og-${lang}.png`)) ? `${SITE}/assets/og-${lang}.png` : '';
  const preload = (CONFIG.fonts && CONFIG.fonts.preload && CONFIG.fonts.preload[lang]) || '';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${u.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || u.tagline)}">
<meta name="theme-color" content="${esc(CONFIG.themeColor)}">
<link rel="canonical" href="${urlFor(lang, slug)}">
<link rel="alternate" hreflang="${lang}" href="${urlFor(lang, slug)}">
${otherExists ? `<link rel="alternate" hreflang="${ol}" href="${urlFor(ol, slug)}">` : ''}
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:site_name" content="${esc(u.site)}">
<meta property="og:title" content="${esc(isHome ? u.site : title)}">
<meta property="og:description" content="${esc(description || u.tagline)}">
<meta property="og:url" content="${urlFor(lang, slug)}">
<meta property="og:locale" content="${u.locale}">
${og ? `<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(u.site)}: ${esc(u.tagline)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
${preload ? `<link rel="preload" href="../assets/fonts/${preload}.woff2" as="font" type="font/woff2" crossorigin>` : ''}
<link rel="stylesheet" href="../assets/fonts.css">
<link rel="stylesheet" href="../assets/style.css">
<script src="../assets/theme.js"></script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">${u.skip}</a>
<header class="bar">
  <a class="brand" href="index.html"><span class="mark" aria-hidden="true"></span><span>${esc(u.site)}</span></a>
  <nav class="bar-nav" aria-label="${u.topNav}">
    <a class="home-link${isHome ? ' is-here' : ''}" href="index.html"${isHome ? ' aria-current="page"' : ''}>${ICON.home}<span>${u.home}</span></a>
    ${nav(lang, pages, slug)}
    ${ol !== lang ? `<a class="lang" href="${otherHref}" hreflang="${ol}" lang="${ol}">${u.other}</a>` : ''}
    <button class="theme" type="button" aria-label="${u.theme}" title="${u.theme}"><span aria-hidden="true"></span></button>
    <button class="icon-btn open-menu" type="button" aria-haspopup="dialog" aria-label="${u.menu}">${ICON.menu}</button>
  </nav>
</header>
${drawer(lang, pages, slug, otherHref)}
<main id="main">
${body}
</main>
<footer class="foot">
  <p>${esc(u.footer)}</p>
  <p><a href="${VIDEO}" target="_blank" rel="noopener">${u.watch}</a>${EXTRA.filter((s) => pages.some((p) => p.slug === s)).map((s) => ` · <a href="${hrefFor(s)}">${esc(u[s])}</a>`).join('')}</p>
</footer>
${bottomNav(lang, pages, slug)}
<script src="../assets/site.js" defer></script>
<script src="../assets/widgets.js" defer></script>
</body>
</html>`;
}

function chapterCards(lang, pages) {
  const u = UI[lang];
  return `<ol class="cards">${chaptersOf(pages).map((p, i) => `<li class="card" style="--i:${i}"><a href="${hrefFor(p.slug)}">
      <span class="card-n">${num(p.data.chapter)}</span>
      <span class="card-t">${esc(p.data.title)}</span>
      ${p.data.starts ? `<span class="card-m">${u.inVideo} · ${esc(p.data.starts)}</span>` : ''}
    </a></li>`).join('')}</ol>`;
}

const allUrls = [];

function buildLang(lang) {
  const u = UI[lang];
  const pages = load(lang);
  if (!pages.length) return;
  const outDir = path.join(OUT, lang);
  fs.mkdirSync(outDir, { recursive: true });
  const chapters = chaptersOf(pages);

  for (const p of pages) {
    let html = renderMarkdown(p.content, lang);
    let body;
    if (p.slug === '00-home') {
      // a paragraph holding only {{chapters}} becomes the list of chapter cards
      html = html.replace(/<h1>.*?<\/h1>/s, '').replace(/<p>\{\{chapters\}\}<\/p>/, chapterCards(lang, pages));
      body = `<section class="hero">
  <div class="lattice" aria-hidden="true"></div>
  <p class="kicker">${esc(p.data.kicker || u.tagline)}</p>
  <h1>${esc(p.data.title)}</h1>
  ${p.data.subtitle ? `<p class="sub">${esc(p.data.subtitle)}</p>` : ''}
  <a class="btn" href="${VIDEO}" target="_blank" rel="noopener"><span aria-hidden="true">▶</span> ${u.watch}${CONFIG.episode.length ? ` · ${esc(CONFIG.episode.length)}` : ''}</a>
</section>
<article class="prose home reveal">${html}</article>`;
    } else if (p.data.chapter) {
      html = html.replace(/<h1>.*?<\/h1>/s, '');
      const idx = chapters.indexOf(p);
      const prev = chapters[idx - 1];
      const next = chapters[idx + 1];
      const firstExtra = EXTRA.find((s) => pages.some((x) => x.slug === s));
      body = `<section class="chapter-head">
  <div class="lattice" aria-hidden="true"></div>
  <span class="big-n" aria-hidden="true">${num(p.data.chapter)}</span>
  <p class="kicker">${u.chapter} ${p.data.chapter} / ${chapters.length}</p>
  <h1>${esc(p.data.title)}</h1>
  ${p.data.period ? `<p class="sub">${esc(p.data.period)}</p>` : ''}
  ${p.data.starts ? `<a class="ts big" href="${esc(VIDEO)}&amp;t=${secs(p.data.starts)}s" target="_blank" rel="noopener"><span aria-hidden="true">▶</span>${u.watchFrom} ${esc(p.data.starts)}</a>` : ''}
</section>
<article class="prose reveal">${html}</article>
<nav class="pager" aria-label="${u.chapters}">
  ${prev ? `<a class="prev" href="${hrefFor(prev.slug)}"><small>${u.prev}</small>${esc(prev.data.title)}</a>` : '<span></span>'}
  ${next ? `<a class="next" href="${hrefFor(next.slug)}"><small>${u.next}</small>${esc(next.data.title)}</a>`
    : (firstExtra ? `<a class="next" href="${hrefFor(firstExtra)}"><small>${u.next}</small>${esc(u[firstExtra])}</a>` : '<span></span>')}
</nav>`;
    } else {
      body = `<section class="chapter-head plain"><div class="lattice" aria-hidden="true"></div></section><article class="prose reveal">${html}</article>`;
    }
    const title = p.data.title || '';
    const description = p.data.description || summarise(html);
    allUrls.push({ lang, slug: p.slug });
    fs.writeFileSync(path.join(outDir, hrefFor(p.slug)), tidy(layout({ lang, title, body, slug: p.slug, pages, description, bodyClass: p.slug === '00-home' ? 'is-home' : '' })));
  }
}

// the root page: a language chooser that remembers the reader's choice (splash.js)
function splash() {
  const [a, b] = LANGS;
  const names = LANGS.map((l) => UI[l].site);
  const desc = LANGS.map((l) => UI[l].tagline).join(' · ');
  const og = fs.existsSync(path.join(ROOT, 'site', 'assets', `og-${a}.png`)) ? `<meta property="og:image" content="${SITE}/assets/og-${a}.png">` : '';
  return `<!DOCTYPE html>
<html lang="${a}" dir="${UI[a].dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(names.join(' · '))}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="${esc(CONFIG.themeColor)}">
<link rel="canonical" href="${SITE}/">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}/${l}/">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(names.join(' · '))}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}/">
${og}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/fonts.css">
<link rel="stylesheet" href="assets/style.css">
<script src="assets/splash.js"></script>
<script src="assets/theme.js"></script>
</head>
<body>
<main class="splash">
  <div class="lattice" aria-hidden="true"></div>
  <div class="inner">
    <h1 lang="${a}" dir="${UI[a].dir}">${esc(UI[a].site)}${b ? `<span lang="${b}" dir="${UI[b].dir}">${esc(UI[b].site)}</span>` : ''}</h1>
    <div class="choices">
      ${LANGS.map((l) => `<a href="${l}/index.html" lang="${l}">${l === 'ar' ? 'العربية' : l === 'en' ? 'English' : l}</a>`).join('\n      ')}
    </div>
  </div>
</main>
</body>
</html>
`;
}

// drop trailing spaces and the blank lines left where optional tags were skipped
const tidy = (html) => html.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n');

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f); const d = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(ROOT, 'site'), OUT);
for (const lang of LANGS) buildLang(lang);
fs.writeFileSync(path.join(OUT, 'index.html'), tidy(splash()));

// sitemap with language alternates, and robots.txt pointing to it
const today = new Date().toISOString().slice(0, 10);
const bySlug = {};
for (const { lang, slug } of allUrls) (bySlug[slug] ||= []).push(lang);
const entries = allUrls.map(({ lang, slug }) => `  <url><loc>${urlFor(lang, slug)}</loc><lastmod>${today}</lastmod>
${bySlug[slug].map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l, slug)}"/>`).join('\n')}
  </url>`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${allUrls.length} pages to ${OUT}`);
