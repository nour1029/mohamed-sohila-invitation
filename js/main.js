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

/* ---------- 4 · Boot --------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  bindWeddingText();

  // Phase 2  · envelope gate
  // Phase 4  · scroll reveals
  // Phase 6  · countdown tick
  // Phase 7  · schedule from WEDDING.schedule
  // Phase 10 · RSVP modal + submit
  // Phase 11 · music player
});
