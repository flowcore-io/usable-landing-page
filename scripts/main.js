/**
 * Main JavaScript for Usable Landing Page
 * Handles navigation, smooth scrolling, and interactive features
 */

class UsableApp {
  constructor() {
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.nav = document.querySelector('.nav');
    this.navLinks = document.querySelectorAll('.nav__link');
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
  }
  
  /**
   * Setup mobile menu functionality
   */
  setupMobileMenu() {
    if (!this.mobileMenuToggle) return;
    
    this.mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = this.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      this.mobileMenuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
      
      // Toggle mobile menu visibility
      this.nav.classList.toggle('nav--mobile-open');
      
      // Animate hamburger to X
      this.mobileMenuToggle.classList.toggle('mobile-menu-toggle--active');
    });
    
    // Close mobile menu when clicking on nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }
  
  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.nav.classList.remove('nav--mobile-open');
    this.mobileMenuToggle.classList.remove('mobile-menu-toggle--active');
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
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
   * Setup FAQ accordion functionality
   */
  setupFAQAccordion() {
    this.faqItems.forEach(item => {
      const summary = item.querySelector('summary');
      const content = item.querySelector('.faq__answer');
      
      if (!summary || !content) return;
      
      // Add click event to summary
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        
        const isOpen = item.hasAttribute('open');
        
        // Close all other FAQ items
        this.faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.removeAttribute('open');
          }
        });
        
        // Toggle current item
        if (isOpen) {
          item.removeAttribute('open');
        } else {
          item.setAttribute('open', '');
        }
      });
    });
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
   * Setup intersection observer for animations
   */
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Add staggered animation for child elements
          const animatedChildren = entry.target.querySelectorAll('[data-animate]');
          animatedChildren.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-in');
            }, index * 100);
          });
        }
      });
    }, this.observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.feature-card, .audience-card, .step-card, .pricing-card');
    animatedElements.forEach(el => observer.observe(el));
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
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const mainContent = document.querySelector('main') || document.querySelector('.hero');
    if (mainContent) {
      mainContent.id = 'main-content';
    }
    
    // Keyboard navigation for FAQ
    this.faqItems.forEach(item => {
      const summary = item.querySelector('summary');
      if (summary) {
        summary.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            summary.click();
          }
        });
      }
    });
    
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
   * Add loading animation to page
   */
  addLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <p>Loading Usable...</p>
      </div>
    `;
    
    document.body.appendChild(loader);
    
    // Remove loader after page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.remove();
        }, 300);
      }, 500);
    });
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new UsableApp();
  
  // Add loading animation
  app.addLoadingAnimation();
  
  // Add scroll progress indicator
  app.addScrollProgress();
});

// Add CSS for new features
const additionalStyles = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 10000;
    transition: top 0.3s;
  }
  
  .skip-link:focus {
    top: 6px;
  }
  
  .page-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    transition: opacity 0.3s;
  }
  
  .loader-content {
    text-align: center;
  }
  
  .loader-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--color-gray-200);
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
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

