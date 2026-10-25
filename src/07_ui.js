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

  hit(list, x, y, w, h, fn) {
    list.push({ x, y, w, h, fn });
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
    if (!disabled && opts.onTap) this.hit(P.hits, x, y, w, h, opts.onTap);
    else if (disabled) this.hit(P.hits, x, y, w, h, opts.onDisabled || (() => {}));
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
    hud.xp = this.bar(G, L, 292, 58, 82, 12, 0, '120;200;255', 'UI', 11);
    this.panelBox(G, 'PanelDark', 392, 14, 136, 66, L, 10);
    hud.mood = this.icon(G, 'mood_happy', 424, 47, 46, L, 'UI', 11);
    hud.sat = this.text(G, '80%', 450, 26, 74, 30, '255;255;255', 'left', L, 'UI', 11, '40;24;16');
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
    hud.taskBack = this.panelBox(G, 'PanelDark', 12, 88, 220, 44, L, 10);
    hud.taskText = this.text(G, '', 22, 96, 200, 24, '255;255;255', 'left', L, 'UI', 11);
    // Bottom navigation
    const tabs = [
      ['orders', 'icon_orders', 'Orders'],
      ['ingredients', 'icon_bag', 'Herbs'],
      ['upgrades', 'icon_upgrades', 'Upgrades'],
      ['workers', 'icon_workers', 'Workers'],
      ['expand', 'icon_expand', 'Expand'],
    ];
    const navH = 118;
    this.panelBox(G, 'PanelWood', -10, H - navH - 8, W + 20, navH + 24, L, 10);
    const bw = (W - 24) / tabs.length;
    hud.tabs = {};
    tabs.forEach(([id, ic, label], i) => {
      const x = 12 + i * bw;
      const sel = this.panelBox(G, 'BtnGold', x + 4, H - navH + 6, bw - 8, navH - 20, L, 11);
      sel.hide(true);
      this.icon(G, ic, x + bw / 2, H - navH + 42, 54, L, 'UI', 12);
      this.text(G, label, x, H - navH + 68, bw, 22, '255;246;226', 'center', L, 'UI', 12, '60;36;20');
      hud.tabs[id] = sel;
      this.hit(hud.hits, x, H - navH - 4, bw, navH + 4, () => this.toggle(G, id));
    });
    hud.badge = {};
    hud.ordersBadge = this.panelBox(G, 'BtnRed', 12 + bw - 46, H - navH - 6, 38, 34, L, 13);
    hud.ordersBadgeText = this.text(G, '0', 12 + bw - 46, H - navH - 4, 38, 22, '255;255;255', 'center', L, 'UI', 14);
  },

  updateHud(G) {
    const hud = G.ui.hud;
    const s = G.state;
    hud.gold.setText(U.formatGold(s.gold));
    hud.level.setText('Lv ' + s.level);
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
    const bottom = H - 126;
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
    }
  },

  // ----- Brew panel: pick two ingredients (or a recipe) for a cauldron.
  buildBrew(G, P) {
    const c = P.params.cauldron;
    if (!P.params.slots) P.params.slots = [];
    const slots = P.params.slots;
    const area = this.frame(G, P, 'Brew a potion', 1000);
    const inv = G.state.inventory;
    const used = {};
    slots.forEach((id) => (used[id] = (used[id] || 0) + 1));
    // Slots + result
    let y = area.y;
    const cx = area.x + area.w / 2;
    const sz = 104;
    const xs = [cx - 250, cx - 110];
    for (let i = 0; i < 2; i++) {
      this.panelBox(G, 'PanelParchment', xs[i], y, sz, sz, P.items, 16);
      if (slots[i]) {
        this.icon(G, PS.data.ingredientById[slots[i]].icon, xs[i] + sz / 2, y + sz / 2, 76, P.items, 'UI', 17);
        this.hit(P.hits, xs[i], y, sz, sz, () => {
          slots.splice(i, 1);
          this.rebuild(G);
        });
      } else {
        this.text(G, '+', xs[i], y + 18, sz, 56, COLORS.muted, 'center', P.items, 'UI', 17);
      }
    }
    this.text(G, '+', cx - 146, y + 26, 36, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    this.text(G, '=', cx + 6, y + 26, 36, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    const rx = cx + 56;
    this.panelBox(G, 'PanelParchment', rx, y, sz, sz, P.items, 16);
    let result = null;
    if (slots.length === 2) {
      result = PS.findRecipe(slots);
      const known = result && result.unlockLevel <= G.state.level;
      this.icon(G, result && known ? result.icon : 'potion_sludge', rx + sz / 2, y + sz / 2, 80, P.items, 'UI', 17);
      this.text(G, result && known ? result.name : 'Murky Sludge (unknown mix)', rx + sz + 10, y + 18,
        area.x + area.w - rx - sz - 10, 26, result && known ? COLORS.ink : COLORS.red, 'left', P.items, 'UI', 17);
      if (result && known) {
        this.text(G, 'Sells for ~' + Math.round(result.price * G.mult('fine_bottles', +1)) + 'g', rx + sz + 10, y + 52,
          area.x + area.w - rx - sz - 10, 22, COLORS.muted, 'left', P.items, 'UI', 17);
      }
    } else {
      this.text(G, '?', rx, y + 18, sz, 56, COLORS.muted, 'center', P.items, 'UI', 17);
      this.text(G, 'Pick 2 ingredients', rx + sz + 10, y + 30, area.x + area.w - rx - sz - 10, 24, COLORS.muted,
        'left', P.items, 'UI', 17);
    }
    y += sz + 16;
    this.button(G, P, cx - 150, y, 300, 76, 'BtnGreen', 'BREW', {
      size: 38,
      icon: 'icon_brew',
      disabled: slots.length < 2,
      onTap: () => {
        if (PS.Brewing.request(G, c, slots)) this.close(G);
      },
      onDisabled: () => this.toast(G, 'Add two ingredients first'),
    });
    y += 92;
    // Ingredients grid
    this.text(G, 'Ingredients', area.x, y, area.w, 28, COLORS.ink, 'left', P.items, 'UI', 16);
    y += 36;
    const ings = PS.data.ingredients.filter((i) => i.unlockLevel <= G.state.level);
    const cols = 4;
    const cw = area.w / cols;
    const ch = 112;
    ings.forEach((ing, k) => {
      const x = area.x + (k % cols) * cw;
      const yy = y + Math.floor(k / cols) * ch;
      const left = (inv[ing.id] || 0) - (used[ing.id] || 0);
      this.panelBox(G, left > 0 ? 'PanelParchment' : 'BtnGray', x + 4, yy, cw - 8, ch - 8, P.items, 16);
      this.icon(G, ing.icon, x + cw / 2, yy + 38, 60, P.items, 'UI', 17);
      this.text(G, ing.name, x, yy + 66, cw, 20, COLORS.ink, 'center', P.items, 'UI', 17);
      const cnt = this.text(G, 'x' + left, x + cw - 50, yy + 4, 44, 22, left <= 2 ? COLORS.red : COLORS.green, 'right',
        P.items, 'UI', 17);
      void cnt;
      this.hit(P.hits, x + 4, yy, cw - 8, ch - 8, () => {
        if (left <= 0) {
          this.toast(G, 'Out of ' + ing.name + ' — buy more in Herbs');
          return;
        }
        if (slots.length >= 2) slots.shift();
        slots.push(ing.id);
        PS.Audio.play(G, 'tap');
        this.rebuild(G);
      });
    });
    y += Math.ceil(ings.length / cols) * ch + 6;
    // Recipe book (rows with waiting orders first)
    this.text(G, 'Recipe book — tap to fill', area.x, y, area.w, 26, COLORS.ink, 'left', P.items, 'UI', 16);
    y += 34;
    const pend = PS.World.pendingOrders(G).concat(G.customers.filter((cc) => cc.state === 'waitingOrder'));
    const recipes = PS.Brewing.knownRecipes(G)
      .map((r) => ({ r, n: pend.filter((cc) => cc.recipe.id === r.id).length }))
      .sort((a, b) => b.n - a.n);
    const rh = 64;
    const room = Math.max(1, Math.floor((area.y + area.h - y) / rh));
    recipes.slice(0, room).forEach(({ r, n }, k) => {
      const yy = y + k * rh;
      const ok = PS.Brewing.canBrew(G, r);
      this.panelBox(G, 'PanelParchment', area.x, yy, area.w, rh - 6, P.items, 16);
      this.icon(G, r.icon, area.x + 32, yy + 29, 48, P.items, 'UI', 17);
      this.text(G, r.name, area.x + 62, yy + 14, 220, 26, COLORS.ink, 'left', P.items, 'UI', 17);
      r.ingredients.forEach((id, j) => {
        const ing = PS.data.ingredientById[id];
        this.icon(G, ing.icon, area.x + 300 + j * 52, yy + 29, 40, P.items, 'UI', 17);
        if ((inv[id] || 0) <= 0) this.icon(G, 'icon_close', area.x + 316 + j * 52, yy + 44, 18, P.items, 'UI', 18);
      });
      if (n > 0) {
        this.panelBox(G, 'BtnRed', area.x + area.w - 118, yy + 10, 108, 38, P.items, 17);
        this.text(G, n + ' wanted', area.x + area.w - 118, yy + 16, 108, 22, '255;255;255', 'center', P.items, 'UI', 18);
      }
      this.hit(P.hits, area.x, yy, area.w, rh - 6, () => {
        if (!ok) this.toast(G, 'Missing ingredients for ' + r.name);
        P.params.slots = r.ingredients.slice();
        this.rebuild(G);
      });
    });
  },

  // ----- Orders panel
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
      const r = c.recipe;
      this.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, r.icon, x + 46, y + h / 2, 72, P.items, 'UI', 17);
      this.text(G, r.name, x + 90, y + 10, 260, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      r.ingredients.forEach((id, j) => {
        this.icon(G, PS.data.ingredientById[id].icon, x + 108 + j * 44, y + 62, 38, P.items, 'UI', 17);
      });
      const ratio = c.patience / c.maxPatience;
      this.icon(G, this.moodIcon(ratio), x + 214, y + 62, 30, P.items, 'UI', 17);
      this.bar(G, P.items, x + 234, y + 53, 120, 18, ratio, this.patienceColor(ratio), 'UI', 17);
      let status = 'Tap customer to take order';
      let col = COLORS.muted;
      if (c.state === 'ordered') {
        const brewing = G.cauldrons.find((k) => k.recipe && k.recipe.id === r.id && k.state === 'brewing');
        const ready = G.cauldrons.find((k) => k.recipe && k.recipe.id === r.id && k.state === 'done');
        if (c.deliveryReserved) (status = 'On the way!'), (col = COLORS.green);
        else if (ready) (status = 'Ready in cauldron'), (col = COLORS.green);
        else if ((G.state.stock[r.id] || 0) > 0) (status = 'On the counter'), (col = COLORS.green);
        else if (brewing) (status = 'Brewing...'), (col = '120;80;200');
        else (status = 'Waiting for potion'), (col = COLORS.red);
      }
      this.text(G, status, x + 90, y + 84, 300, 20, col, 'left', P.items, 'UI', 17);
      const pay = Math.round(r.price * G.mult('fine_bottles', +1) * c.type.tip * (1 + PS.data.balance.tipMax * ratio));
      this.icon(G, 'icon_coin', x + w - 196, y + 26, 30, P.items, 'UI', 17);
      this.text(G, '~' + pay, x + w - 178, y + 12, 70, 26, '170;120;20', 'left', P.items, 'UI', 17);
      if (c.state === 'waitingOrder') {
        this.button(G, P, x + w - 150, y + h - 62, 140, 54, 'BtnBlue', 'Take', {
          size: 26,
          onTap: () => {
            PS.Workers.enqueue(G, { type: 'takeOrder', target: c });
            this.rebuild(G);
          },
        });
      } else {
        const idle = PS.Brewing.idleCauldron(G);
        const can = PS.Brewing.canBrew(G, r);
        this.button(G, P, x + w - 150, y + h - 62, 140, 54, 'BtnGreen', 'Brew', {
          size: 26,
          disabled: !idle || !can,
          onTap: () => {
            if (PS.Brewing.request(G, idle, r.ingredients)) this.rebuild(G);
          },
          onDisabled: () => this.toast(G, !idle ? 'All cauldrons are busy' : 'Missing ingredients'),
        });
      }
    });
    this.list(G, P, area, 132, rows);
  },

  // ----- Ingredient shop
  buildIngredients(G, P) {
    const area = this.frame(G, P, 'Herb shop', 1000);
    const inv = G.state.inventory;
    const rows = PS.data.ingredients.map((ing) => (x, y, w, h) => {
      const locked = ing.unlockLevel > G.state.level;
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, ing.icon, x + 46, y + h / 2, 70, P.items, 'UI', 17);
      this.text(G, ing.name, x + 92, y + 12, 240, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      if (locked) {
        this.icon(G, 'icon_lock', x + w - 60, y + h / 2, 44, P.items, 'UI', 17);
        this.text(G, 'Unlocks at shop level ' + ing.unlockLevel, x + 92, y + 52, 330, 22, COLORS.muted, 'left',
          P.items, 'UI', 17);
        return;
      }
      const n = inv[ing.id] || 0;
      this.text(G, 'In stock: ' + n + (n <= 2 ? '  LOW!' : ''), x + 92, y + 50, 240, 24, n <= 2 ? COLORS.red : COLORS.green,
        'left', P.items, 'UI', 17);
      const cost = ing.cost * ing.bundle;
      this.button(G, P, x + w - 200, y + 14, 190, h - 28, 'BtnGold', '+' + ing.bundle + '  ' + cost + 'g', {
        size: 26,
        disabled: G.state.gold < cost,
        onTap: () => {
          G.addGold(-cost);
          inv[ing.id] = n + ing.bundle;
          PS.Audio.play(G, 'buy');
          G.requestSave();
          this.rebuild(G);
        },
        onDisabled: () => this.toast(G, 'Not enough gold'),
      });
    });
    this.list(G, P, area, 108, rows);
  },

  // ----- Upgrades and expansion (same data table, different tab)
  buildUpgrades(G, P, tab) {
    const area = this.frame(G, P, tab === 'expand' ? 'Expand the shop' : 'Upgrades', 900);
    const ups = PS.data.upgrades.filter((u) => u.tab === tab);
    const rows = ups.map((u) => (x, y, w, h) => {
      const lvl = G.state.upgrades[u.id] || 0;
      const maxed = lvl >= G.upgradeMax(u);
      const locked = G.state.level < u.minShopLevel;
      const cost = G.upgradeCost(u);
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, u.icon, x + 44, y + h / 2, 64, P.items, 'UI', 17);
      this.text(G, u.name, x + 88, y + 10, 300, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      this.text(G, u.desc, x + 88, y + 44, w - 300, 20, COLORS.muted, 'left', P.items, 'UI', 17);
      this.text(G, G.upgradeStatus(u), x + 88, y + h - 32, 300, 22, '60;110;160', 'left', P.items, 'UI', 17);
      if (locked) {
        this.icon(G, 'icon_lock', x + w - 120, y + h / 2 - 10, 40, P.items, 'UI', 17);
        this.text(G, 'Shop Lv ' + u.minShopLevel, x + w - 200, y + h / 2 + 14, 170, 22, COLORS.muted, 'center', P.items,
          'UI', 17);
      } else if (maxed) {
        this.text(G, 'MAX', x + w - 190, y + h / 2 - 18, 170, 32, COLORS.green, 'center', P.items, 'UI', 17);
      } else {
        this.button(G, P, x + w - 200, y + h / 2 - 34, 190, 68, 'BtnGold', cost + 'g', {
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
    this.list(G, P, area, 132, rows);
  },

  buildWorkers(G, P) {
    const area = this.frame(G, P, 'Workers', 620);
    let y = area.y;
    this.panelBox(G, 'PanelParchment', area.x, y, area.w, 150, P.items, 16);
    this.icon(G, 'icon_workers', area.x + 56, y + 75, 84, P.items, 'UI', 17);
    this.text(G, 'You — the shop owner', area.x + 110, y + 16, area.w - 130, 30, COLORS.ink, 'left', P.items, 'UI', 17);
    const sp = Math.round(100 * G.mult('swift_shoes', +1));
    const hands = Math.round(100 / G.mult('quick_hands', -1));
    this.text(G, 'Speed ' + sp + '%   ·   Work speed ' + hands + '%\nTakes orders, brews, collects and delivers.',
      area.x + 110, y + 56, area.w - 130, 22, COLORS.muted, 'left', P.items, 'UI', 17);
    y += 166;
    this.panelBox(G, 'BtnGray', area.x, y, area.w, 150, P.items, 16);
    this.icon(G, 'icon_lock', area.x + 56, y + 75, 64, P.items, 'UI', 17);
    this.text(G, 'Hire an apprentice', area.x + 110, y + 16, area.w - 130, 30, '255;255;255', 'left', P.items, 'UI', 17);
    this.text(G, 'Apprentices who brew, deliver and clean on their own arrive in the next update (Milestone 3).',
      area.x + 110, y + 56, area.w - 130, 22, '240;240;240', 'left', P.items, 'UI', 17);
    y += 166;
    this.text(G, 'Tip: tap things in the shop to give the owner tasks. Up to ' + PS.Workers.MAX_QUEUE +
      ' tasks are queued; numbers show the order.', area.x, y, area.w, 22, COLORS.muted, 'left', P.items, 'UI', 16);
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
    this.button(G, P, area.x, y, area.w, 80, 'BtnPurple', G.settings.sound ? 'Sound: ON' : 'Sound: OFF', {
      icon: 'icon_sound',
      onTap: () => {
        G.settings.sound = !G.settings.sound;
        G.saveSettings();
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
    this.text(G, 'Potion Shop · Milestone 1 build · progress saves automatically', area.x, y, area.w, 20, COLORS.muted,
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
    const bubble = this.ensure(G, c.ui, 'bubble', 'SpeechBubble', 1);
    bubble.hide(!seated);
    const bw = 62;
    const bh = 67;
    bubble.setWidth(bw);
    bubble.setHeight(bh);
    const bob = c.state === 'waitingOrder' ? Math.sin(G.time * 5 + c.id) * 3 : 0;
    bubble.setPosition(sx - bw / 2, sy - bh - 10 + bob);
    const icon = this.ensure(G, c.ui, 'icon', 'Icon', 2);
    icon.hide(!seated);
    icon.setAnimationName(c.recipe.icon);
    icon.setWidth(44);
    icon.setHeight(44);
    icon.setPosition(sx - 22, sy - bh - 4 + bob);
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
      numBack.setPosition(sx + 16, sy - bh - 22 + bob);
      num.setText(String(plan));
      num.setCharacterSize(20);
      num.setColor('255;255;255');
      num.setTextAlignment('center');
      num.setWrapping(true);
      num.setWrappingWidth(30);
      num.setPosition(sx + 16, sy - bh - 19 + bob);
    } else {
      numBack.hide(true);
      num.hide(true);
      badge.hide(!seated);
      const a = c.state === 'waitingOrder' ? 'icon_order' : 'icon_hourglass';
      badge.setAnimationName(a);
      const s = c.state === 'waitingOrder' ? 30 + 4 * Math.sin(G.time * 8) : 24;
      badge.setWidth(s);
      badge.setHeight(s);
      badge.setPosition(sx + 22 - s / 2, sy - bh - 10 - s / 2 + bob);
    }
    // Patience bar + mood
    const back = this.ensure(G, c.ui, 'barBack', 'BarBack', 1);
    const fill = this.ensure(G, c.ui, 'barFill', 'BarFill', 2);
    const mood = this.ensure(G, c.ui, 'mood', 'Icon', 3);
    const barW = 54;
    back.hide(false);
    fill.hide(false);
    mood.hide(false);
    back.setWidth(barW);
    back.setHeight(12);
    back.setPosition(sx - barW / 2 + 8, sy - 8);
    fill.setWidth(Math.max(6, (barW - 4) * ratio));
    fill.setHeight(8);
    fill.setPosition(sx - barW / 2 + 10, sy - 6);
    fill.setColor(this.patienceColor(ratio));
    mood.setAnimationName(this.moodIcon(ratio));
    mood.setWidth(24);
    mood.setHeight(24);
    mood.setPosition(sx - barW / 2 - 18, sy - 14);
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
    const show = done || c.state === 'reserved';
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
      icon.setAnimationName(done ? c.recipe.icon : 'icon_hourglass');
      icon.setWidth(46 * s);
      icon.setHeight(46 * s);
      icon.setPosition(p[0] - 23 * s, p[1] - bh + 8 * s);
      glow.setWidth(130);
      glow.setHeight(130);
      glow.setPosition(p[0] - 65, p[1] - bh / 2 - 65);
      glow.setOpacity(120 + 60 * Math.sin(G.time * 4));
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
    const label = locked ? 'Lv ' + u.minShopLevel : String(G.upgradeCost(u));
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
    const t = this.text(G, str, p[0] - 100, p[1] - 30, 200, 30, '255;240;170', 'center', items, 'Overlay', 30,
      '60;30;10');
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
    this.panelBox(G, 'PanelDark', W / 2 - w / 2, 150, w, 60, items, 40);
    this.text(G, str, W / 2 - w / 2 + 10, 165, w - 20, 26, '255;255;255', 'center', items, 'UI', 41);
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
    PS.Input.worldTap(G, x, y);
  },

  // ------------------------------------------------------------ frame
  update(G, dt) {
    this.handleInput(G);
    this.updateHud(G);
    for (const c of G.customers) this.updateCustomerOverlay(G, c);
    for (const c of G.cauldrons) if (c.unlocked) this.updateCauldronOverlay(G, c);
    for (const w of G.workers) this.updateWorkerOverlay(G, w);
    this.updateCounterOverlay(G);
    for (const st of G.seats) this.updateSlotOverlay(G, st, 'extra_table');
    for (const c of G.cauldrons) this.updateSlotOverlay(G, c, 'extra_cauldron');
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
    // Live panels refresh a few times per second (timers, patience bars).
    G.ui.refreshTimer -= dt;
    const live = G.ui.panel && (G.ui.panel.name === 'orders' || G.ui.dirty);
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
      } else if (c.sign) consider(c.x, c.y, 30, 'slot', 'cauldron');
    }
    for (const s of G.seats) if (s.sign) consider(s.obj.getX(), s.obj.getY(), 30, 'slot', 'table');
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
      if (c.deliveryReserved) return PS.UI.toast(G, 'Their potion is on the way!');
      if ((G.state.stock[c.recipe.id] || 0) > 0) {
        PS.Workers.enqueue(G, { type: 'fetchStock', target: c });
        return;
      }
      const ready = G.cauldrons.find((k) => k.state === 'done' && k.recipe.id === c.recipe.id);
      if (ready) return this.tapCauldron(G, ready);
      const brewing = G.cauldrons.find((k) => (k.state === 'brewing' || k.state === 'reserved') && k.recipe.id === c.recipe.id);
      if (brewing) return PS.UI.toast(G, c.recipe.name + ' is brewing...');
      const idle = PS.Brewing.idleCauldron(G);
      if (idle) PS.UI.open(G, 'brew', { cauldron: idle, slots: c.recipe.ingredients.slice() });
      else PS.UI.toast(G, 'Wants a ' + c.recipe.name + ' — all cauldrons are busy');
    } else {
      PS.UI.toast(G, 'Waiting for a free table');
    }
  },

  tapCauldron(G, c) {
    if (c.state === 'idle') {
      // Pre-fill with the oldest order that is not covered yet.
      const orders = PS.World.pendingOrders(G);
      const want = orders.find((o) => PS.Brewing.plannedFor(G, o.recipe.id) < orders.filter((x) => x.recipe.id === o.recipe.id).length);
      PS.UI.open(G, 'brew', { cauldron: c, slots: want ? want.recipe.ingredients.slice() : [] });
    } else if (c.state === 'done') {
      PS.Workers.enqueue(G, { type: 'collect', target: c });
    } else if (c.state === 'brewing') {
      PS.UI.toast(G, c.recipe.name + ' ready in ' + U.formatTime(c.dur - c.t));
    } else {
      PS.UI.toast(G, 'Waiting for ingredients to be added');
    }
  },
};
