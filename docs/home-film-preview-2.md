# Adaptive film homepage preview

Public preview: `/home-film-preview-2.html` (unlisted, `noindex, nofollow`).

The ordinary HTML contains the hero, both Organizational Memory Cycle diagrams,
navigation and homepage sections. Film markup lives in an inert template; slow
connections download no film clips or film posters. The hero uses a 17 KB mobile
or 48 KB desktop poster and a 4 KB mascot; shared logo SVGs replace large PNGs.

`assets/film-preview-2/preview.js` automatically enhances the hero only when the
Network Information API estimates at least 5 Mbps, reports effective type `4g`
and RTT at most 200 ms, with Data Saver and reduced motion both off. Unknown
connections remain on the still version. This is an estimate, not a speed test.
It is rechecked after loading the engine, and automatic enhancement is cancelled
if the visitor has started scrolling or focusing page controls.

The visitor can choose the visual story manually, or return to the still version.
`?view=light` forces the still version; `?view=film` explicitly opens the story.
Data Saver and reduced motion continue to suppress video even in manual story
mode. An automatically started film returns to still mode if connection signals
subsequently become poor. Existing page translations apply to restored content;
the new film controls are English and explicitly marked `lang="en"`.

The preview owns a modified copy of ScrollCraft. It streams native MP4 sources
instead of downloading full blobs, requests only near-current scenes, defers later
posters, and retains posters until actual decoded frames are available. Media
errors remain on their posters without retry loops. Invisible film scenes and the
outer finale fade are inert to keyboard navigation. These files do not modify the
original preview's engine or shared site styles.

Navbar, CTA and footer are copied from the shared components into this unlisted
preview so essential content does not depend on their asynchronous loader. Keep
these copies aligned if shared component content changes before promotion.

## Verification

- `python3 -m unittest discover -s tests -p 'test_*.py'` — 27 existing tests.
- `node tests/check_home_film_preview_2.cjs` — live browser checks, requires an
  existing Playwright installation. `PLAYWRIGHT_MODULE` may point to that module.
  Defaults to localhost:8080; `PREVIEW_URL` can select a staging or live page.
- Browser coverage: slow/unknown/fast connections, Data Saver, reduced motion,
  no JavaScript, manual switching, blocked engine/mount script, failed video.
- Independent visual review: widths 320, 390, 768, 1440; short phones 320×568 and
  360×640; cycle anchors, navigation and final-fade keyboard focus.

The initial production release uses a small image layer adding only this page
and its assets to the existing production image. The regular Dockerfile/build
also includes these files when the repository is subsequently deployed normally.
