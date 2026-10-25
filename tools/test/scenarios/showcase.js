// Fill the shop with customers and activity, then take full-size screenshots.
module.exports = async ({ shot, sleep, state, evalG }) => {
  await evalG(() => localStorage.clear());
  await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game;
    G.state.gold = 500; G.state.upgrades.extra_table = 1;
    PS.World.applyUnlocks(G);
    // Teleport-spawn customers directly onto seats for the screenshot.
    for (let i = 0; i < 4; i++) {
      const c = PS.World.spawnCustomer(G);
      const seat = PS.World.freeSeat(G);
      c.obj.setPosition(seat.x, seat.y);
      PS.World.sendToSeat(G, c, seat);
      c.path = [];
      c.state = 'toSeat';
    }
    const k = G.cauldrons[0];
    k.state = 'reserved'; k.recipe = PS.data.recipeById.healing; k.ingredients = ['redleaf', 'moonwater'];
    PS.Brewing.start(G, k);
  });
  await sleep(2500);
  await evalG(() => { const G = gdjs.PotionShop.game; const c = G.customers[1]; c.state = 'ordered'; c.patience = c.maxPatience * 0.4; G.customers[2].patience = G.customers[2].maxPatience * 0.12; });
  await sleep(1500);
  await shot('20_showcase');
  console.log(JSON.stringify(await state()));
};
