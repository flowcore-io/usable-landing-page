/** Preview 2: mount the requested film and preserve a readable fallback. */
(function () {
  'use strict';

  var film = document.querySelector('.film');
  if (!film || film.dataset.filmMounted) return;
  var spacer = film.querySelector('[data-sc-spacer]');
  var root = document.getElementById('main-content');
  if (!window.ScrollCraft || !spacer || !root) {
    window.dispatchEvent(new Event('usable-film-error'));
    return;
  }

  var engine;
  try {
    engine = window.ScrollCraft.mount(root);
    film.dataset.filmMounted = 'true';
  } catch (error) {
    document.documentElement.classList.remove('sc-ready');
    film.querySelectorAll('[data-sc-copy]').forEach(function (block) {
      block.inert = false;
      block.removeAttribute('aria-hidden');
    });
    window.dispatchEvent(new Event('usable-film-error'));
    return;
  }

  var steps = Array.prototype.slice.call(film.querySelectorAll('.film__rail-step'));
  function updateRail(index) {
    steps.forEach(function (step) {
      var n = Number(step.getAttribute('data-leg'));
      step.classList.toggle('is-current', n === index);
      step.classList.toggle('is-past', n < index);
    });
  }
  film.addEventListener('sc:waypoint', function (event) {
    updateRail(event.detail.index);
  });
  if (engine.worlds.length) updateRail(engine.worlds[0].index);

  function onScroll() {
    var vh = window.innerHeight;
    var rect = spacer.getBoundingClientRect();
    var y = -rect.top / vh;
    var left = rect.bottom / vh;
    film.style.setProperty('--film-rail', y > 0.9 && left > 1.9 ? '1' : '0');
    var out = Math.max(0, Math.min(1, (rect.bottom - vh * 0.15) / (vh * 0.85)));
    film.style.setProperty('--film-out', out.toFixed(3));
    var copyOut = Math.max(0, Math.min(1, (rect.bottom - vh * 0.6) / (vh * 0.35)));
    film.style.setProperty('--film-copy-out', copyOut.toFixed(3));
    // The outer film fade is independent of individual scene visibility.
    // Keep hidden finale links out of both keyboard and assistive-tech focus.
    var copy = film.querySelector('[data-sc-world-copy]');
    copy.inert = copyOut <= 0.05;
    copy.setAttribute('aria-hidden', copyOut <= 0.05 ? 'true' : 'false');
    film.classList.toggle('film--done', out <= 0);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });

  function relayout() {
    if (engine && engine.layout) engine.layout();
    onScroll();
  }
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  document.addEventListener('all-components-loaded', relayout);

  // These controls are used only in the standalone viewer. Inline preview
  // navigation continues to target the explanatory cycle in the parent page.
  document.querySelectorAll('[data-story-close]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (window.parent === window) return;
      event.preventDefault();
      window.parent.postMessage('usable-film:close', window.location.origin);
    });
  });
  document.querySelectorAll('[data-story-start]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var top = film.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + window.innerHeight * 1.3, behavior: 'smooth' });
    });
  });

  onScroll();
  window.dispatchEvent(new Event('usable-film-ready'));
})();
