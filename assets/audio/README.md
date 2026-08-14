# Audio

| File | Notes |
|---|---|
| `music.mp3` | The track that plays when the envelope opens. **Not in git — see below.** |

Wired up via `WEDDING.audioSrc` in `js/main.js`. Renamed from its download
name on the way in: the original had spaces and parentheses, which have to be
percent-encoded in a URL and are a reliable source of 404s on static hosts.

## Not tracked in git

`.gitignore` excludes `assets/audio/*.mp3`. Two practical reasons: git history
is permanent, so a 3.9MB binary is in the repo forever once committed; and if
this repo is ever pushed anywhere public, a commercially released recording
goes with it. Neither is a problem while the file simply sits in the folder.

**This does not affect deploying.** Netlify Drop (and every other static host)
uploads the folder, not the repo, so the file ships normally.

**It does affect cloning.** A fresh clone has no `music.mp3`, `WEDDING.audioSrc`
points at a file that isn't there, and — because `initMusic` checks the config
rather than the file — the button appears and the audio silently fails to play.
Copy the file across after cloning.

To track it instead, delete the `assets/audio/*.mp3` line from `.gitignore`.

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
