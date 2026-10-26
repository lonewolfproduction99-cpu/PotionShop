// Milestone 6 checks: prestige (gate, reset, what is kept, scaling), long
// tables, multi-potion orders, gifts from delighted customers, the shop
// closing and reopening (gold and rewarded ad), and the garden planting,
// speed-ups and special harvests.
module.exports = async ({ shot, sleep, evalG, tapGame, page }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  const sceneG = () => 'const PS = gdjs.PotionShop; const cur = PS.game.scene.getGame().getSceneStack().getCurrentScene(); ' +
    'const G = cur.__garden || PS.game;';
  const tapHit = async (label, where = 'panel') => {
    const r = await evalG(([label, where, pre]) => {
      // eslint-disable-next-line no-eval
      const G = eval(pre + ' G');
      const hits = where === 'hud' ? G.ui.hud.hits : (G.ui.panel ? G.ui.panel.hits : []);
      const h = hits.slice().reverse().find((h) => h.label === label);
      return h ? [h.x + h.w / 2, h.y + h.h / 2] : null;
    }, [label, where, sceneG()]);
    if (!r) throw new Error('No button ' + label + ' ' + JSON.stringify(await evalG((pre) => { const G = eval(pre + ' G'); return [G.ui.panel && G.ui.panel.name, G.ui.panel ? G.ui.panel.hits.map((h) => h.label) : []]; }, sceneG())));
    await tapGame(r[0], r[1]);
    await sleep(900);
  };
  const waitFor = async (fn, label, steps = 200, arg) => {
    for (let i = 0; i < steps; i++) {
      if (await evalG(fn, arg)) return true;
      await sleep(300);
    }
    console.log('timeout: ' + label);
    return false;
  };
  // The ad countdown is in real seconds: wait until its Claim button is enabled.
  const waitClaim = () => waitFor((pre) => { const G = eval(pre + ' G'); return !!(G.ui.panel && G.ui.panel.hits.some((h) => h.label === 'claimAd')); }, 'ad countdown', 60, sceneG());
  const reload = async () => {
    await page.reload();
    await page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game && gdjs.PotionShop.game.started);
    await sleep(800);
  };
  // A customer seated at a free seat with this order, ready to be served.
  const seatCustomer = (ids, patienceRatio) => evalG(([ids, ratio]) => {
    const PS = gdjs.PotionShop; const G = PS.game;
    const c = PS.World.spawnCustomer(G);
    PS.Order.set(c, ids.map((id) => PS.data.recipeById[id]));
    const seat = PS.World.freeSeat(G); c.obj.setPosition(seat.x, seat.y); PS.World.sendToSeat(G, c, seat); c.path = [];
    c.state = 'ordered'; c.orderedAt = G.time; c.maxPatience = 1e4; c.patience = 1e4 * ratio; // patience barely drops during the test
    return c.id;
  }, [ids, patienceRatio]);

  await evalG(() => { localStorage.clear(); });
  await reload();
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.tutorialDone = true; G.tutorial.active = false; G.saveNow(); });
  await reload();

  // 1. Prestige is locked until the shop is maxed.
  const gate = await evalG(() => gdjs.PotionShop.game.prestigeProgress());
  check('prestige locked in a new shop', !gate.ready && gate.missing.length > 0, gate.done + '/' + gate.total);

  // 2. Max everything, buy some Mastery, then prestige by tapping.
  await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game; G.spawnTimer = 1e9;
    G.state.level = 12; G.state.gold = 1e6; G.state.gems = 0;
    for (const u of PS.data.upgrades) if (!u.persistent) G.state.upgrades[u.id] = G.upgradeMax(u);
    while (G.state.workers.length < PS.data.workerTypes.length) G.hireWorker();
    G.state.upgrades.mastery_healing = 2;
    G.state.inventory.redleaf = 20;
    PS.World.applyUnlocks(G);
  });
  const ready = await evalG(() => gdjs.PotionShop.game.prestigeProgress().ready);
  check('prestige unlocks when every upgrade and apprentice is done', ready);
  await tapHit('tab:expand', 'hud');
  await evalG(() => { const P = gdjs.PotionShop.game.ui.panel; if (P.scroll !== undefined) P.scroll = 1e6; });
  await evalG(() => gdjs.PotionShop.UI.open(gdjs.PotionShop.game, 'prestige'));
  await sleep(600);
  await shot('90_prestige_panel');
  await tapHit('doPrestige');
  await tapHit('doPrestige');
  await sleep(2500);
  await page.waitForFunction(() => gdjs.PotionShop.game && gdjs.PotionShop.game.started && gdjs.PotionShop.game.prestige() === 1, null, { timeout: 30000 });
  await sleep(1000);
  const p1 = await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game; const s = G.state;
    return { prestige: s.prestige, level: s.level, gold: s.gold, gems: s.gems, workers: s.workers.length,
      qb: s.upgrades.quick_brew || 0, mastery: s.upgrades.mastery_healing || 0, red: s.inventory.redleaf,
      group: G.groupSize(), seatsPerSlot: G.slots[0].seats.length, groupObj: G.slots[0].group.getName(),
      qbCost: G.upgradeCost(PS.data.upgradeById.quick_brew), price: +G.potionPrice(PS.data.recipeById.healing).toFixed(2),
      maxItems: G.maxOrderItems(), frost: PS.Brewing.knownRecipes(G).some((r) => r.id === 'frost') };
  });
  check('prestige keeps level, mastery and gems; resets the run',
    p1.prestige === 1 && p1.level === 12 && p1.mastery === 2 && p1.gems === 20 && p1.workers === 0 && p1.qb === 0 && p1.gold === 40,
    JSON.stringify(p1));
  check('prestige 1: groups of 2 tables, 2-potion orders', p1.group === 2 && p1.seatsPerSlot === 2 && p1.groupObj === 'TableGroup2' && p1.maxItems === 2);
  check('prestige scales costs x5 and prices x3 (mastery on top)', p1.qbCost === 300 && Math.abs(p1.price - 14 * 3 * 1.3) < 0.01,
    'cost ' + p1.qbCost + ' price ' + p1.price);
  check('prestige potion Frost is unlocked', p1.frost);
  await shot('91_after_prestige');

  // 3. Multi-potion order: each potion is paid on delivery, the customer leaves after the last; delighted -> gift.
  await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game; G.spawnTimer = 1e9; G.state.upgrades.extra_table = 3;
    PS.World.applyUnlocks(G); G.state.inventory.starbloom = 0; G.state.inventory.glowcap = 0;
    PS.data.balance.giftChance = 1;
  });
  const cid = await seatCustomer(['healing', 'energy'], 1);
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.stock = { healing: 1 }; G.stockQuality = {}; });
  const g0 = await evalG(() => gdjs.PotionShop.game.state.gold);
  await evalG((id) => { const PS = gdjs.PotionShop; const c = PS.game.customers.find((x) => x.id === id);
    PS.Workers.enqueue(PS.game, { type: 'fetchStock', target: c, recipe: PS.data.recipeById.healing }); }, cid);
  await waitFor((id) => { const c = gdjs.PotionShop.game.customers.find((x) => x.id === id); return c && c.items[0].done; }, 'first potion', 150, cid);
  const half = await evalG((id) => { const G = gdjs.PotionShop.game; const c = G.customers.find((x) => x.id === id);
    return { state: c.state, left: gdjs.PotionShop.Order.remaining(c), gold: G.state.gold, seated: !!c.seat,
      price: Math.round(G.potionPrice(gdjs.PotionShop.data.recipeById.healing)) }; }, cid);
  await sleep(500);
  await shot('92_multi_order_half');
  check('one of two potions delivered: paid for it, customer stays seated for the other', half.state === 'ordered' && half.seated && half.left === 1 && half.gold - g0 >= Math.round(half.price * 0.85), JSON.stringify(half) + ' was ' + g0);
  await evalG((id) => { const PS = gdjs.PotionShop; const G = PS.game; const c = G.customers.find((x) => x.id === id);
    G.state.stock = { energy: 1 }; PS.Workers.enqueue(G, { type: 'fetchStock', target: c, recipe: PS.data.recipeById.energy }); }, cid);
  await waitFor((id) => { const c = gdjs.PotionShop.game.customers.find((x) => x.id === id); return !c || c.state !== 'ordered'; }, 'served', 150, cid);
  const paid = await evalG(() => { const G = gdjs.PotionShop.game; const PS = gdjs.PotionShop;
    return { gold: G.state.gold, gifts: (G.state.inventory.starbloom || 0) + (G.state.inventory.glowcap || 0),
      base: G.potionPrice(PS.data.recipeById.healing) + G.potionPrice(PS.data.recipeById.energy) }; });
  check('both potions delivered: paid for both in total, customer leaves', paid.gold - g0 >= Math.round(paid.base * 0.85), 'earned ' + (paid.gold - g0) + ' base ' + Math.round(paid.base));
  check('fast service (patience >= 90%) earns a special herb gift', paid.gifts === 1, 'gifts=' + paid.gifts);
  await sleep(300);
  await shot('93_gift');
  // Served when patience is already below 90%: no gift.
  const cid2 = await seatCustomer(['healing'], 0.8);
  await evalG((id) => { const PS = gdjs.PotionShop; const G = PS.game; const c = G.customers.find((x) => x.id === id);
    G.state.stock = { healing: 1 }; PS.Workers.enqueue(G, { type: 'fetchStock', target: c, recipe: PS.data.recipeById.healing }); }, cid2);
  await waitFor((id) => { const c = gdjs.PotionShop.game.customers.find((x) => x.id === id); return !c || c.state !== 'ordered'; }, 'served 2', 150, cid2);
  const gifts2 = await evalG(() => { const s = gdjs.PotionShop.game.state; return (s.inventory.starbloom || 0) + (s.inventory.glowcap || 0); });
  check('slow service (patience < 90%) never gives a gift', gifts2 === 1, 'gifts=' + gifts2);
  await evalG(() => { gdjs.PotionShop.data.balance.giftChance = 0.3; });

  // 4. Satisfaction at rock bottom closes the shop; reopen with gold, then with an ad.
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.satisfaction = 3; G.state.gold = 5000; G.spawnTimer = 0; });
  await waitFor(() => gdjs.PotionShop.game.state.closed, 'closed', 30);
  const n0 = await evalG(() => gdjs.PotionShop.game.customers.length);
  await sleep(4000);
  const closed = await evalG(() => { const G = gdjs.PotionShop.game; return { closed: G.state.closed, panel: G.ui.panel && G.ui.panel.name, n: G.customers.length }; });
  await shot('94_closed');
  check('shop closes at rock-bottom satisfaction and nobody new comes in', closed.closed && closed.panel === 'closed' && closed.n <= n0, JSON.stringify(closed));
  const goldBefore = await evalG(() => gdjs.PotionShop.game.state.gold);
  const cost = await evalG(() => gdjs.PotionShop.World.reopenCost(gdjs.PotionShop.game));
  await tapHit('reopenGold');
  const re1 = await evalG(() => { const G = gdjs.PotionShop.game; return { closed: G.state.closed, gold: G.state.gold, sat: G.state.satisfaction }; });
  check('reopen with gold', !re1.closed && re1.gold === goldBefore - cost && re1.sat === 55, JSON.stringify(re1) + ' cost ' + cost);
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.satisfaction = 3; });
  await waitFor(() => gdjs.PotionShop.game.state.closed, 'closed again', 30);
  await sleep(500);
  await tapHit('reopenAd');
  const adPanel = await evalG(() => gdjs.PotionShop.game.ui.panel && gdjs.PotionShop.game.ui.panel.name);
  await shot('95_ad');
  await waitClaim();
  await tapHit('claimAd');
  const re2 = await evalG(() => { const G = gdjs.PotionShop.game; return { closed: G.state.closed, ads: G.state.ads.count }; });
  check('reopen by watching a rewarded ad (counts toward the daily limit)', adPanel === 'ad' && !re2.closed && re2.ads === 1, JSON.stringify(re2));
  const limit = await evalG(() => { const PS = gdjs.PotionShop; const G = PS.game; G.state.ads.count = PS.data.balance.adDailyLimit;
    const ok = PS.Ads.watch(G, 'test', () => {}); G.state.ads.count = 1; return { ok, left: PS.Ads.left(G) }; });
  check('daily ad limit is enforced', limit.ok === false && limit.left === 9, JSON.stringify(limit));

  // 5. Garden: empty plots, plant from the picker, speed up with gems/ad, harvest.
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.gold = 5000; G.state.gems = 20; G.ui.panel && gdjs.PotionShop.UI.close(G); });
  await sleep(400);
  await tapHit('tab:ingredients', 'hud');
  await tapHit('garden');
  await sleep(2500);
  const plots = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden;
    return g ? g.plots.filter((p) => !p.isWell).map((p) => ({ x: p.x, y: p.y, planted: !!p.state.planted })) : null; });
  check('garden plots start empty', plots && plots.length > 0 && plots.every((p) => !p.planted), plots && plots.length + ' plots');
  const tapPlot = async (p) => {
    const sp = await evalG(([x, y]) => gdjs.PotionShop.proj.toScreen(x, y, 20), [p.x, p.y]);
    await tapGame(sp[0], sp[1]);
    await sleep(900);
  };
  await tapPlot(plots[0]);
  const picker = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden;
    return { panel: g.ui.panel && g.ui.panel.name, herbs: g.ui.panel ? g.ui.panel.hits.filter((h) => /^plant:/.test(h.label)).map((h) => h.label.slice(6)) : [] }; });
  await shot('96_plant_picker');
  check('tapping an empty plot opens the herb picker', picker.panel === 'plant' && picker.herbs.includes('redleaf') && picker.herbs.includes('frostberry'), JSON.stringify(picker));
  const goldG = await evalG(() => gdjs.PotionShop.game.state.gold);
  await tapHit('plant:frostberry');
  const planted = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden; const p = g.plots.filter((p) => !p.isWell)[0];
    return { herb: p.state.herb, left: Math.round(g.secondsLeft(p)), gold: g.state.gold, red: g.growTime('redleaf'), frost: g.growTime('frostberry') }; });
  check('planting costs seeds and rarer herbs grow longer', planted.herb === 'frostberry' && planted.left > 170 && planted.gold < goldG && planted.frost > planted.red, JSON.stringify(planted));
  await sleep(600);
  await shot('97_planted');
  await tapPlot(plots[0]);
  const sp1 = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden; return g.ui.panel && g.ui.panel.name; });
  await shot('98_speedup');
  await tapHit('speedAd');
  await waitClaim();
  await tapHit('claimAd');
  const halved = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden; return Math.round(g.secondsLeft(g.plots.filter((p) => !p.isWell)[0])); });
  check('speed-up panel; an ad halves the growing time', sp1 === 'speedup' && halved < planted.left * 0.6, sp1 + ' ' + planted.left + 's -> ' + halved + 's');
  await tapPlot(plots[0]);
  const gems0 = await evalG(() => gdjs.PotionShop.game.state.gems);
  await tapHit('speedGems');
  const ripe = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden; const p = g.plots.filter((p) => !p.isWell)[0]; return { left: g.secondsLeft(p), gems: g.state.gems }; });
  check('gems finish growing instantly', ripe.left === 0 && ripe.gems < gems0, JSON.stringify(ripe) + ' had ' + gems0);
  await evalG(() => { const PS = gdjs.PotionShop; PS.data.balance.harvestRareChance = 1; const s = PS.game.state; s.inventory.starbloom = 0; s.inventory.glowcap = 0; s.inventory.frostberry = 0; });
  await sleep(600);
  await tapPlot(plots[0]);
  await sleep(3000);
  const harvest = await evalG(() => { const s = gdjs.PotionShop.game.state; const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden;
    return { frost: s.inventory.frostberry, special: (s.inventory.starbloom || 0) + (s.inventory.glowcap || 0), empty: !g.plots.filter((p) => !p.isWell)[0].state.planted }; });
  await shot('99_harvest');
  check('harvest gives herbs, can drop a special herb, plot is empty again', harvest.frost >= 4 && harvest.special === 1 && harvest.empty, JSON.stringify(harvest));
  await evalG(() => { gdjs.PotionShop.data.balance.harvestRareChance = 0.12; });
  await tapHit('back', 'hud');
  await sleep(2500);

  // 6. Prestige 4: groups of 5 tables, orders of up to 5 potions, everyone seated without errors.
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.prestige = 4; G.state.upgrades.extra_table = 3; G.saveNow(); });
  await reload();
  const big = await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game; G.spawnTimer = 1e9;
    const recipes = PS.Brewing.knownRecipes(G);
    let n = 0;
    while (PS.World.freeSeat(G) && n < 40) {
      const c = PS.World.spawnCustomer(G);
      PS.Order.set(c, recipes.slice(0, 1 + (n % 5)));
      const seat = PS.World.freeSeat(G); c.obj.setPosition(seat.x, seat.y); PS.World.sendToSeat(G, c, seat); c.path = [];
      c.state = 'ordered'; c.orderedAt = G.time; c.patience = c.maxPatience; c.maxPatience = 1e9; c.patience = 1e9;
      n++;
    }
    const hidden = ['Plant', 'Candelabra', 'Barrel', 'Crates'].reduce((a, k) => a + G.scene.getObjects(k).filter((o) => o.isHidden()).length, 0);
    return { group: G.groupSize(), seats: G.seats.filter((s) => s.unlocked).length, seated: n, maxItems: G.maxOrderItems(), hidden };
  });
  await sleep(1500);
  await shot('9a_long_tables');
  check('prestige 4: 6 tables x 5 seats, orders up to 5 potions', big.group === 5 && big.seats === 30 && big.seated === 30 && big.maxItems === 5, JSON.stringify(big));
  // Natural spawning at prestige 4 still produces walkable paths to the long tables.
  await evalG(() => { const G = gdjs.PotionShop.game; for (const c of G.customers.slice()) gdjs.PotionShop.World.storm(G, c); G.spawnTimer = 0; G.state.satisfaction = 90; gdjs.PotionShop.simSteps = 4; });
  const walked = await waitFor(() => gdjs.PotionShop.game.customers.some((c) => c.state === 'waitingOrder'), 'a customer reaches a long table', 200);
  await evalG(() => { gdjs.PotionShop.simSteps = 1; });
  await shot('9b_long_table_customer');
  check('customers walk to a seat at a long table', walked);
  console.log(results.join('\n'));
};
