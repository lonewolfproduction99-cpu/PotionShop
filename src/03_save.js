// ===== Potion Shop: save system =====
// Progress is stored with GDevelop's storage (localStorage on the web, also
// available in mobile exports) under the "PotionShop" storage name.
// Loading validates every field and falls back to defaults on bad data.
const PS = gdjs.PotionShop;

PS.Save = {
  STORAGE: 'PotionShop',
  KEY: 'save',
  VERSION: 1,

  defaults() {
    const d = PS.data;
    const inventory = {};
    for (const ing of d.ingredients) inventory[ing.id] = ing.unlockLevel <= 1 ? d.balance.startIngredients : 0;
    const upgrades = {};
    for (const u of d.upgrades) upgrades[u.id] = 0;
    return {
      v: this.VERSION,
      gold: d.balance.startGold,
      xp: 0,
      level: 1,
      served: 0,
      lost: 0,
      earned: 0,
      satisfaction: 80,
      inventory,
      upgrades,
      stock: {},
      seenRecipes: [],
    };
  },

  validate(raw) {
    const s = this.defaults();
    if (!raw || typeof raw !== 'object') return s;
    const num = (v, def, min, max) => {
      const n = Number(v);
      return Number.isFinite(n) ? PS.util.clamp(n, min, max) : def;
    };
    s.gold = num(raw.gold, s.gold, 0, 1e12);
    s.level = Math.floor(num(raw.level, 1, 1, 99));
    s.xp = num(raw.xp, 0, 0, 1e9);
    s.served = Math.floor(num(raw.served, 0, 0, 1e9));
    s.lost = Math.floor(num(raw.lost, 0, 0, 1e9));
    s.earned = num(raw.earned, 0, 0, 1e12);
    s.satisfaction = num(raw.satisfaction, 80, 0, 100);
    if (raw.inventory && typeof raw.inventory === 'object') {
      for (const id in s.inventory) s.inventory[id] = Math.floor(num(raw.inventory[id], s.inventory[id], 0, 9999));
    }
    if (raw.upgrades && typeof raw.upgrades === 'object') {
      for (const u of PS.data.upgrades) s.upgrades[u.id] = Math.floor(num(raw.upgrades[u.id], 0, 0, u.maxLevel));
    }
    if (raw.stock && typeof raw.stock === 'object') {
      for (const id in raw.stock) {
        if (PS.data.recipeById[id]) s.stock[id] = Math.floor(num(raw.stock[id], 0, 0, 99));
      }
    }
    if (Array.isArray(raw.seenRecipes)) s.seenRecipes = raw.seenRecipes.filter((id) => PS.data.recipeById[id]);
    return s;
  },

  load() {
    const tools = gdjs.evtTools.storage;
    const variable = new gdjs.Variable();
    let raw = null;
    try {
      if (tools.readStringFromJSONFile(this.STORAGE, this.KEY, null, variable)) {
        raw = JSON.parse(variable.getAsString());
      }
    } catch (e) {
      console.warn('Potion Shop: save data is invalid, starting fresh.', e);
      raw = null;
    }
    return this.validate(raw);
  },

  save(state) {
    try {
      gdjs.evtTools.storage.writeStringInJSONFile(this.STORAGE, this.KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('Potion Shop: could not save.', e);
      return false;
    }
  },

  reset() {
    try {
      gdjs.evtTools.storage.deleteElementFromJSONFile(this.STORAGE, this.KEY);
    } catch (e) {
      console.warn('Potion Shop: could not reset the save.', e);
    }
  },
};
