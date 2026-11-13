# Design brief: Life on Replay · الحياة إعادة بث

## Owner's direction (standing rules for every project)

Avoid the generic "AI slop" look. Make it distinctive and designed for this context.

- **Typography:** beautiful, unusual fonts. Not Inter, Roboto, Arial, system fonts or Space Grotesk. An Arabic pairing with real character. All fonts self-hosted.
- **Colour and theme:** one committed palette held in CSS variables. Dominant colours with sharp accents, not timid even palettes. No purple gradients on white. A real dark mode.
- **Motion:** CSS-first. One well-orchestrated page load with staggered reveals instead of scattered micro-interactions.
- **Backgrounds:** atmosphere and depth. Layered gradients and a pattern from the episode's culture, not flat colour.
- **Layout:** no predictable, cookie-cutter component patterns.

## This project's concept

**"Sadu weaving meets the late-night rebroadcast."**

- **Why it fits the episode:** the guest's central image is life as a rebroadcast: the match is already decided, we are watching the replay. That gives the broadcast language: a "replay" chip on every timestamp, a programme-guide feel for the chapters, a thin progress line like a tape counter. The answer he gives to crisis is patience woven over time, thread by thread, which is Al Sadu: the Bedouin weaving of the Arabian Peninsula, in madder red, indigo-black and undyed wool, with bands of small triangles and diamonds. It is local to the host and guest, and it is a craft of patience. Night and dawn give the atmosphere: the episode keeps returning to "light at the end of the tunnel" and the good that "comes behind the event".
- **Palette:**
  - Light ("wool"): base undyed wool `#f2e8d5`, raised surface `#faf4e8`, text indigo-black `#1b1d26`, secondary `#4a4552`.
  - Accent madder red `#a3312a`, kept for timestamps and "replay" chips, the current item and primary buttons.
  - Second accent dawn amber `#d9952b`, kept for the dawn glow and for highlights in the study tools.
  - Dark ("night broadcast"): base `#121319`, surface `#1b1c25`, text wool `#efe5d1`, madder lifted to `#e2685c`, amber `#f0b354`.
- **Type:**
  - Latin display: **Gloock**, a high-contrast serif with a broadcast-title feel. Latin body: **Newsreader**. Labels, timestamps and figure numbers: **IBM Plex Mono**.
  - Arabic display: **Aref Ruqaa**, Ruq'a calligraphy with real character, used only for headings. Arabic body: **Noto Naskh Arabic**, for long reading.
- **Motif:**
  - A Sadu band (rows of small triangles and a diamond chain, drawn in CSS and SVG) runs under the header and above the footer, and divides the home page sections.
  - At low strength, the same triangles make a faint woven texture behind the chapter heads.
  - A soft dawn glow sits at the top of every page, amber at the horizon, deeper in dark mode.
- **Signature motion:** on page load the Sadu band "weaves" in from the start edge (left in English, right in Arabic), the dawn glow brightens, and the heading and opening quote rise in a stagger. Chapter cards on the home page follow one by one like a programme guide. Reduced-motion users get the end state.
- **Interactive pieces:** "My crisis kit" and the ten "Try it" tools (stage 6) take on the palette. Madder marks the reader's choice and amber marks progress.
