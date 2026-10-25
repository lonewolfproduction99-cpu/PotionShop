// Save/load: progress survives a reload; corrupted saves fall back to defaults.
module.exports = async ({ page, sleep, evalG }) => {
  await evalG(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game);
  await evalG(() => { const G = gdjs.PotionShop.game; G.state.gold = 321; G.state.inventory.redleaf = 17; G.state.upgrades.extra_table = 2; G.saveNow(); });
  await page.reload();
  await page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game && gdjs.PotionShop.game.started);
  const r = await evalG(() => { const G = gdjs.PotionShop.game; return { gold: G.state.gold, red: G.state.inventory.redleaf, tables: G.seats.filter((s) => s.unlocked).length }; });
  console.log('after reload', JSON.stringify(r), r.gold === 321 && r.red === 17 && r.tables === 5 ? 'PASS' : 'FAIL');
  // The game saves when the page is hidden, so validate the loader directly.
  const r2 = await evalG(() => {
    const S = gdjs.PotionShop.Save; const out = {};
    localStorage.setItem('GDJS_PotionShop', '{"save":{"str":"{not json"}}');
    out.corrupt = S.load().gold;
    localStorage.setItem('GDJS_PotionShop', JSON.stringify({ save: { str: JSON.stringify({ gold: -50, level: 'x', inventory: { redleaf: 1e9 } }) } }));
    const s = S.load(); out.invalid = [s.gold, s.level, s.inventory.redleaf];
    return out;
  });
  console.log('validation', JSON.stringify(r2), r2.corrupt === 40 && r2.invalid[0] === 0 && r2.invalid[1] === 1 && r2.invalid[2] === 9999 ? 'PASS' : 'FAIL');
};
