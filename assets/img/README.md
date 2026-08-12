# Image assets

## Provenance

Everything here came from the reference site
(`webgencyinvitations.com/thesacredgarden`), at the user's explicit request.

| File | Origin |
|---|---|
| `hero-scene.jpg` | Derived from the site's OG preview image, `Screenshot_2026-06-2.png` |
| `hero-floral-left.png` | Tilda CDN `tild6639-3363-4136-a234-356639363561` |
| `hero-floral-right.png` | Tilda CDN `tild3764-3461-4436-a562-636534643333` |
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

## Also on the reference, not yet used

`Swans2.mov` — the reference animates the hero's swans with an autoplaying
looped video sitting over the static scene. Our hero uses the still plate.
