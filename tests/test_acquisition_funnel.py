#!/usr/bin/env python3
"""Regression checks for public acquisition links."""

from html.parser import HTMLParser
import hashlib
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors = []
        self._current = None

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self._current = {"attrs": dict(attrs), "text": ""}

    def handle_data(self, data):
        if self._current is not None:
            self._current["text"] += data

    def handle_endtag(self, tag):
        if tag == "a" and self._current is not None:
            self.anchors.append(self._current)
            self._current = None


def anchors_in(path: Path):
    parser = AnchorParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser.anchors


class AcquisitionFunnelLinksTest(unittest.TestCase):
    def test_signup_calls_to_action_open_signup_not_login(self):
        failures = []
        signup_phrases = (
            "start for free",
            "start free",
            "sign up",
            "choose standard",
            "choose pro",
        )
        for path in [*ROOT.glob("*.html"), *ROOT.glob("components/*.html")]:
            for anchor in anchors_in(path):
                text = " ".join(anchor["text"].split()).lower()
                href = anchor["attrs"].get("href", "")
                if any(phrase in text for phrase in signup_phrases) and "/signup" not in href:
                    failures.append(f"{path.relative_to(ROOT)}: {text!r} -> {href!r}")
        self.assertEqual([], failures, "Signup CTAs must bypass the login-first dead end:\n" + "\n".join(failures))

    def test_product_clean_routes_are_allowlisted(self):
        main_js = (ROOT / "scripts/main.js").read_text(encoding="utf-8")
        for route in ("/usable", "/usable-chat"):
            self.assertIn(
                f"currentPath === '{route}'",
                main_js,
                f"{route} is served by nginx and must not be redirected back to the homepage",
            )

    def test_apex_host_redirect_preserves_exact_campaign_query(self):
        nginx_conf = (ROOT / "nginx.conf").read_text(encoding="utf-8")
        self.assertIn("server_name usable.dev", nginx_conf)
        self.assertRegex(
            nginx_conf,
            r"return\s+30[78]\s+https://www\.usable\.dev\$request_uri;",
            "Apex usable.dev redirects must preserve the exact path and query string with $request_uri",
        )
        self.assertNotRegex(
            nginx_conf,
            r"https://www\.usable\.dev/?\s*;",
            "Do not redirect to bare www host because that drops campaign parameters",
        )
        self.assertLess(
            nginx_conf.index("server_name www.usable.dev _"),
            nginx_conf.index("server_name usable.dev"),
            "The serving/default server must come before the apex redirect so Fly health checks do not get 308s",
        )

    def test_signup_ctas_are_marked_for_campaign_attribution_continuity(self):
        for relative_path in ("index.html", "pricing.html", "usable.html", "use-cases.html"):
            html = (ROOT / relative_path).read_text(encoding="utf-8")
            self.assertIn('src="/scripts/campaign-attribution.js"', html, relative_path)
        signup_ctas = [
            anchor for anchor in anchors_in(ROOT / "index.html")
            if anchor["attrs"].get("href", "").startswith("https://usable.dev/signup")
        ]
        self.assertGreaterEqual(len(signup_ctas), 4)
        for anchor in signup_ctas:
            self.assertEqual(anchor["attrs"].get("data-preserve-campaign"), "true", anchor)

    def test_campaign_attribution_script_is_first_party_allowlisted_and_query_only(self):
        script = (ROOT / "scripts/campaign-attribution.js").read_text(encoding="utf-8")
        for key in ("utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "variant"):
            self.assertIn(key, script)
        forbidden = ("fbq", "Meta Pixel", "document.cookie", "localStorage", "sessionStorage")
        for token in forbidden:
            self.assertNotIn(token, script)
        self.assertIn("usable:signup-start", script)
        self.assertIn("URLSearchParams(window.location.search)", script)
        self.assertIn("all-components-loaded", script)
        self.assertIn("campaignAttributionBound", script)

    def test_mobile_hero_css_has_no_fixed_width_overflow_at_common_meta_widths(self):
        hero_css = (ROOT / "styles/components/hero.css").read_text(encoding="utf-8")
        main_css = (ROOT / "styles/main.css").read_text(encoding="utf-8")
        self.assertIn("word-break: break-word", hero_css)
        self.assertIn("max-width: min(100%, 300px)", hero_css)
        self.assertIn("max-width: 100%", main_css)
        self.assertNotRegex(
            hero_css,
            re.compile(r"@media \(max-width: 639px\)[\s\S]*?\.hero__btn\s*{[\s\S]*?min-width\s*:\s*(?:[1-9]\d{2,}|\d{3,})px"),
            "Mobile hero buttons must not carry a fixed min-width that can overflow 320-412px viewports",
        )

    def test_every_page_uses_the_current_stylesheet_content_hash(self):
        stylesheet = (ROOT / "styles/main.min.css").read_bytes()
        cache_version = hashlib.sha256(stylesheet).hexdigest()[:12]
        expected_href = f'/styles/main.min.css?v={cache_version}'
        stylesheet_href = re.compile(r'href=["\'](/styles/main\.min\.css(?:\?v=[^"\']+)?)')
        failures = []

        excluded_directories = {
            ".git",
            ".venv",
            "components",
            "node_modules",
            "opendesign",
            "tests",
        }
        html_paths = sorted(
            path
            for path in ROOT.rglob("*.html")
            if not excluded_directories.intersection(path.relative_to(ROOT).parts)
        )
        for path in html_paths:
            html = path.read_text(encoding="utf-8")
            hrefs = stylesheet_href.findall(html)
            if hrefs != [expected_href]:
                failures.append(f"{path.relative_to(ROOT)}: expected one {expected_href!r}, found {hrefs!r}")

        self.assertEqual(
            [],
            failures,
            f"Every bundled stylesheet URL must match {expected_href!r}:\n" + "\n".join(failures),
        )


if __name__ == "__main__":
    unittest.main()
