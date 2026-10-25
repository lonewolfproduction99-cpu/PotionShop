// Full gameplay loop driven by taps: take an order, brew, collect, deliver.
module.exports = async ({ shot, sleep, state, evalG, tapWorld, tapGame }) => {
  await evalG(() => localStorage.clear());
  const waitFor = async (pred, label, timeout = 90000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const s = await state();
      if (pred(s)) return s;
      await sleep(400);
    }
    throw new Error('Timeout waiting for ' + label + ' ' + JSON.stringify(await state()));
  };
  // Speed up the simulation for testing by spawning a customer right away.
  await evalG(() => { gdjs.PotionShop.game.spawnTimer = 0; });
  let s = await waitFor((s) => s.customers.some((c) => c.state === 'waitingOrder'), 'a seated customer');
  await shot('10_seated');
  const c = s.customers.find((c) => c.state === 'waitingOrder');
  console.log('seated', JSON.stringify(c));
  // Tap the customer (their speech bubble area).
  await tapWorld(c.x, c.y, 60);
  s = await state();
  console.log('after tap customer', JSON.stringify(s.owner));
  await sleep(600);
  await shot('11_owner_walking');
  s = await waitFor((s) => s.owner.phase === 'act', 'owner taking order');
  await shot('12_taking_order');
  s = await waitFor((s) => s.customers.some((x) => x.id === c.id && x.state === 'ordered'), 'order taken');
  console.log('order taken', JSON.stringify(s.customers));
  // Tap the cauldron: brew panel should open pre-filled with the order's recipe.
  const cd = await evalG(() => { const k = gdjs.PotionShop.game.cauldrons[0]; return [k.x, k.y]; });
  await tapWorld(cd[0], cd[1], 40);
  await sleep(400);
  s = await state();
  console.log('panel', s.panel);
  await shot('13_brew_panel');
  // Press BREW (find the button by its hit rect through the UI state).
  const brewBtn = await evalG(() => {
    const P = gdjs.PotionShop.game.ui.panel; if (!P) return null;
    // The BREW button is the 3rd hit after background+close in buildBrew: search the biggest green one instead.
    const h = P.hits.find((h) => h.w === 300 && h.h === 76); return h ? [h.x + h.w / 2, h.y + h.h / 2] : null; });
  console.log('brew button', brewBtn);
  await tapGame(brewBtn[0], brewBtn[1]);
  await sleep(500);
  s = await state();
  console.log('after brew', JSON.stringify(s.cauldrons), JSON.stringify(s.owner), JSON.stringify(s.inv));
  s = await waitFor((s) => s.cauldrons[0].state === 'brewing', 'brewing');
  await sleep(1500);
  await shot('14_brewing');
  s = await waitFor((s) => s.cauldrons[0].state === 'done', 'potion done');
  await shot('15_done');
  await tapWorld(cd[0], cd[1], 40);
  s = await waitFor((s) => s.owner.carrying, 'carrying');
  await sleep(800);
  await shot('16_carrying');
  s = await waitFor((s) => s.served >= 1, 'served');
  await sleep(300);
  await shot('17_served');
  console.log('final', JSON.stringify(s));
};
