// The PRODUCTION build (tools/pwa/apply_pwa.py docs dist --ads production) with
// no ad network configured: ads are reported unavailable, ad buttons are
// disabled with an explanation, no reward can be obtained and the game plays on.
module.exports = async ({ sleep, evalG, shot }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.tutorialDone = true; G.tutorial.active = false; G.spawnTimer = 0; });
  const r = await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game;
    let got = false;
    const watched = PS.Ads.watch(G, 'test', () => { got = true; }, 'test');
    G.state.gold = 1000;
    G.state.satisfaction = 3;
    return { provider: window.PotionAds.provider, production: window.PotionAds.production, available: PS.Ads.available(G),
      watched, got, text: PS.Ads.unavailableText(G) };
  });
  check('production build: no provider, nothing simulated', r.provider === 'none' && r.production, JSON.stringify(r));
  check('ads unavailable: no reward, clear message', !r.available && !r.watched && !r.got && /not available/.test(r.text), r.text);
  await sleep(2500);
  const btn = await evalG(() => { const P = gdjs.PotionShop.game.ui.panel; return P && P.hits.map((h) => h.label).filter((l) => /reopen/.test(l)); });
  await shot('prod_closed');
  check('shop-closed panel: the ad button is disabled, gold/gems still work', btn && btn.includes('disabled:reopenAd') && btn.includes('reopenGold'), JSON.stringify(btn));
  await evalG(() => { const PS = gdjs.PotionShop; PS.World.reopen(PS.game, false); PS.UI.close(PS.game); PS.game.spawnTimer = 0; });
  await sleep(8000);
  const play = await evalG(() => ({ closed: gdjs.PotionShop.game.state.closed, customers: gdjs.PotionShop.game.customers.length }));
  check('the game keeps playing without ads', !play.closed && play.customers > 0, JSON.stringify(play));
  console.log(results.join('\n'));
};
