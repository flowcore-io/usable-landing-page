/**
 * Adaptive preview. HTML is the lightweight experience; an inert template keeps
 * every film request behind the connection policy or an explicit user action.
 */
(function () {
  'use strict';
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var parameters = new URLSearchParams(window.location.search);
  var choice = parameters.get('view');
  var stage, button, controls, state = 'light', automatic = false, attempt = 0;
  var assetPromises = {};

  function fastConnection() {
    // effectiveType=4g alone includes connections far too slow for this film.
    return !!(connection && !connection.saveData && !motion.matches &&
      connection.effectiveType === '4g' && connection.downlink >= 5 &&
      Number.isFinite(connection.rtt) && connection.rtt <= 200);
  }

  function loadAsset(kind, url) {
    if (assetPromises[url]) return assetPromises[url];
    assetPromises[url] = new Promise(function (resolve, reject) {
      var element = document.createElement(kind === 'style' ? 'link' : 'script');
      var timer = setTimeout(function () { element.remove(); reject(new Error('Asset timed out')); }, 8000);
      element.onload = function () { clearTimeout(timer); resolve(); };
      element.onerror = function () { clearTimeout(timer); element.remove(); reject(new Error('Asset unavailable')); };
      if (kind === 'style') { element.rel = 'stylesheet'; element.href = url; }
      else { element.src = url; element.async = true; }
      // Keep the preview's scoped adjustments last in the cascade.
      var previewStyle = document.querySelector('link[href*="/film-preview-2/preview.css"]');
      if (kind === 'style' && previewStyle) previewStyle.before(element);
      else document.head.appendChild(element);
    }).catch(function (error) { delete assetPromises[url]; throw error; });
    return assetPromises[url];
  }

  function fallback() {
    attempt++;
    stage.querySelectorAll('video').forEach(function (video) {
      video.pause(); video.removeAttribute('src'); video.load();
    });
    stage.replaceChildren();
    document.body.classList.remove('film-page', 'preview-film-pending', 'preview-film-active');
    document.documentElement.classList.remove('sc-ready');
    controls.hidden = true;
    state = 'light';
    button.disabled = false;
    document.getElementById('preview-status').textContent = 'The still version is ready. The visual story could not load.';
  }

  async function startFilm(manual) {
    if (state !== 'light' || (!manual && !fastConnection())) return;
    state = 'loading';
    automatic = !manual;
    var currentAttempt = ++attempt;
    button.disabled = true;
    try {
      await Promise.all([
        loadAsset('style', '/assets/scrollcraft/scrollcraft.css'),
        loadAsset('script', '/assets/film-preview-2/scrollcraft.js?v=1')
      ]);
      // Do not change the page beneath someone who started reading while the
      // enhancement was loading. Recheck the connection before requesting media.
      if (currentAttempt !== attempt) return;
      if (!manual && (!fastConnection() || window.scrollY > 100 || document.activeElement !== document.body && document.activeElement !== document.documentElement)) {
        state = 'light'; button.disabled = false; return;
      }
      var fragment = document.getElementById('film-template').content.cloneNode(true);
      var stillPoster = document.querySelector('.preview-hero__art img');
      fragment.querySelector('.sc-world__poster').src = stillPoster.currentSrc || stillPoster.src;
      stage.appendChild(fragment);
      document.body.classList.add('film-page', 'preview-film-pending', 'preview-film-active');
      if (typeof i18n !== 'undefined') i18n.apply();
      var ready = new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () { cleanup(); reject(new Error('Film not ready')); }, 8000);
        function cleanup() { clearTimeout(timeout); window.removeEventListener('usable-film-ready', success); window.removeEventListener('usable-film-error', failure); }
        function success() { cleanup(); resolve(); }
        function failure() { cleanup(); reject(new Error('Film unavailable')); }
        window.addEventListener('usable-film-ready', success);
        window.addEventListener('usable-film-error', failure);
      });
      // Attach both rejection handlers now so a load failure cannot leave an
      // unhandled initialization promise while the still hero remains visible.
      await Promise.all([ready, loadAsset('script', '/assets/film-preview-2/home-film.js?v=1')]);
      if (currentAttempt !== attempt) return;
      document.body.classList.remove('preview-film-pending');
      controls.hidden = false;
      state = 'film';
      window.dispatchEvent(new Event('resize'));
      window.ScrollCraft.instances.forEach(function (instance) { instance.layout(); });
      if (manual) { window.scrollTo({ top: 0, behavior: 'instant' }); controls.querySelector('a').focus({ preventScroll: true }); }
      updateControls();
    } catch (error) { if (currentAttempt === attempt) fallback(); }
  }

  function useLightVersion() {
    var url = new URL(window.location.href);
    url.searchParams.set('view', 'light');
    // A navigation cancels native media requests and all film animation loops.
    window.location.replace(url.href);
  }

  function updateControls() {
    if (state !== 'film') return;
    var film = stage.querySelector('.film');
    controls.hidden = !!film && film.getBoundingClientRect().bottom < window.innerHeight * .25;
  }

  function onConnectionChange() {
    if (state === 'film' && automatic && (!connection || connection.saveData ||
        /^(slow-2g|2g|3g)$/.test(connection.effectiveType) || connection.downlink < 2)) useLightVersion();
  }

  document.addEventListener('DOMContentLoaded', function () {
    stage = document.getElementById('adaptive-film');
    button = document.querySelector('[data-film-start]');
    controls = document.querySelector('.preview-film-controls');
    // This page embeds the shared components to avoid a network prerequisite for
    // navigation. Their existing controllers use this lifecycle event.
    document.dispatchEvent(new Event('all-components-loaded'));
    document.querySelector('[data-mode-controls]').hidden = false;
    button.addEventListener('click', function () { startFilm(true); });
    document.querySelector('[data-film-stop]').addEventListener('click', function (event) { event.preventDefault(); useLightVersion(); });
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href="#how-it-compounds"]');
      if (!link) return;
      event.preventDefault();
      // Skipping must not scrub through and fetch every intermediate scene.
      history.replaceState(null, '', '#how-it-compounds');
      document.getElementById('how-it-compounds').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    window.addEventListener('scroll', updateControls, { passive: true });
    if (connection && connection.addEventListener) connection.addEventListener('change', onConnectionChange);
    motion.addEventListener('change', function () { if (motion.matches && state === 'film') useLightVersion(); });
    if (choice === 'film') startFilm(true);
    else if (choice !== 'light' && !window.location.hash && fastConnection()) startFilm(false);
  });
})();
