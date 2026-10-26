// PWA and ad-adapter checks, run against a COPY of the build (it is modified to
// simulate a new deployment):
//   node tools/test/play.js <copy of docs> out pwa
// Checks: manifest and icons, service worker precache, offline launch, saves
// kept across offline launch and update, update banner and clean cache switch,
// simulated rewarded ad (dismiss = no reward, finish = reward, game paused
// meanwhile), offline ads, production config refusing the simulated provider.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

module.exports = async ({ page, ctx, sleep, evalG, shot, buildDir }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  const started = () => page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game &&
    gdjs.PotionShop.game.started, null, { timeout: 90000 });

  // 1. Manifest and icons.
  const man = await page.evaluate(async () => {
    const m = await (await fetch('manifest.webmanifest')).json();
    const icons = [];
    for (const i of m.icons) {
      const r = await fetch(i.src);
      const b = await createImageBitmap(await r.blob());
      icons.push({ src: i.src, ok: r.ok, size: b.width + 'x' + b.height, declared: i.sizes, purpose: i.purpose });
    }
    const apple = document.querySelector('link[rel="apple-touch-icon"]');
    const at = await fetch(apple.href);
    return { display: m.display, orientation: m.orientation, start: m.start_url, theme: m.theme_color, icons,
      apple: at.ok, viewport: document.querySelector('meta[name=viewport]').content };
  });
  check('manifest: standalone, portrait, start page, theme', man.display === 'standalone' && man.orientation === 'portrait' &&
    man.start === './index.html' && !!man.theme, JSON.stringify({ d: man.display, o: man.orientation }));
  check('icons load with the declared sizes (incl. maskable) + apple-touch-icon',
    man.icons.length === 3 && man.icons.every((i) => i.ok && i.size === i.declared) && man.icons.some((i) => i.purpose === 'maskable') && man.apple,
    JSON.stringify(man.icons.map((i) => i.size + ':' + i.purpose)));
  check('viewport covers the safe areas (viewport-fit=cover)', /viewport-fit=cover/.test(man.viewport));

  // 2. Service worker installs, takes control and precaches the whole build.
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 60000 })
    .catch(async () => { await page.reload(); await started(); });
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 60000 });
  const sw1 = await page.evaluate(async () => {
    const keys = await caches.keys();
    const c = await caches.open(keys.find((k) => k.startsWith('potion-shop-')));
    return { keys, cached: (await c.keys()).length };
  });
  const files = JSON.parse(fs.readFileSync(path.join(buildDir, 'sw.js'), 'utf8').match(/const PRECACHE = (\[[\s\S]*?\]);/)[1]);
  check('service worker precaches every file of the build', sw1.keys.length === 1 && sw1.cached >= files.length - 1,
    sw1.cached + ' cached / ' + files.length + ' listed');

  // 3. Save, then launch with no network at all.
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.tutorialDone = true; G.state.gold = 777; G.saveNow(); });
  await ctx.setOffline(true);
  await page.reload();
  await started();
  await sleep(3000);
  const off = await evalG(() => {
    const G = gdjs.PotionShop.game;
    return { gold: G.state.gold, online: navigator.onLine, models: G.scene.getObjects('Room').length,
      ads: window.PotionAds.isAvailable(), status: window.PotionAds.status(), btn: gdjs.PotionShop.Ads.label(G, 'Watch') };
  });
  await shot('p1_offline');
  check('offline launch: the game starts with all assets', off.models === 1 && off.online === false, JSON.stringify(off));
  check('save data survives an offline launch', off.gold === 777);
  check('offline: ads unavailable, buttons say so, game continues', !off.ads && off.status === 'offline' && /unavailable/.test(off.btn), off.status + ' / ' + off.btn);
  const offTry = await evalG(() => { const PS = gdjs.PotionShop; let got = false; const r = PS.Ads.watch(PS.game, 't', () => { got = true; }, 'test'); return { r, got }; });
  check('offline: watching an ad is refused without a reward', offTry.r === false && !offTry.got);
  await ctx.setOffline(false);

  // 4. Simulated rewarded ad (development build only).
  const sim = await evalG(() => ({ provider: window.PotionAds.provider, simulated: window.PotionAds.simulated }));
  check('development build uses the labelled simulated provider', sim.provider === 'simulated' && sim.simulated);
  await evalG(() => { const PS = gdjs.PotionShop; window.__rew = 0; PS.Ads.watch(PS.game, 'test reward', () => { window.__rew++; }, 'test'); });
  await page.waitForSelector('#potion-sim-ad', { timeout: 10000 });
  const during = await evalG(() => ({ label: document.querySelector('#potion-sim-ad').innerText.slice(0, 40), paused: !!gdjs.PotionShop.adPlaying,
    t: gdjs.PotionShop.game.time, vol: gdjs.PotionShop.game.scene.getGame().getSoundManager().getGlobalVolume() }));
  await sleep(1500);
  const t2 = await evalG(() => gdjs.PotionShop.game.time);
  await shot('p2_sim_ad');
  check('simulated ad is clearly labelled', /DEVELOPMENT TEST AD/.test(during.label), during.label);
  check('game paused and muted while the ad shows', during.paused && t2 === during.t && during.vol === 0, JSON.stringify(during) + ' t2=' + t2);
  await page.click('#potion-sim-close');
  await sleep(800);
  const dismissed = await evalG(() => ({ rew: window.__rew, count: gdjs.PotionShop.game.state.ads.count, paused: !!gdjs.PotionShop.adPlaying,
    vol: gdjs.PotionShop.game.scene.getGame().getSoundManager().getGlobalVolume() }));
  check('closing the ad early gives no reward and resumes the game', dismissed.rew === 0 && dismissed.count === 0 && !dismissed.paused && dismissed.vol > 0, JSON.stringify(dismissed));
  await evalG(() => { const PS = gdjs.PotionShop; PS.Ads.watch(PS.game, 'test reward', () => { window.__rew++; }, 'test'); });
  await page.waitForSelector('#potion-sim-claim:not([disabled])', { timeout: 20000 });
  await page.click('#potion-sim-claim');
  await sleep(800);
  const earned = await evalG(() => ({ rew: window.__rew, count: gdjs.PotionShop.game.state.ads.count }));
  check('finishing the ad gives the reward once and counts toward the daily limit', earned.rew === 1 && earned.count === 1, JSON.stringify(earned));

  // 5. Production config: the simulated provider is refused, ads are unavailable, the game is fine.
  const prod = await page.evaluate(async () => {
    const src = await (await fetch('ads.js')).text();
    const keep = window.PotionAds;
    window.POTION_ADS_CONFIG = { mode: 'production', provider: 'simulated' };
    // eslint-disable-next-line no-new-func
    new Function(src)();
    const A = window.PotionAds;
    const r = await A.showRewardedAd('test');
    const out = { provider: A.provider, available: A.isAvailable(), result: r };
    window.PotionAds = keep;
    return out;
  });
  check('production mode refuses the simulated provider (no fake rewards)', prod.provider === 'none' && !prod.available && prod.result.rewarded === false,
    JSON.stringify(prod));

  // 6. A new deployment: update banner, restart, new cache only, save kept.
  const oldKey = sw1.keys[0];
  fs.writeFileSync(path.join(buildDir, 'build-note.txt'), 'deployed ' + new Date().toISOString());
  execFileSync('python3', [path.join(__dirname, '..', '..', 'pwa', 'apply_pwa.py'), buildDir, '--ads', 'development']);
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.gold = 4242; G.saveNow(); });
  await evalG(() => window.PotionShopPWA.registration.update());
  await page.waitForSelector('#potion-pwa-banner button', { timeout: 60000 });
  const bannerText = await page.$eval('#potion-pwa-banner', (b) => b.innerText);
  await shot('p3_update_banner');
  check('a new version shows the "Restart" update banner', /new version/i.test(bannerText), bannerText.replace(/\s+/g, ' '));
  await Promise.all([page.waitForNavigation({ timeout: 60000 }), page.click('#potion-pwa-banner button')]);
  await started();
  await sleep(1500);
  const after = await page.evaluate(async () => ({ keys: await caches.keys(), gold: gdjs.PotionShop.game.state.gold,
    note: (await fetch('build-note.txt')).ok }));
  check('after restart only the new version cache remains', after.keys.length === 1 && after.keys[0] !== oldKey, oldKey + ' -> ' + after.keys.join(','));
  check('save data survives the update', after.gold === 4242, 'gold=' + after.gold);
  check('new files are served after the update', after.note);
  console.log(results.join('\n'));
};
