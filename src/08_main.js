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
  // Background music on its own channel (starts after the first tap on phones).
  music(G) {
    try {
      if (G.settings.music) gdjs.evtTools.sound.playMusicOnChannel(G.scene, 'music_shop.wav', 1, true, 30, 1);
      else gdjs.evtTools.sound.stopMusicOnChannel(G.scene, 1);
    } catch (e) {
      // Music is optional.
    }
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

// Rewarded ads with a daily limit. The real ad work is done by the ad adapter
// (window.PotionAds, pwa/ads.js, added to the HTML5 export by
// tools/pwa/apply_pwa.py). The reward is only given when the adapter reports
// that the ad provider confirmed it. Without the adapter (GDevelop preview) a
// clearly labelled test panel is used instead.
PS.Ads = {
  today() {
    return new Date().toISOString().slice(0, 10);
  },
  state(G) {
    const s = (G.shop || G).state;
    if (s.ads.day !== this.today()) s.ads = { day: this.today(), count: 0 };
    return s.ads;
  },
  left(G) {
    return Math.max(0, PS.data.balance.adDailyLimit - this.state(G).count);
  },
  adapter() {
    return typeof window !== 'undefined' ? window.PotionAds : null;
  },
  preview(G) {
    return !this.adapter() && G.scene.getGame().isPreview();
  },
  // Can an ad be requested now? (Buttons are disabled otherwise.)
  available(G) {
    if (this.left(G) <= 0) return false;
    const A = this.adapter();
    return A ? A.isAvailable() : this.preview(G);
  },
  // Short reason shown when ads cannot be watched.
  unavailableText(G) {
    if (this.left(G) <= 0) return 'No more ads today, come back tomorrow';
    const A = this.adapter();
    const st = A ? A.status() : 'no-provider';
    if (st === 'offline') return 'You are offline: ads need an internet connection';
    if (st === 'no-provider') return 'Ads are not available in this version';
    if (st === 'loading') return 'Ads are still loading, try again in a moment';
    return 'No ad is available right now, try again later';
  },
  // Button label suffix: "(3 left today)" or why ads are unavailable.
  label(G, text) {
    if (this.available(G)) return text + ' (' + this.left(G) + ' left today)';
    return text + ' (unavailable)';
  },
  watch(G, reason, onReward, placement) {
    if (!this.available(G)) {
      PS.UI.toast(G, this.unavailableText(G));
      return false;
    }
    const A = this.adapter();
    if (!A) {
      // GDevelop preview only: a labelled test panel, never shown in exported builds.
      PS.UI.open(G, 'ad', { reason, onReward, preview: true, until: Date.now() + 3000 });
      return true;
    }
    PS.UI.open(G, 'ad', { reason, waiting: true });
    A.showRewardedAd(placement || 'reward').then((res) => {
      if (G.ui.panel && G.ui.panel.name === 'ad') PS.UI.close(G);
      if (res.rewarded) {
        this.claim(G);
        onReward();
        PS.Audio.play(G.shop || G, 'coin');
        PS.UI.toast(G, 'Reward earned!');
      } else {
        PS.UI.toast(G, res.reason === 'dismissed' || res.reason === 'closed-early' || res.reason === 'not-completed'
          ? 'Ad closed early: no reward' : 'No ad could be shown, no reward this time');
      }
    });
    return true;
  },
  claim(G) {
    this.state(G).count += 1;
    (G.shop || G).requestSave();
  },
  // While an ad is on screen the shop pauses and the sound is muted.
  hookPause(G) {
    const A = this.adapter();
    if (!A || A._potionHooked) return;
    A._potionHooked = true;
    let volume = 100;
    A._pauseGame = (on) => {
      if (!!PS.adPlaying === !!on) return;
      PS.adPlaying = !!on;
      const sm = PS.game.scene.getGame().getSoundManager();
      if (on) {
        volume = sm.getGlobalVolume();
        sm.setGlobalVolume(0);
      } else {
        sm.setGlobalVolume(volume);
      }
    };
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
    PS.setupCamera(runtimeScene);
    PS.World.init(this);
    // Navigation is built after the tables exist (long tables are created at runtime).
    this.nav = new PS.Nav(runtimeScene);
    PS.Workers.createOwner(this);
    this.state.workers.forEach((record, i) => PS.Workers.createApprentice(this, i + 1, record));
    PS.UI.init(this);
    this.setShadows(this.settings.shadows);
    PS.Tutorial.init(this);
    PS.Audio.music(this);
    PS.Ads.hookPause(this);
    this.checkOffline();
    this.incomeTimer = 0;
    this.earnedMark = this.state.earned;
    this.started = true;
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
  // ----- prestige
  prestige() {
    return this.state.prestige || 0;
  }
  groupSize() {
    return Math.min(5, 1 + this.prestige()); // chairs per table slot
  }
  maxOrderItems() {
    return Math.min(5, 1 + this.prestige()); // potions one customer may order
  }
  patienceMult() {
    return Math.max(0.6, Math.pow(0.93, this.prestige()));
  }
  costMult() {
    return Math.pow(PS.data.balance.prestigeCostMult, this.prestige());
  }
  herbCostMult() {
    return Math.pow(PS.data.balance.prestigeHerbMult, this.prestige());
  }
  // Selling price of one Standard potion: prestige bonus, Fine Bottles and mastery.
  potionPrice(recipe) {
    const mastery = PS.data.upgradeById['mastery_' + recipe.id];
    const m = mastery ? 1 + mastery.effect * this.level(mastery.id) : 1;
    return recipe.price * Math.pow(PS.data.balance.prestigePriceMult, this.prestige()) * this.mult('fine_bottles', +1) * m;
  }
  herbCost(ing) {
    return Math.round(ing.cost * ing.bundle * this.herbCostMult());
  }
  hireCost(t) {
    return Math.round(t.hireCost * this.costMult());
  }
  // Prestige needs every shop upgrade maxed and every apprentice hired.
  prestigeProgress() {
    const goals = PS.data.upgrades.filter((u) => !u.persistent && (u.tab === 'upgrades' || u.tab === 'expand'));
    let done = 0;
    const missing = [];
    for (const u of goals) {
      if (this.level(u.id) >= this.upgradeMax(u)) done++;
      else missing.push(u.name);
    }
    const hired = this.state.workers.length;
    const needHires = PS.data.workerTypes.length;
    if (hired < needHires) missing.push('Hire all apprentices (' + hired + '/' + needHires + ')');
    return { done: done + Math.min(hired, needHires), total: goals.length + needHires, ready: missing.length === 0, missing };
  }
  doPrestige() {
    if (!this.prestigeProgress().ready) return false;
    const next = PS.Save.prestigeReset(this.state);
    next.gems += PS.data.balance.prestigeGems * next.prestige;
    this.state = next;
    PS.Save.save(next);
    this.prestiging = true;
    this.scene.requestChange(gdjs.SceneChangeRequest.REPLACE_SCENE, 'Shop');
    return true;
  }

  upgradeMax(u) {
    if (u.id === 'extra_table') return Math.min(u.maxLevel, this.slots.length - 3);
    if (u.id === 'extra_cauldron') return Math.min(u.maxLevel, this.cauldrons.length - 1);
    return u.maxLevel;
  }
  upgradeCost(u) {
    // Shop upgrades get more expensive with every prestige; masteries keep their own curve.
    return Math.round(u.baseCost * Math.pow(u.costGrowth, this.level(u.id)) * (u.persistent ? 1 : this.costMult()));
  }
  upgradeStatus(u) {
    const l = this.level(u.id);
    if (u.id === 'extra_table') {
      const n = this.groupSize();
      return 'Tables: ' + PS.World.tablesUnlocked(this) + ' / ' + this.slots.length + (n > 1 ? '  (' + n + ' seats each)' : '');
    }
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
    if (!t || this.state.gold < this.hireCost(t) || this.state.level < t.minShopLevel) return false;
    this.addGold(-this.hireCost(t));
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
    return Math.round(b.workerUpgradeBase * Math.pow(b.workerUpgradeGrowth, lvl) * (1 + 0.6 * (index - 1)) * this.costMult());
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
    while (s.xp >= PS.xpForLevel(s.level) && s.level < 999) {
      s.xp -= PS.xpForLevel(s.level);
      s.level += 1;
      leveled = true;
      s.gems += PS.data.balance.levelGems;
      for (const r of PS.data.recipes) if (r.unlockLevel === s.level && r.prestige <= s.prestige) newRecipes.push(r);
      for (const ing of PS.data.ingredients) {
        if (ing.unlockLevel === s.level && ing.prestige <= s.prestige && !ing.rare) {
          s.inventory[ing.id] = Math.min(this.storageCap(), (s.inventory[ing.id] || 0) + 4);
        }
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
  // Apprentices keep earning (at a reduced rate) while the game is closed,
  // for up to two hours.
  checkOffline() {
    const s = this.state;
    const apprentices = s.workers.length;
    if (!apprentices || !s.lastSeen) return;
    const seconds = Math.min((Date.now() - s.lastSeen) / 1000, 7200);
    if (seconds < 120) return;
    const gold = Math.round((seconds / 60) * s.incomeRate * (0.15 + 0.1 * apprentices));
    if (gold > 0) PS.UI.open(this, 'offline', { gold, seconds });
  }
  saveNow() {
    this.state.lastSeen = Date.now();
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
    const flag = (k) => (s && typeof s[k] === 'boolean' ? s[k] : true);
    return { shadows: flag('shadows'), sound: flag('sound'), music: flag('music') };
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
    // Paused while a rewarded ad is on screen.
    const steps = PS.adPlaying ? 0 : PS.simSteps || 1;
    for (let i = 0; i < steps; i++) {
      this.time += dt;
      PS.World.updateCustomers(this, dt);
      PS.Workers.update(this, dt);
      PS.Brewing.update(this, dt);
      PS.FX.update(this, dt);
    }
    PS.UI.update(this, dt);
    PS.Tutorial.update(this, dt);
    // Recent income per minute (used for offline earnings).
    this.incomeTimer += dt;
    if (this.incomeTimer >= 60) {
      const perMinute = ((this.state.earned - this.earnedMark) * 60) / this.incomeTimer;
      this.state.incomeRate = this.state.incomeRate ? this.state.incomeRate * 0.6 + perMinute * 0.4 : perMinute;
      this.incomeTimer = 0;
      this.earnedMark = this.state.earned;
    }
    this.saveTimer += dt;
    if (this.saveTimer > 8 && this.needSave) this.saveNow();
  }
};
