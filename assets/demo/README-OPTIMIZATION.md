# Demo Screenshots Optimization Guide

The screenshots in this directory are large (330KB+ each). To optimize page loading performance, especially on slow devices, follow these steps:

## Quick Optimization Steps

### 1. Convert to WebP Format

Run the optimization script to convert all PNG screenshots to WebP format:

```bash
./scripts/optimize-demo-screenshots.sh
```

This will:
- Convert all PNG files to WebP format (~60-80% size reduction)
- Create smaller versions for thumbnails (optional)
- Show size savings for each conversion

**Expected Results:**
- Original: ~330KB per PNG
- WebP: ~66-132KB per image (60-80% reduction)
- **Total savings: ~8-10MB for all 37 screenshots**

### 2. Verify WebP Files Created

After running the script, you should see `.webp` files alongside each `.png` file:

```
assets/demo/
  ├── Screenshot 2025-12-31 at 17.25.33.png
  ├── Screenshot 2025-12-31 at 17.25.33.webp  ← New optimized version
  ├── Screenshot 2025-12-31 at 17.27.45.png
  ├── Screenshot 2025-12-31 at 17.27.45.webp  ← New optimized version
  └── ...
```

### 3. HTML Already Updated

The HTML file (`detailed-screenshots.html`) has already been updated to:
- Use WebP format with PNG fallback (for browsers that don't support WebP)
- Include `loading="lazy"` for below-fold images
- Include `decoding="async"` for non-blocking image decoding
- Include `fetchpriority="low"` for below-fold images
- Include `width` and `height` attributes to prevent layout shift

## Manual Optimization (Alternative)

If you prefer to optimize manually or use different tools:

### Using Online Tools
1. **Squoosh** (Recommended): https://squoosh.app/
   - Drag and drop PNG files
   - Select WebP format
   - Quality: 80-85 (good balance)
   - Download and replace in `assets/demo/`

### Using Command Line
```bash
# Install WebP tools
brew install webp  # macOS
# or
apt-get install webp  # Linux

# Convert single image
cwebp -q 80 "assets/demo/Screenshot 2025-12-31 at 17.25.33.png" -o "assets/demo/Screenshot 2025-12-31 at 17.25.33.webp"

# Convert all images
for file in assets/demo/*.png; do
    cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

## Performance Impact

### Before Optimization
- **Total size**: ~12MB (37 images × 330KB)
- **Load time on 3G**: ~40-60 seconds
- **Load time on 4G**: ~15-20 seconds

### After Optimization (WebP)
- **Total size**: ~2.4-4.8MB (37 images × 66-132KB)
- **Load time on 3G**: ~8-15 seconds (70% faster)
- **Load time on 4G**: ~3-6 seconds (70% faster)
- **Bandwidth savings**: ~7-9MB per page load

## Additional Optimizations Already Implemented

1. **Lazy Loading**: Images below the fold load only when scrolled into view
2. **Async Decoding**: Images decode asynchronously, not blocking page rendering
3. **Fetch Priority**: Below-fold images marked as low priority
4. **Responsive Images**: Using `<picture>` element for format selection
5. **Layout Stability**: Width/height attributes prevent layout shift

## Browser Support

- **WebP**: Supported in 95%+ of browsers globally
- **Fallback**: PNG format used automatically for older browsers
- **No JavaScript**: All optimizations work without JavaScript

## Maintenance

- **New Screenshots**: Run the optimization script after adding new screenshots
- **Quality Check**: Periodically verify WebP files exist for all PNGs
- **Size Monitoring**: Check total directory size to ensure optimizations are working

