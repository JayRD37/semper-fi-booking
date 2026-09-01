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
  '<section id="shows" class="section show-map"><div class="show-map-heading"><p class="eyebrow gold">Live Shows</p><h2>Where we’re playing.</h2><p>Approved dates from our artists appear here automatically.</p></div><div class="artist-filters" aria-label="Filter map by artist"><label><input type="checkbox" data-artist-filter="anthony-segovia" checked><span></span>Anthony Segovia</label><label><input type="checkbox" data-artist-filter="the-traynr-band" checked><span></span>The Traynr Band</label><label><input type="checkbox" data-artist-filter="briella-steiner" checked><span></span>Briella Steiner</label><label><input type="checkbox" data-artist-filter="the-wicked" checked><span></span>The Wicked</label></div><div class="map-layout"><div class="map-canvas"><div id="live-show-map" class="live-show-map" aria-label="Interactive map of upcoming shows"></div><div class="map-empty"><strong>Loading dates…</strong><span>Checking the latest approved shows.</span></div></div><div class="show-list"><p class="eyebrow gold">Upcoming Dates</p><div class="show-dates" aria-live="polite"></div></div></div></section>';
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
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>'"]/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[
        char
      ],
  );
const showDateValue = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match
    ? new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        23,
        59,
        59,
      )
    : new Date(value);
};
const isUpcoming = (show) => {
  const date = showDateValue(show.date);
  return !Number.isNaN(date.valueOf()) && date >= new Date();
};
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
const groupShowsByVenue = (shows) => {
  const groups = [];
  shows.forEach((show) => {
    const coordinates = validCoordinates(show);
    const venueKey = [show.venue, show.city, show.state]
      .map(normalizeVenuePart)
      .join('|');
    const coordinateKey = coordinates
      ? `${coordinates.latitude.toFixed(5)}|${coordinates.longitude.toFixed(5)}`
      : '';
    let group = groups.find(
      (candidate) =>
        candidate.venueKey === venueKey ||
        (coordinateKey && candidate.coordinateKey === coordinateKey),
    );
    if (!group) {
      group = { venueKey, coordinateKey, coordinates, shows: [] };
      groups.push(group);
    }
    group.shows.push(show);
  });
  return groups;
};
const renderShows = () => {
  if (!liveMap) return;
  const enabled = enabledArtists();
  const visible = approvedShows
    .filter(
      (show) =>
        show.approved === true &&
        enabled.has(artistSlugs[show.artist]) &&
        isUpcoming(show),
    )
    .sort((a, b) => showDateValue(a.date) - showDateValue(b.date));
  showMarkers.forEach((marker) => marker.remove());
  showMarkers = [];
  showMarkerById.clear();
  showDates.replaceChildren();
  mapEmpty.hidden = visible.length > 0;
  if (!visible.length) {
    const noneSelected = enabled.size === 0;
    mapEmpty.querySelector('strong').textContent = noneSelected
      ? 'No artists selected'
      : 'No upcoming dates';
    mapEmpty.querySelector('span').textContent = noneSelected
      ? 'Choose an artist above to show their dates.'
      : 'No approved upcoming shows match the selected artists.';
    showDates.innerHTML =
      '<div class="empty-dates">No upcoming shows to display.</div>';
    liveMap.jumpTo({ center: [-98, 41.5], zoom: 4 });
    return;
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
  groupShowsByVenue(visible).forEach((group) => {
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
    const popupRows = group.shows
      .map((show) => {
        const slug = artistSlugs[show.artist];
        const ticketUrl = safeTicketUrl(show.ticketUrl);
        const showVenue = venueNames.length > 1
          ? `<span class="venue-popup-venue">${escapeHtml(show.venue)}</span>`
          : '';
        return `<li><span class="venue-popup-artist" data-artist="${escapeHtml(slug)}">${escapeHtml(show.artist)}</span>${showVenue}<time datetime="${escapeHtml(show.date)}">${escapeHtml(formatShowSchedule(show))}</time>${ticketUrl ? `<a href="${escapeHtml(ticketUrl)}" target="_blank" rel="noopener noreferrer">Tickets</a>` : ''}</li>`;
      })
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
  if (bounds.length === 1) liveMap.jumpTo({ center: bounds[0], zoom: 9 });
  else if (bounds.length > 1) {
    const mapBounds = bounds.reduce(
      (box, point) => box.extend(point),
      new maplibregl.LngLatBounds(bounds[0], bounds[0]),
    );
    liveMap.fitBounds(mapBounds, { padding: 40, maxZoom: 9 });
  }
};
document
  .querySelectorAll('[data-artist-filter]')
  .forEach((box) => box.addEventListener('change', renderShows));
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
          isUpcoming(show),
      )
      .sort((a, b) => showDateValue(a.date) - showDateValue(b.date));
    renderShows();
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
setInterval(() => {
  approvedShows = approvedShows.filter(isUpcoming);
  renderShows();
}, 60000);

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
