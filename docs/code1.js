gdjs.GardenCode = {};
gdjs.GardenCode.localVariables = [];
gdjs.GardenCode.idToCallbackMap = new Map();
gdjs.GardenCode.GDGardenObjects1= [];
gdjs.GardenCode.GDGardenObjects2= [];
gdjs.GardenCode.GDPlotObjects1= [];
gdjs.GardenCode.GDPlotObjects2= [];
gdjs.GardenCode.GDPlantRedleafObjects1= [];
gdjs.GardenCode.GDPlantRedleafObjects2= [];
gdjs.GardenCode.GDPlantSunrootObjects1= [];
gdjs.GardenCode.GDPlantSunrootObjects2= [];
gdjs.GardenCode.GDPlantSparkdustObjects1= [];
gdjs.GardenCode.GDPlantSparkdustObjects2= [];
gdjs.GardenCode.GDPlantBluecapObjects1= [];
gdjs.GardenCode.GDPlantBluecapObjects2= [];
gdjs.GardenCode.GDPlantIronrootObjects1= [];
gdjs.GardenCode.GDPlantIronrootObjects2= [];
gdjs.GardenCode.GDPlantSwiftmintObjects1= [];
gdjs.GardenCode.GDPlantSwiftmintObjects2= [];
gdjs.GardenCode.GDPlantStarbloomObjects1= [];
gdjs.GardenCode.GDPlantStarbloomObjects2= [];
gdjs.GardenCode.GDPlantGlowcapObjects1= [];
gdjs.GardenCode.GDPlantGlowcapObjects2= [];
gdjs.GardenCode.GDPlantFrostberryObjects1= [];
gdjs.GardenCode.GDPlantFrostberryObjects2= [];
gdjs.GardenCode.GDPlantEmberpepperObjects1= [];
gdjs.GardenCode.GDPlantEmberpepperObjects2= [];
gdjs.GardenCode.GDPlantShadowmossObjects1= [];
gdjs.GardenCode.GDPlantShadowmossObjects2= [];
gdjs.GardenCode.GDPlantLuckycloverObjects1= [];
gdjs.GardenCode.GDPlantLuckycloverObjects2= [];
gdjs.GardenCode.GDPlantDragonscaleObjects1= [];
gdjs.GardenCode.GDPlantDragonscaleObjects2= [];
gdjs.GardenCode.GDBubbleObjects1= [];
gdjs.GardenCode.GDBubbleObjects2= [];
gdjs.GardenCode.GDNavBlockObjects1= [];
gdjs.GardenCode.GDNavBlockObjects2= [];
gdjs.GardenCode.GDWaypointObjects1= [];
gdjs.GardenCode.GDWaypointObjects2= [];
gdjs.GardenCode.GDIconObjects1= [];
gdjs.GardenCode.GDIconObjects2= [];
gdjs.GardenCode.GDRingFillObjects1= [];
gdjs.GardenCode.GDRingFillObjects2= [];
gdjs.GardenCode.GDRingBackObjects1= [];
gdjs.GardenCode.GDRingBackObjects2= [];
gdjs.GardenCode.GDSpeechBubbleObjects1= [];
gdjs.GardenCode.GDSpeechBubbleObjects2= [];
gdjs.GardenCode.GDGlowObjects1= [];
gdjs.GardenCode.GDGlowObjects2= [];
gdjs.GardenCode.GDPanelWoodObjects1= [];
gdjs.GardenCode.GDPanelWoodObjects2= [];
gdjs.GardenCode.GDPanelParchmentObjects1= [];
gdjs.GardenCode.GDPanelParchmentObjects2= [];
gdjs.GardenCode.GDPanelDarkObjects1= [];
gdjs.GardenCode.GDPanelDarkObjects2= [];
gdjs.GardenCode.GDBtnGreenObjects1= [];
gdjs.GardenCode.GDBtnGreenObjects2= [];
gdjs.GardenCode.GDBtnGoldObjects1= [];
gdjs.GardenCode.GDBtnGoldObjects2= [];
gdjs.GardenCode.GDBtnRedObjects1= [];
gdjs.GardenCode.GDBtnRedObjects2= [];
gdjs.GardenCode.GDBtnGrayObjects1= [];
gdjs.GardenCode.GDBtnGrayObjects2= [];
gdjs.GardenCode.GDBtnBlueObjects1= [];
gdjs.GardenCode.GDBtnBlueObjects2= [];
gdjs.GardenCode.GDBtnPurpleObjects1= [];
gdjs.GardenCode.GDBtnPurpleObjects2= [];
gdjs.GardenCode.GDBarBackObjects1= [];
gdjs.GardenCode.GDBarBackObjects2= [];
gdjs.GardenCode.GDBarFillObjects1= [];
gdjs.GardenCode.GDBarFillObjects2= [];
gdjs.GardenCode.GDUiTextObjects1= [];
gdjs.GardenCode.GDUiTextObjects2= [];


gdjs.GardenCode.userFunc0x9c4ce0 = function GDJSInlineCode(runtimeScene) {
"use strict";
if (gdjs.PotionShop && gdjs.PotionShop.util) {
// ===== Potion Shop: herb garden =====
// An optional scene pushed on top of the (paused) shop.
// - Tap an empty plot to choose a herb to plant (costs a few gold for seeds).
// - Herbs grow over real time; rarer herbs take longer. Growing plots can be
//   finished early with gems, gold or a rewarded ad (daily limit).
// - Tap a ripe plant to harvest it (circular progress). Harvests sometimes
//   drop a special herb (Starbloom or Glowcap).
// - The well gives Moonwater and refills by itself.
// Herbs go straight to the shop's pantry.
const PS = gdjs.PotionShop;
const U = PS.util;

PS.GARDEN_PLANTS = {
  redleaf: 'PlantRedleaf',
  sunroot: 'PlantSunroot',
  sparkdust: 'PlantSparkdust',
  bluecap: 'PlantBluecap',
  ironroot: 'PlantIronroot',
  swiftmint: 'PlantSwiftmint',
  starbloom: 'PlantStarbloom',
  glowcap: 'PlantGlowcap',
  frostberry: 'PlantFrostberry',
  emberpepper: 'PlantEmberpepper',
  shadowmoss: 'PlantShadowmoss',
  luckyclover: 'PlantLuckyclover',
  dragonscale: 'PlantDragonscale',
};

PS.Garden = class {
  constructor(scene) {
    this.scene = scene;
    this.shop = PS.game; // the paused shop game: its pantry and save
    this.time = 0;
    this.fx = [];
    this.ui = { hud: { items: [], hits: [] }, panel: null, floats: [], toast: null, wasDown: false, scroll: 0,
      refreshTimer: 0, dirty: false };
    this.gathering = null;
    this.waiting = [];
    PS.proj.scene = scene;
    PS.setupCamera(scene);
    const st = this.state;
    this.plots = scene
      .getObjects('Plot')
      .map((o) => ({ obj: o, order: PS.varNum(o, 'Order', 0), x: o.getX(), y: o.getY(), isWell: false }))
      .sort((a, b) => a.order - b.order);
    const well = scene.getObjects('Waypoint').find((w) => PS.varStr(w, 'Kind', '') === 'well');
    if (well) this.plots.push({ obj: null, x: well.getX(), y: well.getY(), isWell: true });
    // Restore plot states (stored with the shop's save). Plots start empty.
    this.plots.forEach((p, i) => {
      if (!st.garden[i]) st.garden[i] = { herb: p.isWell ? 'moonwater' : null, readyAt: Date.now(), planted: p.isWell };
      p.state = st.garden[i];
      if (p.isWell) {
        // Saves from before Milestone 6 had no `planted` flag: the well always grows Moonwater.
        p.state.herb = 'moonwater';
        p.state.planted = true;
      }
      this.makePlant(p);
    });
    this.buildHud();
    PS.Tutorial.init(this); // the garden part of the tutorial
  }

  // The shop's state and settings (so shared interface code works here too).
  get state() {
    return this.shop.state;
  }
  get settings() {
    return this.shop.settings;
  }
  prestige() {
    return this.shop.prestige();
  }

  // Herbs that can be planted: unlocked, not rare.
  plantable() {
    const s = this.state;
    return PS.data.ingredients.filter(
      (i) => !i.rare && PS.GARDEN_PLANTS[i.id] && i.unlockLevel <= s.level && i.prestige <= s.prestige
    );
  }
  growTime(herbId) {
    return PS.data.ingredientById[herbId].growTime;
  }
  seedCost(ing) {
    return Math.max(1, Math.round(ing.cost * 2 * this.shop.herbCostMult()));
  }

  makePlant(p) {
    if (p.plant) PS.destroy(p.plant);
    p.plant = null;
    if (p.isWell || !p.state.planted || !p.state.herb) return;
    p.plant = PS.create(this.scene, PS.GARDEN_PLANTS[p.state.herb], p.x, p.y, '');
    p.plant.setZ(6);
    p.plant.setAngle(U.rand(-30, 30));
    p.baseW = p.plant.getWidth();
    p.baseH = p.plant.getHeight();
    p.baseD = p.plant.getDepth();
  }

  // 0..1 growth, or -1 for an empty plot.
  growth(p) {
    if (!p.state.planted) return -1;
    const total = (p.isWell ? PS.data.balance.gardenRegrow : this.growTime(p.state.herb)) * 1000;
    const left = p.state.readyAt - Date.now();
    return U.clamp(1 - left / total, 0, 1);
  }
  secondsLeft(p) {
    return Math.max(0, (p.state.readyAt - Date.now()) / 1000);
  }

  plant(p, ing) {
    const cost = this.seedCost(ing);
    if (this.state.gold < cost) {
      PS.UI.toast(this, 'Not enough gold for seeds');
      return false;
    }
    this.shop.addGold(-cost);
    p.state.herb = ing.id;
    p.state.planted = true;
    p.state.readyAt = Date.now() + this.growTime(ing.id) * 1000;
    this.makePlant(p);
    PS.FX.sparkleAt(this, p.x, p.y, 10);
    PS.Audio.play(this, 'pluck');
    this.shop.requestSave();
    return true;
  }

  // Speed-ups for a growing plot.
  finishNow(p) {
    p.state.readyAt = Date.now();
    PS.FX.sparkleAt(this, p.x, p.y, 20);
    this.shop.requestSave();
  }
  gemCost(p) {
    return Math.max(1, Math.ceil(this.secondsLeft(p) / 60));
  }
  goldCost(p) {
    const ing = PS.data.ingredientById[p.state.herb];
    return Math.max(5, Math.ceil(this.secondsLeft(p) / 30) * this.seedCost(ing));
  }
  halveTime(p) {
    p.state.readyAt = Date.now() + (this.secondsLeft(p) * 1000) / 2;
    this.shop.requestSave();
  }

  buildHud() {
    const UI = PS.UI;
    const L = this.ui.hud.items;
    const W = UI.W(this);
    const H = UI.H(this);
    UI.panelBox(this, 'PanelWood', 12, 12, W - 24, 112, L, 10);
    UI.icon(this, 'icon_garden', 64, 66, 64, L, 'UI', 11);
    UI.text(this, 'Herb Garden', 110, 24, 300, 38, '58;36;24', 'left', L, 'UI', 11);
    UI.text(this, 'Tap a plot to plant. Rarer herbs grow slower. Harvests may drop special herbs!', 110, 70, W - 150,
      20, '140;110;84', 'left', L, 'UI', 11);
    UI.icon(this, 'icon_coin', W - 230, 42, 32, L, 'UI', 11);
    this.goldText = UI.text(this, '0', W - 210, 28, 90, 26, '170;120;20', 'left', L, 'UI', 11);
    UI.icon(this, 'icon_quality', W - 110, 42, 30, L, 'UI', 11);
    this.gemText = UI.text(this, '0', W - 90, 28, 70, 26, '60;110;160', 'left', L, 'UI', 11);
    const P = { items: L, hits: this.ui.hud.hits };
    UI.button(this, P, W / 2 - 170, UI.bottom(this) - 120, 340, 92, 'BtnBlue', 'Back to the shop', {
      tag: 'back',
      icon: 'icon_back',
      iconSize: 56,
      size: 32,
      onTap: () => this.leave(),
    });
    // Pantry counts for garden herbs
    this.counts = [];
    const ids = this.plantable().map((i) => i.id).concat(['moonwater', 'starbloom', 'glowcap']).slice(0, 10);
    const cw = (W - 24) / ids.length;
    ids.forEach((id, i) => {
      const x = 12 + i * cw;
      UI.panelBox(this, 'PanelDark', x + 2, 132, cw - 4, 70, L, 10);
      UI.icon(this, PS.data.ingredientById[id].icon, x + cw / 2, 156, 38, L, 'UI', 11);
      this.counts.push([id, UI.text(this, '0', x, 176, cw, 20, '255;255;255', 'center', L, 'UI', 11)]);
    });
  }

  leave() {
    PS.UI.close(this);
    this.shop.saveNow();
    this.scene.requestChange(gdjs.SceneChangeRequest.POP_SCENE);
  }

  // Taps that are not on the interface (called by PS.UI.tap).
  worldTap(x, y) {
    let best = null;
    let bestD = 85;
    for (const p of this.plots) {
      const s = PS.proj.toScreen(p.x, p.y, p.isWell ? 40 : 25);
      if (!s) continue;
      const d = Math.hypot(s[0] - x, s[1] - y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (!best) return;
    const g = this.growth(best);
    if (g < 0) return PS.UI.open(this, 'plant', { plot: best });
    if (g < 1) {
      if (best.isWell) return PS.UI.toast(this, 'The well refills in ' + U.formatTime(this.secondsLeft(best)));
      return PS.UI.open(this, 'speedup', { plot: best });
    }
    if (this.gathering === best || this.waiting.includes(best)) return;
    if (this.gathering) this.waiting.push(best);
    else this.startGather(best);
    PS.Audio.play(this, 'tap');
  }

  startGather(p) {
    this.gathering = p;
    p.t = 0;
    p.dur = p.isWell ? 1.2 : 1.0;
  }

  finishGather(p) {
    const st = this.state;
    const herb = PS.data.ingredientById[p.state.herb];
    const cap = this.shop.storageCap();
    const have = st.inventory[herb.id] || 0;
    if (have >= cap) {
      PS.UI.toast(this, 'Pantry is full of ' + herb.name);
      return;
    }
    const amount = p.isWell ? 2 : 4 + (st.level >= 8 ? 1 : 0);
    const got = Math.min(amount, cap - have);
    st.inventory[herb.id] = have + got;
    PS.UI.floatText(this, p.x, p.y, 60, '+' + got + ' ' + herb.name, herb.icon);
    PS.FX.sparkleAt(this, p.x, p.y, 30);
    PS.Audio.play(this, 'pluck');
    // A lucky harvest leaves a special herb behind.
    if (!p.isWell && Math.random() < PS.data.balance.harvestRareChance) {
      const rare = PS.data.ingredientById[Math.random() < 0.5 ? 'starbloom' : 'glowcap'];
      if ((st.inventory[rare.id] || 0) < cap) {
        st.inventory[rare.id] = (st.inventory[rare.id] || 0) + 1;
        PS.UI.floatText(this, p.x, p.y, 100, 'Special herb: ' + rare.name + '!', rare.icon);
        PS.Audio.play(this, 'levelup');
      }
    }
    if (p.isWell) {
      p.state.readyAt = Date.now() + PS.data.balance.gardenRegrow * 1000;
    } else {
      p.state.planted = false;
      p.state.herb = null;
      this.makePlant(p);
    }
    this.shop.requestSave();
  }

  update() {
    const dt = Math.min(0.1, this.scene.getElapsedTime() / 1000);
    this.time += dt;
    PS.proj.scene = this.scene;
    PS.UI.handleInput(this);
    for (const p of this.plots) {
      const g = this.growth(p);
      p.ui = p.ui || {};
      if (p.plant) {
        const s = 0.3 + 0.7 * Math.max(0, g);
        const bob = g >= 1 ? 1 + 0.04 * Math.sin(this.time * 4 + p.x) : 1;
        p.plant.setWidth(p.baseW * s);
        p.plant.setHeight(p.baseH * s);
        p.plant.setDepth(p.baseD * s * bob);
      }
      const scr = PS.proj.toScreen(p.x, p.y, p.isWell ? 90 : 62);
      const tag = PS.UI.ensure(this, p.ui, 'tag', 'Icon', 3);
      const txt = PS.UI.ensure(this, p.ui, 'txt', 'UiText', 4);
      if (!scr) continue;
      if (g >= 1 || g < 0) {
        txt.hide(true);
        tag.hide(false);
        const sz = g < 0 ? 34 : 42 + 4 * Math.sin(this.time * 5 + p.x);
        tag.setAnimationName(g < 0 ? 'icon_plus' : PS.data.ingredientById[p.state.herb].icon);
        tag.setOpacity(g < 0 ? 200 : 255);
        tag.setWidth(sz);
        tag.setHeight(sz);
        tag.setPosition(scr[0] - sz / 2, scr[1] - sz / 2);
      } else {
        tag.hide(true);
        txt.hide(false);
        txt.setText(U.formatTime(this.secondsLeft(p)));
        txt.setCharacterSize(22);
        txt.setColor('255;255;255');
        txt.setOutlineEnabled(true);
        txt.setOutlineColor('40;24;16');
        txt.setOutlineThickness(3);
        txt.setTextAlignment('center');
        txt.setWrapping(true);
        txt.setWrappingWidth(100);
        txt.setPosition(scr[0] - 50, scr[1] - 14);
      }
    }
    // Harvesting with a circular progress ring
    const p = this.gathering;
    if (p) {
      p.t += dt;
      PS.UI.ring(this, p.ui, p.x, p.y, p.isWell ? 110 : 80, p.t / p.dur, '120;220;110', 'icon_garden');
      if (p.t >= p.dur) {
        PS.UI.hideRing(p.ui);
        this.gathering = null;
        this.finishGather(p);
        if (this.waiting.length) this.startGather(this.waiting.shift());
      }
    }
    for (const [id, t] of this.counts) t.setText(String(this.state.inventory[id] || 0));
    this.goldText.setText(U.formatGold(this.state.gold));
    this.gemText.setText(U.formatGold(this.state.gems));
    PS.FX.update(this, dt);
    PS.UI.updateTransient(this, dt);
    PS.Tutorial.update(this, dt);
    // Panels with timers refresh twice per second.
    this.ui.refreshTimer -= dt;
    if (this.ui.panel && this.ui.refreshTimer <= 0) {
      this.ui.refreshTimer = 0.5;
      if (this.ui.panel.name !== 'plant') PS.UI.rebuild(this);
    }
  }
};

// Garden panels (built with the shared interface helpers).
PS.GardenUI = {
  buildPlant(G, P) {
    const UI = PS.UI;
    const area = UI.frame(G, P, 'Plant a herb', 900);
    const rows = G.plantable().map((ing) => (x, y, w, h) => {
      const cost = G.seedCost(ing);
      UI.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
      UI.icon(G, ing.icon, x + 44, y + h / 2, 64, P.items, 'UI', 17);
      UI.text(G, ing.name, x + 88, y + 12, 240, 28, '58;36;24', 'left', P.items, 'UI', 17);
      UI.text(G, 'Grows in ' + U.formatTime(G.growTime(ing.id)) + ' · gives 4', x + 88, y + 50, 300, 22, '140;110;84',
        'left', P.items, 'UI', 17);
      UI.button(G, P, x + w - 200, y + 14, 190, h - 28, 'BtnGreen', 'Plant ' + U.formatGold(cost) + 'g', {
        tag: 'plant:' + ing.id,
        size: 24,
        disabled: G.state.gold < cost,
        onTap: () => {
          if (G.plant(P.params.plot, ing)) UI.close(G);
        },
        onDisabled: () => UI.toast(G, 'Not enough gold for seeds'),
      });
    });
    UI.list(G, P, area, 108, rows);
  },

  buildSpeedup(G, P) {
    const UI = PS.UI;
    const p = P.params.plot;
    const herb = PS.data.ingredientById[p.state.herb];
    const area = UI.frame(G, P, herb.name + ' is growing', 700);
    if (G.growth(p) >= 1) {
      UI.text(G, 'Ready to harvest! Tap the plant.', area.x, area.y + 20, area.w, 28, '72;160;72', 'center', P.items, 'UI', 17);
      return;
    }
    UI.icon(G, herb.icon, area.x + 60, area.y + 50, 90, P.items, 'UI', 17);
    UI.text(G, 'Ready in ' + U.formatTime(G.secondsLeft(p)), area.x + 130, area.y + 30, area.w - 130, 32, '58;36;24',
      'left', P.items, 'UI', 17);
    const gems = G.gemCost(p);
    const gold = G.goldCost(p);
    let y = area.y + 130;
    UI.button(G, P, area.x, y, area.w, 80, 'BtnBlue', 'Finish now: ' + gems + ' gems', {
      tag: 'speedGems',
      icon: 'icon_quality',
      size: 28,
      disabled: G.state.gems < gems,
      onTap: () => {
        G.state.gems -= gems;
        G.finishNow(p);
        UI.close(G);
      },
      onDisabled: () => UI.toast(G, 'Not enough gems'),
    });
    y += 96;
    UI.button(G, P, area.x, y, area.w, 80, 'BtnGold', 'Finish now: ' + U.formatGold(gold) + 'g', {
      tag: 'speedGold',
      icon: 'icon_coin',
      size: 28,
      disabled: G.state.gold < gold,
      onTap: () => {
        G.shop.addGold(-gold);
        G.finishNow(p);
        UI.close(G);
      },
      onDisabled: () => UI.toast(G, 'Not enough gold'),
    });
    y += 96;
    UI.button(G, P, area.x, y, area.w, 80, PS.Ads.available(G) ? 'BtnPurple' : 'BtnGray',
      PS.Ads.label(G, 'Watch an ad: half the time'), {
      tag: 'speedAd',
      icon: 'icon_ad',
      size: 24,
      disabled: !PS.Ads.available(G),
      onTap: () => PS.Ads.watch(G, 'Grow ' + herb.name + ' twice as fast', () => G.halveTime(p), 'garden_speedup'),
      onDisabled: () => UI.toast(G, PS.Ads.unavailableText(G)),
    });
  },
};

}

};
gdjs.GardenCode.userFunc0x9fc018 = function GDJSInlineCode(runtimeScene) {
"use strict";
// The garden needs the shop systems: start from the shop if they are missing.
const PS = gdjs.PotionShop;
if (!PS || !PS.game) {
  runtimeScene.requestChange(gdjs.SceneChangeRequest.REPLACE_SCENE, 'Shop');
} else {
  runtimeScene.__garden = new PS.Garden(runtimeScene);
}

};
gdjs.GardenCode.eventsList0 = function(runtimeScene) {

{


gdjs.GardenCode.userFunc0x9c4ce0(runtimeScene);

}


{


gdjs.GardenCode.userFunc0x9fc018(runtimeScene);

}


};gdjs.GardenCode.userFunc0x8ecd28 = function GDJSInlineCode(runtimeScene) {
"use strict";
const garden = runtimeScene.__garden;
if (garden) garden.update();

};
gdjs.GardenCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {

{ //Subevents
gdjs.GardenCode.eventsList0(runtimeScene);} //End of subevents
}

}


{


gdjs.GardenCode.userFunc0x8ecd28(runtimeScene);

}


};

gdjs.GardenCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.GardenCode.GDGardenObjects1.length = 0;
gdjs.GardenCode.GDGardenObjects2.length = 0;
gdjs.GardenCode.GDPlotObjects1.length = 0;
gdjs.GardenCode.GDPlotObjects2.length = 0;
gdjs.GardenCode.GDPlantRedleafObjects1.length = 0;
gdjs.GardenCode.GDPlantRedleafObjects2.length = 0;
gdjs.GardenCode.GDPlantSunrootObjects1.length = 0;
gdjs.GardenCode.GDPlantSunrootObjects2.length = 0;
gdjs.GardenCode.GDPlantSparkdustObjects1.length = 0;
gdjs.GardenCode.GDPlantSparkdustObjects2.length = 0;
gdjs.GardenCode.GDPlantBluecapObjects1.length = 0;
gdjs.GardenCode.GDPlantBluecapObjects2.length = 0;
gdjs.GardenCode.GDPlantIronrootObjects1.length = 0;
gdjs.GardenCode.GDPlantIronrootObjects2.length = 0;
gdjs.GardenCode.GDPlantSwiftmintObjects1.length = 0;
gdjs.GardenCode.GDPlantSwiftmintObjects2.length = 0;
gdjs.GardenCode.GDPlantStarbloomObjects1.length = 0;
gdjs.GardenCode.GDPlantStarbloomObjects2.length = 0;
gdjs.GardenCode.GDPlantGlowcapObjects1.length = 0;
gdjs.GardenCode.GDPlantGlowcapObjects2.length = 0;
gdjs.GardenCode.GDPlantFrostberryObjects1.length = 0;
gdjs.GardenCode.GDPlantFrostberryObjects2.length = 0;
gdjs.GardenCode.GDPlantEmberpepperObjects1.length = 0;
gdjs.GardenCode.GDPlantEmberpepperObjects2.length = 0;
gdjs.GardenCode.GDPlantShadowmossObjects1.length = 0;
gdjs.GardenCode.GDPlantShadowmossObjects2.length = 0;
gdjs.GardenCode.GDPlantLuckycloverObjects1.length = 0;
gdjs.GardenCode.GDPlantLuckycloverObjects2.length = 0;
gdjs.GardenCode.GDPlantDragonscaleObjects1.length = 0;
gdjs.GardenCode.GDPlantDragonscaleObjects2.length = 0;
gdjs.GardenCode.GDBubbleObjects1.length = 0;
gdjs.GardenCode.GDBubbleObjects2.length = 0;
gdjs.GardenCode.GDNavBlockObjects1.length = 0;
gdjs.GardenCode.GDNavBlockObjects2.length = 0;
gdjs.GardenCode.GDWaypointObjects1.length = 0;
gdjs.GardenCode.GDWaypointObjects2.length = 0;
gdjs.GardenCode.GDIconObjects1.length = 0;
gdjs.GardenCode.GDIconObjects2.length = 0;
gdjs.GardenCode.GDRingFillObjects1.length = 0;
gdjs.GardenCode.GDRingFillObjects2.length = 0;
gdjs.GardenCode.GDRingBackObjects1.length = 0;
gdjs.GardenCode.GDRingBackObjects2.length = 0;
gdjs.GardenCode.GDSpeechBubbleObjects1.length = 0;
gdjs.GardenCode.GDSpeechBubbleObjects2.length = 0;
gdjs.GardenCode.GDGlowObjects1.length = 0;
gdjs.GardenCode.GDGlowObjects2.length = 0;
gdjs.GardenCode.GDPanelWoodObjects1.length = 0;
gdjs.GardenCode.GDPanelWoodObjects2.length = 0;
gdjs.GardenCode.GDPanelParchmentObjects1.length = 0;
gdjs.GardenCode.GDPanelParchmentObjects2.length = 0;
gdjs.GardenCode.GDPanelDarkObjects1.length = 0;
gdjs.GardenCode.GDPanelDarkObjects2.length = 0;
gdjs.GardenCode.GDBtnGreenObjects1.length = 0;
gdjs.GardenCode.GDBtnGreenObjects2.length = 0;
gdjs.GardenCode.GDBtnGoldObjects1.length = 0;
gdjs.GardenCode.GDBtnGoldObjects2.length = 0;
gdjs.GardenCode.GDBtnRedObjects1.length = 0;
gdjs.GardenCode.GDBtnRedObjects2.length = 0;
gdjs.GardenCode.GDBtnGrayObjects1.length = 0;
gdjs.GardenCode.GDBtnGrayObjects2.length = 0;
gdjs.GardenCode.GDBtnBlueObjects1.length = 0;
gdjs.GardenCode.GDBtnBlueObjects2.length = 0;
gdjs.GardenCode.GDBtnPurpleObjects1.length = 0;
gdjs.GardenCode.GDBtnPurpleObjects2.length = 0;
gdjs.GardenCode.GDBarBackObjects1.length = 0;
gdjs.GardenCode.GDBarBackObjects2.length = 0;
gdjs.GardenCode.GDBarFillObjects1.length = 0;
gdjs.GardenCode.GDBarFillObjects2.length = 0;
gdjs.GardenCode.GDUiTextObjects1.length = 0;
gdjs.GardenCode.GDUiTextObjects2.length = 0;

gdjs.GardenCode.eventsList1(runtimeScene);
gdjs.GardenCode.GDGardenObjects1.length = 0;
gdjs.GardenCode.GDGardenObjects2.length = 0;
gdjs.GardenCode.GDPlotObjects1.length = 0;
gdjs.GardenCode.GDPlotObjects2.length = 0;
gdjs.GardenCode.GDPlantRedleafObjects1.length = 0;
gdjs.GardenCode.GDPlantRedleafObjects2.length = 0;
gdjs.GardenCode.GDPlantSunrootObjects1.length = 0;
gdjs.GardenCode.GDPlantSunrootObjects2.length = 0;
gdjs.GardenCode.GDPlantSparkdustObjects1.length = 0;
gdjs.GardenCode.GDPlantSparkdustObjects2.length = 0;
gdjs.GardenCode.GDPlantBluecapObjects1.length = 0;
gdjs.GardenCode.GDPlantBluecapObjects2.length = 0;
gdjs.GardenCode.GDPlantIronrootObjects1.length = 0;
gdjs.GardenCode.GDPlantIronrootObjects2.length = 0;
gdjs.GardenCode.GDPlantSwiftmintObjects1.length = 0;
gdjs.GardenCode.GDPlantSwiftmintObjects2.length = 0;
gdjs.GardenCode.GDPlantStarbloomObjects1.length = 0;
gdjs.GardenCode.GDPlantStarbloomObjects2.length = 0;
gdjs.GardenCode.GDPlantGlowcapObjects1.length = 0;
gdjs.GardenCode.GDPlantGlowcapObjects2.length = 0;
gdjs.GardenCode.GDPlantFrostberryObjects1.length = 0;
gdjs.GardenCode.GDPlantFrostberryObjects2.length = 0;
gdjs.GardenCode.GDPlantEmberpepperObjects1.length = 0;
gdjs.GardenCode.GDPlantEmberpepperObjects2.length = 0;
gdjs.GardenCode.GDPlantShadowmossObjects1.length = 0;
gdjs.GardenCode.GDPlantShadowmossObjects2.length = 0;
gdjs.GardenCode.GDPlantLuckycloverObjects1.length = 0;
gdjs.GardenCode.GDPlantLuckycloverObjects2.length = 0;
gdjs.GardenCode.GDPlantDragonscaleObjects1.length = 0;
gdjs.GardenCode.GDPlantDragonscaleObjects2.length = 0;
gdjs.GardenCode.GDBubbleObjects1.length = 0;
gdjs.GardenCode.GDBubbleObjects2.length = 0;
gdjs.GardenCode.GDNavBlockObjects1.length = 0;
gdjs.GardenCode.GDNavBlockObjects2.length = 0;
gdjs.GardenCode.GDWaypointObjects1.length = 0;
gdjs.GardenCode.GDWaypointObjects2.length = 0;
gdjs.GardenCode.GDIconObjects1.length = 0;
gdjs.GardenCode.GDIconObjects2.length = 0;
gdjs.GardenCode.GDRingFillObjects1.length = 0;
gdjs.GardenCode.GDRingFillObjects2.length = 0;
gdjs.GardenCode.GDRingBackObjects1.length = 0;
gdjs.GardenCode.GDRingBackObjects2.length = 0;
gdjs.GardenCode.GDSpeechBubbleObjects1.length = 0;
gdjs.GardenCode.GDSpeechBubbleObjects2.length = 0;
gdjs.GardenCode.GDGlowObjects1.length = 0;
gdjs.GardenCode.GDGlowObjects2.length = 0;
gdjs.GardenCode.GDPanelWoodObjects1.length = 0;
gdjs.GardenCode.GDPanelWoodObjects2.length = 0;
gdjs.GardenCode.GDPanelParchmentObjects1.length = 0;
gdjs.GardenCode.GDPanelParchmentObjects2.length = 0;
gdjs.GardenCode.GDPanelDarkObjects1.length = 0;
gdjs.GardenCode.GDPanelDarkObjects2.length = 0;
gdjs.GardenCode.GDBtnGreenObjects1.length = 0;
gdjs.GardenCode.GDBtnGreenObjects2.length = 0;
gdjs.GardenCode.GDBtnGoldObjects1.length = 0;
gdjs.GardenCode.GDBtnGoldObjects2.length = 0;
gdjs.GardenCode.GDBtnRedObjects1.length = 0;
gdjs.GardenCode.GDBtnRedObjects2.length = 0;
gdjs.GardenCode.GDBtnGrayObjects1.length = 0;
gdjs.GardenCode.GDBtnGrayObjects2.length = 0;
gdjs.GardenCode.GDBtnBlueObjects1.length = 0;
gdjs.GardenCode.GDBtnBlueObjects2.length = 0;
gdjs.GardenCode.GDBtnPurpleObjects1.length = 0;
gdjs.GardenCode.GDBtnPurpleObjects2.length = 0;
gdjs.GardenCode.GDBarBackObjects1.length = 0;
gdjs.GardenCode.GDBarBackObjects2.length = 0;
gdjs.GardenCode.GDBarFillObjects1.length = 0;
gdjs.GardenCode.GDBarFillObjects2.length = 0;
gdjs.GardenCode.GDUiTextObjects1.length = 0;
gdjs.GardenCode.GDUiTextObjects2.length = 0;


return;

}

gdjs['GardenCode'] = gdjs.GardenCode;
