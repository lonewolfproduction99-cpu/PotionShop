// ===== Potion Shop: interface =====
// HUD (top), navigation (bottom), panels (brew, orders, ingredients,
// upgrades, workers, expansion, settings), world-anchored overlays
// (speech bubbles, patience bars, circular progress rings) and tap routing.
const PS = gdjs.PotionShop;
const U = PS.util;

const COLORS = {
  ink: '58;36;24',
  cream: '255;246;226',
  gold: '255;214;90',
  red: '214;64;52',
  green: '72;160;72',
  muted: '140;110;84',
};

PS.UI = {
  // ------------------------------------------------------------ primitives
  W(G) {
    return G.scene.getGame().getGameResolutionWidth();
  },
  H(G) {
    return G.scene.getGame().getGameResolutionHeight();
  },
  // Height (game units) hidden by the iPhone home indicator, from the PWA
  // layer's safe-area probe; 0 elsewhere.
  safeBottom(G) {
    const pwa = typeof window !== 'undefined' && window.PotionShopPWA;
    if (!pwa || !pwa.safeInsets) return 0;
    const css = pwa.safeInsets().bottom;
    if (!css) return 0;
    const canvas = G.scene.getGame().getRenderer().getCanvas();
    const h = (canvas && canvas.getBoundingClientRect().height) || window.innerHeight;
    return h ? (css * this.H(G)) / h : 0;
  },
  // Bottom of the usable screen area.
  bottom(G) {
    return this.H(G) - this.safeBottom(G);
  },

  obj(G, name, x, y, layer, list, z) {
    const o = PS.create(G.scene, name, x, y, layer || 'UI');
    if (z !== undefined) o.setZOrder(z);
    if (list) list.push(o);
    return o;
  },

  panelBox(G, name, x, y, w, h, list, z) {
    const o = this.obj(G, name, x, y, 'UI', list, z);
    o.setWidth(w);
    o.setHeight(h);
    return o;
  },

  icon(G, anim, cx, cy, size, list, layer, z) {
    const o = this.obj(G, 'Icon', 0, 0, layer || 'UI', list, z);
    o.setAnimationName(anim);
    o.setWidth(size);
    o.setHeight(size);
    o.setPosition(cx - size / 2, cy - size / 2);
    return o;
  },

  text(G, str, x, y, w, size, color, align, list, layer, z, outline) {
    const o = this.obj(G, 'UiText', x, y, layer || 'UI', list, z);
    o.setText(String(str));
    o.setCharacterSize(size);
    o.setColor(color || COLORS.ink);
    o.setTextAlignment(align || 'left');
    if (w) {
      o.setWrapping(true);
      o.setWrappingWidth(w);
    }
    if (outline) {
      o.setOutlineEnabled(true);
      o.setOutlineColor(outline);
      o.setOutlineThickness(Math.max(2, Math.round(size / 9)));
    }
    return o;
  },

  // `label` identifies the hit area (used by the automated tests).
  hit(list, x, y, w, h, fn, label) {
    list.push({ x, y, w, h, fn, label: label || '' });
  },

  button(G, P, x, y, w, h, style, label, opts) {
    opts = opts || {};
    const disabled = !!opts.disabled;
    const name = disabled ? 'BtnGray' : style;
    this.panelBox(G, name, x, y, w, h, P.items, 20);
    const size = opts.size || 30;
    let tx = x;
    let tw = w;
    if (opts.icon) {
      const isz = opts.iconSize || Math.min(h - 16, 44);
      this.icon(G, opts.icon, x + 10 + isz / 2, y + h / 2 - 3, isz, P.items, 'UI', 21);
      tx = x + isz + 12;
      tw = w - isz - 18;
    }
    if (label) {
      this.text(G, label, tx, y + h / 2 - size * 0.66, tw, size, '255;255;255', 'center', P.items, 'UI', 22,
        disabled ? '90;90;100' : '60;40;30');
    }
    const tag = opts.tag || label || opts.icon;
    if (!disabled && opts.onTap) this.hit(P.hits, x, y, w, h, opts.onTap, tag);
    else if (disabled) this.hit(P.hits, x, y, w, h, opts.onDisabled || (() => {}), 'disabled:' + tag);
  },

  bar(G, list, x, y, w, h, ratio, color, layer, z) {
    const back = this.obj(G, 'BarBack', x, y, layer || 'UI', list, z);
    back.setWidth(w);
    back.setHeight(h);
    const fill = this.obj(G, 'BarFill', x + 2, y + 2, layer || 'UI', list, (z || 0) + 1);
    fill.setWidth(Math.max(h - 4, (w - 4) * U.clamp(ratio, 0, 1)));
    fill.setHeight(h - 4);
    fill.setColor(color);
    if (ratio <= 0) fill.hide(true);
    return { back, fill };
  },

  patienceColor(r) {
    if (r > 0.6) return '96;200;80';
    if (r > 0.3) return '250;200;60';
    return '235;80;60';
  },
  moodIcon(r) {
    if (r > 0.6) return 'mood_happy';
    if (r > 0.35) return 'mood_neutral';
    if (r > 0.15) return 'mood_annoyed';
    return 'mood_angry';
  },

  // ------------------------------------------------------------ init
  init(G) {
    G.ui = {
      hud: { items: [], hits: [] },
      panel: null,
      floats: [],
      toast: null,
      dirty: true,
      refreshTimer: 0,
      wasDown: false,
      scroll: 0,
      tab: null,
    };
    this.buildHud(G);
  },

  markDirty(G) {
    if (G.ui) G.ui.dirty = true;
  },

  // ------------------------------------------------------------ HUD
  buildHud(G) {
    const hud = G.ui.hud;
    hud.items.forEach((o) => PS.destroy(o));
    hud.items = [];
    hud.hits = [];
    const W = this.W(G);
    const H = this.H(G);
    const L = hud.items;
    // Top bar
    this.panelBox(G, 'PanelDark', 12, 14, 214, 66, L, 10);
    this.icon(G, 'icon_coin', 46, 47, 54, L, 'UI', 11);
    hud.gold = this.text(G, '0', 78, 22, 142, 40, COLORS.gold, 'left', L, 'UI', 11, '40;24;16');
    this.panelBox(G, 'PanelDark', 234, 14, 150, 66, L, 10);
    this.icon(G, 'icon_star', 266, 42, 46, L, 'UI', 11);
    hud.level = this.text(G, 'Lv 1', 292, 20, 86, 32, '255;255;255', 'left', L, 'UI', 11, '40;24;16');
    hud.prestige = this.text(G, '', 236, 52, 60, 20, COLORS.gold, 'center', L, 'UI', 12, '40;24;16');
    hud.xp = this.bar(G, L, 292, 58, 82, 12, 0, '120;200;255', 'UI', 11);
    // Satisfaction: next to the level, or on the second row on narrow phones.
    if (W >= 700) {
      this.panelBox(G, 'PanelDark', 392, 14, 136, 66, L, 10);
      hud.mood = this.icon(G, 'mood_happy', 424, 47, 46, L, 'UI', 11);
      hud.sat = this.text(G, '80%', 450, 26, 74, 30, '255;255;255', 'left', L, 'UI', 11, '40;24;16');
    } else {
      this.panelBox(G, 'PanelDark', 394, 88, 120, 44, L, 10);
      hud.mood = this.icon(G, 'mood_happy', 418, 110, 32, L, 'UI', 11);
      hud.sat = this.text(G, '80%', 438, 96, 72, 26, '255;255;255', 'left', L, 'UI', 11, '40;24;16');
      this.hit(hud.hits, 394, 88, 120, 44, () => this.toggle(G, 'stats'));
    }
    // Ingredient shortcut and settings
    this.panelBox(G, 'BtnBlue', W - 160, 12, 70, 70, L, 10);
    this.icon(G, 'icon_bag', W - 125, 44, 48, L, 'UI', 11);
    hud.bagWarn = this.icon(G, 'icon_exclaim', W - 98, 22, 28, L, 'UI', 12);
    this.hit(hud.hits, W - 160, 12, 70, 70, () => this.toggle(G, 'ingredients'));
    this.panelBox(G, 'BtnGray', W - 82, 12, 70, 70, L, 10);
    this.icon(G, 'icon_gear', W - 47, 44, 48, L, 'UI', 11);
    this.hit(hud.hits, W - 82, 12, 70, 70, () => this.toggle(G, 'settings'));
    this.hit(hud.hits, 12, 14, 516, 66, () => this.toggle(G, 'stats'));
    // Task list indicator under the top bar
    this.panelBox(G, 'PanelDark', 12, 88, 130, 44, L, 10);
    this.icon(G, 'icon_quality', 36, 110, 30, L, 'UI', 11);
    hud.gems = this.text(G, '0', 56, 96, 80, 26, '170;230;255', 'left', L, 'UI', 11, '40;24;16');
    hud.taskBack = this.panelBox(G, 'PanelDark', 150, 88, 236, 44, L, 10);
    hud.taskText = this.text(G, '', 160, 96, 220, 24, '255;255;255', 'left', L, 'UI', 11);
    // Shown while the shop is closed (satisfaction hit rock bottom).
    hud.closed = this.panelBox(G, 'BtnRed', W / 2 - 230, 144, 460, 58, L, 30);
    hud.closedText = this.text(G, 'SHOP CLOSED · tap to reopen', W / 2 - 230, 157, 460, 28, '255;255;255', 'center', L, 'UI', 31,
      '90;20;20');
    this.hit(hud.hits, W / 2 - 230, 144, 460, 58, () => G.state.closed && this.open(G, 'closed'), 'closed');
    // Bottom navigation
    const tabs = [
      ['orders', 'icon_orders', 'Orders'],
      ['ingredients', 'icon_bag', 'Herbs'],
      ['upgrades', 'icon_upgrades', 'Upgrades'],
      ['workers', 'icon_workers', 'Workers'],
      ['expand', 'icon_expand', 'Expand'],
    ];
    const B = this.bottom(G); // above the iPhone home indicator
    const navH = 118;
    this.panelBox(G, 'PanelWood', -10, B - navH - 8, W + 20, navH + 24 + (H - B), L, 10);
    const bw = (W - 24) / tabs.length;
    hud.tabs = {};
    tabs.forEach(([id, ic, label], i) => {
      const x = 12 + i * bw;
      const sel = this.panelBox(G, 'BtnGold', x + 4, B - navH + 6, bw - 8, navH - 20, L, 11);
      sel.hide(true);
      this.icon(G, ic, x + bw / 2, B - navH + 42, 54, L, 'UI', 12);
      this.text(G, label, x, B - navH + 68, bw, 22, '255;246;226', 'center', L, 'UI', 12, '60;36;20');
      hud.tabs[id] = sel;
      this.hit(hud.hits, x, B - navH - 4, bw, navH + 4, () => this.toggle(G, id), 'tab:' + id);
    });
    hud.badge = {};
    hud.ordersBadge = this.panelBox(G, 'BtnRed', 12 + bw - 46, B - navH - 6, 38, 34, L, 13);
    hud.ordersBadgeText = this.text(G, '0', 12 + bw - 46, B - navH - 4, 38, 22, '255;255;255', 'center', L, 'UI', 14);
  },

  updateHud(G) {
    const hud = G.ui.hud;
    const s = G.state;
    hud.gold.setText(U.formatGold(s.gold));
    hud.level.setText('Lv ' + s.level);
    hud.prestige.setText(s.prestige ? 'P' + s.prestige : '');
    hud.gems.setText(U.formatGold(s.gems));
    hud.closed.hide(!s.closed);
    hud.closedText.hide(!s.closed);
    const need = PS.xpForLevel(s.level);
    hud.xp.fill.setWidth(Math.max(8, 78 * U.clamp(s.xp / need, 0, 1)));
    const sat = Math.round(s.satisfaction);
    hud.sat.setText(sat + '%');
    hud.mood.setAnimationName(this.moodIcon(sat / 100));
    // Low stock warning: some known recipe cannot be brewed.
    const low = PS.Brewing.knownRecipes(G).some((r) => !PS.Brewing.canBrew(G, r));
    hud.bagWarn.hide(!low);
    if (low) hud.bagWarn.setOpacity(155 + 100 * Math.abs(Math.sin(G.time * 4)));
    const w = G.owner;
    const n = (w.task ? 1 : 0) + w.queue.length;
    const label = w.task ? PS.TASKS[w.task.type].label : 'Idle';
    hud.taskText.setText((n > 1 ? '(' + n + ') ' : '') + 'Owner: ' + label);
    const orders = G.customers.filter((c) => c.state === 'waitingOrder' || c.state === 'ordered').length;
    hud.ordersBadge.hide(orders === 0);
    hud.ordersBadgeText.hide(orders === 0);
    hud.ordersBadgeText.setText(String(orders));
    for (const id in hud.tabs) hud.tabs[id].hide(!(G.ui.panel && G.ui.panel.name === id));
  },

  // ------------------------------------------------------------ panels
  toggle(G, name, params) {
    if (G.ui.panel && G.ui.panel.name === name && !params) this.close(G);
    else this.open(G, name, params);
  },

  open(G, name, params) {
    const keepScroll = G.ui.panel && G.ui.panel.name === name;
    this.close(G);
    G.ui.panel = { name, params: params || {}, items: [], hits: [], scroll: keepScroll ? G.ui.scroll : 0 };
    if (!keepScroll) G.ui.scroll = 0;
    this.buildPanel(G);
    PS.Audio.play(G, 'tap');
  },

  close(G) {
    const P = G.ui.panel;
    if (!P) return;
    P.items.forEach((o) => PS.destroy(o));
    G.ui.panel = null;
  },

  rebuild(G) {
    const P = G.ui.panel;
    if (!P) return;
    P.items.forEach((o) => PS.destroy(o));
    P.items = [];
    P.hits = [];
    this.buildPanel(G);
  },

  // Frame + title + close button. Returns the content rectangle.
  frame(G, P, title, h) {
    const W = this.W(G);
    const H = this.H(G);
    const bottom = this.bottom(G) - 126;
    const top = Math.max(140, bottom - h);
    P.rect = { x: 8, y: top, w: W - 16, h: bottom - top };
    // Block taps on the panel background.
    this.hit(P.hits, P.rect.x, P.rect.y, P.rect.w, P.rect.h, () => {});
    this.panelBox(G, 'PanelWood', P.rect.x, P.rect.y, P.rect.w, P.rect.h, P.items, 15);
    this.text(G, title, P.rect.x + 30, top + 22, P.rect.w - 120, 38, COLORS.ink, 'left', P.items, 'UI', 16);
    this.button(G, P, P.rect.x + P.rect.w - 84, top + 14, 64, 60, 'BtnRed', '', {
      icon: 'icon_close',
      iconSize: 40,
      onTap: () => this.close(G),
    });
    return { x: P.rect.x + 28, y: top + 84, w: P.rect.w - 56, h: P.rect.h - 104 };
  },

  // Row-based scrolling list. `rows` is an array of builder functions.
  list(G, P, area, rowH, rows) {
    const visible = Math.max(1, Math.floor(area.h / rowH));
    const maxScroll = Math.max(0, rows.length - visible);
    G.ui.scroll = U.clamp(G.ui.scroll, 0, maxScroll);
    P.scroll = { rowH, max: maxScroll, area };
    for (let i = 0; i < visible && i + G.ui.scroll < rows.length; i++) {
      rows[i + G.ui.scroll](area.x, area.y + i * rowH, area.w, rowH - 8);
    }
    if (maxScroll > 0) {
      const t = G.ui.scroll > 0 ? '▲ ' : '';
      const b = G.ui.scroll < maxScroll ? ' ▼' : '';
      this.text(G, t + 'drag to scroll' + b, area.x, area.y + area.h - 4, area.w, 20, COLORS.muted, 'center',
        P.items, 'UI', 16);
    }
  },

  buildPanel(G) {
    const P = G.ui.panel;
    switch (P.name) {
      case 'brew':
        return this.buildBrew(G, P);
      case 'orders':
        return this.buildOrders(G, P);
      case 'ingredients':
        return this.buildIngredients(G, P);
      case 'upgrades':
        return this.buildUpgrades(G, P, 'upgrades');
      case 'expand':
        return this.buildUpgrades(G, P, 'expand');
      case 'workers':
        return this.buildWorkers(G, P);
      case 'settings':
        return this.buildSettings(G, P);
      case 'stats':
        return this.buildStats(G, P);
      case 'levelup':
        return this.buildLevelUp(G, P);
      case 'offline':
        return this.buildOffline(G, P);
      case 'prestige':
        return this.buildPrestige(G, P);
      case 'closed':
        return this.buildClosed(G, P);
      case 'ad':
        return this.buildAd(G, P);
      case 'plant':
        return PS.GardenUI.buildPlant(G, P);
      case 'speedup':
        return PS.GardenUI.buildSpeedup(G, P);
    }
  },

  // ----- Brew panel: two ingredients (or a recipe) plus an optional extra herb.
  buildBrew(G, P) {
    const c = P.params.cauldron;
    const given = P.params.slots || [];
    const slots = (P.params.slots = [given[0] || null, given[1] || null, given[2] || null]);
    const area = this.frame(G, P, 'Brew a potion', 1040);
    const inv = G.state.inventory;
    const used = {};
    slots.forEach((id) => id && (used[id] = (used[id] || 0) + 1));
    let y = area.y;
    const cx = area.x + area.w / 2;
    const sz = 96;
    const gap = 40;
    const x0 = cx - (4 * sz + 3 * gap) / 2;
    const xs = [x0, x0 + sz + gap, x0 + 2 * (sz + gap), x0 + 3 * (sz + gap)];
    for (let i = 0; i < 3; i++) {
      const extraSlot = i === 2;
      this.panelBox(G, extraSlot ? 'PanelDark' : 'PanelParchment', xs[i], y, sz, sz, P.items, 16);
      if (slots[i]) {
        this.icon(G, PS.data.ingredientById[slots[i]].icon, xs[i] + sz / 2, y + sz / 2, 70, P.items, 'UI', 17);
        this.hit(P.hits, xs[i], y, sz, sz, () => {
          slots[i] = null;
          this.rebuild(G);
        }, 'slot:' + i);
      } else {
        this.text(G, extraSlot ? 'extra\n(optional)' : '+', xs[i], y + (extraSlot ? 26 : 16), sz, extraSlot ? 20 : 56,
          extraSlot ? '230;220;200' : COLORS.muted, 'center', P.items, 'UI', 17);
      }
    }
    this.text(G, '+', xs[0] + sz, y + 24, gap, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    this.text(G, '+', xs[1] + sz, y + 24, gap, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    this.text(G, '=', xs[2] + sz, y + 24, gap, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    this.panelBox(G, 'PanelParchment', xs[3], y, sz, sz, P.items, 16);
    const line = y + sz + 8;
    const ready = slots[0] && slots[1];
    if (ready) {
      const result = PS.findRecipe([slots[0], slots[1]]);
      const known = result && result.unlockLevel <= G.state.level && result.prestige <= G.prestige();
      this.icon(G, result && known ? result.icon : 'potion_sludge', xs[3] + sz / 2, y + sz / 2, 74, P.items, 'UI', 17);
      let label;
      let color = COLORS.ink;
      if (!result || !known) {
        label = 'Unknown mix: Murky Sludge (worthless, may explode)';
        color = COLORS.red;
      } else {
        const extra = slots[2];
        let q = 'Standard';
        if (extra === 'starbloom') q = 'Superb';
        else if (extra === 'glowcap') q = 'Fine, fast and safe';
        else if (extra && G.state.discovered.includes(result.id) && extra === result.bonus) q = 'Fine';
        else if (extra) {
          q = 'unknown extra herb (could go wrong!)';
          color = '170;90;30';
        }
        label = result.name + '  ·  ' + q;
      }
      this.text(G, label, area.x, line, area.w, 24, color, 'center', P.items, 'UI', 17);
    } else {
      this.text(G, '?', xs[3], y + 16, sz, 56, COLORS.muted, 'center', P.items, 'UI', 17);
      this.text(G, 'Pick 2 ingredients, or tap a recipe below', area.x, line, area.w, 24, COLORS.muted, 'center',
        P.items, 'UI', 17);
    }
    y += sz + 44;
    this.button(G, P, cx - 150, y, 300, 76, 'BtnGreen', 'BREW', {
      size: 38,
      icon: 'icon_brew',
      disabled: !ready,
      onTap: () => {
        if (PS.Brewing.request(G, c, slots.filter((x) => x))) this.close(G);
      },
      onDisabled: () => this.toast(G, 'Add two ingredients first'),
    });
    y += 90;
    // Ingredients: unlocked herbs plus any rare herb in stock.
    this.text(G, 'Ingredients  (a 3rd herb is optional)', area.x, y, area.w, 26, COLORS.ink, 'left', P.items, 'UI', 16);
    y += 34;
    const ings = PS.data.ingredients.filter(
      (i) => (i.unlockLevel <= G.state.level && i.prestige <= G.prestige()) || (inv[i.id] || 0) > 0
    );
    const cols = ings.length > 8 ? 5 : 4;
    const cw = area.w / cols;
    const ch = 100;
    ings.forEach((ing, k) => {
      const x = area.x + (k % cols) * cw;
      const yy = y + Math.floor(k / cols) * ch;
      const left = (inv[ing.id] || 0) - (used[ing.id] || 0);
      this.panelBox(G, left > 0 ? 'PanelParchment' : 'BtnGray', x + 4, yy, cw - 8, ch - 8, P.items, 16);
      this.icon(G, ing.icon, x + cw / 2, yy + 34, 54, P.items, 'UI', 17);
      this.text(G, ing.name, x, yy + 62, cw, 19, ing.rare ? '150;90;10' : COLORS.ink, 'center', P.items, 'UI', 17);
      this.text(G, 'x' + left, x + cw - 50, yy + 4, 44, 20, left <= 2 ? COLORS.red : COLORS.green, 'right', P.items, 'UI', 17);
      this.hit(P.hits, x + 4, yy, cw - 8, ch - 8, () => {
        if (left <= 0) {
          this.toast(G, 'Out of ' + ing.name + ' — buy more in Herbs');
          return;
        }
        const free = slots.indexOf(null);
        slots[free >= 0 ? free : 2] = ing.id;
        PS.Audio.play(G, 'tap');
        this.rebuild(G);
      }, 'ing:' + ing.id);
    });
    y += Math.ceil(ings.length / cols) * ch + 4;
    // Recipe book (rows with waiting orders first)
    this.text(G, 'Recipe book — tap to fill', area.x, y, area.w, 24, COLORS.ink, 'left', P.items, 'UI', 16);
    y += 30;
    const wanted = PS.World.wantedItems(G);
    const recipes = PS.Brewing.knownRecipes(G)
      .map((r) => ({ r, n: wanted.filter((w) => w.recipe.id === r.id).length }))
      .sort((a, b) => b.n - a.n);
    const rh = 60;
    const room = Math.max(1, Math.floor((area.y + area.h - y) / rh));
    recipes.slice(0, room).forEach(({ r, n }, k) => {
      const yy = y + k * rh;
      const ok = PS.Brewing.canBrew(G, r);
      this.panelBox(G, 'PanelParchment', area.x, yy, area.w, rh - 6, P.items, 16);
      this.icon(G, r.icon, area.x + 30, yy + 27, 44, P.items, 'UI', 17);
      this.text(G, r.name, area.x + 58, yy + 13, 240, 24, COLORS.ink, 'left', P.items, 'UI', 17);
      r.ingredients.forEach((id, j) => {
        const ing = PS.data.ingredientById[id];
        this.icon(G, ing.icon, area.x + 300 + j * 46, yy + 27, 36, P.items, 'UI', 17);
        if ((inv[id] || 0) <= 0) this.icon(G, 'icon_close', area.x + 314 + j * 46, yy + 40, 16, P.items, 'UI', 18);
      });
      // Bonus herb once discovered, otherwise a hint that one exists.
      const found = G.state.discovered.includes(r.id);
      this.text(G, '+', area.x + 384, yy + 12, 20, 26, COLORS.muted, 'center', P.items, 'UI', 17);
      if (found) this.icon(G, PS.data.ingredientById[r.bonus].icon, area.x + 420, yy + 27, 34, P.items, 'UI', 17);
      else this.text(G, '?', area.x + 404, yy + 12, 32, 26, COLORS.muted, 'center', P.items, 'UI', 17);
      if (n > 0) {
        this.panelBox(G, 'BtnRed', area.x + area.w - 110, yy + 9, 100, 36, P.items, 17);
        this.text(G, n + ' wanted', area.x + area.w - 110, yy + 15, 100, 20, '255;255;255', 'center', P.items, 'UI', 18);
      }
      this.hit(P.hits, area.x, yy, area.w, rh - 6, () => {
        if (!ok) this.toast(G, 'Missing ingredients for ' + r.name);
        P.params.slots = PS.Brewing.bestIngredients(G, r);
        this.rebuild(G);
      }, 'recipe:' + r.id);
    });
  },

  // ----- Orders panel: one row per customer, one icon per potion ordered.
  buildOrders(G, P) {
    const area = this.frame(G, P, 'Orders', 900);
    const list = G.customers
      .filter((c) => c.state === 'ordered' || c.state === 'waitingOrder')
      .sort((a, b) => (a.state === b.state ? a.orderedAt - b.orderedAt : a.state === 'ordered' ? -1 : 1));
    if (!list.length) {
      this.text(G, 'No orders yet.\nTap a seated customer to take their order.', area.x, area.y + 40, area.w, 30,
        COLORS.muted, 'center', P.items, 'UI', 16);
      return;
    }
    const rows = list.map((c) => (x, y, w, h) => {
      this.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
      // Potions of the order (checked when delivered)
      c.items.forEach((it, j) => {
        const ix = x + 40 + j * 58;
        const ic = this.icon(G, it.recipe.icon, ix, y + 40, 52, P.items, 'UI', 17);
        if (it.done) {
          ic.setOpacity(110);
          this.icon(G, 'icon_check', ix + 16, y + 56, 24, P.items, 'UI', 18);
        }
      });
      const left = c.items.filter((i) => !i.done);
      const first = left[0] ? left[0].recipe : c.items[0].recipe;
      const title = c.items.length > 1 ? c.items.length + ' potions' : first.name;
      this.text(G, title, x + 40 + Math.min(c.items.length, 5) * 58, y + 22, 220, 26, COLORS.ink, 'left', P.items, 'UI', 17);
      const ratio = c.patience / c.maxPatience;
      this.icon(G, this.moodIcon(ratio), x + 26, y + 88, 30, P.items, 'UI', 17);
      this.bar(G, P.items, x + 46, y + 79, 120, 18, ratio, this.patienceColor(ratio), 'UI', 17);
      let status = 'Tap customer to take order';
      let col = COLORS.muted;
      if (c.state === 'ordered') {
        const done = c.items.length - left.length;
        const coming = left.filter((i) => i.reserved).length;
        if (c.items.length > 1) status = done + '/' + c.items.length + ' delivered';
        else status = coming ? 'On the way!' : 'Waiting for potion';
        if (coming) status += c.items.length > 1 ? ' · ' + coming + ' on the way' : '';
        col = coming ? COLORS.green : COLORS.red;
      }
      this.text(G, status, x + 176, y + 78, 260, 20, col, 'left', P.items, 'UI', 17);
      const tip = c.type.tip * (1 + PS.data.balance.tipMax * ratio);
      const pay = Math.round(c.items.reduce((a, it) => a + G.potionPrice(it.recipe), 0) * tip);
      this.icon(G, 'icon_coin', x + w - 196, y + 26, 30, P.items, 'UI', 17);
      this.text(G, U.formatGold(pay) + 'g', x + w - 178, y + 12, 90, 26, '170;120;20', 'left', P.items, 'UI', 17);
      if (c.state === 'waitingOrder') {
        this.button(G, P, x + w - 150, y + h - 62, 140, 54, 'BtnBlue', 'Take', {
          size: 26,
          onTap: () => {
            PS.Workers.enqueue(G, { type: 'takeOrder', target: c });
            this.rebuild(G);
          },
        });
      } else {
        // Brew the first potion of this order that nobody is making yet.
        const want = PS.World.uncoveredItem(G, null);
        const mine = left.find((i) => !i.reserved && PS.Brewing.plannedFor(G, i.recipe.id) <
          PS.World.wantedItems(G).filter((x) => x.recipe.id === i.recipe.id).length);
        const r = mine ? mine.recipe : null;
        const idle = PS.Brewing.idleCauldron(G);
        const can = r && PS.Brewing.canBrew(G, r);
        void want;
        this.button(G, P, x + w - 150, y + h - 62, 140, 54, 'BtnGreen', 'Brew', {
          tag: 'brew:' + c.id,
          size: 26,
          disabled: !idle || !can,
          onTap: () => {
            if (PS.Brewing.request(G, idle, PS.Brewing.bestIngredients(G, r))) this.rebuild(G);
          },
          onDisabled: () => this.toast(G, !r ? 'Their potions are already being made' : !idle ? 'All cauldrons are busy' : 'Missing ingredients'),
        });
      }
    });
    this.list(G, P, area, 132, rows);
  },

  // ----- Ingredient shop
  buildIngredients(G, P) {
    const area = this.frame(G, P, 'Herb shop', 1000);
    const inv = G.state.inventory;
    // Entrance to the herb garden (optional free herbs).
    const gardenOpen = G.state.level >= PS.data.balance.gardenLevel;
    this.button(G, P, area.x, area.y - 6, area.w, 64, gardenOpen ? 'BtnGreen' : 'BtnGray',
      gardenOpen ? 'Visit the Herb Garden' : 'Herb Garden opens at shop level ' + PS.data.balance.gardenLevel, {
        tag: 'garden',
        icon: 'icon_garden',
        size: 26,
        disabled: !gardenOpen,
        onTap: () => G.goToGarden(),
        onDisabled: () => this.toast(G, 'Reach shop level ' + PS.data.balance.gardenLevel + ' to open the garden'),
      });
    area.y += 70;
    area.h -= 70;
    const shown = PS.data.ingredients.filter((i) => i.prestige <= G.prestige() + 1);
    const rows = shown.map((ing) => (x, y, w, h) => {
      const locked = ing.unlockLevel > G.state.level || ing.prestige > G.prestige();
      const n0 = inv[ing.id] || 0;
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, ing.icon, x + 46, y + h / 2, 70, P.items, 'UI', 17);
      this.text(G, ing.name, x + 92, y + 12, 240, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      if (locked) {
        this.icon(G, 'icon_lock', x + w - 60, y + h / 2, 44, P.items, 'UI', 17);
        const why = ing.prestige > G.prestige() ? 'Unlocks at prestige ' + ing.prestige
          : ing.rare ? 'Rare: from the Garden and happy customers. Sold from shop level ' + ing.unlockLevel
            : 'Unlocks at shop level ' + ing.unlockLevel;
        this.text(G, why, x + 92, y + 46, w - 170, 20, COLORS.muted, 'left', P.items, 'UI', 17);
        if (ing.rare && n0 > 0) {
          this.text(G, 'In stock: ' + n0, x + 92, y + 72, 200, 20, COLORS.green, 'left', P.items, 'UI', 17);
        }
        return;
      }
      const n = inv[ing.id] || 0;
      const cap = G.storageCap();
      const full = n + ing.bundle > cap;
      this.text(G, 'In stock: ' + n + ' / ' + cap + (n <= 2 ? '  LOW!' : ''), x + 92, y + 50, 260, 24,
        n <= 2 ? COLORS.red : COLORS.green,
        'left', P.items, 'UI', 17);
      const cost = G.herbCost(ing);
      this.button(G, P, x + w - 200, y + 14, 190, h - 28, 'BtnGold', '+' + ing.bundle + '  ' + U.formatGold(cost) + 'g', {
        tag: 'buy:' + ing.id,
        size: 26,
        disabled: G.state.gold < cost || full,
        onTap: () => {
          G.addGold(-cost);
          inv[ing.id] = n + ing.bundle;
          PS.Audio.play(G, 'buy');
          G.requestSave();
          this.rebuild(G);
        },
        onDisabled: () => this.toast(G, full ? 'Pantry is full — upgrade it in Upgrades' : 'Not enough gold'),
      });
    });
    this.list(G, P, area, 108, rows);
  },

  // ----- Upgrades (shop upgrades or potion masteries) and expansion
  buildUpgrades(G, P, tab) {
    const title = tab === 'expand' ? 'Expand the shop' : 'Upgrades';
    const area = this.frame(G, P, title, 980);
    let kind = tab;
    if (tab === 'upgrades') {
      // Sub tabs: shop upgrades reset on prestige, masteries are kept.
      kind = P.params.sub || 'upgrades';
      const half = (area.w - 12) / 2;
      [['upgrades', 'Shop upgrades'], ['mastery', 'Potion Mastery']].forEach(([id, label], i) => {
        this.button(G, P, area.x + i * (half + 12), area.y - 8, half, 56, kind === id ? 'BtnGold' : 'BtnGray', label, {
          tag: 'sub:' + id,
          size: 24,
          onTap: () => {
            P.params.sub = id;
            G.ui.scroll = 0;
            this.rebuild(G);
          },
        });
      });
      area.y += 60;
      area.h -= 60;
    }
    const ups = PS.data.upgrades.filter((u) => u.tab === kind && (u.prestige || 0) <= G.prestige());
    const rows = ups.map((u) => (x, y, w, h) => {
      const lvl = G.state.upgrades[u.id] || 0;
      const maxed = lvl >= G.upgradeMax(u);
      const locked = G.state.level < u.minShopLevel;
      const cost = G.upgradeCost(u);
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, u.icon, x + 44, y + h / 2, 64, P.items, 'UI', 17);
      this.text(G, u.name, x + 88, y + 10, 300, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      this.text(G, u.desc, x + 88, y + 44, w - 300, 20, COLORS.muted, 'left', P.items, 'UI', 17);
      this.text(G, G.upgradeStatus(u), x + 88, y + h - 32, 330, 22, '60;110;160', 'left', P.items, 'UI', 17);
      if (locked) {
        this.icon(G, 'icon_lock', x + w - 120, y + h / 2 - 10, 40, P.items, 'UI', 17);
        this.text(G, 'Shop Lv ' + u.minShopLevel, x + w - 200, y + h / 2 + 14, 170, 22, COLORS.muted, 'center', P.items,
          'UI', 17);
      } else if (maxed) {
        this.text(G, 'MAX', x + w - 190, y + h / 2 - 18, 170, 32, COLORS.green, 'center', P.items, 'UI', 17);
      } else {
        this.button(G, P, x + w - 200, y + h / 2 - 34, 190, 68, 'BtnGold', U.formatGold(cost) + 'g', {
          tag: 'upgrade:' + u.id,
          icon: 'icon_coin',
          iconSize: 36,
          size: 30,
          disabled: G.state.gold < cost,
          onTap: () => {
            G.buyUpgrade(u);
            this.rebuild(G);
          },
          onDisabled: () => this.toast(G, 'Not enough gold'),
        });
      }
    });
    if (tab === 'expand') {
      // Prestige: start a bigger, harder shop once everything is maxed.
      rows.push((x, y, w, h) => {
        const pr = G.prestigeProgress();
        this.panelBox(G, pr.ready ? 'BtnPurple' : 'PanelDark', x, y, w, h, P.items, 16);
        this.icon(G, 'icon_crown', x + 44, y + h / 2, 64, P.items, 'UI', 17);
        this.text(G, 'Prestige ' + (G.prestige() + 1), x + 88, y + 10, 300, 28, COLORS.gold, 'left', P.items, 'UI', 17, '40;24;16');
        this.text(G, pr.ready ? 'Everything is maxed. Start a bigger shop!' : 'Max every upgrade and hire all apprentices: ' +
          pr.done + '/' + pr.total, x + 88, y + 46, w - 300, 22, '255;255;255', 'left', P.items, 'UI', 17);
        this.button(G, P, x + w - 200, y + h / 2 - 34, 190, 68, 'BtnGold', 'Details', {
          tag: 'prestige',
          size: 28,
          onTap: () => this.open(G, 'prestige'),
        });
      });
    }
    this.list(G, P, area, 132, rows);
  },

  // ----- Prestige: what changes, what is kept, and the confirm button.
  buildPrestige(G, P) {
    const area = this.frame(G, P, 'Prestige ' + (G.prestige() + 1), 1000);
    const next = G.prestige() + 1;
    const pr = G.prestigeProgress();
    const newRecipes = PS.data.recipes.filter((r) => r.prestige === next);
    const lines = [
      ['icon_tables', 'Tables seat ' + Math.min(5, 1 + next) + ' customers each'],
      ['icon_orders', 'Customers can order up to ' + Math.min(5, 1 + next) + ' potions'],
      ['icon_coin', 'Potions sell for ' + Math.pow(PS.data.balance.prestigePriceMult, next) + 'x the base price'],
      ['icon_upgrades', 'Upgrades cost ' + Math.pow(PS.data.balance.prestigeCostMult, next) + 'x more'],
      ['icon_patience', 'Customers are a little less patient'],
      ['icon_quality', '+' + PS.data.balance.prestigeGems * next + ' gems'],
    ];
    let y = area.y;
    if (newRecipes.length) {
      this.text(G, 'New potions:', area.x, y, 200, 26, COLORS.ink, 'left', P.items, 'UI', 17);
      newRecipes.forEach((r, i) => this.icon(G, r.icon, area.x + 190 + i * 60, y + 14, 50, P.items, 'UI', 17));
      y += 50;
    }
    lines.forEach(([ic, t]) => {
      this.icon(G, ic, area.x + 22, y + 16, 34, P.items, 'UI', 17);
      this.text(G, t, area.x + 50, y + 2, area.w - 50, 24, COLORS.ink, 'left', P.items, 'UI', 17);
      y += 42;
    });
    y += 6;
    this.text(G, 'Kept: shop level, gems, Potion Mastery, discovered recipes, stats.\n' +
      'Reset: gold, herbs, shop upgrades, tables, cauldrons, apprentices, garden.', area.x, y, area.w, 22, COLORS.muted,
      'left', P.items, 'UI', 17);
    y += 70;
    if (!pr.ready) {
      this.text(G, 'Still to do (' + pr.done + '/' + pr.total + '):', area.x, y, area.w, 24, COLORS.red, 'left', P.items, 'UI', 17);
      y += 32;
      pr.missing.slice(0, 6).forEach((m) => {
        this.text(G, '· ' + m, area.x + 10, y, area.w - 10, 22, COLORS.ink, 'left', P.items, 'UI', 17);
        y += 28;
      });
      return;
    }
    const confirm = P.params.confirm;
    this.button(G, P, area.x + area.w / 2 - 200, y + 10, 400, 84, confirm ? 'BtnRed' : 'BtnPurple',
      confirm ? 'Tap again to prestige' : 'Prestige now', {
        tag: 'doPrestige',
        icon: 'icon_crown',
        size: 32,
        onTap: () => {
          if (!confirm) {
            P.params.confirm = true;
            this.rebuild(G);
          } else G.doPrestige();
        },
      });
  },

  // ----- The shop closed: reopen with gold or gems.
  buildClosed(G, P) {
    const area = this.frame(G, P, 'Shop closed!', 620);
    this.icon(G, 'icon_closed', area.x + 56, area.y + 60, 96, P.items, 'UI', 17);
    this.text(G, 'Too many unhappy customers: nobody wants to visit right now. Reopen the shop to get customers back ' +
      '(satisfaction restarts at 55%).', area.x + 120, area.y, area.w - 120, 24, COLORS.ink, 'left', P.items, 'UI', 17);
    const gold = PS.World.reopenCost(G);
    const gems = PS.data.balance.reopenGems;
    this.button(G, P, area.x, area.y + 170, area.w, 80, 'BtnGold', 'Reopen for ' + U.formatGold(gold) + 'g', {
      tag: 'reopenGold',
      icon: 'icon_coin',
      size: 30,
      disabled: G.state.gold < gold,
      onTap: () => PS.World.reopen(G, false) && this.close(G),
      onDisabled: () => this.toast(G, 'Not enough gold'),
    });
    this.button(G, P, area.x, area.y + 266, area.w, 80, 'BtnBlue', 'Reopen for ' + gems + ' gems', {
      tag: 'reopenGems',
      icon: 'icon_quality',
      size: 30,
      disabled: G.state.gems < gems,
      onTap: () => PS.World.reopen(G, true) && this.close(G),
      onDisabled: () => this.toast(G, 'Not enough gems'),
    });
    this.button(G, P, area.x, area.y + 362, area.w, 80, PS.Ads.available(G) ? 'BtnPurple' : 'BtnGray',
      PS.Ads.label(G, 'Watch an ad to reopen'), {
      tag: 'reopenAd',
      icon: 'icon_ad',
      size: 24,
      disabled: !PS.Ads.available(G),
      onTap: () => PS.Ads.watch(G, 'Reopen the shop', () => {
        G.state.closed = false;
        G.state.satisfaction = 55;
        G.spawnTimer = 2;
        G.saveNow();
      }, 'reopen_shop'),
      onDisabled: () => this.toast(G, PS.Ads.unavailableText(G)),
    });
  },

  // ----- Rewarded ad. While the ad adapter shows a real ad this panel only
  // says so; in the GDevelop preview (no adapter) it is a labelled test ad.
  buildAd(G, P) {
    const area = this.frame(G, P, P.params.preview ? 'Test ad (preview)' : 'Rewarded ad', 600);
    this.text(G, 'Reward: ' + P.params.reason, area.x, area.y + 10, area.w, 26, COLORS.ink, 'center', P.items, 'UI', 17);
    if (!P.params.preview) {
      this.text(G, 'Showing the ad...\nThe reward is given when the ad is finished.', area.x, area.y + 90, area.w, 26,
        COLORS.muted, 'center', P.items, 'UI', 17);
      return;
    }
    const left = Math.max(0, (P.params.until - Date.now()) / 1000);
    this.panelBox(G, 'PanelDark', area.x, area.y + 60, area.w, 230, P.items, 16);
    this.text(G, 'GDEVELOP PREVIEW TEST AD', area.x, area.y + 90, area.w, 32, '255;120;110', 'center', P.items, 'UI', 17);
    this.text(G, 'Not a real ad. Exported builds use the ad adapter instead.', area.x + 20, area.y + 140, area.w - 40, 22,
      '220;220;230', 'center', P.items, 'UI', 17);
    this.text(G, left > 0 ? Math.ceil(left) + '' : '', area.x, area.y + 200, area.w, 48, COLORS.gold, 'center', P.items, 'UI', 17);
    this.button(G, P, area.x + area.w / 2 - 170, area.y + 320, 340, 80, left > 0 ? 'BtnGray' : 'BtnGreen', 'Claim reward', {
      tag: 'claimAd',
      icon: 'icon_check',
      size: 30,
      disabled: left > 0,
      onTap: () => {
        PS.Ads.claim(G);
        const fn = P.params.onReward;
        this.close(G);
        fn();
        PS.Audio.play(G.shop || G, 'coin');
      },
      onDisabled: () => this.toast(G, 'Almost done...'),
    });
  },

  buildWorkers(G, P) {
    const area = this.frame(G, P, 'Workers', 1000);
    const ROLE = { all: 'All jobs', service: 'Orders & delivery', brew: 'Brewing only' };
    const rows = [];
    // The owner follows your taps.
    rows.push((x, y, w, h) => {
      this.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, 'icon_workers', x + 50, y + 60, 74, P.items, 'UI', 17);
      this.text(G, 'You, the shop owner', x + 100, y + 16, w - 120, 30, COLORS.ink, 'left', P.items, 'UI', 17);
      const o = G.owner;
      this.text(G, 'Follows your taps. Now: ' + (o.task ? PS.TASKS[o.task.type].label : 'idle') +
        '\nShop upgrades (Swift Shoes, Quick Hands) help every worker.', x + 100, y + 56, w - 120, 22, COLORS.muted,
        'left', P.items, 'UI', 17);
    });
    // Hired apprentices work on their own.
    G.state.workers.forEach((rec, i) => {
      const index = i + 1;
      const type = PS.data.workerTypes[i];
      const wk = G.workers.find((k) => k.index === index && !k.isOwner);
      rows.push((x, y, w, h) => {
        this.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
        this.icon(G, 'icon_workers', x + 46, y + 46, 64, P.items, 'UI', 17);
        this.text(G, type.name + ' (apprentice)', x + 90, y + 12, 300, 30, COLORS.ink, 'left', P.items, 'UI', 17);
        const now = wk && wk.task ? PS.TASKS[wk.task.type].label : 'Looking for work';
        this.text(G, 'Now: ' + now, x + 90, y + 48, 300, 22, COLORS.muted, 'left', P.items, 'UI', 17);
        this.button(G, P, x + w - 230, y + 12, 220, 56, 'BtnBlue', ROLE[rec.role], {
          tag: 'role:' + index,
          size: 22,
          onTap: () => {
            G.cycleWorkerRole(index);
            this.rebuild(G);
          },
        });
        const stats = [['speed', 'Speed', 'icon_speed'], ['brew', 'Brewing', 'icon_brew'], ['service', 'Service', 'icon_order']];
        const bw = (w - 30) / 3;
        stats.forEach(([id, label, ic], j) => {
          const lvl = rec.stats[id];
          const bx = x + 10 + j * (bw + 5);
          const by = y + 86;
          this.text(G, label + ' Lv ' + lvl + '/5', bx, by, bw, 22, '60;110;160', 'center', P.items, 'UI', 17);
          if (lvl >= 5) {
            this.text(G, 'MAX', bx, by + 36, bw, 30, COLORS.green, 'center', P.items, 'UI', 17);
            return;
          }
          const cost = G.workerUpgradeCost(index, id);
          this.button(G, P, bx, by + 28, bw, 60, 'BtnGold', U.formatGold(cost) + 'g', {
            tag: 'wup:' + index + ':' + id,
            icon: ic,
            iconSize: 32,
            size: 24,
            disabled: G.state.gold < cost,
            onTap: () => {
              G.upgradeWorker(index, id);
              this.rebuild(G);
            },
            onDisabled: () => this.toast(G, 'Not enough gold'),
          });
        });
      });
    });
    // Next hire
    const next = G.nextWorkerType();
    rows.push((x, y, w, h) => {
      if (!next) {
        this.text(G, 'All apprentices hired. More arrive in future shops.', x, y + 20, w, 24, COLORS.muted, 'center',
          P.items, 'UI', 17);
        return;
      }
      const locked = G.state.level < next.minShopLevel;
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, locked ? 'icon_lock' : 'icon_plus', x + 46, y + 60, 60, P.items, 'UI', 17);
      this.text(G, 'Hire ' + next.name, x + 90, y + 14, 300, 30, locked ? '255;255;255' : COLORS.ink, 'left', P.items, 'UI', 17);
      this.text(G, locked ? 'Unlocks at shop level ' + next.minShopLevel
        : 'Takes orders, brews and delivers on their own.', x + 90, y + 52, w - 330, 22,
        locked ? '235;235;235' : COLORS.muted, 'left', P.items, 'UI', 17);
      if (!locked) {
        this.button(G, P, x + w - 220, y + h / 2 - 36, 210, 72, 'BtnGreen', U.formatGold(G.hireCost(next)) + 'g', {
          tag: 'hire',
          icon: 'icon_coin',
          iconSize: 36,
          size: 30,
          disabled: G.state.gold < G.hireCost(next),
          onTap: () => {
            G.hireWorker();
            this.rebuild(G);
          },
          onDisabled: () => this.toast(G, 'Not enough gold'),
        });
      }
    });
    this.list(G, P, area, 210, rows);
  },

  buildSettings(G, P) {
    const area = this.frame(G, P, 'Settings', 620);
    let y = area.y;
    this.button(G, P, area.x, y, area.w, 80, 'BtnGreen', 'Save now', {
      icon: 'icon_check',
      onTap: () => {
        G.saveNow();
        this.toast(G, 'Progress saved');
      },
    });
    y += 96;
    this.button(G, P, area.x, y, area.w, 80, 'BtnBlue', G.settings.shadows ? 'Shadows: ON' : 'Shadows: OFF', {
      icon: 'icon_sparkle',
      onTap: () => {
        G.setShadows(!G.settings.shadows);
        this.rebuild(G);
      },
    });
    y += 96;
    const half = (area.w - 16) / 2;
    this.button(G, P, area.x, y, half, 80, 'BtnPurple', G.settings.sound ? 'Sounds: ON' : 'Sounds: OFF', {
      icon: 'icon_sound',
      size: 26,
      onTap: () => {
        G.settings.sound = !G.settings.sound;
        G.saveSettings();
        this.rebuild(G);
      },
    });
    this.button(G, P, area.x + half + 16, y, half, 80, 'BtnPurple', G.settings.music ? 'Music: ON' : 'Music: OFF', {
      icon: 'icon_sound',
      size: 26,
      onTap: () => {
        G.settings.music = !G.settings.music;
        G.saveSettings();
        PS.Audio.music(G);
        this.rebuild(G);
      },
    });
    y += 96;
    const confirm = P.params.confirmReset;
    this.button(G, P, area.x, y, area.w, 80, 'BtnRed', confirm ? 'Tap again to erase everything' : 'Reset progress', {
      icon: 'icon_trash',
      onTap: () => {
        if (!confirm) {
          P.params.confirmReset = true;
          this.rebuild(G);
        } else {
          G.resetProgress();
        }
      },
    });
    y += 100;
    this.text(G, 'Potion Shop · progress saves automatically', area.x, y, area.w, 20, COLORS.muted,
      'center', P.items, 'UI', 16);
  },

  buildStats(G, P) {
    const area = this.frame(G, P, 'Shop stats', 560);
    const s = G.state;
    const lines = [
      ['icon_star', 'Shop level ' + s.level + '  (' + Math.floor(s.xp) + ' / ' + PS.xpForLevel(s.level) + ' XP)'],
      ['icon_coin', 'Gold earned: ' + Math.floor(s.earned)],
      ['mood_happy', 'Customers served: ' + s.served],
      ['mood_angry', 'Customers lost: ' + s.lost],
      ['icon_heart', 'Satisfaction: ' + Math.round(s.satisfaction) + '%'],
    ];
    lines.forEach(([ic, t], i) => {
      this.icon(G, ic, area.x + 28, area.y + 26 + i * 64, 46, P.items, 'UI', 17);
      this.text(G, t, area.x + 64, area.y + 10 + i * 64, area.w - 70, 28, COLORS.ink, 'left', P.items, 'UI', 17);
    });
  },

  // Gold earned by the apprentices while the game was closed.
  buildOffline(G, P) {
    const area = this.frame(G, P, 'Welcome back!', 520);
    const { gold, seconds } = P.params;
    this.icon(G, 'icon_workers', area.x + 60, area.y + 70, 100, P.items, 'UI', 17);
    this.text(G, 'While you were away (' + U.formatTime(seconds) + '), your apprentices kept the shop running.',
      area.x + 130, area.y + 10, area.w - 130, 26, COLORS.ink, 'left', P.items, 'UI', 17);
    this.icon(G, 'icon_coin', area.x + area.w / 2 - 80, area.y + 190, 64, P.items, 'UI', 17);
    this.text(G, '+' + U.formatGold(gold), area.x + area.w / 2 - 40, area.y + 166, 240, 48, COLORS.gold, 'left', P.items,
      'UI', 17, '60;36;20');
    this.button(G, P, area.x + area.w / 2 - 150, area.y + 270, 300, 80, 'BtnGreen', 'Collect', {
      size: 36,
      icon: 'icon_coin',
      onTap: () => {
        G.addGold(gold);
        PS.Audio.play(G, 'coin');
        G.saveNow();
        this.close(G);
      },
    });
  },

  buildLevelUp(G, P) {
    const area = this.frame(G, P, 'Shop level ' + G.state.level + '!', 520);
    const r = P.params.recipes || [];
    let y = area.y;
    if (r.length) {
      this.text(G, 'New recipe' + (r.length > 1 ? 's' : '') + ' unlocked:', area.x, y, area.w, 28, COLORS.ink, 'left',
        P.items, 'UI', 17);
      y += 44;
      r.forEach((rec) => {
        this.icon(G, rec.icon, area.x + 40, y + 36, 70, P.items, 'UI', 17);
        this.text(G, rec.name, area.x + 90, y + 8, 300, 30, COLORS.ink, 'left', P.items, 'UI', 17);
        rec.ingredients.forEach((id, j) =>
          this.icon(G, PS.data.ingredientById[id].icon, area.x + 110 + j * 50, y + 60, 40, P.items, 'UI', 17)
        );
        y += 100;
      });
      this.text(G, 'Buy the new herbs in the Herb shop.', area.x, y, area.w, 24, COLORS.muted, 'left', P.items, 'UI', 17);
      y += 40;
    } else {
      this.text(G, 'More customers will visit your shop!', area.x, y, area.w, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      y += 50;
    }
    this.button(G, P, area.x + area.w / 2 - 140, y + 10, 280, 76, 'BtnGreen', 'Great!', {
      size: 34,
      onTap: () => this.close(G),
    });
  },

  // ------------------------------------------------------------ overlays
  ensure(G, holder, key, name, z) {
    if (!holder[key]) {
      holder[key] = PS.create(G.scene, name, 0, 0, 'Overlay');
      if (z !== undefined) holder[key].setZOrder(z);
    }
    return holder[key];
  },

  hideAll(holder) {
    for (const k in holder) if (holder[k] && holder[k].hide) holder[k].hide(true);
  },

  // Speech bubble with an icon, a patience bar and an optional badge.
  updateCustomerOverlay(G, c) {
    c.ui = c.ui || {};
    const show = ['toQueue', 'queued', 'waitingOrder', 'ordered', 'toSeat'].includes(c.state);
    if (!show) {
      this.hideAll(c.ui);
      return;
    }
    const seated = c.state === 'waitingOrder' || c.state === 'ordered';
    const p = PS.proj.toScreen(c.obj.getX(), c.obj.getY(), seated ? PS.K.headSeated : PS.K.headStanding);
    if (!p) return;
    const [sx, sy] = p;
    const ratio = U.clamp(c.patience / c.maxPatience, 0, 1);
    // Neighbours at a long table: smaller bubbles, staggered in height.
    const crowded = c.seat && c.seat.slot.seats.length > 1;
    const k = crowded ? 0.78 : 1;
    const stagger = crowded ? (c.seat.slot.seats.indexOf(c.seat) % 2) * 36 : 0;
    const n = c.items.length;
    const isz = (n > 1 ? 36 : 44) * k;
    const bubble = this.ensure(G, c.ui, 'bubble', 'SpeechBubble', 1);
    bubble.hide(!seated);
    // Big orders overlap their icons so bubbles stay narrow at long tables.
    const step = n >= 3 ? isz * 0.62 : isz + 2;
    const bw = Math.max(62 * k, (n - 1) * step + isz + 18 * k);
    const bh = 67 * k;
    bubble.setWidth(bw);
    bubble.setHeight(bh);
    const bob = (c.state === 'waitingOrder' ? Math.sin(G.time * 5 + c.id) * 3 : 0) - stagger;
    bubble.setPosition(sx - bw / 2, sy - bh - 10 + bob);
    // One icon per potion ordered; delivered ones fade with a check mark.
    for (let i = 0; i < 5; i++) {
      const icon = this.ensure(G, c.ui, 'icon' + i, 'Icon', 2);
      const chk = this.ensure(G, c.ui, 'chk' + i, 'Icon', 3);
      const it = c.items[i];
      icon.hide(!seated || !it);
      chk.hide(!seated || !it || !it.done);
      if (!it || !seated) continue;
      icon.setAnimationName(it.recipe.icon);
      icon.setWidth(isz);
      icon.setHeight(isz);
      const ix = sx - ((n - 1) * step + isz) / 2 + i * step;
      icon.setPosition(ix, sy - bh - 4 * k + bob + (44 * k - isz) / 2);
      icon.setOpacity(it.done ? 100 : 255);
      if (it.done) {
        chk.setAnimationName('icon_check');
        chk.setWidth(isz * 0.55);
        chk.setHeight(isz * 0.55);
        chk.setPosition(ix + isz * 0.45, sy - bh + bob + isz * 0.4);
      }
    }
    const right = sx + bw / 2 - 15;
    // Badge: "needs order taking" or the owner's plan number.
    const badge = this.ensure(G, c.ui, 'badge', 'Icon', 3);
    const plan = PS.Workers.planIndex(G, c);
    const num = this.ensure(G, c.ui, 'num', 'UiText', 5);
    const numBack = this.ensure(G, c.ui, 'numBack', 'BtnPurple', 4);
    if (plan) {
      badge.hide(true);
      numBack.hide(false);
      num.hide(false);
      numBack.setWidth(30);
      numBack.setHeight(30);
      numBack.setPosition(right - 8, sy - bh - 22 + bob);
      num.setText(String(plan));
      num.setCharacterSize(20);
      num.setColor('255;255;255');
      num.setTextAlignment('center');
      num.setWrapping(true);
      num.setWrappingWidth(30);
      num.setPosition(right - 8, sy - bh - 19 + bob);
    } else {
      numBack.hide(true);
      num.hide(true);
      badge.hide(!seated);
      // An apprentice is on it, otherwise: needs order taking / waiting for a potion.
      const helper = PS.Workers.claimedBy(G, c);
      const a = helper && !helper.isOwner ? 'icon_workers' : c.state === 'waitingOrder' ? 'icon_order' : 'icon_hourglass';
      badge.setAnimationName(a);
      const s = c.state === 'waitingOrder' ? 30 + 4 * Math.sin(G.time * 8) : 24;
      badge.setWidth(s);
      badge.setHeight(s);
      badge.setPosition(right + 7 - s / 2, sy - bh - 10 - s / 2 + bob);
    }
    // Patience bar + mood
    const back = this.ensure(G, c.ui, 'barBack', 'BarBack', 1);
    const fill = this.ensure(G, c.ui, 'barFill', 'BarFill', 2);
    const mood = this.ensure(G, c.ui, 'mood', 'Icon', 3);
    const barW = 54 * k;
    back.hide(false);
    fill.hide(false);
    mood.hide(false);
    back.setWidth(barW);
    back.setHeight(12);
    back.setPosition(sx - barW / 2 + 8, sy - 8 - stagger);
    fill.setWidth(Math.max(6, (barW - 4) * ratio));
    fill.setHeight(8);
    fill.setPosition(sx - barW / 2 + 10, sy - 6 - stagger);
    fill.setColor(this.patienceColor(ratio));
    mood.setAnimationName(this.moodIcon(ratio));
    mood.setWidth(24);
    mood.setHeight(24);
    mood.setPosition(sx - barW / 2 - 18, sy - 14 - stagger);
    if (ratio < 0.2) {
      const blink = Math.sin(G.time * 12) > 0;
      mood.setOpacity(blink ? 255 : 120);
    } else mood.setOpacity(255);
  },

  removeCustomerOverlay(G, c) {
    if (!c.ui) return;
    for (const k in c.ui) PS.destroy(c.ui[k]);
    c.ui = null;
  },

  // Circular progress ring above a point. `holder` keeps the sprites.
  ring(G, holder, x, y, z, progress, color, iconName) {
    const p = PS.proj.toScreen(x, y, z);
    if (!p) return;
    const size = 64;
    const back = this.ensure(G, holder, 'ringBack', 'RingBack', 6);
    const fill = this.ensure(G, holder, 'ringFill', 'RingFill', 7);
    const icon = this.ensure(G, holder, 'ringIcon', 'Icon', 8);
    for (const o of [back, fill, icon]) o.hide(false);
    back.setWidth(size);
    back.setHeight(size);
    back.setPosition(p[0] - size / 2, p[1] - size / 2);
    fill.setWidth(size);
    fill.setHeight(size);
    fill.setPosition(p[0] - size / 2, p[1] - size / 2);
    fill.setAnimationFrame(Math.round(U.clamp(progress, 0, 1) * 48));
    fill.setColor(color);
    icon.setAnimationName(iconName);
    icon.setWidth(34);
    icon.setHeight(34);
    icon.setPosition(p[0] - 17, p[1] - 17);
  },

  hideRing(holder) {
    for (const k of ['ringBack', 'ringFill', 'ringIcon']) if (holder[k]) holder[k].hide(true);
  },

  updateCauldronOverlay(G, c) {
    c.ui = c.ui || {};
    const brewing = c.state === 'brewing';
    const done = c.state === 'done';
    if (brewing) this.ring(G, c.ui, c.x, c.y, PS.K.ringCauldron, c.t / c.dur, '190;130;255', c.recipe.icon);
    else this.hideRing(c.ui);
    const p = PS.proj.toScreen(c.x, c.y, PS.K.ringCauldron - 6);
    const bubble = this.ensure(G, c.ui, 'bubble', 'SpeechBubble', 1);
    const icon = this.ensure(G, c.ui, 'icon', 'Icon', 2);
    const glow = this.ensure(G, c.ui, 'glow', 'Glow', 0);
    const dirty = c.state === 'dirty';
    const show = done || dirty || c.state === 'reserved';
    bubble.hide(!show || !p);
    icon.hide(!show || !p);
    glow.hide(!done || !p);
    if (show && p) {
      const s = done ? 1 + 0.08 * Math.sin(G.time * 6) : 0.85;
      const bw = 66 * s;
      const bh = 71 * s;
      bubble.setWidth(bw);
      bubble.setHeight(bh);
      bubble.setPosition(p[0] - bw / 2, p[1] - bh);
      icon.setAnimationName(done ? c.recipe.icon : dirty ? 'icon_broom' : 'icon_hourglass');
      icon.setWidth(46 * s);
      icon.setHeight(46 * s);
      icon.setPosition(p[0] - 23 * s, p[1] - bh + 8 * s);
      glow.setWidth(130);
      glow.setHeight(130);
      glow.setPosition(p[0] - 65, p[1] - bh / 2 - 65);
      glow.setOpacity(120 + 60 * Math.sin(G.time * 4));
    }
    // Quality stars under a finished potion (none for Poor).
    for (let i = 0; i < 3; i++) {
      const st = this.ensure(G, c.ui, 'star' + i, 'Icon', 3);
      const on = done && p && c.quality >= 2 && i < c.quality;
      st.hide(!on);
      if (on) {
        st.setAnimationName('icon_star');
        st.setWidth(20);
        st.setHeight(20);
        st.setPosition(p[0] - 10 + (i - (c.quality - 1) / 2) * 20, p[1] - 6);
      }
    }
    // Plan badge
    const plan = PS.Workers.planIndex(G, c);
    const numBack = this.ensure(G, c.ui, 'numBack', 'BtnPurple', 4);
    const num = this.ensure(G, c.ui, 'num', 'UiText', 5);
    numBack.hide(!plan || !p);
    num.hide(!plan || !p);
    if (plan && p) {
      numBack.setWidth(30);
      numBack.setHeight(30);
      numBack.setPosition(p[0] + 26, p[1] - 70);
      num.setText(String(plan));
      num.setCharacterSize(20);
      num.setColor('255;255;255');
      num.setTextAlignment('center');
      num.setWrapping(true);
      num.setWrappingWidth(30);
      num.setPosition(p[0] + 26, p[1] - 67);
    }
  },

  updateWorkerOverlay(G, w) {
    w.ui = w.ui || {};
    const t = w.task;
    if (t && t.phase === 'act') {
      const info = PS.TASKS[t.type];
      this.ring(G, w.ui, w.obj.getX(), w.obj.getY(), PS.K.ringWorker, t.t / t.dur, info.color, info.icon);
    } else this.hideRing(w.ui);
    const carry = this.ensure(G, w.ui, 'carry', 'Icon', 3);
    if (w.carrying && !(t && t.phase === 'act')) {
      const p = PS.proj.toScreen(w.obj.getX(), w.obj.getY(), PS.K.carryZ);
      if (p) {
        carry.hide(false);
        carry.setAnimationName(w.carrying.icon);
        carry.setWidth(40);
        carry.setHeight(40);
        carry.setPosition(p[0] - 20, p[1] - 40 + Math.sin(G.time * 6) * 2);
      }
    } else carry.hide(true);
  },

  updateCounterOverlay(G) {
    const holder = (G.counterUi = G.counterUi || { icons: [], texts: [] });
    const entries = Object.entries(G.state.stock).filter(([, n]) => n > 0);
    const key = entries.map((e) => e.join(':')).join(',');
    const p = PS.proj.toScreen(G.counter.x, G.counter.y, 95);
    if (key !== holder.key) {
      holder.icons.concat(holder.texts).forEach((o) => PS.destroy(o));
      holder.icons = [];
      holder.texts = [];
      holder.key = key;
      for (const [id, n] of entries) {
        const r = PS.data.recipeById[id];
        holder.icons.push(this.icon(G, r.icon, 0, 0, 38, null, 'Overlay', 2));
        holder.texts.push(this.text(G, 'x' + n, 0, 0, 0, 20, '255;255;255', 'left', null, 'Overlay', 3, '40;24;16'));
      }
    }
    if (!p) return;
    holder.icons.forEach((o, i) => {
      const x = p[0] - (holder.icons.length * 52) / 2 + i * 52;
      o.setPosition(x, p[1] - 40);
      holder.texts[i].setPosition(x + 26, p[1] - 18);
    });
  },

  // Price tag above the next table/cauldron slot that can be bought.
  updateSlotOverlay(G, slot, upgradeId) {
    const u = PS.data.upgradeById[upgradeId];
    if (!slot.sign || !u) {
      if (slot.tag) {
        slot.tag.forEach((o) => PS.destroy(o));
        slot.tag = null;
      }
      return;
    }
    const x = slot.sign.getX();
    const y = slot.sign.getY();
    const p = PS.proj.toScreen(x, y, 80);
    if (!p) return;
    const locked = G.state.level < u.minShopLevel;
    const label = locked ? 'Lv ' + u.minShopLevel : U.formatGold(G.upgradeCost(u));
    if (!slot.tag || slot.tagLabel !== label) {
      if (slot.tag) slot.tag.forEach((o) => PS.destroy(o));
      slot.tag = [];
      slot.tagLabel = label;
      this.panelBox(G, 'PanelDark', 0, 0, 104, 42, slot.tag, 0).setLayer('Overlay');
      this.icon(G, locked ? 'icon_lock' : 'icon_coin', 0, 0, 30, slot.tag, 'Overlay', 1);
      this.text(G, label, 0, 0, 64, 24, locked ? '220;220;220' : COLORS.gold, 'left', slot.tag, 'Overlay', 1,
        '40;24;16');
    }
    const [back, icon, txt] = slot.tag;
    const bob = Math.sin(G.time * 3 + x) * 2;
    back.setPosition(p[0] - 52, p[1] - 21 + bob);
    icon.setPosition(p[0] - 46, p[1] - 15 + bob);
    txt.setPosition(p[0] - 12, p[1] - 14 + bob);
  },

  // Floating feedback text ("+15", "Too slow!")
  floatText(G, x, y, z, str, iconName) {
    const p = PS.proj.toScreen(x, y, z);
    if (!p) return;
    const items = [];
    const t = this.text(G, str, p[0] - 170, p[1] - 30, 340, str.length > 12 ? 24 : 30, '255;240;170', 'center', items,
      'Overlay', 30, '60;30;10');
    let ic = null;
    if (iconName) {
      ic = this.icon(G, iconName, p[0], p[1] - 58, 36, items, 'Overlay', 30);
    }
    G.ui.floats.push({ items, t: 0, life: 1.4 });
    void t;
    void ic;
  },

  toast(G, str) {
    if (G.ui.toast) G.ui.toast.items.forEach((o) => PS.destroy(o));
    const W = this.W(G);
    const items = [];
    const w = Math.min(W - 40, 640);
    // Sits over the owner's task line so it never covers a panel title.
    this.panelBox(G, 'PanelDark', W / 2 - w / 2, 84, w, 56, items, 40);
    this.text(G, str, W / 2 - w / 2 + 10, 97, w - 20, 26, '255;255;255', 'center', items, 'UI', 41);
    G.ui.toast = { items, t: 2.4 };
  },

  // ------------------------------------------------------------ input
  cursor(G) {
    const im = G.scene.getGame().getInputManager();
    const pt = G.scene.getLayer('UI').convertCoords(im.getCursorX(), im.getCursorY(), 0);
    return [pt[0], pt[1]];
  },

  inside(h, x, y) {
    return x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h;
  },

  handleInput(G) {
    const im = G.scene.getGame().getInputManager();
    const down = im.isMouseButtonPressed(0);
    // A quick tap can press and release between two frames: then only the
    // "released" flag is seen, and the tap position is the cursor position.
    const released = im.isMouseButtonReleased(0);
    const [x, y] = this.cursor(G);
    const ui = G.ui;
    if (down && !ui.wasDown) {
      ui.pressX = x;
      ui.pressY = y;
      ui.dragging = false;
      ui.scrollStart = ui.scroll;
    } else if (down && ui.wasDown && G.ui.panel && G.ui.panel.scroll && G.ui.panel.scroll.max > 0) {
      const P = G.ui.panel;
      if (!ui.dragging && Math.abs(y - ui.pressY) > 16 && this.inside(P.rect, ui.pressX, ui.pressY)) ui.dragging = true;
      if (ui.dragging) {
        const s = U.clamp(ui.scrollStart - Math.round((y - ui.pressY) / P.scroll.rowH), 0, P.scroll.max);
        if (s !== ui.scroll) {
          ui.scroll = s;
          this.rebuild(G);
        }
      }
    }
    if (!down && (ui.wasDown || released)) {
      if (!ui.wasDown) this.tap(G, x, y);
      else if (!ui.dragging) this.tap(G, ui.pressX, ui.pressY);
      ui.dragging = false;
    }
    ui.wasDown = down;
  },

  tap(G, x, y) {
    if (PS.Tutorial.handleTap(G, x, y)) return;
    const P = G.ui.panel;
    if (P) {
      for (let i = P.hits.length - 1; i >= 0; i--) {
        if (this.inside(P.hits[i], x, y)) {
          P.hits[i].fn();
          return;
        }
      }
    }
    const hud = G.ui.hud;
    for (let i = hud.hits.length - 1; i >= 0; i--) {
      if (this.inside(hud.hits[i], x, y)) {
        hud.hits[i].fn();
        return;
      }
    }
    if (P) {
      // Tapping the shop closes the open panel.
      this.close(G);
      return;
    }
    if (G.worldTap) G.worldTap(x, y);
    else PS.Input.worldTap(G, x, y);
  },

  // Floating texts and the toast message (also used by the garden scene).
  updateTransient(G, dt) {
    // Floating texts
    for (let i = G.ui.floats.length - 1; i >= 0; i--) {
      const f = G.ui.floats[i];
      f.t += dt;
      const a = U.clamp(1 - (f.t - f.life * 0.6) / (f.life * 0.4), 0, 1);
      for (const o of f.items) {
        o.setY(o.getY() - 40 * dt);
        o.setOpacity(255 * a);
      }
      if (f.t >= f.life) {
        f.items.forEach((o) => PS.destroy(o));
        G.ui.floats.splice(i, 1);
      }
    }
    if (G.ui.toast) {
      G.ui.toast.t -= dt;
      if (G.ui.toast.t <= 0) {
        G.ui.toast.items.forEach((o) => PS.destroy(o));
        G.ui.toast = null;
      }
    }
  },

  // ------------------------------------------------------------ frame
  update(G, dt) {
    this.handleInput(G);
    this.updateHud(G);
    for (const c of G.customers) this.updateCustomerOverlay(G, c);
    for (const c of G.cauldrons) if (c.unlocked) this.updateCauldronOverlay(G, c);
    for (const w of G.workers) this.updateWorkerOverlay(G, w);
    this.updateCounterOverlay(G);
    for (const st of G.slots) this.updateSlotOverlay(G, st, 'extra_table');
    for (const c of G.cauldrons) this.updateSlotOverlay(G, c, 'extra_cauldron');
    this.updateTransient(G, dt);
    // Live panels refresh a few times per second (timers, patience bars).
    G.ui.refreshTimer -= dt;
    const live = G.ui.panel && (['orders', 'workers', 'ad'].includes(G.ui.panel.name) || G.ui.dirty);
    if (live && G.ui.refreshTimer <= 0 && !G.ui.dragging) {
      G.ui.refreshTimer = 0.5;
      G.ui.dirty = false;
      if (G.ui.panel && G.ui.panel.name !== 'brew') this.rebuild(G);
    }
  },
};

// World taps: pick the closest tappable thing on screen.
PS.Input = {
  worldTap(G, x, y) {
    let best = null;
    let bestD = 78;
    const consider = (px, py, pz, kind, target, bonus) => {
      const p = PS.proj.toScreen(px, py, pz);
      if (!p) return;
      const d = Math.hypot(p[0] - x, p[1] - y) - (bonus || 0);
      if (d < bestD) {
        bestD = d;
        best = { kind, target };
      }
    };
    for (const c of G.customers) {
      if (['waitingOrder', 'ordered'].includes(c.state)) {
        consider(c.obj.getX(), c.obj.getY(), 50, 'customer', c, 10);
        consider(c.obj.getX(), c.obj.getY(), PS.K.headSeated + 25, 'customer', c, 10); // the speech bubble
      } else if (['queued', 'toQueue', 'toSeat'].includes(c.state)) consider(c.obj.getX(), c.obj.getY(), 45, 'customer', c);
    }
    for (const c of G.cauldrons) {
      if (c.unlocked) {
        consider(c.x, c.y, 45, 'cauldron', c);
        consider(c.x, c.y, 120, 'cauldron', c);
        if (c.spill) consider(c.x, c.y + 50, 2, 'cauldron', c, 10);
      } else if (c.sign) consider(c.x, c.y, 30, 'slot', 'cauldron');
    }
    for (const s of G.slots) if (s.sign) consider(s.x, s.y, 30, 'slot', 'table');
    consider(G.counter.x, G.counter.y, 50, 'counter', null, -10);
    if (!best) return;
    if (best.kind === 'customer') this.tapCustomer(G, best.target);
    else if (best.kind === 'cauldron') this.tapCauldron(G, best.target);
    else if (best.kind === 'slot') PS.UI.open(G, 'expand');
    else if (best.kind === 'counter') {
      const n = Object.values(G.state.stock).reduce((a, b) => a + b, 0);
      PS.UI.toast(G, n ? n + ' potion(s) waiting on the counter' : 'The counter is empty');
    }
  },

  tapCustomer(G, c) {
    if (c.state === 'waitingOrder') {
      PS.Workers.enqueue(G, { type: 'takeOrder', target: c });
    } else if (c.state === 'ordered') {
      const needed = PS.Order.needsAny(c);
      if (!needed.length) return PS.UI.toast(G, 'Their potions are on the way!');
      // A wanted potion waiting on the counter: bring it.
      const stocked = needed.find((i) => (G.state.stock[i.recipe.id] || 0) > 0);
      if (stocked) {
        PS.Workers.enqueue(G, { type: 'fetchStock', target: c, recipe: stocked.recipe });
        return;
      }
      for (const it of needed) {
        const ready = G.cauldrons.find((k) => k.state === 'done' && k.recipe.id === it.recipe.id);
        if (ready) return this.tapCauldron(G, ready);
      }
      const unplanned = needed.find((i) => PS.Brewing.plannedFor(G, i.recipe.id) <
        PS.World.wantedItems(G).filter((x) => x.recipe.id === i.recipe.id).length);
      if (!unplanned) return PS.UI.toast(G, 'Their potions are brewing...');
      const idle = PS.Brewing.idleCauldron(G);
      if (idle) PS.UI.open(G, 'brew', { cauldron: idle, slots: PS.Brewing.bestIngredients(G, unplanned.recipe) });
      else PS.UI.toast(G, 'Wants ' + unplanned.recipe.name + ' — all cauldrons are busy');
    } else {
      PS.UI.toast(G, 'Waiting for a free table');
    }
  },

  tapCauldron(G, c) {
    if (c.state === 'idle') {
      // Pre-fill with the oldest wanted potion nobody is making yet.
      const want = PS.World.uncoveredItem(G, null);
      PS.UI.open(G, 'brew', { cauldron: c, slots: want ? PS.Brewing.bestIngredients(G, want.recipe) : [] });
    } else if (c.state === 'done') {
      PS.Workers.enqueue(G, { type: 'collect', target: c });
    } else if (c.state === 'dirty') {
      PS.Workers.enqueue(G, { type: 'clean', target: c });
    } else if (c.state === 'brewing') {
      PS.UI.toast(G, c.recipe.name + ' ready in ' + U.formatTime(c.dur - c.t));
    } else {
      PS.UI.toast(G, 'Waiting for ingredients to be added');
    }
  },
};
