# Audit: Life on Replay (stage 8, 2026-11-13)

## Automatic checks

- `npm run check`: 183 facts, 12 chapters, 34 pages, 0 problems. No used fact is still marked `check` or `disputed`.
- `html-validate@8.24.1`: valid.

## Manual checklist

- [x] **Outside sources:** each of the 22 DOIs was looked up and leads to the cited paper (authors, year and title match). The Gottman Institute page and the abdurrahman.org page both exist and say what the site says. The Gottman page gives 69% of couple conflict as perpetual; the abdurrahman.org page gives 90 places for patience, after Imam Ahmad.
- [x] **Facts marked `check`:** all resolved in `research/facts.yml`.
  - F014: Sahih Muslim 2999, narrated by Suhayb. The site names no narrator.
  - F055, F056: the site gives no figures for Job's illness or Jacob's separation, because sources differ.
  - F060: the guest blends Qur'an 17:11 and 21:37. The English paraphrase fits both; the Arabic site does not quote a verse.
  - F062: Musnad Ahmad, from Ubada ibn al-Samit, graded *hasan li-ghayrihi* by al-Albani (Sahih al-Targhib 1307). The text now says "in his telling", because the hadith's setting differs a little from his version.
  - F091, F093, F094, F133: marked `opinion`. Each is presented as his view and set against research in "The idea, explained".
- [x] **Names:** the three names marked `check: true` in `names.yml` (al-Mulabbab, Dhu Fa'ish, Carl Jung) are not used anywhere on the site.
- [x] **Timestamps:** all 14 timestamp links match the episode's own chapter markers in `research/chapter-times.yml`.
- [x] **Accessibility:**
  - Every page has a working skip link.
  - Every button, link and field has a name.
  - Every figure is labelled or hidden from screen readers.
  - Focus is visible on each keyboard stop.
  - Text contrast in light mode, against the wool background:

    | Text | Contrast |
    | --- | --- |
    | Ink | 13.8:1 |
    | Secondary text | 7.6:1 |
    | Muted text | 5.7:1 |
    | Madder | 5.7:1 |
    | White on madder | 6.5:1 |

  - Text contrast in dark mode:

    | Text | Contrast |
    | --- | --- |
    | Ink | 14.8:1 |
    | Muted text | 6.2:1 |
    | Madder | 6.8:1 |

  - **Fixed:** chapter numbers on the home cards used decorative amber at 2.1:1. They now use a darker amber at 4.9:1.
- [x] **Phone (375 px):** none of the 34 pages scrolls sideways, in light or dark. The study tools were tested separately in stage 6.
- [x] **Speed and privacy:**
  - Pages make no outside requests: fonts are self-hosted and preloaded per language.
  - Cloudflare Web Analytics is the only planned outside script, and `_headers` already allows it.
  - The share images are about 170 KB each.
- [x] **Disclaimer and credit:** the footer of every page names the Petroly podcast and Mukhtalif radio and says the site is independent.
- [x] **Chapters menu:** the first item was hidden under the header band. Fixed in PR 6.
- [ ] **Share preview:** the tags are correct (`og:image`, title, description and locale per language, at the live address). What's left is to paste one English and one Arabic chapter link into WhatsApp or X after deploy. This needs the owner.
