/**
 * Theme Management System
 * Handles light/dark theme switching with localStorage persistence
 * and system preference detection
 */

class ThemeManager {
  constructor() {
    // Wait for navbar to be loaded before selecting theme toggles
    this.init();
  }
  
  /**
   * Initialize theme manager
   */
  init() {
    // Get theme toggles (might not exist yet if navbar not loaded)
    this.themeToggles = document.querySelectorAll('.theme-toggle');
    this.htmlElement = document.documentElement;
    this.currentTheme = this.getStoredTheme() || this.getSystemPreference();
    
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Add event listeners to all theme toggles
    this.setupThemeToggles();
    
    // Listen for system preference changes
    this.watchSystemPreference();
    
    // Re-initialize when components load (in case navbar wasn't ready)
    document.addEventListener('all-components-loaded', () => {
      this.themeToggles = document.querySelectorAll('.theme-toggle');
      this.setupThemeToggles();
      this.updateToggleState();
    });
  }
  
  /**
   * Setup event listeners for theme toggles
   */
  setupThemeToggles() {
    this.themeToggles.forEach(toggle => {
      // Remove old listeners by cloning the node
      const newToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(newToggle, toggle);
      
      // Add new listener
      newToggle.addEventListener('click', () => this.toggleTheme());
    });
  }
  
  /**
   * Get stored theme from localStorage
   */
  getStoredTheme() {
    return localStorage.getItem('alminni-theme');
  }
  
  /**
   * Store theme in localStorage
   */
  storeTheme(theme) {
    localStorage.setItem('alminni-theme', theme);
  }
  
  /**
   * Get system preference for color scheme
   */
  getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  /**
   * Set theme on document
   */
  setTheme(theme) {
    this.htmlElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.storeTheme(theme);
    this.updateToggleState();
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  /**
   * Update toggle button state
   */
  updateToggleState() {
    // Re-query toggles to ensure we have fresh references
    this.themeToggles = document.querySelectorAll('.theme-toggle');
    
    if (!this.themeToggles.length) return;
    
    const isDark = this.currentTheme === 'dark';
    
    // Update all theme toggles
    this.themeToggles.forEach(toggle => {
      toggle.setAttribute('aria-pressed', isDark.toString());
      
      // Update button text for screen readers
      toggle.setAttribute('aria-label', 
        isDark ? 'Switch to light theme' : 'Switch to dark theme'
      );
      
      // Update icon visibility - no longer needed as CSS handles this
      // CSS now uses [data-theme="dark"] to show/hide icons
    });
  }
  
  /**
   * Watch for system preference changes
   */
  watchSystemPreference() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Only update if user hasn't manually set a preference
      if (!this.getStoredTheme()) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
      }
    });
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});

// Export for potential use in other modules
window.ThemeManager = ThemeManager;
