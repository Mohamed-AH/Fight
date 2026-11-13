# Life on Replay · الحياة إعادة بث

**Live site: [lifeonreplay.pages.dev](https://lifeonreplay.pages.dev)**

A free, bilingual (English and Arabic) study companion to the Petroly podcast episode *How to Deal with Life's Crises* (Mukhtalif radio), in which Ahmed Attar talks with Dr. Saad Al-Arifi. It is an independent study aid, not affiliated with the podcast, the radio or the guest.

What the site offers:

- **12 chapters**, each opening the video at its moment, with "From the episode", "The idea, explained" (with research sources), "Try it" and key terms.
- **My crisis kit**: a personal, printable plan built from the steps in the episode, saved only in your browser.
- **10 small interactive tools** inside the chapters, plus a glossary (38 terms) and a sources page (24 sources).
- **183 facts** in a fact base. Every paragraph points to the exact line in the transcript it rests on, and checks run on every change.

This repository is also the **starter for the next episode**. [PLAYBOOK.md](PLAYBOOK.md) describes the method, stage by stage, with ready prompts.

## Make a site for another episode

1. Create a new repository from this one (mark this repository as a template in its GitHub settings to get a **Use this template** button).
2. Follow **Stage 0. Reset the starter** in [PLAYBOOK.md](PLAYBOOK.md).
3. Work through the stages: transcript, outline (you approve), fact base, English (you approve), explanations and Arabic, tools, design, audit, publish.

The playbook comes from three projects:

| Site | Repository | Shape |
| --- | --- | --- |
| [imamabdulaziz.com](https://imamabdulaziz.com) | [`benchai`](https://github.com/Mohamed-AH/benchai) | Story: 14 chapters in date order, 3D maps |
| [claiming-ideas.pages.dev](https://claiming-ideas.pages.dev) | [`research`](https://github.com/Mohamed-AH/research) | Ideas: 8 chapters, one tool per chapter |
| [lifeonreplay.pages.dev](https://lifeonreplay.pages.dev) | this one | Ideas: 12 chapters, a printable crisis kit |

## Where things are

| Path | What it holds |
| --- | --- |
| `PLAYBOOK.md` | The method: nine stages from transcript to published site, with prompts, checklists and lessons learned |
| `site.config.json` | Site name, tagline and interface words in both languages, episode link, address, theme colour, the pages after the chapters (`pages`), and the guest's name for the name check (`guest`) |
| `content/en/`, `content/ar/` | The pages as Markdown, same file names in both languages: `00-home.md`, `01-…` to `12-…`, `kit.md`, `glossary.md`, `sources.md` |
| `research/` | Internal, not published: transcript, chapter times, sources, the fact base (`facts.yml`), name spellings, parts skipped |
| `site/assets/` | Styles, self-hosted fonts, scripts, interactive tools (`widgets.js`), favicon and share images |
| `site/_headers`, `site/404.html` | Security and cache headers, and the not-found page |
| `docs/` | This project's outline, design brief and audit report; templates for the next project in `docs/templates/` |
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

A paragraph ends with a hidden note such as `<!-- F012 F013 -->` naming the facts in `research/facts.yml` it rests on. Keep it when you edit. Visitors never see it. Change English and Arabic together: both must cite the same facts.

On GitHub: open the file, click the pencil, edit, then **Commit changes**. The site rebuilds itself in about a minute.

## Build and check locally

```bash
npm install
npm run dev     # builds and serves dist/ on http://localhost:3000
npm run check   # build + all checks (the same ones GitHub runs on every pull request)
```

The checks:

| Check | What it catches |
| --- | --- |
| `check:facts` | A quote in `facts.yml` that is not in the transcript at its line |
| `check:chapters` | A paragraph with no fact or source, English and Arabic citing different facts, a chapter naming the guest |
| `check:style` | Stock machine-writing phrases, dashes used as punctuation, leftover placeholder text |
| `check:site` | Broken links or files, long titles, missing descriptions, leaked fact codes, missing `lang` or `dir` |

## Deploy (Cloudflare Pages)

The Pages project is **lifeonreplay**. It rebuilds on every push to `main`, and every pull request gets its own preview address (`<branch>.lifeonreplay.pages.dev`).

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `22` (also in `.nvmrc`) |

- Web Analytics is on (cookie-free).
- The Content-Security-Policy in `site/_headers` allows only the site's own files plus Cloudflare Web Analytics. Add any new outside host there first.
- Fonts are self-hosted, so pages make no requests to Google.
- `url` in `site.config.json` is set to `https://lifeonreplay.pages.dev`. Change it if a custom domain is added.

## Credits

The episode belongs to the Petroly podcast and Mukhtalif radio. Built with Claude Code on the work in [`Mohamed-AH/research`](https://github.com/Mohamed-AH/research) (Claiming Ideas) and [`Mohamed-AH/benchai`](https://github.com/Mohamed-AH/benchai) (King Abdulaziz: A History).
