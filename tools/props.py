"""Shop environment and furniture models.

Room coordinates: the interior floor spans X 0..ROOM_W and Y 0..ROOM_D with
the floor surface at Z = 0. Walls are outside that rectangle. The entrance is
a gap in the front (south) knee wall between DOOR_X0 and DOOR_X1.
Furniture models have their origin at the bottom center of their footprint
and face +Y (south, towards the camera) unless noted.
"""

import math

import numpy as np

from modeler import Model

ROOM_W = 640
ROOM_D = 880
WALL_T = 24
BACK_H = 210
SIDE_H = 150
FRONT_H = 34
DOOR_X0 = 270
DOOR_X1 = 370

INGREDIENT_COLORS = {
    "redleaf": "d0342c",
    "moonwater": "8fd3ff",
    "sunroot": "f29a2e",
    "sparkdust": "ffe45c",
    "bluecap": "3a6fe0",
    "ironroot": "8a7a6a",
    "swiftmint": "4fd18a",
}

POTION_COLORS = {
    "healing": "e0303a",
    "energy": "ffb020",
    "mana": "3a7cff",
    "strength": "a0522d",
    "speed": "39d98a",
}


# ------------------------------------------------------------------ helpers
def rug(m, x, y, w, d, base="8e2f3a", accent="e0b04a", inner="2f4f7a"):
    m.box(x, y, -1, w, d, 1.6, {"top": "rug:%s:%s:%s" % (base, accent, inner), "side": "solid:" + base},
          faces=["top", "north", "south", "east", "west"], ao=False)


def bottle(m, cx, cy, z, color, h=12, w=7, node="root", kind="round"):
    """Small potion bottle with a cork."""
    g = "glass:%s:0.6" % color
    if kind == "tall":
        m.box(cx - w / 2 + 1, cy - w / 2 + 1, z, w - 2, w - 2, h, {"all": g, "top": "solid:" + color}, node=node)
        m.box(cx - 1.5, cy - 1.5, z + h, 3, 3, 3, {"all": "glass:%s:0.1" % color}, node=node)
        m.box(cx - 1.8, cy - 1.8, z + h + 3, 3.6, 3.6, 2, {"all": "wood_light"}, node=node)
    elif kind == "flask":
        m.box(cx - w / 2, cy - w / 2, z, w, w, h * 0.55, {"all": g, "top": "solid:" + color}, node=node)
        m.box(cx - w / 2 + 1.5, cy - w / 2 + 1.5, z + h * 0.55, w - 3, w - 3, h * 0.2, {"all": g}, node=node)
        m.box(cx - 1.5, cy - 1.5, z + h * 0.75, 3, 3, h * 0.25, {"all": "glass:%s:0.1" % color}, node=node)
        m.box(cx - 1.8, cy - 1.8, z + h, 3.6, 3.6, 2, {"all": "wood_light"}, node=node)
    else:
        m.box(cx - w / 2, cy - w / 2, z, w, w, h * 0.7, {"all": g, "top": "solid:" + color}, node=node)
        m.box(cx - 1.5, cy - 1.5, z + h * 0.7, 3, 3, h * 0.3, {"all": "glass:%s:0.15" % color}, node=node)
        m.box(cx - 1.8, cy - 1.8, z + h, 3.6, 3.6, 2, {"all": "wood_light"}, node=node)


def candle(m, cx, cy, z, h=8, node="root"):
    m.box(cx - 2, cy - 2, z, 4, 4, h, {"all": "candle", "top": "candle"}, node=node)
    m.box(cx - 1, cy - 1, z + h, 2, 2, 3.5, {"all": "flame"}, node=node, unlit=True, ao=False)


def herb_bundle(m, cx, cy, z, color, node="root"):
    m.box(cx - 0.5, cy - 0.5, z, 1, 1, 5, {"all": "solid:6b4a2a"}, node=node)
    m.box(cx - 3, cy - 2, z - 9, 6, 4, 9, {"all": "herb:%s" % color, "bottom": "herb:%s" % color}, node=node)
    m.box(cx - 3.2, cy - 2.2, z - 2, 6.4, 4.4, 1.5, {"all": "solid:c8a050"}, node=node)


def jar(m, cx, cy, z, color, w=10, h=12, node="root"):
    m.box(cx - w / 2, cy - w / 2, z, w, w, h, {"all": "glass:%s:0.7" % color, "top": "solid:" + color}, node=node)
    m.box(cx - w / 2 - 0.5, cy - w / 2 - 0.5, z + h, w + 1, w + 1, 2.5, {"all": "wood"}, node=node)


# ------------------------------------------------------------------ room
def build_room():
    m = Model("room")
    W, D, T = ROOM_W, ROOM_D, WALL_T
    # Floor
    m.box(-T, -T, -12, W + 2 * T, D + 2 * T, 11, {"top": "rep:floor", "side": "stone_dark"},
          rep_scale=128, faces=["top", "south"])
    # Back wall: stone base, plaster upper with timber frame
    m.box(-T, -T, 0, W + 2 * T, T, 72, {"south": "rep:stone_wall", "top": "beam", "side": "stone"},
          rep_scale=96, faces=["south", "east", "west"])
    m.box(-T, -T, 72, W + 2 * T, T - 3, BACK_H - 72, {"south": "rep:plaster_wall", "top": "beam", "side": "plaster"},
          rep_scale=128, faces=["south", "top", "east", "west"])
    # Timber posts and beams on the back wall
    for x in (-T, 150, 490, W + T - 14):
        m.box(x, -T + 18, 72, 14, 9, BACK_H - 72, {"all": "beam_v", "top": "beam"})
    m.box(-T, -T + 18, 70, W + 2 * T, 10, 10, {"all": "beam", "top": "wood_dark"})  # chair rail
    m.box(-T, -T + 16, BACK_H - 14, W + 2 * T, 12, 14, {"all": "beam", "top": "wood_dark"})  # top beam
    # Diagonal braces
    for (x, flip) in ((164, 1), (476, -1)):
        m.box(x if flip > 0 else x - 60, -T + 19, 120, 60, 7, 9, {"all": "beam"},
              rot=(0, flip * 32, 0))
    # Windows on the back wall (glowing panes)
    for wx in (232, 352):
        m.box(wx - 4, -T + 16, 100, 64, 10, 76, {"all": "wood_dark"})
        m.box(wx, -T + 22, 104, 56, 6, 68, {"south": "window", "all": "wood_dark"}, unlit=False)
        m.box(wx + 2, -T + 27.5, 106, 52, 1, 64, {"south": "window"}, unlit=True, faces=["south"], ao=False)
        m.box(wx - 6, -T + 16, 96, 68, 16, 5, {"all": "wood", "top": "wood"})  # sill
        # Flower box
        m.box(wx - 2, 0, 88, 60, 10, 8, {"all": "wood_red"})
        for i in range(6):
            fc = ["e04a6a", "f0d040", "ffffff", "c060e0"][i % 4]
            m.box(wx + 2 + i * 9, 2, 96, 7, 6, 6, {"all": "herb:4f9a3a:" + fc})
    # Side walls
    for (x0, faces_in) in ((-T, "east"), (W, "west")):
        m.box(x0, -T, 0, T, D + 2 * T, 60, {faces_in: "rep:stone_wall", "top": "beam", "side": "stone",
                                             "north": "stone"},
              rep_scale=96, faces=[faces_in, "south"])
        m.box(x0 + (0 if faces_in == "east" else 3), -T, 60, T - 3, D + 2 * T, SIDE_H - 60,
              {faces_in: "rep:plaster_wall", "top": "beam", "side": "plaster"},
              rep_scale=128, faces=[faces_in, "top", "south"])
        xi = x0 + T if faces_in == "east" else x0 - 9
        for y in (-T, 200, 450, 700, D + T - 14):
            m.box(xi if faces_in == "east" else x0 - 6, y, 60, 9, 14, SIDE_H - 60, {"all": "beam_v", "top": "beam"})
        m.box(xi if faces_in == "east" else x0 - 6, -T, 58, 9, D + 2 * T, 10, {"all": "beam", "top": "wood_dark"})
        m.box(x0 - 2, -T, SIDE_H, T + 4, D + 2 * T, 8, {"all": "beam", "top": "wood_dark"})
    # Front knee wall with entrance gap
    for (x0, x1) in ((-T, DOOR_X0), (DOOR_X1, W + T)):
        m.box(x0, D, 0, x1 - x0, T, FRONT_H, {"all": "rep:stone_wall", "top": "wood"}, rep_scale=96,
              faces=["north", "south", "top", "east", "west"])
        m.box(x0 - 1, D - 2, FRONT_H, x1 - x0 + 2, T + 4, 6, {"all": "beam", "top": "wood"})
    # Door posts with lanterns
    for x in (DOOR_X0 - 14, DOOR_X1):
        m.box(x, D - 4, 0, 14, T + 8, 92, {"all": "beam_v", "top": "wood_dark"})
        m.box(x - 2, D - 6, 0, 18, T + 12, 10, {"all": "stone"})
        m.box(x + 1, D + T + 4, 70, 12, 12, 16, {"all": "metal"})
        m.box(x + 3, D + T + 6, 72, 8, 8, 12, {"all": "flame"}, unlit=True, ao=False)
        m.box(x, D + T + 3, 86, 14, 14, 3, {"all": "metal_plain"})
    # Doormat
    m.box(DOOR_X0 + 6, D - 30, -0.8, DOOR_X1 - DOOR_X0 - 12, 48, 1.2,
          {"top": "cloth_stripe:8a5a2a:c09050", "side": "solid:8a5a2a"}, ao=False)
    # Aisle runner rug
    for y in range(380, 840, 80):
        rug(m, 288, y, 64, 80, "7a2a3a", "d8a848", "2f4a6a")
    # Big rug in the brewing area
    for x in range(200, 440, 80):
        rug(m, x, 120, 80, 100, "2f4a6a", "d8a848", "6a2a4a")
    # Hanging herb bundles along the back wall
    for i, x in enumerate(range(20, 620, 46)):
        if 220 < x < 420:
            continue
        herb_bundle(m, x, -T + 32, 190, ["5fa04a", "a04a4a", "8a9a3a", "4a8a6a"][i % 4])
    # Wall shelf with jars above the counter (left wall)
    m.box(0, 300, 90, 12, 160, 5, {"all": "wood", "top": "wood"})
    for i, y in enumerate(range(312, 450, 22)):
        jar(m, 7, y, 95, ["d0342c", "3a6fe0", "4fd18a", "ffe45c", "c060e0", "8fd3ff", "f29a2e"][i % 7], w=9, h=11)
    # Right wall: framed starry painting and sconces
    m.box(W - 6, 520, 80, 6, 90, 56, {"all": "wood_dark"})
    m.box(W - 7.5, 526, 86, 2, 78, 44, {"west": "stars:243060:ffe27a"}, faces=["west"])
    for y in (250, 700):
        m.box(W - 8, y - 4, 96, 8, 8, 4, {"all": "metal"})
        candle(m, W - 4, y, 100, 7)
    for y in (250, 700):
        m.box(-0.1, y - 4, 96, 8, 8, 4, {"all": "metal"})
        candle(m, 4, y, 100, 7)
    return m


def build_exterior():
    m = Model("exterior")
    W, D, T = ROOM_W, ROOM_D, WALL_T
    # Grass all around
    m.box(-700, -400, -14, W + 1400, D + 1100, 12, {"top": "rep:grass", "side": "dirt"}, rep_scale=128,
          faces=["top"])
    # Street
    m.box(-700, D + T + 60, -2.2, W + 1400, 110, 1, {"top": "rep:cobble", "side": "stone"}, rep_scale=96,
          faces=["top"])
    m.box(-700, D + T + 56, -2.4, W + 1400, 4, 1.6, {"all": "stone_dark"}, faces=["top"])
    m.box(-700, D + T + 170, -2.4, W + 1400, 4, 1.6, {"all": "stone_dark"}, faces=["top"])
    # Path to the door
    m.box(DOOR_X0 - 6, D + T, -2.2, DOOR_X1 - DOOR_X0 + 12, 62, 1, {"top": "rep:cobble"}, rep_scale=96,
          faces=["top"])
    # Fences in front of the shop
    for (x0, x1) in ((-T - 10, DOOR_X0 - 30), (DOOR_X1 + 30, W + T + 10)):
        x = x0
        while x <= x1:
            m.box(x, D + T + 30, -2, 6, 6, 26, {"all": "wood_v", "top": "wood_end" if False else "wood_light"})
            x += 36
        for z in (6, 16):
            m.box(x0, D + T + 31, z, x1 - x0, 4, 4, {"all": "wood_light"})
    # Bushes and flowers along the front wall
    for x in (-T + 20, 60, 120, 180, 230, DOOR_X1 + 50, 440, 500, 560, W + 4):
        h = 14 + (x * 7) % 9
        m.box(x - 14, D + T + 2, -2, 28, 22, h, {"all": "leaves:4a8a3a", "top": "leaves:5a9a42"})
        m.box(x - 9, D + T + 6, h - 2, 18, 14, 7, {"all": "herb:5a9a42:e04a6a"})
    # Lamp posts along the street
    for x in (-90, W + 90):
        m.box(x - 5, D + T + 180, -2, 10, 10, 120, {"all": "metal_plain"})
        m.box(x - 9, D + T + 176, -2, 18, 18, 10, {"all": "stone"})
        m.box(x - 8, D + T + 177, 118, 16, 16, 20, {"all": "metal"})
        m.box(x - 6, D + T + 179, 120, 12, 12, 16, {"all": "flame"}, unlit=True, ao=False)
        m.box(x - 10, D + T + 175, 138, 20, 20, 4, {"all": "metal_plain"})
    # Trees at the sides of the shop
    for (x, y) in ((-140, 120), (-120, 520), (W + 130, 260), (W + 150, 700), (-160, 860), (W + 150, 960)):
        m.box(x - 8, y - 8, -2, 16, 16, 70, {"all": "wood_v_dark", "top": "wood_dark"})
        for (dx, dy, dz, s) in ((0, 0, 60, 70), (-14, 10, 90, 52), (12, -8, 110, 44), (0, 0, 130, 30)):
            m.box(x + dx - s / 2, y + dy - s / 2, dz, s, s, s * 0.6, {"all": "leaves:3f7a32", "top": "leaves:4f8a3a"})
    # Signpost beside the path
    m.box(DOOR_X0 - 60, D + T + 40, -2, 8, 8, 70, {"all": "beam_v"})
    m.box(DOOR_X0 - 100, D + T + 46, 52, 90, 4, 34, {"south": "sign", "all": "wood"})
    # Barrels and crates outside
    for (x, y) in ((W - 30, D + T + 34), (W - 60, D + T + 40)):
        m.cyl(x, y, -2, 12, 30, {"side": "barrel", "top": "wood_light"}, segments=10)
    return m


# ------------------------------------------------------------------ furniture
def build_cauldron():
    """Round iron cauldron on a stone fire pit. The liquid is a separate model."""
    m = Model("cauldron")
    # Stone fire pit (ring of blocks) with logs, embers and flames
    for k in range(10):
        a = 2 * math.pi * k / 10
        x, y = 30 * math.cos(a), 30 * math.sin(a)
        m.box(x - 7, y - 7, 0, 14, 14, 8 + (k % 2) * 2, {"all": "stone_big", "top": "stone"}, rot=(0, 0, math.degrees(a)))
    m.disc(0, 0, 0.5, 26, "ember", segments=12, unlit=True)
    m.box(-22, -4, 2, 44, 8, 7, {"all": "solid:5a3a20", "east": "solid:c8a070", "west": "solid:c8a070"}, rot=(0, 0, 20))
    m.box(-4, -22, 2, 8, 44, 7, {"all": "solid:4a3018", "north": "solid:c8a070", "south": "solid:c8a070"}, rot=(0, 0, 20))
    for (x, y, h) in ((-16, 14, 13), (-6, 19, 17), (8, 17, 14), (17, 10, 11), (-15, -14, 11), (13, -14, 13), (0, -18, 10)):
        m.box(x - 3, y - 3, 5, 6, 6, h, {"all": "flame"}, unlit=True, ao=False)
    # Three stubby legs
    for k in range(3):
        a = 2 * math.pi * k / 3 + 0.5
        m.box(19 * math.cos(a) - 3, 19 * math.sin(a) - 3, 2, 6, 6, 14, {"all": "metal_plain:2e3036"})
    # Pot: bulging body, neck and a thick rim
    pot = "cauldron"
    m.lathe(0, 0, [(12, 12), (16, 22), (22, 28), (31, 31), (40, 29), (46, 26)], pot, segments=16)
    m.disc(0, 0, 12, 12, "metal_plain:2e3036", segments=16)
    m.lathe(0, 0, [(46, 26), (49, 31), (54, 31)], "metal_plain:4a4e58", segments=16)
    m.ring(0, 0, 54, 24, 31, "metal_plain:5a5e68", segments=16)
    m.lathe(0, 0, [(38, 24), (54, 24)], "metal_plain:1e1e24", segments=16, inward=True)
    m.disc(0, 0, 38, 24, "solid:1a1418", segments=16)
    # Riveted metal bands
    m.lathe(0, 0, [(24, 29.2), (27, 30.6)], "metal:6a6e78", segments=16)
    m.lathe(0, 0, [(35, 30.6), (38, 29.8)], "metal:6a6e78", segments=16)
    # Ring handles
    for sx in (-1, 1):
        m.box(sx * 32 - 2, -6, 40, 4, 12, 3, {"all": "metal_plain:4a4e58"})
        m.box(sx * 34 - 1.5, -6, 31, 3, 3, 10, {"all": "metal_plain:4a4e58"})
        m.box(sx * 34 - 1.5, 3, 31, 3, 3, 10, {"all": "metal_plain:4a4e58"})
    # Wooden ladle leaning in the pot
    m.box(6, -4, 42, 4, 4, 36, {"all": "wood_light"}, rot=(0, 20, 0), pivot=(8, -2, 42))
    return m


def build_liquid():
    """Round liquid surface for the cauldron (white, tinted per potion at runtime)."""
    m = Model("liquid")
    m.disc(0, 0, 0, 24, "liquid:e8e8e8", segments=16, unlit=True)
    m.lathe(0, 0, [(-3, 24), (0, 24)], "liquid:c8c8c8", segments=16, unlit=True)
    return m


def build_held_bottle():
    """Potion bottle carried by workers (liquid tinted per potion at runtime)."""
    m = Model("held_bottle")
    m.lathe(0, 0, [(0, 4.5), (2, 6), (7, 6), (10, 4)], "glass:ffffff:0.1", segments=10)
    m.lathe(0, 0, [(0.3, 4.2), (1.8, 5.6), (6.2, 5.6)], "solid:ffffff", segments=10, unlit=True)
    m.disc(0, 0, 6.2, 5.6, "solid:ffffff", segments=10, unlit=True)
    m.cyl(0, 0, 10, 2.2, 4, {"side": "glass:ffffff:0.1", "top": "glass:ffffff:0.1"}, segments=8)
    m.cyl(0, 0, 14, 2.6, 2.5, {"side": "wood_light", "top": "wood_light"}, segments=8)
    return m


def build_table(m=None):
    m = m or Model("table")
    # Round-ish blocky table top with tablecloth
    m.box(-26, -20, 24, 52, 40, 5, {"all": "wood", "top": "wood"})
    m.box(-20, -26, 24, 40, 52, 5, {"all": "wood", "top": "wood"})
    m.box(-18, -18, 29, 36, 36, 1, {"top": "cloth_trim:e8dcc0:a33a3a", "side": "solid:e8dcc0"})
    # Pedestal and feet
    m.box(-5, -5, 4, 10, 10, 20, {"all": "wood_v_dark"})
    m.box(-18, -4, 0, 36, 8, 5, {"all": "wood_dark"})
    m.box(-4, -18, 0, 8, 36, 5, {"all": "wood_dark"})
    # Candle in a holder and a small bottle
    m.box(-12, -12, 30, 8, 8, 2, {"all": "copper"})
    candle(m, -8, -8, 32, 7)
    m.box(4, -2, 30, 10, 2, 7, {"all": "book_cover:3a5a8a"})
    return m


def build_chair(m=None):
    m = m or Model("chair")
    # Seat (top at z = 11), legs, back on the north side
    m.box(-11, -11, 8, 22, 22, 3, {"all": "wood_light", "top": "wood_light"})
    m.box(-9, -9, 11, 18, 18, 1, {"top": "cloth:a33a3a", "side": "solid:a33a3a"})
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.box(sx * 8 - 2, sy * 8 - 2, 0, 4, 4, 8, {"all": "wood_v"})
    m.box(-11, -14, 0, 4, 4, 38, {"all": "wood_v"})
    m.box(7, -14, 0, 4, 4, 38, {"all": "wood_v"})
    m.box(-11, -14, 22, 22, 3, 14, {"all": "wood_v", "top": "wood_light"})
    m.box(-4, -14.5, 25, 8, 1, 8, {"north": "solid:a33a3a", "south": "solid:a33a3a"})
    return m


def build_table_set():
    """One waiting table with its chair on the north side (seat at y = -36)."""
    m = Model("table_set")
    build_table(m)
    m.offset = (0, -36, 0)
    build_chair(m)
    m.offset = (0, 0, 0)
    return m


def build_table_group(n):
    """Long table for a prestiged shop: n chairs on the north side, 40 px apart in the game."""
    m = Model("table_group_%d" % n)
    sp = 40 / 1.35
    half = (n - 1) * sp / 2 + 26
    m.box(-half, -20, 24, half * 2, 40, 5, {"all": "wood", "top": "wood"})
    m.box(-half + 4, -16, 29, half * 2 - 8, 32, 1, {"top": "cloth_trim:e8dcc0:a33a3a", "side": "solid:e8dcc0"})
    # Trestle legs at both ends and a center brace
    for sx in (-1, 1):
        x = sx * (half - 10)
        m.box(x - 4, -14, 4, 8, 28, 20, {"all": "wood_v_dark"})
        m.box(x - 6, -18, 0, 12, 36, 5, {"all": "wood_dark"})
    m.box(-half + 10, -3, 10, half * 2 - 20, 6, 5, {"all": "wood_v_dark"})
    # Table settings: a plate in front of every chair, candles between them
    for i in range(n):
        x = (i - (n - 1) / 2) * sp
        m.box(x - 6, -14, 30, 12, 10, 1, {"all": "solid:f4efe4"})
        if i < n - 1:
            candle(m, x + sp / 2, 2, 30, 6)
    m.box(-half + 6, 4, 30, 8, 2, 7, {"all": "book_cover:3a5a8a"})
    for i in range(n):
        m.offset = ((i - (n - 1) / 2) * sp, -36, 0)
        build_chair(m)
    m.offset = (0, 0, 0)
    return m


def build_counter():
    m = Model("counter")
    w, d, h = 150, 34, 30
    # Stone base front with wooden panels
    m.box(-w / 2, -d / 2, 0, w, d, h, {"south": "wood_v", "all": "wood_v_dark", "top": "wood"})
    for x in (-72, -36, 0, 36):
        m.box(x + 3, d / 2, 4, 30, 2, h - 10, {"south": "wood_red", "all": "wood_dark"})
    m.box(-w / 2 - 3, -d / 2 - 3, h, w + 6, d + 6, 5, {"all": "wood", "top": "wood_light"})
    # Cash box, scales, bell, bottles
    m.box(-66, -10, h + 5, 22, 16, 11, {"all": "wood_red", "top": "gold"})
    m.box(-62, -10.5, h + 9, 14, 1, 4, {"north": "gold"})
    m.box(-26, -6, h + 5, 4, 4, 20, {"all": "copper"})
    m.box(-38, -4, h + 23, 28, 2, 2, {"all": "copper"})
    m.box(-40, -8, h + 13, 9, 9, 2, {"all": "copper"})
    m.box(-17, -8, h + 13, 9, 9, 2, {"all": "copper"})
    m.box(-14.5, -5.5, h + 15, 4, 4, 4, {"all": "gem:e04a4a"})
    m.box(8, -4, h + 5, 7, 7, 2, {"all": "copper"})
    m.box(9, -3, h + 7, 5, 5, 5, {"all": "gold"})
    bottle(m, 32, -2, h + 5, "e0303a", 14, 8)
    bottle(m, 45, 4, h + 5, "3a7cff", 16, 7, kind="tall")
    bottle(m, 58, -4, h + 5, "39d98a", 14, 9, kind="flask")
    # Open book
    m.box(-4, 4, h + 5, 16, 11, 2, {"top": "paper", "all": "book_cover:6a2a2a"})
    return m


def build_ingredient_shelf():
    m = Model("ingredient_shelf")
    w, d, h = 150, 30, 130
    # Frame
    m.box(-w / 2, -d / 2, 0, 6, d, h, {"all": "wood_v_dark", "top": "wood_dark"})
    m.box(w / 2 - 6, -d / 2, 0, 6, d, h, {"all": "wood_v_dark", "top": "wood_dark"})
    m.box(-w / 2, -d / 2, 0, w, 3, h, {"south": "wood_v", "all": "wood_v_dark"})
    m.box(-w / 2 - 2, -d / 2 - 1, h, w + 4, d + 3, 5, {"all": "wood_dark", "top": "wood"})
    cols = list(INGREDIENT_COLORS.values())
    for i, z in enumerate((4, 44, 84)):
        m.box(-w / 2 + 6, -d / 2 + 3, z - 4, w - 12, d - 3, 4, {"all": "wood", "top": "wood"})
    # Bottom: sacks and crates
    m.box(-66, -10, 0, 30, 24, 26, {"all": "crate"})
    m.box(-30, -8, 0, 26, 22, 22, {"all": "solid:c8b088", "top": "herb:c0302a"})
    m.box(-28, -6, 22, 22, 18, 6, {"all": "solid:c8b088"})
    m.box(2, -8, 0, 26, 22, 22, {"all": "solid:c8b088", "top": "herb:4fd18a"})
    m.box(36, -10, 0, 30, 24, 26, {"all": "crate", "top": "herb:f29a2e"})
    # Middle shelf: jars of ingredients
    for i, x in enumerate(range(-62, 64, 18)):
        c = cols[i % len(cols)]
        jar(m, x, 0, 44, c, w=13, h=16 + (i % 3) * 2)
    # Top shelf: mushrooms, crystals, bundles, small boxes
    m.box(-64, -6, 84, 16, 14, 8, {"all": "wood_light"})
    for (dx, c) in ((-60, "3a6fe0"), (-54, "d0342c")):
        m.box(dx - 3, -2, 92, 6, 6, 4, {"all": "solid:efe6d0"})
        m.box(dx - 5, -4, 96, 10, 10, 4, {"all": "solid:" + c, "top": "solid:" + c})
    for i, x in enumerate((-30, -14)):
        m.box(x - 4, -4, 84, 8, 8, 14 + i * 4, {"all": "gem:ffe45c" if i else "gem:8fd3ff"})
    m.box(0, -10, 84, 30, 20, 12, {"all": "book_cover:5a3a20", "top": "herb:8a9a3a"})
    for i, x in enumerate((42, 58)):
        bottle(m, x, 0, 84, ["8fd3ff", "4fd18a"][i], 18, 10, kind="flask")
    # Hanging labels
    for x in range(-60, 64, 30):
        m.box(x, d / 2 - 1, 40, 12, 1, 6, {"south": "paper", "all": "paper"})
    return m


def build_potion_rack():
    m = Model("potion_rack")
    w, d, h = 150, 26, 140
    m.box(-w / 2, -d / 2, 0, 6, d, h, {"all": "wood_v_dark", "top": "wood_dark"})
    m.box(w / 2 - 6, -d / 2, 0, 6, d, h, {"all": "wood_v_dark", "top": "wood_dark"})
    m.box(-w / 2, -d / 2, 0, w, 3, h, {"south": "wood_v", "all": "wood_v_dark"})
    m.box(-w / 2 - 2, -d / 2 - 1, h, w + 4, d + 3, 5, {"all": "wood_dark", "top": "wood"})
    # Crown with a potion emblem
    m.box(-20, -d / 2, h + 5, 40, 6, 18, {"south": "sign", "all": "wood"})
    pc = list(POTION_COLORS.values()) + ["c060e0", "8fd3ff"]
    kinds = ["round", "tall", "flask"]
    for r, z in enumerate((4, 38, 72, 106)):
        m.box(-w / 2 + 6, -d / 2 + 3, z - 4, w - 12, d - 3, 4, {"all": "wood", "top": "wood"})
        for i, x in enumerate(range(-62, 66, 13)):
            if (i + r) % 5 == 4:
                continue
            c = pc[(i * 3 + r) % len(pc)]
            bottle(m, x, 0, z, c, 14 + ((i + r) % 3) * 3, 8, kind=kinds[(i + r) % 3])
    return m


def build_bookshelf():
    m = Model("bookshelf")
    w, d, h = 110, 24, 150
    m.box(-w / 2, -d / 2, 0, 5, d, h, {"all": "wood_v_dark"})
    m.box(w / 2 - 5, -d / 2, 0, 5, d, h, {"all": "wood_v_dark"})
    m.box(-w / 2, -d / 2, 0, w, 3, h, {"all": "wood_v_dark"})
    m.box(-w / 2 - 2, -d / 2 - 1, h, w + 4, d + 3, 5, {"all": "wood_dark", "top": "wood"})
    for i, z in enumerate((4, 40, 76, 112)):
        m.box(-w / 2 + 5, -d / 2 + 3, z - 4, w - 10, d - 3, 4, {"all": "wood", "top": "wood"})
        if i == 2:
            m.box(-45, -8, z, 40, 16, 30, {"south": "books", "all": "book_cover:5a2a2a", "top": "book_cover:2a4a6a"})
            m.box(0, -6, z, 22, 14, 4, {"all": "book_cover:6a5a2a", "top": "book_cover:6a5a2a"})
            m.box(2, -5, z + 4, 18, 12, 4, {"all": "book_cover:2a5a3a", "top": "book_cover:2a5a3a"})
            m.box(30, -4, z, 8, 8, 10, {"all": "solid:efe6d0"})  # skull-ish candle base
            candle(m, 34, 0, z + 10, 8)
        elif i == 3:
            m.box(-45, -8, z, 50, 16, 30, {"south": "books", "all": "book_cover:2a3a5a", "top": "book_cover:2a3a5a"})
            m.box(14, -2, z, 10, 10, 10, {"all": "gem:c060e0"})
            m.box(28, -6, z, 14, 14, 18, {"all": "glass:4fd18a:0.8", "top": "solid:4fd18a"})
        else:
            m.box(-45, -8, z, 90, 16, 30, {"south": "books", "all": "book_cover:4a2a2a", "top": "book_cover:4a2a2a"})
    return m


def build_barrel():
    m = Model("barrel")
    m.cyl(0, 0, 0, 14, 34, {"side": "barrel", "top": "wood_light"}, segments=10)
    m.cyl(0, 0, 8, 15, 18, {"side": "barrel", "top": "wood_light"}, segments=10, top=False)
    return m


def build_crates():
    m = Model("crates")
    m.box(-22, -16, 0, 30, 30, 26, {"all": "crate"})
    m.box(6, -12, 0, 24, 24, 20, {"all": "crate"})
    m.box(-16, -10, 26, 22, 22, 18, {"all": "crate", "top": "herb:5fa04a:e04a6a"})
    return m


def build_plant():
    m = Model("plant")
    m.box(-10, -10, 0, 20, 20, 14, {"all": "solid:b0603a", "top": "dirt"})
    m.box(-11, -11, 12, 22, 22, 3, {"all": "solid:c0704a"})
    for (dx, dy, dz, s) in ((0, 0, 14, 22), (-6, 4, 26, 16), (6, -4, 30, 14), (0, 0, 38, 10)):
        m.box(dx - s / 2, dy - s / 2, dz, s, s, s * 0.8, {"all": "leaves:4f8a3a", "top": "leaves:5f9a4a"})
    return m


def build_candelabra():
    m = Model("candelabra")
    m.box(-8, -8, 0, 16, 16, 4, {"all": "gold"})
    m.box(-2, -2, 4, 4, 4, 50, {"all": "gold"})
    m.box(-16, -2, 50, 32, 4, 3, {"all": "gold"})
    for x in (-14, 0, 14):
        m.box(x - 3, -3, 53, 6, 6, 2, {"all": "gold"})
        candle(m, x, 0, 55, 9)
    return m


def build_liquid_box():
    """Placeholder-free liquid surface: uses a cube object in GDevelop instead."""
    return None


def build_slot_table():
    """Marker for a slot that can be bought: dashed golden outline and a small easel sign."""
    m = Model("slot_sign")
    half = 38
    dash = 10
    for i in range(-half, half, dash * 2):
        for (x, y, w, d) in ((i, -half, dash, 3), (i, half - 3, dash, 3), (-half, i, 3, dash), (half - 3, i, 3, dash)):
            m.box(x, y, -0.6, w, d, 1.2, {"all": "solid:f0c040"}, unlit=True, ao=False, faces=["top"])
    # Easel
    m.box(-12, -2, 0, 3, 3, 40, {"all": "wood_v"}, rot=(-8, 0, 0), pivot=(-10.5, -0.5, 0))
    m.box(9, -2, 0, 3, 3, 40, {"all": "wood_v"}, rot=(-8, 0, 0), pivot=(10.5, -0.5, 0))
    m.box(-1.5, -10, 0, 3, 3, 38, {"all": "wood_v"}, rot=(14, 0, 0), pivot=(0, -8.5, 0))
    m.box(-16, 1, 18, 32, 2, 24, {"south": "parchment", "all": "wood"})
    m.box(-17, 0.5, 17, 34, 3, 2, {"all": "wood_dark"})
    # Coin emblem and "+" painted on the board
    m.box(-6, 3.1, 24, 12, 0.3, 12, {"south": "gold"}, faces=["south"])
    m.box(-1, 3.5, 26, 2, 0.3, 8, {"south": "solid:8a5a1a"}, faces=["south"])
    m.box(-4, 3.5, 29, 8, 0.3, 2, {"south": "solid:8a5a1a"}, faces=["south"])
    return m


def build_bubble():
    m = Model("bubble")
    m.box(-3, -3, 0, 6, 6, 6, {"all": "bubble"}, unlit=True, ao=False)
    return m


# ------------------------------------------------------------------ garden
def build_garden():
    """The herb garden scene: lawn, low stone wall, path, pond with a well, trees."""
    m = Model("garden")
    W, D = 640, 880
    m.box(-700, -500, -14, W + 1400, D + 1200, 12, {"top": "rep:grass", "side": "dirt"}, rep_scale=128, faces=["top"])
    # Low stone wall around the garden with wooden caps
    for (x, y, w, d) in ((-30, -30, W + 60, 24), (-30, -30, 24, D + 60), (W + 6, -30, 24, D + 60),
                         (-30, D + 6, 290, 24), (380, D + 6, 290, 24)):
        m.box(x, y, -2, w, d, 28, {"all": "rep:stone_wall", "top": "wood"}, rep_scale=96,
              faces=["north", "south", "east", "west", "top"])
        m.box(x - 1, y - 1, 26, w + 2, d + 2, 5, {"all": "beam", "top": "wood"})
    # Gate posts back to the shop
    for x in (250, 380):
        m.box(x - 8, D, -2, 16, 30, 70, {"all": "beam_v", "top": "wood_dark"})
        m.box(x - 6, D + 6, 68, 12, 12, 12, {"all": "flame"}, unlit=True, ao=False)
    m.box(242, D + 2, 70, 154, 14, 10, {"all": "beam", "top": "wood"})
    # Stone path down the middle
    m.box(280, 260, -2.4, 80, D - 230, 1, {"top": "rep:cobble"}, rep_scale=96, faces=["top"])
    # Pond with a stone rim and a well (Moonwater)
    m.box(150, 90, -2.5, 340, 150, 1, {"top": "liquid:5aa0e0"}, unlit=True, faces=["top"], ao=False)
    for (x, y, w, d) in ((140, 80, 360, 12), (140, 238, 360, 12), (140, 80, 12, 170), (488, 80, 12, 170)):
        m.box(x, y, -2, w, d, 8, {"all": "stone_big", "top": "stone"})
    for (x, y) in ((200, 130), (420, 190), (260, 200)):
        m.box(x - 12, y - 8, -1, 24, 16, 2, {"top": "leaves:3f8a3a"}, faces=["top", "north", "south"])
    m.box(300, 120, -2, 40, 40, 26, {"all": "stone_big", "top": "metal_plain:3a3d44"})
    for x in (302, 334):
        m.box(x, 132, 24, 4, 4, 34, {"all": "beam_v"})
    m.box(300, 130, 56, 40, 8, 4, {"all": "beam"})
    m.box(296, 126, 60, 48, 16, 6, {"all": "wood_red", "top": "wood_red"})
    m.box(316, 134, 34, 8, 8, 10, {"all": "barrel"})
    # Trees and shrubs around the edges
    for (x, y, sz) in ((40, 60, 70), (600, 60, 64), (30, 820, 60), (610, 820, 66), (-120, 300, 90), (760, 420, 90),
                       (-140, 700, 80), (780, 760, 84)):
        m.box(x - 8, y - 8, -2, 16, 16, 60, {"all": "wood_v_dark", "top": "wood_dark"})
        for (dx, dy, dz, s2) in ((0, 0, 50, sz), (-10, 8, 80, sz * 0.75), (8, -6, 100, sz * 0.55)):
            m.box(x + dx - s2 / 2, y + dy - s2 / 2, dz, s2, s2, s2 * 0.6, {"all": "leaves:3f7a32", "top": "leaves:4f8a3a"})
    # Flower borders along the side walls
    for y in range(280, 820, 60):
        for x in (14, 612):
            m.box(x - 10, y - 10, -2, 20, 20, 10, {"all": "leaves:4a8a3a", "top": "herb:5a9a42:" + ["e04a6a", "f0d040", "c060e0"][(y // 60) % 3]})
    # Garden shed and tools
    m.box(520, 270, -2, 90, 70, 60, {"south": "wood_v", "all": "wood_v_dark"})
    m.box(512, 262, 58, 106, 86, 8, {"all": "wood_red", "top": "wood_red"})
    m.box(552, 340, -2, 26, 1, 44, {"south": "wood_dark"}, faces=["south"])
    m.box(500, 330, -2, 8, 8, 50, {"all": "wood_light"}, rot=(0, -12, 0), pivot=(504, 334, -2))
    m.cyl(80, 300, -2, 14, 30, {"side": "barrel", "top": "liquid:5aa0e0"}, segments=10)
    # Lanterns on posts
    for (x, y) in ((250, 300), (390, 300), (250, 780), (390, 780)):
        m.box(x - 3, y - 3, -2, 6, 6, 50, {"all": "metal_plain"})
        m.box(x - 6, y - 6, 48, 12, 12, 14, {"all": "metal"})
        m.box(x - 4, y - 4, 50, 8, 8, 10, {"all": "flame"}, unlit=True, ao=False)
    return m


def build_plot():
    m = Model("plot")
    m.box(-44, -44, -2, 88, 88, 7, {"top": "dirt", "side": "dirt"})
    for (x, y, w, d) in ((-48, -48, 96, 8), (-48, 40, 96, 8), (-48, -40, 8, 80), (40, -40, 8, 80)):
        m.box(x, y, -2, w, d, 10, {"all": "wood", "top": "wood_light"})
    for (x, y) in ((-20, -18), (12, 20), (22, -26)):
        m.box(x, y, 5, 5, 4, 2, {"all": "stone"})
    return m


def plant_model(name, kind):
    m = Model(name)
    if kind == "redleaf":
        for (dx, dy, h) in ((-8, -6, 22), (8, -4, 26), (0, 8, 20), (-10, 8, 16), (10, 10, 18)):
            m.box(dx - 1, dy - 1, 0, 2, 2, h - 6, {"all": "solid:4a7a2a"})
            m.box(dx - 6, dy - 2, h - 8, 12, 4, 10, {"all": "herb:c0302a", "top": "herb:d0342c"}, rot=(0, (dx % 3) * 8, dx * 3))
    elif kind == "sunroot":
        for (dx, dy) in ((-10, -6), (8, -8), (0, 8)):
            m.box(dx - 5, dy - 5, 0, 10, 10, 6, {"all": "solid:f29a2e", "top": "solid:f0b050"})
            for k in (-3, 0, 3):
                m.box(dx + k - 1, dy - 1, 6, 2, 2, 16 + k, {"all": "leaves:5fb04a"})
    elif kind == "sparkdust":
        for (dx, dy, h) in ((0, 0, 26), (-10, 6, 16), (10, 4, 18), (4, -10, 14)):
            m.box(dx - 3, dy - 3, 0, 6, 6, h, {"all": "gem:ffe45c"}, unlit=True)
        m.box(-14, -14, 0, 28, 28, 3, {"all": "solid:c8a050"})
    elif kind == "bluecap":
        for (dx, dy, h, r) in ((0, 0, 18, 12), (-12, 8, 10, 8), (12, 6, 12, 8)):
            m.box(dx - 2.5, dy - 2.5, 0, 5, 5, h, {"all": "solid:efe6d0"})
            m.box(dx - r, dy - r, h, r * 2, r * 2, r * 0.7, {"all": "solid:3a6fe0", "top": "herb:3a6fe0:ffffff"})
    elif kind == "ironroot":
        m.box(-4, -4, 0, 8, 8, 24, {"all": "wood_v_dark"}, rot=(8, 6, 0), pivot=(0, 0, 0))
        m.box(-12, -3, 0, 12, 5, 6, {"all": "wood_v_dark"}, rot=(0, -20, 0), pivot=(0, 0, 0))
        m.box(2, -3, 0, 12, 5, 7, {"all": "wood_v_dark"}, rot=(0, 25, 0), pivot=(0, 0, 0))
        m.box(-3, -3, 20, 6, 6, 4, {"all": "metal_plain:a0a8b8"})
    elif kind == "swiftmint":
        for (dx, dy, h) in ((-8, 0, 26), (6, -6, 30), (4, 8, 22), (-6, -10, 20)):
            m.box(dx - 1, dy - 1, 0, 2, 2, h, {"all": "solid:2f7a4a"})
            for z in range(8, h, 7):
                m.box(dx - 6, dy - 2, z, 12, 4, 4, {"all": "leaves:4fd18a"})
    elif kind == "starbloom":
        m.box(-1.5, -1.5, 0, 3, 3, 26, {"all": "solid:2f7a4a"})
        m.box(-8, -2, 8, 8, 4, 3, {"all": "leaves:4fa060"})
        for (dx, dz, w, h) in ((0, 34, 22, 8), (0, 30, 8, 16), (-7, 30, 6, 6), (7, 30, 6, 6)):
            m.box(dx - w / 2, -2, dz - h / 2 + 2, w, 4, h, {"all": "gem:ffd640"}, unlit=True)
        m.box(-3, -3, 31, 6, 6, 6, {"all": "solid:fffae0"}, unlit=True)
    elif kind == "glowcap":
        for (dx, dy, h, r) in ((0, 0, 20, 12), (-11, 8, 10, 7)):
            m.box(dx - 2.5, dy - 2.5, 0, 5, 5, h, {"all": "solid:dcfaf5"}, unlit=True)
            m.box(dx - r, dy - r, h, r * 2, r * 2, r * 0.7, {"all": "gem:3cdcd2"}, unlit=True)
    elif kind == "frostberry":
        for (dx, dy, h) in ((-8, -4, 20), (8, -6, 24), (0, 8, 18)):
            m.box(dx - 1, dy - 1, 0, 2, 2, h, {"all": "solid:2f6a4a"})
            m.box(dx - 6, dy - 2, h - 10, 12, 4, 4, {"all": "leaves:5fa080"})
            for (bx, bz) in ((-3, h - 2), (3, h), (0, h + 4)):
                m.box(dx + bx - 2.5, dy - 2.5, bz, 5, 5, 5, {"all": "gem:8cd0ff"}, unlit=True)
    elif kind == "emberpepper":
        for (dx, dy, h) in ((-8, -4, 22), (8, 2, 26)):
            m.box(dx - 1, dy - 1, 0, 2, 2, h, {"all": "solid:3a7a2a"})
            m.box(dx - 7, dy - 2, h - 12, 14, 4, 4, {"all": "leaves:4f9a3a"})
            m.box(dx - 3, dy - 3, h - 8, 6, 6, 9, {"all": "gem:ff5a20"}, unlit=True)
            m.box(dx - 1, dy - 1, h + 1, 2, 2, 2, {"all": "solid:3a7a2a"})
    elif kind == "shadowmoss":
        for (dx, dy, r, h) in ((0, 0, 14, 8), (-10, 8, 9, 6), (11, 7, 8, 5), (6, -11, 7, 5)):
            m.box(dx - r, dy - r, 0, r * 2, r * 2, h, {"all": "leaves:5a3c80", "top": "herb:6a4a96:c8a8ff"})
        for (dx, dy) in ((-4, -2), (8, 4), (-10, 10)):
            m.box(dx - 1.5, dy - 1.5, 8, 3, 3, 3, {"all": "solid:d8b8ff"}, unlit=True)
    elif kind == "luckyclover":
        for (dx, dy, h) in ((-8, -4, 14), (6, -6, 18), (2, 8, 12), (-6, 9, 10)):
            m.box(dx - 1, dy - 1, 0, 2, 2, h, {"all": "solid:2f7a4a"})
            for (lx, ly) in ((-3, -3), (3, -3), (-3, 3), (3, 3)):
                m.box(dx + lx - 3, dy + ly - 3, h, 6, 6, 1.5, {"all": "leaves:5ac85a"})
    elif kind == "dragonscale":
        m.box(-12, -12, 0, 24, 24, 4, {"all": "stone"})
        for (dx, dy, h, a) in ((0, 0, 30, 0), (-9, 4, 20, -18), (9, 3, 22, 18), (2, -9, 16, 10)):
            m.box(dx - 4, dy - 1.5, 2, 8, 3, h, {"all": "gem:d03a28"}, rot=(0, a, 0), pivot=(dx, dy, 2), unlit=True)
            m.box(dx - 2, dy - 2, 2 + h - 6, 4, 4, 6, {"all": "gem:ffc040"}, rot=(0, a, 0), pivot=(dx, dy, 2),
                  unlit=True)
    return m


PLANTS = ["redleaf", "sunroot", "sparkdust", "bluecap", "ironroot", "swiftmint", "starbloom", "glowcap",
          "frostberry", "emberpepper", "shadowmoss", "luckyclover", "dragonscale"]


BUILDERS = {
    "room": build_room,
    "exterior": build_exterior,
    "cauldron": build_cauldron,
    "table_set": build_table_set,
    "counter": build_counter,
    "ingredient_shelf": build_ingredient_shelf,
    "potion_rack": build_potion_rack,
    "bookshelf": build_bookshelf,
    "barrel": build_barrel,
    "crates": build_crates,
    "plant": build_plant,
    "candelabra": build_candelabra,
    "slot_sign": build_slot_table,
    "liquid": build_liquid,
    "held_bottle": build_held_bottle,
    "garden": build_garden,
    "plot": build_plot,
}
for _n in range(2, 6):
    BUILDERS["table_group_%d" % _n] = (lambda n=_n: build_table_group(n))
for _k in PLANTS:
    BUILDERS["plant_" + _k] = (lambda k=_k: plant_model("plant_" + k, k))
