// ===== Potion Shop: brewing =====
// Cauldron states: idle -> reserved (ingredients paid, owner on the way)
// -> brewing (timer, circular progress) -> done (potion ready to collect).
const PS = gdjs.PotionShop;
const U = PS.util;

PS.SLUDGE = {
  id: 'sludge',
  name: 'Murky Sludge',
  ingredients: [],
  price: 0,
  brewTime: 5,
  color: '110;122;74',
  icon: 'potion_sludge',
  unlockLevel: 1,
};

PS.Brewing = {
  // Player confirmed a brew in the cauldron panel.
  request(G, cauldron, ingredientIds) {
    if (cauldron.state !== 'idle') return false;
    const inv = G.state.inventory;
    const need = {};
    for (const id of ingredientIds) need[id] = (need[id] || 0) + 1;
    for (const id in need) {
      if ((inv[id] || 0) < need[id]) {
        PS.UI.toast(G, 'Not enough ' + (PS.data.ingredientById[id] || { name: id }).name);
        return false;
      }
    }
    if (!PS.Workers.enqueue(G, { type: 'startBrew', target: cauldron })) return false;
    this.reserve(G, cauldron, ingredientIds);
    return true;
  },

  // Pay the ingredients and hold the cauldron until a worker adds them.
  reserve(G, cauldron, ingredientIds) {
    if (cauldron.state !== 'idle') return false;
    const inv = G.state.inventory;
    for (const id of ingredientIds) {
      if ((inv[id] || 0) < ingredientIds.filter((x) => x === id).length) return false;
    }
    for (const id of ingredientIds) inv[id] -= 1;
    const recipe = PS.findRecipe(ingredientIds);
    cauldron.state = 'reserved';
    cauldron.recipe = recipe || PS.SLUDGE;
    cauldron.ingredients = ingredientIds.slice();
    G.requestSave();
    PS.UI.markDirty(G);
    return true;
  },

  cancelReservation(G, c) {
    for (const id of c.ingredients) G.state.inventory[id] = (G.state.inventory[id] || 0) + 1;
    c.state = 'idle';
    c.recipe = null;
    c.ingredients = [];
    PS.UI.markDirty(G);
  },

  start(G, c) {
    if (c.state !== 'reserved') return;
    c.state = 'brewing';
    c.t = 0;
    c.dur = c.recipe.brewTime * G.mult('quick_brew', -1);
    c.liquid.hide(false);
    c.liquid.setColor(c.recipe.color);
    c.liquid.setZ(PS.K.liquidZ);
    PS.UI.markDirty(G);
  },

  collect(G, c) {
    if (c.state !== 'done') return null;
    const r = c.recipe;
    c.state = 'idle';
    c.recipe = null;
    c.ingredients = [];
    c.liquid.hide(true);
    PS.Audio.play(G, 'pop');
    PS.UI.markDirty(G);
    return r;
  },

  update(G, dt) {
    for (const c of G.cauldrons) {
      if (!c.unlocked) continue;
      if (c.state === 'brewing') {
        c.t += dt;
        // Liquid rises slightly while brewing.
        c.liquid.setZ(PS.K.liquidZ + PS.K.liquidRise * Math.min(1, c.t / c.dur));
        c.bubbleTimer -= dt;
        if (c.bubbleTimer <= 0) {
          c.bubbleTimer = 0.22;
          PS.FX.bubble(G, c.x + U.rand(-22, 22), c.y + U.rand(-22, 22), PS.K.potTop - 4, c.recipe.color,
            U.rand(30, 60), U.rand(0.7, 1.2), U.rand(4, 8));
        }
        if (c.t >= c.dur) {
          c.state = 'done';
          PS.FX.sparkleAt(G, c.x, c.y, PS.K.potTop);
          PS.Audio.play(G, 'ready');
          PS.UI.markDirty(G);
        }
      } else if (c.state === 'done') {
        c.bubbleTimer -= dt;
        if (c.bubbleTimer <= 0) {
          c.bubbleTimer = 0.12;
          PS.FX.bubble(G, c.x + U.rand(-24, 24), c.y + U.rand(-24, 24), PS.K.potTop, '255;245;200',
            U.rand(50, 100), U.rand(0.5, 0.9), U.rand(3, 5));
        }
      }
    }
  },

  // Recipes the player knows (unlocked by shop level).
  knownRecipes(G) {
    return PS.data.recipes.filter((r) => r.unlockLevel <= G.state.level);
  },

  idleCauldron(G) {
    return G.cauldrons.find((c) => c.unlocked && c.state === 'idle') || null;
  },

  canBrew(G, recipe) {
    const need = {};
    for (const id of recipe.ingredients) need[id] = (need[id] || 0) + 1;
    for (const id in need) if ((G.state.inventory[id] || 0) < need[id]) return false;
    return true;
  },

  // Potions already planned for a recipe (brewing, ready, carried, stored).
  plannedFor(G, recipeId) {
    let n = 0;
    for (const c of G.cauldrons) if (c.recipe && c.recipe.id === recipeId && c.state !== 'idle') n++;
    for (const w of G.workers) if (w.carrying && w.carrying.id === recipeId) n++;
    n += G.state.stock[recipeId] || 0;
    return n;
  },
};
