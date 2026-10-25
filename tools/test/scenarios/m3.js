// Milestone 3 checks: hiring apprentices through the Workers panel, autonomous
// work with no duplicate claims, roles, per-worker upgrades, save/load of
// workers and migration of a version 1 save.
module.exports = async ({ shot, sleep, state, evalG, tapGame, page }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  const tapHit = async (label, where = 'panel') => {
    const r = await evalG(([label, where]) => {
      const G = gdjs.PotionShop.game;
      const hits = where === 'hud' ? G.ui.hud.hits : (G.ui.panel ? G.ui.panel.hits : []);
      const h = hits.slice().reverse().find((h) => h.label === label);
      return h ? [h.x + h.w / 2, h.y + h.h / 2] : null;
    }, [label, where]);
    if (!r) throw new Error('No button ' + label);
    await tapGame(r[0], r[1]);
    await sleep(1200);
  };
  await evalG(() => localStorage.clear());
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.gold = 3000; G.state.level = 5; G.state.inventory.bluecap = 10; });

  // Hire two apprentices through the panel.
  await tapHit('tab:workers', 'hud');
  await tapHit('hire');
  await tapHit('hire');
  let n = await evalG(() => gdjs.PotionShop.game.workers.length);
  check('hire two apprentices', n === 3, 'workers=' + n);
  await tapHit('wup:1:speed');
  const lvl = await evalG(() => gdjs.PotionShop.game.state.workers[0].stats.speed);
  check('per-worker upgrade', lvl === 1);
  await shot('60_workers_panel');
  await tapHit('role:2'); // Maple -> service only
  const role = await evalG(() => gdjs.PotionShop.game.state.workers[1].role);
  check('role toggle', role === 'service', role);
  await tapHit('icon_close');

  // Let customers come; the owner is never tapped. Apprentices must serve them.
  await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game;
    window.__dup = 0;
    window.__checkDup = () => {
      const seen = new Set();
      for (const w of G.workers) for (const t of [w.task, ...w.queue]) {
        if (!t || t.type === 'store') continue;
        const key = t.type + ':' + (t.target.id !== undefined ? 'c' + t.target.id : 'k' + t.target.index);
        if (seen.has(key)) window.__dup++;
        seen.add(key);
      }
      // Maple (service) must never brew.
      const maple = G.workers.find((w) => w.index === 2);
      if (maple && maple.task && ['startBrew', 'collect'].includes(maple.task.type)) window.__roleViolation = true;
    };
    for (let i = 0; i < 3; i++) { const c = PS.World.spawnCustomer(G); c.obj.setPosition(G.doorOutside[0], G.doorOutside[1]); c.path = []; PS.World.onArrivedAtDoor(G, c); }
    PS.simSteps = 6;
  });
  let s;
  for (let i = 0; i < 240; i++) {
    await evalG(() => window.__checkDup());
    s = await state();
    if (s.served >= 3) break;
    if (i === 30) await shot('61_apprentices_working');
    await sleep(300);
  }
  const extra = await evalG(() => ({ dup: window.__dup, role: !!window.__roleViolation, ownerTasks: gdjs.PotionShop.game.owner.queue.length }));
  check('apprentices served customers without the owner', s.served >= 3, 'served=' + s.served);
  check('no two workers claimed the same job', extra.dup === 0, 'dup=' + extra.dup);
  check('service-only apprentice never brewed', !extra.role);
  await evalG(() => { gdjs.PotionShop.simSteps = 1; });
  await shot('62_after_service');

  // Save and reload: workers come back with their stats and roles.
  await evalG(() => gdjs.PotionShop.game.saveNow());
  await page.reload();
  await page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game && gdjs.PotionShop.game.started);
  const back = await evalG(() => { const G = gdjs.PotionShop.game; return { n: G.workers.length, role: G.state.workers[1].role, speed: G.state.workers[0].stats.speed, v: JSON.parse(JSON.parse(localStorage.getItem('GDJS_PotionShop')).save.str).v }; });
  check('workers restored after reload', back.n === 3 && back.role === 'service' && back.speed === 1, JSON.stringify(back));
  check('save format is version 2 (meta/run split)', back.v === 2);

  // Version 1 (flat) save migrates; prestige reset keeps meta progress only.
  const mig = await evalG(() => {
    const S = gdjs.PotionShop.Save;
    const v1 = { gold: 777, level: 7, xp: 12, served: 99, inventory: { redleaf: 9 }, upgrades: { quick_brew: 2 } };
    const st = S.validate(S.unpack(v1));
    const p = S.prestigeReset(Object.assign(st, { workers: [{ type: 'pip', role: 'all', stats: { speed: 2, brew: 0, service: 0 } }] }));
    return { gold: st.gold, level: st.level, qb: st.upgrades.quick_brew, p: { prestige: p.prestige, level: p.level, served: p.served, gold: p.gold, workers: p.workers.length, qb: p.upgrades.quick_brew } };
  });
  check('version 1 save migrates', mig.gold === 777 && mig.level === 7 && mig.qb === 2, JSON.stringify(mig));
  check('prestige reset keeps meta, resets run', mig.p.prestige === 1 && mig.p.level === 7 && mig.p.served === 99 && mig.p.gold === 40 && mig.p.workers === 0 && mig.p.qb === 0, JSON.stringify(mig.p));
  console.log(results.join('\n'));
};
