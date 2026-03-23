/**
 * Theme Management System
 * Site is always dark — theme toggle is hidden and locked to dark.
 */

class ThemeManager {
  constructor() {
    this.htmlElement = document.documentElement;

    // Lock to dark immediately
    this.htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('alminni-theme', 'dark');

    // Hide theme toggles once components load
    document.addEventListener('all-components-loaded', () => {
      this._hideToggles();
    });

    // Also hide any toggles already in the DOM
    this._hideToggles();
  }

  _hideToggles() {
    document.querySelectorAll('.theme-toggle, .nav__mobile-theme-row').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});

// Export for potential use in other modules
window.ThemeManager = ThemeManager;
