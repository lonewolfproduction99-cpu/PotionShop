// ===== Potion Shop: game data =====
// Recipes, ingredients, customer types and upgrades are stored in the
// project's global variables (Project manager > Global variables) so they can
// be edited in GDevelop without touching code. This block reads them into
// plain JavaScript objects, with safe defaults for missing fields.
const PS = (gdjs.PotionShop = gdjs.PotionShop || {});

PS.loadData = function (runtimeScene) {
  const vars = runtimeScene.getGame().getVariables();
  const read = (name) => (vars.has(name) ? vars.get(name).toJSObject() : null);

  const recipes = (read('Recipes') || []).map((r) => ({
    id: String(r.Id),
    name: String(r.Name),
    ingredients: (r.Ingredients || []).map(String).sort(),
    price: Number(r.Price) || 10,
    brewTime: Number(r.BrewTime) || 6,
    color: String(r.Color || '200;200;200'),
    icon: String(r.Icon || 'potion_sludge'),
    unlockLevel: Number(r.UnlockLevel) || 1,
    bonus: r.Bonus ? String(r.Bonus) : null, // extra herb that makes it Fine quality
    prestige: Number(r.Prestige) || 0, // prestige needed before customers ask for it
  }));
  const ingredients = (read('Ingredients') || []).map((i) => ({
    id: String(i.Id),
    name: String(i.Name),
    cost: Number(i.Cost) || 2,
    bundle: Number(i.Bundle) || 5,
    icon: String(i.Icon || 'ing_redleaf'),
    unlockLevel: Number(i.UnlockLevel) || 1,
    rare: !!i.Rare,
    prestige: Number(i.Prestige) || 0,
    growTime: Number(i.GrowTime) || 30, // seconds in the herb garden
  }));
  const customers = (read('CustomerTypes') || []).map((c) => ({
    id: String(c.Id),
    object: String(c.Object),
    name: String(c.Name),
    patience: Number(c.Patience) || 60,
    tip: Number(c.Tip) || 1,
    speed: Number(c.Speed) || 100,
    minLevel: Number(c.MinLevel) || 1,
  }));
  const upgrades = (read('Upgrades') || []).map((u) => ({
    id: String(u.Id),
    name: String(u.Name),
    desc: String(u.Description || ''),
    icon: String(u.Icon || 'icon_upgrades'),
    tab: String(u.Tab || 'upgrades'),
    baseCost: Number(u.BaseCost) || 50,
    costGrowth: Number(u.CostGrowth) || 1.6,
    maxLevel: Number(u.MaxLevel) || 5,
    effect: Number(u.Effect) || 0,
    minShopLevel: Number(u.MinShopLevel) || 1,
    persistent: !!u.Persistent, // kept when the shop is prestiged
  }));
  // Potion Mastery: one permanent price upgrade per potion (kept after prestige).
  for (const r of recipes) {
    upgrades.push({
      id: 'mastery_' + r.id,
      name: r.name.replace(' Potion', '') + ' Mastery',
      desc: '+15% price for ' + r.name + '. Kept after prestige.',
      icon: r.icon,
      tab: 'mastery',
      baseCost: r.price * 25,
      costGrowth: 1.9,
      maxLevel: 10,
      effect: 0.15,
      minShopLevel: r.unlockLevel,
      persistent: true,
      prestige: r.prestige,
    });
  }
  const workerTypes = (read('WorkerTypes') || []).map((w) => ({
    id: String(w.Id),
    object: String(w.Object),
    name: String(w.Name),
    hireCost: Number(w.HireCost) || 150,
    minShopLevel: Number(w.MinShopLevel) || 1,
  }));
  const b = read('Balance') || {};
  const balance = {
    startGold: Number(b.StartGold) || 40,
    startIngredients: Number(b.StartIngredients) || 6,
    xpPerServe: Number(b.XpPerServe) || 10,
    spawnIntervalStart: Number(b.SpawnIntervalStart) || 12,
    spawnIntervalMin: Number(b.SpawnIntervalMin) || 6,
    queueSize: Number(b.QueueSize) || 3,
    maxStock: Number(b.MaxStock) || 6,
    storageBase: Number(b.StorageBase) || 20,
    ownerSpeed: Number(b.OwnerSpeed) || 150,
    takeOrderTime: Number(b.TakeOrderTime) || 1.4,
    addIngredientsTime: Number(b.AddIngredientsTime) || 1.2,
    collectTime: Number(b.CollectTime) || 0.8,
    deliverTime: Number(b.DeliverTime) || 0.7,
    tipMax: Number(b.TipMax) || 0.5,
    sludgePrice: Number(b.SludgePrice) || 0,
    apprenticeSlowness: Number(b.ApprenticeSlowness) || 1.15, // apprentices start a bit slower than the owner
    workerUpgradeBase: Number(b.WorkerUpgradeBase) || 50,
    workerUpgradeGrowth: Number(b.WorkerUpgradeGrowth) || 1.65,
    accidentWrongExtra: Number(b.AccidentWrongExtra) || 0.55, // chance a wrong extra herb explodes
    accidentSludge: Number(b.AccidentSludge) || 0.4,
    cleanTime: Number(b.CleanTime) || 3,
    gardenRegrow: Number(b.GardenRegrow) || 45, // seconds for a garden plot to regrow
    gardenRareChance: Number(b.GardenRareChance) || 0.08,
    gardenLevel: Number(b.GardenLevel) || 2,
    prestigeCostMult: Number(b.PrestigeCostMult) || 5, // shop upgrade costs x5 per prestige
    prestigePriceMult: Number(b.PrestigePriceMult) || 3, // potion prices x3 per prestige
    prestigeHerbMult: Number(b.PrestigeHerbMult) || 2,
    prestigeGems: Number(b.PrestigeGems) || 20, // gems for prestige N: N x this
    levelGems: Number(b.LevelGems) || 3,
    giftChance: Number(b.GiftChance) || 0.3, // special herb from a delighted customer
    closeAt: Number(b.CloseAt) || 8, // satisfaction % that closes the shop
    reopenGems: Number(b.ReopenGems) || 15,
    adDailyLimit: Number(b.AdDailyLimit) || 10,
    harvestRareChance: Number(b.HarvestRareChance) || 0.12,
  };

  PS.data = {
    recipes,
    recipeById: Object.fromEntries(recipes.map((r) => [r.id, r])),
    ingredients,
    ingredientById: Object.fromEntries(ingredients.map((i) => [i.id, i])),
    customers,
    upgrades,
    upgradeById: Object.fromEntries(upgrades.map((u) => [u.id, u])),
    workerTypes,
    balance,
  };
  return PS.data;
};

// Recipe matching: ingredient order does not matter.
PS.findRecipe = function (ingredientIds) {
  const key = ingredientIds.slice().sort().join('+');
  for (const r of PS.data.recipes) {
    if (r.ingredients.join('+') === key) return r;
  }
  return null;
};

// XP needed to go from `level` to `level + 1`.
PS.xpForLevel = function (level) {
  return 40 + 30 * (level - 1) + 10 * (level - 1) * (level - 1);
};
