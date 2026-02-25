/**
 * Component Loader - Vanilla JavaScript
 * Loads shared HTML components (navbar, footer) into pages
 * Handles path differences for nested directories and active states
 * No frameworks, no build tools - pure vanilla web technologies
 */

class ComponentLoader {
  constructor() {
    this.components = {
      navbar: '/components/navbar.html',
      footer: '/components/footer.html',
      cta: '/components/cta.html'
    };
    
    // Detect if we're in a nested directory
    this.pathDepth = this.calculatePathDepth();
    this.assetPrefix = this.pathDepth > 0 ? '../'.repeat(this.pathDepth) : '';
    this.currentPath = window.location.pathname;
  }

  /**
   * Calculate how many directories deep the current page is
   * @returns {number} Depth level (0 for root, 1 for /blog/, etc.)
   */
  calculatePathDepth() {
    let path = window.location.pathname;
    // Strip /fo/ language prefix before calculating depth
    if (path.startsWith('/fo/')) path = path.slice(3);
    else if (path === '/fo') path = '/';
    const segments = path.split('/').filter(seg => seg && !seg.endsWith('.html'));
    return segments.length;
  }

  /**
   * Fix asset paths in the loaded HTML based on page depth
   * @param {string} html - The HTML content to fix
   * @returns {string} HTML with corrected paths
   */
  fixAssetPaths(html) {
    if (this.pathDepth === 0) return html;
    
    // Replace asset paths for nested directories
    // Handle both src="assets/ and src="assets/ with any whitespace
    return html.replace(
      /src=["']\s*assets\//g,
      `src="${this.assetPrefix}assets/`
    ).replace(
      /href="\/([^"]+)"/g,
      (match, path) => {
        // Don't modify absolute URLs or anchors
        if (path.startsWith('http') || path.startsWith('#')) {
          return match;
        }
        return `href="/${path}"`;
      }
    );
  }

  /**
   * Set active state for navbar links based on current page
   */
  setActiveNavLinks() {
    const navLinks = document.querySelectorAll('.nav__link, .nav__dropdown-item, .nav__link--mobile');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      if (!href) return;
      
      // Normalize paths for comparison (strip /fo/ prefix)
      const linkPath = href.replace(/^\//, '').replace(/\.html$/, '');
      const currentPage = this.currentPath.replace(/^\/fo\//, '/').replace(/^\/fo$/, '/').replace(/^\//, '').replace(/\.html$/, '');
      
      // Check if this link matches the current page
      if (linkPath === currentPage || 
          (currentPage && currentPage.startsWith(linkPath + '/')) ||
          (linkPath === '' && currentPage === '')) {
        link.classList.add('nav__link--active');
      }
    });
  }

  /**
   * Load a component from its HTML file
   * @param {string} componentName - Name of the component to load
   * @param {string} targetSelector - CSS selector for where to inject the component
   * @returns {Promise<void>}
   */
  async loadComponent(componentName, targetSelector) {
    try {
      const componentPath = this.components[componentName];
      
      if (!componentPath) {
        // Silent fail - component not found
        return;
      }

      const response = await fetch(`${componentPath}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load ${componentName}: ${response.status}`);
      }

      let html = await response.text();
      
      // Fix asset paths for nested directories
      html = this.fixAssetPaths(html);
      
      const targetElement = document.querySelector(targetSelector);

      if (!targetElement) {
        // Silent fail - target element not found
        return;
      }

      // Clear existing content first
      while (targetElement.firstChild) {
        targetElement.removeChild(targetElement.firstChild);
      }
      
      // Use DOMParser for more reliable HTML parsing
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const fragment = document.createDocumentFragment();
      
      // Move all nodes from parsed document to fragment
      Array.from(doc.body.childNodes).forEach(node => {
        fragment.appendChild(node);
      });
      
      // Append fragment to target
      targetElement.appendChild(fragment);
      
      // Set active nav links after navbar is loaded
      if (componentName === 'navbar') {
        this.setActiveNavLinks();
      }
      
      // Dispatch custom event after component is loaded
      document.dispatchEvent(new CustomEvent(`component-loaded:${componentName}`, {
        detail: { componentName, targetSelector }
      }));

    } catch (error) {
      // Silent fail - error loading component
      // In production, fail gracefully without console noise
    }
  }

  /**
   * Load all components in parallel for better performance
   * @returns {Promise<void>}
   */
  async loadAll() {
    const loadPromises = [
      this.loadComponent('navbar', '#navbar-placeholder'),
      this.loadComponent('footer', '#footer-placeholder'),
      this.loadComponent('cta', '#cta-placeholder')
    ];

    await Promise.all(loadPromises);

    // Dispatch event when all components are loaded
    document.dispatchEvent(new CustomEvent('all-components-loaded'));
  }
}

// Initialize and load components when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponentLoader);
} else {
  initComponentLoader();
}

function initComponentLoader() {
  const loader = new ComponentLoader();
  loader.loadAll();
}
