# Performance Optimization Guide

This document outlines the optimizations implemented for the Usable Landing Page.

## ✅ Implemented Optimizations

### 1. Cache Headers (.htaccess)
- **Location**: `.htaccess` file in root directory
- **Impact**: 752 KiB potential savings on repeat visits
- **Configuration**:
  - Static assets (images, fonts, CSS, JS): 1 year cache
  - HTML: 1 hour cache with revalidation
  - JSON/Manifest: 1 day cache
- **Server Support**: Apache (for nginx, see `nginx.conf` example below)

### 2. CSS Minification
- **Location**: `styles/main.min.css`
- **Impact**: ~9 KiB savings (varies)
- **Usage**: Update HTML to use `main.min.css` in production
- **Build**: Run `node build.js` to regenerate minified CSS

### 3. Font Optimization
- **Google Fonts**: Using `display=swap` for better FCP
- **Font Awesome**: Removed entirely, replaced with inline SVG icons
- **Impact**: ~19 KiB saved, eliminated render-blocking CSS

### 4. Image Optimization
- **WebP Support**: All images have WebP fallbacks using `<picture>` elements
- **Lazy Loading**: Below-fold images use `loading="lazy"`
- **Dimensions**: Critical images have explicit `width` and `height` attributes
- **Recommendation**: Convert large PNGs to WebP/AVIF for additional savings

### 5. SEO Improvements
- **Descriptive Link Text**: All links have meaningful text (no generic "Learn more")
- **Meta Tags**: Proper Open Graph and Twitter Card tags
- **Structured Data**: JSON-LD schema markup

## 📋 Additional Optimization Opportunities

### Image Conversion
To further optimize images, convert large PNGs to WebP:

```bash
# Using cwebp (WebP encoder)
cwebp -q 80 input.png -o output.webp

# Using ImageMagick
magick convert input.png -quality 85 output.webp

# Batch conversion script
for file in assets/images/**/*.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

### CSS Purge (Unused CSS Removal)
To remove unused CSS, use PurgeCSS:

```bash
npm install -g purgecss
purgecss --css styles/main.css --content index.html --output styles/
```

Or add to `package.json`:
```json
{
  "scripts": {
    "purgecss": "purgecss --css styles/main.css --content '**/*.html' --output styles/"
  }
}
```

### Server Configuration

#### Nginx Configuration
If using nginx instead of Apache, add to your server block:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache HTML for shorter period
location ~* \.(html|htm)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### Cloudflare/Vercel/Netlify
These platforms handle caching automatically. Ensure:
- Static assets are in `/assets/` directory
- Build output uses `main.min.css`
- Images are optimized (WebP format)

## 🔍 Performance Monitoring

### Lighthouse CI
Add to your CI/CD pipeline:

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

### Performance Budget
Target metrics:
- **Performance Score**: >95
- **FCP**: <1.8s
- **LCP**: <2.5s
- **TBT**: <200ms
- **CLS**: <0.1
- **Total Size**: <500KB (uncompressed)

## 📊 Expected Results

After implementing all optimizations:
- **Performance Score**: 98% → 99%+
- **Best Practices**: 73% → 90%+
- **SEO**: 92% → 100%
- **Bandwidth Savings**: ~1.6 MB per page load
- **Load Time Improvement**: ~380ms faster FCP/LCP

## 🛠️ Maintenance

### Regular Tasks
1. **Monthly**: Run Lighthouse audit and check for regressions
2. **Quarterly**: Review and update unused CSS
3. **As Needed**: Optimize new images before adding to site

### Build Process
```bash
# Development
# Use main.css (unminified)

# Production
node build.js  # Generate minified CSS
# Deploy with main.min.css
```

## 📚 Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Cache Headers Best Practices](https://web.dev/http-cache/)

