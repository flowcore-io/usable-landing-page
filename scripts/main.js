/**
 * Main JavaScript for Usable Landing Page
 * Handles navigation, smooth scrolling, and interactive features
 */

class UsableApp {
  constructor() {
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.nav = document.querySelector('.nav');
    this.mobileMenu = document.querySelector('.nav__menu--mobile');
    this.navLinks = document.querySelectorAll('.nav__link');
    this.mobileNavLinks = document.querySelectorAll('.nav__link--mobile');
    this.faqItems = document.querySelectorAll('.faq__item');
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.init();
  }
  
  /**
   * Initialize the application
   */
  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupFAQAccordion();
    this.setupScrollEffects();
    this.setupAccessibility();
    this.setupIntersectionObserver();
    this.setupParallaxEffects();
    this.setupHoverEffects();
    this.setupUseCasesTabs();
  }
  
  /**
   * Setup mobile menu functionality
   */
  setupMobileMenu() {
    if (!this.mobileMenuToggle || !this.mobileMenu) return;
    
    this.mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = this.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      this.mobileMenuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
      
      // Toggle mobile menu visibility
      this.mobileMenu.classList.toggle('active');
      
      // Animate hamburger to X
      this.mobileMenuToggle.classList.toggle('mobile-menu-toggle--active');
      
      // Prevent body scroll when menu is open (from memory fragment solution)
      if (!isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close mobile menu when clicking on mobile nav links
    this.mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && !this.mobileMenu.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Theme toggle is now handled by ThemeManager class
  }
  
  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    if (this.mobileMenu) {
      this.mobileMenu.classList.remove('active');
    }
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.classList.remove('mobile-menu-toggle--active');
      this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    // Restore body scroll when menu is closed (from memory fragment solution)
    document.body.style.overflow = '';
  }
  
  /**
   * Setup smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Only handle internal anchor links
        if (href.startsWith('#')) {
          e.preventDefault();
          this.scrollToSection(href);
        }
      });
    });
  }
  
  /**
   * Smooth scroll to section
   */
  scrollToSection(targetId) {
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    const navHeight = this.nav.offsetHeight;
    const targetPosition = targetElement.offsetTop - navHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
  
  /**
   * Setup FAQ accordion functionality with smooth animations
   */
  setupFAQAccordion() {
    // Get all FAQ items
    this.faqItems = document.querySelectorAll('.faq__item');
    
    this.faqItems.forEach((item, index) => {
      const question = item.querySelector('.faq__question');
      const answer = item.querySelector('.faq__answer');
      const answerContent = item.querySelector('.faq__answer-content');
      
      if (!question || !answer || !answerContent) return;
      
      // Add unique ID to each item
      item.dataset.faqId = `faq-${index}`;
      
      // Click handler for the FAQ question only (not the entire item)
      const handleClick = (e) => {
        // Only trigger if clicking the question area
        if (!e.target.closest('.faq__question')) return;
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Check if currently animating
        if (item.classList.contains('faq-animating')) return;
        
        // Get the exact clicked item by ID
        const clickedId = item.dataset.faqId;
        
        // Get current state
        const isExpanded = item.getAttribute('aria-expanded') === 'true';
        
        // Close all other FAQ items explicitly
        document.querySelectorAll('.faq__item').forEach((otherItem) => {
          if (otherItem.dataset.faqId !== clickedId && otherItem.getAttribute('aria-expanded') === 'true') {
            this.closeFAQItem(otherItem);
          }
        });
        
        // Toggle current item
        if (isExpanded) {
          this.closeFAQItem(item);
        } else {
          this.openFAQItem(item);
        }
      };
      
      // Add click event only to the question
      question.addEventListener('click', handleClick, { once: false, capture: true });
      
      // Keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Simulate click on question
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          question.dispatchEvent(clickEvent);
        }
      });
    });
  }
  
  /**
   * Open FAQ item with smooth animation
   */
  openFAQItem(item) {
    const answer = item.querySelector('.faq__answer');
    const answerContent = item.querySelector('.faq__answer-content');
    
    if (!answer || !answerContent) return;
    
    // Double check this item isn't already open
    if (item.getAttribute('aria-expanded') === 'true') return;
    
    // Mark as animating
    item.classList.add('faq-animating');
    
    // Set aria-expanded to true
    item.setAttribute('aria-expanded', 'true');
    
    // Force a reflow
    void item.offsetHeight;
    
    // Get the full height of the content
    const contentHeight = answerContent.scrollHeight;
    
    // Animate the answer opening with RAF for better performance
    requestAnimationFrame(() => {
      answer.style.maxHeight = (contentHeight + 50) + 'px';
      answer.style.paddingTop = '16px';
      answer.style.paddingBottom = '16px';
    });
    
    // Remove animation lock after transition
    setTimeout(() => {
      item.classList.remove('faq-animating');
    }, 450);
  }
  
  /**
   * Close FAQ item with smooth animation
   */
  closeFAQItem(item) {
    const answer = item.querySelector('.faq__answer');
    
    if (!answer) return;
    
    // Check if already closed
    if (item.getAttribute('aria-expanded') !== 'true') return;
    
    // Mark as animating
    item.classList.add('faq-animating');
    
    // Animate the answer closing with RAF
    requestAnimationFrame(() => {
      answer.style.maxHeight = '0px';
      answer.style.paddingTop = '0px';
      answer.style.paddingBottom = '0px';
    });
    
    // Set aria-expanded to false after animation
    setTimeout(() => {
      item.setAttribute('aria-expanded', 'false');
      item.classList.remove('faq-animating');
    }, 450);
  }
  
  /**
   * Setup scroll effects for header and elements
   */
  setupScrollEffects() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Navbar scroll effect - disabled to prevent flashing
      
      // Parallax effects
      this.updateParallaxElements(scrollTop);
      
      lastScrollTop = scrollTop;
    });
  }
  
  /**
   * Setup intersection observer for scroll animations
   */
  setupIntersectionObserver() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  /**
   * Setup parallax effects
   */
  setupParallaxEffects() {
    this.parallaxElements = document.querySelectorAll('[data-parallax]');
  }
  
  /**
   * Update parallax elements on scroll
   */
  updateParallaxElements(scrollTop) {
    this.parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(scrollTop * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }
  
  /**
   * Setup hover effects for interactive elements
   */
  setupHoverEffects() {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card, .audience-card, .step-card');
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRippleEffect(e, button);
      });
    });
  }
  
  /**
   * Create ripple effect on button click
   */
  createRippleEffect(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Skip link already exists in HTML - no need to create it here
    
    // Keyboard navigation for FAQ is now handled in setupFAQAccordion
    
    // Focus management for mobile menu
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.mobileMenuToggle.click();
        }
      });
    }
  }
  /**
   * Add scroll progress indicator
   */
  addScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      progressBar.style.width = scrollPercent + '%';
    });
  }
  
  /**
   * Setup use cases tab functionality
   */
  setupUseCasesTabs() {
    const tabs = document.querySelectorAll('.use-cases__tab');
    const panels = document.querySelectorAll('.use-cases__panel');
    const content = document.querySelector('.use-cases__content');
    
    if (!tabs.length || !panels.length || !content) return;
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        const targetPanel = document.getElementById(targetTab);
        
        // Don't do anything if clicking the same tab
        if (tab.classList.contains('use-cases__tab--active')) return;
        
        // Add loading state to prevent multiple clicks
        tab.style.pointerEvents = 'none';
        
        // Get current height
        const currentHeight = content.scrollHeight;
        
        // Remove active class from all tabs and panels
        tabs.forEach(t => t.classList.remove('use-cases__tab--active'));
        panels.forEach(panel => panel.classList.remove('use-cases__panel--active'));
        
        // Add active class to clicked tab
        tab.classList.add('use-cases__tab--active');
        
        // Show the target panel
        targetPanel.classList.add('use-cases__panel--active');
        
        // Get new height after content change
        const newHeight = content.scrollHeight;
        
        // Animate height change using max-height
        content.style.maxHeight = currentHeight + 'px';
        content.offsetHeight; // Force reflow
        
        content.style.maxHeight = newHeight + 'px';
        
        // Clean up after animation
        setTimeout(() => {
          content.style.maxHeight = 'none';
          tab.style.pointerEvents = 'auto';
        }, 300);
      });
    });
  }
}

/**
 * Route redirection - ensures users are always redirected to root
 */
function handleRouteRedirection() {
  // Skip redirection logic for local or file-based browsing
  const isFileProtocol = window.location.protocol === 'file:';
  const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1';
  if (isFileProtocol || isLocalhost) return;

  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  
  // Allow root path, index.html, legal pages, and other static pages (both clean URLs and .html)
  if (currentPath === '/' || 
      currentPath === '/index.html' || 
      currentPath === '' ||
      currentPath === '/privacy' ||
      currentPath === '/privacy.html' ||
      currentPath === '/terms' ||
      currentPath === '/terms.html' ||
      currentPath === '/fragments-2026' ||
      currentPath === '/fragments-2026.html' ||
      currentPath.startsWith('/news') ||
      currentPath.startsWith('/blog') ||
      currentPath.endsWith('.html')) {
    return;
  }
  
  // Redirect any other path to root
  // Preserve hash fragments for internal navigation (like #pricing, #features)
  const redirectUrl = '/' + currentHash;
  
  // Use replace instead of assign to avoid adding to browser history
  window.location.replace(redirectUrl);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Convert .html links to clean URLs for production compatibility
  document.querySelectorAll('a[data-clean-url]').forEach(link => {
    const cleanUrl = link.getAttribute('data-clean-url');
    // Only use clean URL if we're not on a simple file server
    if (window.location.protocol !== 'file:' && !window.location.hostname.includes('localhost')) {
      link.href = cleanUrl;
    }
  });
  
  // Handle route redirection first
  handleRouteRedirection();
  
  const app = new UsableApp();
  
  // Add scroll progress indicator
  app.addScrollProgress();

  // Fetch and render Usable version in footer
  (async () => {
    const versionTarget = document.getElementById('usable-version');
    if (!versionTarget) return;
    
    const directUrl = 'https://usable.dev/api/version';
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(directUrl);
    
    async function tryFetch(url) {
      const response = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
    
    try {
      versionTarget.textContent = 'Fetching version…';
      let data;
      try {
        // Primary attempt (may fail due to CORS when served from file:// or other origins)
        data = await tryFetch(directUrl);
      } catch (e) {
        // Fallback via CORS-friendly proxy
        data = await tryFetch(proxyUrl);
      }
      if (data && typeof data.version === 'string' && data.version) {
        versionTarget.textContent = `Usable ${data.version}`;
      } else {
        versionTarget.textContent = '';
      }
    } catch (err) {
      versionTarget.textContent = '';
    }
  })();
});

// Add CSS for new features
const additionalStyles = `
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    z-index: 9999;
    transition: width 0.1s ease;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .animate-in {
    animation: slideUp 0.8s ease-out forwards;
  }
  
  [data-animate] {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease-out;
  }
  
  [data-animate].animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  [data-parallax] {
    transition: transform 0.1s ease-out;
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

