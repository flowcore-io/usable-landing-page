const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif'
};

// Live reload: keep track of connected SSE clients
const liveReloadClients = new Set();

function notifyReload() {
  for (const res of liveReloadClients) {
    try {
      res.write('data: reload\n\n');
    } catch (_) {}
  }
}

// Watch the project directory recursively for file changes
fs.watch('.', { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  // Ignore node_modules, .git, and the server file itself
  if (
    filename.startsWith('node_modules') ||
    filename.startsWith('.git') ||
    filename === 'simple-server.js'
  ) return;
  console.log(`[live reload] ${eventType}: ${filename}`);
  notifyReload();
});

// Small script injected into every HTML page
const LIVE_RELOAD_SCRIPT = `
<script>
(function () {
  var es = new EventSource('/__livereload');
  es.onmessage = function (e) {
    if (e.data === 'reload') location.reload();
  };
  es.onerror = function () {
    // Retry connection after a short delay
    setTimeout(function () { es.close(); }, 1000);
  };
})();
</script>
`;

http.createServer((req, res) => {
  // SSE endpoint for live reload
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(':\n\n'); // comment to keep connection alive
    liveReloadClients.add(res);
    req.on('close', () => liveReloadClients.delete(res));
    return;
  }

  // Decode URL to handle spaces and special characters in filenames
  const decodedUrl = decodeURIComponent(req.url === '/' ? '/index.html' : req.url.split('?')[0]);
  let filePath = '.' + decodedUrl;
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  function serveHtml(data) {
    const html = data.toString('utf-8').replace('</body>', LIVE_RELOAD_SCRIPT + '</body>');
    const buf = Buffer.from(html, 'utf-8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': buf.byteLength
    });
    res.end(buf);
  }

  fs.readFile(filePath, (err, data) => {
    if (err && !ext) {
      // Try appending .html for clean URLs (e.g. /contact → /contact.html)
      fs.readFile(filePath + '.html', (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          serveHtml(data2);
        }
      });
    } else if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else if (ext === '.html') {
      serveHtml(data);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(data)
      });
      res.end(data, 'utf-8');
    }
  });
}).listen(PORT, () => console.log(`Server at http://localhost:${PORT} (live reload enabled)`));
