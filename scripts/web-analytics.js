(() => {
  const TRACKER_URL = 'https://web-analytics.usable.dev/js/uwa.js';
  const TRACKED_HOSTNAME = 'www.usable.dev';
  const hostname = window.location.hostname.trim().toLowerCase().replace(/\.$/, '');

  // Faroese entry URLs permanently redirect to the canonical host. Keep the
  // analytics property single-host and leave local/preview hosts untracked.
  if (hostname !== TRACKED_HOSTNAME) return;

  const tracker = document.createElement('script');
  tracker.async = true;
  tracker.dataset.domain = TRACKED_HOSTNAME;
  tracker.src = TRACKER_URL;
  document.head.appendChild(tracker);
})();
