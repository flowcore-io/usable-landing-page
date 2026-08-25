#!/usr/bin/env python3
"""Regression checks for concise, customer-facing connection guidance."""

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

    def test_article_leads_with_supported_connection_methods(self):
        methods = self.article.index("Ways to connect")
        compatibility = self.article.index("MCP compatibility")
        testing = self.article.index("How to test auth.md")

        self.assertLess(methods, compatibility)
        self.assertLess(compatibility, testing)
        for method in ("Remote MCP", "Usable API", "auth.md"):
            self.assertIn(method, self.article)
        self.assertIn('href="https://usable.dev/docs#mcp"', self.article)
        self.assertIn('href="https://usable.dev/docs/api-reference"', self.article)
        self.assertIn('href="https://usable.dev/auth.md"', self.article)

    def test_article_names_mcp_clients_as_examples_not_the_boundary(self):
        self.assertIn("supports remote MCP and OAuth 2.1", self.article)
        for runtime in ("Codex", "Claude Code", "Claude Desktop", "OpenCode"):
            self.assertIn(runtime, self.article)
        self.assertIn("other compatible MCP clients", self.article)

    def test_article_explains_how_to_test_auth_md(self):
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

    def test_public_surfaces_present_all_connection_methods(self):
        for path, content in self.public_surfaces.items():
            self.assertIn("MCP", content, path)
            self.assertIn("API", content, path)
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
