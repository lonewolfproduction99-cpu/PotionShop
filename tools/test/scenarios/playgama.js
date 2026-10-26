// Playgama build checks, run against dist/playgama/build with the real Bridge
// script from Playgama's CDN (outside Playgama it runs its "mock" platform):
//   node tools/test/play.js dist/playgama/build out playgama
module.exports = async ({ page, sleep, evalG, shot, tapGame, requests }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  const tapHit = async (label) => {
    const r = await evalG((label) => { const P = gdjs.PotionShop.game.ui.panel; const h = P && P.hits.find((x) => x.label === label);
      return h ? [h.x + h.w / 2, h.y + h.h / 2] : null; }, label);
    if (r) await tapGame(r[0], r[1]);
    return !!r;
  };

  // 1. Bridge initialized before the game, game_ready sent once the game runs.
  await page.waitForFunction(() => window.PotionPlatform && window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game && gdjs.PotionShop.game.started, null, { timeout: 60000 });
  await sleep(1500);
  const boot = await evalG(() => ({
    bridge: !!window.bridge, initialized: window.bridge.isInitialized, platform: window.bridge.platform.id,
    ready: !!window.PotionPlatform._readySent, language: window.PotionPlatform.language,
    watermark: [...document.querySelectorAll('a')].some((a) => /gd\.games|gdevelop/.test(a.href)),
  }));
  check('Bridge initialized (mock platform locally), game started after it', boot.bridge && boot.initialized, JSON.stringify(boot));
  check('game_ready sent after the first playable frame', boot.ready);
  check('no GDevelop watermark link (no external links)', !boot.watermark);

  // 2. Saves go through bridge.storage, not the game's localStorage, and come back after a reload.
  await evalG(() => { localStorage.removeItem('GDJS_PotionShop'); const G = gdjs.PotionShop.game; G.state.tutorialDone = true; G.state.gold = 1234; G.saveNow(); });
  await sleep(800);
  const stored = await page.evaluate(async () => {
    const d = await window.bridge.storage.get(['potionshop_save']);
    const v = d[0];
    const save = typeof v === 'string' ? JSON.parse(v) : v;
    return { gold: save && save.run && save.run.gold, gdjsKey: localStorage.getItem('GDJS_PotionShop') };
  });
  check('save written through bridge.storage (not GDevelop localStorage)', stored.gold === 1234 && !stored.gdjsKey, JSON.stringify(stored));
  await page.reload();
  await page.waitForFunction(() => window.PotionPlatform && window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game && gdjs.PotionShop.game.started, null, { timeout: 60000 });
  await sleep(1500);
  const restored = await evalG(() => gdjs.PotionShop.game.state.gold);
  check('progress restored from bridge.storage after a reload', restored === 1234, 'gold=' + restored);

  // 3. Platform pause and audio events pause and mute the game.
  const pa = await evalG(async () => {
    const PS = gdjs.PotionShop; const G = PS.game; const sm = G.scene.getGame().getSoundManager(); const P = window.PotionPlatform;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    P._emit('pause', true);
    const t0 = G.time; await wait(800); const t1 = G.time; const vPaused = sm.getGlobalVolume();
    P._emit('pause', false); await wait(500); const t2 = G.time; const vResumed = sm.getGlobalVolume();
    P._emit('audio', false); const vOff = sm.getGlobalVolume();
    P._emit('audio', true); const vOn = sm.getGlobalVolume();
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange')); const vHidden = sm.getGlobalVolume();
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange')); const vShown = sm.getGlobalVolume();
    return { frozen: t1 === t0, resumed: t2 > t1, vPaused, vResumed, vOff, vOn, vHidden, vShown };
  });
  check('platform pause freezes the game and mutes it; resume restores both', pa.frozen && pa.resumed && pa.vPaused === 0 && pa.vResumed === 100, JSON.stringify(pa));
  check('platform audio off/on mutes and unmutes', pa.vOff === 0 && pa.vOn === 100);
  check('sound stops while the page is in the background', pa.vHidden === 0 && pa.vShown === 100);

  // 4. Interstitial at a natural pause: closing the level-up panel.
  await evalG(() => {
    window.__inter = [];
    // Test only: the local mock platform reports no interstitial support.
    Object.defineProperty(window.bridge.advertisement, 'isInterstitialSupported', { configurable: true, get: () => true });
    window.bridge.advertisement.showInterstitial = (p) => window.__inter.push(p);
    const G = gdjs.PotionShop.game; G.addXp(gdjs.PotionShop.xpForLevel(G.state.level));
  });
  await sleep(1500);
  const lvPanel = await evalG(() => gdjs.PotionShop.game.ui.panel && gdjs.PotionShop.game.ui.panel.name);
  await shot('g1_levelup');
  const tapped = await tapHit('Great!');
  await sleep(800);
  const inter = await evalG(() => window.__inter);
  check('interstitial requested when the level-up panel is closed', lvPanel === 'levelup' && inter.includes('level_up'), lvPanel + ' tapped=' + tapped + ' ' + JSON.stringify(inter));

  // 5. Rewarded ads: unavailable on the mock platform, never a reward.
  const rw = await evalG(() => { const PS = gdjs.PotionShop; const G = PS.game; let got = false;
    const r = PS.Ads.watch(G, 't', () => { got = true; }, 'test');
    return { provider: window.PotionAds.provider, available: PS.Ads.available(G), r, got, label: PS.Ads.label(G, 'Watch an ad') }; });
  check('rewarded ads go through Bridge and give nothing on the mock platform', rw.provider === 'playgama' && !rw.available && !rw.r && !rw.got, JSON.stringify(rw));

  // 6. Layout: portrait phone and a wide desktop window.
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(1500);
  const phone = await evalG(() => ({ w: gdjs.PotionShop.game.scene.getGame().getGameResolutionWidth(), h: gdjs.PotionShop.game.scene.getGame().getGameResolutionHeight() }));
  await shot('g2_phone');
  await page.setViewportSize({ width: 1280, height: 720 });
  await sleep(1500);
  const desk = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame(); const c = g.getRenderer().getCanvas().getBoundingClientRect();
    return { w: g.getGameResolutionWidth(), h: g.getGameResolutionHeight(), cw: Math.round(c.width), ch: Math.round(c.height), top: Math.round(c.top), wh: window.innerHeight,
      scroll: document.documentElement.scrollHeight > window.innerHeight || document.documentElement.scrollWidth > window.innerWidth }; });
  await shot('g3_desktop');
  check('phone: full-height portrait play area', phone.h === 1280 && phone.w >= 560 && phone.w <= 860, JSON.stringify(phone));
  check('desktop: play area fills the height, stays portrait (ratio within 1:2), no page scrollbar',
    desk.ch === desk.wh && desk.cw < desk.ch && desk.ch / desk.cw <= 2 && !desk.scroll, JSON.stringify(desk));
  const hud = await evalG(() => { const G = gdjs.PotionShop.game; return G.ui.hud.hits.some((h) => h.label === 'tab:expand' && h.x + h.w <= G.scene.getGame().getGameResolutionWidth() + 1); });
  check('interface rebuilt for the new size (bottom tabs inside the screen)', hud);

  // 7. External requests: only the Bridge from Playgama's CDN.
  const external = [...new Set(requests.map((u) => new URL(u)).filter((u) => !['localhost', '127.0.0.1'].includes(u.hostname) &&
    u.protocol.startsWith('http')).map((u) => u.hostname))];
  check('no external requests except Playgama Bridge', external.every((h) => h === 'bridge.playgama.com'), JSON.stringify(external));
  console.log(results.join('\n'));
};
