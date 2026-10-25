// ===== Potion Shop: workers and task queue =====
// The shop owner (and later hired workers) performs one physical task at a
// time. Taps add tasks to a queue so nothing is lost while the owner is busy.
// Exclusive targets (a customer's order, a cauldron, a delivery) are claimed
// so two tasks can never work on the same thing.
const PS = gdjs.PotionShop;
const U = PS.util;

PS.TASKS = {
  takeOrder: { icon: 'icon_order', color: '90;170;255', label: 'Take order' },
  startBrew: { icon: 'icon_brew', color: '185;120;255', label: 'Add ingredients' },
  collect: { icon: 'icon_sparkle', color: '255;205;80', label: 'Collect potion' },
  deliver: { icon: 'icon_check', color: '110;220;120', label: 'Deliver' },
  fetchStock: { icon: 'icon_sparkle', color: '255;205;80', label: 'Fetch potion' },
  store: { icon: 'icon_check', color: '255;205;80', label: 'Store potion' },
};

PS.Workers = {
  MAX_QUEUE: 6,

  createOwner(G) {
    const [hx, hy] = G.home;
    const obj = PS.create(G.scene, 'Owner', hx, hy, '');
    const w = {
      id: 'owner',
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

  // Is a task with this type/target already queued or running?
  isQueued(G, type, target) {
    for (const w of G.workers) {
      if (w.task && w.task.type === type && w.task.target === target) return true;
      if (w.queue.some((t) => t.type === type && t.target === target)) return true;
    }
    return false;
  },

  queuedCount(G, target) {
    let n = 0;
    for (const w of G.workers) {
      if (w.task && w.task.target === target) n++;
      n += w.queue.filter((t) => t.target === target).length;
    }
    return n;
  },

  // Add a task for the owner. Returns false when refused.
  enqueue(G, task, front) {
    const w = G.owner;
    if (this.isQueued(G, task.type, task.target)) {
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

  // Index (1-based) of a task in the owner's plan, for the number badges.
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

  // Where the worker stands to perform a task, and which way it faces.
  taskSpot(G, task) {
    const t = task.target;
    switch (task.type) {
      case 'takeOrder':
      case 'deliver':
        if (!t.seat) return null;
        return { x: t.seat.standX, y: t.seat.standY, fx: t.seat.x - t.seat.standX, fy: t.seat.y - t.seat.standY };
      case 'startBrew':
      case 'collect':
        return { x: t.standX, y: t.standY, fx: 0, fy: -1 };
      case 'fetchStock':
      case 'store':
        return { x: G.counter.standX, y: G.counter.standY, fx: 0, fy: 1 };
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
        return t.state === 'ordered' && !!t.seat;
      case 'startBrew':
        return t.state === 'reserved';
      case 'collect':
        return t.state === 'done';
      case 'fetchStock':
        return t.state === 'ordered' && (G.state.stock[t.recipe.id] || 0) > 0;
      case 'store':
        return true;
    }
    return false;
  },

  actionTime(G, type) {
    const b = PS.data.balance;
    const base = {
      takeOrder: b.takeOrderTime,
      startBrew: b.addIngredientsTime,
      collect: b.collectTime,
      deliver: b.deliverTime,
      fetchStock: b.collectTime,
      store: b.collectTime * 0.6,
    }[type];
    return base * G.mult('quick_hands', -1);
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
      w.speed = PS.data.balance.ownerSpeed * G.mult('swift_shoes', +1);
      if (!w.task) this.nextTask(G, w);
      const task = w.task;
      if (!task) {
        // Idle: go back home behind the counter.
        if (!w.path || !w.path.length) {
          const [hx, hy] = G.home;
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
            c.deliveryReserved = true;
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
          task.dur = this.actionTime(G, task.type);
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
    const spot = this.taskSpot(G, task);
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
        PS.UI.floatText(G, t.obj.getX(), t.obj.getY(), 100, t.recipe.name, t.recipe.icon);
        // A matching potion is already waiting on the counter: bring it.
        if ((G.state.stock[t.recipe.id] || 0) > 0) {
          this.enqueue(G, { type: 'fetchStock', target: t }, true);
        }
        PS.UI.markDirty(G);
        break;
      case 'startBrew':
        PS.Brewing.start(G, t);
        break;
      case 'collect':
        w.carrying = PS.Brewing.collect(G, t);
        if (w.carrying) this.assignDelivery(G, w);
        break;
      case 'fetchStock':
        if ((G.state.stock[t.recipe.id] || 0) > 0) {
          G.state.stock[t.recipe.id]--;
          w.carrying = t.recipe;
          this.begin(G, w, { type: 'deliver', target: t, recipe: t.recipe });
          t.deliveryReserved = true;
        }
        PS.UI.markDirty(G);
        break;
      case 'deliver':
        if (w.carrying && t.state === 'ordered') {
          PS.World.serve(G, t, w.carrying);
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
    return PS.World.pendingOrders(G).find((c) => c.recipe.id === recipe.id && !c.deliveryReserved) || null;
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
      c.deliveryReserved = true;
      this.begin(G, w, { type: 'deliver', target: c, recipe: r });
    } else {
      // Nobody is waiting for it yet: put it on the counter for later.
      this.begin(G, w, { type: 'store', target: G.counter, recipe: r });
    }
  },

  retargetDelivery(G, w, task) {
    if (task.target && task.target.deliveryReserved && task.target.state === 'ordered') {
      task.target.deliveryReserved = false;
    }
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
    s[r.id] = (s[r.id] || 0) + 1;
    PS.UI.toast(G, r.name + ' stored on the counter');
    PS.UI.markDirty(G);
  },
};
