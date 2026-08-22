#!/usr/bin/env python3
"""Regression checks for honest and fail-closed auth.md guidance."""

from html.parser import HTMLParser
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "blog/connect-an-ai-agent-to-usable-with-auth-md.html"


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headers = []
        self.rows = []
        self._cell = None
        self._row = None

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self._row = []
        elif tag in {"th", "td"}:
            self._cell = []
            if tag == "th":
                scope = dict(attrs).get("scope")
                self.assert_scope(scope)

    def handle_data(self, data):
        if self._cell is not None:
            self._cell.append(data)

    def handle_endtag(self, tag):
        if tag in {"th", "td"} and self._cell is not None:
            assert self._row is not None
            self._row.append(" ".join("".join(self._cell).split()))
            self._cell = None
        elif tag == "tr" and self._row is not None:
            if self._row:
                self.rows.append(self._row)
            self._row = None

    def assert_scope(self, scope):
        if scope not in {"col", "row"}:
            raise AssertionError("Compatibility table headers need scope=col or scope=row")


class ClassTextParser(HTMLParser):
    def __init__(self, target_class):
        super().__init__()
        self.target_class = target_class
        self.depth = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get("class", "").split()
        if self.depth:
            self.depth += 1
        elif self.target_class in classes:
            self.depth = 1

    def handle_data(self, data):
        if self.depth:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if self.depth:
            self.depth -= 1

    @property
    def text(self):
        return " ".join("".join(self.parts).split())


class AuthMdGuideTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.article = ARTICLE.read_text(encoding="utf-8")
        cls.public_surfaces = {
            path: (ROOT / path).read_text(encoding="utf-8")
            for path in ("blog.html", "index.html", "llms.txt")
        }

    def test_guide_defines_runtime_capabilities_before_the_prompt(self):
        article = self.article.lower()
        capability_copy = (
            "arbitrary https get and post requests",
            "poll the claim endpoint",
            "approved secret store",
            "configure an mcp or api client",
        )
        prompt_position = article.index("copy this prompt")
        for phrase in capability_copy:
            self.assertIn(phrase, article)
            self.assertLess(article.index(phrase), prompt_position)

    def test_prompt_and_failure_guidance_fail_closed(self):
        parser = ClassTextParser("auth-guide__prompt")
        parser.feed(self.article)
        prompt = parser.text
        required_copy = (
            "Stop before asking for my email address or starting a claim",
            "https://usable.dev/.well-known/oauth-authorization-server",
            "origin exactly https://usable.dev",
            "successful HTTP response",
            "claim.verification_uri",
            "Never construct or guess an approval URL",
            "trusted non-transcript handoff",
            "authorization_pending",
            "slow_down",
            "claim_token",
            "user_code",
            "bearer credential",
        )
        for phrase in required_copy:
            self.assertIn(phrase, prompt)
        self.assertNotIn("/auth/authorize", self.article)

    def test_compatibility_matrix_is_dated_and_mode_specific(self):
        parser = TableParser()
        parser.feed(self.article)
        table_text = " ".join(" ".join(row) for row in parser.rows)
        self.assertIn("Tested August 22, 2026", self.article)
        for expected in (
            "ChatGPT Ordinary web chat Unsupported in tested session",
            "Claude Ordinary web chat Unsupported in tested session",
            "z.ai Default chat Failed safety test in tested session",
            "Gemini, Copilot, Perplexity, Grok Not tested Not yet tested",
            "Tool- or connector-enabled agents Configured runtime Requires verification",
        ):
            self.assertIn(expected, table_text)
        self.assertIn("No runtime in this matrix has yet been verified end to end", self.article)
        self.assertIn("Auth.md interoperability observations from supplied sessions on August 22, 2026", self.article)

    def test_public_surfaces_do_not_repeat_prompt_alone_promise(self):
        misleading = (
            "Tell Your Agent to Connect to Usable. It Can Take It from There.",
            "auth.md lets an AI agent start and configure its Usable connection",
            "Or tell your agent to connect itself with",
            "Supported flow: agents start `service_auth`",
        )
        for path, content in self.public_surfaces.items():
            for phrase in misleading:
                self.assertNotIn(phrase, content, f"{path} repeats an unsupported promise")
        expected_safe_copy = {
            "blog.html": ("Tool-Capable AI Agent", "HTTPS", "secret-storage"),
            "index.html": ("tool-capable agent", "HTTPS POST", "secret storage"),
            "llms.txt": ("compatible runtime", "HTTPS GET/POST", "secret storage"),
        }
        for path, phrases in expected_safe_copy.items():
            for phrase in phrases:
                self.assertIn(phrase, self.public_surfaces[path])

    def test_article_metadata_records_the_correction(self):
        self.assertIn('dateModified": "2026-08-22T00:00:00+00:00"', self.article)
        self.assertIn('<time datetime="2026-08-22">Updated August 22, 2026</time>', self.article)
        self.assertNotIn('href="https://usable.dev/signup"', self.article)
        self.assertIn("<lastmod>2026-08-22</lastmod>", (ROOT / "sitemap.xml").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
