/* ============================================================
   The Sacred Garden — wedding invitation
   Phase 0: the WEDDING config and the binding that renders it.

   EVERY wedding detail lives in the WEDDING object below and
   nowhere else. The reference site's countdown and its printed
   date disagreed by three months because they were two separate
   settings; here they are one value read twice.
   ============================================================ */

'use strict';

/* ---------- 1 · Config -------------------------------------
   PLACEHOLDER CONTENT — replaced wholesale in Phase 13.
   ----------------------------------------------------------- */

const WEDDING = {

  couple: {
    // Order matters: `one` reads first in the hero stack.
    one: 'Zohan',
    two: 'Rose',
    // Wax seal monogram (Phase 1 / Phase 2).
    monogram: 'R&Z',
  },

  // ISO 8601 WITH offset. The offset is not optional — without it the
  // countdown silently shifts by the guest's own timezone.
  // 27 Sept 2026, 5:00 PM, America/New_York (EDT, -04:00).
  datetime: '2026-09-27T17:00:00-04:00',

  // The wedding's own timezone. Everything printed on the page is rendered
  // in *this* zone, so a guest reading from Sydney still sees the date and
  // time the wedding actually happens at, not their local translation.
  timezone: 'America/New_York',

  // How the date is printed in the hero. Mirrors the reference's `27.09.26`.
  dateFormat: 'dotted',

  venue: {
    name: 'Islamic Center of Melville',
    addressLines: ['118 Old East Neck Road', 'Melville, NY 11747'],
    // Used by the map embed and the Open in Maps link (Phase 8).
    lat: 40.7987,
    lng: -73.4137,
  },

  // Last date a guest can respond. Date-only; the deadline is end of day.
  rsvpDeadline: '2026-09-06',

  // Rendered as the timeline in Phase 7. Add or remove stops freely.
  schedule: [
    { time: '5 PM', event: 'Guest Arrival'   },
    { time: '6 PM', event: 'Nikkah Ceremony' },
    { time: '7 PM', event: 'Mocktail Hour'   },
    { time: '8 PM', event: 'Dinner'          },
    { time: '9 PM', event: 'Dance'           },
  ],

  dressCode: 'We kindly ask guests to avoid deep red and maroon attire for the celebration.',
  giftPreference: 'Kindly, no boxed gifts please.',

  // Phase 10 fills this in after the Apps Script is deployed.
  rsvpEndpoint: '',

  // Phase 11. Relative path into assets/audio/.
  audioSrc: '',

  gate: {
    // How long the envelope remembers it has been opened:
    //   'session' — a guest who already opened it this browsing session goes
    //               straight in, but a fresh visit gets the moment again
    //   'never'   — always gate (what the reference does)
    //   'forever' — opened once, never gated again on this device
    remember: 'session',
  },
};

/* ---------- 2 · Derived values -----------------------------
   Nothing below is authored by hand; it all falls out of §1.
   ----------------------------------------------------------- */

const WEDDING_DATE = new Date(WEDDING.datetime);

const TZ = WEDDING.timezone;

/** Format `d` in the wedding's timezone, never the reader's. */
function inVenueZone(d, locale, options) {
  return new Intl.DateTimeFormat(locale, { timeZone: TZ, ...options }).format(d);
}

const fmt = {
  /** `27.09.26` */
  dotted(d) {
    return inVenueZone(d, 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
      .replace(/\//g, '.');
  },

  /** `27 September 2026` */
  long(d) {
    return inVenueZone(d, 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  /** `September 6` — for the RSVP deadline line. */
  monthDay(d) {
    return inVenueZone(d, 'en-US', { month: 'long', day: 'numeric' });
  },

  /** `5:00 PM`, no leading zero. */
  time(d) {
    return inVenueZone(d, 'en-US', { hour: 'numeric', minute: '2-digit' });
  },
};

/**
 * Values addressable from markup as `data-wedding="key"`.
 * Add a key here rather than reaching into WEDDING from a section script.
 */
const WEDDING_TEXT = {
  'couple.one':      WEDDING.couple.one,
  'couple.two':      WEDDING.couple.two,
  'couple.both':     `${WEDDING.couple.one} and ${WEDDING.couple.two}`,
  'couple.monogram': WEDDING.couple.monogram,

  'date':      fmt[WEDDING.dateFormat](WEDDING_DATE),
  'date.long': fmt.long(WEDDING_DATE),
  'time':      fmt.time(WEDDING_DATE),

  'venue.name':    WEDDING.venue.name,
  'venue.address': WEDDING.venue.addressLines.join(', '),

  // Anchored at noon UTC so the date-only deadline lands on the intended
  // calendar day once re-expressed in the venue's timezone.
  'rsvp.deadline': fmt.monthDay(new Date(`${WEDDING.rsvpDeadline}T12:00:00Z`)),

  'dressCode':      WEDDING.dressCode,
  'giftPreference': WEDDING.giftPreference,
};

/* ---------- 3 · Binding ------------------------------------
   <span data-wedding="venue.name"></span> gets filled on load.
   Text only — never HTML, so config content can't inject markup.
   ----------------------------------------------------------- */

function bindWeddingText(root = document) {
  root.querySelectorAll('[data-wedding]').forEach((el) => {
    const key = el.dataset.wedding;
    if (key in WEDDING_TEXT) {
      el.textContent = WEDDING_TEXT[key];
    } else {
      console.warn(`[wedding] unknown data-wedding key: "${key}"`);
    }
  });

  // <time> elements get a machine-readable datetime alongside the text.
  root.querySelectorAll('time[data-wedding]').forEach((el) => {
    el.dateTime = WEDDING.datetime;
  });
}

/* ---------- 4 · Shared helpers ------------------------------ */

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Storage that shrugs rather than throws — Safari private mode blocks it. */
const store = {
  get(key) {
    try {
      return sessionStorage.getItem(key) ?? localStorage.getItem(key);
    } catch { return null; }
  },
  set(key, value, scope) {
    try {
      (scope === 'forever' ? localStorage : sessionStorage).setItem(key, value);
    } catch { /* not worth bothering the guest about */ }
  },
};

/* ---------- 5 · Envelope gate (Phase 2) --------------------
   Timings here mirror the transitions in css/style.css §6.5.
   ----------------------------------------------------------- */

const GATE_KEY = 'wedding.gate.opened';
const FLAP_MS = 1050;   /* .gate__flap transition */
const LIFT_MS = 1100;   /* .gate transition       */

function initGate() {
  const gate = document.getElementById('gate');
  const main = document.getElementById('invitation');
  if (!gate) return;

  const wasOpened =
    WEDDING.gate.remember !== 'never' && store.get(GATE_KEY) === '1';

  if (wasOpened) {
    gate.hidden = true;
    return;                       // straight in, no lock, no animation
  }

  lockScroll(true);
  if (main) main.inert = true;    // keep tab focus out of the page behind

  let opening = false;

  const open = () => {
    if (opening) return;
    opening = true;

    if (WEDDING.gate.remember !== 'never') {
      store.set(GATE_KEY, '1', WEDDING.gate.remember);
    }

    // Phase 11 listens for this: audio may only start from a real gesture.
    document.dispatchEvent(new CustomEvent('wedding:open'));

    const flapTime = prefersReducedMotion() ? 0 : FLAP_MS;

    gate.classList.add('is-opening');

    // The flap swings, then the envelope lifts away, then it is gone.
    window.setTimeout(() => {
      gate.classList.add('is-open');
      lockScroll(false);
      if (main) main.inert = false;

      window.setTimeout(() => {
        gate.hidden = true;
        // Land the guest at the top of the invitation, not mid-page.
        document.getElementById('hero')?.focus({ preventScroll: true });
      }, LIFT_MS);
    }, flapTime * 0.62);          // overlap: the lift starts mid-swing
  };

  gate.addEventListener('click', open);
  gate.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
}

function lockScroll(locked) {
  document.body.classList.toggle('is-gated', locked);
}

/* ---------- 6 · Boot --------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  bindWeddingText();
  initGate();

  // Phase 4  · scroll reveals
  // Phase 6  · countdown tick
  // Phase 7  · schedule from WEDDING.schedule
  // Phase 10 · RSVP modal + submit
  // Phase 11 · music player
});
