/**
 * Homepage film
 * -------------
 * Mounts the scrollcraft engine on the worldflight markup in index.html and
 * adds three page-level details the engine leaves to the page:
 *
 * 1. The memory-cycle rail: lights Trigger, Discover, Structure and Capture
 *    as the flight passes each leg (engine `sc:waypoint` event).
 * 2. Hides the fixed film layers once the flight is over, so the normal
 *    sections below scroll over the sea texture and nothing keeps compositing.
 * 3. Re-measures after load and fonts (a zero-height spacer freezes the film).
 */
(function () {
  'use strict';

  if (!window.ScrollCraft) return;
  var film = document.querySelector('.film');
  if (!film) return;

  var engine = window.ScrollCraft.mount(document.getElementById('main-content'));
  var steps = Array.prototype.slice.call(film.querySelectorAll('.film__rail-step'));
  var spacer = film.querySelector('[data-sc-spacer]');

  // Leg 0 is the dive; legs 1-4 are the four steps of the cycle.
  film.addEventListener('sc:waypoint', function (e) {
    var leg = e.detail.index;
    steps.forEach(function (el) {
      var n = Number(el.getAttribute('data-leg'));
      el.classList.toggle('is-current', n === leg);
      el.classList.toggle('is-past', n < leg);
    });
  });

  function onScroll() {
    var vh = window.innerHeight;
    var rect = spacer.getBoundingClientRect();
    var y = -rect.top / vh;             // viewports travelled into the flight
    var left = rect.bottom / vh;        // viewports of flight remaining
    // The rail shows from the first step until the finale.
    var rail = y > 0.9 && left > 1.9 ? 1 : 0;
    film.style.setProperty('--film-rail', String(rail));
    // Over the last screen of the track the film dissolves into the painted
    // sea texture behind the page, so the next section never overlaps it.
    var out = Math.max(0, Math.min(1, (rect.bottom - vh * 0.15) / (vh * 0.85)));
    film.style.setProperty('--film-out', out.toFixed(3));
    // The text leaves first, before the next heading reaches it.
    var copyOut = Math.max(0, Math.min(1, (rect.bottom - vh * 0.6) / (vh * 0.35)));
    film.style.setProperty('--film-copy-out', copyOut.toFixed(3));
    film.classList.toggle('film--done', out <= 0);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });

  function relayout() {
    window.dispatchEvent(new Event('resize'));
    if (engine && engine.layout) engine.layout();
    onScroll();
  }
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  document.addEventListener('all-components-loaded', function () { setTimeout(relayout, 60); });

  onScroll();
})();
