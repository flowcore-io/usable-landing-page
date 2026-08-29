import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
I18N_SOURCE = ROOT / "scripts" / "i18n.js"
MAIN_SOURCE = ROOT / "scripts" / "main.js"
RUNTIME_URL_PATTERN = re.compile(
    r"\b(?:src|srcset|href)=[\"'](?:\.\.?/)*(?:assets|scripts|styles|components|translations)/"
)

NODE_PROBE = r"""
const fs = require('fs');
const vm = require('vm');

const config = JSON.parse(process.argv[1]);
const values = new Map();
if (config.savedLanguage !== null) {
  values.set('usable-lang', config.savedLanguage);
}

const location = {
  pathname: config.pathname,
  search: config.search,
  hash: config.hash,
  assign(target) { this.assigned = target; },
  reload() { this.reloaded = true; }
};

const context = {
  console,
  window: { location },
  localStorage: {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); }
  },
  document: {
    querySelectorAll() { return []; }
  }
};

vm.createContext(context);
const source = fs.readFileSync(config.sourcePath, 'utf8')
  .split('// --- Initialisation ---')[0];
vm.runInContext(`${source}\n;globalThis.TestI18n = I18n;`, context);

const i18n = new context.TestI18n();
process.stdout.write(JSON.stringify({
  lang: i18n.lang,
  pageKey: i18n.getPageKey(),
  faroesePath: i18n.getFaroesePath(),
  unprefixedPath: i18n.stripLanguagePrefix(),
  switchTarget: i18n.getLanguageSwitchTarget()
}));
"""

NODE_ROUTE_PROBE = r"""
const fs = require('fs');
const vm = require('vm');

const config = JSON.parse(process.argv[1]);
const location = {
  protocol: 'https:',
  hostname: 'www.usable.dev',
  pathname: config.pathname,
  hash: config.hash,
  replace(target) { this.replaced = target; }
};
const context = { window: { location } };

vm.createContext(context);
const source = fs.readFileSync(config.sourcePath, 'utf8');
const start = source.indexOf('function handleRouteRedirection()');
const end = source.indexOf('// Fix iOS Safari 100vh bug', start);
if (start === -1 || end === -1) throw new Error('Route redirection function not found');
vm.runInContext(source.slice(start, end), context);
context.handleRouteRedirection();

process.stdout.write(JSON.stringify({ replaced: location.replaced || null }));
"""


class DirectFaroeseRouteTests(unittest.TestCase):
    def probe(self, pathname, saved_language=None, search="?source=test", hash_value="#content"):
        config = {
            "sourcePath": str(I18N_SOURCE),
            "pathname": pathname,
            "savedLanguage": saved_language,
            "search": search,
            "hash": hash_value,
        }
        result = subprocess.run(
            ["node", "-e", NODE_PROBE, json.dumps(config)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)

    def probe_production_route(self, pathname, hash_value=""):
        config = {
            "sourcePath": str(MAIN_SOURCE),
            "pathname": pathname,
            "hash": hash_value,
        }
        result = subprocess.run(
            ["node", "-e", NODE_ROUTE_PROBE, json.dumps(config)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)

    def test_public_html_uses_root_relative_runtime_urls(self):
        public_html = list(ROOT.glob("*.html"))
        for directory in ("components", "blog", "news"):
            public_html.extend((ROOT / directory).rglob("*.html"))

        offenders = []
        for html_path in sorted(public_html):
            for line_number, line in enumerate(
                html_path.read_text(encoding="utf-8").splitlines(), start=1
            ):
                if RUNTIME_URL_PATTERN.search(line):
                    offenders.append(f"{html_path.relative_to(ROOT)}:{line_number}")

        self.assertEqual([], offenders, f"Document-relative runtime URLs: {offenders}")

    def test_every_route_script_url_uses_the_current_content_hash(self):
        public_html = list(ROOT.glob("*.html"))
        for directory in ("blog", "news"):
            public_html.extend((ROOT / directory).rglob("*.html"))

        failures = []
        for source_path, public_path in (
            (I18N_SOURCE, "/scripts/i18n.js"),
            (MAIN_SOURCE, "/scripts/main.js"),
        ):
            cache_version = hashlib.sha256(source_path.read_bytes()).hexdigest()[:12]
            expected_src = f"{public_path}?v={cache_version}"
            escaped_path = re.escape(public_path)
            script_pattern = re.compile(
                rf"<script\s+src=[\"']({escaped_path}(?:\?v=[^\"']+)?)"
            )
            for html_path in sorted(public_html):
                matches = script_pattern.findall(html_path.read_text(encoding="utf-8"))
                if matches and matches != [expected_src]:
                    failures.append(
                        f"{html_path.relative_to(ROOT)}: expected {expected_src!r}, found {matches!r}"
                    )

        self.assertEqual([], failures, "\n".join(failures))

    def test_production_route_guard_accepts_faroese_routes(self):
        for pathname in ("/fo/", "/fo/privacy", "/fo/blog/example"):
            with self.subTest(pathname=pathname):
                self.assertIsNone(self.probe_production_route(pathname)["replaced"])

    def test_production_route_guard_still_rejects_unknown_routes(self):
        result = self.probe_production_route("/fo/not-a-public-route", "#details")

        self.assertEqual("/#details", result["replaced"])

    def test_direct_faroese_home_route_activates_home_translation(self):
        result = self.probe("/fo/")

        self.assertEqual("fo", result["lang"])
        self.assertEqual("home", result["pageKey"])
        self.assertEqual("/", result["unprefixedPath"])
        self.assertEqual("/fo/", result["faroesePath"])
        self.assertEqual("/?source=test#content", result["switchTarget"])

    def test_direct_faroese_page_route_preserves_query_and_hash(self):
        result = self.probe("/fo/privacy")

        self.assertEqual("fo", result["lang"])
        self.assertEqual("privacy", result["pageKey"])
        self.assertEqual("/privacy", result["unprefixedPath"])
        self.assertEqual("/privacy?source=test#content", result["switchTarget"])

    def test_english_route_switches_to_matching_faroese_route(self):
        result = self.probe("/privacy")

        self.assertEqual("en", result["lang"])
        self.assertEqual("privacy", result["pageKey"])
        self.assertEqual("/fo/privacy?source=test#content", result["switchTarget"])

    def test_saved_faroese_preference_still_works_on_unprefixed_routes(self):
        result = self.probe("/pricing.html", saved_language="fo", search="", hash_value="")

        self.assertEqual("fo", result["lang"])
        self.assertEqual("pricing", result["pageKey"])
        self.assertEqual("/pricing.html", result["switchTarget"])


if __name__ == "__main__":
    unittest.main()
