#!/usr/bin/env python3
import http.server
import os
import socketserver
from urllib.parse import urlparse


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))


LOGIN_REDIRECT = "https://usable.dev/login"
SIGNUP_REDIRECT = "https://usable.dev/signup"


class RedirectingRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def _should_serve_static_direct(self, path: str) -> bool:
        return (
            path.startswith("/assets/")
            or path.startswith("/scripts/")
            or path.startswith("/styles/")
            or path in (
                "/robots.txt",
                "/sitemap.xml",
                "/site.webmanifest",
                "/favicon.ico",
                "/CNAME",
                "/README.md",
                "/TROUBLESHOOTING.md",
                "/index.html",
                "/fragments-2026.html",
                "/404.html",
            )
            or path.endswith(".html")
        )

    def _redirect(self, location: str):
        self.send_response(301)
        self.send_header("Location", location)
        self.end_headers()

    def do_HEAD(self):  # noqa: N802 - signature matches base
        self._handle(method="HEAD")

    def do_GET(self):  # noqa: N802 - signature matches base
        self._handle(method="GET")

    def _handle(self, method: str):
        parsed = urlparse(self.path)
        path = parsed.path or "/"
        # Normalize path: remove trailing slash except for root
        if path != "/" and path.endswith("/"):
            path = path[:-1]

        if path == "/login":
            return self._redirect(LOGIN_REDIRECT)

        if path == "/signup":
            return self._redirect(SIGNUP_REDIRECT)

        if path == "/":
            self.path = "/index.html"
            return super().do_HEAD() if method == "HEAD" else super().do_GET()

        if path == "/privacy" or path == "/privacy.html":
            self.path = "/privacy.html"
            return super().do_HEAD() if method == "HEAD" else super().do_GET()

        if path == "/terms" or path == "/terms.html":
            self.path = "/terms.html"
            return super().do_HEAD() if method == "HEAD" else super().do_GET()

        if path == "/media-kit" or path == "/media-kit.html":
            self.path = "/media-kit.html"
            return super().do_HEAD() if method == "HEAD" else super().do_GET()

        if path == "/detailed-screenshots" or path == "/detailed-screenshots.html":
            self.path = "/detailed-screenshots.html"
            return super().do_HEAD() if method == "HEAD" else super().do_GET()

        if self._should_serve_static_direct(path):
            return super().do_HEAD() if method == "HEAD" else super().do_GET()

        # Fallback rule analogous to: /*  /index.html  301
        return self._redirect("/index.html")


def serve(port: int = 8080):
    with socketserver.TCPServer(("", port), RedirectingRequestHandler) as httpd:
        print(f"Serving '{PROJECT_ROOT}' on http://localhost:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    port_str = os.environ.get("PORT", "8080")
    try:
        port = int(port_str)
    except ValueError:
        port = 8080
    serve(port)


