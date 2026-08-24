# auth.md compatibility evidence

Captured from the locally built site on August 24, 2026 at
`http://127.0.0.1:8001/blog/connect-an-ai-agent-to-usable-with-auth-md.html`.
Animations and transitions were disabled only for deterministic captures.

## Verification

- `node build.js`
- `python3 -m unittest discover -s tests -v` — 6/6 passed
- changed HTML parsed with Python `html.parser`
- `sitemap.xml` parsed as XML
- `git diff --check`
- Chromium console — zero errors and zero warnings
- desktop 1440 × 1000 — no document overflow
- mobile 390 × 844 viewport — no document overflow; article body captured at 358 × 869

## Public compatibility page

### Desktop — 1440 × 1000

![Simplified auth.md compatibility page on desktop](./auth-md-guide-desktop.png)

### Mobile article — 358 × 869

![Simplified auth.md compatibility list on mobile](./auth-md-guide-mobile.png)

## Evidence boundary

These screenshots prove the public page now contains only the verified-runtime status, the untested status, and a link to the `auth.md` standard. No protocol internals or secret values appear.
