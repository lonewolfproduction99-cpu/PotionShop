// Automated player: plays several game-minutes at accelerated speed through the
// same actions the interface uses, then reports progression and stability.
module.exports = async ({ sleep, evalG, shot }) => {
  await evalG(() => localStorage.clear());
  const minutes = Number(process.env.BOT_MINUTES || 8);
  await evalG(() => {
    const PS = gdjs.PotionShop;
    PS.simSteps = 8;
    window.__bot = { log: [], buys: [] };
    window.__botTick = () => {
      const G = PS.game;
      const s = G.state;
      // Take orders and collect finished potions.
      for (const c of G.customers) if (c.state === 'waitingOrder' && !PS.Workers.isQueued(G, 'takeOrder', c)) PS.Workers.enqueue(G, { type: 'takeOrder', target: c });
      for (const k of G.cauldrons) if (k.unlocked && k.state === 'done' && !PS.Workers.isQueued(G, 'collect', k)) PS.Workers.enqueue(G, { type: 'collect', target: k });
      for (const c of PS.World.pendingOrders(G)) if (!c.deliveryReserved && (s.stock[c.recipe.id] || 0) > 0 && !PS.Workers.isQueued(G, 'fetchStock', c)) PS.Workers.enqueue(G, { type: 'fetchStock', target: c });
      // Brew for uncovered orders.
      for (const k of G.cauldrons) {
        if (!k.unlocked || k.state !== 'idle') continue;
        const orders = PS.World.pendingOrders(G).concat(G.customers.filter((c) => c.state === 'waitingOrder'));
        const want = orders.find((o) => PS.Brewing.plannedFor(G, o.recipe.id) < orders.filter((x) => x.recipe.id === o.recipe.id).length && PS.Brewing.canBrew(G, o.recipe));
        if (want) PS.Brewing.request(G, k, want.recipe.ingredients.slice());
      }
      // Restock herbs used by known recipes.
      const needed = new Set(PS.Brewing.knownRecipes(G).flatMap((r) => r.ingredients));
      for (const id of needed) {
        const ing = PS.data.ingredientById[id];
        if ((s.inventory[id] || 0) < 3 && s.inventory[id] + ing.bundle <= G.storageCap() && s.gold >= ing.cost * ing.bundle + 10) { G.addGold(-ing.cost * ing.bundle); s.inventory[id] += ing.bundle; }
      }
      // Hire apprentices, then train them.
      const next = G.nextWorkerType();
      if (next && s.level >= next.minShopLevel && s.gold >= next.hireCost + 40) {
        window.__bot.buys.push([Math.round(G.time), 'hire ' + next.name, next.hireCost]);
        G.hireWorker();
      }
      // Buy upgrades when comfortably rich (keep a herb budget).
      const order = ['extra_table', 'extra_cauldron', 'quick_brew', 'cozy_decor', 'quick_hands', 'swift_shoes', 'fine_bottles', 'herb_storage'];
      const saving = next && s.level >= next.minShopLevel; // save up for the next apprentice
      for (const id of saving ? [] : order) {
        const u = PS.data.upgradeById[id];
        if (s.level >= u.minShopLevel && G.level(id) < G.upgradeMax(u) && s.gold >= G.upgradeCost(u) + 40) {
          window.__bot.buys.push([Math.round(G.time), id, G.upgradeCost(u)]);
          G.buyUpgrade(u);
          break;
        }
      }
      s.workers.forEach((rec, i) => {
        for (const st of ['speed', 'brew', 'service']) {
          if (rec.stats[st] < 5 && s.gold >= G.workerUpgradeCost(i + 1, st) + 150) {
            window.__bot.buys.push([Math.round(G.time), rec.type + ' ' + st, G.workerUpgradeCost(i + 1, st)]);
            G.upgradeWorker(i + 1, st);
          }
        }
      });
      if (G.ui.panel && G.ui.panel.name === 'levelup') PS.UI.close(G);
    };
  });
  const t0 = Date.now();
  let lastLog = -30;
  while (true) {
    const info = await evalG(() => {
      window.__botTick();
      const G = gdjs.PotionShop.game; const s = G.state;
      return { t: G.time, gold: Math.round(s.gold), level: s.level, served: s.served, lost: s.lost, sat: Math.round(s.satisfaction),
        objects: G.scene.getAdhocListOfAllInstances().length, customers: G.customers.length, queue: G.queue.length, workers: G.workers.length };
    });
    if (info.t - lastLog >= 30) { lastLog = info.t; console.log(JSON.stringify(info)); }
    if (info.t >= minutes * 60) break;
    if (Date.now() - t0 > 20 * 60 * 1000) { console.log('real-time limit reached'); break; }
    await sleep(250);
  }
  await shot('40_bot_end');
  console.log('buys', JSON.stringify(await evalG(() => window.__bot.buys)));
};
