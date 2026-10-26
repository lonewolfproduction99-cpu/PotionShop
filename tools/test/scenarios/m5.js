// Milestone 5 checks: the tutorial (followed only by tapping where the hand
// points), carried potion bottle, liquid tint, offline earnings, saving
// mid-brew, number formatting and music.
module.exports = async ({ shot, sleep, state, evalG, tapGame, page }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  const reload = async () => {
    await page.reload();
    await page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game && gdjs.PotionShop.game.started);
    await sleep(800);
  };
  const tut = () => evalG(() => {
    const T = gdjs.PotionShop.game.tutorial;
    const h = T.hand;
    return { active: T.active && gdjs.PotionShop.game.state.tutorialPhase === 'first', text: (T.last || '').split('|')[0], hand: h && !h.isHidden() ? [h.getX() + 36, h.getY() + 70] : null };
  });
  await evalG(() => localStorage.clear());
  await reload();

  // 1. Tutorial: tap only where the hand points.
  await evalG(() => { gdjs.PotionShop.game.spawnTimer = 0; gdjs.PotionShop.simSteps = 4; });
  let t = await tut();
  check('tutorial starts for a new player', t.active && /Welcome/.test(t.text), t.text);
  await shot('80_tutorial_welcome');
  const seen = [];
  let shotN = 0;
  for (let i = 0; i < 400; i++) {
    t = await tut();
    if (!t.active) break;
    if (!seen.includes(t.text)) {
      seen.push(t.text);
      await evalG(() => { gdjs.PotionShop.simSteps = 1; });
      await sleep(900);
      await shot('81_tutorial_' + shotN++);
      await evalG(() => { gdjs.PotionShop.simSteps = 4; });
      t = await tut();
    }
    if (t.hand) {
      await tapGame(t.hand[0], t.hand[1]);
      await sleep(1200);
    } else {
      await sleep(400);
    }
    const s = await evalG(() => gdjs.PotionShop.game.state.served);
    if (s > 0 && seen.some((x) => /Great job/.test(x))) {
      await sleep(3000);
    }
  }
  const after = await evalG(() => ({ served: gdjs.PotionShop.game.state.served, done: gdjs.PotionShop.game.state.tutorialPhase !== 'first' }));
  console.log('tutorial steps:\n  ' + seen.join('\n  '));
  // The later tutorial phases are covered by the "tutorial" scenario.
  await evalG(() => { const PS = gdjs.PotionShop; PS.Tutorial.finish(PS.game); });
  check('tutorial guides the player to the first sale', after.served >= 1 && after.done, JSON.stringify(after));

  // 2. Carried bottle and liquid tint during a normal brew.
  await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game; G.spawnTimer = 1e9;
    G.state.upgrades.extra_table = 3; PS.World.applyUnlocks(G);
    // Start from an empty shop (the tutorial may have filled every seat).
    for (const o of G.customers) { if (o.seat) o.seat.occupant = null; PS.Workers.onCustomerGone(G, o); PS.destroy(o.obj); }
    G.customers = []; G.queue = [];
    const c = PS.World.spawnCustomer(G); PS.Order.set(c, [PS.data.recipeById.energy]);
    const seat = PS.World.freeSeat(G); c.obj.setPosition(seat.x, seat.y); PS.World.sendToSeat(G, c, seat); c.path = [];
    c.state = 'ordered'; c.orderedAt = G.time; c.patience = c.maxPatience;
    PS.Brewing.request(G, G.cauldrons[0], ['sunroot', 'sparkdust']);
  });
  await evalG(() => { gdjs.PotionShop.simSteps = 4; });
  for (let i = 0; i < 100; i++) { if (await evalG(() => gdjs.PotionShop.game.cauldrons[0].state === 'brewing')) break; await sleep(300); }
  const tint = await evalG(() => {
    let col = null;
    gdjs.PotionShop.game.cauldrons[0].liquid.get3DRendererObject().traverse((n) => { if (n.isMesh && n.material.name === 'unlit') col = n.material.color.getHexString(); });
    return col;
  });
  check('cauldron liquid takes the potion color', tint && tint !== 'ffffff', tint);
  for (let i = 0; i < 100; i++) { if (await evalG(() => gdjs.PotionShop.game.cauldrons[0].state === 'done')) break; await sleep(300); }
  await evalG(() => { const PS = gdjs.PotionShop; PS.Workers.enqueue(PS.game, { type: 'collect', target: PS.game.cauldrons[0] }); });
  for (let i = 0; i < 100; i++) { if (await evalG(() => !!gdjs.PotionShop.game.owner.carrying)) break; await sleep(200); }
  await evalG(() => { gdjs.PotionShop.simSteps = 1; });
  await sleep(1000);
  const carry = await evalG(() => { const o = gdjs.PotionShop.game.owner; return { anim: o.anim, bottle: !!o.bottle && !o.bottle.isHidden() }; });
  await shot('82_carrying_bottle');
  check('owner carries a visible bottle with the Carry pose', carry.bottle && carry.anim === 'Carry', JSON.stringify(carry));

  // 3. Saving while a potion is brewing keeps it (as a counter potion).
  await evalG(() => { const PS = gdjs.PotionShop; const G = PS.game; G.state.stock = {}; PS.Brewing.reserve(G, G.cauldrons[0], ['redleaf', 'moonwater']); G.saveNow(); });
  await reload();
  const kept = await evalG(() => gdjs.PotionShop.game.state.stock.healing || 0);
  check('a potion in the cauldron survives a reload', kept === 1, 'stock.healing=' + kept);

  // 4. Offline earnings with an apprentice.
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.level = 2; G.state.gold = 500; G.hireWorker(); G.state.incomeRate = 120; G.saveNow();
    G.state.lastSeen = Date.now() - 3600 * 1000; gdjs.PotionShop.Save.save(G.state); window.__noSaveOnHide = true; });
  // Reload without the page-hide save overwriting lastSeen.
  await page.evaluate(() => { document.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);
    gdjs.PotionShop.game.saveNow = () => {}; }); // also skips the PWA layer's save on pagehide
  await reload();
  const off = await evalG(() => { const G = gdjs.PotionShop.game; return { panel: G.ui.panel && G.ui.panel.name, gold: G.ui.panel && G.ui.panel.params.gold, have: G.state.gold }; });
  await shot('83_offline');
  check('offline earnings offered after an hour away', off.panel === 'offline' && off.gold > 0, JSON.stringify(off));
  const btn = await evalG(() => { const h = gdjs.PotionShop.game.ui.panel.hits.find((x) => x.label === 'Collect'); return [h.x + h.w / 2, h.y + h.h / 2]; });
  await tapGame(btn[0], btn[1]);
  await sleep(1200);
  const got = await evalG(() => gdjs.PotionShop.game.state.gold);
  check('collecting adds the offline gold', got === off.have + off.gold, off.have + ' + ' + off.gold + ' -> ' + got);

  // 5. Number formatting and music.
  const fmt = await evalG(() => [950, 12345, 4567890, 1.2e9, 3.4e12].map(gdjs.PotionShop.util.formatGold));
  check('big numbers are formatted', JSON.stringify(fmt) === JSON.stringify(['950', '12.3k', '4.6M', '1.2B', '3.4T']), JSON.stringify(fmt));
  const music = await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game; const sm = G.scene.getGame().getSoundManager();
    const on = !!sm.getMusicOnChannel(1);
    G.settings.music = false; PS.Audio.music(G);
    const ch = sm.getMusicOnChannel(1);
    const off = !ch || ch.stopped() || !ch.playing();
    G.settings.music = true; PS.Audio.music(G);
    return { on, off };
  });
  check('music plays and can be switched off', music.on && music.off, JSON.stringify(music));
  console.log(results.join('\n'));
};
