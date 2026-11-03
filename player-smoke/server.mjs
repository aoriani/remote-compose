import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));

export function createProofServer(binary = resolve(root, 'artifacts/minimal-canvas.rc')) {
  // Deliberately tiny fixed-route harness, not a publishing backend or editor.
  const routes = new Map([
    ['/', [resolve(root, 'player-smoke/index.html'), 'text/html']],
    ['/player.js', [resolve(root, 'upstream/experiments/players/typescript/web-player/bundle.js'), 'text/javascript']],
    ['/document.rc', [binary, 'application/octet-stream']],
  ]);
  return createServer(async (request, response) => {
    if (request.url === '/favicon.ico') { response.writeHead(204).end(); return; }
    const route = routes.get(request.url);
    if (!route) { response.writeHead(404).end(); return; }
    try {
      const content = await readFile(route[0]);
      response.writeHead(200, {'Content-Type': route[1], 'Cache-Control': 'no-store'});
      response.end(content);
    } catch (error) {
      response.writeHead(500, {'Content-Type': 'text/plain'}).end(String(error));
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createProofServer(process.argv[2]);
  server.listen(8080, '127.0.0.1', () => console.log('http://127.0.0.1:8080'));
}
