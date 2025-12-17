#!/usr/bin/env node
/**
 * Build script for Usable Landing Page
 * Minifies CSS and optimizes assets
 */

const fs = require('fs');
const path = require('path');

// Simple CSS minifier
function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around braces, colons, semicolons
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    // Remove semicolon before closing brace
    .replace(/;\s*}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
}

// Main build function
function build() {
  console.log('🚀 Building Usable Landing Page...\n');

  // Minify CSS
  const cssPath = path.join(__dirname, 'styles', 'main.css');
  const cssMinPath = path.join(__dirname, 'styles', 'main.min.css');
  
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    const minified = minifyCSS(css);
    fs.writeFileSync(cssMinPath, minified, 'utf8');
    
    const originalSize = Buffer.byteLength(css, 'utf8');
    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    const savings = originalSize - minifiedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
    
    console.log('✅ CSS Minified:');
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${(savings / 1024).toFixed(2)} KB (${savingsPercent}%)\n`);
  } else {
    console.error('❌ CSS file not found:', cssPath);
    process.exit(1);
  }

  console.log('✨ Build complete!');
}

// Run build
build();

