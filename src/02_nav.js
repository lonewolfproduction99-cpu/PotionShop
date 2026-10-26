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
