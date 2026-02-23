# 🚀 Performance Optimization Guide - Usable Landing Page

**Comprehensive guide for optimizing the Usable landing page**  
**Last Updated**: February 17, 2026  
**Maintained by**: Orlando

---

## 📊 Quick Summary

| Optimization | Status | Impact | File Size Savings |
|-------------|--------|--------|-------------------|
| Cache Headers | ✅ Implemented | High | 752 KiB on repeat visits |
| CSS Minification | ✅ Implemented | Medium | ~9-37 KB |
| Font Optimization | ✅ Completed | Medium | ~19 KB |
| Image Optimization (WebP) | ⚠️ Setup Ready | High | 200-738 KB |
| Unused CSS Removal | ⚠️ Setup Ready | Low | ~12 KB |
| Bokeh Optimization | ✅ Completed | Medium | 50% DOM reduction |

**Total Potential Savings**: ~1.6 MB per page load

---

## ✅ Completed Optimizations

### 1. Cache Headers Configuration
**File**: `.htaccess`  
**Impact**: 752 KiB savings on repeat visits

```apache
# Static assets (images, fonts, CSS, JS): 1 year cache
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2)$">
  Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>

# HTML: 1 hour cache with revalidation
<FilesMatch "\.(html|htm)$">
  Header set Cache-Control "max-age=3600, public, must-revalidate"
</FilesMatch>
```

**For Nginx** (add to server block):
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html|htm)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

### 2. CSS Minification
**Files**: `styles/main.min.css`, `build.js`  
**Impact**: ~37 KB saved (24.8% reduction)

**Usage**:
```bash
# Generate minified CSS
node build.js

# Update HTML for production
# Change: <link rel="stylesheet" href="styles/main.css">
# To:     <link rel="stylesheet" href="styles/main.min.css">
```

### 3. Font Optimization
**Impact**: ~19 KB saved, eliminated render-blocking CSS

- ✅ Google Fonts using `display=swap` for better FCP
- ✅ Font Awesome removed entirely
- ✅ Replaced with inline SVG icons

### 4. Bokeh Animation Optimization
**Impact**: 50% reduction in animated elements (30 → 15)

- ✅ Reduced from 30 to 15 bokeh circles
- ✅ Better performance on mobile devices
- ✅ Respects `prefers-reduced-motion`

### 5. Image Loading Strategy
- ✅ Lazy loading for below-fold images (`loading="lazy"`)
- ✅ Explicit width/height attributes prevent layout shift
- ✅ WebP support with `<picture>` fallbacks

### 6. SEO & Accessibility
- ✅ Descriptive link text (no generic "Learn more")
- ✅ Proper Open Graph and Twitter Card tags
- ✅ JSON-LD structured data
- ✅ Skip-to-content link for accessibility
- ✅ Enhanced focus indicators
- ✅ Reduced motion support

---

## ⚠️ To-Do: Manual Optimization Steps

### 1. WebP Image Conversion (HIGH PRIORITY)

**Why WebP?**
- ~80% smaller file sizes compared to PNG
- Faster page loading, especially on mobile
- Better Core Web Vitals scores
- 95%+ browser support

**Images to Convert:**
- `assets/images/usable-mascot.png` → `usable-mascot.webp`
- `assets/images/Usable - Logo - With Text (for light mode).png` → `.webp`
- `assets/images/Usable - Logo - With Text (for dark mode).png` → `.webp`
- All other large PNGs in `assets/images/`

**Conversion Methods:**

**Option 1: Online Tools (Easiest)**
- [Squoosh](https://squoosh.app/) - Recommended
- [CloudConvert](https://cloudconvert.com/png-to-webp)

**Option 2: Command Line**
```bash
# Install WebP tools
# Windows: choco install webp
# Mac: brew install webp
# Linux: sudo apt install webp

# Convert single image
cwebp -q 80 input.png -o output.webp

# Batch convert
for file in assets/images/*.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

**After Conversion:**

Update HTML to use `<picture>` elements:
```html
<picture>
    <source srcset="assets/images/usable-mascot.webp" type="image/webp">
    <img src="assets/images/usable-mascot.png" 
         alt="Usable Nudibranch Mascot" 
         class="hero__mascot" 
         loading="lazy">
</picture>
```

### 2. Unused CSS Removal (OPTIONAL)

**Setup**:
```bash
npm install
npm run purgecss
```

**Configuration**: `.purgecssrc.json`
```json
{
  "content": ["**/*.html", "**/*.js"],
  "css": ["styles/main.css"],
  "safelist": [
    "data-theme",
    "animate",
    "fade-in",
    "fade-in-up"
  ]
}
```

**Impact**: ~12 KB potential savings

---

## 📋 Build & Deployment Process

### Development
```bash
# Use unminified CSS for debugging
# styles/main.css is linked in HTML
```

### Production Build
```bash
# 1. Minify CSS
node build.js

# 2. (Optional) Remove unused CSS
npm run purgecss

# 3. Update HTML to use minified CSS
# Change: href="styles/main.css"
# To:     href="styles/main.min.css"

# 4. Deploy
```

---

## 🎯 Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

### Lighthouse Scores (Target)
- **Performance**: 95+ ✅
- **Accessibility**: 100 ✅
- **Best Practices**: 90+ ✅
- **SEO**: 100 ✅

### Budget Constraints
- **Total Page Size**: < 500 KB (uncompressed)
- **JavaScript**: < 150 KB
- **CSS**: < 50 KB (minified)
- **Images**: < 300 KB (optimized)

---

## 🔍 Testing & Monitoring

### Performance Audit Tools

**1. Lighthouse (Chrome DevTools)**
```bash
# Run Lighthouse audit
# Chrome DevTools → Lighthouse tab → Generate report
```

**2. Google PageSpeed Insights**
- URL: https://pagespeed.web.dev/
- Test both Mobile and Desktop
- Target: 90+ performance score

**3. WebPageTest**
- URL: https://www.webpagetest.org/
- Test from multiple locations
- Review waterfall chart for bottlenecks

**4. GTmetrix**
- URL: https://gtmetrix.com/
- Detailed performance report
- Track improvements over time

### Continuous Integration

Add Lighthouse CI to your pipeline:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

---

## 📊 Expected Results

### Before Optimizations
- Performance Score: ~70-80%
- Page Size: ~2.2 MB
- Load Time: 3-5s

### After All Optimizations
- Performance Score: 95-99%
- Page Size: ~600 KB
- Load Time: 1-2s
- Bandwidth Savings: ~1.6 MB per page load
- Load Time Improvement: 60-70% faster

---

## 🛠️ Maintenance Schedule

### Weekly
- [ ] Monitor Lighthouse scores for regressions

### Monthly
- [ ] Review Core Web Vitals in Search Console
- [ ] Check for new optimization opportunities

### Quarterly
- [ ] Review and update unused CSS
- [ ] Audit image optimization
- [ ] Update documentation

---

## 📚 Additional Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Cache Headers Best Practices](https://web.dev/http-cache/)
- [WebP Documentation](https://developers.google.com/speed/webp)
- [Core Web Vitals](https://web.dev/vitals/)

---

## ✅ Optimization Checklist

### Completed ✅
- [x] Cache headers configuration
- [x] CSS minification
- [x] Font optimization (removed Font Awesome)
- [x] Lazy loading images
- [x] SEO meta tags
- [x] Structured data (JSON-LD)
- [x] Accessibility enhancements
- [x] Reduced motion support
- [x] Bokeh element reduction (30 → 15)
- [x] sitemap.xml
- [x] robots.txt
- [x] site.webmanifest

### To-Do 📋
- [ ] Convert images to WebP format
- [ ] Run unused CSS removal (optional)
- [ ] Generate complete favicon set
- [ ] Add service worker for offline support (optional)
- [ ] Implement critical CSS (optional)

---

**Questions or Need Help?**

Orlando is always available to assist with optimizations. Feel free to ask!

---

*Last Updated: February 17, 2026*  
*Orlando - Senior Landing Page Designer & Frontend Engineer*
