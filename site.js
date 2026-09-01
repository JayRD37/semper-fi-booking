const header = document.querySelector('.site-header');
const button = document.querySelector('.menu-button');
const menu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.menu-overlay');
const menuLinks = [...menu.querySelectorAll('a')];
const closeMenu = () => {
  const wasOpen = menu.classList.contains('open');
  button.classList.remove('open');
  menu.classList.remove('open');
  overlay.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (wasOpen) button.focus();
};
const toggleMenu = () => {
  const open = !menu.classList.contains('open');
  button.classList.toggle('open', open);
  menu.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  button.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) menuLinks[0].focus();
};
button.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);
menuLinks.forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
  if (event.key === 'Tab' && menu.classList.contains('open')) {
    const first = menuLinks[0],
      last = menuLinks[menuLinks.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener(
  'scroll',
  () => header.classList.toggle('is-scrolled', window.scrollY > 24),
  { passive: true },
);
const form = document.querySelector('#booking-form');
const clearButton = document.querySelector('.clear-draft');
const formNote = document.querySelector('.form-note');
const draftKey = 'semperFiBookingDraft';
const artistField = document.createElement('div');
artistField.className = 'field';
artistField.innerHTML =
  '<label for="inquiry-artist">Artist</label><select id="inquiry-artist" name="artist"><option value="">Choose an artist</option><option>Anthony Segovia</option><option>The Traynr Band</option><option>Briella Steiner</option><option>The Wicked</option><option>Not sure yet</option></select>';
form.querySelector('#inquiry-type').closest('.field').before(artistField);
const artistSelect = artistField.querySelector('select');
const draftFields = [
  'name',
  'email',
  'phone',
  'organization',
  'artist',
  'eventType',
  'eventDate',
  'city',
  'state',
  'capacity',
  'budget',
  'details',
];
const saveDraft = () => {
  const data = Object.fromEntries(
    draftFields.map((field) => [field, form.elements[field]?.value || '']),
  );
  localStorage.setItem(draftKey, JSON.stringify(data));
};
const loadDraft = () => {
  try {
    const data = JSON.parse(localStorage.getItem(draftKey) || '{}');
    Object.entries(data).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  } catch {
    localStorage.removeItem(draftKey);
  }
};
form.addEventListener('input', saveDraft);
form.addEventListener('submit', () => {
  if (!form.reportValidity()) return;
  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
});
clearButton.addEventListener('click', () => {
  if (!confirm('Clear the saved booking draft from this device?')) return;
  form.reset();
  localStorage.removeItem(draftKey);
  formNote.textContent = 'Saved draft cleared.';
});
document.querySelector('.hero-copy').textContent =
  'Booking artists for venues, festivals, and events. Call us when you need help finding the right fit.';
document.querySelector('.booking-intro .eyebrow').textContent =
  'Booking Details';
document.querySelector('.booking-intro>p:not(.eyebrow)').textContent =
  'Send the event details and we will follow up about availability and fit.';
clearButton.textContent = 'Clear Saved Draft';
loadDraft();
if (new URLSearchParams(window.location.search).get('inquiry') === 'sent') {
  form.reset();
  localStorage.removeItem(draftKey);
  formNote.textContent = 'Inquiry sent. Semper Fi will follow up using the contact information you provided.';
  formNote.classList.add('form-note-success');
}
const roster = document.querySelector('.roster');
const artistTrack = roster.querySelector('.artist-track');
const artistSlides = [...roster.querySelectorAll('.artist-slide')];
const rosterDots = [...roster.querySelectorAll('.roster-dots button')];
const dotRail = roster.querySelector('.roster-dots');
const rosterViewport = roster.querySelector('.roster-viewport');
const firstClone = artistSlides[0].cloneNode(true);
const lastClone = artistSlides.at(-1).cloneNode(true);
firstClone.setAttribute('aria-hidden', 'true');
lastClone.setAttribute('aria-hidden', 'true');
firstClone.inert = true;
lastClone.inert = true;
artistTrack.prepend(lastClone);
artistTrack.append(firstClone);
let artistIndex = 0;
let physicalIndex = 1;
let isSliding = false;
let swipeStart = 0;
let swipePointer = null;
const sizeRoster = () => {
  rosterViewport.style.height = `${artistSlides[artistIndex].offsetHeight}px`;
};
const snapToPhysical = (index) => {
  artistTrack.style.transition = 'none';
  physicalIndex = index;
  artistTrack.style.transform = `translateX(-${physicalIndex * 100}%)`;
  void artistTrack.offsetWidth;
  artistTrack.style.transition = '';
};
const labelIndicatorBars = () =>
  [...dotRail.children].forEach((bar, i) =>
    bar.setAttribute(
      'aria-label',
      ['Previous artist', 'Current artist', 'Next artist'][i],
    ),
  );
const moveIndicatorBars = (direction) => {
  const bars = [...dotRail.children];
  const shift = direction * 44;
  const animations = bars.map((bar, i) => {
    const destination = i + (direction < 0 ? -1 : 1);
    const startOpacity = i === 1 ? 1 : 0.28;
    const endOpacity =
      destination === 1 ? 1 : destination < 0 || destination > 2 ? 0 : 0.28;
    return bar.animate(
      [
        { transform: 'translateX(0)', opacity: startOpacity },
        { transform: `translateX(${shift}px)`, opacity: endOpacity },
      ],
      {
        duration: 550,
        easing: 'cubic-bezier(.22,.61,.36,1)',
        fill: 'forwards',
      },
    );
  });
  setTimeout(() => {
    if (direction < 0) dotRail.append(bars[0]);
    else dotRail.prepend(bars[2]);
    animations.forEach((animation) => animation.cancel());
    labelIndicatorBars();
  }, 550);
};
labelIndicatorBars();
const showArtist = (index, instant = false) => {
  const previous = artistIndex;
  if (!instant) {
    const direction = index >= previous ? -1 : 1;
    moveIndicatorBars(direction);
  }
  artistIndex = (index + artistSlides.length) % artistSlides.length;
  let target = artistIndex + 1;
  if (
    !instant &&
    previous === artistSlides.length - 1 &&
    index >= artistSlides.length
  )
    target = artistSlides.length + 1;
  if (!instant && previous === 0 && index < 0) target = 0;
  physicalIndex = target;
  if (instant) artistTrack.style.transition = 'none';
  else isSliding = true;
  artistTrack.style.transform = `translateX(-${physicalIndex * 100}%)`;
  artistSlides.forEach((slide, i) => {
    const active = i === artistIndex;
    slide.setAttribute('aria-hidden', String(!active));
    slide.inert = !active;
  });
  rosterDots.forEach((dot) => dot.setAttribute('aria-pressed', 'false'));
  requestAnimationFrame(sizeRoster);
  if (!instant)
    artistTrack.addEventListener(
      'transitionend',
      () => {
        if (target === 0) snapToPhysical(artistSlides.length);
        if (target === artistSlides.length + 1) snapToPhysical(1);
        isSliding = false;
      },
      { once: true },
    );
  if (instant) {
    void artistTrack.offsetWidth;
    artistTrack.style.transition = '';
  }
};
let autoCycleTimer = 0;
let resumeCycleTimer = 0;
let holdUntil = 0;
const clearCycleTimers = () => {
  clearTimeout(autoCycleTimer);
  clearTimeout(resumeCycleTimer);
};
const scheduleAutoCycle = () => {
  clearCycleTimers();
  if (document.hidden || roster.contains(document.activeElement)) return;
  const remaining = holdUntil - Date.now();
  if (remaining > 0) {
    resumeCycleTimer = setTimeout(scheduleAutoCycle, remaining);
    return;
  }
  autoCycleTimer = setTimeout(() => {
    if (
      !document.hidden &&
      !roster.contains(document.activeElement) &&
      !isSliding
    )
      showArtist(artistIndex + 1);
    scheduleAutoCycle();
  }, 10000);
};
const holdArtist = () => {
  holdUntil = Math.max(holdUntil, Date.now() + 120000);
  scheduleAutoCycle();
};
const chooseArtist = (index) => {
  if (isSliding) return;
  showArtist(index);
  holdArtist();
};
roster
  .querySelector('.roster-prev')
  .addEventListener('click', () => chooseArtist(artistIndex - 1));
roster
  .querySelector('.roster-next')
  .addEventListener('click', () => chooseArtist(artistIndex + 1));
dotRail.addEventListener('click', (event) => {
  const bar = event.target.closest('button');
  if (!bar) return;
  const position = [...dotRail.children].indexOf(bar);
  if (position === 0) chooseArtist(artistIndex - 1);
  else if (position === 2) chooseArtist(artistIndex + 1);
  else holdArtist();
});
roster.addEventListener('click', holdArtist);
roster.addEventListener('focusin', () => {
  clearCycleTimers();
});
roster.addEventListener('focusout', () =>
  setTimeout(() => {
    if (!roster.contains(document.activeElement)) {
      holdArtist();
    }
  }, 0),
);
rosterViewport.addEventListener('pointerdown', (event) => {
  if (
    event.target.closest('button,a') ||
    !event.isPrimary ||
    event.button !== 0
  )
    return;
  swipePointer = event.pointerId;
  swipeStart = event.clientX;
  rosterViewport.setPointerCapture(event.pointerId);
});
rosterViewport.addEventListener('pointerup', (event) => {
  if (event.pointerId !== swipePointer) return;
  const distance = event.clientX - swipeStart;
  swipePointer = null;
  if (rosterViewport.hasPointerCapture(event.pointerId))
    rosterViewport.releasePointerCapture(event.pointerId);
  if (Math.abs(distance) > 55)
    chooseArtist(artistIndex + (distance < 0 ? 1 : -1));
});
rosterViewport.addEventListener('pointercancel', (event) => {
  if (event.pointerId === swipePointer) swipePointer = null;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearCycleTimers();
  else scheduleAutoCycle();
});
artistSlides.forEach((slide) => {
  const link = slide.querySelector('.artist-booking');
  const artist = slide.getAttribute('aria-label');
  link.href = '#book-talent';
  link.dataset.artist = artist;
  link.addEventListener('click', () => {
    artistSelect.value = artist;
    saveDraft();
    setTimeout(() => artistSelect.focus(), 500);
  });
});
window.addEventListener('resize', sizeRoster, { passive: true });
const lastStart = Number(sessionStorage.getItem('semperFiLastArtist'));
const startChoices = artistSlides
  .map((_, index) => index)
  .filter((index) => index !== lastStart);
const randomStart =
  startChoices[Math.floor(Math.random() * startChoices.length)];
sessionStorage.setItem('semperFiLastArtist', String(randomStart));
showArtist(randomStart, true);
scheduleAutoCycle();
const bookingCall = document.createElement('a');
bookingCall.className = 'button button-outline booking-call';
bookingCall.href = 'tel:+14023047059';
bookingCall.innerHTML = 'Call Semper Fi <span>→</span>';
document.querySelector('.booking-intro').append(bookingCall);
document.querySelector('#inquiry-details').removeAttribute('placeholder');
document
  .querySelectorAll('#venues-promoters,#festivals-events')
  .forEach((section) => section.remove());
document
  .querySelectorAll('a[href="#venues-promoters"],a[href="#festivals-events"]')
  .forEach((link) => link.remove());
document.querySelectorAll('a[href="#about"]').forEach((link) => {
  link.href = '#shows';
  link.childNodes[0].textContent = 'Shows ';
});
const process = document.querySelector('.process');
process.outerHTML =
  '<section id="shows" class="section show-map"><div class="show-map-heading"><p class="eyebrow gold">Live Shows</p><h2>Where we’re playing.</h2><p>Approved dates from our artists appear here automatically.</p></div><div class="map-filter-groups"><fieldset class="map-filter-group"><legend>Artists</legend><div class="artist-filters" aria-label="Filter map by artist"><label><input type="checkbox" data-artist-filter="anthony-segovia" checked><span></span>Anthony Segovia</label><label><input type="checkbox" data-artist-filter="the-traynr-band" checked><span></span>The Traynr Band</label><label><input type="checkbox" data-artist-filter="briella-steiner" checked><span></span>Briella Steiner</label><label><input type="checkbox" data-artist-filter="the-wicked" checked><span></span>The Wicked</label></div></fieldset><fieldset class="map-filter-group history-filter"><legend>History</legend><button type="button" class="past-shows-toggle" data-past-shows-toggle role="switch" aria-checked="false" aria-label="Show past shows"><span class="past-shows-track" aria-hidden="true"><i></i></span><span>Past Shows</span><b>Off</b></button><select class="past-location-select" data-past-location-select aria-label="Choose a past show location" hidden><option value="">Choose a past location…</option></select></fieldset></div><div class="map-layout"><div class="map-canvas"><div id="live-show-map" class="live-show-map" aria-label="Interactive map of upcoming and past shows"></div><div class="map-empty"><strong>Loading dates…</strong><span>Checking the latest approved shows.</span></div></div><div class="show-list"><p class="eyebrow gold">Upcoming Dates</p><div class="show-dates" aria-live="polite"></div></div></div></section>';
const SHOWS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzm7n06SI-AROY0SVsnnyTH-CJuevgodlFKZj2A1aPZCZ-5k6Fff1TEYCyvrjSq0ZY6/exec';
const venueGroupTestEnabled =
  new URLSearchParams(window.location.search).get('map-test') === 'venue-group';
const venueGroupTestShows = [
  {
    approved: true,
    id: 'venue-test-briella-baitbox',
    artist: 'Briella Steiner',
    venue: 'BaitBox',
    city: 'Republican City',
    state: 'Nebraska',
    date: '2026-09-07',
    time: '8pm',
    latitude: 40.1014137,
    longitude: -99.2211532,
  },
  {
    approved: true,
    id: 'venue-test-anthony-baitbox',
    artist: 'Anthony Segovia',
    venue: 'BaitBox',
    city: 'Republican City',
    state: 'Nebraska',
    date: '2026-10-02',
    time: '7pm',
    latitude: 40.1014137,
    longitude: -99.2211532,
  },
  {
    approved: true,
    id: 'venue-test-traynr-lincoln',
    artist: 'The Traynr Band',
    venue: 'Test Venue',
    city: 'Lincoln',
    state: 'Nebraska',
    date: '2026-10-10',
    time: '8pm',
    latitude: 40.8136,
    longitude: -96.7026,
  },
];
const artistSlugs = {
  'Anthony Segovia': 'anthony-segovia',
  'The Traynr Band': 'the-traynr-band',
  'Briella Steiner': 'briella-steiner',
  'The Wicked': 'the-wicked',
};
const mapEmpty = document.querySelector('.map-empty');
const showDates = document.querySelector('.show-dates');
if (venueGroupTestEnabled) {
  document
    .querySelector('.show-map-heading')
    .insertAdjacentHTML(
      'beforeend',
      '<p class="map-test-notice">Test preview: sample overlapping shows are visible only through this link.</p>',
    );
}
let approvedShows = [];
let liveMap = null;
let showMarkers = [];
const showMarkerById = new Map();
let showPastShows = false;
let pastFadeTimer = null;
let pastHoverPopup = null;
let activePastPopup = null;
const pastFeatureGroups = new Map();
const pastShowsToggle = document.querySelector('[data-past-shows-toggle]');
const pastLocationSelect = document.querySelector('[data-past-location-select]');
const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] };
const PAST_SHOW_SOURCE = 'past-show-history';
const PAST_CLUSTER_LAYER = 'past-show-clusters';
const PAST_CLUSTER_COUNT_LAYER = 'past-show-cluster-count';
const PAST_POINT_LAYER = 'past-show-points';
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>'"]/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[
        char
      ],
  );
const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const showDateKey = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
};
const showDateValue = (value) => {
  const key = showDateKey(value);
  if (!key) return new Date(NaN);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};
const showTimeParts = (value) => {
  const match = String(value || '')
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3] || '';
  if (minute > 59 || hour > (period ? 12 : 23)) return null;
  if (period === 'am' && hour === 12) hour = 0;
  if (period === 'pm' && hour < 12) hour += 12;
  return { hour, minute };
};
const showStartValue = (show) => {
  const key = showDateKey(show.date);
  if (!key) return new Date(NaN);
  const [year, month, day] = key.split('-').map(Number);
  const time = showTimeParts(show.time);
  return new Date(
    year,
    month - 1,
    day,
    time?.hour ?? 23,
    time?.minute ?? 59,
  );
};
const showStatus = (show) =>
  showStartValue(show).valueOf() < Date.now() ? 'past' : 'upcoming';
const normalizeShow = (show) => ({
  ...show,
  artistId: artistSlugs[show.artist] || '',
  artistName: show.artist || '',
  date: showDateKey(show.date),
  status: showStatus(show),
});
const nextShowTicker = document.querySelector('#next-show');
const nextShowLoops = [...nextShowTicker.querySelectorAll('.next-show-loop')];
let currentNextShowId = '';
let nextShowCountdownNodes = [];
const showLocation = (show) =>
  [show.city, show.state].filter((value) => String(value || '').trim()).join(', ');
const accessibleShowSchedule = (show) => {
  const date = showDateValue(show.date);
  const formattedDate = Number.isNaN(date.valueOf())
    ? ''
    : date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
  return [formattedDate, String(show.time || '').trim()]
    .filter(Boolean)
    .join(' at ');
};
const countdownText = (show) => {
  const remainingMinutes = Math.max(
    0,
    Math.ceil((showStartValue(show).valueOf() - Date.now()) / 60000),
  );
  const days = Math.floor(remainingMinutes / 1440);
  const hours = Math.floor((remainingMinutes % 1440) / 60);
  const minutes = remainingMinutes % 60;
  return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
};
const nextUpcomingShow = () =>
  approvedShows
    .map(normalizeShow)
    .filter((show) => show.approved === true && show.status === 'upcoming')
    .sort(
      (a, b) =>
        showStartValue(a) - showStartValue(b) || String(a.id).localeCompare(String(b.id)),
    )[0] || null;
const buildTickerItem = (show, countdown) => {
  const item = document.createElement('span');
  item.className = 'next-show-item';
  const label = document.createElement('strong');
  label.textContent = 'Next Show';
  item.append(label);
  [show.artistName, show.venue, showLocation(show)]
    .filter((value) => String(value || '').trim())
    .forEach((value) => item.append(` • ${value}`));
  const countdownNode = document.createElement('span');
  countdownNode.className = 'next-show-countdown';
  countdownNode.textContent = ` • ${countdown}`;
  item.append(countdownNode, ' •');
  nextShowCountdownNodes.push(countdownNode);
  return item;
};
const updateNextShowTicker = (forceLayout = false) => {
  const show = nextUpcomingShow();
  if (!show) {
    currentNextShowId = '';
    nextShowCountdownNodes = [];
    nextShowTicker.hidden = true;
    return;
  }
  const countdown = countdownText(show);
  if (forceLayout || currentNextShowId !== show.id || nextShowTicker.hidden) {
    currentNextShowId = show.id;
    nextShowCountdownNodes = [];
    nextShowTicker.hidden = false;
    nextShowLoops[0].replaceChildren(buildTickerItem(show, countdown));
    const itemWidth =
      nextShowLoops[0].firstElementChild?.getBoundingClientRect().width || 600;
    const repeatCount = Math.max(
      2,
      Math.ceil(nextShowTicker.clientWidth / itemWidth) + 1,
    );
    nextShowCountdownNodes = [];
    nextShowLoops.forEach((loop) => {
      loop.replaceChildren(
        ...Array.from({ length: repeatCount }, () =>
          buildTickerItem(show, countdown),
        ),
      );
    });
    const loopWidth = nextShowLoops[0].scrollWidth;
    const duration = Math.min(40, Math.max(25, loopWidth / 90));
    nextShowTicker.style.setProperty('--next-show-duration', `${duration}s`);
    const venue = String(show.venue || '').trim();
    const location = showLocation(show);
    const schedule = accessibleShowSchedule(show);
    nextShowTicker.setAttribute(
      'aria-label',
      `View next show: ${show.artistName}${venue ? ` at ${venue}` : ''}${location ? ` in ${location}` : ''}${schedule ? ` on ${schedule}` : ''} on the map`,
    );
  } else {
    nextShowCountdownNodes.forEach((node) => {
      node.textContent = ` • ${countdown}`;
    });
  }
};
let tickerResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(tickerResizeTimer);
  tickerResizeTimer = setTimeout(() => updateNextShowTicker(true), 160);
});
document.fonts?.ready.then(() => updateNextShowTicker(true));
const formatShowDate = (value) =>
  showDateValue(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
const daysUntilShow = (value) => {
  const date = showDateValue(value);
  const today = new Date();
  return Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86400000,
  );
};
const enabledArtists = () =>
  new Set(
    [...document.querySelectorAll('[data-artist-filter]:checked')].map(
      (box) => box.dataset.artistFilter,
    ),
  );
const loadMapLibrary = () =>
  new Promise((resolve, reject) => {
    if (window.maplibregl) return resolve();
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css';
    style.crossOrigin = '';
    document.head.append(style);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js';
    script.crossOrigin = '';
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
const markerColorExpression = [
  'match',
  ['get', 'artistId'],
  'briella-steiner',
  '#ff5fa2',
  'the-wicked',
  '#e3262e',
  'the-traynr-band',
  '#d4af37',
  'anthony-segovia',
  '#4da3ff',
  '#9386a3',
];
const setPastLayerVisibility = (opacity) => {
  if (!liveMap?.getLayer(PAST_POINT_LAYER)) return;
  liveMap.setPaintProperty(PAST_POINT_LAYER, 'circle-opacity', opacity * 0.52);
  liveMap.setPaintProperty(PAST_CLUSTER_LAYER, 'circle-opacity', opacity * 0.38);
  liveMap.setPaintProperty(PAST_CLUSTER_COUNT_LAYER, 'text-opacity', opacity * 0.78);
};
const pastPopupHtml = (group, compact = false) => {
  const shows = [...group.shows].sort(
    (a, b) => showDateValue(b.date) - showDateValue(a.date),
  );
  const firstShow = shows[0];
  const venueNames = [...new Set(shows.map((show) => show.venue).filter(Boolean))];
  const venueLabel = venueNames.length === 1 ? venueNames[0] : 'Shows at this location';
  const location = `${firstShow.city || ''}, ${firstShow.state || ''}`.replace(
    /^, |, $/g,
    '',
  );
  if (compact) {
    const artists = [...new Set(shows.map((show) => show.artistName))];
    return `<div class="past-show-tooltip"><strong>Past ${shows.length === 1 ? 'show' : `${shows.length} shows`}</strong><span>${escapeHtml(artists.join(', '))}</span>${venueLabel ? `<span>${escapeHtml(venueLabel)}</span>` : ''}</div>`;
  }
  const rows = shows
    .map((show) => {
      const showVenue = venueNames.length > 1 && show.venue
        ? `<span class="venue-popup-venue">${escapeHtml(show.venue)}</span>`
        : '';
      return `<li class="past-show-row"><span class="show-status">Past show</span><span class="venue-popup-artist" data-artist="${escapeHtml(show.artistId)}">${escapeHtml(show.artistName)}</span>${showVenue}<time datetime="${escapeHtml(show.date)}">${escapeHtml(formatShowSchedule(show))}</time></li>`;
    })
    .join('');
  return `<div class="venue-popup past-shows-popup"><strong>${escapeHtml(venueLabel)}</strong>${location ? `<span class="venue-popup-location">${escapeHtml(location)}</span>` : ''}<ul>${rows}</ul></div>`;
};
const addPastShowLayers = () => {
  liveMap.addSource(PAST_SHOW_SOURCE, {
    type: 'geojson',
    data: EMPTY_FEATURE_COLLECTION,
    cluster: true,
    clusterMaxZoom: 11,
    clusterRadius: 44,
  });
  liveMap.addLayer({
    id: PAST_CLUSTER_LAYER,
    type: 'circle',
    source: PAST_SHOW_SOURCE,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#9386a3',
      'circle-radius': ['step', ['get', 'point_count'], 13, 20, 17, 75, 21],
      'circle-opacity': 0,
      'circle-opacity-transition': { duration: 260 },
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#18131d',
      'circle-stroke-opacity': 0.82,
    },
  });
  liveMap.addLayer({
    id: PAST_CLUSTER_COUNT_LAYER,
    type: 'symbol',
    source: PAST_SHOW_SOURCE,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 11,
    },
    paint: {
      'text-color': '#f4f0f6',
      'text-opacity': 0,
      'text-opacity-transition': { duration: 260 },
    },
  });
  liveMap.addLayer({
    id: PAST_POINT_LAYER,
    type: 'circle',
    source: PAST_SHOW_SOURCE,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': markerColorExpression,
      'circle-radius': ['step', ['get', 'eventCount'], 5, 2, 6, 5, 7],
      'circle-opacity': 0,
      'circle-opacity-transition': { duration: 260 },
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#080a0b',
      'circle-stroke-opacity': 0.9,
    },
  });
  liveMap.on('click', PAST_CLUSTER_LAYER, (event) => {
    const feature = liveMap.queryRenderedFeatures(event.point, {
      layers: [PAST_CLUSTER_LAYER],
    })[0];
    if (!feature) return;
    const source = liveMap.getSource(PAST_SHOW_SOURCE);
    Promise.resolve(source.getClusterExpansionZoom(feature.properties.cluster_id)).then(
      (zoom) => liveMap.easeTo({ center: feature.geometry.coordinates, zoom }),
    );
  });
  liveMap.on('click', PAST_POINT_LAYER, (event) => {
    const feature = event.features?.[0];
    const group = pastFeatureGroups.get(feature?.properties?.historyId);
    if (!feature || !group) return;
    pastHoverPopup?.remove();
    activePastPopup?.remove();
    activePastPopup = new maplibregl.Popup({ offset: 13, maxWidth: '330px' })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(pastPopupHtml(group))
      .addTo(liveMap);
  });
  liveMap.on('mouseenter', PAST_POINT_LAYER, (event) => {
    liveMap.getCanvas().style.cursor = 'pointer';
    if (window.matchMedia('(hover: none)').matches) return;
    const feature = event.features?.[0];
    const group = pastFeatureGroups.get(feature?.properties?.historyId);
    if (!feature || !group) return;
    pastHoverPopup?.remove();
    pastHoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
      maxWidth: '250px',
    })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(pastPopupHtml(group, true))
      .addTo(liveMap);
  });
  liveMap.on('mouseleave', PAST_POINT_LAYER, () => {
    liveMap.getCanvas().style.cursor = '';
    pastHoverPopup?.remove();
    pastHoverPopup = null;
  });
  liveMap.on('mouseenter', PAST_CLUSTER_LAYER, () => {
    liveMap.getCanvas().style.cursor = 'pointer';
  });
  liveMap.on('mouseleave', PAST_CLUSTER_LAYER, () => {
    liveMap.getCanvas().style.cursor = '';
  });
};
const initMap = async () => {
  await loadMapLibrary();
  liveMap = new maplibregl.Map({
    container: 'live-show-map',
    style: 'https://tiles.openfreemap.org/styles/dark',
    center: [-98, 41.5],
    zoom: 4,
    cooperativeGestures:
      window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0,
  });
  liveMap.addControl(new maplibregl.NavigationControl(), 'top-left');
  await new Promise((resolve) => liveMap.once('load', resolve));
  addPastShowLayers();
};
const safeTicketUrl = (value) => {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};
const formatShowSchedule = (show) =>
  [formatShowDate(show.date), String(show.time || '').trim()]
    .filter(Boolean)
    .join(' · ');
const normalizeVenuePart = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const validCoordinates = (show) => {
  const latitude = Number(show.latitude);
  const longitude = Number(show.longitude);
  return Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
    ? { latitude, longitude }
    : null;
};
const venueIdentity = (show) => {
  const coordinates = validCoordinates(show);
  const venueParts = [show.venue, show.city, show.state].map(normalizeVenuePart);
  return {
    coordinates,
    venueKey: venueParts.some(Boolean) ? venueParts.join('|') : '',
    coordinateKey: coordinates
      ? `${coordinates.latitude.toFixed(5)}|${coordinates.longitude.toFixed(5)}`
      : '',
  };
};
const groupShowsByVenue = (shows) => {
  const groups = new Set();
  const groupByVenue = new Map();
  const groupByCoordinates = new Map();
  shows.forEach((show) => {
    const { coordinates, venueKey, coordinateKey } = venueIdentity(show);
    const venueGroup = venueKey ? groupByVenue.get(venueKey) : null;
    const coordinateGroup = coordinateKey
      ? groupByCoordinates.get(coordinateKey)
      : null;
    let group = venueGroup || coordinateGroup;
    if (venueGroup && coordinateGroup && venueGroup !== coordinateGroup) {
      coordinateGroup.shows.forEach((groupedShow) => venueGroup.shows.push(groupedShow));
      coordinateGroup.venueKeys.forEach((key) => {
        venueGroup.venueKeys.add(key);
        groupByVenue.set(key, venueGroup);
      });
      coordinateGroup.coordinateKeys.forEach((key) => {
        venueGroup.coordinateKeys.add(key);
        groupByCoordinates.set(key, venueGroup);
      });
      if (!venueGroup.coordinates) venueGroup.coordinates = coordinateGroup.coordinates;
      groups.delete(coordinateGroup);
      group = venueGroup;
    }
    if (!group) {
      group = {
        venueKey,
        coordinateKey,
        coordinates,
        shows: [],
        venueKeys: new Set(),
        coordinateKeys: new Set(),
      };
      groups.add(group);
    }
    if (venueKey) {
      group.venueKeys.add(venueKey);
      groupByVenue.set(venueKey, group);
      if (!group.venueKey) group.venueKey = venueKey;
    }
    if (coordinateKey) {
      group.coordinateKeys.add(coordinateKey);
      groupByCoordinates.set(coordinateKey, group);
      if (!group.coordinateKey) group.coordinateKey = coordinateKey;
    }
    if (!group.coordinates && coordinates) group.coordinates = coordinates;
    group.shows.push(show);
  });
  return [...groups];
};
const updatePastShowLayer = (pastGroups) => {
  const source = liveMap?.getSource(PAST_SHOW_SOURCE);
  if (!source) return [];
  clearTimeout(pastFadeTimer);
  pastFeatureGroups.clear();
  const features = pastGroups
    .filter((group) => group.coordinates)
    .map((group, index) => {
      const artistIds = [...new Set(group.shows.map((show) => show.artistId))];
      const historyId = `${group.coordinateKey || group.venueKey}|${index}`;
      pastFeatureGroups.set(historyId, group);
      return {
        type: 'Feature',
        id: historyId,
        geometry: {
          type: 'Point',
          coordinates: [group.coordinates.longitude, group.coordinates.latitude],
        },
        properties: {
          historyId,
          artistId: artistIds.length === 1 ? artistIds[0] : 'multiple',
          eventCount: group.shows.length,
        },
      };
    });
  pastLocationSelect.replaceChildren(
    new Option('Choose a past location…', ''),
  );
  if (showPastShows) {
    features.forEach((feature) => {
      const group = pastFeatureGroups.get(feature.properties.historyId);
      const firstShow = group.shows[0];
      const artists = [...new Set(group.shows.map((show) => show.artistName))];
      const location = [firstShow.venue, firstShow.city, firstShow.state]
        .filter(Boolean)
        .join(' — ');
      pastLocationSelect.add(
        new Option(
          `${artists.join(', ')} — ${location || 'Past show location'} (${group.shows.length})`,
          feature.properties.historyId,
        ),
      );
    });
  }
  pastLocationSelect.hidden = !showPastShows || features.length === 0;
  if (showPastShows) {
    source.setData({ type: 'FeatureCollection', features });
    requestAnimationFrame(() => setPastLayerVisibility(1));
  } else {
    setPastLayerVisibility(0);
    pastFadeTimer = setTimeout(() => {
      source.setData(EMPTY_FEATURE_COLLECTION);
      pastFeatureGroups.clear();
    }, 280);
  }
  return features;
};
const renderShows = () => {
  if (!liveMap) return;
  pastHoverPopup?.remove();
  pastHoverPopup = null;
  activePastPopup?.remove();
  activePastPopup = null;
  const enabled = enabledArtists();
  const artistVisible = approvedShows
    .map(normalizeShow)
    .filter((show) => show.approved === true && enabled.has(show.artistId));
  const visible = artistVisible
    .filter((show) => show.status === 'upcoming')
    .sort((a, b) => showDateValue(a.date) - showDateValue(b.date));
  const venueGroups = groupShowsByVenue(artistVisible);
  const upcomingVenueGroups = venueGroups
    .map((group) => ({
      ...group,
      allShows: group.shows,
      shows: group.shows.filter((show) => show.status === 'upcoming'),
    }))
    .filter((group) => group.shows.length);
  const pastOnlyVenueGroups = venueGroups
    .filter((group) => !group.shows.some((show) => show.status === 'upcoming'))
    .map((group) => ({
      ...group,
      shows: group.shows.filter((show) => show.status === 'past'),
    }))
    .filter((group) => group.shows.length);
  const pastFeatures = updatePastShowLayer(pastOnlyVenueGroups);
  showMarkers.forEach((marker) => marker.remove());
  showMarkers = [];
  showMarkerById.clear();
  showDates.replaceChildren();
  mapEmpty.hidden = visible.length > 0 || (showPastShows && pastFeatures.length > 0);
  if (!visible.length && !(showPastShows && pastFeatures.length)) {
    const noneSelected = enabled.size === 0;
    mapEmpty.querySelector('strong').textContent = noneSelected
      ? 'No artists selected'
      : 'No upcoming dates';
    mapEmpty.querySelector('span').textContent = noneSelected
      ? 'Choose an artist above to show their dates.'
      : 'No approved upcoming shows match the selected artists.';
    showDates.innerHTML =
      '<div class="empty-dates">No upcoming shows to display.</div>';
    if (!showPastShows) liveMap.jumpTo({ center: [-98, 41.5], zoom: 4 });
    return;
  }
  if (!visible.length) {
    showDates.innerHTML =
      '<div class="empty-dates">No upcoming shows to display.</div>';
  }
  const showCards = new Map();
  visible.forEach((show) => {
    const slug = artistSlugs[show.artist];
    const location = `${show.city || ''}, ${show.state || ''}`.replace(
      /^, |, $/g,
      '',
    );
    const ticketUrl = safeTicketUrl(show.ticketUrl);
    const card = document.createElement('article');
    card.className = 'show-date';
    card.id = show.id;
    card.dataset.mapArtist = slug;
    card.innerHTML = `<time datetime="${escapeHtml(show.date)}">${escapeHtml(formatShowSchedule(show))}</time><h3>${escapeHtml(show.artist)}</h3><p><strong>${escapeHtml(show.venue)}</strong><span>${escapeHtml(location)}</span></p>${ticketUrl ? `<a href="${escapeHtml(ticketUrl)}" target="_blank" rel="noopener noreferrer">Tickets <span aria-hidden="true">→</span></a>` : ''}`;
    showDates.append(card);
    showCards.set(show.id, card);
  });

  const bounds = [];
  upcomingVenueGroups.forEach((group) => {
    if (!group.coordinates) return;
    const { latitude, longitude } = group.coordinates;
    const firstShow = group.shows[0];
    const location = `${firstShow.city || ''}, ${firstShow.state || ''}`.replace(
      /^, |, $/g,
      '',
    );
    const venueNames = [...new Set(group.shows.map((show) => show.venue).filter(Boolean))];
    const venueLabel = venueNames.length === 1 ? venueNames[0] : 'Shows at this location';
    const artists = [...new Set(group.shows.map((show) => artistSlugs[show.artist]))];
    const closestDaysAway = Math.min(
      ...group.shows.map((show) => daysUntilShow(show.date)),
    );
    const markerElement = document.createElement('button');
    markerElement.type = 'button';
    markerElement.className = 'semper-map-marker venue-marker';
    if (closestDaysAway <= 14) markerElement.classList.add('show-soon');
    if (closestDaysAway <= 3) markerElement.classList.add('show-imminent');
    markerElement.dataset.artist = artists.length === 1 ? artists[0] : 'multiple';
    markerElement.setAttribute(
      'aria-label',
      `${group.shows.length} upcoming ${group.shows.length === 1 ? 'show' : 'shows'} at ${venueLabel}, ${location}`,
    );
    markerElement.innerHTML = `<i class="marker-halo" aria-hidden="true"></i><svg aria-hidden="true" viewBox="0 0 28 36"><path d="M14 34S2 22 2 13a12 12 0 0 1 24 0c0 9-12 21-12 21Z"></path><circle cx="14" cy="13" r="4"></circle></svg>${group.shows.length > 1 ? `<b class="marker-count" aria-hidden="true">${group.shows.length}</b>` : ''}`;
    const relatedPastShows = showPastShows
      ? group.allShows.filter((show) => show.status === 'past')
      : [];
    const popupRows = group.shows
      .map((show) => {
        const slug = artistSlugs[show.artist];
        const ticketUrl = safeTicketUrl(show.ticketUrl);
        const showVenue = venueNames.length > 1
          ? `<span class="venue-popup-venue">${escapeHtml(show.venue)}</span>`
          : '';
        return `<li data-show-id="${escapeHtml(show.id)}"><span class="show-status upcoming-status">Upcoming show</span><span class="venue-popup-artist" data-artist="${escapeHtml(slug)}">${escapeHtml(show.artist)}</span>${showVenue}<time datetime="${escapeHtml(show.date)}">${escapeHtml(formatShowSchedule(show))}</time>${ticketUrl ? `<a href="${escapeHtml(ticketUrl)}" target="_blank" rel="noopener noreferrer">Tickets</a>` : ''}</li>`;
      })
      .concat(
        relatedPastShows.map(
          (show) => `<li class="past-show-row"><span class="show-status">Past show</span><span class="venue-popup-artist" data-artist="${escapeHtml(show.artistId)}">${escapeHtml(show.artistName)}</span>${show.venue ? `<span class="venue-popup-venue">${escapeHtml(show.venue)}</span>` : ''}<time datetime="${escapeHtml(show.date)}">${escapeHtml(formatShowSchedule(show))}</time></li>`,
        ),
      )
      .join('');
    const popup = new maplibregl.Popup({ offset: 30, maxWidth: '330px' }).setHTML(
      `<div class="venue-popup"><strong>${escapeHtml(venueLabel)}</strong><span class="venue-popup-location">${escapeHtml(location)}</span><ul>${popupRows}</ul></div>`,
    );
    const marker = new maplibregl.Marker({
      element: markerElement,
      anchor: 'bottom',
    })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(liveMap);
    const firstCard = showCards.get(firstShow.id);
    markerElement.addEventListener('click', () =>
      firstCard?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
    showMarkers.push(marker);
    group.shows.forEach((show) => {
      const card = showCards.get(show.id);
      showMarkerById.set(show.id, marker);
      if (!card) return;
      card.classList.add('show-date-map-link');
      card.tabIndex = 0;
      card.setAttribute(
        'aria-label',
        `Show ${show.artist} at ${show.venue} on the map`,
      );
      const focusShow = (event) => {
        if (event.target.closest('a')) return;
        if (
          event.type === 'keydown' &&
          (event.target !== card || !['Enter', ' '].includes(event.key))
        )
          return;
        if (event.type === 'keydown') event.preventDefault();
        liveMap.flyTo({ center: [longitude, latitude], zoom: 12 });
        if (!marker.getPopup().isOpen()) marker.togglePopup();
      };
      card.addEventListener('click', focusShow);
      card.addEventListener('keydown', focusShow);
    });
    bounds.push([longitude, latitude]);
  });
  const displayBounds = showPastShows
    ? bounds.concat(
        pastFeatures.map((feature) => feature.geometry.coordinates),
      )
    : bounds;
  if (displayBounds.length === 1)
    liveMap.jumpTo({ center: displayBounds[0], zoom: bounds.length ? 9 : 8 });
  else if (displayBounds.length > 1) {
    const mapBounds = displayBounds.reduce(
      (box, point) => box.extend(point),
      new maplibregl.LngLatBounds(displayBounds[0], displayBounds[0]),
    );
    liveMap.fitBounds(mapBounds, { padding: 40, maxZoom: 9 });
  }
};
const focusTickerShowOnMap = () => {
  const show = approvedShows
    .map(normalizeShow)
    .find((candidate) => candidate.id === currentNextShowId);
  if (!show || show.status !== 'upcoming') {
    updateNextShowTicker();
    return;
  }
  const artistFilter = document.querySelector(
    `[data-artist-filter="${show.artistId}"]`,
  );
  if (artistFilter && !artistFilter.checked) {
    artistFilter.checked = true;
    renderShows();
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelector('#shows').scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  });
  setTimeout(
    () => {
      const marker = showMarkerById.get(show.id);
      const coordinates = validCoordinates(show);
      if (!marker && !coordinates) return;
      const center = marker
        ? marker.getLngLat()
        : [coordinates.longitude, coordinates.latitude];
      liveMap.resize();
      liveMap.flyTo({ center, zoom: 12 });
      if (marker && !marker.getPopup().isOpen()) marker.togglePopup();
      requestAnimationFrame(() => {
        const popupRow = [...document.querySelectorAll('[data-show-id]')].find(
          (row) => row.dataset.showId === show.id,
        );
        popupRow?.classList.add('ticker-focused-show');
      });
    },
    reduceMotion ? 0 : 450,
  );
};
nextShowTicker.addEventListener('click', focusTickerShowOnMap);
document
  .querySelectorAll('[data-artist-filter]')
  .forEach((box) => box.addEventListener('change', renderShows));
pastShowsToggle.addEventListener('click', () => {
  showPastShows = !showPastShows;
  pastShowsToggle.setAttribute('aria-checked', String(showPastShows));
  pastShowsToggle.querySelector('b').textContent = showPastShows ? 'On' : 'Off';
  renderShows();
});
pastLocationSelect.addEventListener('change', () => {
  const group = pastFeatureGroups.get(pastLocationSelect.value);
  if (!group?.coordinates) return;
  const center = [group.coordinates.longitude, group.coordinates.latitude];
  activePastPopup?.remove();
  activePastPopup = new maplibregl.Popup({ offset: 13, maxWidth: '330px' })
    .setLngLat(center)
    .setHTML(pastPopupHtml(group))
    .addTo(liveMap);
  liveMap.flyTo({ center, zoom: 11 });
});
const loadShows = async () => {
  try {
    if (!liveMap) await initMap();
    if (SHOWS_ENDPOINT.startsWith('__'))
      throw new Error('Schedule connection pending');
    const response = await fetch(
      `${SHOWS_ENDPOINT}${SHOWS_ENDPOINT.includes('?') ? '&' : '?'}t=${Date.now()}`,
      { cache: 'no-store' },
    );
    if (!response.ok) throw new Error('Schedule request failed');
    const payload = await response.json();
    const feedShows = Array.isArray(payload) ? payload : payload.shows || [];
    approvedShows = feedShows
      .concat(venueGroupTestEnabled ? venueGroupTestShows : [])
      .filter(
        (show) =>
          show.approved === true &&
          artistSlugs[show.artist] &&
          showDateKey(show.date),
      )
      .sort((a, b) => showDateValue(a.date) - showDateValue(b.date));
    renderShows();
    updateNextShowTicker();
  } catch {
    mapEmpty.hidden = false;
    mapEmpty.querySelector('strong').textContent = 'Dates unavailable';
    mapEmpty.querySelector('span').textContent = 'Please check back shortly.';
    showDates.innerHTML =
      '<div class="empty-dates">Upcoming dates could not be loaded.</div>';
  }
};
loadShows();
setInterval(loadShows, 300000);
setInterval(renderShows, 60000);
setInterval(updateNextShowTicker, 30000);

const easterEggs = {
  'Anthony Segovia': {
    src: 'images/artists/anthony-segovia-easter-egg.jpg',
    alt: 'A surprise candid photo of Anthony Segovia',
  },
  'The Wicked': {
    src: 'images/artists/the-wicked-easter-egg.jpg',
    alt: 'A surprise backstage photo of The Wicked',
  },
};
const eggPresses = new Map();
const artistEgg = document.createElement('div');
artistEgg.className = 'segovia-egg';
artistEgg.hidden = true;
artistEgg.setAttribute('role', 'dialog');
artistEgg.setAttribute('aria-modal', 'true');
artistEgg.innerHTML =
  '<button type="button" class="segovia-egg-close" aria-label="Close photo">×</button><img alt="">';
document.body.append(artistEgg);
let eggReturnFocus = null;
let eggOpenedAt = 0;
const closeArtistEgg = () => {
  artistEgg.hidden = true;
  document.body.classList.remove('egg-open');
  eggReturnFocus?.focus();
  eggReturnFocus = null;
};
const countArtistPress = (event) => {
  const artist = event.target.closest('.artist-slide');
  const photo = event.target.closest('.artist-photo');
  const name = artist?.getAttribute('aria-label');
  const egg = easterEggs[name];
  if (!artist || !photo || !egg) return;
  const now = Date.now();
  const previous = eggPresses.get(name) || { count: 0, last: 0 };
  const count = now - previous.last <= 2000 ? previous.count + 1 : 1;
  eggPresses.set(name, { count, last: now });
  if (count === 6) {
    eggPresses.set(name, { count: 0, last: now });
    eggReturnFocus = document.activeElement;
    eggOpenedAt = now;
    artistEgg.setAttribute('aria-label', `${name} surprise photo`);
    const image = artistEgg.querySelector('img');
    image.src = egg.src;
    image.alt = egg.alt;
    artistEgg.hidden = false;
    document.body.classList.add('egg-open');
    artistEgg.querySelector('button').focus();
  }
};
document.addEventListener('pointerdown', countArtistPress, true);
document.addEventListener('click', (event) => {
  if (
    Date.now() - eggOpenedAt > 300 &&
    (event.target === artistEgg || event.target.closest('.segovia-egg-close'))
  )
    closeArtistEgg();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !artistEgg.hidden) closeArtistEgg();
});
