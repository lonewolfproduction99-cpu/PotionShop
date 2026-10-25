// Headless play-test for the exported build: loads the game in a portrait
// mobile viewport, reports console errors and takes screenshots.
// Usage: node tools/test/play.js <buildDir> <outDir> [scenario]
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(process.argv[2] || 'docs');
const outDir = path.resolve(process.argv[3] || 'test-out');
const scenario = process.argv[4] || 'smoke';
fs.mkdirSync(outDir, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.glb': 'model/gltf-binary', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.css': 'text/css', '.webmanifest': 'application/manifest+json' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(buildDir, p);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

server.listen(0, async () => {
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const vw = Number(process.env.VW || 450), vh = Number(process.env.VH || 800);
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1.6, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + '\n' + (e.stack || '')));
  await page.goto(`http://localhost:${port}/index.html`);
  // Wait for the game object to exist.
  await page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game, null, { timeout: 60000 });
  const shot = async (name) => { await page.screenshot({ path: path.join(outDir, name + '.png') }); };
  const evalG = (fn, arg) => page.evaluate(fn, arg);
  // Tap at game coordinates (720-wide game space -> CSS pixels).
  const tapGame = async (gx, gy) => {
    const r = await page.evaluate(() => { const c = document.querySelector('canvas'); const b = c.getBoundingClientRect();
      const g = gdjs.PotionShop.game.scene.getGame(); return { x: b.left, y: b.top, w: b.width, h: b.height, gw: g.getGameResolutionWidth(), gh: g.getGameResolutionHeight() }; });
    const x = r.x + (gx / r.gw) * r.w, y = r.y + (gy / r.gh) * r.h;
    await page.touchscreen.tap(x, y);
    await sleep(150);
  };
  const tapWorld = async (wx, wy, wz) => {
    const p = await page.evaluate(([x, y, z]) => gdjs.PotionShop.proj.toScreen(x, y, z), [wx, wy, wz]);
    if (p) await tapGame(p[0], p[1]);
  };
  const state = () => evalG(() => { const G = gdjs.PotionShop.game; return {
    gold: G.state.gold, level: G.state.level, xp: G.state.xp, served: G.state.served, lost: G.state.lost,
    inv: G.state.inventory, stock: G.state.stock,
    customers: G.customers.map((c) => ({ id: c.id, state: c.state, recipe: c.recipe.id, p: Math.round(c.patience), x: Math.round(c.obj.getX()), y: Math.round(c.obj.getY()), seat: c.seat ? G.seats.indexOf(c.seat) : -1 })),
    cauldrons: G.cauldrons.filter((c) => c.unlocked).map((c) => ({ state: c.state, recipe: c.recipe && c.recipe.id, t: +c.t.toFixed(1) })),
    owner: { x: Math.round(G.owner.obj.getX()), y: Math.round(G.owner.obj.getY()), task: G.owner.task && G.owner.task.type, phase: G.owner.task && G.owner.task.phase, queue: G.owner.queue.map((t) => t.type), carrying: G.owner.carrying && G.owner.carrying.id },
    panel: G.ui.panel && G.ui.panel.name, queue: G.queue.map((c) => c.id) }; });
  const ctxObj = { page, shot, sleep, tapGame, tapWorld, state, evalG, errors, outDir };
  try {
    const mod = require(path.resolve(__dirname, 'scenarios', scenario + '.js'));
    await mod(ctxObj);
  } catch (e) {
    errors.push('scenario error: ' + e.stack);
    await shot('failure');
  }
  fs.writeFileSync(path.join(outDir, 'errors.txt'), errors.join('\n'));
  console.log('ERRORS (' + errors.length + '):\n' + errors.slice(0, 30).join('\n'));
  await browser.close();
  server.close();
});
