# Research (internal, not published on the website)

The build only publishes `content/` and `site/`, so nothing here reaches the website. If the repository is public, anyone can still read this folder on GitHub; Cloudflare Pages also works with a private repository.

| File | What it holds |
| --- | --- |
| `sources.yml` | Every source, with an id (S1, S2, ...). S1 is the episode. |
| `facts.yml` | One entry per claim the site makes, with the source timestamp and an exact quote. |
| `names.yml` | English and Arabic spellings of people, places and terms, with the ones still to check. |
| `skipped.md` | Parts of the episode deliberately left out (adverts, trailer, digressions), with timestamps. |
| `transcripts/` | `S1-original.txt` exactly as received, and `S1.txt` cleaned to one `[h:mm:ss] text` line per caption. |

## How the chapters link to the facts

Each paragraph or bullet in a chapter ends with a hidden note such as `<!-- F012 F013 -->` listing the facts it rests on. The build removes these notes, so visitors never see them. If you rewrite a paragraph, keep the note (or update it).

## Checks

- `npm run check:facts`: every quote in `facts.yml` appears in its transcript at the given timestamp (or runs on into the next line).
- `npm run check:chapters`: every fact code used in a chapter exists; every paragraph in the chapters cites a fact or links to a source; English and Arabic cite the same facts in each chapter; lists facts not used and used facts still marked `check` or `disputed`.

## Cleaning a transcript

`node scripts/clean-transcript.mjs research/transcripts/S1-original.txt > research/transcripts/S1.txt`

It understands YouTube's copied transcript (`0:022 seconds...`, `1:051 minute, 5 seconds...`), plain `0:02 text` lines, and `.srt`/`.vtt` subtitle files.

## Adding another source

1. Add it to `sources.yml` with the next id.
2. Put its transcript in `transcripts/` as `S2.txt` (cleaned format).
3. Add facts with `source: "S2@h:mm:ss"`. If it confirms an existing fact, set that fact's status to `verified` and say which source in `note`; if it contradicts one, set `disputed` and explain.
