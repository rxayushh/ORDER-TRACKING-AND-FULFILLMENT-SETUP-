const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, 'dist');
const upstream = new URL(process.env.API_UPSTREAM_URL || 'http://127.0.0.1:8081');
const port = Number(process.env.PREVIEW_PORT || 4173);
const proxyPrefixes = ['/api/', '/swagger-ui/', '/v3/api-docs'];
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
  });
  res.end(body);
}

function proxyRequest(req, res) {
  const options = {
    hostname: upstream.hostname,
    port: upstream.port || (upstream.protocol === 'https:' ? 443 : 80),
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: upstream.host },
  };
  const proxy = (upstream.protocol === 'https:' ? require('node:https') : http).request(options, (response) => {
    res.writeHead(response.statusCode || 502, response.headers);
    response.pipe(res);
  });
  proxy.on('error', () => {
    if (!res.headersSent) send(res, 502, 'Backend service unavailable');
    else res.destroy();
  });
  req.pipe(proxy);
}

const server = http.createServer((req, res) => {
  if ((req.url.startsWith('/actuator/') && req.url !== '/actuator/health') || req.url.startsWith('/h2-console')) {
    send(res, 404, 'Not found');
    return;
  }

  if (req.url === '/actuator/health' || proxyPrefixes.some((prefix) => req.url.startsWith(prefix))) {
    proxyRequest(req, res);
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    send(res, 400, 'Invalid request path');
    return;
  }

  const requested = path.resolve(root, `.${pathname}`);
  const safePath = requested.startsWith(`${root}${path.sep}`) ? requested : path.join(root, 'index.html');
  const file = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(root, 'index.html');

  fs.readFile(file, (error, contents) => {
    if (error) {
      send(res, 503, 'Frontend build is missing; run npm run build first');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(contents);
  });
});

server.listen(port, '0.0.0.0', () => {
  process.stdout.write(`Full-stack preview listening on 0.0.0.0:${port}; backend ${upstream.origin}\n`);
});
