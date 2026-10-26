// ===== Potion Shop: workers and task queue =====
// Every worker performs one physical task at a time.
// - The shop owner follows the player's taps: taps add tasks to the owner's
//   queue so nothing is lost while the owner is busy.
// - Hired apprentices pick their own jobs (collect potions, deliver, take
//   orders, brew for orders nobody is brewing yet), limited by their role.
// Exclusive targets (a customer's order, a cauldron, a delivery) are claimed
// so two workers can never work on the same thing.
const PS = gdjs.PotionShop;
const U = PS.util;

PS.TASKS = {
  takeOrder: { icon: 'icon_order', color: '90;170;255', label: 'Take order' },
  startBrew: { icon: 'icon_brew', color: '185;120;255', label: 'Add ingredients' },
  collect: { icon: 'icon_sparkle', color: '255;205;80', label: 'Collect potion' },
  deliver: { icon: 'icon_check', color: '110;220;120', label: 'Deliver' },
  fetchStock: { icon: 'icon_sparkle', color: '255;205;80', label: 'Fetch potion' },
  store: { icon: 'icon_check', color: '255;205;80', label: 'Store potion' },
  clean: { icon: 'icon_broom', color: '90;220;200', label: 'Clean spill' },
};

PS.Workers = {
  MAX_QUEUE: 6,

  createOwner(G) {
    const [hx, hy] = G.home;
    const obj = PS.create(G.scene, 'Owner', hx, hy, '');
    const w = {
      id: 'owner',
      index: 0,
      isOwner: true,
      obj,
      speed: PS.data.balance.ownerSpeed,
      task: null,
      queue: [],
      carrying: null, // recipe object
      anim: '',
      path: null,
      idleAnim: 'Idle',
    };
    PS.faceInstantly(w, 0, 1);
    PS.setAnim(w, 'Idle');
    G.workers = [w];
    G.owner = w;
    return w;
  },

  // Apprentice `index` (1-based) using its saved record in G.state.workers.
  createApprentice(G, index, record) {
    const type = PS.data.workerTypes[index - 1];
    const home = G.workerHomes[index - 1] || G.home;
    const obj = PS.create(G.scene, type.object, home[0], home[1], '');
    const w = {
      id: type.id,
      index,
      isOwner: false,
      name: type.name,
      record, // saved data: role and stats
      obj,
      home,
      speed: PS.data.balance.ownerSpeed,
      task: null,
      queue: [],
      carrying: null,
      anim: '',
      path: null,
      idleAnim: 'Idle',
      thinkTimer: Math.random() * 0.3,
    };
    PS.faceInstantly(w, 0, 1);
    PS.setAnim(w, 'Idle');
    G.workers.push(w);
    return w;
  },

  // A potion bottle in the worker's hands while carrying one.
  updateHeldBottle(G, w) {
    if (!w.carrying || w.carrying.id === 'sludge') {
      if (w.bottle) w.bottle.hide(true);
      return;
    }
    if (!w.bottle) w.bottle = PS.create(G.scene, 'HeldBottle', 0, 0, '');
    if (w.bottleRecipe !== w.carrying.id) {
      w.bottleRecipe = w.carrying.id;
      PS.tint(w.bottle, w.carrying.color);
    }
    const a = (w.obj.getAngle() * Math.PI) / 180;
    // Facing direction of a character with angle a is (-sin a, cos a).
    w.bottle.hide(false);
    w.bottle.setPosition(w.obj.getX() - Math.sin(a) * 15, w.obj.getY() + Math.cos(a) * 15);
    w.bottle.setZ(PS.K.handZ + (w.anim === 'Carry' ? Math.abs(Math.sin(G.time * 10)) * 1.5 : 0));
  },

  // Worker currently working on (or heading to) a target, if any.
  claimedBy(G, target) {
    for (const w of G.workers) {
      if (w.task && w.task.target === target) return w;
      if (w.queue.some((t) => t.target === target)) return w;
    }
    return null;
  },

  // Is this job already being done or queued by any worker? `recipe` tells
  // apart the potions of one multi-potion order.
  isQueued(G, type, target, recipe) {
    const same = (t) => t.type === type && t.target === target && (!recipe || !t.recipe || t.recipe === recipe);
    for (const w of G.workers) {
      if (w.task && same(w.task)) return true;
      if (w.queue.some(same)) return true;
    }
    return false;
  },

  // Player taps become tasks in the owner's queue.
  enqueue(G, task, front) {
    const w = G.owner;
    if (this.isQueued(G, task.type, task.target, task.recipe)) {
      PS.UI.toast(G, 'Already on it!');
      return false;
    }
    if (w.queue.length >= this.MAX_QUEUE) {
      PS.UI.toast(G, 'Task list is full');
      return false;
    }
    if (front) w.queue.unshift(task);
    else w.queue.push(task);
    PS.Audio.play(G, 'tap');
    return true;
  },

  // Position of a target in the owner's plan (1 = current task), 0 if absent.
  planIndex(G, target) {
    const w = G.owner;
    let idx = 0;
    if (w.task) {
      idx++;
      if (w.task.target === target) return idx;
    }
    for (const t of w.queue) {
      idx++;
      if (t.target === target) return idx;
    }
    return 0;
  },

  statMult(w, stat) {
    if (w.isOwner) return 1;
    return 1 + 0.15 * (w.record.stats[stat] || 0);
  },

  // ----- Apprentice brain: choose the most useful job allowed by the role.
  think(G, w) {
    const role = w.record.role;
    const service = role === 'all' || role === 'service';
    const brew = role === 'all' || role === 'brew';
    const free = (type, target, recipe) => !this.isQueued(G, type, target, recipe);
    const d = (x, y) => U.dist(w.obj.getX(), w.obj.getY(), x, y);
    const options = [];
    if (brew) {
      for (const c of G.cauldrons) {
        if (c.unlocked && c.state === 'done' && free('collect', c)) options.push({ p: 0, dist: d(c.x, c.y), task: { type: 'collect', target: c } });
        if (c.unlocked && c.state === 'dirty' && free('clean', c)) options.push({ p: 0.5, dist: d(c.x, c.y), task: { type: 'clean', target: c } });
      }
    }
    if (service) {
      for (const c of PS.World.pendingOrders(G)) {
        for (const it of PS.Order.needsAny(c)) {
          if ((G.state.stock[it.recipe.id] || 0) > 0 && free('fetchStock', c, it.recipe)) {
            options.push({ p: 1, dist: d(G.counter.x, G.counter.y), task: { type: 'fetchStock', target: c, recipe: it.recipe } });
            break;
          }
        }
      }
      for (const c of G.customers) {
        if (c.state === 'waitingOrder' && free('takeOrder', c)) {
          // Most impatient customers first.
          options.push({ p: 2 + c.patience / c.maxPatience, dist: d(c.obj.getX(), c.obj.getY()), task: { type: 'takeOrder', target: c } });
        }
      }
    }
    if (brew) {
      const job = this.brewJob(G, w);
      if (job) options.push({ p: 3, dist: d(job.cauldron.x, job.cauldron.y), task: null, job });
    }
    if (!options.length) return;
    options.sort((a, b) => a.p - b.p || a.dist - b.dist);
    const best = options[0];
    if (best.job) {
      if (!PS.Brewing.reserve(G, best.job.cauldron, PS.Brewing.bestIngredients(G, best.job.recipe))) return;
      this.begin(G, w, { type: 'startBrew', target: best.job.cauldron });
    } else {
      this.begin(G, w, best.task);
    }
  },

  // The oldest wanted potion nobody is making yet, and the nearest idle
  // cauldron to brew it in.
  brewJob(G, w) {
    const cauldrons = G.cauldrons.filter((c) => c.unlocked && c.state === 'idle');
    if (!cauldrons.length) return null;
    const want = PS.World.uncoveredItem(G, (r) => PS.Brewing.canBrew(G, r));
    if (!want) return null;
    cauldrons.sort((a, b) => U.dist(w.obj.getX(), w.obj.getY(), a.x, a.y) - U.dist(w.obj.getX(), w.obj.getY(), b.x, b.y));
    return { cauldron: cauldrons[0], recipe: want.recipe };
  },

  taskSpot(G, task, w) {
    const t = task.target;
    const offset = w && !w.isOwner ? (w.index % 2 ? 1 : -1) * 18 * Math.ceil(w.index / 2) : 0;
    switch (task.type) {
      case 'takeOrder':
      case 'deliver':
        if (!t.seat) return null;
        return { x: t.seat.standX, y: t.seat.standY, fx: t.seat.x - t.seat.standX, fy: t.seat.y - t.seat.standY };
      case 'startBrew':
      case 'collect':
      case 'clean':
        return { x: t.standX, y: t.standY, fx: 0, fy: -1 };
      case 'fetchStock':
      case 'store':
        return { x: G.counter.standX + offset, y: G.counter.standY, fx: 0, fy: 1 };
    }
    return null;
  },

  // Can the task still be performed?
  isValid(G, task) {
    const t = task.target;
    switch (task.type) {
      case 'takeOrder':
        return t.state === 'waitingOrder' && !!t.seat;
      case 'deliver':
        return t.state === 'ordered' && !!t.seat && PS.Order.wants(t, task.recipe.id);
      case 'startBrew':
        return t.state === 'reserved';
      case 'collect':
        return t.state === 'done';
      case 'clean':
        return t.state === 'dirty';
      case 'fetchStock':
        return t.state === 'ordered' && !!PS.Order.need(t, task.recipe.id) && (G.state.stock[task.recipe.id] || 0) > 0;
      case 'store':
        return true;
    }
    return false;
  },

  actionTime(G, type, w) {
    const b = PS.data.balance;
    const base = {
      takeOrder: b.takeOrderTime,
      startBrew: b.addIngredientsTime,
      collect: b.collectTime,
      deliver: b.deliverTime,
      fetchStock: b.collectTime,
      store: b.collectTime * 0.6,
      clean: b.cleanTime,
    }[type];
    const stat = type === 'takeOrder' || type === 'deliver' ? 'service' : 'brew';
    const apprentice = w && !w.isOwner ? PS.data.balance.apprenticeSlowness : 1;
    return (base * apprentice * G.mult('quick_hands', -1)) / (w ? this.statMult(w, stat) : 1);
  },

  // Called when a customer leaves: drop tasks that targeted them.
  onCustomerGone(G, c) {
    for (const w of G.workers) {
      w.queue = w.queue.filter((t) => t.target !== c);
      if (w.task && w.task.target === c && w.task.type !== 'deliver') {
        this.abort(G, w);
      }
    }
  },

  abort(G, w) {
    const t = w.task;
    w.task = null;
    if (t && t.type === 'startBrew' && t.target.state === 'reserved') {
      PS.Brewing.cancelReservation(G, t.target);
    }
  },

  update(G, dt) {
    for (const w of G.workers) {
      w.speed = (PS.data.balance.ownerSpeed * G.mult('swift_shoes', +1) * this.statMult(w, 'speed')) /
        (w.isOwner ? 1 : PS.data.balance.apprenticeSlowness);
      if (!w.task) this.nextTask(G, w);
      if (!w.task && !w.isOwner) {
        w.thinkTimer -= dt;
        if (w.thinkTimer <= 0) {
          w.thinkTimer = 0.3;
          this.think(G, w);
        }
      }
      this.updateHeldBottle(G, w);
      const task = w.task;
      if (!task) {
        // Idle: go back to the worker's resting spot.
        if (!w.path || !w.path.length) {
          const [hx, hy] = w.home || G.home;
          if (U.dist(w.obj.getX(), w.obj.getY(), hx, hy) > 6 && !w.goingHome) {
            w.goingHome = true;
            PS.goTo(w, hx, hy);
          } else if (U.dist(w.obj.getX(), w.obj.getY(), hx, hy) <= 6) {
            w.goingHome = false;
            PS.turnToward(w, 0, 1, dt);
          }
        }
        PS.walk(w, dt);
        continue;
      }
      w.goingHome = false;
      if (task.phase === 'walk') {
        if (task.type === 'deliver' && !this.isValid(G, task)) {
          // The customer left or was served: find someone else for this potion.
          this.retargetDelivery(G, w, task);
          continue;
        }
        if (task.type === 'store' && task.target === G.counter) {
          // Before storing, check whether a customer ordered this potion meanwhile.
          const c = this.findCustomerFor(G, task.recipe);
          if (c) {
            PS.Order.reserve(c, task.recipe.id);
            this.begin(G, w, { type: 'deliver', target: c, recipe: task.recipe });
            continue;
          }
        }
        if (task.type !== 'deliver' && !this.isValid(G, task)) {
          this.abort(G, w);
          continue;
        }
        if (PS.walk(w, dt)) {
          task.phase = 'act';
          task.t = 0;
          task.dur = this.actionTime(G, task.type, w);
          PS.faceInstantly(w, task.spot.fx, task.spot.fy);
          PS.setAnim(w, 'Work');
          PS.Audio.play(G, task.type === 'startBrew' ? 'splash' : 'tap');
        }
      } else if (task.phase === 'act') {
        PS.setAnim(w, 'Work');
        task.t += dt;
        if (task.t >= task.dur) {
          w.task = null;
          PS.setAnim(w, 'Idle');
          this.complete(G, w, task);
        }
      }
    }
  },

  nextTask(G, w) {
    while (w.queue.length) {
      const task = w.queue.shift();
      if (task.type !== 'deliver' && !this.isValid(G, task)) {
        if (task.type === 'startBrew' && task.target.state === 'reserved') PS.Brewing.cancelReservation(G, task.target);
        continue;
      }
      this.begin(G, w, task);
      return;
    }
  },

  begin(G, w, task) {
    const spot = this.taskSpot(G, task, w);
    if (!spot) {
      if (task.type === 'deliver') this.retargetDelivery(G, w, task);
      return;
    }
    task.spot = spot;
    task.phase = 'walk';
    w.task = task;
    PS.goTo(w, spot.x, spot.y);
  },

  complete(G, w, task) {
    const t = task.target;
    switch (task.type) {
      case 'takeOrder':
        t.state = 'ordered';
        t.orderedAt = G.time;
        t.patience = Math.min(t.maxPatience, t.patience + t.maxPatience * 0.15);
        PS.UI.floatText(G, t.obj.getX(), t.obj.getY(), 100,
          t.items.length > 1 ? t.items.length + ' potions' : t.recipe.name, t.recipe.icon);
        // A wanted potion is already waiting on the counter: bring it.
        {
          const it = PS.Order.needsAny(t).find((i) => (G.state.stock[i.recipe.id] || 0) > 0);
          if (it && !this.isQueued(G, 'fetchStock', t, it.recipe)) {
            const job = { type: 'fetchStock', target: t, recipe: it.recipe };
            if (w.isOwner) this.enqueue(G, job, true);
            else this.begin(G, w, job);
          }
        }
        PS.UI.markDirty(G);
        break;
      case 'startBrew':
        PS.Brewing.start(G, t);
        break;
      case 'clean':
        PS.Brewing.clean(G, t);
        break;
      case 'collect':
        w.carryQuality = t.quality;
        w.carrying = PS.Brewing.collect(G, t);
        if (w.carrying) this.assignDelivery(G, w);
        break;
      case 'fetchStock':
        if ((G.state.stock[task.recipe.id] || 0) > 0 && PS.Order.reserve(t, task.recipe.id)) {
          w.carryQuality = PS.Stock.take(G, task.recipe.id);
          w.carrying = task.recipe;
          this.begin(G, w, { type: 'deliver', target: t, recipe: task.recipe });
        }
        PS.UI.markDirty(G);
        break;
      case 'deliver':
        if (w.carrying && t.state === 'ordered' && PS.World.deliverItem(G, t, w.carrying, w.carryQuality)) {
          w.carrying = null;
        } else {
          this.retargetDelivery(G, w, task);
        }
        PS.UI.markDirty(G);
        break;
      case 'store':
        this.storeCarried(G, w);
        break;
    }
  },

  // First-in-first-out: the oldest order for this potion gets it.
  findCustomerFor(G, recipe) {
    return PS.World.pendingOrders(G).find((c) => PS.Order.need(c, recipe.id)) || null;
  },

  assignDelivery(G, w) {
    const r = w.carrying;
    if (r.id === 'sludge') {
      PS.UI.toast(G, 'Murky Sludge... nobody wants that!');
      w.carrying = null;
      return;
    }
    const c = this.findCustomerFor(G, r);
    if (c) {
      PS.Order.reserve(c, r.id);
      this.begin(G, w, { type: 'deliver', target: c, recipe: r });
    } else {
      // Nobody is waiting for it yet: put it on the counter for later.
      this.begin(G, w, { type: 'store', target: G.counter, recipe: r });
    }
  },

  retargetDelivery(G, w, task) {
    if (task.type === 'deliver' && task.target && task.target.items) PS.Order.unreserve(task.target, task.recipe.id);
    w.task = null;
    if (w.carrying) this.assignDelivery(G, w);
  },

  // No customer is waiting for this potion: keep it on the counter.
  storeCarried(G, w) {
    const r = w.carrying;
    w.carrying = null;
    const s = G.state.stock;
    const total = Object.values(s).reduce((a, b) => a + b, 0);
    if (total >= PS.data.balance.maxStock) {
      PS.UI.toast(G, 'Counter is full — potion sold to a passer-by');
      G.addGold(Math.round(r.price * 0.5));
      return;
    }
    PS.Stock.add(G, r, w.carryQuality === undefined ? 1 : w.carryQuality);
    PS.UI.toast(G, r.name + ' stored on the counter');
    PS.UI.markDirty(G);
  },
};
