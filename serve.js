// Tiny static file server for previewing the site locally: node serve.js [port]
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = +process.argv[2] || 8765;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png',
                '.glb': 'model/gltf-binary', '.mp4': 'video/mp4', '.json': 'application/json', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  const st = fs.statSync(f), type = types[path.extname(f)] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {                                   // videos need byte ranges
    const [a, b] = range.replace('bytes=', '').split('-');
    const start = +a, end = b ? +b : st.size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    return fs.createReadStream(f, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('serving on http://localhost:' + port));
