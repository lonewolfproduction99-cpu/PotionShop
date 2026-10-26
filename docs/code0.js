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
gdjs.ShopCode.GDTableGroup2Objects1= [];
gdjs.ShopCode.GDTableGroup2Objects2= [];
gdjs.ShopCode.GDTableGroup3Objects1= [];
gdjs.ShopCode.GDTableGroup3Objects2= [];
gdjs.ShopCode.GDTableGroup4Objects1= [];
gdjs.ShopCode.GDTableGroup4Objects2= [];
gdjs.ShopCode.GDTableGroup5Objects1= [];
gdjs.ShopCode.GDTableGroup5Objects2= [];
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
gdjs.ShopCode.GDApprenticePipObjects1= [];
gdjs.ShopCode.GDApprenticePipObjects2= [];
gdjs.ShopCode.GDApprenticeMapleObjects1= [];
gdjs.ShopCode.GDApprenticeMapleObjects2= [];
gdjs.ShopCode.GDApprenticeBrambleObjects1= [];
gdjs.ShopCode.GDApprenticeBrambleObjects2= [];
gdjs.ShopCode.GDLiquidObjects1= [];
gdjs.ShopCode.GDLiquidObjects2= [];
gdjs.ShopCode.GDHeldBottleObjects1= [];
gdjs.ShopCode.GDHeldBottleObjects2= [];
gdjs.ShopCode.GDSpillObjects1= [];
gdjs.ShopCode.GDSpillObjects2= [];
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


gdjs.ShopCode.userFunc0xa02878 = function GDJSInlineCode(runtimeScene) {
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
    bonus: r.Bonus ? String(r.Bonus) : null, // extra herb that makes it Fine quality
    prestige: Number(r.Prestige) || 0, // prestige needed before customers ask for it
  }));
  const ingredients = (read('Ingredients') || []).map((i) => ({
    id: String(i.Id),
    name: String(i.Name),
    cost: Number(i.Cost) || 2,
    bundle: Number(i.Bundle) || 5,
    icon: String(i.Icon || 'ing_redleaf'),
    unlockLevel: Number(i.UnlockLevel) || 1,
    rare: !!i.Rare,
    prestige: Number(i.Prestige) || 0,
    growTime: Number(i.GrowTime) || 30, // seconds in the herb garden
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
    persistent: !!u.Persistent, // kept when the shop is prestiged
  }));
  // Potion Mastery: one permanent price upgrade per potion (kept after prestige).
  for (const r of recipes) {
    upgrades.push({
      id: 'mastery_' + r.id,
      name: r.name.replace(' Potion', '') + ' Mastery',
      desc: '+15% price for ' + r.name + '. Kept after prestige.',
      icon: r.icon,
      tab: 'mastery',
      baseCost: r.price * 25,
      costGrowth: 1.9,
      maxLevel: 10,
      effect: 0.15,
      minShopLevel: r.unlockLevel,
      persistent: true,
      prestige: r.prestige,
    });
  }
  const workerTypes = (read('WorkerTypes') || []).map((w) => ({
    id: String(w.Id),
    object: String(w.Object),
    name: String(w.Name),
    hireCost: Number(w.HireCost) || 150,
    minShopLevel: Number(w.MinShopLevel) || 1,
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
    apprenticeSlowness: Number(b.ApprenticeSlowness) || 1.15, // apprentices start a bit slower than the owner
    workerUpgradeBase: Number(b.WorkerUpgradeBase) || 50,
    workerUpgradeGrowth: Number(b.WorkerUpgradeGrowth) || 1.65,
    accidentWrongExtra: Number(b.AccidentWrongExtra) || 0.55, // chance a wrong extra herb explodes
    accidentSludge: Number(b.AccidentSludge) || 0.4,
    cleanTime: Number(b.CleanTime) || 3,
    gardenRegrow: Number(b.GardenRegrow) || 45, // seconds for a garden plot to regrow
    gardenRareChance: Number(b.GardenRareChance) || 0.08,
    gardenLevel: Number(b.GardenLevel) || 2,
    prestigeCostMult: Number(b.PrestigeCostMult) || 5, // shop upgrade costs x5 per prestige
    prestigePriceMult: Number(b.PrestigePriceMult) || 3, // potion prices x3 per prestige
    prestigeHerbMult: Number(b.PrestigeHerbMult) || 2,
    prestigeGems: Number(b.PrestigeGems) || 20, // gems for prestige N: N x this
    levelGems: Number(b.LevelGems) || 3,
    giftChance: Number(b.GiftChance) || 0.3, // special herb from a delighted customer
    closeAt: Number(b.CloseAt) || 8, // satisfaction % that closes the shop
    reopenGems: Number(b.ReopenGems) || 15,
    adDailyLimit: Number(b.AdDailyLimit) || 10,
    harvestRareChance: Number(b.HarvestRareChance) || 0.12,
  };

  PS.data = {
    recipes,
    recipeById: Object.fromEntries(recipes.map((r) => [r.id, r])),
    ingredients,
    ingredientById: Object.fromEntries(ingredients.map((i) => [i.id, i])),
    customers,
    upgrades,
    upgradeById: Object.fromEntries(upgrades.map((u) => [u.id, u])),
    workerTypes,
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
gdjs.ShopCode.userFunc0xa02968 = function GDJSInlineCode(runtimeScene) {
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
  // 950, 12.3k, 4.5M, 1.2B, 3.4T (prices grow very large after prestiges).
  formatGold: (n) => {
    if (n < 10000) return String(Math.floor(n));
    const units = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']];
    for (const [v, u] of units) if (n >= v) return (n / v).toFixed(n / v >= 100 ? 0 : 1) + u;
    return String(Math.floor(n));
  },
  formatTime: (s) => (s >= 60 ? Math.floor(s / 60) + 'm ' + Math.floor(s % 60) + 's' : Math.ceil(s) + 's'),
};

// Layout constants (world units) matching the generated 3D models.
PS.K = {
  seatOffsetY: -48.6, // chair seat relative to its table
  tableStandSouth: 56, // workers stand on the south side of a table, facing the customer
  chairSpacing: 40, // between chairs of a long table
  cauldronStandY: 78, // where a worker stands in front of a cauldron
  liquidZ: 56, // liquid surface height inside a cauldron
  liquidRise: 9,
  potTop: 73,
  handZ: 33, // height of a carried potion
  counterStandX: 40, // behind the counter
  counterStandY: -50,
  sitZ: -1.4, // character height offset when sitting on a chair
  headSeated: 90, // overlay heights above characters
  headStanding: 104,
  ringCauldron: 136,
  ringWorker: 124,
  carryZ: 114,
};

// Tint the unlit parts of a 3D model (liquids) without affecting other
// instances of the same model.
PS.tint = function (obj, rgb) {
  const [r, g, b] = rgb.split(';').map((v) => Number(v) / 255);
  obj.get3DRendererObject().traverse((node) => {
    if (!node.isMesh) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m, i) => {
      if (m.name !== 'unlit') return;
      if (!m.userData.psOwn) {
        m = m.clone();
        m.userData.psOwn = true;
        if (Array.isArray(node.material)) node.material[i] = m;
        else node.material = m;
      }
      m.color.setRGB(r, g, b);
    });
  });
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
gdjs.ShopCode.userFunc0xa02a30 = function GDJSInlineCode(runtimeScene) {
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
      if (o.isHidden()) continue; // e.g. decorations moved aside for long tables
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
  PS.setAnim(ch, ch.path.length ? (ch.carrying ? 'Carry' : 'Walk') : ch.idleAnim || 'Idle');
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
gdjs.ShopCode.userFunc0xa02af8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// ===== Potion Shop: save system =====
// Progress is stored with GDevelop's storage (localStorage on the web, also
// available in mobile exports) under the "PotionShop" storage name.
// Loading validates every field and falls back to defaults on bad data.
//
// The save has two parts:
//   meta: kept forever (shop level, XP, lifetime stats, prestige, gems),
//   run:  progress of the current shop, reset when the shop is prestiged
//         (gold, herbs, upgrades, stored potions, hired workers).
// In memory the game uses one flat object; the split happens when saving.
const PS = gdjs.PotionShop;

PS.Save = {
  STORAGE: 'PotionShop',
  KEY: 'save',
  VERSION: 2,
  META_KEYS: ['level', 'xp', 'served', 'lost', 'earned', 'satisfaction', 'prestige', 'gems', 'seenRecipes',
    'discovered', 'accidents', 'tutorialDone', 'lastSeen', 'incomeRate', 'ads'],
  RUN_KEYS: ['gold', 'inventory', 'upgrades', 'stock', 'workers', 'garden', 'closed'],

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
      prestige: 0,
      gems: 0,
      workers: [], // hired apprentices: { type, role, stats: { speed, brew, service } }
      discovered: [], // recipes whose bonus herb was found
      accidents: 0,
      garden: [], // herb garden plots: { herb, readyAt (ms timestamp) }
      tutorialDone: false,
      closed: false, // the shop closed after satisfaction hit rock bottom
      ads: { day: '', count: 0 }, // rewarded ads watched today (daily limit)
      lastSeen: 0, // time of the last save (ms), for offline earnings
      incomeRate: 0, // recent gold earned per minute
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
    s.level = Math.floor(num(raw.level, 1, 1, 999));
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
    s.prestige = Math.floor(num(raw.prestige, 0, 0, 999));
    if (Array.isArray(raw.discovered)) s.discovered = raw.discovered.filter((id) => PS.data.recipeById[id]);
    s.accidents = Math.floor(num(raw.accidents, 0, 0, 1e9));
    s.tutorialDone = raw.tutorialDone === true;
    s.closed = raw.closed === true;
    if (raw.ads && typeof raw.ads === 'object') {
      s.ads = { day: String(raw.ads.day || ''), count: Math.floor(num(raw.ads.count, 0, 0, 999)) };
    }
    s.lastSeen = num(raw.lastSeen, 0, 0, 1e15);
    s.incomeRate = num(raw.incomeRate, 0, 0, 1e12);
    if (Array.isArray(raw.garden)) {
      s.garden = raw.garden.slice(0, 16).map((p) => ({
        herb: p && PS.data.ingredientById[p.herb] ? p.herb : null,
        readyAt: num(p && p.readyAt, 0, 0, 1e15),
        planted: !!(p && p.planted),
      }));
    }
    s.gems = Math.floor(num(raw.gems, 0, 0, 1e9));
    if (Array.isArray(raw.workers)) {
      const types = PS.data.workerTypes;
      raw.workers.slice(0, types.length).forEach((w, i) => {
        if (!w || typeof w !== 'object') return;
        const st = w.stats || {};
        s.workers.push({
          type: types[i].id,
          role: ['all', 'service', 'brew'].includes(w.role) ? w.role : 'all',
          stats: {
            speed: Math.floor(num(st.speed, 0, 0, 5)),
            brew: Math.floor(num(st.brew, 0, 0, 5)),
            service: Math.floor(num(st.service, 0, 0, 5)),
          },
        });
      });
    }
    return s;
  },

  // Stored format: { v: 2, meta: {...}, run: {...} }. Version 1 saves were flat.
  pack(state) {
    const meta = {};
    const run = {};
    for (const k of this.META_KEYS) meta[k] = state[k];
    for (const k of this.RUN_KEYS) run[k] = state[k];
    return { v: this.VERSION, meta, run };
  },
  unpack(raw) {
    if (raw && raw.v === 2 && raw.meta && raw.run) return Object.assign({}, raw.run, raw.meta);
    return raw; // version 1: already flat
  },

  // New shop after a prestige: meta progress and persistent upgrades are kept,
  // everything else starts over.
  prestigeReset(state) {
    const fresh = this.defaults();
    for (const k of this.META_KEYS) fresh[k] = JSON.parse(JSON.stringify(state[k]));
    for (const u of PS.data.upgrades) if (u.persistent) fresh.upgrades[u.id] = state.upgrades[u.id] || 0;
    fresh.prestige = (state.prestige || 0) + 1;
    return fresh;
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
    return this.validate(this.unpack(raw));
  },

  save(state) {
    try {
      gdjs.evtTools.storage.writeStringInJSONFile(this.STORAGE, this.KEY, JSON.stringify(this.pack(state)));
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
gdjs.ShopCode.userFunc0xa02c18 = function GDJSInlineCode(runtimeScene) {
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

  // One potion of an order handed over; the customer pays when all arrived.
  deliverItem(G, c, recipe, quality) {
    const item = PS.Order.deliver(c, recipe.id, quality);
    if (!item) return false;
    if (PS.Order.remaining(c) > 0) {
      PS.UI.floatText(G, c.obj.getX(), c.obj.getY(), 95, PS.Order.remaining(c) + ' more to go', recipe.icon);
      PS.Audio.play(G, 'pop');
      PS.UI.markDirty(G);
      return true;
    }
    this.serve(G, c);
    return true;
  },

  // Every potion delivered: pay for all of them and leave happy.
  serve(G, c) {
    const ratio = U.clamp(c.patience / c.maxPatience, 0, 1);
    const tip = 1 + PS.data.balance.tipMax * ratio;
    let price = 0;
    let mood = 0;
    let best = 1;
    for (const it of c.items) {
      const q = PS.QUALITY[it.quality];
      price += G.potionPrice(it.recipe) * q.price;
      mood += q.mood;
      best = Math.max(best, it.quality);
    }
    price = Math.round(price * tip * c.type.tip);
    mood /= c.items.length;
    G.addGold(price);
    G.state.served += 1;
    G.state.earned += price;
    G.addXp((PS.data.balance.xpPerServe + Math.round(5 * ratio)) * c.items.length);
    G.recordSatisfaction(U.clamp(50 + 50 * ratio + mood, 0, 100));
    const label = '+' + U.formatGold(price) + (best >= 2 ? '  ' + PS.QUALITY[best].name + '!' : '');
    PS.UI.floatText(G, c.obj.getX(), c.obj.getY(), 95, label, 'icon_coin');
    // Delighted customers (served before patience dropped below 90%) may leave a special herb.
    if (ratio >= 0.9 && Math.random() < PS.data.balance.giftChance) this.gift(G, c);
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

};
gdjs.ShopCode.userFunc0xa02cf0 = function GDJSInlineCode(runtimeScene) {
"use strict";
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

};
gdjs.ShopCode.userFunc0xa02dc8 = function GDJSInlineCode(runtimeScene) {
"use strict";
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
    return PS.data.recipes.filter((r) => r.unlockLevel <= G.state.level && r.prestige <= G.prestige());
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

};
gdjs.ShopCode.userFunc0xa02ea0 = function GDJSInlineCode(runtimeScene) {
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
    hud.prestige = this.text(G, '', 236, 52, 60, 20, COLORS.gold, 'center', L, 'UI', 12, '40;24;16');
    hud.xp = this.bar(G, L, 292, 58, 82, 12, 0, '120;200;255', 'UI', 11);
    // Satisfaction: next to the level, or on the second row on narrow phones.
    if (W >= 700) {
      this.panelBox(G, 'PanelDark', 392, 14, 136, 66, L, 10);
      hud.mood = this.icon(G, 'mood_happy', 424, 47, 46, L, 'UI', 11);
      hud.sat = this.text(G, '80%', 450, 26, 74, 30, '255;255;255', 'left', L, 'UI', 11, '40;24;16');
    } else {
      this.panelBox(G, 'PanelDark', 394, 88, 120, 44, L, 10);
      hud.mood = this.icon(G, 'mood_happy', 418, 110, 32, L, 'UI', 11);
      hud.sat = this.text(G, '80%', 438, 96, 72, 26, '255;255;255', 'left', L, 'UI', 11, '40;24;16');
      this.hit(hud.hits, 394, 88, 120, 44, () => this.toggle(G, 'stats'));
    }
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
    this.panelBox(G, 'PanelDark', 12, 88, 130, 44, L, 10);
    this.icon(G, 'icon_quality', 36, 110, 30, L, 'UI', 11);
    hud.gems = this.text(G, '0', 56, 96, 80, 26, '170;230;255', 'left', L, 'UI', 11, '40;24;16');
    hud.taskBack = this.panelBox(G, 'PanelDark', 150, 88, 236, 44, L, 10);
    hud.taskText = this.text(G, '', 160, 96, 220, 24, '255;255;255', 'left', L, 'UI', 11);
    // Shown while the shop is closed (satisfaction hit rock bottom).
    hud.closed = this.panelBox(G, 'BtnRed', W / 2 - 230, 144, 460, 58, L, 30);
    hud.closedText = this.text(G, 'SHOP CLOSED · tap to reopen', W / 2 - 230, 157, 460, 28, '255;255;255', 'center', L, 'UI', 31,
      '90;20;20');
    this.hit(hud.hits, W / 2 - 230, 144, 460, 58, () => G.state.closed && this.open(G, 'closed'), 'closed');
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
    hud.prestige.setText(s.prestige ? 'P' + s.prestige : '');
    hud.gems.setText(U.formatGold(s.gems));
    hud.closed.hide(!s.closed);
    hud.closedText.hide(!s.closed);
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
      case 'offline':
        return this.buildOffline(G, P);
      case 'prestige':
        return this.buildPrestige(G, P);
      case 'closed':
        return this.buildClosed(G, P);
      case 'ad':
        return this.buildAd(G, P);
      case 'plant':
        return PS.GardenUI.buildPlant(G, P);
      case 'speedup':
        return PS.GardenUI.buildSpeedup(G, P);
    }
  },

  // ----- Brew panel: two ingredients (or a recipe) plus an optional extra herb.
  buildBrew(G, P) {
    const c = P.params.cauldron;
    const given = P.params.slots || [];
    const slots = (P.params.slots = [given[0] || null, given[1] || null, given[2] || null]);
    const area = this.frame(G, P, 'Brew a potion', 1040);
    const inv = G.state.inventory;
    const used = {};
    slots.forEach((id) => id && (used[id] = (used[id] || 0) + 1));
    let y = area.y;
    const cx = area.x + area.w / 2;
    const sz = 96;
    const gap = 40;
    const x0 = cx - (4 * sz + 3 * gap) / 2;
    const xs = [x0, x0 + sz + gap, x0 + 2 * (sz + gap), x0 + 3 * (sz + gap)];
    for (let i = 0; i < 3; i++) {
      const extraSlot = i === 2;
      this.panelBox(G, extraSlot ? 'PanelDark' : 'PanelParchment', xs[i], y, sz, sz, P.items, 16);
      if (slots[i]) {
        this.icon(G, PS.data.ingredientById[slots[i]].icon, xs[i] + sz / 2, y + sz / 2, 70, P.items, 'UI', 17);
        this.hit(P.hits, xs[i], y, sz, sz, () => {
          slots[i] = null;
          this.rebuild(G);
        }, 'slot:' + i);
      } else {
        this.text(G, extraSlot ? 'extra\n(optional)' : '+', xs[i], y + (extraSlot ? 26 : 16), sz, extraSlot ? 20 : 56,
          extraSlot ? '230;220;200' : COLORS.muted, 'center', P.items, 'UI', 17);
      }
    }
    this.text(G, '+', xs[0] + sz, y + 24, gap, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    this.text(G, '+', xs[1] + sz, y + 24, gap, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    this.text(G, '=', xs[2] + sz, y + 24, gap, 44, COLORS.ink, 'center', P.items, 'UI', 17);
    this.panelBox(G, 'PanelParchment', xs[3], y, sz, sz, P.items, 16);
    const line = y + sz + 8;
    const ready = slots[0] && slots[1];
    if (ready) {
      const result = PS.findRecipe([slots[0], slots[1]]);
      const known = result && result.unlockLevel <= G.state.level && result.prestige <= G.prestige();
      this.icon(G, result && known ? result.icon : 'potion_sludge', xs[3] + sz / 2, y + sz / 2, 74, P.items, 'UI', 17);
      let label;
      let color = COLORS.ink;
      if (!result || !known) {
        label = 'Unknown mix: Murky Sludge (worthless, may explode)';
        color = COLORS.red;
      } else {
        const extra = slots[2];
        let q = 'Standard';
        if (extra === 'starbloom') q = 'Superb';
        else if (extra === 'glowcap') q = 'Fine, fast and safe';
        else if (extra && G.state.discovered.includes(result.id) && extra === result.bonus) q = 'Fine';
        else if (extra) {
          q = 'unknown extra herb (could go wrong!)';
          color = '170;90;30';
        }
        label = result.name + '  ·  ' + q;
      }
      this.text(G, label, area.x, line, area.w, 24, color, 'center', P.items, 'UI', 17);
    } else {
      this.text(G, '?', xs[3], y + 16, sz, 56, COLORS.muted, 'center', P.items, 'UI', 17);
      this.text(G, 'Pick 2 ingredients, or tap a recipe below', area.x, line, area.w, 24, COLORS.muted, 'center',
        P.items, 'UI', 17);
    }
    y += sz + 44;
    this.button(G, P, cx - 150, y, 300, 76, 'BtnGreen', 'BREW', {
      size: 38,
      icon: 'icon_brew',
      disabled: !ready,
      onTap: () => {
        if (PS.Brewing.request(G, c, slots.filter((x) => x))) this.close(G);
      },
      onDisabled: () => this.toast(G, 'Add two ingredients first'),
    });
    y += 90;
    // Ingredients: unlocked herbs plus any rare herb in stock.
    this.text(G, 'Ingredients  (a 3rd herb is optional)', area.x, y, area.w, 26, COLORS.ink, 'left', P.items, 'UI', 16);
    y += 34;
    const ings = PS.data.ingredients.filter(
      (i) => (i.unlockLevel <= G.state.level && i.prestige <= G.prestige()) || (inv[i.id] || 0) > 0
    );
    const cols = ings.length > 8 ? 5 : 4;
    const cw = area.w / cols;
    const ch = 100;
    ings.forEach((ing, k) => {
      const x = area.x + (k % cols) * cw;
      const yy = y + Math.floor(k / cols) * ch;
      const left = (inv[ing.id] || 0) - (used[ing.id] || 0);
      this.panelBox(G, left > 0 ? 'PanelParchment' : 'BtnGray', x + 4, yy, cw - 8, ch - 8, P.items, 16);
      this.icon(G, ing.icon, x + cw / 2, yy + 34, 54, P.items, 'UI', 17);
      this.text(G, ing.name, x, yy + 62, cw, 19, ing.rare ? '150;90;10' : COLORS.ink, 'center', P.items, 'UI', 17);
      this.text(G, 'x' + left, x + cw - 50, yy + 4, 44, 20, left <= 2 ? COLORS.red : COLORS.green, 'right', P.items, 'UI', 17);
      this.hit(P.hits, x + 4, yy, cw - 8, ch - 8, () => {
        if (left <= 0) {
          this.toast(G, 'Out of ' + ing.name + ' — buy more in Herbs');
          return;
        }
        const free = slots.indexOf(null);
        slots[free >= 0 ? free : 2] = ing.id;
        PS.Audio.play(G, 'tap');
        this.rebuild(G);
      }, 'ing:' + ing.id);
    });
    y += Math.ceil(ings.length / cols) * ch + 4;
    // Recipe book (rows with waiting orders first)
    this.text(G, 'Recipe book — tap to fill', area.x, y, area.w, 24, COLORS.ink, 'left', P.items, 'UI', 16);
    y += 30;
    const wanted = PS.World.wantedItems(G);
    const recipes = PS.Brewing.knownRecipes(G)
      .map((r) => ({ r, n: wanted.filter((w) => w.recipe.id === r.id).length }))
      .sort((a, b) => b.n - a.n);
    const rh = 60;
    const room = Math.max(1, Math.floor((area.y + area.h - y) / rh));
    recipes.slice(0, room).forEach(({ r, n }, k) => {
      const yy = y + k * rh;
      const ok = PS.Brewing.canBrew(G, r);
      this.panelBox(G, 'PanelParchment', area.x, yy, area.w, rh - 6, P.items, 16);
      this.icon(G, r.icon, area.x + 30, yy + 27, 44, P.items, 'UI', 17);
      this.text(G, r.name, area.x + 58, yy + 13, 240, 24, COLORS.ink, 'left', P.items, 'UI', 17);
      r.ingredients.forEach((id, j) => {
        const ing = PS.data.ingredientById[id];
        this.icon(G, ing.icon, area.x + 300 + j * 46, yy + 27, 36, P.items, 'UI', 17);
        if ((inv[id] || 0) <= 0) this.icon(G, 'icon_close', area.x + 314 + j * 46, yy + 40, 16, P.items, 'UI', 18);
      });
      // Bonus herb once discovered, otherwise a hint that one exists.
      const found = G.state.discovered.includes(r.id);
      this.text(G, '+', area.x + 384, yy + 12, 20, 26, COLORS.muted, 'center', P.items, 'UI', 17);
      if (found) this.icon(G, PS.data.ingredientById[r.bonus].icon, area.x + 420, yy + 27, 34, P.items, 'UI', 17);
      else this.text(G, '?', area.x + 404, yy + 12, 32, 26, COLORS.muted, 'center', P.items, 'UI', 17);
      if (n > 0) {
        this.panelBox(G, 'BtnRed', area.x + area.w - 110, yy + 9, 100, 36, P.items, 17);
        this.text(G, n + ' wanted', area.x + area.w - 110, yy + 15, 100, 20, '255;255;255', 'center', P.items, 'UI', 18);
      }
      this.hit(P.hits, area.x, yy, area.w, rh - 6, () => {
        if (!ok) this.toast(G, 'Missing ingredients for ' + r.name);
        P.params.slots = PS.Brewing.bestIngredients(G, r);
        this.rebuild(G);
      }, 'recipe:' + r.id);
    });
  },

  // ----- Orders panel: one row per customer, one icon per potion ordered.
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
      this.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
      // Potions of the order (checked when delivered)
      c.items.forEach((it, j) => {
        const ix = x + 40 + j * 58;
        const ic = this.icon(G, it.recipe.icon, ix, y + 40, 52, P.items, 'UI', 17);
        if (it.done) {
          ic.setOpacity(110);
          this.icon(G, 'icon_check', ix + 16, y + 56, 24, P.items, 'UI', 18);
        }
      });
      const left = c.items.filter((i) => !i.done);
      const first = left[0] ? left[0].recipe : c.items[0].recipe;
      const title = c.items.length > 1 ? c.items.length + ' potions' : first.name;
      this.text(G, title, x + 40 + Math.min(c.items.length, 5) * 58, y + 22, 220, 26, COLORS.ink, 'left', P.items, 'UI', 17);
      const ratio = c.patience / c.maxPatience;
      this.icon(G, this.moodIcon(ratio), x + 26, y + 88, 30, P.items, 'UI', 17);
      this.bar(G, P.items, x + 46, y + 79, 120, 18, ratio, this.patienceColor(ratio), 'UI', 17);
      let status = 'Tap customer to take order';
      let col = COLORS.muted;
      if (c.state === 'ordered') {
        const done = c.items.length - left.length;
        const coming = left.filter((i) => i.reserved).length;
        if (c.items.length > 1) status = done + '/' + c.items.length + ' delivered';
        else status = coming ? 'On the way!' : 'Waiting for potion';
        if (coming) status += c.items.length > 1 ? ' · ' + coming + ' on the way' : '';
        col = coming ? COLORS.green : COLORS.red;
      }
      this.text(G, status, x + 176, y + 78, 260, 20, col, 'left', P.items, 'UI', 17);
      const tip = c.type.tip * (1 + PS.data.balance.tipMax * ratio);
      const pay = Math.round(c.items.reduce((a, it) => a + G.potionPrice(it.recipe), 0) * tip);
      this.icon(G, 'icon_coin', x + w - 196, y + 26, 30, P.items, 'UI', 17);
      this.text(G, U.formatGold(pay) + 'g', x + w - 178, y + 12, 90, 26, '170;120;20', 'left', P.items, 'UI', 17);
      if (c.state === 'waitingOrder') {
        this.button(G, P, x + w - 150, y + h - 62, 140, 54, 'BtnBlue', 'Take', {
          size: 26,
          onTap: () => {
            PS.Workers.enqueue(G, { type: 'takeOrder', target: c });
            this.rebuild(G);
          },
        });
      } else {
        // Brew the first potion of this order that nobody is making yet.
        const want = PS.World.uncoveredItem(G, null);
        const mine = left.find((i) => !i.reserved && PS.Brewing.plannedFor(G, i.recipe.id) <
          PS.World.wantedItems(G).filter((x) => x.recipe.id === i.recipe.id).length);
        const r = mine ? mine.recipe : null;
        const idle = PS.Brewing.idleCauldron(G);
        const can = r && PS.Brewing.canBrew(G, r);
        void want;
        this.button(G, P, x + w - 150, y + h - 62, 140, 54, 'BtnGreen', 'Brew', {
          tag: 'brew:' + c.id,
          size: 26,
          disabled: !idle || !can,
          onTap: () => {
            if (PS.Brewing.request(G, idle, PS.Brewing.bestIngredients(G, r))) this.rebuild(G);
          },
          onDisabled: () => this.toast(G, !r ? 'Their potions are already being made' : !idle ? 'All cauldrons are busy' : 'Missing ingredients'),
        });
      }
    });
    this.list(G, P, area, 132, rows);
  },

  // ----- Ingredient shop
  buildIngredients(G, P) {
    const area = this.frame(G, P, 'Herb shop', 1000);
    const inv = G.state.inventory;
    // Entrance to the herb garden (optional free herbs).
    const gardenOpen = G.state.level >= PS.data.balance.gardenLevel;
    this.button(G, P, area.x, area.y - 6, area.w, 64, gardenOpen ? 'BtnGreen' : 'BtnGray',
      gardenOpen ? 'Visit the Herb Garden' : 'Herb Garden opens at shop level ' + PS.data.balance.gardenLevel, {
        tag: 'garden',
        icon: 'icon_garden',
        size: 26,
        disabled: !gardenOpen,
        onTap: () => G.goToGarden(),
        onDisabled: () => this.toast(G, 'Reach shop level ' + PS.data.balance.gardenLevel + ' to open the garden'),
      });
    area.y += 70;
    area.h -= 70;
    const shown = PS.data.ingredients.filter((i) => i.prestige <= G.prestige() + 1);
    const rows = shown.map((ing) => (x, y, w, h) => {
      const locked = ing.unlockLevel > G.state.level || ing.prestige > G.prestige();
      const n0 = inv[ing.id] || 0;
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, ing.icon, x + 46, y + h / 2, 70, P.items, 'UI', 17);
      this.text(G, ing.name, x + 92, y + 12, 240, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      if (locked) {
        this.icon(G, 'icon_lock', x + w - 60, y + h / 2, 44, P.items, 'UI', 17);
        const why = ing.prestige > G.prestige() ? 'Unlocks at prestige ' + ing.prestige
          : ing.rare ? 'Rare: from the Garden and happy customers. Sold from shop level ' + ing.unlockLevel
            : 'Unlocks at shop level ' + ing.unlockLevel;
        this.text(G, why, x + 92, y + 46, w - 170, 20, COLORS.muted, 'left', P.items, 'UI', 17);
        if (ing.rare && n0 > 0) {
          this.text(G, 'In stock: ' + n0, x + 92, y + 72, 200, 20, COLORS.green, 'left', P.items, 'UI', 17);
        }
        return;
      }
      const n = inv[ing.id] || 0;
      const cap = G.storageCap();
      const full = n + ing.bundle > cap;
      this.text(G, 'In stock: ' + n + ' / ' + cap + (n <= 2 ? '  LOW!' : ''), x + 92, y + 50, 260, 24,
        n <= 2 ? COLORS.red : COLORS.green,
        'left', P.items, 'UI', 17);
      const cost = G.herbCost(ing);
      this.button(G, P, x + w - 200, y + 14, 190, h - 28, 'BtnGold', '+' + ing.bundle + '  ' + U.formatGold(cost) + 'g', {
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

  // ----- Upgrades (shop upgrades or potion masteries) and expansion
  buildUpgrades(G, P, tab) {
    const title = tab === 'expand' ? 'Expand the shop' : 'Upgrades';
    const area = this.frame(G, P, title, 980);
    let kind = tab;
    if (tab === 'upgrades') {
      // Sub tabs: shop upgrades reset on prestige, masteries are kept.
      kind = P.params.sub || 'upgrades';
      const half = (area.w - 12) / 2;
      [['upgrades', 'Shop upgrades'], ['mastery', 'Potion Mastery']].forEach(([id, label], i) => {
        this.button(G, P, area.x + i * (half + 12), area.y - 8, half, 56, kind === id ? 'BtnGold' : 'BtnGray', label, {
          tag: 'sub:' + id,
          size: 24,
          onTap: () => {
            P.params.sub = id;
            G.ui.scroll = 0;
            this.rebuild(G);
          },
        });
      });
      area.y += 60;
      area.h -= 60;
    }
    const ups = PS.data.upgrades.filter((u) => u.tab === kind && (u.prestige || 0) <= G.prestige());
    const rows = ups.map((u) => (x, y, w, h) => {
      const lvl = G.state.upgrades[u.id] || 0;
      const maxed = lvl >= G.upgradeMax(u);
      const locked = G.state.level < u.minShopLevel;
      const cost = G.upgradeCost(u);
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, u.icon, x + 44, y + h / 2, 64, P.items, 'UI', 17);
      this.text(G, u.name, x + 88, y + 10, 300, 28, COLORS.ink, 'left', P.items, 'UI', 17);
      this.text(G, u.desc, x + 88, y + 44, w - 300, 20, COLORS.muted, 'left', P.items, 'UI', 17);
      this.text(G, G.upgradeStatus(u), x + 88, y + h - 32, 330, 22, '60;110;160', 'left', P.items, 'UI', 17);
      if (locked) {
        this.icon(G, 'icon_lock', x + w - 120, y + h / 2 - 10, 40, P.items, 'UI', 17);
        this.text(G, 'Shop Lv ' + u.minShopLevel, x + w - 200, y + h / 2 + 14, 170, 22, COLORS.muted, 'center', P.items,
          'UI', 17);
      } else if (maxed) {
        this.text(G, 'MAX', x + w - 190, y + h / 2 - 18, 170, 32, COLORS.green, 'center', P.items, 'UI', 17);
      } else {
        this.button(G, P, x + w - 200, y + h / 2 - 34, 190, 68, 'BtnGold', U.formatGold(cost) + 'g', {
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
    if (tab === 'expand') {
      // Prestige: start a bigger, harder shop once everything is maxed.
      rows.push((x, y, w, h) => {
        const pr = G.prestigeProgress();
        this.panelBox(G, pr.ready ? 'BtnPurple' : 'PanelDark', x, y, w, h, P.items, 16);
        this.icon(G, 'icon_crown', x + 44, y + h / 2, 64, P.items, 'UI', 17);
        this.text(G, 'Prestige ' + (G.prestige() + 1), x + 88, y + 10, 300, 28, COLORS.gold, 'left', P.items, 'UI', 17, '40;24;16');
        this.text(G, pr.ready ? 'Everything is maxed. Start a bigger shop!' : 'Max every upgrade and hire all apprentices: ' +
          pr.done + '/' + pr.total, x + 88, y + 46, w - 300, 22, '255;255;255', 'left', P.items, 'UI', 17);
        this.button(G, P, x + w - 200, y + h / 2 - 34, 190, 68, 'BtnGold', 'Details', {
          tag: 'prestige',
          size: 28,
          onTap: () => this.open(G, 'prestige'),
        });
      });
    }
    this.list(G, P, area, 132, rows);
  },

  // ----- Prestige: what changes, what is kept, and the confirm button.
  buildPrestige(G, P) {
    const area = this.frame(G, P, 'Prestige ' + (G.prestige() + 1), 1000);
    const next = G.prestige() + 1;
    const pr = G.prestigeProgress();
    const newRecipes = PS.data.recipes.filter((r) => r.prestige === next);
    const lines = [
      ['icon_tables', 'Tables seat ' + Math.min(5, 1 + next) + ' customers each'],
      ['icon_orders', 'Customers can order up to ' + Math.min(5, 1 + next) + ' potions'],
      ['icon_coin', 'Potions sell for ' + Math.pow(PS.data.balance.prestigePriceMult, next) + 'x the base price'],
      ['icon_upgrades', 'Upgrades cost ' + Math.pow(PS.data.balance.prestigeCostMult, next) + 'x more'],
      ['icon_patience', 'Customers are a little less patient'],
      ['icon_quality', '+' + PS.data.balance.prestigeGems * next + ' gems'],
    ];
    let y = area.y;
    if (newRecipes.length) {
      this.text(G, 'New potions:', area.x, y, 200, 26, COLORS.ink, 'left', P.items, 'UI', 17);
      newRecipes.forEach((r, i) => this.icon(G, r.icon, area.x + 190 + i * 60, y + 14, 50, P.items, 'UI', 17));
      y += 50;
    }
    lines.forEach(([ic, t]) => {
      this.icon(G, ic, area.x + 22, y + 16, 34, P.items, 'UI', 17);
      this.text(G, t, area.x + 50, y + 2, area.w - 50, 24, COLORS.ink, 'left', P.items, 'UI', 17);
      y += 42;
    });
    y += 6;
    this.text(G, 'Kept: shop level, gems, Potion Mastery, discovered recipes, stats.\n' +
      'Reset: gold, herbs, shop upgrades, tables, cauldrons, apprentices, garden.', area.x, y, area.w, 22, COLORS.muted,
      'left', P.items, 'UI', 17);
    y += 70;
    if (!pr.ready) {
      this.text(G, 'Still to do (' + pr.done + '/' + pr.total + '):', area.x, y, area.w, 24, COLORS.red, 'left', P.items, 'UI', 17);
      y += 32;
      pr.missing.slice(0, 6).forEach((m) => {
        this.text(G, '· ' + m, area.x + 10, y, area.w - 10, 22, COLORS.ink, 'left', P.items, 'UI', 17);
        y += 28;
      });
      return;
    }
    const confirm = P.params.confirm;
    this.button(G, P, area.x + area.w / 2 - 200, y + 10, 400, 84, confirm ? 'BtnRed' : 'BtnPurple',
      confirm ? 'Tap again to prestige' : 'Prestige now', {
        tag: 'doPrestige',
        icon: 'icon_crown',
        size: 32,
        onTap: () => {
          if (!confirm) {
            P.params.confirm = true;
            this.rebuild(G);
          } else G.doPrestige();
        },
      });
  },

  // ----- The shop closed: reopen with gold or gems.
  buildClosed(G, P) {
    const area = this.frame(G, P, 'Shop closed!', 620);
    this.icon(G, 'icon_closed', area.x + 56, area.y + 60, 96, P.items, 'UI', 17);
    this.text(G, 'Too many unhappy customers: nobody wants to visit right now. Reopen the shop to get customers back ' +
      '(satisfaction restarts at 55%).', area.x + 120, area.y, area.w - 120, 24, COLORS.ink, 'left', P.items, 'UI', 17);
    const gold = PS.World.reopenCost(G);
    const gems = PS.data.balance.reopenGems;
    this.button(G, P, area.x, area.y + 170, area.w, 80, 'BtnGold', 'Reopen for ' + U.formatGold(gold) + 'g', {
      tag: 'reopenGold',
      icon: 'icon_coin',
      size: 30,
      disabled: G.state.gold < gold,
      onTap: () => PS.World.reopen(G, false) && this.close(G),
      onDisabled: () => this.toast(G, 'Not enough gold'),
    });
    this.button(G, P, area.x, area.y + 266, area.w, 80, 'BtnBlue', 'Reopen for ' + gems + ' gems', {
      tag: 'reopenGems',
      icon: 'icon_quality',
      size: 30,
      disabled: G.state.gems < gems,
      onTap: () => PS.World.reopen(G, true) && this.close(G),
      onDisabled: () => this.toast(G, 'Not enough gems'),
    });
    this.button(G, P, area.x, area.y + 362, area.w, 80, 'BtnPurple', 'Watch an ad to reopen (' + PS.Ads.left(G) + ' left today)', {
      tag: 'reopenAd',
      icon: 'icon_ad',
      size: 24,
      disabled: PS.Ads.left(G) <= 0,
      onTap: () => PS.Ads.watch(G, 'Reopen the shop', () => {
        G.state.closed = false;
        G.state.satisfaction = 55;
        G.saveNow();
      }),
      onDisabled: () => this.toast(G, 'No more ads today'),
    });
  },

  // ----- Rewarded ad placeholder (real ads come with the mobile app build).
  buildAd(G, P) {
    const area = this.frame(G, P, 'Watch an ad', 700);
    const left = Math.max(0, (P.params.until - Date.now()) / 1000);
    this.panelBox(G, 'PanelDark', area.x, area.y, area.w, 300, P.items, 16);
    this.text(G, 'Advertisement', area.x, area.y + 40, area.w, 36, '255;255;255', 'center', P.items, 'UI', 17);
    this.text(G, 'In the app version a short video ad plays here.\nThis web build shows a placeholder.', area.x + 20,
      area.y + 110, area.w - 40, 24, '220;220;230', 'center', P.items, 'UI', 17);
    this.text(G, left > 0 ? Math.ceil(left) + '' : '', area.x, area.y + 200, area.w, 48, COLORS.gold, 'center', P.items, 'UI', 17);
    this.text(G, 'Reward: ' + P.params.reason, area.x, area.y + 320, area.w, 26, COLORS.ink, 'center', P.items, 'UI', 17);
    this.button(G, P, area.x + area.w / 2 - 170, area.y + 370, 340, 80, left > 0 ? 'BtnGray' : 'BtnGreen', 'Claim reward', {
      tag: 'claimAd',
      icon: 'icon_check',
      size: 30,
      disabled: left > 0,
      onTap: () => {
        PS.Ads.claim(G);
        const fn = P.params.onReward;
        this.close(G);
        fn();
        PS.Audio.play(G.shop || G, 'coin');
      },
      onDisabled: () => this.toast(G, 'Almost done...'),
    });
  },

  buildWorkers(G, P) {
    const area = this.frame(G, P, 'Workers', 1000);
    const ROLE = { all: 'All jobs', service: 'Orders & delivery', brew: 'Brewing only' };
    const rows = [];
    // The owner follows your taps.
    rows.push((x, y, w, h) => {
      this.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, 'icon_workers', x + 50, y + 60, 74, P.items, 'UI', 17);
      this.text(G, 'You, the shop owner', x + 100, y + 16, w - 120, 30, COLORS.ink, 'left', P.items, 'UI', 17);
      const o = G.owner;
      this.text(G, 'Follows your taps. Now: ' + (o.task ? PS.TASKS[o.task.type].label : 'idle') +
        '\nShop upgrades (Swift Shoes, Quick Hands) help every worker.', x + 100, y + 56, w - 120, 22, COLORS.muted,
        'left', P.items, 'UI', 17);
    });
    // Hired apprentices work on their own.
    G.state.workers.forEach((rec, i) => {
      const index = i + 1;
      const type = PS.data.workerTypes[i];
      const wk = G.workers.find((k) => k.index === index && !k.isOwner);
      rows.push((x, y, w, h) => {
        this.panelBox(G, 'PanelParchment', x, y, w, h, P.items, 16);
        this.icon(G, 'icon_workers', x + 46, y + 46, 64, P.items, 'UI', 17);
        this.text(G, type.name + ' (apprentice)', x + 90, y + 12, 300, 30, COLORS.ink, 'left', P.items, 'UI', 17);
        const now = wk && wk.task ? PS.TASKS[wk.task.type].label : 'Looking for work';
        this.text(G, 'Now: ' + now, x + 90, y + 48, 300, 22, COLORS.muted, 'left', P.items, 'UI', 17);
        this.button(G, P, x + w - 230, y + 12, 220, 56, 'BtnBlue', ROLE[rec.role], {
          tag: 'role:' + index,
          size: 22,
          onTap: () => {
            G.cycleWorkerRole(index);
            this.rebuild(G);
          },
        });
        const stats = [['speed', 'Speed', 'icon_speed'], ['brew', 'Brewing', 'icon_brew'], ['service', 'Service', 'icon_order']];
        const bw = (w - 30) / 3;
        stats.forEach(([id, label, ic], j) => {
          const lvl = rec.stats[id];
          const bx = x + 10 + j * (bw + 5);
          const by = y + 86;
          this.text(G, label + ' Lv ' + lvl + '/5', bx, by, bw, 22, '60;110;160', 'center', P.items, 'UI', 17);
          if (lvl >= 5) {
            this.text(G, 'MAX', bx, by + 36, bw, 30, COLORS.green, 'center', P.items, 'UI', 17);
            return;
          }
          const cost = G.workerUpgradeCost(index, id);
          this.button(G, P, bx, by + 28, bw, 60, 'BtnGold', U.formatGold(cost) + 'g', {
            tag: 'wup:' + index + ':' + id,
            icon: ic,
            iconSize: 32,
            size: 24,
            disabled: G.state.gold < cost,
            onTap: () => {
              G.upgradeWorker(index, id);
              this.rebuild(G);
            },
            onDisabled: () => this.toast(G, 'Not enough gold'),
          });
        });
      });
    });
    // Next hire
    const next = G.nextWorkerType();
    rows.push((x, y, w, h) => {
      if (!next) {
        this.text(G, 'All apprentices hired. More arrive in future shops.', x, y + 20, w, 24, COLORS.muted, 'center',
          P.items, 'UI', 17);
        return;
      }
      const locked = G.state.level < next.minShopLevel;
      this.panelBox(G, locked ? 'BtnGray' : 'PanelParchment', x, y, w, h, P.items, 16);
      this.icon(G, locked ? 'icon_lock' : 'icon_plus', x + 46, y + 60, 60, P.items, 'UI', 17);
      this.text(G, 'Hire ' + next.name, x + 90, y + 14, 300, 30, locked ? '255;255;255' : COLORS.ink, 'left', P.items, 'UI', 17);
      this.text(G, locked ? 'Unlocks at shop level ' + next.minShopLevel
        : 'Takes orders, brews and delivers on their own.', x + 90, y + 52, w - 330, 22,
        locked ? '235;235;235' : COLORS.muted, 'left', P.items, 'UI', 17);
      if (!locked) {
        this.button(G, P, x + w - 220, y + h / 2 - 36, 210, 72, 'BtnGreen', U.formatGold(G.hireCost(next)) + 'g', {
          tag: 'hire',
          icon: 'icon_coin',
          iconSize: 36,
          size: 30,
          disabled: G.state.gold < G.hireCost(next),
          onTap: () => {
            G.hireWorker();
            this.rebuild(G);
          },
          onDisabled: () => this.toast(G, 'Not enough gold'),
        });
      }
    });
    this.list(G, P, area, 210, rows);
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
    const half = (area.w - 16) / 2;
    this.button(G, P, area.x, y, half, 80, 'BtnPurple', G.settings.sound ? 'Sounds: ON' : 'Sounds: OFF', {
      icon: 'icon_sound',
      size: 26,
      onTap: () => {
        G.settings.sound = !G.settings.sound;
        G.saveSettings();
        this.rebuild(G);
      },
    });
    this.button(G, P, area.x + half + 16, y, half, 80, 'BtnPurple', G.settings.music ? 'Music: ON' : 'Music: OFF', {
      icon: 'icon_sound',
      size: 26,
      onTap: () => {
        G.settings.music = !G.settings.music;
        G.saveSettings();
        PS.Audio.music(G);
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
    this.text(G, 'Potion Shop · progress saves automatically', area.x, y, area.w, 20, COLORS.muted,
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

  // Gold earned by the apprentices while the game was closed.
  buildOffline(G, P) {
    const area = this.frame(G, P, 'Welcome back!', 520);
    const { gold, seconds } = P.params;
    this.icon(G, 'icon_workers', area.x + 60, area.y + 70, 100, P.items, 'UI', 17);
    this.text(G, 'While you were away (' + U.formatTime(seconds) + '), your apprentices kept the shop running.',
      area.x + 130, area.y + 10, area.w - 130, 26, COLORS.ink, 'left', P.items, 'UI', 17);
    this.icon(G, 'icon_coin', area.x + area.w / 2 - 80, area.y + 190, 64, P.items, 'UI', 17);
    this.text(G, '+' + U.formatGold(gold), area.x + area.w / 2 - 40, area.y + 166, 240, 48, COLORS.gold, 'left', P.items,
      'UI', 17, '60;36;20');
    this.button(G, P, area.x + area.w / 2 - 150, area.y + 270, 300, 80, 'BtnGreen', 'Collect', {
      size: 36,
      icon: 'icon_coin',
      onTap: () => {
        G.addGold(gold);
        PS.Audio.play(G, 'coin');
        G.saveNow();
        this.close(G);
      },
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
    // Neighbours at a long table: smaller bubbles, staggered in height.
    const crowded = c.seat && c.seat.slot.seats.length > 1;
    const k = crowded ? 0.78 : 1;
    const stagger = crowded ? (c.seat.slot.seats.indexOf(c.seat) % 2) * 36 : 0;
    const n = c.items.length;
    const isz = (n > 1 ? 36 : 44) * k;
    const bubble = this.ensure(G, c.ui, 'bubble', 'SpeechBubble', 1);
    bubble.hide(!seated);
    // Big orders overlap their icons so bubbles stay narrow at long tables.
    const step = n >= 3 ? isz * 0.62 : isz + 2;
    const bw = Math.max(62 * k, (n - 1) * step + isz + 18 * k);
    const bh = 67 * k;
    bubble.setWidth(bw);
    bubble.setHeight(bh);
    const bob = (c.state === 'waitingOrder' ? Math.sin(G.time * 5 + c.id) * 3 : 0) - stagger;
    bubble.setPosition(sx - bw / 2, sy - bh - 10 + bob);
    // One icon per potion ordered; delivered ones fade with a check mark.
    for (let i = 0; i < 5; i++) {
      const icon = this.ensure(G, c.ui, 'icon' + i, 'Icon', 2);
      const chk = this.ensure(G, c.ui, 'chk' + i, 'Icon', 3);
      const it = c.items[i];
      icon.hide(!seated || !it);
      chk.hide(!seated || !it || !it.done);
      if (!it || !seated) continue;
      icon.setAnimationName(it.recipe.icon);
      icon.setWidth(isz);
      icon.setHeight(isz);
      const ix = sx - ((n - 1) * step + isz) / 2 + i * step;
      icon.setPosition(ix, sy - bh - 4 * k + bob + (44 * k - isz) / 2);
      icon.setOpacity(it.done ? 100 : 255);
      if (it.done) {
        chk.setAnimationName('icon_check');
        chk.setWidth(isz * 0.55);
        chk.setHeight(isz * 0.55);
        chk.setPosition(ix + isz * 0.45, sy - bh + bob + isz * 0.4);
      }
    }
    const right = sx + bw / 2 - 15;
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
      numBack.setPosition(right - 8, sy - bh - 22 + bob);
      num.setText(String(plan));
      num.setCharacterSize(20);
      num.setColor('255;255;255');
      num.setTextAlignment('center');
      num.setWrapping(true);
      num.setWrappingWidth(30);
      num.setPosition(right - 8, sy - bh - 19 + bob);
    } else {
      numBack.hide(true);
      num.hide(true);
      badge.hide(!seated);
      // An apprentice is on it, otherwise: needs order taking / waiting for a potion.
      const helper = PS.Workers.claimedBy(G, c);
      const a = helper && !helper.isOwner ? 'icon_workers' : c.state === 'waitingOrder' ? 'icon_order' : 'icon_hourglass';
      badge.setAnimationName(a);
      const s = c.state === 'waitingOrder' ? 30 + 4 * Math.sin(G.time * 8) : 24;
      badge.setWidth(s);
      badge.setHeight(s);
      badge.setPosition(right + 7 - s / 2, sy - bh - 10 - s / 2 + bob);
    }
    // Patience bar + mood
    const back = this.ensure(G, c.ui, 'barBack', 'BarBack', 1);
    const fill = this.ensure(G, c.ui, 'barFill', 'BarFill', 2);
    const mood = this.ensure(G, c.ui, 'mood', 'Icon', 3);
    const barW = 54 * k;
    back.hide(false);
    fill.hide(false);
    mood.hide(false);
    back.setWidth(barW);
    back.setHeight(12);
    back.setPosition(sx - barW / 2 + 8, sy - 8 - stagger);
    fill.setWidth(Math.max(6, (barW - 4) * ratio));
    fill.setHeight(8);
    fill.setPosition(sx - barW / 2 + 10, sy - 6 - stagger);
    fill.setColor(this.patienceColor(ratio));
    mood.setAnimationName(this.moodIcon(ratio));
    mood.setWidth(24);
    mood.setHeight(24);
    mood.setPosition(sx - barW / 2 - 18, sy - 14 - stagger);
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
    const dirty = c.state === 'dirty';
    const show = done || dirty || c.state === 'reserved';
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
      icon.setAnimationName(done ? c.recipe.icon : dirty ? 'icon_broom' : 'icon_hourglass');
      icon.setWidth(46 * s);
      icon.setHeight(46 * s);
      icon.setPosition(p[0] - 23 * s, p[1] - bh + 8 * s);
      glow.setWidth(130);
      glow.setHeight(130);
      glow.setPosition(p[0] - 65, p[1] - bh / 2 - 65);
      glow.setOpacity(120 + 60 * Math.sin(G.time * 4));
    }
    // Quality stars under a finished potion (none for Poor).
    for (let i = 0; i < 3; i++) {
      const st = this.ensure(G, c.ui, 'star' + i, 'Icon', 3);
      const on = done && p && c.quality >= 2 && i < c.quality;
      st.hide(!on);
      if (on) {
        st.setAnimationName('icon_star');
        st.setWidth(20);
        st.setHeight(20);
        st.setPosition(p[0] - 10 + (i - (c.quality - 1) / 2) * 20, p[1] - 6);
      }
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
    const label = locked ? 'Lv ' + u.minShopLevel : U.formatGold(G.upgradeCost(u));
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
    const t = this.text(G, str, p[0] - 170, p[1] - 30, 340, str.length > 12 ? 24 : 30, '255;240;170', 'center', items,
      'Overlay', 30, '60;30;10');
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
    // Sits over the owner's task line so it never covers a panel title.
    this.panelBox(G, 'PanelDark', W / 2 - w / 2, 84, w, 56, items, 40);
    this.text(G, str, W / 2 - w / 2 + 10, 97, w - 20, 26, '255;255;255', 'center', items, 'UI', 41);
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
    if (PS.Tutorial.handleTap(G, x, y)) return;
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
    if (G.worldTap) G.worldTap(x, y);
    else PS.Input.worldTap(G, x, y);
  },

  // Floating texts and the toast message (also used by the garden scene).
  updateTransient(G, dt) {
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
  },

  // ------------------------------------------------------------ frame
  update(G, dt) {
    this.handleInput(G);
    this.updateHud(G);
    for (const c of G.customers) this.updateCustomerOverlay(G, c);
    for (const c of G.cauldrons) if (c.unlocked) this.updateCauldronOverlay(G, c);
    for (const w of G.workers) this.updateWorkerOverlay(G, w);
    this.updateCounterOverlay(G);
    for (const st of G.slots) this.updateSlotOverlay(G, st, 'extra_table');
    for (const c of G.cauldrons) this.updateSlotOverlay(G, c, 'extra_cauldron');
    this.updateTransient(G, dt);
    // Live panels refresh a few times per second (timers, patience bars).
    G.ui.refreshTimer -= dt;
    const live = G.ui.panel && (['orders', 'workers', 'ad'].includes(G.ui.panel.name) || G.ui.dirty);
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
        if (c.spill) consider(c.x, c.y + 50, 2, 'cauldron', c, 10);
      } else if (c.sign) consider(c.x, c.y, 30, 'slot', 'cauldron');
    }
    for (const s of G.slots) if (s.sign) consider(s.x, s.y, 30, 'slot', 'table');
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
      const needed = PS.Order.needsAny(c);
      if (!needed.length) return PS.UI.toast(G, 'Their potions are on the way!');
      // A wanted potion waiting on the counter: bring it.
      const stocked = needed.find((i) => (G.state.stock[i.recipe.id] || 0) > 0);
      if (stocked) {
        PS.Workers.enqueue(G, { type: 'fetchStock', target: c, recipe: stocked.recipe });
        return;
      }
      for (const it of needed) {
        const ready = G.cauldrons.find((k) => k.state === 'done' && k.recipe.id === it.recipe.id);
        if (ready) return this.tapCauldron(G, ready);
      }
      const unplanned = needed.find((i) => PS.Brewing.plannedFor(G, i.recipe.id) <
        PS.World.wantedItems(G).filter((x) => x.recipe.id === i.recipe.id).length);
      if (!unplanned) return PS.UI.toast(G, 'Their potions are brewing...');
      const idle = PS.Brewing.idleCauldron(G);
      if (idle) PS.UI.open(G, 'brew', { cauldron: idle, slots: PS.Brewing.bestIngredients(G, unplanned.recipe) });
      else PS.UI.toast(G, 'Wants ' + unplanned.recipe.name + ' — all cauldrons are busy');
    } else {
      PS.UI.toast(G, 'Waiting for a free table');
    }
  },

  tapCauldron(G, c) {
    if (c.state === 'idle') {
      // Pre-fill with the oldest wanted potion nobody is making yet.
      const want = PS.World.uncoveredItem(G, null);
      PS.UI.open(G, 'brew', { cauldron: c, slots: want ? PS.Brewing.bestIngredients(G, want.recipe) : [] });
    } else if (c.state === 'done') {
      PS.Workers.enqueue(G, { type: 'collect', target: c });
    } else if (c.state === 'dirty') {
      PS.Workers.enqueue(G, { type: 'clean', target: c });
    } else if (c.state === 'brewing') {
      PS.UI.toast(G, c.recipe.name + ' ready in ' + U.formatTime(c.dur - c.t));
    } else {
      PS.UI.toast(G, 'Waiting for ingredients to be added');
    }
  },
};

};
gdjs.ShopCode.userFunc0xa02f78 = function GDJSInlineCode(runtimeScene) {
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
  // Background music on its own channel (starts after the first tap on phones).
  music(G) {
    try {
      if (G.settings.music) gdjs.evtTools.sound.playMusicOnChannel(G.scene, 'music_shop.wav', 1, true, 30, 1);
      else gdjs.evtTools.sound.stopMusicOnChannel(G.scene, 1);
    } catch (e) {
      // Music is optional.
    }
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

// Rewarded ads with a daily limit. This web build shows a short placeholder;
// the mobile app build will plug the real ad provider in here (show the ad,
// then call the reward on success).
PS.Ads = {
  today() {
    return new Date().toISOString().slice(0, 10);
  },
  state(G) {
    const s = (G.shop || G).state;
    if (s.ads.day !== this.today()) s.ads = { day: this.today(), count: 0 };
    return s.ads;
  },
  left(G) {
    return Math.max(0, PS.data.balance.adDailyLimit - this.state(G).count);
  },
  watch(G, reason, onReward) {
    if (this.left(G) <= 0) {
      PS.UI.toast(G, 'No more ads today, come back tomorrow');
      return false;
    }
    PS.UI.open(G, 'ad', { reason, onReward, until: Date.now() + 3000 }); // real seconds, like a video
    return true;
  },
  claim(G) {
    this.state(G).count += 1;
    (G.shop || G).requestSave();
  },
};

PS.Game = class {
  constructor(runtimeScene) {
    this.scene = runtimeScene;
    this.time = 0;
    this.fx = [];
    this.stockQuality = {}; // quality of each potion stored on the counter
    this.started = false;
    this.saveTimer = 0;
    this.needSave = false;
    PS.game = this;
    PS.loadData(runtimeScene);
    PS.proj.init(runtimeScene);
    this.settings = this.loadSettings();
    this.state = PS.Save.load();
    PS.setupCamera(runtimeScene);
    PS.World.init(this);
    // Navigation is built after the tables exist (long tables are created at runtime).
    this.nav = new PS.Nav(runtimeScene);
    PS.Workers.createOwner(this);
    this.state.workers.forEach((record, i) => PS.Workers.createApprentice(this, i + 1, record));
    PS.UI.init(this);
    this.setShadows(this.settings.shadows);
    PS.Tutorial.init(this);
    PS.Audio.music(this);
    this.checkOffline();
    this.incomeTimer = 0;
    this.earnedMark = this.state.earned;
    this.started = true;
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
  // ----- prestige
  prestige() {
    return this.state.prestige || 0;
  }
  groupSize() {
    return Math.min(5, 1 + this.prestige()); // chairs per table slot
  }
  maxOrderItems() {
    return Math.min(5, 1 + this.prestige()); // potions one customer may order
  }
  patienceMult() {
    return Math.max(0.6, Math.pow(0.93, this.prestige()));
  }
  costMult() {
    return Math.pow(PS.data.balance.prestigeCostMult, this.prestige());
  }
  herbCostMult() {
    return Math.pow(PS.data.balance.prestigeHerbMult, this.prestige());
  }
  // Selling price of one Standard potion: prestige bonus, Fine Bottles and mastery.
  potionPrice(recipe) {
    const mastery = PS.data.upgradeById['mastery_' + recipe.id];
    const m = mastery ? 1 + mastery.effect * this.level(mastery.id) : 1;
    return recipe.price * Math.pow(PS.data.balance.prestigePriceMult, this.prestige()) * this.mult('fine_bottles', +1) * m;
  }
  herbCost(ing) {
    return Math.round(ing.cost * ing.bundle * this.herbCostMult());
  }
  hireCost(t) {
    return Math.round(t.hireCost * this.costMult());
  }
  // Prestige needs every shop upgrade maxed and every apprentice hired.
  prestigeProgress() {
    const goals = PS.data.upgrades.filter((u) => !u.persistent && (u.tab === 'upgrades' || u.tab === 'expand'));
    let done = 0;
    const missing = [];
    for (const u of goals) {
      if (this.level(u.id) >= this.upgradeMax(u)) done++;
      else missing.push(u.name);
    }
    const hired = this.state.workers.length;
    const needHires = PS.data.workerTypes.length;
    if (hired < needHires) missing.push('Hire all apprentices (' + hired + '/' + needHires + ')');
    return { done: done + Math.min(hired, needHires), total: goals.length + needHires, ready: missing.length === 0, missing };
  }
  doPrestige() {
    if (!this.prestigeProgress().ready) return false;
    const next = PS.Save.prestigeReset(this.state);
    next.gems += PS.data.balance.prestigeGems * next.prestige;
    this.state = next;
    PS.Save.save(next);
    this.prestiging = true;
    this.scene.requestChange(gdjs.SceneChangeRequest.REPLACE_SCENE, 'Shop');
    return true;
  }

  upgradeMax(u) {
    if (u.id === 'extra_table') return Math.min(u.maxLevel, this.slots.length - 3);
    if (u.id === 'extra_cauldron') return Math.min(u.maxLevel, this.cauldrons.length - 1);
    return u.maxLevel;
  }
  upgradeCost(u) {
    // Shop upgrades get more expensive with every prestige; masteries keep their own curve.
    return Math.round(u.baseCost * Math.pow(u.costGrowth, this.level(u.id)) * (u.persistent ? 1 : this.costMult()));
  }
  upgradeStatus(u) {
    const l = this.level(u.id);
    if (u.id === 'extra_table') {
      const n = this.groupSize();
      return 'Tables: ' + PS.World.tablesUnlocked(this) + ' / ' + this.slots.length + (n > 1 ? '  (' + n + ' seats each)' : '');
    }
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

  // ----- hired apprentices
  nextWorkerType() {
    return PS.data.workerTypes[this.state.workers.length] || null;
  }
  hireWorker() {
    const t = this.nextWorkerType();
    if (!t || this.state.gold < this.hireCost(t) || this.state.level < t.minShopLevel) return false;
    this.addGold(-this.hireCost(t));
    const record = { type: t.id, role: 'all', stats: { speed: 0, brew: 0, service: 0 } };
    this.state.workers.push(record);
    const w = PS.Workers.createApprentice(this, this.state.workers.length, record);
    // Walk in from the door.
    w.obj.setPosition(this.door[0], this.door[1]);
    PS.FX.sparkleAt(this, this.door[0], this.door[1], 40);
    PS.Audio.play(this, 'levelup');
    PS.UI.toast(this, t.name + ' joined your shop!');
    this.saveNow();
    return true;
  }
  workerUpgradeCost(index, stat) {
    const b = PS.data.balance;
    const lvl = this.state.workers[index - 1].stats[stat] || 0;
    return Math.round(b.workerUpgradeBase * Math.pow(b.workerUpgradeGrowth, lvl) * (1 + 0.6 * (index - 1)) * this.costMult());
  }
  upgradeWorker(index, stat) {
    const rec = this.state.workers[index - 1];
    if (!rec || rec.stats[stat] >= 5) return false;
    const cost = this.workerUpgradeCost(index, stat);
    if (this.state.gold < cost) return false;
    this.addGold(-cost);
    rec.stats[stat] += 1;
    PS.Audio.play(this, 'buy');
    this.saveNow();
    return true;
  }
  cycleWorkerRole(index) {
    const rec = this.state.workers[index - 1];
    const roles = ['all', 'service', 'brew'];
    rec.role = roles[(roles.indexOf(rec.role) + 1) % roles.length];
    this.requestSave();
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
    while (s.xp >= PS.xpForLevel(s.level) && s.level < 999) {
      s.xp -= PS.xpForLevel(s.level);
      s.level += 1;
      leveled = true;
      s.gems += PS.data.balance.levelGems;
      for (const r of PS.data.recipes) if (r.unlockLevel === s.level && r.prestige <= s.prestige) newRecipes.push(r);
      for (const ing of PS.data.ingredients) {
        if (ing.unlockLevel === s.level && ing.prestige <= s.prestige && !ing.rare) {
          s.inventory[ing.id] = Math.min(this.storageCap(), (s.inventory[ing.id] || 0) + 4);
        }
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
      if (c.recipe && c.recipe.id !== 'sludge' && !c.accident && (c.state === 'brewing' || c.state === 'done' || c.state === 'reserved')) {
        s.stock[c.recipe.id] = (s.stock[c.recipe.id] || 0) + 1;
      }
    }
    for (const w of this.workers) {
      if (w.carrying && w.carrying.id !== 'sludge') s.stock[w.carrying.id] = (s.stock[w.carrying.id] || 0) + 1;
    }
    return s;
  }
  // Apprentices keep earning (at a reduced rate) while the game is closed,
  // for up to two hours.
  checkOffline() {
    const s = this.state;
    const apprentices = s.workers.length;
    if (!apprentices || !s.lastSeen) return;
    const seconds = Math.min((Date.now() - s.lastSeen) / 1000, 7200);
    if (seconds < 120) return;
    const gold = Math.round((seconds / 60) * s.incomeRate * (0.15 + 0.1 * apprentices));
    if (gold > 0) PS.UI.open(this, 'offline', { gold, seconds });
  }
  saveNow() {
    this.state.lastSeen = Date.now();
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
    const flag = (k) => (s && typeof s[k] === 'boolean' ? s[k] : true);
    return { shadows: flag('shadows'), sound: flag('sound'), music: flag('music') };
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

  // ----- herb garden (a separate scene pushed on top of the paused shop)
  goToGarden() {
    PS.UI.close(this);
    this.saveNow();
    this.scene.requestChange(gdjs.SceneChangeRequest.PUSH_SCENE, 'Garden');
  }

  // ----- main loop
  update() {
    PS.proj.scene = this.scene; // the garden scene may have changed it
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
    PS.Tutorial.update(this, dt);
    // Recent income per minute (used for offline earnings).
    this.incomeTimer += dt;
    if (this.incomeTimer >= 60) {
      const perMinute = ((this.state.earned - this.earnedMark) * 60) / this.incomeTimer;
      this.state.incomeRate = this.state.incomeRate ? this.state.incomeRate * 0.6 + perMinute * 0.4 : perMinute;
      this.incomeTimer = 0;
      this.earnedMark = this.state.earned;
    }
    this.saveTimer += dt;
    if (this.saveTimer > 8 && this.needSave) this.saveNow();
  }
};

};
gdjs.ShopCode.userFunc0xa03050 = function GDJSInlineCode(runtimeScene) {
"use strict";
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
    const want = ordered.length ? PS.World.uncoveredItem(G, null) : null;
    if (want && idle) {
      const name = want.recipe.name;
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

};
gdjs.ShopCode.userFunc0xa03128 = function GDJSInlineCode(runtimeScene) {
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


gdjs.ShopCode.userFunc0xa02878(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02968(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02a30(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02af8(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02c18(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02cf0(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02dc8(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02ea0(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa02f78(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa03050(runtimeScene);

}


{


gdjs.ShopCode.userFunc0xa03128(runtimeScene);

}


};gdjs.ShopCode.userFunc0x8e6818 = function GDJSInlineCode(runtimeScene) {
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


gdjs.ShopCode.userFunc0x8e6818(runtimeScene);

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
gdjs.ShopCode.GDTableGroup2Objects1.length = 0;
gdjs.ShopCode.GDTableGroup2Objects2.length = 0;
gdjs.ShopCode.GDTableGroup3Objects1.length = 0;
gdjs.ShopCode.GDTableGroup3Objects2.length = 0;
gdjs.ShopCode.GDTableGroup4Objects1.length = 0;
gdjs.ShopCode.GDTableGroup4Objects2.length = 0;
gdjs.ShopCode.GDTableGroup5Objects1.length = 0;
gdjs.ShopCode.GDTableGroup5Objects2.length = 0;
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
gdjs.ShopCode.GDApprenticePipObjects1.length = 0;
gdjs.ShopCode.GDApprenticePipObjects2.length = 0;
gdjs.ShopCode.GDApprenticeMapleObjects1.length = 0;
gdjs.ShopCode.GDApprenticeMapleObjects2.length = 0;
gdjs.ShopCode.GDApprenticeBrambleObjects1.length = 0;
gdjs.ShopCode.GDApprenticeBrambleObjects2.length = 0;
gdjs.ShopCode.GDLiquidObjects1.length = 0;
gdjs.ShopCode.GDLiquidObjects2.length = 0;
gdjs.ShopCode.GDHeldBottleObjects1.length = 0;
gdjs.ShopCode.GDHeldBottleObjects2.length = 0;
gdjs.ShopCode.GDSpillObjects1.length = 0;
gdjs.ShopCode.GDSpillObjects2.length = 0;
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
gdjs.ShopCode.GDTableGroup2Objects1.length = 0;
gdjs.ShopCode.GDTableGroup2Objects2.length = 0;
gdjs.ShopCode.GDTableGroup3Objects1.length = 0;
gdjs.ShopCode.GDTableGroup3Objects2.length = 0;
gdjs.ShopCode.GDTableGroup4Objects1.length = 0;
gdjs.ShopCode.GDTableGroup4Objects2.length = 0;
gdjs.ShopCode.GDTableGroup5Objects1.length = 0;
gdjs.ShopCode.GDTableGroup5Objects2.length = 0;
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
gdjs.ShopCode.GDApprenticePipObjects1.length = 0;
gdjs.ShopCode.GDApprenticePipObjects2.length = 0;
gdjs.ShopCode.GDApprenticeMapleObjects1.length = 0;
gdjs.ShopCode.GDApprenticeMapleObjects2.length = 0;
gdjs.ShopCode.GDApprenticeBrambleObjects1.length = 0;
gdjs.ShopCode.GDApprenticeBrambleObjects2.length = 0;
gdjs.ShopCode.GDLiquidObjects1.length = 0;
gdjs.ShopCode.GDLiquidObjects2.length = 0;
gdjs.ShopCode.GDHeldBottleObjects1.length = 0;
gdjs.ShopCode.GDHeldBottleObjects2.length = 0;
gdjs.ShopCode.GDSpillObjects1.length = 0;
gdjs.ShopCode.GDSpillObjects2.length = 0;
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
