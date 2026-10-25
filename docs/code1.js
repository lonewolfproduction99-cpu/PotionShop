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


gdjs.GardenCode.userFunc0x949b30 = function GDJSInlineCode(runtimeScene) {
"use strict";
if (gdjs.PotionShop && gdjs.PotionShop.util) {
// ===== Potion Shop: herb garden =====
// An optional scene pushed on top of the (paused) shop. Plots grow herbs over
// real time; tap a ripe plant to gather it (circular progress), rare herbs
// glow. The well gives Moonwater. Herbs go straight to the shop's pantry.
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
};

PS.Garden = class {
  constructor(scene) {
    this.scene = scene;
    this.shop = PS.game; // the paused shop game: its pantry and save
    this.time = 0;
    this.fx = [];
    this.ui = { hud: { items: [], hits: [] }, panel: null, floats: [], toast: null, wasDown: false };
    this.gathering = null;
    this.waiting = [];
    PS.proj.scene = scene;
    PS.setupCamera(scene);
    const st = this.shop.state;
    this.plots = scene
      .getObjects('Plot')
      .map((o) => ({ obj: o, order: PS.varNum(o, 'Order', 0), x: o.getX(), y: o.getY(), isWell: false }))
      .sort((a, b) => a.order - b.order);
    const well = scene.getObjects('Waypoint').find((w) => PS.varStr(w, 'Kind', '') === 'well');
    if (well) this.plots.push({ obj: null, x: well.getX(), y: well.getY(), isWell: true });
    // Restore or create plot states (stored with the shop's save).
    const now = Date.now();
    this.plots.forEach((p, i) => {
      if (!st.garden[i]) st.garden[i] = { herb: p.isWell ? 'moonwater' : this.rollHerb(), readyAt: now };
      p.state = st.garden[i];
      if (p.isWell) p.state.herb = 'moonwater';
      this.makePlant(p);
    });
    this.buildHud();
  }

  // Herbs that can grow: unlocked garden herbs, sometimes a rare one.
  rollHerb() {
    const b = PS.data.balance;
    if (Math.random() < b.gardenRareChance) return Math.random() < 0.5 ? 'starbloom' : 'glowcap';
    const level = this.shop.state.level;
    const pool = PS.data.ingredients.filter(
      (i) => !i.rare && PS.GARDEN_PLANTS[i.id] && i.unlockLevel <= level
    );
    return U.pick(pool).id;
  }

  makePlant(p) {
    if (p.plant) PS.destroy(p.plant);
    p.plant = null;
    if (p.isWell) return;
    p.plant = PS.create(this.scene, PS.GARDEN_PLANTS[p.state.herb], p.x, p.y, '');
    p.plant.setZ(6);
    p.plant.setAngle(U.rand(-30, 30));
    p.baseW = p.plant.getWidth();
    p.baseH = p.plant.getHeight();
    p.baseD = p.plant.getDepth();
  }

  growth(p) {
    const left = p.state.readyAt - Date.now();
    return U.clamp(1 - left / (PS.data.balance.gardenRegrow * 1000), 0, 1);
  }

  buildHud() {
    const UI = PS.UI;
    const L = this.ui.hud.items;
    const W = UI.W(this);
    const H = UI.H(this);
    UI.panelBox(this, 'PanelWood', 12, 12, W - 24, 112, L, 10);
    UI.icon(this, 'icon_garden', 64, 66, 64, L, 'UI', 11);
    UI.text(this, 'Herb Garden', 110, 28, W - 150, 38, '58;36;24', 'left', L, 'UI', 11);
    UI.text(this, 'Tap ripe plants to gather. Rare herbs glow! Plants regrow over time.', 110, 72, W - 150, 20,
      '140;110;84', 'left', L, 'UI', 11);
    const P = { items: L, hits: this.ui.hud.hits };
    UI.button(this, P, W / 2 - 170, H - 120, 340, 92, 'BtnBlue', 'Back to the shop', {
      tag: 'back',
      icon: 'icon_back',
      iconSize: 56,
      size: 32,
      onTap: () => this.leave(),
    });
    // Pantry counts for gatherable herbs
    this.counts = [];
    const ids = Object.keys(PS.GARDEN_PLANTS).concat(['moonwater']);
    const cw = (W - 24) / ids.length;
    ids.forEach((id, i) => {
      const x = 12 + i * cw;
      UI.panelBox(this, 'PanelDark', x + 2, 132, cw - 4, 70, L, 10);
      UI.icon(this, PS.data.ingredientById[id].icon, x + cw / 2, 156, 38, L, 'UI', 11);
      this.counts.push([id, UI.text(this, '0', x, 176, cw, 20, '255;255;255', 'center', L, 'UI', 11)]);
    });
  }

  leave() {
    this.shop.saveNow();
    this.scene.requestChange(gdjs.SceneChangeRequest.POP_SCENE);
  }

  tap(x, y) {
    for (let i = this.ui.hud.hits.length - 1; i >= 0; i--) {
      const h = this.ui.hud.hits[i];
      if (PS.UI.inside(h, x, y)) return h.fn();
    }
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
    if (this.growth(best) < 1) {
      PS.UI.toast(this, 'Still growing: ready in ' + U.formatTime((best.state.readyAt - Date.now()) / 1000));
      return;
    }
    if (this.gathering === best || this.waiting.includes(best)) return;
    if (this.gathering) this.waiting.push(best);
    else this.startGather(best);
    PS.Audio.play(this.shop, 'tap');
  }

  startGather(p) {
    this.gathering = p;
    p.t = 0;
    p.dur = p.isWell ? 1.2 : 1.0;
  }

  finishGather(p) {
    const st = this.shop.state;
    const herb = PS.data.ingredientById[p.state.herb];
    const amount = herb.rare ? 1 : 2 + (st.level >= 5 ? 1 : 0);
    const cap = this.shop.storageCap();
    const have = st.inventory[herb.id] || 0;
    if (have >= cap) {
      PS.UI.toast(this, 'Pantry is full of ' + herb.name);
      return;
    }
    const got = Math.min(amount, cap - have);
    st.inventory[herb.id] = have + got;
    PS.UI.floatText(this, p.x, p.y, 60, '+' + got + ' ' + herb.name, herb.icon);
    PS.FX.sparkleAt(this, p.x, p.y, 30);
    PS.Audio.play(this.shop, herb.rare ? 'levelup' : 'pluck');
    p.state.readyAt = Date.now() + PS.data.balance.gardenRegrow * 1000;
    if (!p.isWell) {
      p.state.herb = this.rollHerb();
      this.makePlant(p);
    }
    this.shop.requestSave();
  }

  handleInput() {
    const im = this.scene.getGame().getInputManager();
    const down = im.isMouseButtonPressed(0);
    const released = im.isMouseButtonReleased(0);
    const pt = this.scene.getLayer('UI').convertCoords(im.getCursorX(), im.getCursorY(), 0);
    if (down && !this.ui.wasDown) {
      this.pressX = pt[0];
      this.pressY = pt[1];
    }
    if (!down && (this.ui.wasDown || released)) {
      if (this.ui.wasDown) this.tap(this.pressX, this.pressY);
      else this.tap(pt[0], pt[1]);
    }
    this.ui.wasDown = down;
  }

  update() {
    const dt = Math.min(0.1, this.scene.getElapsedTime() / 1000);
    this.time += dt;
    PS.proj.scene = this.scene;
    this.handleInput();
    // Plant growth, ripe sparkle and timers
    for (const p of this.plots) {
      const g = this.growth(p);
      p.ui = p.ui || {};
      if (p.plant) {
        const s = 0.3 + 0.7 * g;
        const bob = g >= 1 ? 1 + 0.04 * Math.sin(this.time * 4 + p.x) : 1;
        p.plant.setWidth(p.baseW * s);
        p.plant.setHeight(p.baseH * s);
        p.plant.setDepth(p.baseD * s * bob);
      }
      const scr = PS.proj.toScreen(p.x, p.y, p.isWell ? 90 : 62);
      const tag = PS.UI.ensure(this, p.ui, 'tag', 'Icon', 3);
      const txt = PS.UI.ensure(this, p.ui, 'txt', 'UiText', 4);
      if (!scr) continue;
      if (g >= 1) {
        txt.hide(true);
        tag.hide(false);
        const herb = PS.data.ingredientById[p.state.herb];
        tag.setAnimationName(herb.icon);
        const sz = 42 + 4 * Math.sin(this.time * 5 + p.x);
        tag.setWidth(sz);
        tag.setHeight(sz);
        tag.setPosition(scr[0] - sz / 2, scr[1] - sz / 2);
        if (herb.rare && Math.random() < dt * 3) {
          PS.FX.bubble(this, p.x + U.rand(-20, 20), p.y + U.rand(-20, 20), 30, '255;240;160', 30, 0.8, 4);
        }
      } else {
        tag.hide(true);
        txt.hide(false);
        txt.setText(U.formatTime((p.state.readyAt - Date.now()) / 1000));
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
    // Gathering with a circular progress ring
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
    for (const [id, t] of this.counts) t.setText(String(this.shop.state.inventory[id] || 0));
    PS.FX.update(this, dt);
    PS.UI.updateTransient(this, dt);
  }
};

}

};
gdjs.GardenCode.userFunc0x8e6958 = function GDJSInlineCode(runtimeScene) {
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


gdjs.GardenCode.userFunc0x949b30(runtimeScene);

}


{


gdjs.GardenCode.userFunc0x8e6958(runtimeScene);

}


};gdjs.GardenCode.userFunc0x8bacc0 = function GDJSInlineCode(runtimeScene) {
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


gdjs.GardenCode.userFunc0x8bacc0(runtimeScene);

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
