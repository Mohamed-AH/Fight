# Podcast to website: the playbook

How to turn one podcast episode into a bilingual (English and Arabic) study website, published free on Cloudflare Pages.

It is distilled from two finished projects and was then run end to end on a third:

| | **imamabdulaziz.com** ([`benchai`](https://github.com/Mohamed-AH/benchai)) | **claiming-ideas.pages.dev** ([`research`](https://github.com/Mohamed-AH/research)) | **lifeonreplay.pages.dev** ([`Fight`](https://github.com/Mohamed-AH/Fight)) |
|---|---|---|---|
| Episode | Fnjan (Thmanyah), Dr. Talal Al-Tarifi, 3:13:57 | Salman Butt on research and business value, 1:15:47 | Petroly podcast, Dr. Saad Al-Arifi on life's crises, 1:46:51 |
| Shape | **Story**: 14 chapters in date order | **Ideas**: 8 chapters, each pinned to a video timestamp | **Ideas**: 12 chapters from 17 episode markers |
| Took | About 12 days, 11 pull requests | One day, 4 pull requests | About 8 hours over one evening and night, 7 pull requests, first run of this playbook |
| Best at | Accuracy: every paragraph traces to an exact quote; checks run on every PR | Speed and teaching: clear order of work, "The idea, explained" and "Try it" in every chapter | Both at once: 183 facts checked on every PR, a Try it in most chapters, a printable crisis kit |
| Signature tool | 3D maps with a year slider | One interactive figure per chapter (forecast playground, calculators) | "My crisis kit": a personal, printable plan that saves in the browser |

This playbook keeps the fast, clear order of Claiming Ideas and the fact base and automatic checks of King Abdulaziz. The starter in this repository (`build.mjs`, `scripts/`, `research/`, `site/`) is the reusable part: a new project copies it and starts at stage 1.

**Starting a new episode:** create the new repository from this one (it is easiest if `Mohamed-AH/Fight` is marked as a template repository on GitHub), then follow "Reset the starter" in stage 0. Everything you need to say to Claude is in the prompts below; the short version is "Follow PLAYBOOK.md for this episode, starting at stage 1", with the episode link and transcript attached.

**Why we do this:** more publicity for the ideas in the episode, a form the audience can digest at their own pace, and a deep learning experience for us while building it.

---

## How to use this playbook

- Work in a Claude project with the new repository attached. One thread per project; one pull request per stage group, so each review is small.
- Each stage below has: **purpose**, **inputs**, **steps**, a **prompt** to paste, and **done when**.
- Two owner approvals gate the work: the **outline** (end of stage 2) and the **English text** (end of stage 4). Nothing is translated or designed before these.
- Keep `main` always buildable. Cloudflare Pages publishes every push to `main`.
- Connect Cloudflare Pages **early** (right after PR 1). Every pull request then gets its own preview address (`<branch>.<project>.pages.dev`), so the owner reviews the real site on their phone instead of screenshots.
- If a pull request is opened on top of another that is not merged yet, merge them in order and point the later one's base at `main` before merging it.

| Stage | Output | Pull request |
|---|---|---|
| 0. Set up | Repository from the starter | PR 1 |
| 1. Transcript | `research/transcripts/S1.txt`, `sources.yml`, `skipped.md` | PR 2 |
| 2. Plan | `docs/outline.md`, approved by the owner | PR 2 (approved in the thread) |
| 3. Fact base | `research/facts.yml`, `names.yml` | PR 2 |
| 4. Content | English chapters, approved by the owner | PR 2 |
| 5. Explain concepts | "The idea, explained", glossary, sources page, then Arabic | PR 3 |
| 6. Interactive tools | Signature tool and "Try it" widgets | PR 4 |
| 7. Design | `docs/design-brief.md`, then the look | PR 5 |
| 8. Audit | Checks green, manual audit fixes, `docs/audit.md` | PR 6 and up (one per fix the owner reports) |
| 9. Publish | Cloudflare Pages, analytics, optional domain | (settings) |

Life on Replay kept tools and design in separate pull requests (PR 4 and PR 5). Both are big; reviewing them apart was easier than together.

---

## Stage 0. Set up the repository

**Purpose:** start every project from the same tested base.

**Steps**
1. Create an empty GitHub repository and attach it to the Claude project.
2. Copy the starter: `build.mjs`, `package.json`, `.nvmrc`, `.gitignore`, `.htmlvalidate.json`, `site.config.json`, `site/`, `scripts/`, `research/`, `docs/templates/`, `.github/workflows/checks.yml`, `PLAYBOOK.md`.
3. Leave `content/` with only the placeholder home, glossary and sources pages.
4. **Reset the starter** when copying from a finished site: delete `content/{en,ar}/*` except the placeholders, empty `research/facts.yml`, `names.yml`, `skipped.md` and `transcripts/`, clear `chapter-times.yml`, remove the old episode's widgets from `widgets.js` (keep `self-check` and the helpers), and remove old `docs/outline.md`, `design-brief.md` and `audit.md`. Keep the previous site's `style.css` and fonts until stage 7 so the site stays buildable.
5. Run `npm install && npm run check`. It must pass before anything else.

**Done when:** the pull request is merged and the Checks workflow is green on `main`.

---

## Stage 1. Transcript

**Purpose:** a clean, timestamped text that every later claim can point back to.

**Inputs:** the episode link; a transcript (YouTube "Show transcript" copy, an `.srt`/`.vtt` file, or a translation such as Thmanyah's English captions).

**Steps**
1. Save the file exactly as received as `research/transcripts/S1-original.txt`.
2. Clean it: `node scripts/clean-transcript.mjs research/transcripts/S1-original.txt > research/transcripts/S1.txt`. Result: one `[h:mm:ss] text` line per caption, chapter markers kept as `## …` lines. If the transcript has no timestamps but has `### Chapter N` markers, each line is numbered `[NN.LLL]` (chapter.line) instead, and facts cite `S1@07.024`; ask for the video's chapter times so the site can still link to each chapter's moment.
   Write each chapter's start time in `research/chapter-times.yml` (from the video description, or from the owner).
3. Fill in `research/sources.yml` for S1: title (original and English), publisher, host, guest and their role, URL, date, language, length, and where the transcript came from (who translated it).
4. Read the whole transcript once. In `research/skipped.md`, list what will not be used, with timestamps: trailer, sponsor reads, app promotion, off-topic stretches, closing chat.
5. Set `episode.video` and `episode.length` in `site.config.json`.

**Prompt**
> The transcript for this project is attached. Save it unchanged as `research/transcripts/S1-original.txt`, clean it with `scripts/clean-transcript.mjs` into `S1.txt`, fill in `research/sources.yml` for S1, and list the parts we should skip in `research/skipped.md` with timestamps and reasons. Then summarise the episode for me in ten bullet points with timestamps.

**Done when:** `S1.txt` has no lines without a timestamp (other than `##` markers), the source entry is complete, and the skipped list is written.

---

## Stage 2. Plan

**Purpose:** decide what the site is before writing a word of it.

**Steps**
1. Choose the **shape**:
   - **Story** (like King Abdulaziz): events in time order. Chapters follow periods; `period:` dates under each title; a timeline or map as the signature tool.
   - **Ideas** (like Claiming Ideas): a conversation that develops concepts. Chapters follow the episode's own sections; `starts:` timestamp on each; each chapter has "From the episode", "The idea, explained", "Try it", "Key terms".
2. Split the episode into **6 to 14 chapters**. Use the episode's own chapter markers if it has them (Claiming Ideas grouped 17 markers into 8 chapters). Each chapter gets a title, a start timestamp, and one sentence on what the reader will learn.
3. Choose **one signature interactive tool** for the whole site (a map, a timeline, a simulator) and, for ideas-shaped sites, one small "Try it" per chapter.
4. Choose the **site name in both languages** (a phrase from the episode works well: "Claiming Ideas · حجز خانات فكرية"), the tagline, and the address (`name.pages.dev` first; a custom domain later).
5. List the **outside sources** needed to confirm or add context (official pages, papers, profiles).
6. Write it all in `docs/outline.md` (template in `docs/templates/outline.md`) and send it to the owner.

**Prompt**
> Read `research/transcripts/S1.txt` and `research/skipped.md`. Propose an outline in `docs/outline.md`: the site's shape (story or ideas) and why, the site name and tagline in English and Arabic, 6 to 14 chapters with start timestamps and one line each on what the reader learns, one signature interactive tool, a "Try it" idea per chapter if it is an ideas site, and the outside sources we will need. Do not write chapters yet.

**Done when:** the owner has approved the outline (in words, in the thread).

---

## Stage 3. Fact base

**Purpose:** make every sentence on the site checkable. This is what made the King Abdulaziz site trustworthy.

**Steps**
1. For each chapter in the outline, add one entry per claim to `research/facts.yml`: id (F001…), chapter, the claim in one English sentence, `source: "S1@h:mm:ss"`, an exact **quote** from the transcript at that line, and a **status**:
   - `from-source` stated in the episode, not yet checked elsewhere
   - `check` unclear translation, name, date or number
   - `disputed` the speaker or sources disagree (explain in `note`)
   - `opinion` the speaker's view; the site must present it as their view
   - `verified` confirmed by a second source (name it in `note`)
2. Add every person, place and key term to `research/names.yml` with both spellings. Mark `check: true` where the Arabic was reconstructed from a translation.
3. Run `npm run check:facts`. Every quote must be found at its timestamp.

**Prompt**
> Build `research/facts.yml` from the approved outline: one entry per claim we will make, with an exact quote from `S1.txt` at its timestamp and an honest status. Add names and terms to `research/names.yml` in both languages, marking uncertain spellings. Run `npm run check:facts` until it passes.

**Done when:** `check:facts` passes and every outline chapter has its facts.

---

## Stage 4. Content (English first)

**Purpose:** write the chapters once, in the source-of-truth language, and get them approved before translating.

**Steps**
1. Copy `docs/templates/chapter.md` to `content/en/NN-slug.md` for each chapter (`01-…`, `02-…`). Front matter: `chapter`, `title`, `description` (under 160 characters), and `starts` (ideas) or `period` (story).
2. Write each chapter:
   - an opening quote with its timestamp link;
   - **From the episode**: the points in order, each with a timestamp link `([12:34](https://www.youtube.com/watch?v=ID&t=754s))` and its fact codes `<!-- F012 F013 -->` at the end;
   - for story sites, narrative sections under `##` headings, every paragraph ending with its fact codes.
3. Write the home page (`00-home.md`): the episode's argument in one paragraph, how to use the site, `{{chapters}}`, and about the guest.
4. Style rules: plain words, short sentences, name the guest sparingly, attribute opinions ("in his view"), never state more than the source does, and keep numbers exactly as said.
5. **Claims about health, psychology, money or religion** need extra care. Where the guest gives advice as fact (for example "stress causes illness"), mark the fact `opinion`, word it as the guest's view, and add the research picture in "The idea, explained" with a source. Verify every Qur'an verse and hadith against a primary reference (sura:verse; collection and number, with the grading) and put the reference in the fact's `note`.
6. Run `npm run check` and send the English to the owner.

**Prompt**
> Write the English chapters in `content/en/` from `docs/templates/chapter.md`, following the approved outline and citing `research/facts.yml` with `<!-- F… -->` codes on every paragraph and bullet. Link each point to its moment in the video. Write the home page. Run `npm run check` until it passes, then give me the list of facts still marked `check` or `disputed` that the text uses.

**Done when:** checks pass and the owner has approved the English.

---

## Stage 5. Explain the concepts, then translate

**Purpose:** turn "what was said" into "what it means", then mirror everything in Arabic.

**Steps**
1. In each chapter add **The idea, explained** (marked `<!-- explained -->` under the heading): the general concept behind the story, an analogy, a comparison table where it helps, and outside sources linked inline. This is where the reader learns more than the episode alone gives.
2. Add **Key terms** to each chapter and build `glossary.md`: term, Arabic, meaning, chapter number.
3. Fill `sources.md`: the episode (with how quotes were translated or condensed), every outside source and where it is used, and the disclaimer ("an independent study aid, not affiliated with…").
4. Write the **Arabic** in `content/ar/` with the same file names and the same fact codes. Use the Arabic spellings from `names.yml`. Write natural Arabic, not a word-for-word translation; keep numbers, dates and quotes exact. When the episode is in Arabic, quote the guest's **own words** from the transcript (lightly tidied, never re-translated from our English), and give Qur'an verses in their exact text. Fill the Arabic strings in `site.config.json`.
5. Latin citations inside Arabic text (paper titles, DOIs, author names in brackets) get scrambled by the right-to-left algorithm. `build.mjs` marks such links `dir="ltr"`; check a few on the Arabic sources page anyway.
6. Run `npm run check`. `check:chapters` fails if the two languages cite different facts in any chapter.

**Prompt**
> Add "The idea, explained" and "Key terms" to every English chapter, with outside sources linked inline, and fill the glossary and sources pages. Then write the Arabic versions of every page in `content/ar/` with the same fact codes, using the spellings in `research/names.yml`. Run `npm run check` until it passes.

**Done when:** checks pass in both languages and an Arabic reader has skimmed every page.

---

## Stage 6. Interactive study tools

**Purpose:** let the reader *do* something with the idea, not only read it.

**Menu** (pick one signature tool, then small ones where they genuinely help):

| Tool | Fits | Example |
|---|---|---|
| Map with a time slider | Story sites with places | King Abdulaziz unification map |
| Timeline | Story sites, or any episode with dated events | King Abdulaziz timeline page |
| Simulator or playground | A process or a number that changes | Claiming Ideas forecast playground |
| Calculator | A formula the reader can apply to their own case | Reorder point, patience curve |
| Step-through diagram | A pipeline or procedure | Paper-to-patent seven steps |
| Self-check | Any chapter | `self-check` widget in the starter |

**Rules for every widget** (in `site/assets/widgets.js`, placed with `<div class="widget" data-widget="name"></div>`):
- vanilla JavaScript, no outside libraries unless trimmed and self-hosted (King Abdulaziz trimmed three.js to what the maps use);
- all text in both languages inside `widgets.js`; works right-to-left;
- usable on a phone and by keyboard; redraws when the theme changes;
- the page still makes sense if the widget fails (a still image or a sentence of text);
- numbers in a widget that come from the episode must match `facts.yml`; made-up data is labelled "illustrative";
- colours only from the CSS variables, so the widget follows the theme and the stage 7 restyle without changes;
- anything saved goes in `localStorage` under one versioned key (`<site>:<tool>:v1`), wrapped in `try`/`catch`, and the tool works when storage is blocked;
- do not number figures inside a widget: `site.js` numbers them ("Fig. 4.1"), and skips tools that are a page of their own;
- test in a real browser over `http://` (for example `python3 -m http.server` in `dist/`), not by opening the file; fonts and storage behave differently under `file://`. A short Playwright script that opens every page in both languages and themes at 375 px and fails on console errors or sideways scrolling catches most problems.

**A page of its own:** if the signature tool needs a whole page (like "My crisis kit" on Life on Replay), add it as `content/{en,ar}/<slug>.md`, list the slug in `pages` in `site.config.json`, and give it a label of the same name under `ui.<lang>`. It then joins the menu, the footer and the page sequence after the last chapter. A tool that reads its items from a Markdown list inside its `<div>` keeps all its text in the content files, and the list is the fallback if the script fails.

**Prompt**
> Build the signature tool and the "Try it" widgets from the outline in `site/assets/widgets.js`, following the widget rules in PLAYBOOK.md stage 6. Test each in English and Arabic, light and dark, on a phone-sized screen.

**Done when:** every widget works in both languages and both themes at 375 px wide, and checks pass.

---

## Stage 7. Design

**Purpose:** a look that belongs to this episode, not a generic template.

**Steps**
1. Write `docs/design-brief.md` first (template in `docs/templates/design-brief.md`). It holds the owner's standing rules and a concept tied to the episode's world: Claiming Ideas was "the lab notebook meets the Hejaz"; King Abdulaziz was "Najdi adobe and ink".
2. Owner's standing rules (from both projects):
   - **Typography:** distinctive fonts, never Inter, Roboto, Arial, system fonts or Space Grotesk. An Arabic pairing with real character. Self-host every font in `site/assets/fonts/` (Latin, Latin Extended and Arabic subsets) so pages make no requests to Google.
   - **Colour:** one committed palette in CSS variables, dominant colours with sharp accents, a real dark mode. No purple gradients on white.
   - **Motion:** CSS-first; one orchestrated page-load with staggered reveals rather than scattered effects.
   - **Backgrounds:** atmosphere and depth (layered gradients, a pattern from the episode's culture), not flat colour.
   - **Layout:** no cookie-cutter components.
3. Replace the palette, fonts and motif in `site/assets/style.css` and `fonts.css`. Set `themeColor` in `site.config.json`.
4. Make the share images `site/assets/og-en.png` and `og-ar.png` (1200 × 630) and the favicon.
5. Check Arabic: no letter-spacing or uppercase on Arabic text, correct right-to-left mirroring of arrows and layout.
6. Check what the new decoration does to old parts: dropdown menus must sit above decorative bands (`z-index`), the header and bottom bar must use solid colours (not see-through with blur), animations and reveal effects must be switched off in print, and accent colours used for **text** need their own darker token (for example `--amber-text`) to reach 4.5:1 contrast, while the bright accent stays for lines and fills.

**Prompt**
> Read `docs/templates/design-brief.md` and the episode outline, and write `docs/design-brief.md` with a concept for this episode. After I approve it, restyle `site/assets/style.css` and the fonts to match, make the two share images, and show me screenshots of the home page and one chapter in both languages, light and dark, on desktop and phone.

**Done when:** the owner likes the screenshots.

---

## Stage 8. Audit

**Purpose:** catch what the writers and designers missed. Both projects had a dedicated audit pass.

**Automatic** (runs on every pull request in `.github/workflows/checks.yml`):
- the site builds;
- `check:facts` every quote is in the transcript at its timestamp;
- `check:chapters` every paragraph cites a fact or a source, both languages cite the same facts, chapters do not name the guest, and a list of used facts still marked `check` or `disputed`;
- `check:style` no stock machine-writing phrases, no dashes as punctuation, no leftover scaffolding;
- `check:site` links and files exist, titles under 70 characters, descriptions present, no fact codes or comments leaked, `lang` and `dir` set;
- `html-validate` the HTML is valid.

**Manual checklist**
- [ ] Every used fact marked `check` or `disputed` is either resolved or worded as uncertain.
- [ ] English and Arabic say the same thing on every page (spot-read three chapters side by side).
- [ ] Names match `names.yml`; every `check: true` name is confirmed or avoided.
- [ ] Every timestamp link opens the video at the right moment (spot-check five).
- [ ] Accessibility: skip link works, keyboard reaches everything, focus is visible, contrast at least 4.5:1 for text, images and figures have text alternatives.
- [ ] Phone (375 px): no sideways scrolling, menu and bottom bar work, tables scroll inside their box.
- [ ] Speed: fonts preloaded, no outside requests other than Cloudflare Web Analytics, images compressed.
- [ ] Sharing: paste a chapter link into WhatsApp or X and check the preview in both languages.
- [ ] The disclaimer and podcast credit are on every page.
- [ ] Every DOI and outside link opens the right work. (Where `doi.org` and Crossref are blocked, confirm each by searching its title.)
- [ ] **Guest named sparingly:** the guest is introduced on the home and sources pages only; chapters attribute quotes by timestamp. `check:chapters` enforces this with `guest` in `site.config.json`.
- [ ] **Plain writing:** `check:style` passes (no stock phrases, dashes or leftover scaffolding), then read three chapters aloud in each language and cut anything that sounds like a template: clever "X, not Y" headings, padded lists of three, lines that restate the previous one.
- [ ] Print the signature tool page if it is meant to be printed.
- [ ] Open the menus on a phone over the live site and check nothing is hidden under the header.
- [ ] **Older phones:** open the live site on an old iPhone (an iPhone 7 runs at most iOS 15) or a friend's old Android. Fixed and sticky bars must be solid: older Safari drops `color-mix()` and blur, and the page shows through. Give every bar a solid background, and treat newer CSS (`color-mix`, `:has`, nesting) as an extra over a working fallback.

Write the results in `docs/audit.md`, so the next project can see what was checked.

**Prompt**
> Audit the site against the stage 8 checklist in PLAYBOOK.md. Fix what you can, and list for me anything that needs my decision.

**Done when:** checks are green and the checklist is ticked.

---

## Stage 9. Publish

**Purpose:** put it online, free, rebuilding on every push.

**Steps**
1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick the repository.
2. Build settings:

   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | from `.nvmrc` (set `NODE_VERSION` if Cloudflare ignores it) |

3. Turn on **Web Analytics** in the Pages project (cookie-free; `_headers` already allows it).
4. Set `url` in `site.config.json` to the final address and push. Cloudflare may not give you the name you planned (this repository is `Fight`, the site became `lifeonreplay.pages.dev`), so set it after the project exists; the share images and canonical links depend on it.
5. Optional, later:
   - **Custom domain**: add it in the Pages project, then use Bulk Redirects so `name.pages.dev` and `www` point to it (as King Abdulaziz does).
   - **Contact form**: a Pages Function plus a Worker with Turnstile and Email Routing (see the King Abdulaziz README for the recipe).
6. Share: post the link with the share image, credit the podcast, and send it to the guest and the programme.

**Done when:** the site is live, analytics shows visits, and the link preview looks right.

---

## What we learned (keep doing / avoid)

- **Keep:** English first, Arabic after approval. Translating unapproved text doubles every correction.
- **Keep:** fact codes on every paragraph from the start. Adding them afterwards (as King Abdulaziz did) is slow; Claiming Ideas skipped them and relied on timestamps only.
- **Keep:** one pull request per stage group, with the build and checks running on each.
- **Keep:** a written design brief before styling. It is what made both sites look designed for their subject.
- **Avoid:** heavy libraries for the signature tool unless trimmed and self-hosted, with a still-image fallback.
- **Avoid:** inline `onclick` and outside fonts or scripts; the security policy in `site/_headers` blocks them.
- **Avoid:** naming the guest in every sentence (Claiming Ideas renamed and cut mentions in its second PR). Life on Replay still named him in every chapter's opening quote until the owner noticed; it is now a check.
- **Keep:** the owner reviewing on the preview address on their phone. The one real bug the owner found on Life on Replay (chapter 1 hidden under the band in the menu) came from looking at the live site on a phone, not from any check.
- **Keep:** a configurable `pages` list in `site.config.json` for pages after the chapters, instead of editing `build.mjs` per project.
- **Keep:** a transcript without timestamps is fine. Number the lines by chapter (`[07.024]`) and take chapter times from the video description.
- **Avoid:** letting a comment, review or outside opinion change the content without the owner saying so. Bring it to the owner and follow their decision.
- **Avoid:** guessing at religious references. Each verse and hadith is checked and cited, or left as the guest's paraphrase.
