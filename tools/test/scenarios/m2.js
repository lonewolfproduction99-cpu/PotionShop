// Milestone 2 checks, driven by taps on the real interface:
// herb shop, upgrades, expansion (table + cauldron appear), level-up unlocks,
// orders panel "Brew", two cauldrons brewing at once, queue outside the door.
module.exports = async ({ shot, sleep, state, evalG, tapGame, tapWorld }) => {
  const results = [];
  const check = (name, ok, extra) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : '')); };
  const tapHit = async (label, where = 'panel') => {
    const r = await evalG(([label, where]) => {
      const G = gdjs.PotionShop.game;
      const hits = where === 'hud' ? G.ui.hud.hits : (G.ui.panel ? G.ui.panel.hits : []);
      const h = hits.slice().reverse().find((h) => h.label === label);
      return h ? [h.x + h.w / 2, h.y + h.h / 2] : null;
    }, [label, where]);
    if (!r) throw new Error('No button ' + label + ' ' + JSON.stringify(await evalG(() => { const G = gdjs.PotionShop.game; return [G.ui.panel && G.ui.panel.name, G.ui.panel ? G.ui.panel.hits.map((h) => h.label) : [], G.state.gold]; })));
    await tapGame(r[0], r[1]);
    await sleep(1200); // headless software rendering runs at a few frames per second
  };
  await evalG(() => localStorage.clear());
  await evalG(() => { gdjs.PotionShop.game.state.gold = 900; gdjs.PotionShop.Save.save(gdjs.PotionShop.game.state); });

  // Herb shop: buy Redleaf.
  await tapHit('tab:ingredients', 'hud');
  let before = (await state()).inv.redleaf;
  await tapHit('buy:redleaf');
  let s = await state();
  check('herb shop buys a bundle', s.inv.redleaf === before + 5 && s.gold === 890, JSON.stringify([before, s.inv.redleaf, s.gold]));
  await shot('50_herbs');

  // Upgrades: buy Quick Brew.
  await tapHit('tab:upgrades', 'hud');
  await tapHit('upgrade:quick_brew');
  const qb = await evalG(() => gdjs.PotionShop.game.level('quick_brew'));
  check('upgrade purchase', qb === 1);
  await shot('51_upgrades');

  // Expansion: buy a table; a 4th table becomes visible.
  await tapHit('tab:expand', 'hud');
  await tapHit('upgrade:extra_table');
  const tables = await evalG(() => gdjs.PotionShop.game.slots.filter((x) => x.unlocked && !x.group.isHidden()).length);
  check('extra table appears', tables === 4, 'tables=' + tables);
  // Cauldron is locked until shop level 2.
  const lockedTag = await evalG(() => !!gdjs.PotionShop.game.ui.panel.hits.find((h) => h.label === 'upgrade:extra_cauldron'));
  check('extra cauldron locked at level 1', !lockedTag);
  await shot('52_expand');
  await tapHit('icon_close');

  // Level up to 2: level-up panel shows Mana Potion; Bluecap stock granted.
  await evalG(() => { const G = gdjs.PotionShop.game; G.addXp(gdjs.PotionShop.xpForLevel(1)); });
  await sleep(500);
  s = await state();
  check('level up to 2 with panel', s.level === 2 && s.panel === 'levelup' && s.inv.bluecap === 4, JSON.stringify([s.level, s.panel, s.inv.bluecap]));
  await shot('53_levelup');
  await tapHit('Great!');
  await tapHit('tab:expand', 'hud');
  await tapHit('upgrade:extra_cauldron');
  const cauldrons = await evalG(() => gdjs.PotionShop.game.cauldrons.filter((c) => c.unlocked && !c.obj.isHidden()).length);
  check('extra cauldron appears', cauldrons === 2, 'cauldrons=' + cauldrons);
  await tapHit('icon_close');

  // Fill the shop: seat customers with known orders and a queue outside.
  await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game;
    const wants = ['healing', 'mana', 'healing', 'energy', 'mana', 'energy', 'healing'];
    wants.forEach((id) => {
      const c = PS.World.spawnCustomer(G); PS.Order.set(c, [PS.data.recipeById[id]]);
      c.obj.setPosition(G.doorOutside[0], G.doorOutside[1]); c.path = []; PS.World.onArrivedAtDoor(G, c);
    });
    PS.simSteps = 6;
  });
  for (let i = 0; i < 80; i++) { s = await state(); if (s.customers.filter((c) => c.state === 'waitingOrder').length >= 4) break; await sleep(500); }
  await evalG(() => { gdjs.PotionShop.simSteps = 1; });
  s = await state();
  const seatIds = s.customers.filter((c) => c.seat >= 0).map((c) => c.seat);
  check('queue forms outside when tables are full', s.queue.length >= 3 && new Set(seatIds).size === seatIds.length,
    'queue=' + s.queue.length + ' seats=' + JSON.stringify(seatIds));
  await shot('54_full_shop');
  // Mark all seated customers as ordered (orders were taken).
  await evalG(() => { const G = gdjs.PotionShop.game; let t = 0; for (const c of G.customers) if (c.state === 'waitingOrder') { c.state = 'ordered'; c.orderedAt = G.time + t++; } });

  // Orders panel: brew the first two orders via the "Brew" buttons -> both cauldrons busy.
  await tapHit('tab:orders', 'hud');
  await shot('55_orders');
  const ids = await evalG(() => gdjs.PotionShop.game.ui.panel.hits.filter((h) => h.label.startsWith('brew:')).map((h) => h.label));
  await tapHit(ids[0]);
  const ids2 = await evalG(() => gdjs.PotionShop.game.ui.panel.hits.filter((h) => h.label.startsWith('brew:')).map((h) => h.label));
  await tapHit(ids2.find((l) => l !== ids[0]) || ids2[0]);
  s = await state();
  check('two cauldrons reserved from the orders panel', s.cauldrons.filter((c) => c.state === 'reserved').length === 2, JSON.stringify(s.cauldrons));
  await tapHit('icon_close');
  await evalG(() => { gdjs.PotionShop.simSteps = 6; });
  for (let i = 0; i < 80; i++) { s = await state(); if (s.cauldrons.every((c) => c.state === 'brewing' || c.state === 'done')) break; await sleep(400); }
  await evalG(() => { gdjs.PotionShop.simSteps = 1; });
  await sleep(1200);
  await shot('56_two_cauldrons');
  check('both cauldrons brewing', s.cauldrons.every((c) => c.state === 'brewing' || c.state === 'done'), JSON.stringify(s.cauldrons));
  console.log(results.join('\n'));
};
