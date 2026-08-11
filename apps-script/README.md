# RSVP endpoint — deploy steps

Two minutes, one Google account. At the end you hand back a URL.

Everything else in the invitation is already built; this is the only piece
that needs you.

---

## 1 · Make the sheet

1. Go to [sheets.new](https://sheets.new) — this creates a blank spreadsheet.
2. Name it something you'll recognise, e.g. **Wedding RSVPs**.

Leave it empty. The script writes its own header row the first time
someone responds.

## 2 · Add the script

3. In that spreadsheet: **Extensions → Apps Script**.
4. Delete the `function myFunction() { }` stub that's already in the editor.
5. Paste in the entire contents of [`Code.gs`](./Code.gs).
6. Click the **save** icon (or ⌘S).

## 3 · Deploy it

7. Click **Deploy → New deployment**.
8. Next to *Select type*, click the gear icon and choose **Web app**.
9. Set:
   - **Description:** anything, e.g. `RSVP v1`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone** ← this one matters. Not "Anyone with
     Google account" — your guests will not be signed in.
10. Click **Deploy**.
11. Google will ask you to authorise it. Click **Authorize access**, pick your
    account, then on the "Google hasn't verified this app" screen click
    **Advanced → Go to (your project name)**, then **Allow**.

    > That warning is normal and expected. It appears for every personal
    > Apps Script project; it means unverified-by-Google, not unsafe. You are
    > granting your own script access to your own spreadsheet.

12. Copy the **Web app URL**. It looks like:
    `https://script.google.com/macros/s/AKfycb…/exec`

## 4 · Hand it back

Paste that URL into `js/main.js`:

```js
rsvpEndpoint: 'https://script.google.com/macros/s/AKfycb…/exec',
```

That's it. Test it by opening the URL directly in a browser — you should see
`{"ok":true,"message":"RSVP endpoint is running."}`.

---

## If you change `Code.gs` later

Deploy → **Manage deployments** → pencil icon → **Version: New version** →
**Deploy**. The URL stays the same.

Creating a *new* deployment instead gives you a *new* URL, and the site will
keep posting to the old one — the usual way this silently breaks.

## Notes

- **The sheet is private.** The web app runs as you and writes to your sheet;
  "Anyone" only means anyone may POST to the endpoint, not that anyone can
  read the responses.
- **Values starting with `=`, `+`, `-` or `@`** are prefixed with an
  apostrophe before being written, so a guest cannot inject a spreadsheet
  formula into your RSVP list.
- **Failures are not swallowed.** If the endpoint is unreachable, the form
  tells the guest to text you instead, and logs the error. Set the real
  number in `WEDDING.contact` before sending the invitation out.
