#!/usr/bin/env python3
"""Regression checks for public acquisition links."""

from html.parser import HTMLParser
from pathlib import Path
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


if __name__ == "__main__":
    unittest.main()
