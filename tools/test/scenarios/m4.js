// Milestone 4 checks: extra herbs and quality, discovery, accidents and
// cleaning (owner and apprentice), rare herbs, and the herb garden scene.
module.exports = async ({ shot, sleep, state, evalG, tapGame, tapWorld }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  const tapHit = async (label, where = 'panel', scene = 'shop') => {
    const r = await evalG(([label, where, scene]) => {
      const G = scene === 'garden' ? gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden : gdjs.PotionShop.game;
      const hits = where === 'hud' ? G.ui.hud.hits : (G.ui.panel ? G.ui.panel.hits : []);
      const h = hits.slice().reverse().find((h) => h.label === label);
      return h ? [h.x + h.w / 2, h.y + h.h / 2] : null;
    }, [label, where, scene]);
    if (!r) {
      console.log(results.join('\n'));
      throw new Error('No button ' + label + ' ' + JSON.stringify(await evalG(() => { const G = gdjs.PotionShop.game; return [G.ui.panel && G.ui.panel.name, G.ui.panel ? G.ui.panel.hits.map((h) => h.label) : [], G.cauldrons[0].state, G.owner.task && G.owner.task.type]; })));
    }
    await tapGame(r[0], r[1]);
    await sleep(1200);
  };
  const waitFor = async (fn, label, steps = 200, arg) => {
    for (let i = 0; i < steps; i++) { if (await evalG(fn, arg)) return true; await sleep(300); }
    console.log('timeout: ' + label);
    return false;
  };
  const seatOrdered = (recipeId) => evalG((rid) => {
    const PS = gdjs.PotionShop; const G = PS.game;
    const c = PS.World.spawnCustomer(G); PS.Order.set(c, [PS.data.recipeById[rid]]);
    const seat = PS.World.freeSeat(G); c.obj.setPosition(seat.x, seat.y); PS.World.sendToSeat(G, c, seat); c.path = [];
    c.state = 'ordered'; c.orderedAt = G.time; c.patience = c.maxPatience; c.obj.setZ(PS.K.sitZ); PS.setAnim(c, 'Sit');
    return c.id;
  }, recipeId);
  await evalG(() => localStorage.clear());
  await evalG(() => { const G = gdjs.PotionShop.game; G.spawnTimer = 1e9; G.state.gold = 2000; G.state.inventory.sunroot = 12; G.state.inventory.redleaf = 12; G.state.inventory.moonwater = 12; G.state.inventory.sparkdust = 12; gdjs.PotionShop.simSteps = 4; });

  // 1. Correct bonus herb: Healing + Sunroot -> Fine, discovered, sells for more.
  const cid = await seatOrdered('healing');
  const k = await evalG(() => { const c = gdjs.PotionShop.game.cauldrons[0]; return [c.x, c.y]; });
  await tapWorld(k[0], k[1], 45);
  await sleep(800);
  await tapHit('recipe:healing');
  await tapHit('ing:sunroot');
  await shot('70_brew_extra');
  await tapHit('BREW');
  await waitFor(() => gdjs.PotionShop.game.cauldrons[0].state === 'done', 'fine potion done');
  const q = await evalG(() => ({ q: gdjs.PotionShop.game.cauldrons[0].quality, disc: gdjs.PotionShop.game.state.discovered }));
  check('bonus herb gives Fine quality and is discovered', q.q >= 2 && q.disc.includes('healing'), JSON.stringify(q));
  await shot('71_fine_ready');
  const gold0 = (await state()).gold;
  await tapWorld(k[0], k[1], 45);
  await waitFor((id) => !gdjs.PotionShop.game.customers.find((c) => c.id === id && c.state === 'ordered'), 'served', 200, cid);
  const gold1 = (await state()).gold;
  check('Fine potion sells above the base price', gold1 - gold0 > 14 * 1.4, 'earned=' + (gold1 - gold0));

  // 2. Forced accident with a wrong extra herb, then the owner cleans it.
  await evalG(() => { gdjs.PotionShop.data.balance.accidentWrongExtra = 1; });
  await tapWorld(k[0], k[1], 45);
  await sleep(800);
  await tapHit('recipe:energy');
  await tapHit('ing:moonwater');
  await tapHit('BREW');
  await waitFor(() => gdjs.PotionShop.game.cauldrons[0].state === 'brewing' && gdjs.PotionShop.game.cauldrons[0].t > gdjs.PotionShop.game.cauldrons[0].dur * 0.7, 'unstable');
  await shot('72_unstable');
  await waitFor(() => gdjs.PotionShop.game.cauldrons[0].state === 'dirty', 'accident');
  await evalG(() => { gdjs.PotionShop.simSteps = 1; });
  await sleep(700);
  await shot('73_accident');
  const acc = await evalG(() => ({ spill: !!gdjs.PotionShop.game.cauldrons[0].spill, n: gdjs.PotionShop.game.state.accidents }));
  check('accident leaves a spill and a dirty cauldron', acc.spill && acc.n === 1, JSON.stringify(acc));
  await tapWorld(k[0], k[1], 45);
  await evalG(() => { gdjs.PotionShop.simSteps = 4; });
  await waitFor(() => { const t = gdjs.PotionShop.game.owner.task; return t && t.type === 'clean' && t.phase === 'act'; }, 'cleaning');
  await evalG(() => { gdjs.PotionShop.simSteps = 1; });
  await sleep(1200);
  await shot('74_cleaning');
  await evalG(() => { gdjs.PotionShop.simSteps = 4; });
  await waitFor(() => gdjs.PotionShop.game.cauldrons[0].state === 'idle', 'cleaned');
  check('owner cleans the cauldron', await evalG(() => gdjs.PotionShop.game.cauldrons[0].state === 'idle' && !gdjs.PotionShop.game.cauldrons[0].spill));

  // 3. An apprentice cleans an accident on their own.
  await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game; G.state.level = 2; G.hireWorker();
    const c = G.cauldrons[0]; PS.Brewing.reserve(G, c, ['sunroot', 'sparkdust', 'moonwater']);
    const pip = G.workers.find((w) => !w.isOwner);
    PS.Workers.begin(G, pip, { type: 'startBrew', target: c });
  });
  await waitFor(() => gdjs.PotionShop.game.cauldrons[0].state === 'dirty', 'apprentice accident');
  const cleanedByPip = await waitFor(() => { const G = gdjs.PotionShop.game; return G.cauldrons[0].state === 'idle'; }, 'apprentice clean');
  check('apprentice brews and cleans up the accident', cleanedByPip);

  // 4. Rare herbs: Starbloom -> Superb, Glowcap -> fast and safe.
  const rare = await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game;
    const a = PS.Brewing.outcome(G, ['redleaf', 'moonwater', 'starbloom']);
    const b = PS.Brewing.outcome(G, ['redleaf', 'moonwater', 'glowcap']);
    const w = PS.Brewing.outcome(G, ['redleaf', 'moonwater', 'sparkdust']);
    return { star: a.quality, glowQ: b.quality, glowSpeed: b.speed, glowSafe: !b.accident, wrong: w.quality };
  });
  check('Starbloom makes Superb potions', rare.star === 3, JSON.stringify(rare));
  check('Glowcap: Fine, twice as fast, never explodes', rare.glowQ >= 2 && rare.glowSpeed === 2 && rare.glowSafe);
  check('a wrong extra herb makes Poor quality', rare.wrong === 0);
  await evalG(() => { gdjs.PotionShop.simSteps = 1; gdjs.PotionShop.data.balance.accidentWrongExtra = 0.55; });

  // 5. Herb garden: open from the herb shop, gather a ripe plant, come back.
  const before = await evalG(() => { const G = gdjs.PotionShop.game; return { customers: G.customers.length, inv: Object.assign({}, G.state.inventory) }; });
  await tapHit('tab:ingredients', 'hud');
  await tapHit('garden');
  await sleep(2500);
  const inGarden = await evalG(() => !!gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden);
  check('garden scene opens', inGarden);
  await shot('75_garden');
  const plot = await evalG(() => { const g = gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().__garden; const p = g.plots[4];
    // Plots start empty (Milestone 6): plant Redleaf and make it ripe.
    g.shop.state.gold += 100; g.plant(p, gdjs.PotionShop.data.ingredientById.redleaf); g.finishNow(p);
    return { x: p.x, y: p.y, herb: p.state.herb }; });
  await sleep(500);
  const sp = await evalG(([x, y]) => gdjs.PotionShop.proj.toScreen(x, y, 25), [plot.x, plot.y]);
  await tapGame(sp[0], sp[1]);
  await sleep(1500);
  await shot('76_gathering');
  await sleep(3000);
  const after = await evalG((h) => gdjs.PotionShop.game.state.inventory[h], plot.herb);
  check('gathering adds herbs to the pantry', after > (before.inv[plot.herb] || 0), plot.herb + ' ' + (before.inv[plot.herb] || 0) + ' -> ' + after);
  await shot('77_gathered');
  await tapHit('back', 'hud', 'garden');
  await sleep(2500);
  const back = await evalG(() => ({ scene: gdjs.PotionShop.game.scene.getGame().getSceneStack().getCurrentScene().getName(), customers: gdjs.PotionShop.game.customers.length }));
  check('back in the shop with customers kept', back.scene === 'Shop' && back.customers === before.customers, JSON.stringify(back));
  console.log(results.join('\n'));
};
