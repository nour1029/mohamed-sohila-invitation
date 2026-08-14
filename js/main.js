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

   What lives here: anything the code reasons about, or anything
   printed in more than one place — names, the date, the venue,
   the schedule. What lives in index.html instead: one-off prose
   (the invitation paragraph, the dress code, the gift note).
   Keeping a sentence in both files is how it drifts.
   ----------------------------------------------------------- */

const WEDDING = {

  couple: {
    // Order matters: `one` reads first in the hero stack.
    one: 'Mazen',
    two: 'Shams',
    // Wax seal monogram (Phase 1 / Phase 2). NOTE: the envelope's still and
    // its opening film are photographed wax, not live text — they still
    // read "R&Z" and do not update from this value. See assets/img/README.md.
    monogram: 'M&S',
  },

  // ISO 8601 WITH offset. The offset is not optional — without it the
  // countdown silently shifts by the guest's own timezone.
  // 29 Aug 2026, 5:00 PM, America/New_York (EDT, -04:00). Time carried over
  // from the placeholder — confirm the actual ceremony start time.
  datetime: '2026-08-29T17:00:00-04:00',

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
  // The wedding is only 16 days out, so the placeholder's 3-week lead time
  // would land in the past — the exact bug REFERENCE.md flags in the
  // reference site. Set to one week before instead; confirm with the couple.
  rsvpDeadline: '2026-08-22',

  // Rendered as the timeline in Phase 7. Add or remove stops freely.
  schedule: [
    { time: '5 PM', event: 'Guest Arrival'   },
    { time: '6 PM', event: 'Nikkah Ceremony' },
    { time: '7 PM', event: 'Mocktail Hour'   },
    { time: '8 PM', event: 'Dinner'          },
    { time: '9 PM', event: 'Dance'           },
  ],

  // Phase 10 fills this in after the Apps Script is deployed.
  rsvpEndpoint: '',

  // Phase 11. Relative path into assets/audio/.
  audioSrc: '',

  // TODO Phase 13: a real number. Shown when a submission fails — an RSVP
  // that cannot reach the sheet must still reach a human.
  contact: {
    name: 'Rose',
    phone: '+1 555 000 0000',
  },

  gate: {
    // How long the envelope remembers it has been opened:
    //   'never'   — always gate. Every guest opens the envelope every time;
    //               it is the first impression and nobody should miss it.
    //   'session' — skipped for the rest of the browsing session
    //   'forever' — opened once, never gated again on this device
    remember: 'never',
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
   Still of the sealed envelope, then a short film of it opening
   that dissolves as it ends.

   Every branch here has to end with the guest inside. A video
   that will not load, will not decode, or silently stalls must
   never leave someone staring at a sealed envelope.
   ----------------------------------------------------------- */

const GATE_KEY  = 'wedding.gate.opened';
const FADE_MS   = 900;    /* .gate__still / .gate__film fade  */
const DISSOLVE_MS = 800;  /* .gate fade once the film is done */

function initGate() {
  const gate  = document.getElementById('gate');
  const video = document.getElementById('gate-video');
  const main  = document.getElementById('invitation');
  if (!gate) return;

  const wasOpened =
    WEDDING.gate.remember !== 'never' && store.get(GATE_KEY) === '1';

  if (wasOpened) {
    gate.hidden = true;
    return;                       // straight in, no lock, no film
  }

  lockScroll(true);
  if (main) main.inert = true;    // keep tab focus out of the page behind

  let opening = false;
  let finished = false;

  /** Let the guest in. Safe to call twice; only the first call counts. */
  const finish = () => {
    if (finished) return;
    finished = true;

    gate.classList.add('is-closing');
    gate.classList.add('is-open');
    lockScroll(false);
    if (main) main.inert = false;

    window.setTimeout(() => {
      gate.hidden = true;
      video?.pause();
      document.getElementById('hero')?.focus({ preventScroll: true });
    }, DISSOLVE_MS);
  };

  const open = () => {
    if (opening) return;
    opening = true;

    if (WEDDING.gate.remember !== 'never') {
      store.set(GATE_KEY, '1', WEDDING.gate.remember);
    }

    // Phase 11 listens for this: audio may only start from a real gesture.
    document.dispatchEvent(new CustomEvent('wedding:open'));

    // Stillness means no film either — fade straight through.
    if (prefersReducedMotion() || !video) {
      finish();
      return;
    }

    gate.classList.add('is-playing');

    // Begin the dissolve just before the last frame, so the film never
    // shows its final frozen frame or a flash of black.
    const watchForEnd = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const remaining = (video.duration - video.currentTime) * 1000;
      if (remaining <= FADE_MS) finish();
    };
    video.addEventListener('timeupdate', watchForEnd);
    video.addEventListener('ended', finish);

    // If it cannot play at all, do not strand the guest behind it.
    video.addEventListener('error', finish);
    video.addEventListener('stalled', finish);

    const played = video.play();
    if (played && played.catch) played.catch(finish);

    // Backstop: if the video never fires a single event — a decode failure
    // on an old phone, say — let them in on the clock instead.
    const cap = (video.duration && !Number.isNaN(video.duration))
      ? video.duration * 1000 + 1200
      : 7000;
    window.setTimeout(finish, cap);
  };

  gate.addEventListener('click', open);
  gate.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
}

function lockScroll(locked) {
  document.body.classList.toggle('is-gated', locked);
}

/* ---------- 6 · Scroll reveals (Phase 4) -------------------
   Fades elements up as they arrive, once each. Anything marked
   `data-reveal` moves on its own; `data-reveal-stagger` cascades
   its children.
   ----------------------------------------------------------- */

function initReveals() {
  const targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (!targets.length) return;

  const revealNow = (el) => el.classList.add('is-revealed');

  // No observer, or the guest asked for stillness: show everything outright.
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach(revealNow);
    return;
  }

  // Number the children so CSS can space their delays out.
  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.style.setProperty('--reveal-i', i);
    });
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealNow(entry.target);
      obs.unobserve(entry.target);      // fires once; scrolling back up is calm
    });
  }, {
    threshold: 0.12,
    // The huge top margin counts anything already scrolled past as arrived.
    // Without it, a guest who jumps down the page — a deep link, a fast
    // fling, a find-in-page — leaves every skipped section stranded at
    // opacity 0 permanently, because it never intersects on the way back.
    // The bottom margin holds a reveal off until the element is properly
    // in, rather than the instant its first pixel crosses the fold.
    rootMargin: '9999px 0px -8% 0px',
  });

  targets.forEach((el) => observer.observe(el));
}

/* ---------- 7 · Countdown (Phase 6) ------------------------
   Counts down to WEDDING_DATE — the same value the hero prints,
   so the two can never disagree the way the reference's did.
   ----------------------------------------------------------- */

const MS = { second: 1000, minute: 60000, hour: 3600000, day: 86400000 };

/**
 * A unit rolls out and back in on change, rather than the text just
 * jumping — mirrors the reference's own "flip" transition. 520ms matches
 * its .55s transform/opacity transition, so the swap lands mid-motion
 * instead of stalling on a held frame.
 */
function flipDigit(el, newValue) {
  if (el.textContent === newValue) return;
  el.classList.add('is-leaving');
  window.setTimeout(() => {
    el.classList.remove('is-leaving');
    el.classList.add('is-entering');
    el.textContent = newValue;
    void el.offsetHeight;               // force reflow so the next class removal animates
    el.classList.remove('is-entering');
  }, 520);
}

function initCountdown() {
  const clock = document.getElementById('countdown-clock');
  const after = document.getElementById('countdown-after');
  if (!clock) return;

  const fields = {};
  clock.querySelectorAll('[data-count]').forEach((el) => {
    fields[el.dataset.count] = el;
  });

  // The gold ink-wipe and shimmer only ever play once, the first time the
  // clock scrolls into view — same trigger the reference uses.
  const revealables = clock.querySelectorAll('.count__value, .count__label, .count__sep');
  const reveal = () => revealables.forEach((el) => el.classList.add('is-revealed'));

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    reveal();
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        reveal();
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(clock);
  }

  let timer = null;
  let first = true;

  const tick = () => {
    const remaining = WEDDING_DATE.getTime() - Date.now();

    if (remaining <= 0) {
      // The celebration is under way or done. Say something warm rather
      // than showing a clock stuck on zero.
      const sinceStart = -remaining;
      after.textContent = sinceStart < MS.day
        ? "Today's the day"
        : 'Thank you for celebrating with us';
      after.hidden = false;
      clock.hidden = true;
      if (timer) clearInterval(timer);
      return;
    }

    const pad = (n) => String(n).padStart(2, '0');
    const next = {
      days:    String(Math.floor(remaining / MS.day)),
      hours:   pad(Math.floor(remaining / MS.hour)   % 24),
      minutes: pad(Math.floor(remaining / MS.minute) % 60),
      seconds: pad(Math.floor(remaining / MS.second) % 60),
    };

    if (first) {
      // The opening render sets every digit directly — nothing is on
      // screen yet for a flip to be worth animating, and it would only
      // add motion behind the ink-wipe reveal.
      Object.entries(next).forEach(([unit, value]) => { fields[unit].textContent = value; });
      first = false;
    } else {
      Object.entries(next).forEach(([unit, value]) => flipDigit(fields[unit], value));
    }
  };

  tick();
  timer = window.setInterval(tick, MS.second);
}

/* ---------- 8 · Schedule (Phase 7) ------------------------- */

function initSchedule() {
  const list = document.getElementById('schedule-list');
  if (!list) return;

  const stops = WEDDING.schedule.map(({ time, event }) => {
    const li = document.createElement('li');
    li.className = 'timeline__stop';

    const t = document.createElement('span');
    t.className = 'timeline__time';
    t.textContent = time;

    const node = document.createElement('span');
    node.className = 'timeline__node';
    node.setAttribute('aria-hidden', 'true');

    const e = document.createElement('span');
    e.className = 'timeline__event';
    e.textContent = event;

    li.append(t, node, e);
    return li;
  });

  list.replaceChildren(...stops);
}

/* The reference's peony is not pinned to the first stop — it migrates
   down through every node as the guest scrolls (data-animate-sbs-event
   "scroll", 5 keyframes at node-spaced offsets, triggered at the
   viewport's midpoint). CSS alone can position it at the first node; the
   travel itself needs scroll position, so it lives here as a
   --rose-shift custom property .timeline::after reads.
   Measures actual node centres rather than assuming the --row spacing,
   so it holds if a label ever wraps to two lines and a row grows. */
function initScheduleRose() {
  const timeline = document.querySelector('.timeline');
  const nodes = timeline?.querySelectorAll('.timeline__node');
  if (!timeline || !nodes || nodes.length < 2) return;
  if (prefersReducedMotion()) return;   // stays put at the first node

  let ticking = false;

  const update = () => {
    ticking = false;
    const rect = timeline.getBoundingClientRect();
    const first = nodes[0].getBoundingClientRect();
    const last = nodes[nodes.length - 1].getBoundingClientRect();
    const travel = (last.top + last.height / 2) - (first.top + first.height / 2);

    // 0 when the timeline's own top reaches mid-viewport, 1 once its
    // bottom has — the same "trigger at 50%" the reference scrubs against.
    let progress = (window.innerHeight * 0.5 - rect.top) / rect.height;
    progress = Math.min(1, Math.max(0, progress));

    timeline.style.setProperty('--rose-shift', `${(progress * travel).toFixed(1)}px`);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

/* ---------- 9 · Venue and map (Phase 8) --------------------
   Coordinates live only in WEDDING.venue; both the embed and the
   directions link are built from them here.
   ----------------------------------------------------------- */

function initVenue() {
  const { lat, lng, name, addressLines } = WEDDING.venue;
  const coords = `${lat},${lng}`;
  const fullAddress = [name, ...addressLines].join(', ');

  // Plain embed URL — no API key, no billing account to keep alive.
  const map = document.getElementById('venue-map');
  if (map) {
    map.src = `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&z=16&output=embed`;
    map.title = `Map showing ${name}`;
  }

  const link = document.getElementById('venue-directions');
  if (!link) return;

  // Apple Maps is the native handler on iOS and iPadOS; sending those guests
  // to a google.com URL bounces them through the browser or a store page.
  // iPadOS reports itself as a Mac, so touch support disambiguates.
  const ua = navigator.userAgent;
  const isApple = /iPad|iPhone|iPod/.test(ua) ||
                  (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

  link.href = isApple
    ? `https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}&ll=${coords}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}`;

  link.target = '_blank';
  link.rel = 'noopener';
}

/* ---------- 10 · RSVP (Phase 10) ---------------------------
   The only part with a backend, and the only part that must not
   fail quietly. Every failure path ends with the guest being told
   how to reach a person.
   ----------------------------------------------------------- */

function initRsvp() {
  const modal  = document.getElementById('rsvp-modal');
  const form   = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  const submit = document.getElementById('rsvp-submit');
  const openBtn  = document.getElementById('rsvp-open');
  const closeBtn = document.getElementById('rsvp-close');
  if (!modal || !form) return;

  /* -- open / close ---------------------------------------- */

  // showModal() gives the focus trap, Esc handling and focus restore.
  // Focus the card rather than the first input: autofocusing a text field
  // throws up the phone keyboard before the guest has read the form.
  openBtn?.addEventListener('click', () => {
    modal.showModal();
    modal.querySelector('.modal__card')?.focus();
  });
  closeBtn?.addEventListener('click', () => modal.close());

  // Click outside the card. The dialog element fills the viewport, so a
  // click landing on it rather than on .modal__card is a backdrop click.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  /* -- validation ------------------------------------------ */

  const setError = (fieldEl, errorEl, message) => {
    fieldEl.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) {
      errorEl.textContent = message ?? '';
      errorEl.hidden = !message;
    }
  };

  const validate = () => {
    const errors = [];
    const data = new FormData(form);

    const nameField = document.getElementById('rsvp-name').closest('.field');
    const name = String(data.get('name') ?? '').trim();
    if (!name) {
      setError(nameField, document.getElementById('rsvp-name-error'),
        'Please let us know who you are.');
      errors.push('name');
    } else {
      setError(nameField, document.getElementById('rsvp-name-error'), null);
    }

    const attendingField = form.querySelector('.field--choice');
    if (!data.get('attending')) {
      setError(attendingField, document.getElementById('rsvp-attending-error'),
        'Please choose one so we can plan the seating.');
      errors.push('attending');
    } else {
      setError(attendingField, document.getElementById('rsvp-attending-error'), null);
    }

    const guestsField = document.getElementById('rsvp-guests').closest('.field');
    const guests = String(data.get('guests') ?? '').trim();
    if (guests && !/^\d{1,3}$/.test(guests)) {
      setError(guestsField, document.getElementById('rsvp-guests-error'),
        'A number, please — for example 2.');
      errors.push('guests');
    } else {
      setError(guestsField, document.getElementById('rsvp-guests-error'), null);
    }

    return errors;
  };

  /* -- submit ---------------------------------------------- */

  const setStatus = (message, kind) => {
    status.className = kind ? `form__status form__status--${kind}` : 'form__status';
    status.textContent = '';
    if (message) status.append(message);
  };

  /** Never let an RSVP evaporate: always hand back a way to reach a person. */
  const failureMessage = () => {
    const fragment = document.createDocumentFragment();
    const { name, phone } = WEDDING.contact;
    fragment.append(
      'That did not send, and we would hate to miss you. Please text ',
      Object.assign(document.createElement('a'), {
        href: `sms:${phone.replace(/[^\d+]/g, '')}`,
        textContent: `${name} on ${phone}`,
      }),
      ' instead.',
    );
    return fragment;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errors = validate();
    if (errors.length) {
      setStatus('', null);
      form.querySelector('.is-invalid input')?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    submit.disabled = true;
    submit.querySelector('.btn__label').textContent = 'Sending…';
    setStatus('', null);

    try {
      if (!WEDDING.rsvpEndpoint) {
        // Not deployed yet. Say so plainly rather than showing a fake success.
        throw new Error('RSVP endpoint is not configured');
      }

      // No Content-Type header on purpose: that keeps this a "simple"
      // request, so the browser skips the CORS preflight, which Apps
      // Script cannot answer.
      const response = await fetch(WEDDING.rsvpEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json().catch(() => ({ ok: true }));
      if (result.ok === false) throw new Error(result.error || 'rejected');

      form.hidden = true;
      setStatus(
        data.attending?.startsWith('Accepts')
          ? 'Thank you — we cannot wait to celebrate with you.'
          : 'Thank you for letting us know. You will be missed.',
        'success',
      );
      status.hidden = false;

    } catch (error) {
      console.error('[wedding] RSVP submission failed:', error);
      setStatus(failureMessage(), 'error');
      submit.disabled = false;
      submit.querySelector('.btn__label').textContent = 'Try again';
    }
  });
}

/* ---------- 10.5 · Hero scene video ------------------------
   The hero's painting is a video. It only starts once the guest
   is through the envelope, and it never becomes load-bearing:
   the poster is the still plate, so a browser that cannot decode
   the file simply shows the painting.
   ----------------------------------------------------------- */

function initHeroVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;

  // Stillness means stillness — leave the poster showing.
  if (prefersReducedMotion()) return;

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    video.preload = 'auto';
    video.load();
    const played = video.play();
    // A refusal or a codec the browser cannot handle is fine: the poster
    // is the same artwork, so there is nothing to fall back to or fix.
    if (played && played.catch) played.catch(() => {});
  };

  document.addEventListener('wedding:open', start, { once: true });

  // If the gate was skipped entirely, wedding:open never fires.
  if (document.getElementById('gate')?.hidden) start();
}

/* ---------- 11 · Music player (Phase 11) -------------------
   Starts when the envelope opens, because that is the one moment
   we are guaranteed a real user gesture — mobile browsers refuse
   audio without one.
   ----------------------------------------------------------- */

function initMusic() {
  const button = document.getElementById('music-toggle');
  const audio  = document.getElementById('music-audio');
  const label  = document.getElementById('music-label');
  if (!button || !audio) return;

  // Nothing to play yet: leave the button hidden rather than offering a
  // control that does nothing.
  if (!WEDDING.audioSrc) return;

  audio.src = WEDDING.audioSrc;
  audio.volume = 0.55;
  button.hidden = false;

  // The icon is driven by the audio element's own events, not by what we
  // asked it to do — so it always shows what is actually happening, even
  // if the browser or the phone's media controls overrule us.
  const sync = () => {
    const playing = !audio.paused;
    button.classList.toggle('is-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    label.textContent = playing ? 'Pause music' : 'Play music';
  };

  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('ended', sync);
  sync();

  button.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(sync);
    else audio.pause();
  });

  // Fired by the envelope gate. If the browser still refuses, the button
  // simply stays in its paused state for the guest to press.
  document.addEventListener('wedding:open', () => {
    if (prefersReducedMotion()) return;   // stillness means sound too
    audio.play().catch(() => sync());
  }, { once: true });
}

/* ---------- 12 · Boot -------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  bindWeddingText();
  initGate();

  // Schedule stops must exist before the observer numbers them for stagger,
  // and before the rose can measure their positions.
  initSchedule();
  initScheduleRose();
  initCountdown();
  initVenue();
  initRsvp();

  // Both register their wedding:open listeners before the gate can fire it.
  initMusic();
  initHeroVideo();

  initReveals();
});
