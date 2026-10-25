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
  }));
  const ingredients = (read('Ingredients') || []).map((i) => ({
    id: String(i.Id),
    name: String(i.Name),
    cost: Number(i.Cost) || 2,
    bundle: Number(i.Bundle) || 5,
    icon: String(i.Icon || 'ing_redleaf'),
    unlockLevel: Number(i.UnlockLevel) || 1,
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
  };

  PS.data = {
    recipes,
    recipeById: Object.fromEntries(recipes.map((r) => [r.id, r])),
    ingredients,
    ingredientById: Object.fromEntries(ingredients.map((i) => [i.id, i])),
    customers,
    upgrades,
    upgradeById: Object.fromEntries(upgrades.map((u) => [u.id, u])),
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
