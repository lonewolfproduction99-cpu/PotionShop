// ===== Potion Shop: first-time tutorial =====
// Guides a new player through the first order: a bouncing hand points at
// what to tap next and a banner explains it. The step is chosen from the
// game state every frame, so the tutorial adapts to whatever the player does.
// It ends after the first potion is delivered (or when skipped).
const PS = gdjs.PotionShop;
const U = PS.util;

PS.Tutorial = {
  init(G) {
    G.tutorial = { active: !G.state.tutorialDone && G.state.served === 0, items: [], finishTimer: 0, last: '' };
    if (!G.tutorial.active) G.state.tutorialDone = true;
  },

  finish(G) {
    G.tutorial.active = false;
    G.state.tutorialDone = true;
    G.tutorial.items.forEach((o) => PS.destroy(o));
    G.tutorial.items = [];
    G.saveNow();
  },

  // What to point at: { text, world: [x, y, z] } or { text, screen: [x, y] }.
  step(G) {
    const T = G.tutorial;
    if (T.finishTimer > 0) return { text: 'Great job! Earn gold, buy herbs and upgrades, and grow your shop.' };
    const P = G.ui.panel;
    const ordered = G.customers.filter((c) => c.state === 'ordered');
    const ready = G.cauldrons.find((k) => k.unlocked && k.state === 'done');
    const owner = G.owner;
    if (owner.carrying) return { text: 'The owner delivers the potion to the customer who ordered it first.' };
    if (ready && !PS.Workers.isQueued(G, 'collect', ready)) {
      return { text: 'The potion is ready! Tap the cauldron to collect and deliver it.', world: [ready.x, ready.y, PS.K.ringCauldron] };
    }
    if (P && P.name === 'brew') {
      const h = P.hits.find((x) => x.label === 'BREW');
      if (h) return { text: 'The recipe is filled in for you. Press BREW!', screen: [h.x + h.w / 2, h.y + 4] };
    }
    if (P) return { text: 'Close this panel to get back to the shop.' };
    const brewing = G.cauldrons.find((k) => k.state === 'brewing' || k.state === 'reserved');
    if (brewing) return { text: 'Brewing! The circular ring shows the progress.' };
    const idle = PS.Brewing.idleCauldron(G);
    const uncovered = ordered.find((c) => PS.Brewing.plannedFor(G, c.recipe.id) === 0);
    if (uncovered && idle) {
      const name = uncovered.recipe.name;
      const article = /^[AEIOU]/.test(name) ? 'an ' : 'a ';
      return { text: 'They want ' + article + name + '. Tap the cauldron to brew it.', world: [idle.x, idle.y, 90] };
    }
    const seated = G.customers.find((c) => c.state === 'waitingOrder');
    if (seated) {
      if (PS.Workers.isQueued(G, 'takeOrder', seated)) return { text: 'The owner is on the way to take the order.' };
      return { text: 'A customer is waiting! Tap them to take their order.', world: [seated.obj.getX(), seated.obj.getY(), PS.K.headSeated + 40] };
    }
    return { text: 'Welcome to your potion shop! A customer is on the way...' };
  },

  update(G, dt) {
    const T = G.tutorial;
    if (!T || !T.active) return;
    if (G.state.served > 0 && T.finishTimer <= 0) T.finishTimer = 5;
    if (T.finishTimer > 0) {
      T.finishTimer -= dt;
      if (T.finishTimer <= 0) return this.finish(G);
    }
    const s = this.step(G);
    const UI = PS.UI;
    const W = UI.W(G);
    const H = UI.H(G);
    if (s.text !== T.last) {
      // Rebuild the banner when the message changes.
      T.items.forEach((o) => PS.destroy(o));
      T.items = [];
      T.last = s.text;
      const y = H - 126 - 92;
      UI.panelBox(G, 'PanelDark', 14, y, W - 28, 82, T.items, 50);
      UI.icon(G, 'icon_book', 52, y + 41, 52, T.items, 'UI', 51);
      UI.text(G, s.text, 86, y + 12, W - 230, 25, '255;255;255', 'left', T.items, 'UI', 51);
      T.skip = { x: W - 130, y: y + 18, w: 104, h: 46 };
      UI.panelBox(G, 'BtnGray', T.skip.x, T.skip.y, T.skip.w, T.skip.h, T.items, 51);
      UI.text(G, 'Skip', T.skip.x, T.skip.y + 9, T.skip.w, 24, '255;255;255', 'center', T.items, 'UI', 52);
      T.hand = UI.icon(G, 'icon_hand', 0, 0, 72, T.items, 'UI', 55);
    }
    let target = null;
    if (s.world) target = PS.proj.toScreen(s.world[0], s.world[1], s.world[2]);
    else if (s.screen) target = s.screen;
    T.hand.hide(!target);
    if (target) {
      const bob = Math.abs(Math.sin(G.time * 5)) * 14;
      T.hand.setPosition(target[0] - 36, target[1] - 78 - bob);
    }
  },

  // The Skip button is checked before other taps.
  handleTap(G, x, y) {
    const T = G.tutorial;
    if (!T || !T.active || !T.skip) return false;
    if (PS.UI.inside(T.skip, x, y)) {
      this.finish(G);
      return true;
    }
    return false;
  },
};
