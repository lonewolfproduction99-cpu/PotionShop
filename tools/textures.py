"""
Procedural pixel-art textures for Potion Shop models.

Tiles are 32x32 and referenced by name. Names may carry parameters after a
colon, for example "cloth:3a6ea5" or "face:f2c9a0:3b2a20:smile".
Repeating textures (used with "rep:<name>" in the modeler) are larger and tile
seamlessly.
"""

import hashlib

import numpy as np
from PIL import Image, ImageDraw

TILE = 32
PAD = 2
SLOT = TILE + 2 * PAD
ATLAS_COLS = 16
ATLAS_PX = SLOT * ATLAS_COLS


# ----------------------------------------------------------------- helpers
def rng_for(name):
    h = int(hashlib.md5(name.encode()).hexdigest()[:8], 16)
    return np.random.default_rng(h)


def hexc(h):
    h = h.lstrip("#")
    return np.array([int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)], dtype=np.float32)


def shade(c, f):
    return np.clip(np.array(c, dtype=np.float32) * f, 0, 255)


def mix(a, b, t):
    return np.array(a, dtype=np.float32) * (1 - t) + np.array(b, dtype=np.float32) * t


def canvas(color, size=TILE):
    img = np.zeros((size, size, 4), dtype=np.float32)
    img[:, :, :3] = color
    img[:, :, 3] = 255
    return img


def value_noise(rng, size, cells, octaves=3):
    out = np.zeros((size, size), dtype=np.float32)
    amp = 1.0
    total = 0
    for o in range(octaves):
        n = cells * (2 ** o)
        grid = rng.random((n + 1, n + 1)).astype(np.float32)
        grid[n, :] = grid[0, :]
        grid[:, n] = grid[:, 0]
        xs = np.linspace(0, n, size, endpoint=False)
        x0 = np.floor(xs).astype(int)
        t = xs - x0
        t = t * t * (3 - 2 * t)
        a = grid[np.ix_(x0, x0)]
        b = grid[np.ix_(x0, x0 + 1)]
        c = grid[np.ix_(x0 + 1, x0)]
        d = grid[np.ix_(x0 + 1, x0 + 1)]
        ty = t[:, None]
        tx = t[None, :]
        out += amp * ((a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty)
        total += amp
        amp *= 0.5
    return out / total


def apply_noise(img, rng, strength=0.12, cells=4):
    n = value_noise(rng, img.shape[0], cells)
    f = 1 + (n - 0.5) * 2 * strength
    img[:, :, :3] = np.clip(img[:, :, :3] * f[:, :, None], 0, 255)
    return img


def speckle(img, rng, amount=0.08, strength=0.12):
    m = rng.random(img.shape[:2]) < amount
    f = 1 + (rng.random(img.shape[:2]) - 0.5) * 2 * strength
    img[:, :, :3] = np.where(m[:, :, None], np.clip(img[:, :, :3] * f[:, :, None], 0, 255), img[:, :, :3])
    return img


def bevel(img, light=1.18, dark=0.7, width=1):
    """Highlight top/left edge, darken bottom/right edge."""
    s = img.shape[0]
    img[:width, :, :3] *= light
    img[:, :width, :3] *= light
    img[s - width:, :, :3] *= dark
    img[:, s - width:, :3] *= dark
    img[:, :, :3] = np.clip(img[:, :, :3], 0, 255)
    return img


def to_image(arr):
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def draw_on(arr, fn):
    im = to_image(arr)
    d = ImageDraw.Draw(im)
    fn(d)
    return np.array(im).astype(np.float32)


# ----------------------------------------------------------------- tiles
def t_wood(name, base="9a6236", vertical=False, boards=2):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(c)
    s = TILE
    # Grain: stretched noise
    n = value_noise(rng, s, 2, 3)
    grain = np.sin((np.arange(s)[:, None] * 1.3 + n * 9) * 1.4) * 0.5 + 0.5
    grain = grain * 0.6 + rng.random((s, 1)) * 0.4
    f = 0.82 + grain * 0.3
    if vertical:
        f = f.T
    img[:, :, :3] *= f[:, :, None]
    # Board separations
    bh = s // boards
    for b in range(boards):
        y = b * bh
        if vertical:
            img[:, y, :3] *= 0.55
            if y + 1 < s:
                img[:, y + 1, :3] *= 1.12
        else:
            img[y, :, :3] *= 0.55
            if y + 1 < s:
                img[y + 1, :, :3] *= 1.12
        # knot
        if rng.random() < 0.5:
            kx = int(rng.integers(4, s - 4))
            ky = y + int(rng.integers(3, max(4, bh - 3)))
            if vertical:
                kx, ky = ky, kx
            for dy in range(-1, 2):
                for dx in range(-2, 3):
                    yy, xx = (ky + dy) % s, (kx + dx) % s
                    img[yy, xx, :3] *= 0.72
    # Nails
    for b in range(boards):
        y = b * bh + bh // 2
        for x in (2, s - 3):
            if vertical:
                img[x, y, :3] = shade(c, 0.35)
            else:
                img[y, x, :3] = shade(c, 0.35)
    img = speckle(img, rng, 0.05, 0.1)
    return np.clip(img, 0, 255)


def t_stone(name, base="8d8a86", rows=4, mortar="5b5650"):
    rng = rng_for(name)
    c = hexc(base)
    m = hexc(mortar)
    img = canvas(m)
    s = TILE
    rh = s // rows
    for r in range(rows):
        off = (r % 2) * (s // 4)
        x = -off
        while x < s:
            w = int(rng.integers(s // 3, s // 2 + 2))
            tint = 0.85 + rng.random() * 0.3
            hue = rng.random() * 0.08
            col = shade(c, tint) * np.array([1 + hue, 1, 1 - hue])
            for yy in range(r * rh + 1, r * rh + rh):
                for xx in range(x + 1, x + w):
                    if 0 <= xx < s:
                        img[yy, xx, :3] = col
            # stone bevel
            for xx in range(x + 1, x + w):
                if 0 <= xx < s:
                    img[r * rh + 1, xx, :3] = shade(col, 1.18)
                    img[r * rh + rh - 1, xx, :3] = shade(col, 0.75)
            if 0 <= x + 1 < s:
                img[r * rh + 1:r * rh + rh, x + 1, :3] = shade(col, 1.1)
            x += w
    img = apply_noise(img, rng, 0.1, 4)
    img = speckle(img, rng, 0.12, 0.18)
    return img


def t_cobble(name, base="8a8580"):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(shade(c, 0.55))
    s = TILE
    pts = rng.random((9, 2)) * s
    yy, xx = np.mgrid[0:s, 0:s]
    d1 = np.full((s, s), 1e9)
    d2 = np.full((s, s), 1e9)
    idx = np.zeros((s, s), dtype=int)
    for i, (px, py) in enumerate(pts):
        for ox in (-s, 0, s):
            for oy in (-s, 0, s):
                d = np.hypot(xx - (px + ox), yy - (py + oy))
                closer = d < d1
                d2 = np.where(closer, d1, np.minimum(d2, d))
                idx = np.where(closer, i, idx)
                d1 = np.where(closer, d, d1)
    edge = (d2 - d1)
    tints = 0.8 + rng.random(len(pts)) * 0.35
    col = c[None, None, :] * tints[idx][:, :, None]
    shading = np.clip(edge / 4, 0, 1)
    img[:, :, :3] = np.where((edge > 1.4)[:, :, None], col * (0.8 + 0.25 * shading[:, :, None]), img[:, :, :3])
    img = speckle(img, rng, 0.1, 0.15)
    return img


def t_plaster(name, base="e8dcc0"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    img = apply_noise(img, rng, 0.06, 3)
    img = speckle(img, rng, 0.1, 0.06)
    return img


def t_metal(name, base="4a4d55", rivets=True):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(c)
    s = TILE
    for y in range(s):
        img[y, :, :3] *= 0.9 + 0.2 * (1 - abs(y - s / 3) / s)
    img = apply_noise(img, rng, 0.06, 6)
    img = bevel(img, 1.35, 0.6, 2)
    if rivets:
        for x in (5, s // 2, s - 6):
            for y in (5, s - 6):
                img[y - 1:y + 2, x - 1:x + 2, :3] = shade(c, 1.5)
                img[y + 1, x - 1:x + 2, :3] = shade(c, 0.6)
    return np.clip(img, 0, 255)


def t_gold(name, base="e2b23c"):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(c)
    s = TILE
    for y in range(s):
        f = 0.75 + 0.5 * abs(np.sin(y / s * np.pi * 1.5))
        img[y, :, :3] = shade(c, f)
    img = speckle(img, rng, 0.05, 0.25)
    return bevel(img, 1.3, 0.65, 1)


def t_cloth(name, base="3a6ea5", pattern=None, base2=None):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(c)
    s = TILE
    yy, xx = np.mgrid[0:s, 0:s]
    weave = ((xx + yy) % 2) * 0.06 + ((xx // 2 + yy // 2) % 2) * 0.03
    img[:, :, :3] *= (0.95 + weave)[:, :, None]
    if pattern == "stripe" and base2:
        c2 = hexc(base2)
        m = ((yy // 4) % 2 == 0)
        img[:, :, :3] = np.where(m[:, :, None], c2 * (0.95 + weave)[:, :, None], img[:, :, :3])
    if pattern == "check" and base2:
        c2 = hexc(base2)
        m = (((yy // 6) + (xx // 6)) % 2 == 0)
        img[:, :, :3] = np.where(m[:, :, None], mix(c, c2, 0.6) * (0.95 + weave)[:, :, None], img[:, :, :3])
    if pattern == "trim" and base2:
        c2 = hexc(base2)
        img[s - 5:s - 1, :, :3] = c2
        img[s - 5, :, :3] = shade(c2, 1.25)
    img = apply_noise(img, rng, 0.07, 3)
    # folds
    for x in range(0, s, 8):
        img[:, x, :3] *= 0.9
    return np.clip(img, 0, 255)


def t_leather(name, base="6b4226"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    img = apply_noise(img, rng, 0.12, 5)
    img = speckle(img, rng, 0.15, 0.15)
    s = TILE
    # stitching
    for x in range(1, s, 4):
        img[2, x:x + 2, :3] = shade(hexc(base), 1.6)
        img[s - 3, x:x + 2, :3] = shade(hexc(base), 1.6)
    return np.clip(img, 0, 255)


def t_skin(name, base="f2c49a"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    img = apply_noise(img, rng, 0.03, 2)
    return img


def t_face(name, skin="f2c49a", eye="3b2a20", style="smile", blush=True, extra=""):
    """Front face of a blocky head: eyes, brows, nose, mouth."""
    img = t_skin(name, skin)
    s = TILE
    sk = hexc(skin)
    e = hexc(eye)
    white = np.array([250, 250, 245.0])
    # Eyes (2x3 with white side + highlight)
    for ex in (8, 21):
        img[14:19, ex:ex + 4, :3] = white
        img[14:19, ex + 1:ex + 4, :3] = e
        img[14, ex + 2, :3] = np.array([255, 255, 255.0])
        img[13, ex - 1:ex + 5, :3] = shade(sk, 0.62)  # upper lid shadow
    # Brows
    brow = shade(hexc(extra) if extra else e, 0.9)
    if style == "stern":
        img[10, 7:13, :3] = brow
        img[11, 11:13, :3] = brow
        img[10, 20:26, :3] = brow
        img[11, 20:22, :3] = brow
    else:
        img[10, 8:12, :3] = brow
        img[10, 21:25, :3] = brow
    # Nose
    img[19:22, 15:17, :3] = shade(sk, 0.85)
    img[21, 15:17, :3] = shade(sk, 0.72)
    # Mouth
    m = np.array([140, 60, 55.0])
    if style == "smile":
        img[24, 12:20, :3] = m
        img[23, 11, :3] = m
        img[23, 20, :3] = m
        img[25, 13:19, :3] = shade(m, 1.3)
    elif style == "open":
        img[23:27, 13:19, :3] = np.array([90, 30, 30.0])
        img[23, 13:19, :3] = white
    elif style == "stern":
        img[24, 12:20, :3] = m
    else:
        img[24, 13:19, :3] = m
    if blush:
        img[21:23, 6:10, :3] = mix(sk, np.array([235, 110, 110.0]), 0.45)
        img[21:23, 22:26, :3] = mix(sk, np.array([235, 110, 110.0]), 0.45)
    return img


def t_hair(name, base="5a3a22", fringe=False):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(c)
    s = TILE
    for x in range(s):
        f = 0.8 + 0.35 * ((x * 7 + int(rng.integers(0, 3))) % 5) / 5
        img[:, x, :3] *= f
    img = apply_noise(img, rng, 0.08, 4)
    if fringe:
        # Transparent-looking lower part is not possible; use jagged fringe on skin-less tile.
        for x in range(s):
            h = 10 + int(4 * abs(np.sin(x * 0.7))) + int(rng.integers(0, 3))
            img[h:, x, :3] = shade(c, 0.55)
    img[0:2, :, :3] *= 1.15
    return np.clip(img, 0, 255)


def t_hair_front(name, base="5a3a22", skin="f2c49a"):
    """Hair tile for the upper part of the face: hair on top, skin below with jagged edge."""
    rng = rng_for(name)
    img = t_skin(name + "s", skin)
    hair = t_hair(name + "h", base)
    s = TILE
    for x in range(s):
        h = 9 + int(3 * abs(np.sin(x * 0.55))) + int(rng.integers(0, 2))
        img[:h, x, :] = hair[:h, x, :]
        img[h, x, :3] = shade(hexc(skin), 0.8)
    return img


def t_beard(name, base="d8d0c8", skin="f2c49a"):
    rng = rng_for(name)
    img = t_hair(name, base)
    s = TILE
    return img


def t_glass(name, liquid="d23b3b", level=0.55):
    s = TILE
    c = hexc(liquid)
    img = canvas(np.array([150, 190, 200.0]))
    img[:, :, :3] = mix(img[:, :, :3], np.array([40, 60, 70.0]), 0.35)
    top = int(s * (1 - level))
    for y in range(top, s):
        f = 0.85 + 0.3 * (y - top) / max(1, s - top)
        img[y, :, :3] = shade(c, 1.15 - (f - 0.85))
    img[top, :, :3] = shade(c, 1.5)
    # highlight
    img[3:s - 4, 5:7, :3] = mix(img[3:s - 4, 5:7, :3], np.array([255, 255, 255.0]), 0.65)
    img[4:9, 9, :3] = mix(img[4:9, 9, :3], np.array([255, 255, 255.0]), 0.5)
    img = bevel(img, 1.2, 0.7, 1)
    return np.clip(img, 0, 255)


def t_liquid(name, base="7b3fd1"):
    rng = rng_for(name)
    c = hexc(base)
    s = TILE
    img = canvas(c)
    yy, xx = np.mgrid[0:s, 0:s]
    cx = cy = (s - 1) / 2
    ang = np.arctan2(yy - cy, xx - cx)
    r = np.hypot(yy - cy, xx - cx)
    swirl = np.sin(ang * 3 + r * 0.45) * 0.5 + 0.5
    img[:, :, :3] = mix(shade(c, 0.85), shade(c, 1.35), swirl[:, :, None])
    # bubbles
    for _ in range(6):
        bx, by = rng.integers(3, s - 3, 2)
        img[by - 1:by + 2, bx - 1:bx + 2, :3] = shade(c, 1.6)
        img[by - 1, bx - 1, :3] = np.array([255, 255, 255.0])
    return np.clip(img, 0, 255)


def t_books(name):
    rng = rng_for(name)
    s = TILE
    img = canvas(np.array([60, 40, 30.0]))
    cols = ["8e2b2b", "2b4f8e", "2f7a3f", "8a6a1f", "5e2f7a", "a0522d", "1f5f5f"]
    x = 0
    while x < s:
        w = int(rng.integers(3, 6))
        h = int(rng.integers(s - 10, s))
        c = hexc(cols[int(rng.integers(0, len(cols)))])
        img[s - h:, x:x + w, :3] = c
        img[s - h:, x, :3] = shade(c, 1.25)
        img[s - h:, min(s - 1, x + w - 1), :3] = shade(c, 0.6)
        band = s - h + 3
        img[band:band + 1, x:x + w, :3] = np.array([220, 190, 90.0])
        img[s - 5:s - 4, x:x + w, :3] = np.array([220, 190, 90.0])
        x += w
    return img


def t_book_cover(name, base="7a2f2f"):
    c = hexc(base)
    img = canvas(c)
    rng = rng_for(name)
    img = apply_noise(img, rng, 0.08, 4)
    s = TILE
    g = np.array([225, 190, 90.0])
    img[3, 3:s - 3, :3] = g
    img[s - 4, 3:s - 3, :3] = g
    img[3:s - 3, 3, :3] = g
    img[3:s - 3, s - 4, :3] = g
    img[12:20, 13:19, :3] = g
    img[14:18, 15:17, :3] = c
    return img


def t_paper(name, base="efe3c4"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    img = apply_noise(img, rng, 0.06, 3)
    s = TILE
    for y in range(6, s - 4, 4):
        x0 = int(rng.integers(4, 8))
        x1 = int(rng.integers(s - 10, s - 4))
        img[y, x0:x1, :3] = np.array([110, 90, 70.0])
    return img


def t_candle(name, base="f3ead0"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    s = TILE
    for x in range(s):
        img[:, x, :3] *= 0.85 + 0.25 * np.sin(x / s * np.pi)
    # drips
    for _ in range(4):
        x = int(rng.integers(2, s - 3))
        l = int(rng.integers(4, 12))
        img[:l, x:x + 2, :3] = shade(hexc(base), 1.08)
    return np.clip(img, 0, 255)


def t_flame(name):
    s = TILE
    img = canvas(np.array([255, 140, 30.0]))
    yy, xx = np.mgrid[0:s, 0:s]
    d = np.hypot((xx - s / 2) / (s / 2), (yy - s * 0.65) / (s * 0.6))
    core = np.clip(1 - d, 0, 1)
    img[:, :, :3] = mix(np.array([255, 120, 20.0]), np.array([255, 245, 170.0]), core[:, :, None])
    return img


def t_ember(name):
    rng = rng_for(name)
    s = TILE
    img = canvas(np.array([200, 60, 10.0]))
    n = value_noise(rng, s, 4, 3)
    img[:, :, :3] = mix(np.array([120, 20, 5.0]), np.array([255, 190, 60.0]), np.clip(n * 1.6 - 0.3, 0, 1)[:, :, None])
    return img


def t_leaves(name, base="4f8a3a"):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(shade(c, 0.6))
    s = TILE
    for _ in range(40):
        x, y = rng.integers(0, s, 2)
        w = int(rng.integers(2, 5))
        f = 0.8 + rng.random() * 0.5
        img[y:y + 2, x:x + w, :3] = shade(c, f)
        img[y, x:x + w, :3] = shade(c, f * 1.2)
    return np.clip(img, 0, 255)


def t_herb(name, base="5fa04a", flower=None):
    img = t_leaves(name, base)
    rng = rng_for(name + "f")
    if flower:
        fc = hexc(flower)
        for _ in range(7):
            x, y = rng.integers(2, TILE - 3, 2)
            img[y:y + 2, x:x + 2, :3] = fc
            img[y, x, :3] = shade(fc, 1.3)
    return img


def t_dirt(name, base="6b4a2e"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    img = apply_noise(img, rng, 0.15, 4)
    img = speckle(img, rng, 0.2, 0.25)
    return img


def t_grass(name, base="5d9c3f"):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(c)
    img = apply_noise(img, rng, 0.1, 4)
    s = TILE
    for _ in range(60):
        x, y = rng.integers(0, s, 2)
        h = int(rng.integers(2, 4))
        f = 0.75 + rng.random() * 0.5
        img[max(0, y - h):y, x, :3] = shade(c, f)
    return np.clip(img, 0, 255)


def t_rug(name, base="8e2f3a", accent="e0b04a", inner="2f4f7a"):
    s = TILE
    c = hexc(base)
    a = hexc(accent)
    i = hexc(inner)
    img = canvas(c)
    yy, xx = np.mgrid[0:s, 0:s]
    d = np.abs(xx - s / 2 + 0.5) + np.abs(yy - s / 2 + 0.5)
    img[:, :, :3] = np.where((d < 10)[:, :, None], i, img[:, :, :3])
    img[:, :, :3] = np.where(((d >= 10) & (d < 12))[:, :, None], a, img[:, :, :3])
    img[:, :, :3] = np.where((d < 4)[:, :, None], a, img[:, :, :3])
    weave = ((xx + yy) % 2) * 0.06
    img[:, :, :3] *= (0.95 + weave)[:, :, None]
    return np.clip(img, 0, 255)


def t_rug_border(name, base="8e2f3a", accent="e0b04a"):
    s = TILE
    img = canvas(hexc(base))
    a = hexc(accent)
    img[4:6, :, :3] = a
    img[s - 6:s - 4, :, :3] = a
    for x in range(0, s, 6):
        img[12:20, x + 2:x + 4, :3] = a
    for y in range(s):
        if y % 2 == 0:
            img[y, :, :3] *= 1.05
    return np.clip(img, 0, 255)


def t_window(name, glow="ffd98a"):
    s = TILE
    frame = np.array([90, 60, 35.0])
    img = canvas(frame)
    g = hexc(glow)
    for (x0, y0) in ((3, 3), (17, 3), (3, 17), (17, 17)):
        for y in range(y0, y0 + 12):
            t = (y - y0) / 12
            img[y, x0:x0 + 12, :3] = mix(shade(g, 1.1), shade(g, 0.75), t)
        img[y0 + 1:y0 + 6, x0 + 1, :3] = np.array([255, 255, 240.0])
    return img


def t_crate(name, base="a0703c"):
    img = t_wood(name, base, boards=4)
    s = TILE
    c = shade(hexc(base), 0.65)
    img[0:3, :, :3] = c
    img[s - 3:, :, :3] = c
    img[:, 0:3, :3] = c
    img[:, s - 3:, :3] = c
    for i in range(s):
        j = i
        if 2 < j < s - 3:
            img[i, j - 1:j + 2, :3] = shade(hexc(base), 0.75)
    return img


def t_barrel(name, base="8a5a2f"):
    img = t_wood(name, base, vertical=True, boards=5)
    s = TILE
    band = hexc("3c3c44")
    for y in (4, s - 7):
        img[y:y + 3, :, :3] = band
        img[y, :, :3] = shade(band, 1.5)
    return img


def t_solid(name, base="888888"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    return apply_noise(img, rng, 0.04, 3)


def t_gem(name, base="4ad0e0"):
    c = hexc(base)
    s = TILE
    img = canvas(shade(c, 0.6))
    yy, xx = np.mgrid[0:s, 0:s]
    d = np.abs(xx - s / 2) + np.abs(yy - s / 2)
    img[:, :, :3] = mix(shade(c, 1.4), shade(c, 0.6), np.clip(d / s, 0, 1)[:, :, None])
    img[6:10, 10:13, :3] = np.array([255, 255, 255.0])
    return img


def t_sign(name, base="9a6236"):
    img = t_wood(name, base, boards=1)
    s = TILE
    g = np.array([235, 200, 110.0])
    img[2, 2:s - 2, :3] = g
    img[s - 3, 2:s - 2, :3] = g
    img[2:s - 2, 2, :3] = g
    img[2:s - 2, s - 3, :3] = g
    # potion silhouette
    img[10:13, 14:18, :3] = g
    img[13:24, 11:21, :3] = np.array([120, 200, 120.0])
    img[13, 11:21, :3] = g
    img[16:24, 10:22, :3] = np.array([120, 200, 120.0])
    return img


def t_cauldron(name, base="3e414c"):
    rng = rng_for(name)
    c = hexc(base)
    img = canvas(c)
    s = TILE
    img = apply_noise(img, rng, 0.12, 5)
    for y in range(s):
        img[y, :, :3] *= 1.25 - 0.5 * (y / s)
    # rim highlight
    img[0:2, :, :3] = shade(c, 1.9)
    return np.clip(img, 0, 255)


def t_bubble(name, base="ffffff"):
    s = TILE
    img = canvas(hexc(base))
    img[4:10, 4:10, :3] = np.array([255, 255, 255.0])
    return img


def t_stars(name, base="2a2050", star="ffe27a"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    img = apply_noise(img, rng, 0.1, 3)
    s = TILE
    for _ in range(7):
        x, y = rng.integers(2, s - 2, 2)
        img[y, x - 1:x + 2, :3] = hexc(star)
        img[y - 1:y + 2, x, :3] = hexc(star)
    return img


def t_scale(name, base="c08840"):
    rng = rng_for(name)
    img = canvas(hexc(base))
    s = TILE
    for y in range(0, s, 6):
        for x in range(0, s, 6):
            off = 3 if (y // 6) % 2 else 0
            img[y + 4:y + 6, (x + off) % s:(x + off) % s + 4, :3] *= 0.7
    return np.clip(apply_noise(img, rng, 0.08, 3), 0, 255)


PAINTERS = {
    "wood": lambda n, *a: t_wood(n, *(a or ["9a6236"])),
    "wood_dark": lambda n, *a: t_wood(n, "5e3a1f"),
    "wood_light": lambda n, *a: t_wood(n, "c4925a"),
    "wood_red": lambda n, *a: t_wood(n, "8a3d2a"),
    "wood_v": lambda n, *a: t_wood(n, a[0] if a else "8a5a32", vertical=True, boards=3),
    "wood_v_dark": lambda n, *a: t_wood(n, "5a3820", vertical=True, boards=3),
    "beam": lambda n, *a: t_wood(n, "5a3820", boards=1),
    "beam_v": lambda n, *a: t_wood(n, "5a3820", vertical=True, boards=1),
    "stone": lambda n, *a: t_stone(n, *(a or ["8d8a86"])),
    "stone_dark": lambda n, *a: t_stone(n, "6a6662", 4, "3e3a36"),
    "stone_warm": lambda n, *a: t_stone(n, "a08c74", 4, "5e5040"),
    "stone_big": lambda n, *a: t_stone(n, "8d8a86", 2),
    "cobble": lambda n, *a: t_cobble(n, *(a or ["8a8580"])),
    "plaster": lambda n, *a: t_plaster(n, *(a or ["e8dcc0"])),
    "metal": lambda n, *a: t_metal(n, *(a or ["4a4d55"])),
    "metal_plain": lambda n, *a: t_metal(n, a[0] if a else "4a4d55", rivets=False),
    "gold": lambda n, *a: t_gold(n, *(a or ["e2b23c"])),
    "copper": lambda n, *a: t_gold(n, "c4703a"),
    "cloth": lambda n, *a: t_cloth(n, a[0] if a else "3a6ea5"),
    "cloth_stripe": lambda n, *a: t_cloth(n, a[0], "stripe", a[1]),
    "cloth_check": lambda n, *a: t_cloth(n, a[0], "check", a[1]),
    "cloth_trim": lambda n, *a: t_cloth(n, a[0], "trim", a[1]),
    "leather": lambda n, *a: t_leather(n, *(a or ["6b4226"])),
    "skin": lambda n, *a: t_skin(n, *(a or ["f2c49a"])),
    "face": lambda n, *a: t_face(n, a[0], a[1], a[2] if len(a) > 2 else "smile",
                                 True, a[3] if len(a) > 3 else ""),
    "hair": lambda n, *a: t_hair(n, *(a or ["5a3a22"])),
    "hair_front": lambda n, *a: t_hair_front(n, a[0], a[1]),
    "glass": lambda n, *a: t_glass(n, a[0] if a else "d23b3b", float(a[1]) if len(a) > 1 else 0.55),
    "liquid": lambda n, *a: t_liquid(n, *(a or ["7b3fd1"])),
    "books": lambda n, *a: t_books(n),
    "book_cover": lambda n, *a: t_book_cover(n, *(a or ["7a2f2f"])),
    "paper": lambda n, *a: t_paper(n),
    "parchment": lambda n, *a: t_plaster(n, "e6d2a2"),
    "candle": lambda n, *a: t_candle(n),
    "flame": lambda n, *a: t_flame(n),
    "ember": lambda n, *a: t_ember(n),
    "leaves": lambda n, *a: t_leaves(n, *(a or ["4f8a3a"])),
    "herb": lambda n, *a: t_herb(n, a[0] if a else "5fa04a", a[1] if len(a) > 1 else None),
    "dirt": lambda n, *a: t_dirt(n),
    "grass": lambda n, *a: t_grass(n),
    "rug": lambda n, *a: t_rug(n, *a),
    "rug_border": lambda n, *a: t_rug_border(n, *a),
    "window": lambda n, *a: t_window(n),
    "crate": lambda n, *a: t_crate(n),
    "barrel": lambda n, *a: t_barrel(n),
    "solid": lambda n, *a: t_solid(n, a[0]),
    "gem": lambda n, *a: t_gem(n, *(a or ["4ad0e0"])),
    "sign": lambda n, *a: t_sign(n),
    "cauldron": lambda n, *a: t_cauldron(n),
    "bubble": lambda n, *a: t_bubble(n, *(a or ["ffffff"])),
    "stars": lambda n, *a: t_stars(n, *a),
    "scale": lambda n, *a: t_scale(n, *a),
}


def paint_tile(name):
    parts = name.split(":")
    fn = PAINTERS.get(parts[0])
    if fn is None:
        raise KeyError("Unknown tile painter: " + name)
    arr = fn(name, *parts[1:])
    assert arr.shape == (TILE, TILE, 4), name
    return arr


def build_atlas(tile_names):
    rows = max(1, (len(tile_names) + ATLAS_COLS - 1) // ATLAS_COLS)
    assert rows <= ATLAS_COLS, "too many tiles"
    atlas = np.zeros((ATLAS_PX, ATLAS_PX, 4), dtype=np.float32)
    for i, name in enumerate(tile_names):
        t = paint_tile(name)
        # extrude borders into the padding
        padded = np.pad(t, ((PAD, PAD), (PAD, PAD), (0, 0)), mode="edge")
        x = (i % ATLAS_COLS) * SLOT
        y = (i // ATLAS_COLS) * SLOT
        atlas[y:y + SLOT, x:x + SLOT] = padded
    # Crop unused rows to keep files small (keep square power-friendly height).
    img = to_image(atlas)
    return img


# ----------------------------------------------------------------- repeating textures
def rep_floor_planks(size=128):
    rng = rng_for("floor")
    base = hexc("a06a3c")
    img = canvas(base, size)
    rows = 4
    rh = size // rows
    for r in range(rows):
        off = int(rng.integers(0, size))
        lengths = []
        x = 0
        while x < size:
            l = int(rng.integers(size // 3, size // 1.5))
            lengths.append((x, min(size, x + l)))
            x += l
        for (x0, x1) in lengths:
            tint = 0.82 + rng.random() * 0.3
            col = shade(base, tint) * np.array([1.0, 0.98 + rng.random() * 0.04, 0.95])
            n = value_noise(rng, size, 2, 3)
            for y in range(r * rh, r * rh + rh):
                g = 0.88 + 0.2 * np.sin((y * 1.7 + n[y, :] * 12)) * 0.5
                xs = (np.arange(x0, x1) + off) % size
                img[y, xs, :3] = col * g[xs, None]
            # board end
            xe = (x1 + off) % size
            img[r * rh:r * rh + rh, xe, :3] = shade(col, 0.45)
            # nails
            for yy in (r * rh + 3, r * rh + rh - 4):
                for xx in ((x0 + off + 3) % size, (x1 + off - 4) % size):
                    img[yy, xx, :3] = shade(base, 0.3)
        img[r * rh, :, :3] = shade(base, 0.4)
        img[r * rh + 1, :, :3] *= 1.12
    img = speckle(img, rng, 0.04, 0.1)
    return np.clip(img, 0, 255)


def rep_stone_wall(size=128):
    rng = rng_for("stonewall")
    base = hexc("8f8b84")
    m = hexc("4e4a44")
    img = canvas(m, size)
    rows = 8
    rh = size // rows
    for r in range(rows):
        off = int(rng.integers(0, size))
        x = 0
        while x < size:
            w = int(rng.integers(14, 30))
            if x + w > size - 8:
                w = size - x
            tint = 0.8 + rng.random() * 0.35
            hue = (rng.random() - 0.5) * 0.12
            col = shade(base, tint) * np.array([1 + hue, 1, 1 - hue])
            for yy in range(r * rh + 1, r * rh + rh):
                xs = (np.arange(x + 1, x + w) + off) % size
                img[yy, xs, :3] = col
            xs = (np.arange(x + 1, x + w) + off) % size
            img[r * rh + 1, xs, :3] = shade(col, 1.2)
            img[r * rh + rh - 1, xs, :3] = shade(col, 0.72)
            img[r * rh + 1:r * rh + rh, (x + 1 + off) % size, :3] = shade(col, 1.1)
            x += w
    img = apply_noise(img, rng, 0.1, 4)
    img = speckle(img, rng, 0.12, 0.2)
    # moss
    for _ in range(25):
        x, y = rng.integers(0, size, 2)
        img[y, x, :3] = np.array([90, 120, 70.0])
    return np.clip(img, 0, 255)


def rep_plaster_wall(size=128):
    rng = rng_for("plasterwall")
    img = canvas(hexc("e6d8b8"), size)
    img = apply_noise(img, rng, 0.07, 3)
    img = speckle(img, rng, 0.08, 0.06)
    # a few cracks
    for _ in range(3):
        x, y = rng.integers(0, size, 2)
        for i in range(10):
            img[(y + i) % size, (x + int(rng.integers(-1, 2)) + i // 3) % size, :3] *= 0.8
    return np.clip(img, 0, 255)


def rep_cobble(size=128):
    rng = rng_for("cobble_street")
    t = np.zeros((size, size, 4), dtype=np.float32)
    for y in range(0, size, TILE):
        for x in range(0, size, TILE):
            t[y:y + TILE, x:x + TILE] = t_cobble("cobble%d_%d" % (x, y), "8c8478")
    return t


def rep_grass(size=128):
    t = np.zeros((size, size, 4), dtype=np.float32)
    for y in range(0, size, TILE):
        for x in range(0, size, TILE):
            t[y:y + TILE, x:x + TILE] = t_grass("grass%d_%d" % (x, y))
    rng = rng_for("flowers")
    for _ in range(30):
        x, y = rng.integers(1, size - 2, 2)
        c = [np.array([240, 220, 90.0]), np.array([240, 240, 240.0]), np.array([220, 110, 160.0])][int(rng.integers(0, 3))]
        t[y, x, :3] = c
        t[y + 1, x, :3] = shade(c, 0.7)
    return t


def rep_timber(size=128):
    """Plaster with timber framing (vertical + horizontal beams) for upper walls."""
    img = rep_plaster_wall(size)
    beam = t_wood("timberbeam", "5a3820", boards=1)
    bw = 12
    for x0 in (0,):
        for y in range(size):
            img[y, x0:x0 + bw, :3] = beam[y % TILE, :bw, :3]
    return img


REPEATS = {
    "floor": rep_floor_planks,
    "stone_wall": rep_stone_wall,
    "plaster_wall": rep_plaster_wall,
    "cobble": rep_cobble,
    "grass": rep_grass,
    "timber": rep_timber,
}


_rep_cache = {}


def build_repeat(name):
    if name not in _rep_cache:
        _rep_cache[name] = to_image(REPEATS[name]())
    return _rep_cache[name]
