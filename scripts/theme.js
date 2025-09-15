/**
 * Theme Management System
 * Handles light/dark theme switching with localStorage persistence
 * and system preference detection
 */

class ThemeManager {
  constructor() {
    this.themeToggle = document.querySelector('.theme-toggle');
    this.htmlElement = document.documentElement;
    this.currentTheme = this.getStoredTheme() || this.getSystemPreference();
    
    this.init();
  }
  
  /**
   * Initialize theme manager
   */
  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Add event listeners
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());
    
    // Listen for system preference changes
    this.watchSystemPreference();
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
    if (!this.themeToggle) return;
    
    const isDark = this.currentTheme === 'dark';
    this.themeToggle.setAttribute('aria-pressed', isDark.toString());
    
    // Update button text for screen readers
    this.themeToggle.setAttribute('aria-label', 
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );
    
    // Update icon visibility
    const sunIcon = this.themeToggle.querySelector('.theme-toggle__icon--sun');
    const moonIcon = this.themeToggle.querySelector('.theme-toggle__icon--moon');
    
    if (sunIcon && moonIcon) {
      if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
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
