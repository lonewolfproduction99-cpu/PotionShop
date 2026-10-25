gdjs.ShopCode = {};
gdjs.ShopCode.localVariables = [];
gdjs.ShopCode.idToCallbackMap = new Map();
gdjs.ShopCode.GDExteriorObjects1= [];
gdjs.ShopCode.GDExteriorObjects2= [];
gdjs.ShopCode.GDRoomObjects1= [];
gdjs.ShopCode.GDRoomObjects2= [];
gdjs.ShopCode.GDCounterObjects1= [];
gdjs.ShopCode.GDCounterObjects2= [];
gdjs.ShopCode.GDIngredientShelfObjects1= [];
gdjs.ShopCode.GDIngredientShelfObjects2= [];
gdjs.ShopCode.GDPotionRackObjects1= [];
gdjs.ShopCode.GDPotionRackObjects2= [];
gdjs.ShopCode.GDBookshelfObjects1= [];
gdjs.ShopCode.GDBookshelfObjects2= [];
gdjs.ShopCode.GDBarrelObjects1= [];
gdjs.ShopCode.GDBarrelObjects2= [];
gdjs.ShopCode.GDCratesObjects1= [];
gdjs.ShopCode.GDCratesObjects2= [];
gdjs.ShopCode.GDPlantObjects1= [];
gdjs.ShopCode.GDPlantObjects2= [];
gdjs.ShopCode.GDCandelabraObjects1= [];
gdjs.ShopCode.GDCandelabraObjects2= [];
gdjs.ShopCode.GDTableSetObjects1= [];
gdjs.ShopCode.GDTableSetObjects2= [];
gdjs.ShopCode.GDCauldronObjects1= [];
gdjs.ShopCode.GDCauldronObjects2= [];
gdjs.ShopCode.GDSlotSignObjects1= [];
gdjs.ShopCode.GDSlotSignObjects2= [];
gdjs.ShopCode.GDOwnerObjects1= [];
gdjs.ShopCode.GDOwnerObjects2= [];
gdjs.ShopCode.GDCustKnightObjects1= [];
gdjs.ShopCode.GDCustKnightObjects2= [];
gdjs.ShopCode.GDCustElfObjects1= [];
gdjs.ShopCode.GDCustElfObjects2= [];
gdjs.ShopCode.GDCustFarmerObjects1= [];
gdjs.ShopCode.GDCustFarmerObjects2= [];
gdjs.ShopCode.GDCustDwarfObjects1= [];
gdjs.ShopCode.GDCustDwarfObjects2= [];
gdjs.ShopCode.GDCustLadyObjects1= [];
gdjs.ShopCode.GDCustLadyObjects2= [];
gdjs.ShopCode.GDCustMageObjects1= [];
gdjs.ShopCode.GDCustMageObjects2= [];
gdjs.ShopCode.GDCustRogueObjects1= [];
gdjs.ShopCode.GDCustRogueObjects2= [];
gdjs.ShopCode.GDLiquidObjects1= [];
gdjs.ShopCode.GDLiquidObjects2= [];
gdjs.ShopCode.GDBubbleObjects1= [];
gdjs.ShopCode.GDBubbleObjects2= [];
gdjs.ShopCode.GDNavBlockObjects1= [];
gdjs.ShopCode.GDNavBlockObjects2= [];
gdjs.ShopCode.GDWaypointObjects1= [];
gdjs.ShopCode.GDWaypointObjects2= [];
gdjs.ShopCode.GDIconObjects1= [];
gdjs.ShopCode.GDIconObjects2= [];
gdjs.ShopCode.GDRingFillObjects1= [];
gdjs.ShopCode.GDRingFillObjects2= [];
gdjs.ShopCode.GDRingBackObjects1= [];
gdjs.ShopCode.GDRingBackObjects2= [];
gdjs.ShopCode.GDSpeechBubbleObjects1= [];
gdjs.ShopCode.GDSpeechBubbleObjects2= [];
gdjs.ShopCode.GDGlowObjects1= [];
gdjs.ShopCode.GDGlowObjects2= [];
gdjs.ShopCode.GDPanelWoodObjects1= [];
gdjs.ShopCode.GDPanelWoodObjects2= [];
gdjs.ShopCode.GDPanelParchmentObjects1= [];
gdjs.ShopCode.GDPanelParchmentObjects2= [];
gdjs.ShopCode.GDPanelDarkObjects1= [];
gdjs.ShopCode.GDPanelDarkObjects2= [];
gdjs.ShopCode.GDBtnGreenObjects1= [];
gdjs.ShopCode.GDBtnGreenObjects2= [];
gdjs.ShopCode.GDBtnGoldObjects1= [];
gdjs.ShopCode.GDBtnGoldObjects2= [];
gdjs.ShopCode.GDBtnRedObjects1= [];
gdjs.ShopCode.GDBtnRedObjects2= [];
gdjs.ShopCode.GDBtnGrayObjects1= [];
gdjs.ShopCode.GDBtnGrayObjects2= [];
gdjs.ShopCode.GDBtnBlueObjects1= [];
gdjs.ShopCode.GDBtnBlueObjects2= [];
gdjs.ShopCode.GDBtnPurpleObjects1= [];
gdjs.ShopCode.GDBtnPurpleObjects2= [];
gdjs.ShopCode.GDBarBackObjects1= [];
gdjs.ShopCode.GDBarBackObjects2= [];
gdjs.ShopCode.GDBarFillObjects1= [];
gdjs.ShopCode.GDBarFillObjects2= [];
gdjs.ShopCode.GDUiTextObjects1= [];
gdjs.ShopCode.GDUiTextObjects2= [];


gdjs.ShopCode.userFunc0x8bacd0 = function GDJSInlineCode(runtimeScene) {
"use strict";
// ===== Potion Shop: game data =====
// Recipes, ingredients, customer types and upgrades are stored in the
// project's global variables (Project manager > Global variables) so they can
// be edited in GDevelop without touching code. This block reads them into
// plain JavaScript objects, with safe defaults for missing fields.
const PS = (gdjs.PotionShop = gdjs.PotionShop || {});

PS.loadData = function (runtimeScene) {
  const vars = runtimeScene.getGame().getVariables();
  const read = (name) => (vars.has(name) ? vars.get(name).toJSObject() : null);

  const recipes = (read('Recipes') || []).map((r) => ({
    id: String(r.Id),
    name: String(r.Name),
    ingredients: (r.Ingredients || []).map(String).sort(),
    price: Number(r.Price) || 10,
    brewTime: Number(r.BrewTime) || 6,
    color: String(r.Color || '200;200;200'),
    icon: String(r.Icon || 'potion_sludge'),
    unlockLevel: Number(r.UnlockLevel) || 1,
  }));
  const ingredients = (read('Ingredients') || []).map((i) => ({
    id: String(i.Id),
    name: String(i.Name),
    cost: Number(i.Cost) || 2,
    bundle: Number(i.Bundle) || 5,
    icon: String(i.Icon || 'ing_redleaf'),
    unlockLevel: Number(i.UnlockLevel) || 1,
  }));
  const customers = (read('CustomerTypes') || []).map((c) => ({
    id: String(c.Id),
    object: String(c.Object),
    name: String(c.Name),
    patience: Number(c.Patience) || 60,
    tip: Number(c.Tip) || 1,
    speed: Number(c.Speed) || 100,
    minLevel: Number(c.MinLevel) || 1,
  }));
  const upgrades = (read('Upgrades') || []).map((u) => ({
    id: String(u.Id),
    name: String(u.Name),
    desc: String(u.Description || ''),
    icon: String(u.Icon || 'icon_upgrades'),
    tab: String(u.Tab || 'upgrades'),
    baseCost: Number(u.BaseCost) || 50,
    costGrowth: Number(u.CostGrowth) || 1.6,
    maxLevel: Number(u.MaxLevel) || 5,
    effect: Number(u.Effect) || 0,
    minShopLevel: Number(u.MinShopLevel) || 1,
  }));
  const b = read('Balance') || {};
  const balance = {
    startGold: Number(b.StartGold) || 40,
    startIngredients: Number(b.StartIngredients) || 6,
    xpPerServe: Number(b.XpPerServe) || 10,
    spawnIntervalStart: Number(b.SpawnIntervalStart) || 12,
    spawnIntervalMin: Number(b.SpawnIntervalMin) || 6,
    queueSize: Number(b.QueueSize) || 3,
    maxStock: Number(b.MaxStock) || 6,
    storageBase: Number(b.StorageBase) || 20,
    ownerSpeed: Number(b.OwnerSpeed) || 150,
    takeOrderTime: Number(b.TakeOrderTime) || 1.4,
    addIngredientsTime: Number(b.AddIngredientsTime) || 1.2,
    collectTime: Number(b.CollectTime) || 0.8,
    deliverTime: Number(b.DeliverTime) || 0.7,
    tipMax: Number(b.TipMax) || 0.5,
    sludgePrice: Number(b.SludgePrice) || 0,
  };

  PS.data = {
    recipes,
    recipeById: Object.fromEntries(recipes.map((r) => [r.id, r])),
    ingredients,
    ingredientById: Object.fromEntries(ingredients.map((i) => [i.id, i])),
    customers,
    upgrades,
    upgradeById: Object.fromEntries(upgrades.map((u) => [u.id, u])),
    balance,
  };
  return PS.data;
};

// Recipe matching: ingredient order does not matter.
PS.findRecipe = function (ingredientIds) {
  const key = ingredientIds.slice().sort().join('+');
  for (const r of PS.data.recipes) {
    if (r.ingredients.join('+') === key) return r;
  }
  return null;
};

// XP needed to go from `level` to `level + 1`.
PS.xpForLevel = function (level) {
  return 40 + 30 * (level - 1) + 10 * (level - 1) * (level - 1);
};

};
gdjs.ShopCode.userFunc0x96f210 = function GDJSInlineCode(runtimeScene) {
"use strict";
// ===== Potion Shop: utilities =====
// Math helpers, object helpers and the 3D -> screen projection used to place
// interface elements (patience bars, progress rings) above 3D objects.
const PS = gdjs.PotionShop;

PS.util = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  dist: (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay),
  rand: (a, b) => a + Math.random() * (b - a),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  // Angle (degrees) to give a character model so it faces the direction (dx, dy).
  facingAngle: (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI - 90,
  // Smallest signed difference between two angles in degrees.
  angleDiff: (a, b) => ((((b - a) % 360) + 540) % 360) - 180,
  formatGold: (n) => (n >= 10000 ? (n / 1000).toFixed(1) + 'k' : String(Math.floor(n))),
  formatTime: (s) => (s >= 60 ? Math.floor(s / 60) + 'm ' + Math.floor(s % 60) + 's' : Math.ceil(s) + 's'),
};

// Layout constants (world units) matching the generated 3D models.
PS.K = {
  seatOffsetY: -48.6, // chair seat relative to its table
  tableStandX: 56, // where a worker stands beside a table (towards the aisle)
  tableStandY: -35,
  cauldronStandY: 78, // where a worker stands in front of a cauldron
  liquidHalf: 31, // half size of the liquid surface inside a cauldron
  liquidZ: 58,
  liquidRise: 6,
  potTop: 68,
  counterStandX: 40, // behind the counter
  counterStandY: -50,
  sitZ: -1.4, // character height offset when sitting on a chair
  headSeated: 90, // overlay heights above characters
  headStanding: 104,
  ringCauldron: 136,
  ringWorker: 124,
  carryZ: 114,
};

PS.create = function (runtimeScene, name, x, y, layer) {
  const obj = runtimeScene.createObject(name);
  if (!obj) throw new Error('Potion Shop: missing object ' + name);
  if (layer !== undefined) obj.setLayer(layer);
  obj.setPosition(x, y);
  return obj;
};

PS.destroy = function (obj) {
  if (obj) obj.deleteFromScene();
};

// Read an instance variable set in the scene editor.
PS.varNum = (obj, name, def) => {
  const v = obj.getVariables();
  return v.has(name) ? v.get(name).getAsNumber() : def;
};
PS.varStr = (obj, name, def) => {
  const v = obj.getVariables();
  return v.has(name) ? v.get(name).getAsString() : def;
};

// ----- 3D world to 2D layer projection -----
PS.proj = {
  _v: null,
  init(runtimeScene) {
    this.scene = runtimeScene;
    this._v = new THREE.Vector3();
  },
  // Returns [x, y] in the coordinates of a 2D layer using the default camera
  // (the game resolution), or null when the point is behind the camera.
  toScreen(x, y, z) {
    const layer = this.scene.getLayer('');
    const cam = layer.getRenderer().getThreeCamera();
    if (!cam) return null;
    const game = this.scene.getGame();
    // Recent GDevelop versions render the 3D world scaled down (and mirrored on Y).
    const k = this.scene.getRenderer3DInverseWorldScale ? this.scene.getRenderer3DInverseWorldScale() : 1;
    const v = this._v.set(x * k, -y * k, z * k).project(cam);
    if (v.z > 1) return null;
    return [((v.x + 1) / 2) * game.getGameResolutionWidth(), ((1 - v.y) / 2) * game.getGameResolutionHeight()];
  },
};

// ----- Camera: fixed, angled top-down view that fits the shop in portrait -----
PS.setupCamera = function (runtimeScene) {
  const game = runtimeScene.getGame();
  const W = game.getGameResolutionWidth();
  const H = game.getGameResolutionHeight();
  const layer = runtimeScene.getLayer('');
  const cam = layer.getRenderer().getThreeCamera();
  const fov = cam ? cam.fov : 35;
  const aspect = W / H;
  // Fit the shop width (walls included) and keep room for the HUD/menus.
  const targetWidth = 668;
  const halfH = Math.tan(((fov / 2) * Math.PI) / 180);
  const halfW = halfH * aspect;
  const dist = targetWidth / 2 / halfW;
  const elevation = (52 * Math.PI) / 180; // camera pitch from the ground
  const lookX = 320;
  const lookY = 492;
  const camX = lookX;
  const camY = lookY + dist * Math.cos(elevation);
  const camZ = dist * Math.sin(elevation);
  layer.setCameraX(camX);
  layer.setCameraY(camY);
  gdjs.scene3d.camera.setCameraZ(runtimeScene, camZ, '', 0);
  gdjs.scene3d.camera.turnCameraTowardPosition(runtimeScene, lookX, lookY, 0, '', 0, false);
  if (cam) cam.updateMatrixWorld(true);
};

};
gdjs.ShopCode.userFunc0x96f2d8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// ===== Potion Shop: navigation =====
// Characters walk on a grid built once at scene start. Blocked cells come from
// the "NavBlock" rectangles (walls, drawn on the hidden "Nav" layer) and from
// every object of the "NavObstacles" group (furniture). Paths are found with
// A* and then smoothed so characters walk in straight lines when possible.
const PS = gdjs.PotionShop;

PS.Nav = class {
  constructor(runtimeScene) {
    this.cell = 16;
    this.radius = 11; // half width of a character
    this.minX = -260;
    this.minY = -60;
    this.cols = Math.ceil((900 - this.minX) / this.cell);
    this.rows = Math.ceil((1300 - this.minY) / this.cell);
    this.blocked = new Uint8Array(this.cols * this.rows);
    for (const b of runtimeScene.getObjects('NavBlock')) {
      this.blockRect(b.getX(), b.getY(), b.getX() + b.getWidth(), b.getY() + b.getHeight(), this.radius);
    }
    for (const o of runtimeScene.getObjects('NavObstacles')) {
      const aabb = o.getAABB();
      this.blockRect(aabb.min[0], aabb.min[1], aabb.max[0], aabb.max[1], this.radius);
    }
    // A* scratch buffers, reused between searches.
    const n = this.cols * this.rows;
    this.g = new Float32Array(n);
    this.came = new Int32Array(n);
    this.stamp = new Uint32Array(n);
    this.closed = new Uint32Array(n);
    this.search = 0;
  }

  blockRect(x0, y0, x1, y1, pad) {
    const c0 = Math.max(0, Math.floor((x0 - pad - this.minX) / this.cell));
    const c1 = Math.min(this.cols - 1, Math.floor((x1 + pad - this.minX) / this.cell));
    const r0 = Math.max(0, Math.floor((y0 - pad - this.minY) / this.cell));
    const r1 = Math.min(this.rows - 1, Math.floor((y1 + pad - this.minY) / this.cell));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) this.blocked[r * this.cols + c] = 1;
  }

  cellOf(x, y) {
    const c = PS.util.clamp(Math.floor((x - this.minX) / this.cell), 0, this.cols - 1);
    const r = PS.util.clamp(Math.floor((y - this.minY) / this.cell), 0, this.rows - 1);
    return r * this.cols + c;
  }

  center(i) {
    return [this.minX + (i % this.cols) * this.cell + this.cell / 2, this.minY + Math.floor(i / this.cols) * this.cell + this.cell / 2];
  }

  // Nearest walkable cell (breadth-first ring search).
  nearestFree(i) {
    if (!this.blocked[i]) return i;
    const c0 = i % this.cols;
    const r0 = Math.floor(i / this.cols);
    for (let d = 1; d < 12; d++) {
      for (let dr = -d; dr <= d; dr++) {
        for (let dc = -d; dc <= d; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue;
          const r = r0 + dr;
          const c = c0 + dc;
          if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) continue;
          const j = r * this.cols + c;
          if (!this.blocked[j]) return j;
        }
      }
    }
    return i;
  }

  // Straight line walkable test (sampled every half cell).
  lineFree(ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay);
    const steps = Math.ceil(d / (this.cell / 2));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      if (this.blocked[this.cellOf(ax + (bx - ax) * t, ay + (by - ay) * t)]) return false;
    }
    return true;
  }

  // Returns an array of [x, y] waypoints ending exactly at (tx, ty).
  findPath(sx, sy, tx, ty) {
    if (this.lineFree(sx, sy, tx, ty) && !this.blocked[this.cellOf(tx, ty)]) return [[tx, ty]];
    const start = this.nearestFree(this.cellOf(sx, sy));
    const goal = this.nearestFree(this.cellOf(tx, ty));
    const cols = this.cols;
    const id = ++this.search;
    const open = [start];
    const f = new Map();
    this.g[start] = 0;
    this.stamp[start] = id;
    this.came[start] = -1;
    const [gx, gy] = [goal % cols, Math.floor(goal / cols)];
    const h = (i) => {
      const dx = Math.abs((i % cols) - gx);
      const dy = Math.abs(Math.floor(i / cols) - gy);
      return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
    };
    f.set(start, h(start));
    let found = false;
    let iterations = 0;
    while (open.length && iterations++ < 6000) {
      // Pop the lowest f (binary heap would be faster; open lists stay small here).
      let bi = 0;
      for (let k = 1; k < open.length; k++) if (f.get(open[k]) < f.get(open[bi])) bi = k;
      const cur = open[bi];
      open[bi] = open[open.length - 1];
      open.pop();
      if (cur === goal) {
        found = true;
        break;
      }
      this.closed[cur] = id;
      const cc = cur % cols;
      const cr = Math.floor(cur / cols);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nc = cc + dc;
          const nr = cr + dr;
          if (nc < 0 || nr < 0 || nc >= cols || nr >= this.rows) continue;
          const ni = nr * cols + nc;
          if (this.blocked[ni] || this.closed[ni] === id) continue;
          // No corner cutting.
          if (dr && dc && (this.blocked[cr * cols + nc] || this.blocked[nr * cols + cc])) continue;
          const ng = this.g[cur] + (dr && dc ? 1.414 : 1);
          if (this.stamp[ni] !== id || ng < this.g[ni]) {
            if (this.stamp[ni] !== id) open.push(ni);
            this.stamp[ni] = id;
            this.g[ni] = ng;
            this.came[ni] = cur;
            f.set(ni, ng + h(ni));
          }
        }
      }
    }
    if (!found) return [[tx, ty]];
    const cells = [];
    for (let i = goal; i !== -1; i = this.came[i]) cells.push(i);
    cells.reverse();
    const pts = cells.map((i) => this.center(i));
    pts.push([tx, ty]);
    // String pulling: skip waypoints that are directly visible.
    const out = [];
    let ax = sx;
    let ay = sy;
    let k = 0;
    while (k < pts.length) {
      let far = k;
      for (let j = pts.length - 1; j > k; j--) {
        if (this.lineFree(ax, ay, pts[j][0], pts[j][1])) {
          far = j;
          break;
        }
      }
      out.push(pts[far]);
      ax = pts[far][0];
      ay = pts[far][1];
      k = far + 1;
    }
    return out;
  }
};

// Moves a character object along its path. Returns true when arrived.
PS.walk = function (ch, dt) {
  if (!ch.path || !ch.path.length) return true;
  const obj = ch.obj;
  let remaining = ch.speed * dt;
  while (remaining > 0 && ch.path.length) {
    const [tx, ty] = ch.path[0];
    const dx = tx - obj.getX();
    const dy = ty - obj.getY();
    const d = Math.hypot(dx, dy);
    if (d < 0.5) {
      ch.path.shift();
      continue;
    }
    const step = Math.min(d, remaining);
    obj.setX(obj.getX() + (dx / d) * step);
    obj.setY(obj.getY() + (dy / d) * step);
    remaining -= step;
    PS.turnToward(ch, dx, dy, dt);
    if (step >= d) ch.path.shift();
  }
  PS.setAnim(ch, ch.path.length ? 'Walk' : ch.idleAnim || 'Idle');
  return ch.path.length === 0;
};

PS.turnToward = function (ch, dx, dy, dt) {
  const target = PS.util.facingAngle(dx, dy);
  const cur = ch.obj.getAngle();
  const diff = PS.util.angleDiff(cur, target);
  const maxTurn = 720 * dt;
  ch.obj.setAngle(cur + PS.util.clamp(diff, -maxTurn, maxTurn));
};

PS.faceInstantly = function (ch, dx, dy) {
  ch.obj.setAngle(PS.util.facingAngle(dx, dy));
};

PS.setAnim = function (ch, name) {
  if (ch.anim !== name) {
    ch.anim = name;
    ch.obj.setAnimationName(name);
  }
};

PS.goTo = function (ch, x, y) {
  ch.path = PS.game.nav.findPath(ch.obj.getX(), ch.obj.getY(), x, y);
};

};
gdjs.ShopCode.userFunc0x96f3a0 = function GDJSInlineCode(runtimeScene) {
"use strict";
// ===== Potion Shop: save system =====
// Progress is stored with GDevelop's storage (localStorage on the web, also
// available in mobile exports) under the "PotionShop" storage name.
// Loading validates every field and falls back to defaults on bad data.
const PS = gdjs.PotionShop;

PS.Save = {
  STORAGE: 'PotionShop',
  KEY: 'save',
  VERSION: 1,

  defaults() {
    const d = PS.data;
    const inventory = {};
    for (const ing of d.ingredients) inventory[ing.id] = ing.unlockLevel <= 1 ? d.balance.startIngredients : 0;
    const upgrades = {};
    for (const u of d.upgrades) upgrades[u.id] = 0;
    return {
      v: this.VERSION,
      gold: d.balance.startGold,
      xp: 0,
      level: 1,
      served: 0,
      lost: 0,
      earned: 0,
      satisfaction: 80,
      inventory,
      upgrades,
      stock: {},
      seenRecipes: [],
    };
  },

  validate(raw) {
    const s = this.defaults();
    if (!raw || typeof raw !== 'object') return s;
    const num = (v, def, min, max) => {
      const n = Number(v);
      return Number.isFinite(n) ? PS.util.clamp(n, min, max) : def;
    };
    s.gold = num(raw.gold, s.gold, 0, 1e12);
    s.level = Math.floor(num(raw.level, 1, 1, 99));
    s.xp = num(raw.xp, 0, 0, 1e9);
    s.served = Math.floor(num(raw.served, 0, 0, 1e9));
    s.lost = Math.floor(num(raw.lost, 0, 0, 1e9));
    s.earned = num(raw.earned, 0, 0, 1e12);
    s.satisfaction = num(raw.satisfaction, 80, 0, 100);
    if (raw.inventory && typeof raw.inventory === 'object') {
      for (const id in s.inventory) s.inventory[id] = Math.floor(num(raw.inventory[id], s.inventory[id], 0, 9999));
    }
    if (raw.upgrades && typeof raw.upgrades === 'object') {
      for (const u of PS.data.upgrades) s.upgrades[u.id] = Math.floor(num(raw.upgrades[u.id], 0, 0, u.maxLevel));
    }
    if (raw.stock && typeof raw.stock === 'object') {
      for (const id in raw.stock) {
        if (PS.data.recipeById[id]) s.stock[id] = Math.floor(num(raw.stock[id], 0, 0, 99));
      }
    }
    if (Array.isArray(raw.seenRecipes)) s.seenRecipes = raw.seenRecipes.filter((id) => PS.data.recipeById[id]);
    return s;
  },

  load() {
    const tools = gdjs.evtTools.storage;
    const variable = new gdjs.Variable();
    let raw = null;
    try {
      if (tools.readStringFromJSONFile(this.STORAGE, this.KEY, null, variable)) {
        raw = JSON.parse(variable.getAsString());
      }
    } catch (e) {
      console.warn('Potion Shop: save data is invalid, starting fresh.', e);
      raw = null;
    }
    return this.validate(raw);
  },

  save(state) {
    try {
      gdjs.evtTools.storage.writeStringInJSONFile(this.STORAGE, this.KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('Potion Shop: could not save.', e);
      return false;
    }
  },

  reset() {
    try {
      gdjs.evtTools.storage.deleteElementFromJSONFile(this.STORAGE, this.KEY);
    } catch (e) {
      console.warn('Potion Shop: could not reset the save.', e);
    }
  },
};

};
gdjs.ShopCode.userFunc0x96f4c0 = function GDJSInlineCode(runtimeScene) {
"use strict";
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
    const base = Math.max(b.spawnIntervalMin, b.spawnIntervalStart - (G.state.level - 1) * 0.8);
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

};
gdjs.ShopCode.userFunc0x96f598 = function GDJSInlineCode(runtimeScene) {
"use strict";
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

};
gdjs.ShopCode.userFunc0x965008 = function GDJSInlineCode(runtimeScene) {
"use strict";
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
    for (const id in need) inv[id] -= need[id];
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

};
gdjs.ShopCode.userFunc0x965518 = function GDJSInlineCode(runtimeScene) {
"use strict";
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
      this.hit(hud.hits, x, H - navH - 4, bw, navH + 4, () => this.toggle(G, id), 'tab:' + id);
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
    // Result name on its own line under the slots.
    const line = y + sz + 8;
    if (slots.length === 2) {
      result = PS.findRecipe(slots);
      const known = result && result.unlockLevel <= G.state.level;
      this.icon(G, result && known ? result.icon : 'potion_sludge', rx + sz / 2, y + sz / 2, 80, P.items, 'UI', 17);
      const label = result && known
        ? result.name + '  ·  sells for ~' + Math.round(result.price * G.mult('fine_bottles', +1)) + 'g'
        : 'Unknown mix: this makes Murky Sludge (worth nothing)';
      this.text(G, label, area.x, line, area.w, 24, result && known ? COLORS.ink : COLORS.red, 'center', P.items, 'UI', 17);
    } else {
      this.text(G, '?', rx, y + 18, sz, 56, COLORS.muted, 'center', P.items, 'UI', 17);
      this.text(G, 'Pick 2 ingredients, or tap a recipe below', area.x, line, area.w, 24, COLORS.muted, 'center',
        P.items, 'UI', 17);
    }
    y += sz + 44;
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
      this.text(G, pay + 'g', x + w - 178, y + 12, 70, 26, '170;120;20', 'left', P.items, 'UI', 17);
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
          tag: 'brew:' + c.id,
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
      const cap = G.storageCap();
      const full = n + ing.bundle > cap;
      this.text(G, 'In stock: ' + n + ' / ' + cap + (n <= 2 ? '  LOW!' : ''), x + 92, y + 50, 260, 24,
        n <= 2 ? COLORS.red : COLORS.green,
        'left', P.items, 'UI', 17);
      const cost = ing.cost * ing.bundle;
      this.button(G, P, x + w - 200, y + 14, 190, h - 28, 'BtnGold', '+' + ing.bundle + '  ' + cost + 'g', {
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

};
gdjs.ShopCode.userFunc0x967078 = function GDJSInlineCode(runtimeScene) {
"use strict";
// ===== Potion Shop: game state, progression and main loop =====
const PS = gdjs.PotionShop;
const U = PS.util;

PS.Audio = {
  SOUNDS: {
    coin: 'sfx_coin.wav',
    tap: 'sfx_tap.wav',
    pop: 'sfx_pop.wav',
    splash: 'sfx_splash.wav',
    ready: 'sfx_ready.wav',
    angry: 'sfx_angry.wav',
    buy: 'sfx_buy.wav',
    levelup: 'sfx_levelup.wav',
  },
  play(G, name) {
    if (!G.settings || !G.settings.sound) return;
    const file = this.SOUNDS[name];
    if (!file) return;
    try {
      gdjs.evtTools.sound.playSound(G.scene, file, false, name === 'tap' ? 35 : 70, 1);
    } catch (e) {
      // Sound is optional.
    }
  },
};

PS.Game = class {
  constructor(runtimeScene) {
    this.scene = runtimeScene;
    this.time = 0;
    this.fx = [];
    this.started = false;
    this.saveTimer = 0;
    this.needSave = false;
    PS.game = this;
    PS.loadData(runtimeScene);
    PS.proj.init(runtimeScene);
    this.settings = this.loadSettings();
    this.state = PS.Save.load();
    this.nav = new PS.Nav(runtimeScene);
    PS.setupCamera(runtimeScene);
    PS.World.init(this);
    PS.Workers.createOwner(this);
    PS.UI.init(this);
    this.setShadows(this.settings.shadows);
    this.started = true;
    if (this.state.served === 0 && this.state.gold === PS.data.balance.startGold) {
      PS.UI.toast(this, 'Welcome! Tap a seated customer to take their order.');
    }
  }

  // ----- upgrade helpers
  level(id) {
    return this.state.upgrades[id] || 0;
  }
  // sign > 0: bonus that grows with the level; sign < 0: time reduction.
  mult(id, sign) {
    const u = PS.data.upgradeById[id];
    if (!u) return 1;
    const v = u.effect * this.level(id) * Math.abs(sign);
    return sign > 0 ? 1 + v : 1 / (1 + v);
  }
  // How many of each herb fits in the pantry.
  storageCap() {
    const u = PS.data.upgradeById.herb_storage;
    return PS.data.balance.storageBase + (u ? u.effect * this.level('herb_storage') : 0);
  }
  upgradeMax(u) {
    if (u.id === 'extra_table') return Math.min(u.maxLevel, this.seats.length - 3);
    if (u.id === 'extra_cauldron') return Math.min(u.maxLevel, this.cauldrons.length - 1);
    return u.maxLevel;
  }
  upgradeCost(u) {
    return Math.round(u.baseCost * Math.pow(u.costGrowth, this.level(u.id)));
  }
  upgradeStatus(u) {
    const l = this.level(u.id);
    if (u.id === 'extra_table') return 'Tables: ' + PS.World.tablesUnlocked(this) + ' / ' + this.seats.length;
    if (u.id === 'extra_cauldron') return 'Cauldrons: ' + PS.World.cauldronsUnlocked(this) + ' / ' + this.cauldrons.length;
    return 'Level ' + l + ' / ' + u.maxLevel + (l ? '  ·  +' + Math.round(u.effect * l * 100) + '%' : '');
  }
  buyUpgrade(u) {
    const cost = this.upgradeCost(u);
    if (this.state.gold < cost || this.level(u.id) >= this.upgradeMax(u)) return false;
    this.addGold(-cost);
    this.state.upgrades[u.id] = this.level(u.id) + 1;
    PS.Audio.play(this, 'buy');
    if (u.tab === 'expand') PS.World.applyUnlocks(this);
    PS.UI.toast(this, u.name + ' purchased!');
    this.saveNow();
    return true;
  }

  // ----- economy and progression
  addGold(n) {
    this.state.gold = Math.max(0, this.state.gold + n);
    this.requestSave();
  }
  addXp(n) {
    const s = this.state;
    s.xp += n;
    let leveled = false;
    const newRecipes = [];
    while (s.xp >= PS.xpForLevel(s.level) && s.level < 99) {
      s.xp -= PS.xpForLevel(s.level);
      s.level += 1;
      leveled = true;
      for (const r of PS.data.recipes) if (r.unlockLevel === s.level) newRecipes.push(r);
      for (const ing of PS.data.ingredients) {
        if (ing.unlockLevel === s.level) s.inventory[ing.id] = Math.min(this.storageCap(), (s.inventory[ing.id] || 0) + 4);
      }
    }
    if (leveled) {
      PS.Audio.play(this, 'levelup');
      PS.UI.open(this, 'levelup', { recipes: newRecipes });
      this.saveNow();
    }
  }
  recordSatisfaction(v) {
    this.state.satisfaction = U.clamp(this.state.satisfaction * 0.85 + v * 0.15, 0, 100);
  }

  // ----- saving
  requestSave() {
    this.needSave = true;
  }
  snapshot() {
    // Potions in progress are kept as finished potions on the counter so
    // nothing paid for is lost when the game is closed.
    const s = JSON.parse(JSON.stringify(this.state));
    for (const c of this.cauldrons) {
      if (c.recipe && c.recipe.id !== 'sludge' && (c.state === 'brewing' || c.state === 'done' || c.state === 'reserved')) {
        s.stock[c.recipe.id] = (s.stock[c.recipe.id] || 0) + 1;
      }
    }
    for (const w of this.workers) {
      if (w.carrying && w.carrying.id !== 'sludge') s.stock[w.carrying.id] = (s.stock[w.carrying.id] || 0) + 1;
    }
    return s;
  }
  saveNow() {
    this.needSave = false;
    this.saveTimer = 0;
    PS.Save.save(this.snapshot());
  }
  loadSettings() {
    const v = new gdjs.Variable();
    let s = null;
    try {
      if (gdjs.evtTools.storage.readStringFromJSONFile('PotionShop', 'settings', null, v)) s = JSON.parse(v.getAsString());
    } catch (e) {
      s = null;
    }
    return { shadows: s && typeof s.shadows === 'boolean' ? s.shadows : true, sound: s && typeof s.sound === 'boolean' ? s.sound : true };
  }
  saveSettings() {
    gdjs.evtTools.storage.writeStringInJSONFile('PotionShop', 'settings', JSON.stringify(this.settings));
  }
  setShadows(on) {
    this.settings.shadows = on;
    this.scene.getLayer('').setEffectBooleanParameter('Sun', 'isCastingShadow', on);
    this.saveSettings();
  }
  resetProgress() {
    PS.Save.reset();
    this.scene.requestChange(gdjs.SceneChangeRequest.REPLACE_SCENE, 'Shop');
  }

  // ----- main loop
  update() {
    const dt = Math.min(0.1, this.scene.getElapsedTime() / 1000);
    // PS.simSteps > 1 runs the simulation several times per frame (automated tests only).
    const steps = PS.simSteps || 1;
    for (let i = 0; i < steps; i++) {
      this.time += dt;
      PS.World.updateCustomers(this, dt);
      PS.Workers.update(this, dt);
      PS.Brewing.update(this, dt);
      PS.FX.update(this, dt);
    }
    PS.UI.update(this, dt);
    this.saveTimer += dt;
    if (this.saveTimer > 8 && this.needSave) this.saveNow();
  }
};

};
gdjs.ShopCode.userFunc0x985df8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// Create the game once the systems above are defined.
const PS = gdjs.PotionShop;
runtimeScene.__potionShop = new PS.Game(runtimeScene);
if (!PS._saveOnHide && typeof document !== 'undefined') {
  PS._saveOnHide = true;
  // Save when the app goes to the background (mobile browsers).
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && PS.game) PS.game.saveNow();
  });
}

};
gdjs.ShopCode.eventsList0 = function(runtimeScene) {

{


gdjs.ShopCode.userFunc0x8bacd0(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x96f210(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x96f2d8(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x96f3a0(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x96f4c0(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x96f598(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x965008(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x965518(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x967078(runtimeScene);

}


{


gdjs.ShopCode.userFunc0x985df8(runtimeScene);

}


};gdjs.ShopCode.userFunc0x96bf38 = function GDJSInlineCode(runtimeScene) {
"use strict";
const game = runtimeScene.__potionShop;
if (game) game.update();

};
gdjs.ShopCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {

{ //Subevents
gdjs.ShopCode.eventsList0(runtimeScene);} //End of subevents
}

}


{


gdjs.ShopCode.userFunc0x96bf38(runtimeScene);

}


};

gdjs.ShopCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.ShopCode.GDExteriorObjects1.length = 0;
gdjs.ShopCode.GDExteriorObjects2.length = 0;
gdjs.ShopCode.GDRoomObjects1.length = 0;
gdjs.ShopCode.GDRoomObjects2.length = 0;
gdjs.ShopCode.GDCounterObjects1.length = 0;
gdjs.ShopCode.GDCounterObjects2.length = 0;
gdjs.ShopCode.GDIngredientShelfObjects1.length = 0;
gdjs.ShopCode.GDIngredientShelfObjects2.length = 0;
gdjs.ShopCode.GDPotionRackObjects1.length = 0;
gdjs.ShopCode.GDPotionRackObjects2.length = 0;
gdjs.ShopCode.GDBookshelfObjects1.length = 0;
gdjs.ShopCode.GDBookshelfObjects2.length = 0;
gdjs.ShopCode.GDBarrelObjects1.length = 0;
gdjs.ShopCode.GDBarrelObjects2.length = 0;
gdjs.ShopCode.GDCratesObjects1.length = 0;
gdjs.ShopCode.GDCratesObjects2.length = 0;
gdjs.ShopCode.GDPlantObjects1.length = 0;
gdjs.ShopCode.GDPlantObjects2.length = 0;
gdjs.ShopCode.GDCandelabraObjects1.length = 0;
gdjs.ShopCode.GDCandelabraObjects2.length = 0;
gdjs.ShopCode.GDTableSetObjects1.length = 0;
gdjs.ShopCode.GDTableSetObjects2.length = 0;
gdjs.ShopCode.GDCauldronObjects1.length = 0;
gdjs.ShopCode.GDCauldronObjects2.length = 0;
gdjs.ShopCode.GDSlotSignObjects1.length = 0;
gdjs.ShopCode.GDSlotSignObjects2.length = 0;
gdjs.ShopCode.GDOwnerObjects1.length = 0;
gdjs.ShopCode.GDOwnerObjects2.length = 0;
gdjs.ShopCode.GDCustKnightObjects1.length = 0;
gdjs.ShopCode.GDCustKnightObjects2.length = 0;
gdjs.ShopCode.GDCustElfObjects1.length = 0;
gdjs.ShopCode.GDCustElfObjects2.length = 0;
gdjs.ShopCode.GDCustFarmerObjects1.length = 0;
gdjs.ShopCode.GDCustFarmerObjects2.length = 0;
gdjs.ShopCode.GDCustDwarfObjects1.length = 0;
gdjs.ShopCode.GDCustDwarfObjects2.length = 0;
gdjs.ShopCode.GDCustLadyObjects1.length = 0;
gdjs.ShopCode.GDCustLadyObjects2.length = 0;
gdjs.ShopCode.GDCustMageObjects1.length = 0;
gdjs.ShopCode.GDCustMageObjects2.length = 0;
gdjs.ShopCode.GDCustRogueObjects1.length = 0;
gdjs.ShopCode.GDCustRogueObjects2.length = 0;
gdjs.ShopCode.GDLiquidObjects1.length = 0;
gdjs.ShopCode.GDLiquidObjects2.length = 0;
gdjs.ShopCode.GDBubbleObjects1.length = 0;
gdjs.ShopCode.GDBubbleObjects2.length = 0;
gdjs.ShopCode.GDNavBlockObjects1.length = 0;
gdjs.ShopCode.GDNavBlockObjects2.length = 0;
gdjs.ShopCode.GDWaypointObjects1.length = 0;
gdjs.ShopCode.GDWaypointObjects2.length = 0;
gdjs.ShopCode.GDIconObjects1.length = 0;
gdjs.ShopCode.GDIconObjects2.length = 0;
gdjs.ShopCode.GDRingFillObjects1.length = 0;
gdjs.ShopCode.GDRingFillObjects2.length = 0;
gdjs.ShopCode.GDRingBackObjects1.length = 0;
gdjs.ShopCode.GDRingBackObjects2.length = 0;
gdjs.ShopCode.GDSpeechBubbleObjects1.length = 0;
gdjs.ShopCode.GDSpeechBubbleObjects2.length = 0;
gdjs.ShopCode.GDGlowObjects1.length = 0;
gdjs.ShopCode.GDGlowObjects2.length = 0;
gdjs.ShopCode.GDPanelWoodObjects1.length = 0;
gdjs.ShopCode.GDPanelWoodObjects2.length = 0;
gdjs.ShopCode.GDPanelParchmentObjects1.length = 0;
gdjs.ShopCode.GDPanelParchmentObjects2.length = 0;
gdjs.ShopCode.GDPanelDarkObjects1.length = 0;
gdjs.ShopCode.GDPanelDarkObjects2.length = 0;
gdjs.ShopCode.GDBtnGreenObjects1.length = 0;
gdjs.ShopCode.GDBtnGreenObjects2.length = 0;
gdjs.ShopCode.GDBtnGoldObjects1.length = 0;
gdjs.ShopCode.GDBtnGoldObjects2.length = 0;
gdjs.ShopCode.GDBtnRedObjects1.length = 0;
gdjs.ShopCode.GDBtnRedObjects2.length = 0;
gdjs.ShopCode.GDBtnGrayObjects1.length = 0;
gdjs.ShopCode.GDBtnGrayObjects2.length = 0;
gdjs.ShopCode.GDBtnBlueObjects1.length = 0;
gdjs.ShopCode.GDBtnBlueObjects2.length = 0;
gdjs.ShopCode.GDBtnPurpleObjects1.length = 0;
gdjs.ShopCode.GDBtnPurpleObjects2.length = 0;
gdjs.ShopCode.GDBarBackObjects1.length = 0;
gdjs.ShopCode.GDBarBackObjects2.length = 0;
gdjs.ShopCode.GDBarFillObjects1.length = 0;
gdjs.ShopCode.GDBarFillObjects2.length = 0;
gdjs.ShopCode.GDUiTextObjects1.length = 0;
gdjs.ShopCode.GDUiTextObjects2.length = 0;

gdjs.ShopCode.eventsList1(runtimeScene);
gdjs.ShopCode.GDExteriorObjects1.length = 0;
gdjs.ShopCode.GDExteriorObjects2.length = 0;
gdjs.ShopCode.GDRoomObjects1.length = 0;
gdjs.ShopCode.GDRoomObjects2.length = 0;
gdjs.ShopCode.GDCounterObjects1.length = 0;
gdjs.ShopCode.GDCounterObjects2.length = 0;
gdjs.ShopCode.GDIngredientShelfObjects1.length = 0;
gdjs.ShopCode.GDIngredientShelfObjects2.length = 0;
gdjs.ShopCode.GDPotionRackObjects1.length = 0;
gdjs.ShopCode.GDPotionRackObjects2.length = 0;
gdjs.ShopCode.GDBookshelfObjects1.length = 0;
gdjs.ShopCode.GDBookshelfObjects2.length = 0;
gdjs.ShopCode.GDBarrelObjects1.length = 0;
gdjs.ShopCode.GDBarrelObjects2.length = 0;
gdjs.ShopCode.GDCratesObjects1.length = 0;
gdjs.ShopCode.GDCratesObjects2.length = 0;
gdjs.ShopCode.GDPlantObjects1.length = 0;
gdjs.ShopCode.GDPlantObjects2.length = 0;
gdjs.ShopCode.GDCandelabraObjects1.length = 0;
gdjs.ShopCode.GDCandelabraObjects2.length = 0;
gdjs.ShopCode.GDTableSetObjects1.length = 0;
gdjs.ShopCode.GDTableSetObjects2.length = 0;
gdjs.ShopCode.GDCauldronObjects1.length = 0;
gdjs.ShopCode.GDCauldronObjects2.length = 0;
gdjs.ShopCode.GDSlotSignObjects1.length = 0;
gdjs.ShopCode.GDSlotSignObjects2.length = 0;
gdjs.ShopCode.GDOwnerObjects1.length = 0;
gdjs.ShopCode.GDOwnerObjects2.length = 0;
gdjs.ShopCode.GDCustKnightObjects1.length = 0;
gdjs.ShopCode.GDCustKnightObjects2.length = 0;
gdjs.ShopCode.GDCustElfObjects1.length = 0;
gdjs.ShopCode.GDCustElfObjects2.length = 0;
gdjs.ShopCode.GDCustFarmerObjects1.length = 0;
gdjs.ShopCode.GDCustFarmerObjects2.length = 0;
gdjs.ShopCode.GDCustDwarfObjects1.length = 0;
gdjs.ShopCode.GDCustDwarfObjects2.length = 0;
gdjs.ShopCode.GDCustLadyObjects1.length = 0;
gdjs.ShopCode.GDCustLadyObjects2.length = 0;
gdjs.ShopCode.GDCustMageObjects1.length = 0;
gdjs.ShopCode.GDCustMageObjects2.length = 0;
gdjs.ShopCode.GDCustRogueObjects1.length = 0;
gdjs.ShopCode.GDCustRogueObjects2.length = 0;
gdjs.ShopCode.GDLiquidObjects1.length = 0;
gdjs.ShopCode.GDLiquidObjects2.length = 0;
gdjs.ShopCode.GDBubbleObjects1.length = 0;
gdjs.ShopCode.GDBubbleObjects2.length = 0;
gdjs.ShopCode.GDNavBlockObjects1.length = 0;
gdjs.ShopCode.GDNavBlockObjects2.length = 0;
gdjs.ShopCode.GDWaypointObjects1.length = 0;
gdjs.ShopCode.GDWaypointObjects2.length = 0;
gdjs.ShopCode.GDIconObjects1.length = 0;
gdjs.ShopCode.GDIconObjects2.length = 0;
gdjs.ShopCode.GDRingFillObjects1.length = 0;
gdjs.ShopCode.GDRingFillObjects2.length = 0;
gdjs.ShopCode.GDRingBackObjects1.length = 0;
gdjs.ShopCode.GDRingBackObjects2.length = 0;
gdjs.ShopCode.GDSpeechBubbleObjects1.length = 0;
gdjs.ShopCode.GDSpeechBubbleObjects2.length = 0;
gdjs.ShopCode.GDGlowObjects1.length = 0;
gdjs.ShopCode.GDGlowObjects2.length = 0;
gdjs.ShopCode.GDPanelWoodObjects1.length = 0;
gdjs.ShopCode.GDPanelWoodObjects2.length = 0;
gdjs.ShopCode.GDPanelParchmentObjects1.length = 0;
gdjs.ShopCode.GDPanelParchmentObjects2.length = 0;
gdjs.ShopCode.GDPanelDarkObjects1.length = 0;
gdjs.ShopCode.GDPanelDarkObjects2.length = 0;
gdjs.ShopCode.GDBtnGreenObjects1.length = 0;
gdjs.ShopCode.GDBtnGreenObjects2.length = 0;
gdjs.ShopCode.GDBtnGoldObjects1.length = 0;
gdjs.ShopCode.GDBtnGoldObjects2.length = 0;
gdjs.ShopCode.GDBtnRedObjects1.length = 0;
gdjs.ShopCode.GDBtnRedObjects2.length = 0;
gdjs.ShopCode.GDBtnGrayObjects1.length = 0;
gdjs.ShopCode.GDBtnGrayObjects2.length = 0;
gdjs.ShopCode.GDBtnBlueObjects1.length = 0;
gdjs.ShopCode.GDBtnBlueObjects2.length = 0;
gdjs.ShopCode.GDBtnPurpleObjects1.length = 0;
gdjs.ShopCode.GDBtnPurpleObjects2.length = 0;
gdjs.ShopCode.GDBarBackObjects1.length = 0;
gdjs.ShopCode.GDBarBackObjects2.length = 0;
gdjs.ShopCode.GDBarFillObjects1.length = 0;
gdjs.ShopCode.GDBarFillObjects2.length = 0;
gdjs.ShopCode.GDUiTextObjects1.length = 0;
gdjs.ShopCode.GDUiTextObjects2.length = 0;


return;

}

gdjs['ShopCode'] = gdjs.ShopCode;
