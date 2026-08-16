# Audio

| File | Notes |
|---|---|
| `music.mp3` | The track that plays when the envelope opens. |

Wired up via `WEDDING.audioSrc` in `js/main.js`, which points at this exact
filename — so replacing this file is the entire update, no code change.

Currently `ReelAudio-60127.mp3` as supplied, renamed on the way in. The
`60127`-style numeric suffix reads as a stock-library asset ID; worth
confirming the licence covers this use (a public wedding site) before the
site goes live, the same way the earlier Einaudi track needed checking.

## Tracked in git

Committed directly, since the site is deployed via GitHub Pages from this
repo, which serves whatever's committed. The repo is public, so treat this
file as public — don't commit something you don't have the right to publish.

## Format

128 kbps stereo, 44.1 kHz, 0:41, 640KB. Left as supplied.

## How it loads

`preload="none"` on the `<audio>` element, so nothing is fetched until the
envelope is opened — verified: `networkState` is 1 (NETWORK_IDLE) on a cold
load, and the file only starts arriving on the tap. It never sits on the
critical path, and a guest who never opens the invitation never pays for it.

`loop` is set. At 0:41 it repeats roughly every 41 seconds for guests who
stay on the page — worth a listen end-to-end to check the loop point doesn't
click or cut abruptly; short tracks made for reels/shorts are usually cut to
a beat rather than to loop seamlessly.

## Replacing it

Drop any mp3 or m4a in as `music.mp3` and it takes over with no code change.
If the filename differs, update `WEDDING.audioSrc` to match.
