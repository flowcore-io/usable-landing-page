/**
 * Internationalisation (i18n) for Usable Landing Page
 * Detects language from URL prefix (/fo/) and applies translations
 * from /translations/fo.json via data-i18n attributes.
 *
 * Attribute reference:
 *   data-i18n="key"              → replaces textContent
 *   data-i18n-html="key"         → replaces innerHTML  (use sparingly)
 *   data-i18n-alt="key"          → sets alt attribute
 *   data-i18n-aria-label="key"   → sets aria-label attribute
 *   data-i18n-placeholder="key"  → sets placeholder attribute
 *   data-i18n-title="key"        → sets title attribute
 *   data-i18n-content="key"      → sets content attribute (meta tags)
 *   data-i18n-list="key"         → replaces <li> children from JSON array
 */

class I18n {
  constructor() {
    this.lang = this.detectLanguage();
    this.translations = null;
  }

  /** Detect language from URL path */
  detectLanguage() {
    const p = window.location.pathname;
    return (p === '/fo' || p.startsWith('/fo/') || p.startsWith('/fo.')) ? 'fo' : 'en';
  }

  /** Map the current pathname (without /fo prefix) to a page key */
  getPageKey() {
    let p = window.location.pathname;
    // Strip language prefix
    if (p.startsWith('/fo/')) p = p.slice(3);
    else if (p === '/fo') p = '/';
    // Normalise
    p = p.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
    return p || 'home';
  }

  /** Load the translation JSON file */
  async loadTranslations() {
    if (this.lang === 'en') return;
    try {
      const resp = await fetch('/translations/fo.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.translations = await resp.json();
    } catch (e) {
      console.warn('[i18n] Could not load translations:', e);
      this.translations = null;
    }
  }

  /** Apply all translations to the current DOM */
  apply() {
    if (!this.translations) return;

    // 1. Plain text
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[key] != null) el.textContent = this.translations[key];
    });

    // 2. Rich HTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (this.translations[key] != null) el.innerHTML = this.translations[key];
    });

    // 3. Attributes
    ['alt', 'aria-label', 'placeholder', 'title', 'content'].forEach(attr => {
      document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el => {
        const key = el.getAttribute(`data-i18n-${attr}`);
        if (this.translations[key] != null) el.setAttribute(attr, this.translations[key]);
      });
    });

    // 4. List replacements (replaces <li> children from a JSON array)
    document.querySelectorAll('[data-i18n-list]').forEach(ul => {
      const key = ul.getAttribute('data-i18n-list');
      const items = this.translations[key];
      if (!Array.isArray(items)) return;
      const lis = ul.querySelectorAll('li');
      items.forEach((text, i) => {
        if (lis[i]) lis[i].innerHTML = text;
      });
    });

    // 5. Meta tags
    this.applyMetaTags();

    // 6. HTML lang
    document.documentElement.lang = 'fo';
  }

  applyMetaTags() {
    const page = this.getPageKey();
    const titleKey = `${page}.title`;
    const descKey = `${page}.meta.description`;

    if (this.translations[titleKey]) {
      document.title = this.translations[titleKey];
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && this.translations[descKey]) {
      metaDesc.setAttribute('content', this.translations[descKey]);
    }
    // Update og:locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', 'fo_FO');
  }

  /** Prefix internal links with /fo so navigation stays in Faroese */
  prefixLinks() {
    if (this.lang !== 'fo') return;

    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      // Only prefix internal absolute paths; skip external, anchors, already-prefixed
      if (href && href.startsWith('/') && !href.startsWith('/fo/') && !href.startsWith('/fo') && !href.startsWith('//')) {
        a.setAttribute('href', '/fo' + href);
      }
      // Also update data-clean-url
      const clean = a.getAttribute('data-clean-url');
      if (clean && clean.startsWith('/') && !clean.startsWith('/fo/') && !clean.startsWith('/fo')) {
        a.setAttribute('data-clean-url', '/fo' + clean);
      }
    });
  }

  /** Set up the language switcher buttons added in the navbar */
  setupLanguageSwitcher() {
    document.querySelectorAll('.nav__lang-switch').forEach(btn => {
      const label = btn.querySelector('.nav__lang-switch-label');
      if (this.lang === 'fo') {
        if (label) label.textContent = 'EN';
        btn.setAttribute('aria-label', 'Switch to English');
      } else {
        if (label) label.textContent = 'FO';
        btn.setAttribute('aria-label', 'Broyt til føroyskt');
      }

      btn.addEventListener('click', e => {
        e.preventDefault();
        const path = window.location.pathname;
        if (this.lang === 'fo') {
          // Remove /fo prefix
          const enPath = path.replace(/^\/fo/, '') || '/';
          window.location.href = enPath;
        } else {
          // Add /fo prefix
          window.location.href = '/fo' + (path === '/' ? '/' : path);
        }
      });
    });
  }
}

// --- Initialisation ---
const i18n = new I18n();

if (i18n.lang === 'fo') {
  // Add a loading attribute so CSS can hide untranslated text briefly
  document.documentElement.setAttribute('data-i18n-loading', '');

  // Register component event listeners BEFORE the async translation fetch
  // to avoid a race condition where components load before translations finish.
  let translationsReady = false;

  function applyIfReady() {
    if (!translationsReady) return;
    i18n.apply();
    i18n.prefixLinks();
    i18n.setupLanguageSwitcher();
  }

  document.addEventListener('all-components-loaded', applyIfReady);
  ['navbar', 'footer', 'cta'].forEach(name => {
    document.addEventListener(`component-loaded:${name}`, applyIfReady);
  });

  i18n.loadTranslations().then(() => {
    translationsReady = true;

    // Apply to whatever DOM is available right now
    i18n.apply();
    i18n.prefixLinks();
    i18n.setupLanguageSwitcher();

    // Remove loading state
    document.documentElement.removeAttribute('data-i18n-loading');
  });
} else {
  // English: just wire up the language switcher after components load
  document.addEventListener('all-components-loaded', () => {
    i18n.setupLanguageSwitcher();
  });
}
