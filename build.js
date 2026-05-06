#!/usr/bin/env node
/**
 * Build script for Usable Landing Page
 *
 * Concatenates and minifies all CSS into a single bundle (styles/main.min.css)
 * so each HTML page can serve one stylesheet instead of dozens of <link> tags.
 * Source files stay modular under styles/ — only the build output is bundled.
 */

const fs = require('fs');
const path = require('path');

const STYLES_DIR = path.join(__dirname, 'styles');
const OUTPUT_FILE = path.join(STYLES_DIR, 'main.min.css');

// Simple CSS minifier — strips comments, collapses whitespace, removes unnecessary
// spaces around braces/colons/semicolons. Safe for vanilla CSS3.
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/;\s*}/g, '}')
    .trim();
}

// Walks the styles/ directory and returns an ordered list of CSS source files.
// main.css ships first (CSS variables, resets), components alphabetically,
// then any remaining root-level files (e.g. sandbox.css).
function collectCSSFiles() {
  const files = [];
  const mainPath = path.join(STYLES_DIR, 'main.css');
  if (fs.existsSync(mainPath)) files.push(mainPath);

  const componentsDir = path.join(STYLES_DIR, 'components');
  if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir)
      .filter((name) => name.endsWith('.css'))
      .sort()
      .forEach((name) => files.push(path.join(componentsDir, name)));
  }

  fs.readdirSync(STYLES_DIR)
    .filter((name) => name.endsWith('.css') && name !== 'main.css' && name !== 'main.min.css')
    .sort()
    .forEach((name) => files.push(path.join(STYLES_DIR, name)));

  return files;
}

function build() {
  console.log('Building Usable Landing Page CSS bundle...\n');

  const sourceFiles = collectCSSFiles();
  if (sourceFiles.length === 0) {
    console.error('No CSS source files found in', STYLES_DIR);
    process.exit(1);
  }

  let combined = '';
  let originalSize = 0;
  for (const file of sourceFiles) {
    const css = fs.readFileSync(file, 'utf8');
    originalSize += Buffer.byteLength(css, 'utf8');
    combined += `/* ${path.relative(STYLES_DIR, file)} */\n${css}\n`;
  }

  const minified = minifyCSS(combined);
  fs.writeFileSync(OUTPUT_FILE, minified, 'utf8');

  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const savings = originalSize - minifiedSize;
  const savingsPct = ((savings / originalSize) * 100).toFixed(1);

  console.log(`Bundled ${sourceFiles.length} CSS files into ${path.relative(__dirname, OUTPUT_FILE)}`);
  console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`  Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
  console.log(`  Savings:  ${(savings / 1024).toFixed(2)} KB (${savingsPct}%)\n`);
  console.log('Build complete.');
}

build();
