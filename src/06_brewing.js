// ===== Potion Shop: brewing =====
// Cauldron states: idle -> reserved (ingredients paid, worker on the way)
// -> brewing (timer, circular progress) -> done (potion ready to collect).
// A risky brew can end in an accident instead: the cauldron becomes "dirty"
// and must be cleaned before it can be used again.
//
// A brew uses the recipe's two ingredients plus an optional extra herb:
//   - the recipe's bonus herb (discovered by trying it): Fine quality,
//   - Starbloom (rare): Superb quality,
//   - Glowcap (rare): Fine quality, brews twice as fast and never explodes,
//   - any other herb: Poor quality and a risk of an accident.
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

PS.QUALITY = [
  { name: 'Poor', price: 0.6, mood: -15, color: '200;90;70' },
  { name: 'Standard', price: 1, mood: 0, color: '230;230;230' },
  { name: 'Fine', price: 1.4, mood: 10, color: '120;220;255' },
  { name: 'Superb', price: 2, mood: 20, color: '255;214;80' },
];

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

  // What a brew will produce: recipe, quality, speed and whether it explodes.
  // Rolled when the brew is reserved, so the result is fixed from then on.
  outcome(G, ingredientIds) {
    const base = ingredientIds.slice(0, 2);
    const extra = ingredientIds[2] || null;
    const recipe = PS.findRecipe(base) || PS.SLUDGE;
    const b = PS.data.balance;
    let quality = recipe === PS.SLUDGE ? 0 : 1;
    let risk = recipe === PS.SLUDGE ? b.accidentSludge : 0;
    let speed = 1;
    let discovered = false;
    if (extra && recipe !== PS.SLUDGE) {
      if (extra === 'starbloom') quality = 3;
      else if (extra === 'glowcap') {
        quality = 2;
        speed = 2;
      } else if (extra === recipe.bonus) {
        quality = 2;
        discovered = true;
      } else {
        quality = 0;
        risk = b.accidentWrongExtra;
      }
    }
    if (extra === 'glowcap') risk = 0;
    // Master Brewer: a chance to improve Standard and Fine potions.
    if ((quality === 1 || quality === 2) && Math.random() < G.level('master_brewer') * (PS.data.upgradeById.master_brewer || { effect: 0 }).effect) {
      quality += 1;
    }
    const accident = Math.random() < risk * G.mult('safety_goggles', -1);
    return { recipe, quality, speed, accident, discovered, extra };
  },

  // Pay the ingredients and hold the cauldron until a worker adds them.
  reserve(G, cauldron, ingredientIds) {
    if (cauldron.state !== 'idle') return false;
    const inv = G.state.inventory;
    for (const id of ingredientIds) {
      if ((inv[id] || 0) < ingredientIds.filter((x) => x === id).length) return false;
    }
    for (const id of ingredientIds) inv[id] -= 1;
    const o = this.outcome(G, ingredientIds);
    cauldron.state = 'reserved';
    cauldron.recipe = o.recipe;
    cauldron.quality = o.quality;
    cauldron.speed = o.speed;
    cauldron.accident = o.accident;
    cauldron.discovered = o.discovered;
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
    c.dur = (c.recipe.brewTime * G.mult('quick_brew', -1)) / (c.speed || 1);
    c.liquid.hide(false);
    PS.tint(c.liquid, c.recipe.color);
    c.liquid.setZ(PS.K.liquidZ);
    if (c.discovered && !G.state.discovered.includes(c.recipe.id)) {
      G.state.discovered.push(c.recipe.id);
      const herb = PS.data.ingredientById[c.recipe.bonus];
      PS.UI.toast(G, 'Discovery! ' + herb.name + ' makes ' + c.recipe.name + ' Fine quality');
      PS.Audio.play(G, 'levelup');
    }
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

  // The brew boils over: smoke, a glowing spill, and the cauldron is out of
  // use until someone cleans it. Nothing is destroyed.
  explode(G, c) {
    c.state = 'dirty';
    const color = c.recipe.color;
    c.recipe = null;
    c.ingredients = [];
    PS.tint(c.liquid, '70;80;60');
    c.spill = PS.create(G.scene, 'Spill', c.x - 46, c.y + 26, '');
    c.spill.setZ(0.4);
    c.spill.setColor(color);
    G.state.accidents = (G.state.accidents || 0) + 1;
    for (let i = 0; i < 18; i++) {
      PS.FX.bubble(G, c.x + U.rand(-40, 40), c.y + U.rand(-40, 40), PS.K.potTop + U.rand(0, 20), '90;90;95',
        U.rand(40, 110), U.rand(0.8, 1.6), U.rand(8, 16));
    }
    PS.FX.sparkleAt(G, c.x, c.y, PS.K.potTop);
    PS.UI.floatText(G, c.x, c.y, 120, 'Accident! Clean it up', 'icon_skull');
    PS.Audio.play(G, 'boom');
    PS.UI.markDirty(G);
  },

  clean(G, c) {
    if (c.state !== 'dirty') return;
    c.state = 'idle';
    c.liquid.hide(true);
    PS.destroy(c.spill);
    c.spill = null;
    PS.FX.sparkleAt(G, c.x, c.y + 40, 20);
    PS.Audio.play(G, 'sweep');
    PS.UI.markDirty(G);
  },

  update(G, dt) {
    for (const c of G.cauldrons) {
      if (!c.unlocked) continue;
      if (c.state === 'brewing') {
        c.t += dt;
        const k = Math.min(1, c.t / c.dur);
        // Liquid rises slightly while brewing.
        c.liquid.setZ(PS.K.liquidZ + PS.K.liquidRise * k);
        const unstable = c.accident && k > 0.55;
        c.bubbleTimer -= dt;
        if (c.bubbleTimer <= 0) {
          // A brew that is about to go wrong bubbles over with dark foam.
          c.bubbleTimer = unstable ? 0.07 : 0.22;
          PS.FX.bubble(G, c.x + U.rand(-22, 22), c.y + U.rand(-22, 22), PS.K.potTop - 4,
            unstable && Math.random() < 0.6 ? '60;60;70' : c.recipe.color, U.rand(30, unstable ? 110 : 60),
            U.rand(0.7, 1.2), U.rand(4, unstable ? 12 : 8));
        }
        if (unstable) PS.tint(c.liquid, Math.sin(G.time * 18) > 0 ? c.recipe.color : '80;80;90');
        if (c.t >= c.dur) {
          if (c.accident) {
            this.explode(G, c);
            continue;
          }
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
      } else if (c.state === 'dirty') {
        c.bubbleTimer -= dt;
        if (c.bubbleTimer <= 0) {
          c.bubbleTimer = 0.5;
          PS.FX.bubble(G, c.x + U.rand(-20, 20), c.y + U.rand(-20, 20), PS.K.potTop, '100;100;105', U.rand(20, 40),
            U.rand(1, 1.6), U.rand(6, 10));
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

  // Ingredients for a quick brew: the recipe plus its bonus herb when it has
  // been discovered and one is spare.
  bestIngredients(G, recipe) {
    const ids = recipe.ingredients.slice();
    const bonus = recipe.bonus;
    if (bonus && G.state.discovered.includes(recipe.id)) {
      const needed = ids.filter((x) => x === bonus).length + 1;
      if ((G.state.inventory[bonus] || 0) >= needed) ids.push(bonus);
    }
    return ids;
  },

  // Potions already planned for a recipe (brewing, ready, carried, stored).
  plannedFor(G, recipeId) {
    let n = 0;
    for (const c of G.cauldrons) {
      if (c.recipe && c.recipe.id === recipeId && c.state !== 'idle' && !c.accident) n++;
    }
    for (const w of G.workers) if (w.carrying && w.carrying.id === recipeId) n++;
    n += G.state.stock[recipeId] || 0;
    return n;
  },
};

// Potions waiting on the counter keep their quality (not saved: potions in a
// reloaded game come back as Standard quality).
PS.Stock = {
  add(G, recipe, quality) {
    G.state.stock[recipe.id] = (G.state.stock[recipe.id] || 0) + 1;
    (G.stockQuality[recipe.id] = G.stockQuality[recipe.id] || []).push(quality);
  },
  // Takes the best potion of this kind; returns its quality or -1.
  take(G, recipeId) {
    if ((G.state.stock[recipeId] || 0) <= 0) return -1;
    G.state.stock[recipeId]--;
    const list = G.stockQuality[recipeId] || [];
    if (!list.length) return 1;
    list.sort((a, b) => b - a);
    return list.shift();
  },
};
