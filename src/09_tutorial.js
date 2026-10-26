// ===== Potion Shop: first-time tutorial =====
// A bouncing hand points at what to tap next and a banner explains it. The
// tutorial is a series of phases (saved in state.tutorialPhase):
//   first     take an order, brew, deliver the first potion
//   extra     brew with a bonus herb (extra ingredient) for Fine quality
//   upgrades  open the Upgrades tab and buy an upgrade
//   herbs     open the Herb shop and buy a bundle
//   garden    (from shop level 2) visit the Herb Garden, plant a herb, learn
//             about speed-ups and harvesting; gardenWait = waiting for level 2
// Inside a phase the step is chosen from the game state every frame, so the
// tutorial adapts to whatever the player does. The same code runs in the
// Garden scene (G is then the garden).
const PS = gdjs.PotionShop;
const U = PS.util;

PS.Tutorial = {
  PHASES: ['first', 'extra', 'upgrades', 'herbs', 'garden', 'gardenWait'],

  init(G) {
    const s = G.state;
    if (!this.PHASES.includes(s.tutorialPhase)) s.tutorialPhase = 'first';
    if (s.tutorialPhase === 'first' && s.served > 0) s.tutorialPhase = 'extra'; // old saves mid-tutorial
    G.tutorial = { active: !s.tutorialDone, items: [], last: '', flash: null, hand: null, skip: null, next: null };
    this.enterPhase(G, s.tutorialPhase);
  },

  // Remember the counters a phase waits on.
  enterPhase(G, phase) {
    const T = G.tutorial;
    const s = G.state;
    s.tutorialPhase = phase;
    T.served = s.served;
    T.extraBrewed = false;
    T.upgrades = Object.values(s.upgrades).reduce((a, b) => a + (b || 0), 0);
    T.herbs = Object.values(s.inventory).reduce((a, b) => a + (b || 0), 0);
    T.bought = false;
    (G.shop || G).requestSave();
  },

  // Show a short message, then go to the next phase.
  advance(G, text, phase, seconds) {
    G.tutorial.flash = { text, t: seconds || 3.5, phase };
  },

  finish(G) {
    const T = G.tutorial;
    T.active = false;
    T.items.forEach((o) => PS.destroy(o));
    T.items = [];
    if (!G.state.tutorialDone) {
      G.state.tutorialDone = true;
      (G.shop || G).saveNow();
    }
  },

  // Screen position of a button by its label (the hand's fingertip goes to its centre).
  hitPos(hits, label) {
    const h = hits && hits.find((x) => x.label === label);
    return h ? [h.x + h.w / 2, h.y + h.h / 2] : null;
  },
  panelHit(G, label) {
    return G.ui.panel ? this.hitPos(G.ui.panel.hits, label) : null;
  },
  hudHit(G, label) {
    return this.hitPos(G.ui.hud.hits, label);
  },

  // Hints shared by every shop phase: collecting, delivering, cleaning, brewing.
  serviceHint(G) {
    const owner = G.owner;
    if (owner.carrying) return { text: 'The owner delivers the potion to the customer who ordered it first.' };
    const ready = G.cauldrons.find((k) => k.unlocked && k.state === 'done');
    if (ready && !PS.Workers.isQueued(G, 'collect', ready)) {
      return { text: 'The potion is ready! Tap the cauldron to collect and deliver it.', world: [ready.x, ready.y, PS.K.ringCauldron] };
    }
    const dirty = G.cauldrons.find((k) => k.unlocked && k.state === 'dirty');
    if (dirty && !PS.Workers.isQueued(G, 'clean', dirty)) {
      return { text: 'Oops, an accident! Tap the cauldron to clean it.', world: [dirty.x, dirty.y, 90] };
    }
    if (G.cauldrons.some((k) => k.state === 'brewing' || k.state === 'reserved')) {
      return { text: 'Brewing! The circular ring shows the progress.' };
    }
    return null;
  },
  customerHint(G, text) {
    const seated = G.customers.find((c) => c.state === 'waitingOrder');
    if (!seated) return null;
    if (PS.Workers.isQueued(G, 'takeOrder', seated)) return { text: 'The owner is on the way to take the order.' };
    return { text, world: [seated.obj.getX(), seated.obj.getY(), PS.K.headSeated + 40] };
  },
  wantedHint(G, text) {
    const idle = PS.Brewing.idleCauldron(G);
    const want = PS.World.uncoveredItem(G, null);
    if (!want || !idle) return null;
    const name = want.recipe.name;
    const article = /^[AEIOU]/.test(name) ? 'an ' : 'a ';
    return { text: text.replace('{potion}', article + name), world: [idle.x, idle.y, 90] };
  },

  // ----- phases
  first(G) {
    const T = G.tutorial;
    if (G.state.served > T.served) {
      this.advance(G, 'Great job! You sold your first potion.', 'extra');
      return null;
    }
    const P = G.ui.panel;
    const s = this.serviceHint(G);
    if (s) return s;
    if (P && P.name === 'brew') {
      const at = this.panelHit(G, 'BREW');
      if (at) return { text: 'The recipe is filled in for you. Press BREW!', screen: at };
    }
    if (P) return { text: 'Close this panel to get back to the shop.' };
    return this.wantedHint(G, 'They want {potion}. Tap the cauldron to brew it.') ||
      this.customerHint(G, 'A customer is waiting! Tap them to take their order.') ||
      { text: 'Welcome to your potion shop! A customer is on the way...' };
  },

  extra(G) {
    const T = G.tutorial;
    const P = G.ui.panel;
    if (!T.extraBrewed && G.cauldrons.some((k) => (k.state === 'reserved' || k.state === 'brewing') && k.ingredients.length === 3)) {
      T.extraBrewed = true;
      T.served = G.state.served;
    }
    if (T.extraBrewed) {
      if (G.state.served > T.served) {
        this.advance(G, 'Better potions sell for more and make customers happier!', 'upgrades');
        return null;
      }
      return this.serviceHint(G) || this.wantedHint(G, 'They want {potion}. Tap the cauldron to brew it.') ||
        this.customerHint(G, 'Tap the customer to take their order.') ||
        { text: 'Deliver the better potion to a customer.' };
    }
    if (P && P.name === 'brew') {
      const slots = P.params.slots || [];
      const recipe = slots[0] && slots[1] ? PS.findRecipe([slots[0], slots[1]]) : null;
      if (!recipe) return { text: 'Tap a recipe in the recipe book, or pick two herbs that make a potion.' };
      const bonus = recipe.bonus && PS.data.ingredientById[recipe.bonus];
      if (!slots[2]) {
        const at = bonus ? this.panelHit(G, 'ing:' + bonus.id) : null;
        if (at && (G.state.inventory[bonus.id] || 0) > 0) {
          return { text: 'Add an extra herb! Every potion has a secret bonus herb. For ' + recipe.name + ' it is ' +
            bonus.name + ': tap it.', screen: at };
        }
        return { text: 'A third herb is optional. You can brew now.', screen: this.panelHit(G, 'BREW') };
      }
      if (bonus && slots[2] === bonus.id) {
        return { text: 'The bonus herb makes Fine quality. Press BREW!', screen: this.panelHit(G, 'BREW') };
      }
      return { text: 'Careful: a wrong extra herb makes Poor quality and may explode! Tap it to take it out.',
        screen: this.panelHit(G, 'slot:2') };
    }
    const s = this.serviceHint(G);
    if (s) return s;
    if (P) return { text: 'Close this panel to get back to the shop.' };
    return this.wantedHint(G, 'Let\'s make a better potion. They want {potion}: tap the cauldron.') ||
      this.customerHint(G, 'Next, let\'s make a better potion. Tap the customer to take their order.') ||
      { text: 'Next, let\'s make a better potion. Wait for the next customer...' };
  },

  upgrades(G) {
    const T = G.tutorial;
    const total = Object.values(G.state.upgrades).reduce((a, b) => a + (b || 0), 0);
    if (total > T.upgrades) {
      this.advance(G, 'Upgrade bought! Upgrades keep getting more powerful.', 'herbs');
      return null;
    }
    const P = G.ui.panel;
    if (P && P.name === 'upgrades') {
      const affordable = PS.data.upgrades.filter((u) => u.tab === 'upgrades' && this.panelHit(G, 'upgrade:' + u.id));
      if (affordable.length) {
        const u = affordable.reduce((a, b) => (G.upgradeCost(a) <= G.upgradeCost(b) ? a : b));
        return { text: 'Upgrades make your shop faster and richer. Buy ' + u.name + '!', screen: this.panelHit(G, 'upgrade:' + u.id) };
      }
      return { text: 'Upgrades make your shop faster and richer. Buy one when you have enough gold.',
        next: 'OK', onNext: () => this.advance(G, 'Next: the Herb shop.', 'herbs', 2) };
    }
    return { text: 'You earned some gold! Open the Upgrades tab.', screen: this.hudHit(G, 'tab:upgrades') };
  },

  herbs(G) {
    const T = G.tutorial;
    const total = Object.values(G.state.inventory).reduce((a, b) => a + (b || 0), 0);
    if (total > T.herbs) {
      this.advance(G, 'Herbs bought! Keep your pantry stocked so you can always brew.', 'garden');
      return null;
    }
    T.herbs = Math.min(T.herbs, total); // brewing uses herbs: only count purchases
    const P = G.ui.panel;
    if (P && P.name === 'ingredients') {
      // Point at the herb used by known recipes that is running lowest.
      const known = new Set(PS.Brewing.knownRecipes(G).flatMap((r) => r.ingredients));
      const inv = G.state.inventory;
      const list = PS.data.ingredients.filter((i) => known.has(i.id) && this.panelHit(G, 'buy:' + i.id));
      if (list.length) {
        const ing = list.reduce((a, b) => ((inv[a.id] || 0) <= (inv[b.id] || 0) ? a : b));
        return { text: 'Brewing uses up herbs. Buy a bundle of ' + ing.name + ' here.', screen: this.panelHit(G, 'buy:' + ing.id) };
      }
      return { text: 'Brewing uses up herbs: buy more here when you run low.',
        next: 'OK', onNext: () => this.advance(G, 'Next: the Herb Garden.', 'garden', 2) };
    }
    return { text: 'Herbs run out as you brew. Open the Herb shop.', screen: this.hudHit(G, 'tab:ingredients') };
  },

  garden(G) {
    if (G.state.level < PS.data.balance.gardenLevel) {
      return { text: 'At shop level ' + PS.data.balance.gardenLevel + ' you unlock a Herb Garden. Keep serving customers!',
        next: 'OK', onNext: () => this.enterPhase(G, 'gardenWait') };
    }
    const P = G.ui.panel;
    if (P && P.name === 'ingredients') {
      return { text: 'Your Herb Garden is open! Tap here to visit it.', screen: this.panelHit(G, 'garden') };
    }
    return { text: 'Your Herb Garden is open! Open the Herb shop.', screen: this.hudHit(G, 'tab:ingredients') };
  },

  gardenWait(G) {
    if (G.state.level >= PS.data.balance.gardenLevel) this.enterPhase(G, 'garden');
    return null; // nothing shown while waiting
  },

  // The garden scene (G is the garden).
  inGarden(G) {
    const P = G.ui.panel;
    const plots = G.plots.filter((p) => !p.isWell);
    const planted = plots.find((p) => p.state.planted);
    if (P && P.name === 'plant') {
      const options = G.plantable().filter((i) => this.panelHit(G, 'plant:' + i.id));
      const at = options.length ? this.panelHit(G, 'plant:' + options[0].id) : null;
      return { text: 'Pick a herb and pay for its seeds. Rarer herbs take longer to grow.', screen: at };
    }
    if (planted) {
      return { text: 'Herbs grow while you are away. Tap a growing plot to speed it up, a ripe one to harvest.',
        next: 'Got it', onNext: () => this.finish(G) };
    }
    if (P) return { text: 'Close this panel, then tap an empty plot.' };
    const p = plots[0];
    return { text: 'Welcome to your Herb Garden! Tap an empty plot to plant herbs.', world: p ? [p.x, p.y, 20] : null };
  },

  step(G) {
    const T = G.tutorial;
    if (T.flash) return { text: T.flash.text };
    const phase = G.state.tutorialPhase;
    if (G.plots) return phase === 'garden' ? this.inGarden(G) : null;
    return this[phase] ? this[phase](G) : null;
  },

  update(G, dt) {
    const T = G.tutorial;
    if (!T || !T.active) return;
    if (G.state.tutorialDone) return this.finish(G); // finished or skipped in the other scene
    if (T.flash) {
      T.flash.t -= dt;
      if (T.flash.t <= 0) {
        const next = T.flash.phase;
        T.flash = null;
        this.enterPhase(G, next);
      }
    }
    const s = this.step(G);
    const UI = PS.UI;
    const W = UI.W(G);
    const H = UI.H(G);
    let target = null;
    if (s && s.world) target = PS.proj.toScreen(s.world[0], s.world[1], s.world[2]);
    else if (s && s.screen) target = s.screen;
    // The banner sits above the bottom bar, or at the top when it would cover the target.
    const top = !!(target && target[1] > UI.bottom(G) - 330);
    const key = s ? s.text + '|' + (s.next || '') + '|' + top : '';
    if (key !== T.last) {
      // Rebuild the banner when the message changes.
      T.items.forEach((o) => PS.destroy(o));
      T.items = [];
      T.last = key;
      T.hand = null;
      T.skip = null;
      T.next = null;
      if (!s) return;
      const y = top ? 140 : UI.bottom(G) - 126 - 116;
      UI.panelBox(G, 'PanelDark', 14, y, W - 28, 108, T.items, 50);
      UI.icon(G, 'icon_book', 52, y + 54, 52, T.items, 'UI', 51);
      UI.text(G, s.text, 86, y + 10, W - 226, 21, '255;255;255', 'left', T.items, 'UI', 51);
      const bx = W - 130;
      if (s.next) {
        T.next = { x: bx, y: y + 10, w: 104, h: 42, fn: s.onNext };
        UI.panelBox(G, 'BtnGreen', T.next.x, T.next.y, T.next.w, T.next.h, T.items, 51);
        UI.text(G, s.next, T.next.x, T.next.y + 7, T.next.w, 22, '255;255;255', 'center', T.items, 'UI', 52);
      }
      T.skip = { x: bx, y: s.next ? y + 58 : y + 35, w: 104, h: 38 };
      UI.panelBox(G, 'BtnGray', T.skip.x, T.skip.y, T.skip.w, T.skip.h, T.items, 51);
      UI.text(G, s.next ? 'Skip all' : 'Skip', T.skip.x, T.skip.y + 7, T.skip.w, 20, '255;255;255', 'center', T.items, 'UI', 52);
      T.hand = UI.icon(G, 'icon_hand', 0, 0, 72, T.items, 'UI', 55);
      T.hand.flipY(true); // the icon points up: flipped, its fingertip is at the bottom centre
    } else if (!s) {
      return;
    }
    // Keep the onNext of the current step (closures can change between frames).
    if (T.next && s.onNext) T.next.fn = s.onNext;
    T.hand.hide(!target);
    if (target) {
      const bob = Math.abs(Math.sin(G.time * 5)) * 14;
      T.hand.setPosition(target[0] - 36, target[1] - 70 - bob);
    }
  },

  // The banner buttons are checked before other taps.
  handleTap(G, x, y) {
    const T = G.tutorial;
    if (!T || !T.active) return false;
    if (T.next && PS.UI.inside(T.next, x, y)) {
      const fn = T.next.fn;
      T.last = ''; // rebuild the banner
      if (fn) fn();
      PS.Audio.play(G.shop || G, 'tap');
      return true;
    }
    if (T.skip && PS.UI.inside(T.skip, x, y)) {
      this.finish(G);
      return true;
    }
    return false;
  },
};
