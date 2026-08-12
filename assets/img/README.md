# Image assets

## Provenance

| File | Source |
|---|---|
| `hero-floral-left.png` | Reference site (`webgencyinvitations.com/thesacredgarden`), Tilda CDN `tild6639-3363-4136-a234-356639363561` |
| `hero-floral-right.png` | Reference site, Tilda CDN `tild3764-3461-4436-a562-636534643333` |

> **These two are not ours.** They were taken from the reference site at the
> user's explicit request on 2026-08-12. They are most likely licensed stock
> or commissioned artwork, so they carry a real risk if this page ever goes
> public under a custom domain. Replacing them with licensed or commissioned
> florals before launch is the safe path — the layout will take a drop-in
> swap, same filenames, no code change.
>
> Everything else on the site is hand-built CSS/SVG, per `REFERENCE.md` §4.

## Working sizes

`_source/` holds the largest versions the CDN would serve (≈820×1260). The
files in this directory are those resized to 480px wide — the corner florals
render at most 280px, so 480 covers a 2× display with headroom.

There is no WebP build: no `cwebp`, ImageMagick, or WebP-capable `sips` on
the build machine. These need alpha, so JPEG is not an option either. If you
want WebP later (roughly a 60–70% saving on ~290KB each):

```sh
brew install webp
cwebp -q 82 -alpha_q 90 _source/hero-floral-left.png -o hero-floral-left.webp
```

Then wrap each `<img>` in a `<picture>` with the PNG as fallback.
