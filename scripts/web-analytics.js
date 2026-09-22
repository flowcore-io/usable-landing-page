(() => {
  const TRACKER_URL = 'https://web-analytics.usable.dev/js/v1.0.0/uwa.js';
  const TRACKED_HOSTNAME = 'www.usable.dev';
  const hostname = window.location.hostname.trim().toLowerCase().replace(/\.$/, '');

  // Faroese entry URLs permanently redirect to the canonical host. Keep the
  // analytics property single-host and leave local/preview hosts untracked.
  if (hostname !== TRACKED_HOSTNAME) return;

  const tracker = document.createElement('script');
  tracker.async = true;
  tracker.dataset.domain = TRACKED_HOSTNAME;
  tracker.src = TRACKER_URL;
  tracker.integrity = 'sha384-N3dVUWCLArSsxOtVuEe2Du1YTUvRsuSpSWXVItMO7jnl7JQQ7M+2OuXY/mpccqtD';
  tracker.crossOrigin = 'anonymous';
  document.head.appendChild(tracker);
})();
