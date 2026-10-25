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
