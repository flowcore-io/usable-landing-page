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
const crypto = require('crypto');

const STYLES_DIR = path.join(__dirname, 'styles');
const OUTPUT_FILE = path.join(STYLES_DIR, 'main.min.css');
const STYLESHEET_PATH = '/styles/main.min.css';
const I18N_FILE = path.join(__dirname, 'scripts', 'i18n.js');
const I18N_PATH = '/scripts/i18n.js';
const MAIN_FILE = path.join(__dirname, 'scripts', 'main.js');
const MAIN_PATH = '/scripts/main.js';
const HTML_EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.venv',
  'components',
  'node_modules',
  'opendesign',
  'tests',
]);

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

function collectPublicHTMLFiles(directory = __dirname) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!HTML_EXCLUDED_DIRECTORIES.has(entry.name) && !entry.name.startsWith('.')) {
        files.push(...collectPublicHTMLFiles(path.join(directory, entry.name)));
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files.sort();
}

// Version the shared stylesheet URL from its content so a deployment never serves
// new HTML with a stale bundle from the browser cache. Query strings keep the
// stable on-disk filename while giving every bundle revision a unique cache key.
function versionStylesheetLinks(css) {
  const version = crypto.createHash('sha256').update(css).digest('hex').slice(0, 12);
  const versionedPath = `${STYLESHEET_PATH}?v=${version}`;
  const stylesheetPattern = /\/styles\/main\.min\.css(?:\?v=[^"'\s#]+)?/g;
  let updatedFiles = 0;

  for (const file of collectPublicHTMLFiles()) {
    const html = fs.readFileSync(file, 'utf8');
    const versionedHtml = html.replace(stylesheetPattern, versionedPath);

    if (versionedHtml !== html) {
      fs.writeFileSync(file, versionedHtml, 'utf8');
      updatedFiles += 1;
    }
  }

  return { version, updatedFiles };
}

// Version the route-aware i18n script for the same reason as the CSS bundle:
// browsers may otherwise keep the previous language-routing behavior for an
// hour after deploy because nginx marks JavaScript as publicly cacheable.
function versionScriptLinks(source, scriptPath) {
  const version = crypto.createHash('sha256').update(source).digest('hex').slice(0, 12);
  const versionedPath = `${scriptPath}?v=${version}`;
  const escapedScriptPath = scriptPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const scriptPattern = new RegExp(`${escapedScriptPath}(?:\\?v=[^"'\\s#]+)?`, 'g');
  let updatedFiles = 0;

  for (const file of collectPublicHTMLFiles()) {
    const html = fs.readFileSync(file, 'utf8');
    const versionedHtml = html.replace(scriptPattern, versionedPath);

    if (versionedHtml !== html) {
      fs.writeFileSync(file, versionedHtml, 'utf8');
      updatedFiles += 1;
    }
  }

  return { version, updatedFiles };
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
  const cacheVersion = versionStylesheetLinks(minified);
  const i18nSource = fs.readFileSync(I18N_FILE);
  const i18nCacheVersion = versionScriptLinks(i18nSource, I18N_PATH);
  const mainSource = fs.readFileSync(MAIN_FILE);
  const mainCacheVersion = versionScriptLinks(mainSource, MAIN_PATH);

  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const savings = originalSize - minifiedSize;
  const savingsPct = ((savings / originalSize) * 100).toFixed(1);

  console.log(`Bundled ${sourceFiles.length} CSS files into ${path.relative(__dirname, OUTPUT_FILE)}`);
  console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`  Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
  console.log(`  Savings:  ${(savings / 1024).toFixed(2)} KB (${savingsPct}%)\n`);
  console.log(`  Cache version: ${cacheVersion.version}`);
  console.log(`  Versioned HTML files: ${cacheVersion.updatedFiles}`);
  console.log(`  i18n cache version: ${i18nCacheVersion.version}`);
  console.log(`  Versioned i18n HTML files: ${i18nCacheVersion.updatedFiles}`);
  console.log(`  main cache version: ${mainCacheVersion.version}`);
  console.log(`  Versioned main HTML files: ${mainCacheVersion.updatedFiles}\n`);
  console.log('Build complete.');
}

build();
