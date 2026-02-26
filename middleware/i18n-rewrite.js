/**
 * live-server middleware — strips /fo/ language prefix so the same
 * HTML files are served for both English and Faroese URLs.
 */
module.exports = function (req, res, next) {
  if (req.url === '/fo' || req.url === '/fo/') {
    req.url = '/index.html';
  } else if (req.url.startsWith('/fo/')) {
    req.url = req.url.slice(3);
  }
  next();
};
