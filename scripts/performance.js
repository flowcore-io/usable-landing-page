/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and provides performance insights
 * Vanilla JavaScript - No dependencies
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      debug: options.debug || false,
      reportToConsole: options.reportToConsole !== false, // default true
      endpoint: options.endpoint || null // Optional: send metrics to analytics endpoint
    };
    
    this.metrics = {
      navigationTiming: {},
      resourceTiming: [],
      coreWebVitals: {}
    };
    
    this.init();
  }
  
  /**
   * Initialize performance monitoring
   */
  init() {
    // Wait for page load to collect metrics
    if (document.readyState === 'complete') {
      this.collectMetrics();
    } else {
      window.addEventListener('load', () => this.collectMetrics());
    }
    
    // Collect Core Web Vitals
    this.collectCoreWebVitals();
  }
  
  /**
   * Collect navigation and resource timing metrics
   */
  collectMetrics() {
    // Navigation Timing API
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      this.metrics.navigationTiming = {
        // Page load metrics
        pageLoadTime: timing.loadEventEnd - navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
        domInteractive: timing.domInteractive - navigationStart,
        
        // Network metrics
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        
        // Resource download
        domParsing: timing.domComplete - timing.domLoading,
        resourcesLoaded: timing.loadEventEnd - timing.responseEnd
      };
    }
    
    // Resource Timing API
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      
      this.metrics.resourceTiming = resources.map(resource => ({
        name: resource.name,
        type: this.getResourceType(resource.name),
        duration: Math.round(resource.duration),
        size: resource.transferSize || 0
      }));
    }
    
    // Report if enabled
    if (this.options.reportToConsole) {
      this.reportToConsole();
    }
    
    // Send to endpoint if configured
    if (this.options.endpoint) {
      this.sendToEndpoint();
    }
  }
  
  /**
   * Collect Core Web Vitals (LCP, FID, CLS)
   */
  collectCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.coreWebVitals.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
          
          if (this.options.debug) {
            console.log('LCP:', this.metrics.coreWebVitals.lcp, 'ms');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.coreWebVitals.fid = Math.round(entry.processingStart - entry.startTime);
            
            if (this.options.debug) {
              console.log('FID:', this.metrics.coreWebVitals.fid, 'ms');
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.coreWebVitals.cls = Math.round(clsValue * 1000) / 1000;
              
              if (this.options.debug) {
                console.log('CLS:', this.metrics.coreWebVitals.cls);
              }
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        // Silent fail - Performance Observer not supported
        if (this.options.debug) {
          console.warn('Performance Observer not supported:', error);
        }
      }
    }
  }
  
  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.css')) return 'CSS';
    if (url.includes('.js')) return 'JavaScript';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)) return 'Image';
    if (url.match(/\.(woff|woff2|ttf|otf)/i)) return 'Font';
    return 'Other';
  }
  
  /**
   * Report metrics to console
   */
  reportToConsole() {
    console.group('📊 Performance Metrics');
    
    // Navigation Timing
    if (this.metrics.navigationTiming.pageLoadTime) {
      console.group('⏱️ Navigation Timing');
      console.log('Page Load Time:', this.metrics.navigationTiming.pageLoadTime, 'ms');
      console.log('DOM Content Loaded:', this.metrics.navigationTiming.domContentLoaded, 'ms');
      console.log('DOM Interactive:', this.metrics.navigationTiming.domInteractive, 'ms');
      console.log('DNS Lookup:', this.metrics.navigationTiming.dnsLookup, 'ms');
      console.log('TCP Connection:', this.metrics.navigationTiming.tcpConnection, 'ms');
      console.log('Server Response:', this.metrics.navigationTiming.serverResponse, 'ms');
      console.groupEnd();
    }
    
    // Core Web Vitals
    if (Object.keys(this.metrics.coreWebVitals).length > 0) {
      console.group('🎯 Core Web Vitals');
      if (this.metrics.coreWebVitals.lcp) {
        const lcpRating = this.metrics.coreWebVitals.lcp < 2500 ? '✅ Good' : 
                         this.metrics.coreWebVitals.lcp < 4000 ? '⚠️ Needs Improvement' : '❌ Poor';
        console.log('LCP (Largest Contentful Paint):', this.metrics.coreWebVitals.lcp, 'ms', lcpRating);
      }
      if (this.metrics.coreWebVitals.fid !== undefined) {
        const fidRating = this.metrics.coreWebVitals.fid < 100 ? '✅ Good' : 
                         this.metrics.coreWebVitals.fid < 300 ? '⚠️ Needs Improvement' : '❌ Poor';
        console.log('FID (First Input Delay):', this.metrics.coreWebVitals.fid, 'ms', fidRating);
      }
      if (this.metrics.coreWebVitals.cls !== undefined) {
        const clsRating = this.metrics.coreWebVitals.cls < 0.1 ? '✅ Good' : 
                         this.metrics.coreWebVitals.cls < 0.25 ? '⚠️ Needs Improvement' : '❌ Poor';
        console.log('CLS (Cumulative Layout Shift):', this.metrics.coreWebVitals.cls, clsRating);
      }
      console.groupEnd();
    }
    
    // Resource Summary
    if (this.metrics.resourceTiming.length > 0) {
      console.group('📦 Resources Summary');
      const byType = this.groupResourcesByType();
      Object.entries(byType).forEach(([type, resources]) => {
        const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
        const avgDuration = Math.round(resources.reduce((sum, r) => sum + r.duration, 0) / resources.length);
        console.log(`${type}: ${resources.length} files, ${this.formatBytes(totalSize)}, avg ${avgDuration}ms`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
  
  /**
   * Group resources by type
   */
  groupResourcesByType() {
    return this.metrics.resourceTiming.reduce((acc, resource) => {
      const type = resource.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(resource);
      return acc;
    }, {});
  }
  
  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  /**
   * Send metrics to analytics endpoint
   */
  async sendToEndpoint() {
    if (!this.options.endpoint) return;
    
    try {
      await fetch(this.options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          metrics: this.metrics
        })
      });
    } catch (error) {
      if (this.options.debug) {
        console.error('Failed to send metrics:', error);
      }
    }
  }
  
  /**
   * Get all collected metrics
   */
  getMetrics() {
    return this.metrics;
  }
  
  /**
   * Get performance grade based on Core Web Vitals
   */
  getPerformanceGrade() {
    const { lcp, fid, cls } = this.metrics.coreWebVitals;
    
    let score = 0;
    let total = 0;
    
    if (lcp !== undefined) {
      score += lcp < 2500 ? 100 : lcp < 4000 ? 50 : 0;
      total += 100;
    }
    
    if (fid !== undefined) {
      score += fid < 100 ? 100 : fid < 300 ? 50 : 0;
      total += 100;
    }
    
    if (cls !== undefined) {
      score += cls < 0.1 ? 100 : cls < 0.25 ? 50 : 0;
      total += 100;
    }
    
    if (total === 0) return null;
    
    const percentage = (score / total) * 100;
    
    if (percentage >= 90) return { grade: 'A', score: percentage };
    if (percentage >= 80) return { grade: 'B', score: percentage };
    if (percentage >= 70) return { grade: 'C', score: percentage };
    if (percentage >= 60) return { grade: 'D', score: percentage };
    return { grade: 'F', score: percentage };
  }
}

/**
 * Usage Examples:
 * 
 * // Basic usage (console reporting only)
 * const monitor = new PerformanceMonitor();
 * 
 * // Debug mode with verbose logging
 * const monitor = new PerformanceMonitor({ debug: true });
 * 
 * // Send to analytics endpoint
 * const monitor = new PerformanceMonitor({ 
 *   endpoint: 'https://analytics.example.com/metrics' 
 * });
 * 
 * // Get metrics programmatically
 * const metrics = monitor.getMetrics();
 * 
 * // Get performance grade
 * const grade = monitor.getPerformanceGrade();
 * console.log('Performance Grade:', grade); // { grade: 'A', score: 95 }
 */

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}

// Auto-initialize in development mode (localhost only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor({ 
      debug: false,
      reportToConsole: true 
    });
  });
}
