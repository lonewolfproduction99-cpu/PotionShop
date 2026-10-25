// ===== Potion Shop: game state, progression and main loop =====
const PS = gdjs.PotionShop;
const U = PS.util;

PS.Audio = {
  SOUNDS: {
    coin: 'sfx_coin.wav',
    tap: 'sfx_tap.wav',
    pop: 'sfx_pop.wav',
    splash: 'sfx_splash.wav',
    ready: 'sfx_ready.wav',
    angry: 'sfx_angry.wav',
    buy: 'sfx_buy.wav',
    levelup: 'sfx_levelup.wav',
  },
  play(G, name) {
    if (!G.settings || !G.settings.sound) return;
    const file = this.SOUNDS[name];
    if (!file) return;
    try {
      gdjs.evtTools.sound.playSound(G.scene, file, false, name === 'tap' ? 35 : 70, 1);
    } catch (e) {
      // Sound is optional.
    }
  },
};

PS.Game = class {
  constructor(runtimeScene) {
    this.scene = runtimeScene;
    this.time = 0;
    this.fx = [];
    this.stockQuality = {}; // quality of each potion stored on the counter
    this.started = false;
    this.saveTimer = 0;
    this.needSave = false;
    PS.game = this;
    PS.loadData(runtimeScene);
    PS.proj.init(runtimeScene);
    this.settings = this.loadSettings();
    this.state = PS.Save.load();
    this.nav = new PS.Nav(runtimeScene);
    PS.setupCamera(runtimeScene);
    PS.World.init(this);
    PS.Workers.createOwner(this);
    this.state.workers.forEach((record, i) => PS.Workers.createApprentice(this, i + 1, record));
    PS.UI.init(this);
    this.setShadows(this.settings.shadows);
    this.started = true;
    if (this.state.served === 0 && this.state.gold === PS.data.balance.startGold) {
      PS.UI.toast(this, 'Welcome! Tap a seated customer to take their order.');
    }
  }

  // ----- upgrade helpers
  level(id) {
    return this.state.upgrades[id] || 0;
  }
  // sign > 0: bonus that grows with the level; sign < 0: time reduction.
  mult(id, sign) {
    const u = PS.data.upgradeById[id];
    if (!u) return 1;
    const v = u.effect * this.level(id) * Math.abs(sign);
    return sign > 0 ? 1 + v : 1 / (1 + v);
  }
  // How many of each herb fits in the pantry.
  storageCap() {
    const u = PS.data.upgradeById.herb_storage;
    return PS.data.balance.storageBase + (u ? u.effect * this.level('herb_storage') : 0);
  }
  upgradeMax(u) {
    if (u.id === 'extra_table') return Math.min(u.maxLevel, this.seats.length - 3);
    if (u.id === 'extra_cauldron') return Math.min(u.maxLevel, this.cauldrons.length - 1);
    return u.maxLevel;
  }
  upgradeCost(u) {
    return Math.round(u.baseCost * Math.pow(u.costGrowth, this.level(u.id)));
  }
  upgradeStatus(u) {
    const l = this.level(u.id);
    if (u.id === 'extra_table') return 'Tables: ' + PS.World.tablesUnlocked(this) + ' / ' + this.seats.length;
    if (u.id === 'extra_cauldron') return 'Cauldrons: ' + PS.World.cauldronsUnlocked(this) + ' / ' + this.cauldrons.length;
    return 'Level ' + l + ' / ' + u.maxLevel + (l ? '  ·  +' + Math.round(u.effect * l * 100) + '%' : '');
  }
  buyUpgrade(u) {
    const cost = this.upgradeCost(u);
    if (this.state.gold < cost || this.level(u.id) >= this.upgradeMax(u)) return false;
    this.addGold(-cost);
    this.state.upgrades[u.id] = this.level(u.id) + 1;
    PS.Audio.play(this, 'buy');
    if (u.tab === 'expand') PS.World.applyUnlocks(this);
    PS.UI.toast(this, u.name + ' purchased!');
    this.saveNow();
    return true;
  }

  // ----- hired apprentices
  nextWorkerType() {
    return PS.data.workerTypes[this.state.workers.length] || null;
  }
  hireWorker() {
    const t = this.nextWorkerType();
    if (!t || this.state.gold < t.hireCost || this.state.level < t.minShopLevel) return false;
    this.addGold(-t.hireCost);
    const record = { type: t.id, role: 'all', stats: { speed: 0, brew: 0, service: 0 } };
    this.state.workers.push(record);
    const w = PS.Workers.createApprentice(this, this.state.workers.length, record);
    // Walk in from the door.
    w.obj.setPosition(this.door[0], this.door[1]);
    PS.FX.sparkleAt(this, this.door[0], this.door[1], 40);
    PS.Audio.play(this, 'levelup');
    PS.UI.toast(this, t.name + ' joined your shop!');
    this.saveNow();
    return true;
  }
  workerUpgradeCost(index, stat) {
    const b = PS.data.balance;
    const lvl = this.state.workers[index - 1].stats[stat] || 0;
    return Math.round(b.workerUpgradeBase * Math.pow(b.workerUpgradeGrowth, lvl) * (1 + 0.6 * (index - 1)));
  }
  upgradeWorker(index, stat) {
    const rec = this.state.workers[index - 1];
    if (!rec || rec.stats[stat] >= 5) return false;
    const cost = this.workerUpgradeCost(index, stat);
    if (this.state.gold < cost) return false;
    this.addGold(-cost);
    rec.stats[stat] += 1;
    PS.Audio.play(this, 'buy');
    this.saveNow();
    return true;
  }
  cycleWorkerRole(index) {
    const rec = this.state.workers[index - 1];
    const roles = ['all', 'service', 'brew'];
    rec.role = roles[(roles.indexOf(rec.role) + 1) % roles.length];
    this.requestSave();
  }

  // ----- economy and progression
  addGold(n) {
    this.state.gold = Math.max(0, this.state.gold + n);
    this.requestSave();
  }
  addXp(n) {
    const s = this.state;
    s.xp += n;
    let leveled = false;
    const newRecipes = [];
    while (s.xp >= PS.xpForLevel(s.level) && s.level < 99) {
      s.xp -= PS.xpForLevel(s.level);
      s.level += 1;
      leveled = true;
      for (const r of PS.data.recipes) if (r.unlockLevel === s.level) newRecipes.push(r);
      for (const ing of PS.data.ingredients) {
        if (ing.unlockLevel === s.level) s.inventory[ing.id] = Math.min(this.storageCap(), (s.inventory[ing.id] || 0) + 4);
      }
    }
    if (leveled) {
      PS.Audio.play(this, 'levelup');
      PS.UI.open(this, 'levelup', { recipes: newRecipes });
      this.saveNow();
    }
  }
  recordSatisfaction(v) {
    this.state.satisfaction = U.clamp(this.state.satisfaction * 0.85 + v * 0.15, 0, 100);
  }

  // ----- saving
  requestSave() {
    this.needSave = true;
  }
  snapshot() {
    // Potions in progress are kept as finished potions on the counter so
    // nothing paid for is lost when the game is closed.
    const s = JSON.parse(JSON.stringify(this.state));
    for (const c of this.cauldrons) {
      if (c.recipe && c.recipe.id !== 'sludge' && !c.accident && (c.state === 'brewing' || c.state === 'done' || c.state === 'reserved')) {
        s.stock[c.recipe.id] = (s.stock[c.recipe.id] || 0) + 1;
      }
    }
    for (const w of this.workers) {
      if (w.carrying && w.carrying.id !== 'sludge') s.stock[w.carrying.id] = (s.stock[w.carrying.id] || 0) + 1;
    }
    return s;
  }
  saveNow() {
    this.needSave = false;
    this.saveTimer = 0;
    PS.Save.save(this.snapshot());
  }
  loadSettings() {
    const v = new gdjs.Variable();
    let s = null;
    try {
      if (gdjs.evtTools.storage.readStringFromJSONFile('PotionShop', 'settings', null, v)) s = JSON.parse(v.getAsString());
    } catch (e) {
      s = null;
    }
    return { shadows: s && typeof s.shadows === 'boolean' ? s.shadows : true, sound: s && typeof s.sound === 'boolean' ? s.sound : true };
  }
  saveSettings() {
    gdjs.evtTools.storage.writeStringInJSONFile('PotionShop', 'settings', JSON.stringify(this.settings));
  }
  setShadows(on) {
    this.settings.shadows = on;
    this.scene.getLayer('').setEffectBooleanParameter('Sun', 'isCastingShadow', on);
    this.saveSettings();
  }
  resetProgress() {
    PS.Save.reset();
    this.scene.requestChange(gdjs.SceneChangeRequest.REPLACE_SCENE, 'Shop');
  }

  // ----- herb garden (a separate scene pushed on top of the paused shop)
  goToGarden() {
    PS.UI.close(this);
    this.saveNow();
    this.scene.requestChange(gdjs.SceneChangeRequest.PUSH_SCENE, 'Garden');
  }

  // ----- main loop
  update() {
    PS.proj.scene = this.scene; // the garden scene may have changed it
    const dt = Math.min(0.1, this.scene.getElapsedTime() / 1000);
    // PS.simSteps > 1 runs the simulation several times per frame (automated tests only).
    const steps = PS.simSteps || 1;
    for (let i = 0; i < steps; i++) {
      this.time += dt;
      PS.World.updateCustomers(this, dt);
      PS.Workers.update(this, dt);
      PS.Brewing.update(this, dt);
      PS.FX.update(this, dt);
    }
    PS.UI.update(this, dt);
    this.saveTimer += dt;
    if (this.saveTimer > 8 && this.needSave) this.saveNow();
  }
};
