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
    for (const w of scene.getObjects('Waypoint')) {
      const kind = PS.varStr(w, 'Kind', '');
      const p = [w.getX(), w.getY()];
      if (kind === 'door') G.door = p;
      else if (kind === 'doorOutside') G.doorOutside = p;
      else if (kind === 'home') G.home = p;
      else if (kind === 'spawn') G.spawns.push(p);
      else if (kind === 'queue') G.queueSpots.push({ order: PS.varNum(w, 'Order', 0), p });
    }
    G.queueSpots.sort((a, b) => a.order - b.order);
    G.queueSpots = G.queueSpots.map((q) => q.p).slice(0, PS.data.balance.queueSize + 1);
    G.queue = [];

    // --- Tables (each TableSet has one chair = one seat).
    G.seats = scene
      .getObjects('TableSet')
      .map((t) => ({
        order: PS.varNum(t, 'Order', 99),
        obj: t,
        x: t.getX(),
        y: t.getY() + PS.K.seatOffsetY,
        standX: t.getX() + (t.getX() < 320 ? PS.K.tableStandX : -PS.K.tableStandX),
        standY: t.getY() + PS.K.tableStandY,
        occupant: null,
        unlocked: false,
        sign: null,
      }))
      .sort((a, b) => a.order - b.order);

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
    return Math.min(G.seats.length, 3 + (G.state.upgrades.extra_table || 0));
  },
  cauldronsUnlocked(G) {
    return Math.min(G.cauldrons.length, 1 + (G.state.upgrades.extra_cauldron || 0));
  },

  // Shows purchased tables/cauldrons and a "for sale" sign on the next slot.
  applyUnlocks(G) {
    const scene = G.scene;
    const nt = this.tablesUnlocked(G);
    G.seats.forEach((s, i) => {
      s.unlocked = i < nt;
      s.obj.hide(!s.unlocked);
      const wantSign = i === nt;
      if (wantSign && !s.sign) {
        s.sign = PS.create(scene, 'SlotSign', s.obj.getX(), s.obj.getY(), '');
      } else if (!wantSign && s.sign) {
        PS.destroy(s.sign);
        s.sign = null;
      }
    });
    const nc = this.cauldronsUnlocked(G);
    G.cauldrons.forEach((c, i) => {
      const was = c.unlocked;
      c.unlocked = i < nc;
      c.obj.hide(!c.unlocked);
      if (c.unlocked && !c.liquid) {
        c.liquid = PS.create(scene, 'Liquid', c.x - PS.K.liquidHalf, c.y - PS.K.liquidHalf, '');
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
    if (G.started) {
      G.seats.forEach((s) => {
        if (s.unlocked && s._shown !== true && s._shown !== undefined) PS.FX.sparkleAt(G, s.obj.getX(), s.obj.getY(), 50);
      });
    }
    G.seats.forEach((s) => (s._shown = s.unlocked));
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
    const capacity = this.tablesUnlocked(G) + b.queueSize;
    if (this.activeCustomers(G) >= capacity) {
      G.spawnTimer = 1;
      return;
    }
    const base = Math.max(b.spawnIntervalMin, b.spawnIntervalStart - (G.state.level - 1) * 1.1);
    G.spawnTimer = base * U.rand(0.75, 1.25);
    this.spawnCustomer(G);
  },

  spawnCustomer(G) {
    const level = G.state.level;
    const types = PS.data.customers.filter((t) => t.minLevel <= level);
    const recipes = PS.data.recipes.filter((r) => r.unlockLevel <= level);
    if (!types.length || !recipes.length) return null;
    const type = U.pick(types);
    const spawn = U.pick(G.spawns);
    const obj = PS.create(G.scene, type.object, spawn[0], spawn[1], '');
    const patience = type.patience * G.mult('cozy_decor', +1) * U.rand(0.9, 1.1);
    const c = {
      id: G.nextCustomerId++,
      type,
      obj,
      speed: type.speed * G.mult('swift_shoes', +0.5),
      state: 'arriving',
      seat: null,
      recipe: U.pick(recipes),
      patience,
      maxPatience: patience,
      orderedAt: 0,
      deliveryReserved: false,
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

  // Called when a potion is handed over.
  serve(G, c, recipe) {
    const ratio = U.clamp(c.patience / c.maxPatience, 0, 1);
    const tip = 1 + PS.data.balance.tipMax * ratio;
    const price = Math.round(recipe.price * G.mult('fine_bottles', +1) * tip * c.type.tip);
    G.addGold(price);
    G.state.served += 1;
    G.state.earned += price;
    G.addXp(PS.data.balance.xpPerServe + Math.round(5 * ratio));
    G.recordSatisfaction(50 + 50 * ratio);
    PS.UI.floatText(G, c.obj.getX(), c.obj.getY(), 95, '+' + price, 'icon_coin');
    c.state = 'served';
    c.timer = 1.3;
    c.obj.setZ(0);
    PS.setAnim(c, 'Cheer');
    PS.Audio.play(G, 'coin');
    if (c.seat) {
      c.seat.occupant = null;
      c.seat = null;
    }
    this.fillSeatsFromQueue(G);
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
};

// Small visual effects: rising bubbles and sparkles made of tiny 3D cubes.
PS.FX = {
  bubble(G, x, y, z, color, rise, life, size) {
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
