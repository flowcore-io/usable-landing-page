#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: file is missing`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireText(relativePath, source, expected) {
  if (!source.includes(expected)) {
    failures.push(`${relativePath}: missing required text: ${expected}`);
  }
}

function forbidPattern(relativePath, source, pattern, description) {
  if (pattern.test(source)) {
    failures.push(`${relativePath}: contains ${description}`);
  }
}

const terms = read("terms.html");
const privacy = read("privacy.html");
const refund = read("refund-and-fulfillment.html");
const subscription = read("subscription-terms.html");
const footer = read("components/footer.html");
const sitemap = read("sitemap.xml");
const faroeseTranslations = read("translations/fo.json");

for (const [relativePath, source] of [
  ["terms.html", terms],
  ["privacy.html", privacy],
]) {
  forbidPattern(
    relativePath,
    source,
    /\[(?:Cloud Provider|Region|Jurisdiction|Location|Arbitration Rules)[^\]]*\]/i,
    "an unresolved legal or provider placeholder",
  );
  forbidPattern(
    relativePath,
    source,
    /operated by Flowcore|\[AWS, Google Cloud\]|\[Provider\]/i,
    "stale template content",
  );
}

if ((privacy.match(/<h1[^>]*>Privacy Policy<\/h1>/g) || []).length !== 1) {
  failures.push("privacy.html: must contain exactly one Privacy Policy h1");
}

for (const [relativePath, source] of [
  ["terms.html", terms],
  ["refund-and-fulfillment.html", refund],
  ["subscription-terms.html", subscription],
]) {
  for (const expected of [
    "https://usable.dev/dashboard/billing",
    "Available tiers",
    "Free",
    "Downgrade",
    "Confirm Switch",
    "immediately",
  ]) {
    requireText(relativePath, source, expected);
  }
}

for (const expected of [
  'content="subscription-terms@1.0"',
  "Usable Standard or Pro subscription",
  "renews automatically",
  "recurring amount",
  "billing interval",
]) {
  requireText("subscription-terms.html", subscription, expected);
}

for (const expected of [
  "Microsoft Azure OpenAI",
  "OpenRouter",
  "Cerebras",
  "AWS Bedrock",
  "fully automated",
  "human review",
  "does not scrape",
  "unauthorised collection",
]) {
  requireText("privacy.html", privacy, expected);
}

requireText(
  "components/footer.html",
  footer,
  'data-clean-url="/subscription-terms"',
);
requireText(
  "sitemap.xml",
  sitemap,
  "<loc>https://www.usable.dev/subscription-terms</loc>",
);

for (const expected of [
  "https://usable.dev/dashboard/billing",
  "Confirm Switch",
  "Microsoft Azure OpenAI",
  "OpenRouter",
  "Cerebras",
  "AWS Bedrock",
]) {
  requireText("translations/fo.json", faroeseTranslations, expected);
}
forbidPattern(
  "translations/fo.json",
  faroeseTranslations,
  /fær uppsøgnin gildi, tá ið verandi goldna gjaldstíðarskeiðið er runnið/,
  "the superseded end-of-period cancellation wording",
);

if (failures.length > 0) {
  console.error("Clearhaus compliance validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Clearhaus compliance validation passed.");
