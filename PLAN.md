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
- [x] **Open animation:** the reference's own two-stage sequence — a still of the sealed
      envelope, then a 4.8s film of it opening that dissolves as it ends. Replaces the
      hand-built CSS 3D flap.
      ⚠ The seal reads `R&Z` in both the still and the film and is **not** live text;
      different initials need new artwork for both files.
- [x] Page scroll locked until opened, unlocked after
- [x] Triggers the music (see Phase 11) — dispatches a `wedding:open` event to listen for
- [x] Respects `prefers-reduced-motion` — instant, dignified fade instead
- [x] Decided: **never remembered** (`WEDDING.gate.remember: 'never'`) — the envelope is
      the first impression and every guest gets it every time, same as the reference

**Done when:** it feels like opening a real envelope on an actual phone, not a div rotating.

---

### Phase 3 · Hero `M`

- [x] Names in giant gold script, `&` between
- [x] Stone column + rose garland frame — placeholder slots left/right
- [x] Swan/lake background slot
- [x] Corner floral cluster slots
- [x] `Wedding Day` + date at top, `Scroll down` + chevron at bottom
- [x] Holds up from 320px to desktop
- [x] Panel fills the viewport height exactly, top and bottom — no cream
      showing above or below on any screen (object-fit: cover on the video/
      poster absorbs the crop instead)

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
- [x] Torn-paper card, ivy + roses in top corners
- [x] Arabic بِسْمِ ٱللّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ in gold, correct RTL rendering and font (Amiri)
- [x] Three script lines + the invitation paragraph
- [x] Matched to the live reference exactly: the reference's own torn-paper photograph
      as the card ground (not a CSS mask), its own Bismillah calligraphy graphic (not
      live Naskh text), its own floral corners, and Imperial Script (the reference's
      actual font) for the three script lines — see `assets/img/README.md`. One
      deliberate non-match: the greeting/body keep Ovo rather than the reference's
      GT Super Display Light, a paid commercial font we won't redistribute.

### Phase 6 · Countdown `S`
- [x] Live D:H:M:S from `WEDDING.date`, ticking every second
- [x] Matches the reference's own custom widget exactly: Ovo (not Cinzel) digits in a
      shimmering gold gradient, `:` separators, small labels beneath
- [x] Ink-wipe reveal the first time the clock scrolls into view, then each unit flips
      (rolls out/in) on change rather than the text just overwriting — both taken from
      the reference's own CSS/JS, not approximated
- [x] Graceful state for when the date has passed ("Today's the day" / post-wedding message)
      — both branches verified against a shifted clock
- [x] No layout jitter as digits change (tabular figures + fixed column width)

### Phase 7 · Schedule timeline `M`
- [x] Torn-paper card, script heading with filigree flourishes — flourishes are the
      reference's own photographed gold scrollwork (`schedule-flourish-*.png`), scoped
      to this heading only via `.heading--schedule`, not the shared hand-drawn filigree
- [x] Vertical gold rule, rose at top — the reference's own photographed peony
      (`schedule-rose.png`), not the CSS-drawn rosebud — and diamond nodes per stop
- [x] Time left / event right, generated from the `WEDDING.schedule` array
- [x] Reveals stop-by-stop as you scroll

### Phase 8 · Venue + map `M`
- [x] Venue name + address — **title-case body serif, not Cinzel caps**, per
      your own Location artwork
- [x] Line-art building illustration — the real one, cut from your artwork and
      recovered as ink-over-paper so it takes on the card's own cream
      (`assets/img/README.md`). The reference's building is now unused.
- [x] Torn-paper card, centred rule-and-palmette under the heading in place of
      the shared flanking filigree — again per your artwork
- [x] Real venue in `WEDDING` — Laveora Wedding Hall, El Wahat Road, 6th of
      October City
- [x] Google Map embed inside the ornate frame from Phase 1 (keyless embed URL)
- [x] `Open in Maps` link that opens Apple Maps on iOS, Google Maps on Android
- [x] Map loads lazily — it's the heaviest thing on the page
- [ ] **Blocked on you (optional):** `WEDDING.venue.coords` is `null`, so the
      map searches the address rather than pinning the door. Google does find
      the right listing. Right-click the hall in Google Maps and paste back the
      lat,lng to pin it exactly.
- [ ] **Needs a decision:** `WEDDING.timezone` is still `America/New_York`,
      left over from the placeholder venue. The hall is in Egypt. Changing it
      moves the printed date/time and the countdown, so it is yours to call —
      see the note at the top of Phase 13.

### Phase 9 · Dress code & gift `S`
- [x] One torn-paper card, both blocks, rose vines down the right edge

---

## Part D — Interaction

### Phase 10 · RSVP `L`

The only part with a backend, and the only part that must not fail silently.

- [x] Maroon `RSVP` wax seal + `Click to open`
- [x] Modal: overlay, cream card, `×` close, Esc to close, click-outside to close
- [x] **Focus trap** and focus restore — native `<dialog>`, all four close paths verified
- [x] Fields: name · attending (radio) · guest count · song request · children
- [x] Client-side validation with warm, non-shouty error styling
- [x] Maroon submit button with the diagonal sheen sweep
- [x] **Google Apps Script endpoint** written — `apps-script/Code.gs`
      `Timestamp | Name | Attending | Guests | Song | Children`
- [x] Loading / success / failure states — failure must tell the guest to text you instead,
      never swallow an RSVP
- [x] Deadline text driven from `WEDDING.rsvpDeadline`
- [ ] **Blocked on you:** deploy the script and paste back the URL —
      steps in `apps-script/README.md`. Also set a real number in `WEDDING.contact`.

> **Needs you:** a Google account. I'll write the Apps Script and give you exact
> click-by-click deploy steps — you paste it in and hand me back the URL. Two minutes.

---

### Phase 11 · Music player `M`

- [x] Fixed circular maroon button, bottom-right, pause/play icon
- [x] Starts on envelope open — **this is the only reliable way**, since mobile browsers
      block autoplay without a user gesture
- [x] State persists across scroll; icon always reflects reality — driven by the audio
      element's own play/pause events, not by what we asked it to do
- [x] Sensible fallback if the browser blocks it anyway — button sits in paused state
- [x] Doesn't fight the phone's own media controls
- [ ] **Blocked on you:** an audio file we have rights to, into `assets/audio/`, then set
      `WEDDING.audioSrc`. Until then the button stays hidden.

> **Needs you:** an audio file you have rights to. The reference used Einaudi's *Divenire*,
> which is not ours to take.

---

### Phase 12 · Closing `S`
- [x] `Hope to see you there!` script + names in Cinzel
- [x] Full-width couple photo — **your real photo is in**, rotated upright,
      shown whole (nothing cropped off any edge) and running edge to edge at
      every width. Above ~1280px it is being enlarged, so it softens on a
      large monitor; a higher-resolution original fixes that with no code
      change.
- [ ] Floral arch overlapping its bottom corners — still a placeholder
- [ ] **Your call:** the photo came with fire emoji over both faces, left
      exactly as supplied. If that was only for sending the file, send the
      unstickered original and it drops in under the same filename.

---

## Part E — Ship

### Phase 13 · Real content `S`
Swap every placeholder for your actual details. Straight run through the checklist in
`REFERENCE.md` §5 — nothing invented, nothing left saying "Zohan and Rose".

> **Open since the venue became real:** `WEDDING.timezone` is still
> `America/New_York`. Everything printed on the page — the hero date, the
> schedule times, the countdown — is rendered in that zone, so a wedding in
> Giza is currently being announced on New York's clock. Setting it to
> `Africa/Cairo` will shift the displayed date/time and the countdown, which
> is why it hasn't been changed unasked. Say the word and it's one line.

### Phase 14 · Real assets `M`
- [~] Florals, envelope texture, couple photo, venue illustration dropped in
      — hero corner florals in (taken from the reference site; see
      `assets/img/README.md` for the licensing caveat), **venue illustration
      in** (your own artwork), **couple photo in** (your own). Still needed:
      envelope texture, closing floral arch, ivy/rose vines, columns, swans
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
| 14 | ~~Couple photo~~ (in); florals if you don't want sourced stock |

Everything else I can build with placeholders. **Phases 0–12 need nothing from you** beyond
the font pick — so we can go a long way before you have to gather anything.

---

## Suggested first move

**Phase 0 + a font mock.** I'll stand up the scaffold and render your names in all four
script candidates so you can pick by eye. Small, fast, and it unblocks everything else.
