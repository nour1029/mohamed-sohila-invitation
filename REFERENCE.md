# Wedding Invitation Site — Reference Brief

Everything extracted from the reference site, plus the build decisions.
This is the single source of truth for the project. Update it as things change.

> Phased build plan: [`PLAN.md`](./PLAN.md)

- **Reference URL:** https://webgencyinvitations.com/thesacredgarden
- **Reference name:** "The Sacred Garden"
- **Analyzed:** 2026-08-12

---

## 1. What the reference actually is

Built on **Tilda** (`tildacdn.net`) — a no-code drag-and-drop builder, using **Zero Blocks**
(absolutely-positioned canvas). Relevant consequences:

- There is no reusable source code to copy. It's a visual canvas export.
- Tilda Zero Blocks scale a **fixed-width canvas**, which is why on desktop the whole
  invitation is a narrow, phone-shaped column floating in cream space with huge empty
  margins. This is a limitation, not a design choice — **we should not reproduce it.**
  Our build should be genuinely responsive: same intimate column on mobile, but a
  composed layout on desktop rather than dead space.

Scripts loaded by the reference (for reference only, we use none of these):
`tilda-zero-1.1`, `tilda-zero-scale-1.0`, `tilda-animation-2.0`, `tilda-animation-sbs-1.0`
(step-by-step scroll reveals), `tilda-forms-1.0`, `tilda-popup-1.0`, `tilda-lazyload-1.0`.

### Known inconsistencies in the reference (don't copy these)

- Stated wedding date is **27.09.26**, but the live countdown read **118 days** on
  2026-08-12 — which points to early December, not September. The template's countdown
  target and its displayed date are out of sync.
- The RSVP modal says *"Please RSVP before August 09"* — a date already in the past.

**Fix for our build:** drive the date display, the countdown target, and the RSVP
deadline from **one config object** in `js/main.js`, so they can never drift apart.

---

## 2. Design system

### Palette

| Token | Hex | Used for |
|---|---|---|
| `--cream` | `#F7EFDF` | Page background, the dominant ground |
| `--paper` | `#EFE7D6` | Torn-paper card fill (slightly darker than ground) |
| `--gold` | `#B08D3E` | All script headings, ornaments, frame borders |
| `--gold-light` | `#D4B36A` | Envelope opening light-bloom, highlights |
| `--maroon` | `#6B1220` | Wax seals, RSVP button, music button |
| `--maroon-deep` | `#4A0C16` | Seal shadow / inner depth |
| `--ink` | `#4A3F35` | Body copy (warm dark brown, never pure black) |
| `--sage` | `#8A9A7B` | Floral foliage tone |
| `--blush` | `#D9A9A0` | Rose pink accents |

Nothing is pure black or pure white. Everything sits in a warm, aged range.

### Typography

| Role | Reference font | Our plan |
|---|---|---|
| Script headings (names, section titles, "Scroll down") | Custom uploaded font (Tilda called it `newtemplate`) | Google Font pairing — candidates: **Tangerine**, **Pinyon Script**, **Italianno**, **Parisienne**. Needs a high-contrast, wide-swash formal copperplate. |
| Serif caps / numerals ("5 PM", "Days", countdown) | **Cinzel** (400, 500) | Same — Cinzel, it's free on Google Fonts |
| Body copy | **Ovo** | Same — Ovo, free on Google Fonts |

Script sizes are **large** — the couple's names run roughly 100–120px on the phone
canvas. The script font is the whole personality of the design; picking the right one
matters more than any other single choice.

### Motion

- Scroll-triggered **fade-up reveals**, staggered element by element within a section
  (Tilda's "step-by-step" animation). Roughly 0.6–0.8s ease-out, ~120ms stagger.
- The envelope opening is the one big set-piece: flaps rotate open on an X-axis 3D
  transform while a warm golden light blooms from the seam behind them.

---

## 3. Section-by-section spec

### 1. Envelope gate (full screen, blocks everything)
- Cream-colored envelope filling the viewport, **embossed** floral vine pattern
  (tone-on-tone, no color — just shadow and highlight).
- Diagonal flap seams meeting at center.
- Maroon **wax seal** with gold monogram `R&Z` in script, at the seam junction.
- Below the seal: a thin `^` chevron and `TAP TO OPEN` in wide-tracked gold caps.
- On click: flaps rotate open, golden light blooms from behind, envelope lifts away,
  **music starts**, page becomes scrollable.

### 2. Hero
- Names stacked in giant gold script: `Zohan` / `&` / `Rose`.
- Framed by classical **stone columns** left and right, wrapped in rose garlands.
- Background: a soft lake landscape with **two swans forming a heart** with their necks,
  reflected in the water.
- Heavy **watercolor floral clusters** in both bottom corners (peonies, roses, white
  blossoms, trailing greenery).
- `Scroll down` in script + chevron.
- Date `27.09.26` and `Wedding Day` appear at the top.

### 3. Bismillah / invitation
- A **torn-paper card** — irregular deckled edges top and bottom, textured paper fill.
- Trailing ivy and small roses hanging into the top corners.
- Arabic: `بِسْمِ ٱللّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ` in gold.
- Script lines, centered:
  > Two Souls
  > One destiny
  > A Lifetime written by Allah
- Body copy in Ovo:
  > Dear Friends and Family
  > Join us for an evening of love, laughter, duas, and unforgettable
  > memories as we begin our forever.

### 4. Countdown
- Sits on the plain cream ground (no card).
- Script heading: `The Celebration Begins In`
- Large Cinzel numerals separated by `:` — `118 : 15 : 16 : 39`
- Small Cinzel labels beneath: `Days` `Hours` `Minutes` `Seconds`
- Ticks live, every second.

### 5. Schedule of Events
- Torn-paper card again.
- Script heading `Schedule of Events` flanked by gold filigree flourishes.
- A **vertical timeline**: thin gold rule down the center, a **rose bud** at the top,
  small gold **diamond** nodes at each stop.
- Time on the **left** (Cinzel), event name on the **right** (Ovo). Alternating read.

| Time | Event |
|---|---|
| 5 PM | Guest Arrival |
| 6 PM | Nikkah Ceremony |
| 7 PM | Mocktail Hour |
| 8 PM | Dinner |
| 9 PM | Dance |

### 6. Venue / Location
- Script heading `Location`.
- Venue name in Cinzel: `Islamic Center of Melville`
- Address: `118 Old East Neck Road Melville, NY 11747`
- A **gold line-art illustration** of the building (fine engraving style, no fill).
- Small gold leaf motifs floating around it.
- An embedded **Google Map**, rounded corners, inside an **ornate gold frame** with
  filigree crests at top and bottom center.
- `Open in Maps` link.

### 7. Dress Code & Gift Preference
- One torn-paper card holding both, with rose vines trailing down the right edge and
  a rose at bottom-left.
- `Dress Code` (script) → "We kindly ask guests to avoid deep red and maroon attire
  for the celebration."
- `Gift Preference` (script) → "Kindly, no boxed gifts please."

### 8. RSVP
- Script heading `Confirm Your Attendance`
- Body: "To help us prepare for a joyful celebration, kindly confirm your attendance."
- A maroon **wax seal stamped `RSVP`** in gold caps with a small filigree flourish.
- Below: `^` chevron + `Click to open` in script.
- Click → **modal dialog**, cream card, dark overlay, `×` close top-right:

| Field | Type | Notes |
|---|---|---|
| Your name | text | |
| Will you be attending? | radio | `Accepts with pleasure` / `Declines with regret` |
| Number of Guests Attending | text | |
| A Song That Gets You Dancing | text | song request — nice touch, keep it |
| Children Attending | text | helper: "Please include names and ages." |

- Full-width maroon **Submit** button, rounded, with a subtle diagonal sheen sweep.
- Modal header repeats `Confirm Your Attendance` + `Please RSVP before <date>`.

### 9. Closing
- Script: `Hope to see you there!`
- Cinzel: `Zohan and Rose`
- Full-width **couple photo** (walking in a golden field, holding hands).
- Watercolor floral arch overlapping the bottom of the photo, left and right.

### Persistent UI
- **Fixed circular maroon music button, bottom-right**, pause/play icon in cream.
  Present on every section once the envelope is opened.
- Reference track: Ludovico Einaudi — *Divenire* (hosted on Cloudflare R2).
  We need our own audio file; pick something we have rights to.

---

## 4. Build decisions (confirmed 2026-08-12)

### Stack — static HTML/CSS/JS
No build step, no dependencies, no framework. Deploys by dragging the folder to
Netlify Drop. Fastest possible load on phones, which is where nearly every guest will
open this. Easy to hand-edit text later.

```
wedding/
  index.html
  css/style.css
  js/main.js
  assets/
    img/
    audio/
    fonts/
  REFERENCE.md   <- this file
```

### RSVP → Google Sheet
Submissions post to a Google Apps Script web-app endpoint that appends a row to a
spreadsheet. Free, no backend to maintain, readable on a phone.

Target sheet columns:

| Timestamp | Name | Attending | Guests | Song | Children |
|---|---|---|---|---|---|

### Assets → CSS/SVG placeholders first
Hand-build the wax seal, gold ornaments, filigree frames, and torn-paper edges in pure
CSS/SVG. **Nothing copied from the reference site.** Leave clearly-marked slots for
floral PNGs, the couple photo, and the venue illustration to be dropped in later.

```css
/* seal: pure CSS, no image */
.seal {
  background: radial-gradient(...);
  clip-path: polygon(...);   /* wavy wax edge */
  box-shadow: inset ...;
}
```

```html
<!-- TODO: swap in your floral PNG -->
<img src="assets/img/corner-floral.png" alt="">
```

---

## 5. Still needed from the user

Everything below is currently filled with the reference's placeholder content and
must be replaced:

- [ ] **Couple's names** (and the monogram initials for the wax seal)
- [ ] **Wedding date + start time** — drives the countdown target
- [ ] **RSVP deadline date**
- [ ] **Venue name + full address** (+ the exact Google Maps location)
- [ ] **Schedule** — confirm or replace the 5 PM–9 PM run of events
- [ ] **Dress code** and **gift preference** wording
- [ ] **Invitation paragraph** — keep the Islamic framing (Bismillah, "written by Allah",
      "duas") or swap it out?
- [ ] **Couple photo** for the closing section
- [ ] **Music track** — an audio file we have rights to
- [ ] **Floral / decorative PNGs**, if not using sourced stock

---

## 6. Open questions

- Which script font? This is the single biggest visual decision — see §2 candidates.
- Keep the reference's narrow-column-on-desktop look, or build a proper responsive
  desktop composition? (Recommendation: **proper responsive** — the reference's version
  is a builder artifact, not a design intent.)
- Should the envelope gate remember it's been opened (`localStorage`), so a returning
  guest isn't gated again? Reference does not.
- Add a per-guest personalized link (`?to=Sara`) so the envelope greets them by name?
  Reference does not — but it's cheap and lands well.
