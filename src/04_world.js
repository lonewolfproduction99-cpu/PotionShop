// ===== Potion Shop: shop world =====
// Builds the shop from the scene instances (tables, cauldrons, waypoints),
// spawns customers, seats them or queues them, and runs their patience.
const PS = gdjs.PotionShop;
const U = PS.util;

PS.World = {
  init(G) {
    const scene = G.scene;
    // --- Waypoints placed on the hidden "Nav" layer.
    G.queueSpots = [];
    G.spawns = [];
    const homes = [];
    for (const w of scene.getObjects('Waypoint')) {
      const kind = PS.varStr(w, 'Kind', '');
      const p = [w.getX(), w.getY()];
      if (kind === 'door') G.door = p;
      else if (kind === 'doorOutside') G.doorOutside = p;
      else if (kind === 'home') G.home = p;
      else if (kind === 'spawn') G.spawns.push(p);
      else if (kind === 'queue') G.queueSpots.push({ order: PS.varNum(w, 'Order', 0), p });
      else if (kind === 'workerHome') homes.push({ order: PS.varNum(w, 'Order', 0), p });
    }
    G.queueSpots.sort((a, b) => a.order - b.order);
    G.queueSpots = G.queueSpots.map((q) => q.p).slice(0, PS.data.balance.queueSize + 1);
    G.queue = [];
    G.workerHomes = homes.sort((a, b) => a.order - b.order).map((h) => h.p);

    // --- Table slots. Each TableSet instance is a slot; after prestiges a slot
    // holds a long table with up to 5 chairs (one seat per chair).
    const n = G.groupSize();
    G.slots = scene
      .getObjects('TableSet')
      .map((t) => ({ order: PS.varNum(t, 'Order', 99), anchor: t, x: t.getX(), y: t.getY(), unlocked: false, sign: null }))
      .sort((a, b) => a.order - b.order);
    G.seats = [];
    // Long tables move a little toward the middle aisle so they fit the room.
    const shift = n >= 3 ? Math.min(36, (n - 2) * 12) : 0;
    for (const slot of G.slots) {
      if (n > 1) {
        slot.anchor.hide(true);
        if (shift) slot.x += slot.x < G.door[0] ? shift : -shift;
        slot.group = PS.create(scene, 'TableGroup' + n, slot.x, slot.y, '');
      } else {
        slot.group = slot.anchor;
      }
      slot.seats = [];
      for (let i = 0; i < n; i++) {
        const sx = slot.x + (i - (n - 1) / 2) * PS.K.chairSpacing;
        const seat = { slot, x: sx, y: slot.y + PS.K.seatOffsetY, standX: sx, standY: slot.y + PS.K.tableStandSouth,
          occupant: null, unlocked: false };
        slot.seats.push(seat);
        G.seats.push(seat);
      }
    }

    // Small decorations in the way of a long table are put away.
    if (n > 1) {
      const tables = G.slots.map((sl) => sl.group.getAABB()).map((a) => [a.min[0], a.min[1], a.max[0], a.max[1]]);
      for (const name of ['Plant', 'Candelabra', 'Barrel', 'Crates']) {
        for (const o of scene.getObjects(name)) {
          const a = o.getAABB();
          if (tables.some((t) => a.min[0] < t[2] + 12 && a.max[0] > t[0] - 12 && a.min[1] < t[3] && a.max[1] > t[1])) {
            o.hide(true);
          }
        }
      }
    }

    // --- Cauldrons.
    G.cauldrons = scene
      .getObjects('Cauldron')
      .map((c) => ({
        order: PS.varNum(c, 'Order', 99),
        obj: c,
        x: c.getX(),
        y: c.getY(),
        standX: c.getX(),
        standY: c.getY() + PS.K.cauldronStandY,
        state: 'idle',
        recipe: null,
        ingredients: [],
        t: 0,
        dur: 1,
        unlocked: false,
        liquid: null,
        sign: null,
        bubbleTimer: 0,
      }))
      .sort((a, b) => a.order - b.order);
    G.cauldrons.forEach((c, i) => (c.index = i));

    // --- Counter where extra potions are stored.
    const counter = scene.getObjects('Counter')[0];
    G.counter = counter
      ? {
          x: counter.getX(),
          y: counter.getY(),
          standX: counter.getX() + PS.K.counterStandX,
          standY: counter.getY() + PS.K.counterStandY,
        }
      : { x: 140, y: 360, standX: 180, standY: 310 };

    G.customers = [];
    G.nextCustomerId = 1;
    G.spawnTimer = 1.5;
    this.applyUnlocks(G);
  },

  tablesUnlocked(G) {
    return Math.min(G.slots.length, 3 + (G.state.upgrades.extra_table || 0));
  },
  cauldronsUnlocked(G) {
    return Math.min(G.cauldrons.length, 1 + (G.state.upgrades.extra_cauldron || 0));
  },

  // Shows purchased tables/cauldrons and a "for sale" sign on the next slot.
  applyUnlocks(G) {
    const scene = G.scene;
    const nt = this.tablesUnlocked(G);
    G.slots.forEach((slot, i) => {
      const was = slot.unlocked;
      slot.unlocked = i < nt;
      slot.group.hide(!slot.unlocked);
      slot.seats.forEach((st) => (st.unlocked = slot.unlocked));
      const wantSign = i === nt;
      if (wantSign && !slot.sign) slot.sign = PS.create(scene, 'SlotSign', slot.x, slot.y, '');
      else if (!wantSign && slot.sign) {
        PS.destroy(slot.sign);
        slot.sign = null;
      }
      if (slot.unlocked && !was && G.started) PS.FX.sparkleAt(G, slot.x, slot.y, 50);
    });
    const nc = this.cauldronsUnlocked(G);
    G.cauldrons.forEach((c, i) => {
      const was = c.unlocked;
      c.unlocked = i < nc;
      c.obj.hide(!c.unlocked);
      if (c.unlocked && !c.liquid) {
        c.liquid = PS.create(scene, 'Liquid', c.x, c.y, '');
        c.liquid.setZ(PS.K.liquidZ);
        c.liquid.hide(true);
      }
      const wantSign = i === nc;
      if (wantSign && !c.sign) {
        c.sign = PS.create(scene, 'SlotSign', c.x, c.y, '');
      } else if (!wantSign && c.sign) {
        PS.destroy(c.sign);
        c.sign = null;
      }
      if (c.unlocked && !was && G.started) PS.FX.sparkleAt(G, c.x, c.y, 80);
    });
    this.fillSeatsFromQueue(G);
  },

  freeSeat(G) {
    return G.seats.find((s) => s.unlocked && !s.occupant) || null;
  },

  activeCustomers(G) {
    return G.customers.filter((c) => c.state !== 'leaving' && c.state !== 'angry' && c.state !== 'served').length;
  },

  // ----------------------------------------------------------- spawning
  updateSpawning(G, dt) {
    G.spawnTimer -= dt;
    if (G.spawnTimer > 0) return;
    const b = PS.data.balance;
    const capacity = G.seats.filter((st) => st.unlocked).length + b.queueSize;
    if (G.state.closed || this.activeCustomers(G) >= capacity) {
      G.spawnTimer = 1;
      return;
    }
    const base = Math.max(b.spawnIntervalMin, b.spawnIntervalStart - (G.state.level - 1) * 0.8);
    // Happy customers spread the word: a busier shop when satisfaction is high.
    const word = 1.25 - 0.5 * (G.state.satisfaction / 100);
    // Long tables (after prestiges) seat more people: customers come more often.
    const groups = 1 + 0.5 * (G.groupSize() - 1);
    G.spawnTimer = (base * word * U.rand(0.75, 1.25)) / groups;
    this.spawnCustomer(G);
  },

  spawnCustomer(G) {
    const level = G.state.level;
    const types = PS.data.customers.filter((t) => t.minLevel <= level);
    const recipes = PS.Brewing.knownRecipes(G);
    if (!types.length || !recipes.length) return null;
    const type = U.pick(types);
    const spawn = U.pick(G.spawns);
    const obj = PS.create(G.scene, type.object, spawn[0], spawn[1], '');
    // After prestiges customers may order several potions at once (fewer is more likely).
    const max = G.maxOrderItems();
    const weights = [5, 3, 2, 1.5, 1].slice(0, max);
    let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
    let count = 1;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        count = i + 1;
        break;
      }
    }
    const items = [];
    for (let i = 0; i < count; i++) items.push({ recipe: U.pick(recipes), done: false, reserved: false, quality: 1 });
    const patience = type.patience * G.mult('cozy_decor', +1) * G.patienceMult() * (1 + 0.6 * (count - 1)) * U.rand(0.9, 1.1);
    const c = {
      id: G.nextCustomerId++,
      type,
      obj,
      speed: type.speed * G.mult('swift_shoes', +0.5),
      state: 'arriving',
      seat: null,
      items,
      recipe: items[0].recipe, // first potion still wanted (kept up to date for display)
      patience,
      maxPatience: patience,
      orderedAt: 0,
      timer: 0,
      path: null,
      anim: '',
    };
    PS.goTo(c, G.doorOutside[0] + U.rand(-10, 10), G.doorOutside[1]);
    G.customers.push(c);
    return c;
  },

  // ----------------------------------------------------------- seating & queue
  fillSeatsFromQueue(G) {
    while (G.queue.length) {
      const seat = this.freeSeat(G);
      if (!seat) break;
      const c = G.queue.shift();
      this.sendToSeat(G, c, seat);
    }
    G.queue.forEach((c, i) => {
      const p = G.queueSpots[Math.min(i, G.queueSpots.length - 1)];
      if (c.queueIndex !== i) {
        c.queueIndex = i;
        c.state = 'toQueue';
        PS.goTo(c, p[0], p[1]);
      }
    });
  },

  sendToSeat(G, c, seat) {
    seat.occupant = c;
    c.seat = seat;
    c.queueIndex = -1;
    c.state = 'toSeat';
    PS.goTo(c, seat.x, seat.y);
  },

  onArrivedAtDoor(G, c) {
    const seat = this.freeSeat(G);
    if (seat && !G.queue.length) {
      this.sendToSeat(G, c, seat);
    } else if (G.queue.length < G.queueSpots.length) {
      G.queue.push(c);
      c.queueIndex = -1;
      this.fillSeatsFromQueue(G);
    } else {
      this.leave(G, c, 'full');
    }
  },

  leave(G, c, reason) {
    if (c.seat) {
      c.seat.occupant = null;
      c.seat = null;
    }
    const qi = G.queue.indexOf(c);
    if (qi >= 0) G.queue.splice(qi, 1);
    c.state = 'leaving';
    c.leaveReason = reason;
    c.obj.setZ(0);
    const spawn = U.pick(G.spawns);
    c.path = G.nav.findPath(c.obj.getX(), c.obj.getY(), G.door[0], G.door[1]).concat(
      G.nav.findPath(G.door[0], G.door[1], G.doorOutside[0], G.doorOutside[1]),
      [[spawn[0], spawn[1]]]
    );
    PS.Workers.onCustomerGone(G, c);
    this.fillSeatsFromQueue(G);
  },

  // One potion of an order handed over: the customer pays for it right away
  // (tip from their patience at that moment) and leaves once all arrived.
  deliverItem(G, c, recipe, quality) {
    const item = PS.Order.deliver(c, recipe.id, quality);
    if (!item) return false;
    this.payItem(G, c, item);
    if (PS.Order.remaining(c) > 0) {
      PS.UI.markDirty(G);
      return true;
    }
    this.serve(G, c);
    return true;
  },

  payItem(G, c, item) {
    const ratio = U.clamp(c.patience / c.maxPatience, 0, 1);
    const tip = 1 + PS.data.balance.tipMax * ratio;
    const q = PS.QUALITY[item.quality];
    const price = Math.round(G.potionPrice(item.recipe) * q.price * tip * c.type.tip);
    item.paid = price;
    G.addGold(price);
    G.state.earned += price;
    G.addXp(PS.data.balance.xpPerServe + Math.round(5 * ratio));
    const left = PS.Order.remaining(c);
    const label = '+' + U.formatGold(price) + (item.quality >= 2 ? '  ' + q.name + '!' : '') +
      (left > 0 ? '  (' + left + ' more)' : '');
    // Stack the floating texts of quick deliveries a little.
    PS.UI.floatText(G, c.obj.getX(), c.obj.getY(), 95 + (c.items.length - 1 - left) * 4, label, 'icon_coin');
    PS.Audio.play(G, 'coin');
  },

  // Every potion delivered (and paid): leave happy.
  serve(G, c) {
    const ratio = U.clamp(c.patience / c.maxPatience, 0, 1);
    let mood = 0;
    for (const it of c.items) mood += PS.QUALITY[it.quality].mood;
    mood /= c.items.length;
    G.state.served += 1;
    G.recordSatisfaction(U.clamp(50 + 50 * ratio + mood, 0, 100));
    // Delighted customers (served before patience dropped below 90%) may leave a special herb.
    if (ratio >= 0.9 && Math.random() < PS.data.balance.giftChance) this.gift(G, c);
    c.state = 'served';
    c.timer = 1.3;
    c.obj.setZ(0);
    PS.setAnim(c, 'Cheer');
    if (c.seat) {
      c.seat.occupant = null;
      c.seat = null;
    }
    this.fillSeatsFromQueue(G);
  },

  gift(G, c) {
    const herb = PS.data.ingredientById[Math.random() < 0.5 ? 'starbloom' : 'glowcap'];
    const inv = G.state.inventory;
    if ((inv[herb.id] || 0) >= G.storageCap()) return;
    inv[herb.id] = (inv[herb.id] || 0) + 1;
    PS.UI.floatText(G, c.obj.getX(), c.obj.getY(), 130, 'Gift: ' + herb.name + '!', herb.icon);
    PS.Audio.play(G, 'levelup');
  },

  // Satisfaction hit rock bottom: nobody comes until the shop is reopened.
  checkClosing(G) {
    if (!G.state.closed && G.state.satisfaction <= PS.data.balance.closeAt) {
      G.state.closed = true;
      G.saveNow();
      PS.UI.open(G, 'closed');
      PS.Audio.play(G, 'angry');
    }
  },
  reopenCost(G) {
    return Math.max(100, Math.round(G.state.incomeRate * 4));
  },
  reopen(G, withGems) {
    const s = G.state;
    if (withGems) {
      if (s.gems < PS.data.balance.reopenGems) return false;
      s.gems -= PS.data.balance.reopenGems;
    } else {
      const cost = this.reopenCost(G);
      if (s.gold < cost) return false;
      G.addGold(-cost);
    }
    s.closed = false;
    s.satisfaction = 55;
    G.spawnTimer = 2;
    G.saveNow();
    PS.UI.toast(G, 'The shop is open again!');
    return true;
  },

  // ----------------------------------------------------------- per frame
  updateCustomers(G, dt) {
    const b = PS.data.balance;
    for (let i = G.customers.length - 1; i >= 0; i--) {
      const c = G.customers[i];
      switch (c.state) {
        case 'arriving':
          // At the shop entrance: take a free table or wait in the queue outside.
          if (PS.walk(c, dt)) this.onArrivedAtDoor(G, c);
          break;
        case 'toQueue':
          c.idleAnim = 'Idle';
          if (PS.walk(c, dt)) {
            c.state = 'queued';
            PS.faceInstantly(c, -1, -0.6);
          }
          c.patience -= dt * 0.5;
          break;
        case 'queued':
          PS.setAnim(c, 'Idle');
          c.patience -= dt * 0.5;
          break;
        case 'toSeat':
          c.idleAnim = 'Idle';
          if (PS.walk(c, dt)) {
            c.state = 'waitingOrder';
            c.obj.setX(c.seat.x);
            c.obj.setY(c.seat.y);
            c.obj.setZ(PS.K.sitZ); // hips on the chair cushion
            PS.faceInstantly(c, 0, 1);
            PS.setAnim(c, 'Sit');
            c.seatedAt = G.time;
          }
          break;
        case 'waitingOrder':
          c.patience -= dt;
          break;
        case 'ordered':
          c.patience -= dt * 0.8;
          break;
        case 'served':
          c.timer -= dt;
          if (c.timer <= 0) this.leave(G, c, 'served');
          break;
        case 'angry':
          c.timer -= dt;
          if (c.timer <= 0) this.leave(G, c, 'angry');
          break;
        case 'leaving':
          c.idleAnim = 'Walk';
          if (PS.walk(c, dt)) {
            PS.UI.removeCustomerOverlay(G, c);
            PS.destroy(c.obj);
            G.customers.splice(i, 1);
            continue;
          }
          break;
      }
      if (
        c.patience <= 0 &&
        (c.state === 'waitingOrder' || c.state === 'ordered' || c.state === 'queued' || c.state === 'toQueue')
      ) {
        this.storm(G, c);
      }
    }
    this.updateSpawning(G, dt);
    this.checkClosing(G);
    void b;
  },

  // Patience ran out: the customer leaves without paying.
  storm(G, c) {
    c.patience = 0;
    c.state = 'angry';
    c.timer = 1.2;
    c.obj.setZ(0);
    PS.setAnim(c, 'Angry');
    G.state.lost += 1;
    G.recordSatisfaction(0);
    PS.UI.floatText(G, c.obj.getX(), c.obj.getY(), 95, 'Too slow!', 'mood_angry');
    PS.Audio.play(G, 'angry');
    if (c.seat) {
      c.seat.occupant = null;
      c.seat = null;
    }
    const qi = G.queue.indexOf(c);
    if (qi >= 0) G.queue.splice(qi, 1);
    PS.Workers.onCustomerGone(G, c);
    this.fillSeatsFromQueue(G);
  },

  // Orders that were taken and are still waiting for a potion, oldest first.
  pendingOrders(G) {
    return G.customers.filter((c) => c.state === 'ordered').sort((a, b) => a.orderedAt - b.orderedAt);
  },

  // Potions customers still want: taken orders first (oldest first), then
  // seated customers who have not ordered yet. One entry per potion.
  wantedItems(G) {
    const seated = G.customers.filter((c) => c.state === 'waitingOrder').sort((a, b) => a.seatedAt - b.seatedAt);
    const out = [];
    for (const c of this.pendingOrders(G).concat(seated)) {
      for (const it of c.items) if (!it.done) out.push({ customer: c, recipe: it.recipe });
    }
    return out;
  },

  // The oldest wanted potion that nobody is brewing, carrying or storing yet.
  uncoveredItem(G, filter) {
    const counted = {};
    for (const w of this.wantedItems(G)) {
      const id = w.recipe.id;
      counted[id] = (counted[id] || 0) + 1;
      if (PS.Brewing.plannedFor(G, id) < counted[id] && (!filter || filter(w.recipe))) return w;
    }
    return null;
  },
};

// Order items of a customer: { recipe, done, reserved (a worker is bringing
// it), quality }.
PS.Order = {
  // Replace a customer's order with these recipes.
  set(c, recipes) {
    c.items = recipes.map((recipe) => ({ recipe, done: false, reserved: false, quality: 1 }));
    c.recipe = recipes[0];
  },
  remaining(c) {
    return c.items.filter((i) => !i.done).length;
  },
  // An item of this potion nobody is bringing yet.
  need(c, recipeId) {
    return c.items.find((i) => !i.done && !i.reserved && i.recipe.id === recipeId) || null;
  },
  needsAny(c) {
    return c.items.filter((i) => !i.done && !i.reserved);
  },
  reserve(c, recipeId) {
    const it = this.need(c, recipeId);
    if (it) it.reserved = true;
    return it;
  },
  unreserve(c, recipeId) {
    const it = c.items.find((i) => !i.done && i.reserved && i.recipe.id === recipeId);
    if (it) it.reserved = false;
  },
  // Is a worker bringing this potion (or could bring it)?
  wants(c, recipeId) {
    return c.items.some((i) => !i.done && i.recipe.id === recipeId);
  },
  deliver(c, recipeId, quality) {
    const it = c.items.find((i) => !i.done && i.reserved && i.recipe.id === recipeId) ||
      c.items.find((i) => !i.done && i.recipe.id === recipeId);
    if (!it) return null;
    it.done = true;
    it.reserved = false;
    it.quality = quality === undefined ? 1 : quality;
    const next = c.items.find((i) => !i.done);
    if (next) c.recipe = next.recipe;
    return it;
  },
};

// Small visual effects: rising bubbles and sparkles made of tiny 3D cubes.
PS.FX = {
  bubble(G, x, y, z, color, rise, life, size) {
    if (G.fx.length > 90) return; // keep effects cheap on phones
    const o = PS.create(G.scene, 'Bubble', x - size / 2, y - size / 2, '');
    o.setZ(z);
    o.setWidth(size);
    o.setHeight(size);
    o.setDepth(size);
    o.setColor(color);
    G.fx.push({ obj: o, vz: rise, life, max: life, size, cx: x, cy: y, spin: U.rand(-200, 200) });
  },
  sparkleAt(G, x, y, z) {
    for (let i = 0; i < 14; i++) {
      this.bubble(G, x + U.rand(-40, 40), y + U.rand(-40, 40), z + U.rand(0, 25), '255;230;120', U.rand(40, 90),
        U.rand(0.6, 1.1), U.rand(4, 8));
    }
  },
  update(G, dt) {
    for (let i = G.fx.length - 1; i >= 0; i--) {
      const f = G.fx[i];
      f.life -= dt;
      if (f.life <= 0) {
        PS.destroy(f.obj);
        G.fx.splice(i, 1);
        continue;
      }
      const s = f.size * Math.max(0.15, f.life / f.max);
      f.obj.setZ(f.obj.getZ() + f.vz * dt);
      f.obj.setWidth(s);
      f.obj.setHeight(s);
      f.obj.setDepth(s);
      f.obj.setX(f.cx - s / 2);
      f.obj.setY(f.cy - s / 2);
      f.obj.setAngle(f.obj.getAngle() + f.spin * dt);
    }
  },
};
