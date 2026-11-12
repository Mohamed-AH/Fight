# fight

A bilingual (English and Arabic) study companion website built from a podcast episode, following [PLAYBOOK.md](PLAYBOOK.md).

## Where things are

| Path | What it holds |
| --- | --- |
| `PLAYBOOK.md` | The nine stages from transcript to published site, with prompts and checklists |
| `site.config.json` | Site name, tagline and interface words in both languages, the episode link, the site address, the theme colour |
| `content/en/`, `content/ar/` | The pages as Markdown. Same file name in both languages. `00-home.md`, `NN-chapter.md`, `glossary.md`, `sources.md` |
| `research/` | Internal: transcripts, sources, the fact base, name spellings, parts skipped. Not published |
| `site/` | Files copied as they are: styles, fonts, scripts, `_headers`, `404.html` |
| `docs/` | Outline and design brief for this project; templates in `docs/templates/` |
| `scripts/` | Transcript cleaner and the checks |
| `build.mjs` | Builds `content/` into `dist/` |

## Editing text

Each page is a Markdown file. The block between the `---` lines at the top holds its settings:

| Field | Meaning |
| --- | --- |
| `chapter` | Chapter number (pages without it are not chapters) |
| `title` | Title shown on the page and in the menu |
| `description` | One sentence for search results and link previews (under 160 characters) |
| `starts` | Where the chapter starts in the video, e.g. `12:34` |
| `period` | Optional dates shown under the title |

A paragraph ends with a hidden note such as `<!-- F012 F013 -->` naming the facts in `research/facts.yml` it rests on. Keep it when you edit the paragraph. Visitors never see it.

On GitHub: open the file, click the pencil, edit, then **Commit changes**. The site rebuilds itself.

## Build and check locally

```bash
npm install
npm run dev     # builds and serves dist/ on http://localhost:3000
npm run check   # build + all checks (the same ones GitHub runs on every pull request)
```

## Deploy (Cloudflare Pages)

Cloudflare Pages rebuilds on every push to `main`.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | pinned in `.nvmrc` |

- Security and cache headers live in `site/_headers`. The Content-Security-Policy allows only the site's own files plus Cloudflare Web Analytics; add any new outside host there first.
- Fonts are self-hosted in `site/assets/fonts/`, so pages make no requests to Google.
- Turn on Web Analytics in the Pages project settings.
- Set `url` in `site.config.json` to the final address.

## Credits

Built on the work in [`Mohamed-AH/research`](https://github.com/Mohamed-AH/research) (Claiming Ideas) and [`Mohamed-AH/benchai`](https://github.com/Mohamed-AH/benchai) (King Abdulaziz: A History).
