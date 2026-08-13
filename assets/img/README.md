# Image assets

## Provenance

Everything here came from the reference site
(`webgencyinvitations.com/thesacredgarden`), at the user's explicit request.

| File | Origin |
|---|---|
| `hero-scene.jpg` | Derived from the site's OG preview image, `Screenshot_2026-06-2.png` |
| `hero-floral-left.png` | Tilda CDN `tild6639-3363-4136-a234-356639363561` — despite the filename, the reference actually places this on the invite card, not the hero; see below |
| `hero-floral-right.png` | Tilda CDN `tild3764-3461-4436-a562-636534643333` — same |
| `bismillah.png` | Tilda CDN `tild3438-6238-4236-b537-366632636138`, 1022×312 |
| `invite-card-bg.png` | Tilda CDN `tild3134-6461-4832-a236-633431616631`, cropped to its opaque bounds and resized from 1680×833 |
| `envelope-closed.jpg` | Cloudflare R2 `pub-96ce671efbac…`, the gate's still |
| `../video/envelope-open.mp4` | Cloudflare R2 `pub-96ce671efbac…`, the opening film |
| `_source/keep/venue-line-art.png` | Tilda CDN `tild3637-3939-4864-a263-333836383139`, for Phase 8 |

> **None of this is ours.** It is most likely licensed stock or commissioned
> artwork. Low risk while the page is a local file; a real one once it is on a
> public domain with your names on it. Commissioned or licensed replacements
> drop in under the same filenames with no code change.

## How `hero-scene.jpg` was made

The arch, columns, vines, lake and swans are **not** on the live reference
site any more — its hero now uses a torn-paper card and two floral cutouts,
and every block background there is a flat colour. The only surviving copy of
that scene is the site's OG preview image, which is a screenshot of an earlier
version **with the couple's names painted into it**.

So the text was removed programmatically:

1. Detect gold glyph pixels — `r ≤ 228`, `r−b ≥ 55`, `g−b ≥ 20` — which
   separates the gold lettering from both the warm stone (`r−b ≈ 42`) and the
   cream ground (`r−b ≈ 29`).
2. Restrict that mask to the central box where the text sits. The same colour
   test also matches rose centres, which must survive.
3. Dilate by 3px so antialiased glyph edges go too, otherwise a gold halo is
   left behind.
4. Repaint each masked run by interpolating between the nearest clean pixel to
   its left and right on the same row. Glyph strokes are narrow and the ground
   behind them is flat cream, so this is seamless.

The script is `_source/keep/clean-hero-text.py`. Re-run it against
`_source/keep/hero-scene-original-with-text.png` if the plate ever needs
redoing.

**Consequence:** the names, date and "Scroll down" on the hero are live text
from `WEDDING`, not pixels. Changing the couple's names changes the hero.

## Working sizes

`_source/keep/` holds the untouched originals. Shipped files are resized to
what the layout actually displays.

`hero-scene.jpg` is 981×1558 — the largest the source exists at. It is JPEG
because it is a full-bleed photograph-like plate with no transparency; the
florals stay PNG because they need alpha.

No WebP build: no `cwebp`, ImageMagick, or WebP-capable `sips` on this
machine. For roughly a 30–40% saving on the scene:

```sh
brew install webp
cwebp -q 82 hero-scene.jpg -o hero-scene.webp
```

Then wrap the `<img>` in a `<picture>` with the JPEG as fallback.


## The envelope

The gate is the reference's own two-stage sequence: a still of the sealed
envelope, then a 4.8s film of it opening which dissolves as it ends. Both come
from the reference's Cloudflare R2 bucket, not Tilda.

**The wax seal reads `R&Z` in both the still and the film.** Unlike the hero,
this is not live text and cannot be swapped — it is embossed wax, lit and
photographed, and it moves in the video. Different initials mean new artwork
for both files. `WEDDING.couple.monogram` no longer drives the gate.

The still was 2.4MB as PNG with no transparency; re-saved as JPEG at 253KB.
The film is 3.5MB and could not be re-encoded — no ffmpeg on this machine.
That is the single heaviest thing a guest downloads, and it is on the critical
path since it is the first screen. Worth an `ffmpeg -crf 30` pass before
launch:

```sh
brew install ffmpeg
ffmpeg -i envelope-open.mp4 -vcodec libx264 -crf 30 -preset slow \
       -movflags +faststart -an envelope-open-small.mp4
```

## The hero scene video

`../video/swans.mov` is the hero. It is not just the swans — it is the whole
painting, animated: the swans drift, blossom petals fall, light shifts across
the arch. 720x1280, 8.06s, looping.

`hero-scene.jpg` is now its **poster**, not the hero itself. The video only
starts once the guest is through the envelope, so nothing pulls 7MB before
they have opened it.

Three things about this file are worth knowing:

**It is HEVC (h.265) in a QuickTime container.** Safari plays it everywhere.
Chrome on macOS plays it via the system decoder. Firefox does not, and Android
and Windows Chrome depend on the device. Where it cannot decode, the poster
stays on screen — the same artwork, just still — so nothing ever breaks. This
is why the poster matters and why the still plate was worth making.

**Do not use `<source type="video/quicktime">`.** Browsers filter `<source>`
by declared type, and Chrome reports no support for quicktime even where it
decodes the file happily, so the video silently gets no source at all
(`networkState: 3`). Setting `src` directly on the `<video>` lets it sniff.
The reference sidesteps this by labelling its `.mov` as `video/mp4`.

**It was not faststart.** As downloaded, the `moov` atom sat at byte 7,313,055
of 7,319,318 — the very end — so a browser had to fetch all 7MB before it
could show one frame. `_source/keep/faststart.py` rewrites it with `moov`
first, patching every `stco` chunk offset by the size of the moved atom
(those offsets are absolute file positions, so they must shift or playback
breaks silently). `moov` now sits at byte 28. The envelope film was already
faststart.

## Page weight

The two videos are 10.5MB together and both are on the critical path. Neither
could be re-encoded here — no ffmpeg. Before launch:

```sh
brew install ffmpeg
# H.264 alongside the HEVC, so Firefox and Android get motion too:
ffmpeg -i swans.mov -vcodec libx264 -crf 30 -preset slow -an \
       -movflags +faststart swans.mp4
```

Then offer both, H.264 first, and everyone gets the animation.


## Countdown and Schedule (matched to the live reference)

The reference's Countdown is not a card at all — it's a self-contained coded
widget (Ovo digits in a shimmering gold-gradient text-clip, wiped open on
scroll, each unit rolling out and back in on change rather than the text
just overwriting). That behaviour is reproduced in `js/main.js`
(`initCountdown`, `flipDigit`) and `css/style.css` §9.2 directly from the
reference's own inline `<style>`/`<script>` — colours retokenised to
`--gold`/`--gold-light`, everything else near-identical, including the exact
per-unit stagger delays.

Schedule keeps its own hand-built torn-paper card and timeline, but the
flourishes flanking the heading and the flower on the timeline are now the
reference's own assets rather than approximations:

| File | Origin | Used for |
|---|---|---|
| `schedule-flourish-left.png` | Tilda `tild3638-3336-4136-a131-…` | Left of "Schedule of Events" |
| `schedule-flourish-right.png` | Tilda `tild6131-6362-4663-b461-…` | Right of "Schedule of Events" |
| `schedule-rose.png` | Tilda `tild3363-3665-4330-a361-…`, resized from 1309x1201 | Crowning the timeline rule |

These are scoped to the Schedule heading only, via a `.heading--schedule`
modifier — the shared `.heading--flourished` filigree (Location, RSVP, Dress
Code) is untouched, since those headings' own reference assets haven't been
checked yet.

**Found along the way, not (yet) acted on:** fixing the real flourish images
in exposed a pre-existing bug — the flourish min-width floor (added when the
desktop zero-width bug was fixed) was tuned against bare section headings
and was too generous for a heading sitting inside a card's extra padding,
wrapping "Schedule of Events" back onto two lines at phone width. The
coefficient was lowered (8vw → 5.5vw); re-verified clean at 320/390/1280.

## Bismillah / invitation card (matched to the live reference)

Same treatment as Schedule: the reference's own art replaces every
hand-drawn approximation on this card.

- **`bismillah.png`** stands in for what used to be live Arabic text. The
  reference doesn't set the phrase in a font at all — it's a calligraphy
  graphic. Accessibility isn't lost: the `<img alt>` carries both the Arabic
  and an English translation.
- **`invite-card-bg.png`** replaces the CSS torn-paper mask
  (`css/style.css` §5.3, `.card`) for this card only, via a `.card.invite`
  override. The source PNG (1680×833) has the torn card art centered in a
  much wider transparent canvas; it's cropped to the art's own opaque
  bounds before shipping. Straight left/right edges, torn top/bottom — same
  shape the CSS mask already produced, now a photograph instead of a
  gradient trick. Worth a pass with `pngquant`/`cwebp` before launch (445KB,
  no compressor available on this machine — see "Page weight" above).
- **`hero-floral-left/right.png`** turn out to belong to this card, not the
  hero — the reference's own layout has them draped over the card's torn
  top edge (roughly 55% of their height above it, inset ~17.6% from each
  side), which is why `.invite__ivy` positions them with a negative
  `translateY` rather than sitting flush inside the card like the old
  placeholder slots did.
- **`invite-ivy-left.webp` / `invite-ivy-right.webp`** are the primary
  source now (PNGs are the `<picture>` fallback for non-WebP browsers),
  pulled directly from Tilda's own optimizer (`optim.tildacdn.net`) rather
  than re-encoded here — this machine has no `cwebp`. Sized at 436×/420×,
  the same widths the reference's own JS requests them at, ~5-6× lighter
  than the PNGs (58KB/51KB vs. 299KB/280KB).
- **The `.invite__ivy` size was a real bug, not a style choice**: it first
  shipped at a guessed `clamp(50px, 15vw, 84px)`, sized for the old square
  placeholder slot. Checking the widths Tilda requests these images at
  (436px/420px, ≈2× for retina) against their canvas box (224px/236px on a
  744px-wide card) puts the reference's florals at ~30% of the card's
  width — roughly double what was shipping. Fixed to
  `clamp(80px, 30%, 190px)`; they now arch over the Bismillah graphic
  properly instead of sitting as small corner accents.

**One font swapped deliberately, not matched exactly.** The reference's
"Two Souls / One destiny / A Lifetime written by Allah" and its Tilda
`font-family` both resolve to real fonts we could identify by their
`@font-face` `src` URLs:

| Reference text | Resolves to | License |
|---|---|---|
| "Two Souls…" (gold, `#A67D2B`) | Imperial Script | Free — SIL Open Font License, on Google Fonts |
| "Dear Friends…" / body (`#6A5140`) | GT Super Display Light | Paid — Grilli Type commercial license |

Imperial Script is now loaded (`index.html`) and used for `.invite__line`
— an exact match. GT Super Display Light is not: it's a paid commercial
typeface and its `.woff` isn't ours to copy off Tilda's CDN and re-host,
unlike the images (most likely licensed stock, but at least not a font
foundry's own paid product). `.invite__greeting` and `.invite__body` keep
Ovo, the sitewide body font, with the reference's exact text colour. If a
licensed copy of GT Super Display is ever obtained, drop its `.woff` into
`assets/fonts/` and point `--font-body` at it for this card only.