#!/usr/bin/env python3
"""Regression checks for concise, evidence-based auth.md compatibility copy."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "blog/connect-an-ai-agent-to-usable-with-auth-md.html"


class AuthMdGuideTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.article = ARTICLE.read_text(encoding="utf-8")
        cls.public_surfaces = {
            path: (ROOT / path).read_text(encoding="utf-8")
            for path in ("blog.html", "index.html", "llms.txt")
        }

    def test_article_lists_compatible_tools_then_auth_md_trial(self):
        compatible = self.article.index("Compatible with")
        standard = self.article.index("We support auth.md")
        testing = self.article.index("How to test it")

        self.assertLess(compatible, standard)
        self.assertLess(standard, testing)
        for runtime in ("Codex", "Claude Code", "Claude Desktop", "OpenCode"):
            self.assertIn(runtime, self.article)
        self.assertIn('href="https://usable.dev/auth.md"', self.article)
        self.assertIn("Share the", self.article)
        self.assertIn("auth.md link", self.article)
        self.assertIn("Ask it to connect to Usable", self.article)
        self.assertIn("sign in and approve", self.article)

    def test_public_article_does_not_expose_protocol_internals(self):
        technical_copy = (
            "arbitrary https",
            "authorization_pending",
            "claim.verification_uri",
            "claim_token",
            "end-to-end verification",
            "none yet",
            "not tested yet",
            "oauth-authorization-server",
            "other runtimes",
            "runtime developers and providers",
            "secret store",
            "slow_down",
            "user_code",
        )
        article = self.article.lower()
        for phrase in technical_copy:
            self.assertNotIn(phrase, article)

    def test_public_surfaces_name_supported_tools_without_internal_qa_copy(self):
        for path, content in self.public_surfaces.items():
            self.assertIn("Codex", content, path)
            self.assertIn("Claude Code", content, path)
            self.assertIn("OpenCode", content, path)
            self.assertIn("auth.md", content, path)

        outward_internal_copy = (
            "HTTPS GET/POST",
            "HTTPS POST",
            "claim_token",
            "end-to-end verification",
            "None yet",
            "No runtime is currently verified",
            "Not tested yet",
            "Other runtimes",
            "runtime developers and providers",
            "secret storage",
            "secret-storage",
        )
        for path, content in self.public_surfaces.items():
            for phrase in outward_internal_copy:
                self.assertNotIn(phrase, content, path)

    def test_article_metadata_records_the_simplification(self):
        self.assertIn('dateModified": "2026-08-24T00:00:00+00:00"', self.article)
        self.assertIn('<time datetime="2026-08-24">Updated August 24, 2026</time>', self.article)
        self.assertNotIn('href="https://usable.dev/signup"', self.article)
        self.assertIn(
            "<lastmod>2026-08-24</lastmod>",
            (ROOT / "sitemap.xml").read_text(encoding="utf-8"),
        )


if __name__ == "__main__":
    unittest.main()
