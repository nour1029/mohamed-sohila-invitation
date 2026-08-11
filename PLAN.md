# Build Plan

Phased plan for the wedding invitation site. Companion to [`REFERENCE.md`](./REFERENCE.md),
which holds the design spec and content.

**How we work:** one phase at a time. Each phase ends with something you can open in a
browser and judge. You review, we adjust, then move on. Nothing later depends on a phase
you haven't signed off.

**Size key:** `S` = quick · `M` = a solid chunk · `L` = the big ones

---

## Part A — Foundation

Nothing visual to admire yet. This is the skeleton everything hangs on.

### Phase 0 · Scaffold & config `S`

Get the folder standing up with a single place to edit all wedding details.

**Files:** `index.html`, `css/style.css`, `js/main.js`, `assets/{img,audio,fonts}/`

- [x] Folder structure created
- [x] `index.html` with all 9 sections stubbed as labeled empty bands
- [x] CSS reset + the palette from `REFERENCE.md` §2 as custom properties
- [x] Google Fonts loaded (Cinzel, Ovo, + chosen script font) with `display=swap`
- [x] **`WEDDING` config object** in `js/main.js` — names, monogram, date, time, venue,
      address, map coords, RSVP deadline, schedule array. Single source of truth so the
      countdown and displayed date can never drift (the reference's had)
- [x] Mobile-first responsive base: content column caps at ~480px, centered, with a real
      desktop treatment rather than the reference's dead margins
- [x] `_fonts.html` — the four script candidates at real sizes. Deleted once you pick.

**Done when:** page loads, you can scroll through 9 labeled empty sections, and changing
a value in `WEDDING` is the only place a date lives.

---

### Phase 1 · Design primitives `M`

Build the reusable ornamental parts **once**, in isolation, before any section needs them.
This is what keeps the rest of the build fast and consistent.

**Files:** `css/style.css`, plus a throwaway `_components.html` preview page

- [x] **Wax seal** — pure CSS/SVG. Wavy clip-path edge, radial gradient depth, inset
      shadow, gold monogram centered. Parameterized so `R&Z` and `RSVP` are one component
- [x] **Torn-paper card** — irregular deckled top and bottom edges (SVG mask), paper texture
- [x] **Gold filigree flourish** — the flanking ornaments beside script headings
- [x] **Ornate frame** — the bordered box with filigree crests, for the map
- [x] **Type scale** — script / Cinzel caps / Ovo body, sized for mobile and desktop
- [x] **Chevron + label** — the `^` + "Tap to open" / "Scroll down" / "Click to open" unit
- [x] Marked `<!-- TODO: swap in floral PNG -->` slots throughout

**Done when:** `_components.html` shows every ornament side by side and they look right at
phone size. Deleted before launch.

---

## Part B — Set pieces

The two moments that make or break the whole thing.

### Phase 2 · Envelope gate `L`

The first thing every guest sees. Worth over-investing in.

- [x] Full-viewport envelope, embossed floral vine (tone-on-tone shadow/highlight, no color)
- [x] Diagonal flap seams meeting at center, `R&Z` seal at the junction
- [x] `^` + `TAP TO OPEN` in wide-tracked gold caps
- [x] **Open animation:** flaps rotate on 3D X-axis, golden light blooms from the seam,
      envelope lifts away
- [x] Page scroll locked until opened, unlocked after
- [x] Triggers the music (see Phase 11) — dispatches a `wedding:open` event to listen for
- [x] Respects `prefers-reduced-motion` — instant, dignified fade instead
- [x] Decided: remembered for the **browser session** (`WEDDING.gate.remember`), so a
      returning guest mid-session isn't re-gated but a fresh visit still gets the moment

**Done when:** it feels like opening a real envelope on an actual phone, not a div rotating.

---

### Phase 3 · Hero `M`

- [x] Names in giant gold script, `&` between
- [x] Stone column + rose garland frame — placeholder slots left/right
- [x] Swan/lake background slot
- [x] Corner floral cluster slots
- [x] `Wedding Day` + date at top, `Scroll down` + chevron at bottom
- [x] Holds up from 320px to desktop

---

### Phase 4 · Scroll-reveal engine `S`

Built once, applies to every section after it.

- [x] `IntersectionObserver`, fade-up ~0.7s ease-out
- [x] `data-reveal-stagger` for element-by-element cascade within a section
- [x] Fires once, doesn't re-trigger on scroll-up
- [x] `prefers-reduced-motion` → everything simply visible
- [x] Anything scrolled past counts as arrived, so a jump down the page
      cannot strand a section invisible

---

## Part C — Content sections

With Parts A and B done, these go quickly — they're compositions of existing primitives.
**Largely independent of each other**, so order here is flexible.

### Phase 5 · Bismillah / invitation card `S`
- [ ] Torn-paper card, ivy + roses in top corners
- [ ] Arabic بِسْمِ ٱللّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ in gold, correct RTL rendering and font
- [ ] Three script lines + the invitation paragraph

### Phase 6 · Countdown `S`
- [ ] Live D:H:M:S from `WEDDING.date`, ticking every second
- [ ] Cinzel numerals, `:` separators, small labels beneath
- [ ] Graceful state for when the date has passed ("Today's the day" / post-wedding message)
- [ ] No layout jitter as digits change (tabular figures)

### Phase 7 · Schedule timeline `M`
- [ ] Torn-paper card, script heading with filigree flourishes
- [ ] Vertical gold rule, rose bud at top, diamond nodes per stop
- [ ] Time left / event right, generated from the `WEDDING.schedule` array
- [ ] Reveals stop-by-stop as you scroll

### Phase 8 · Venue + map `M`
- [ ] Venue name (Cinzel) + address
- [ ] Gold line-art building illustration slot
- [ ] Google Map embed inside the ornate frame from Phase 1
- [ ] `Open in Maps` link that opens Apple Maps on iOS, Google Maps on Android
- [ ] Map loads lazily — it's the heaviest thing on the page

### Phase 9 · Dress code & gift `S`
- [ ] One torn-paper card, both blocks, rose vines down the right edge

---

## Part D — Interaction

### Phase 10 · RSVP `L`

The only part with a backend, and the only part that must not fail silently.

- [ ] Maroon `RSVP` wax seal + `Click to open`
- [ ] Modal: overlay, cream card, `×` close, Esc to close, click-outside to close
- [ ] **Focus trap** and focus restore — accessibility, and it's genuinely annoying without it
- [ ] Fields: name · attending (radio) · guest count · song request · children
- [ ] Client-side validation with warm, non-shouty error styling
- [ ] Maroon submit button with the diagonal sheen sweep
- [ ] **Google Apps Script endpoint** appending to a Sheet:
      `Timestamp | Name | Attending | Guests | Song | Children`
- [ ] Loading / success / failure states — failure must tell the guest to text you instead,
      never swallow an RSVP
- [ ] Deadline text driven from `WEDDING.rsvpDeadline`

> **Needs you:** a Google account. I'll write the Apps Script and give you exact
> click-by-click deploy steps — you paste it in and hand me back the URL. Two minutes.

---

### Phase 11 · Music player `M`

- [ ] Fixed circular maroon button, bottom-right, pause/play icon
- [ ] Starts on envelope open — **this is the only reliable way**, since mobile browsers
      block autoplay without a user gesture
- [ ] State persists across scroll; icon always reflects reality
- [ ] Sensible fallback if the browser blocks it anyway
- [ ] Doesn't fight the phone's own media controls

> **Needs you:** an audio file you have rights to. The reference used Einaudi's *Divenire*,
> which is not ours to take.

---

### Phase 12 · Closing `S`
- [ ] `Hope to see you there!` script + names in Cinzel
- [ ] Full-width couple photo slot, floral arch overlapping its bottom corners

---

## Part E — Ship

### Phase 13 · Real content `S`
Swap every placeholder for your actual details. Straight run through the checklist in
`REFERENCE.md` §5 — nothing invented, nothing left saying "Zohan and Rose".

### Phase 14 · Real assets `M`
- [ ] Florals, envelope texture, couple photo, venue illustration dropped in
- [ ] All images exported at 2× and converted to WebP with JPG fallback
- [ ] Explicit `width`/`height` on everything so nothing jumps while loading

### Phase 15 · Polish `M`
- [ ] Responsive audit: 320px → desktop, plus landscape phone
- [ ] **Real iOS Safari test** — where 3D transforms and audio autoplay actually break
- [ ] Performance: lazy-load below-fold images, preload the script font, audit total weight
- [ ] Accessibility: keyboard path through the whole page, focus visible, contrast on gold
      text, alt text, reduced-motion honored everywhere
- [ ] **Share preview** — OG image + title/description, so the link looks right when
      forwarded in WhatsApp. Guests will send this to each other; this matters more than
      it sounds
- [ ] `favicon`, page `<title>`
- [ ] Delete `_components.html`

### Phase 16 · Deploy `S`
- [ ] Netlify Drop (or your host of choice)
- [ ] Custom domain if you want one
- [ ] Test the live URL on a real phone, on cellular, from a cold cache
- [ ] Submit one real RSVP end-to-end and confirm the row lands in the Sheet

---

## Dependency map

```
P0 ──> P1 ──┬──> P2 (envelope) ──> P11 (music)
            ├──> P3 (hero)
            └──> P4 (reveals) ──> P5 P6 P7 P8 P9 P12   (independent, any order)
                                  P10 (RSVP)

P13/P14 need your content ──> P15 ──> P16
```

## What's blocked on you

| Phase | I need |
|---|---|
| 0 | Your pick of script font *(I'll mock the four candidates first)* |
| 10 | A Google account, to deploy the Apps Script endpoint |
| 11 | An audio file we have rights to |
| 13 | The content checklist in `REFERENCE.md` §5 |
| 14 | Couple photo; florals if you don't want sourced stock |

Everything else I can build with placeholders. **Phases 0–12 need nothing from you** beyond
the font pick — so we can go a long way before you have to gather anything.

---

## Suggested first move

**Phase 0 + a font mock.** I'll stand up the scaffold and render your names in all four
script candidates so you can pick by eye. Small, fast, and it unblocks everything else.
