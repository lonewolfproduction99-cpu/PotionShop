// ===== Potion Shop: save system =====
// Progress is stored with GDevelop's storage (localStorage on the web, also
// available in mobile exports) under the "PotionShop" storage name.
// Loading validates every field and falls back to defaults on bad data.
//
// The save has two parts:
//   meta: kept forever (shop level, XP, lifetime stats, prestige, gems),
//   run:  progress of the current shop, reset when the shop is prestiged
//         (gold, herbs, upgrades, stored potions, hired workers).
// In memory the game uses one flat object; the split happens when saving.
const PS = gdjs.PotionShop;

PS.Save = {
  STORAGE: 'PotionShop',
  KEY: 'save',
  VERSION: 2,
  META_KEYS: ['level', 'xp', 'served', 'lost', 'earned', 'satisfaction', 'prestige', 'gems', 'seenRecipes',
    'discovered', 'accidents', 'tutorialDone', 'tutorialPhase', 'lastSeen', 'incomeRate', 'ads'],
  RUN_KEYS: ['gold', 'inventory', 'upgrades', 'stock', 'workers', 'garden', 'closed'],

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
      prestige: 0,
      gems: 0,
      workers: [], // hired apprentices: { type, role, stats: { speed, brew, service } }
      discovered: [], // recipes whose bonus herb was found
      accidents: 0,
      garden: [], // herb garden plots: { herb, readyAt (ms timestamp) }
      tutorialDone: false,
      tutorialPhase: 'first', // current part of the tutorial (see 09_tutorial.js)
      closed: false, // the shop closed after satisfaction hit rock bottom
      ads: { day: '', count: 0 }, // rewarded ads watched today (daily limit)
      lastSeen: 0, // time of the last save (ms), for offline earnings
      incomeRate: 0, // recent gold earned per minute
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
    s.level = Math.floor(num(raw.level, 1, 1, 999));
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
    s.prestige = Math.floor(num(raw.prestige, 0, 0, 999));
    if (Array.isArray(raw.discovered)) s.discovered = raw.discovered.filter((id) => PS.data.recipeById[id]);
    s.accidents = Math.floor(num(raw.accidents, 0, 0, 1e9));
    s.tutorialDone = raw.tutorialDone === true;
    if (typeof raw.tutorialPhase === 'string' && raw.tutorialPhase.length < 20) s.tutorialPhase = raw.tutorialPhase;
    s.closed = raw.closed === true;
    if (raw.ads && typeof raw.ads === 'object') {
      s.ads = { day: String(raw.ads.day || ''), count: Math.floor(num(raw.ads.count, 0, 0, 999)) };
    }
    s.lastSeen = num(raw.lastSeen, 0, 0, 1e15);
    s.incomeRate = num(raw.incomeRate, 0, 0, 1e12);
    if (Array.isArray(raw.garden)) {
      s.garden = raw.garden.slice(0, 16).map((p) => ({
        herb: p && PS.data.ingredientById[p.herb] ? p.herb : null,
        readyAt: num(p && p.readyAt, 0, 0, 1e15),
        // Older saves had no `planted` flag: their plots were always growing.
        planted: p && p.planted !== undefined ? !!p.planted : !!(p && PS.data.ingredientById[p.herb]),
      }));
    }
    s.gems = Math.floor(num(raw.gems, 0, 0, 1e9));
    if (Array.isArray(raw.workers)) {
      const types = PS.data.workerTypes;
      raw.workers.slice(0, types.length).forEach((w, i) => {
        if (!w || typeof w !== 'object') return;
        const st = w.stats || {};
        s.workers.push({
          type: types[i].id,
          role: ['all', 'service', 'brew'].includes(w.role) ? w.role : 'all',
          stats: {
            speed: Math.floor(num(st.speed, 0, 0, 5)),
            brew: Math.floor(num(st.brew, 0, 0, 5)),
            service: Math.floor(num(st.service, 0, 0, 5)),
          },
        });
      });
    }
    return s;
  },

  // Stored format: { v: 2, meta: {...}, run: {...} }. Version 1 saves were flat.
  pack(state) {
    const meta = {};
    const run = {};
    for (const k of this.META_KEYS) meta[k] = state[k];
    for (const k of this.RUN_KEYS) run[k] = state[k];
    return { v: this.VERSION, meta, run };
  },
  unpack(raw) {
    if (raw && raw.v === 2 && raw.meta && raw.run) return Object.assign({}, raw.run, raw.meta);
    return raw; // version 1: already flat
  },

  // New shop after a prestige: meta progress and persistent upgrades are kept,
  // everything else starts over.
  prestigeReset(state) {
    const fresh = this.defaults();
    for (const k of this.META_KEYS) fresh[k] = JSON.parse(JSON.stringify(state[k]));
    for (const u of PS.data.upgrades) if (u.persistent) fresh.upgrades[u.id] = state.upgrades[u.id] || 0;
    fresh.prestige = (state.prestige || 0) + 1;
    return fresh;
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
    return this.validate(this.unpack(raw));
  },

  save(state) {
    try {
      gdjs.evtTools.storage.writeStringInJSONFile(this.STORAGE, this.KEY, JSON.stringify(this.pack(state)));
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
