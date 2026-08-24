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

    def test_article_lists_supported_then_other_runtimes_then_standard(self):
        supported = self.article.index("Works with Usable")
        others = self.article.index("Other runtimes")
        standard = self.article.index("The auth.md standard")

        self.assertLess(supported, others)
        self.assertLess(others, standard)
        for runtime in ("Codex", "Claude Code", "Claude Desktop", "OpenCode"):
            self.assertIn(runtime, self.article)
        self.assertIn("Not tested yet", self.article)
        self.assertIn('href="https://usable.dev/auth.md"', self.article)
        self.assertIn("Read the auth.md standard", self.article)

    def test_public_article_does_not_expose_protocol_internals(self):
        technical_copy = (
            "arbitrary https",
            "authorization_pending",
            "claim.verification_uri",
            "claim_token",
            "end-to-end verification",
            "none yet",
            "oauth-authorization-server",
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
            self.assertIn("other runtimes", content.lower(), path)
            self.assertIn("auth.md", content, path)

        outward_internal_copy = (
            "HTTPS GET/POST",
            "HTTPS POST",
            "claim_token",
            "end-to-end verification",
            "None yet",
            "No runtime is currently verified",
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
