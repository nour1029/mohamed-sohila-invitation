# Audio

| File | Notes |
|---|---|
| `music.mp3` | The track that plays when the envelope opens. |

Wired up via `WEDDING.audioSrc` in `js/main.js`. Renamed from its download
name on the way in: the original had spaces and parentheses, which have to be
percent-encoded in a URL and are a reliable source of 404s on static hosts.

## Tracked in git

Committed directly (a 3.9MB commercially released recording), since the site
is deployed via GitHub Pages from this repo, which serves whatever's
committed. The repo is public, so treat this file as public.

## Format

96 kbps stereo, 44.1 kHz, 5:26, 3.9MB. Left as downloaded — 96 kbps is already
lean for solo piano, and re-encoding lower would be audible for little saving.

## How it loads

`preload="none"` on the `<audio>` element, so nothing is fetched until the
envelope is opened — verified: `networkState` is 1 (NETWORK_IDLE) on a cold
load, and the file only starts arriving on the tap. It never sits on the
critical path, and a guest who never opens the invitation never pays for it.

`loop` is set, matching the reference: 5:26 is shorter than most guests will
spend on the page.

## Replacing it

Drop any mp3 or m4a in as `music.mp3` and it takes over with no code change.
If the filename differs, update `WEDDING.audioSrc` to match.
