import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LOADER = ROOT / "scripts" / "web-analytics.js"
NGINX_CONFIG = ROOT / "nginx.conf"
EXCLUDED_DIRECTORIES = {
    ".git",
    ".venv",
    "components",
    "node_modules",
    "opendesign",
    "tests",
}


def public_html_files():
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED_DIRECTORIES or part.startswith(".") for part in path.parts)
    )


def run_loader(hostname):
    program = r"""
const fs = require('fs');
const vm = require('vm');
const [sourcePath, hostname] = process.argv.slice(1);
const appended = [];
global.window = { location: { hostname } };
global.document = {
  createElement(tagName) {
    return { tagName, dataset: {} };
  },
  head: {
    appendChild(element) {
      appended.push(element);
    },
  },
};
vm.runInThisContext(fs.readFileSync(sourcePath, 'utf8'));
process.stdout.write(JSON.stringify(appended));
"""
    result = subprocess.run(
        ["node", "-e", program, str(LOADER), hostname],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


class WebAnalyticsTests(unittest.TestCase):
    def test_every_public_page_uses_the_versioned_first_party_loader(self):
        cache_version = hashlib.sha256(LOADER.read_bytes()).hexdigest()[:12]
        expected_src = f"/scripts/web-analytics.js?v={cache_version}"
        pattern = re.compile(
            r'<script\s+defer\s+src=["\'](/scripts/web-analytics\.js(?:\?v=[^"\']+)?)'
        )

        html_files = public_html_files()
        self.assertGreater(len(html_files), 20)
        for html_path in html_files:
            html = html_path.read_text(encoding="utf-8")
            self.assertEqual(pattern.findall(html), [expected_src], html_path.relative_to(ROOT))
            self.assertNotIn('data-domain="usable.dev"', html, html_path.relative_to(ROOT))
            self.assertNotIn(
                'src="https://web-analytics.usable.dev/js/uwa.js"',
                html,
                html_path.relative_to(ROOT),
            )

    def test_loader_selects_the_exact_public_property(self):
        self.assertEqual(
            run_loader("www.usable.dev"),
            [
                {
                    "tagName": "script",
                    "dataset": {"domain": "www.usable.dev"},
                    "async": True,
                    "src": "https://web-analytics.usable.dev/js/uwa.js",
                }
            ],
        )

    def test_loader_ignores_apex_preview_and_lookalike_hosts(self):
        for hostname in (
            "usable.dev",
            "usable.fo",
            "www.usable.fo",
            "localhost",
            "preview.usable.dev",
            "www.usable.dev.attacker.example",
        ):
            with self.subTest(hostname=hostname):
                self.assertEqual(run_loader(hostname), [])

    def test_faroese_host_redirects_to_the_canonical_localized_route(self):
        nginx = NGINX_CONFIG.read_text(encoding="utf-8")
        self.assertIn("server_name www.usable.fo;", nginx)
        self.assertIn("return 308 https://www.usable.dev/fo/$is_args$args;", nginx)
        self.assertIn("location ~ ^/fo/(.*)$", nginx)
        self.assertIn("return 308 https://www.usable.dev/fo/$1$is_args$args;", nginx)
        self.assertIn("return 308 https://www.usable.dev/fo$request_uri;", nginx)


if __name__ == "__main__":
    unittest.main()
