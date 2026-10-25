"""Generate the 2D interface art for Potion Shop (icons, panels, progress ring)."""

import math
import os

from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "ui")
SS = 4  # supersampling factor
OUTLINE = (43, 27, 23, 255)


def new(w, h):
    return Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))


def done(img, w, h):
    return img.resize((w, h), Image.LANCZOS)


def S(v):
    return v * SS


def poly(d, pts, fill, outline=OUTLINE, width=3):
    d.polygon([(S(x), S(y)) for x, y in pts], fill=fill)
    if outline:
        d.line([(S(x), S(y)) for x, y in pts + [pts[0]]], fill=outline, width=S(width), joint="curve")


def ellipse(d, box, fill, outline=OUTLINE, width=3):
    d.ellipse([S(v) for v in box], fill=fill, outline=outline, width=S(width) if outline else 0)


def rrect(d, box, r, fill, outline=OUTLINE, width=3):
    d.rounded_rectangle([S(v) for v in box], radius=S(r), fill=fill, outline=outline,
                        width=S(width) if outline else 0)


def lighten(c, f):
    return tuple(min(255, int(v + (255 - v) * f)) for v in c[:3]) + (255,)


def darken(c, f):
    return tuple(int(v * (1 - f)) for v in c[:3]) + (255,)


def hexc(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def shine(d, box):
    x0, y0, x1, y1 = box
    d.ellipse([S(x0), S(y0), S(x1), S(y1)], fill=(255, 255, 255, 150))


# --------------------------------------------------------------- potions
def potion_icon(kind, color):
    img = new(96, 96)
    d = ImageDraw.Draw(img)
    c = hexc(color)
    light = lighten(c, 0.45)
    dark = darken(c, 0.35)
    glass = (210, 235, 245, 255)
    if kind == "round":  # healing: round flask
        rrect(d, (38, 10, 58, 30), 3, glass)
        ellipse(d, (16, 26, 80, 90), glass)
        d.pieslice([S(19), S(29), S(77), S(87)], 0, 180, fill=c)
        d.rectangle([S(19), S(52), S(77), S(58)], fill=c)
        ellipse(d, (16, 26, 80, 90), None)
        # heart emblem
        poly(d, [(48, 76), (36, 64), (36, 58), (42, 54), (48, 58), (54, 54), (60, 58), (60, 64)], (255, 240, 240, 255),
             outline=dark, width=2)
    elif kind == "bolt":  # energy: tall bottle with lightning
        rrect(d, (40, 6, 56, 24), 3, glass)
        rrect(d, (24, 22, 72, 90), 12, glass)
        rrect(d, (27, 44, 69, 87), 9, c, outline=None)
        rrect(d, (24, 22, 72, 90), 12, None)
        poly(d, [(52, 48), (38, 68), (48, 68), (42, 84), (60, 60), (50, 60), (56, 48)], (255, 250, 200, 255),
             outline=dark, width=2)
    elif kind == "vial":  # mana: triangle flask with star
        rrect(d, (40, 6, 56, 26), 3, glass)
        poly(d, [(40, 24), (56, 24), (82, 86), (14, 86)], glass)
        poly(d, [(31, 52), (65, 52), (78, 83), (18, 83)], c, outline=None)
        poly(d, [(40, 24), (56, 24), (82, 86), (14, 86)], None)
        cx, cy, r = 48, 68, 10
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            rr = r if i % 2 == 0 else r * 0.45
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        poly(d, pts, (255, 245, 180, 255), outline=dark, width=2)
    elif kind == "square":  # strength: square bottle with fist shape
        rrect(d, (38, 8, 58, 26), 3, glass)
        rrect(d, (18, 24, 78, 90), 6, glass)
        rrect(d, (21, 42, 75, 87), 4, c, outline=None)
        rrect(d, (18, 24, 78, 90), 6, None)
        rrect(d, (34, 54, 62, 78), 5, (255, 225, 190, 255), outline=dark, width=2)
        for i in range(3):
            d.line([S(40 + i * 7), S(56), S(40 + i * 7), S(64)], fill=dark, width=S(2))
    elif kind == "wing":  # speed: bottle with wings
        rrect(d, (40, 8, 56, 26), 3, glass)
        ellipse(d, (26, 28, 70, 90), glass)
        d.pieslice([S(29), S(31), S(67), S(87)], 0, 180, fill=c)
        d.rectangle([S(29), S(54), S(67), S(59)], fill=c)
        ellipse(d, (26, 28, 70, 90), None)
        for sx in (-1, 1):
            base = 48 + sx * 20
            poly(d, [(base, 50), (base + sx * 22, 36), (base + sx * 20, 46), (base + sx * 26, 48),
                     (base + sx * 18, 56), (base + sx * 22, 60), (base, 64)], (255, 255, 255, 255), width=2)
    else:  # sludge
        rrect(d, (38, 8, 58, 26), 3, glass)
        ellipse(d, (18, 28, 78, 90), glass)
        d.pieslice([S(21), S(31), S(75), S(87)], 0, 180, fill=c)
        d.rectangle([S(21), S(55), S(75), S(60)], fill=c)
        ellipse(d, (18, 28, 78, 90), None)
        for (x, y) in ((38, 66), (54, 72), (46, 78)):
            ellipse(d, (x - 4, y - 4, x + 4, y + 4), darken(c, 0.4), outline=None)
    # cork + highlight
    rrect(d, (36, 2, 60, 12), 3, (176, 124, 72, 255), width=2)
    shine(d, (26, 36, 34, 52))
    return done(img, 96, 96)


# --------------------------------------------------------------- ingredients
def ingredient_icon(kind):
    img = new(96, 96)
    d = ImageDraw.Draw(img)
    if kind == "redleaf":
        c = hexc("d0342c")
        poly(d, [(48, 8), (74, 30), (78, 56), (60, 78), (48, 88), (36, 78), (18, 56), (22, 30)], c)
        d.line([S(48), S(14), S(48), S(90)], fill=darken(c, 0.4), width=S(3))
        for y in (32, 48, 64):
            d.line([S(48), S(y + 8), S(30), S(y - 4)], fill=darken(c, 0.4), width=S(2))
            d.line([S(48), S(y + 8), S(66), S(y - 4)], fill=darken(c, 0.4), width=S(2))
        shine(d, (28, 30, 34, 42))
    elif kind == "moonwater":
        c = hexc("8fd3ff")
        poly(d, [(48, 6), (70, 44), (74, 60), (66, 80), (48, 90), (30, 80), (22, 60), (26, 44)], c)
        d.pieslice([S(36), S(44), S(64), S(72)], 0, 360, fill=(255, 250, 210, 255))
        d.pieslice([S(42), S(40), S(70), S(68)], 0, 360, fill=c)
        shine(d, (32, 50, 38, 64))
    elif kind == "sunroot":
        c = hexc("f29a2e")
        poly(d, [(30, 30), (66, 30), (60, 60), (50, 90), (44, 88), (36, 60)], c)
        for y in (42, 54, 66):
            d.line([S(40), S(y), S(52), S(y - 2)], fill=darken(c, 0.35), width=S(2))
        for (x, a) in ((38, -20), (48, 0), (58, 20)):
            poly(d, [(x, 32), (x + a * 0.4 - 6, 8), (x + a * 0.4 + 6, 8)], hexc("5fb04a"), width=2)
        ellipse(d, (62, 6, 86, 30), (255, 230, 120, 255), width=2)
    elif kind == "sparkdust":
        c = hexc("ffe45c")
        ellipse(d, (14, 56, 82, 90), (196, 150, 90, 255))
        poly(d, [(20, 70), (48, 36), (76, 70)], c)
        for (cx, cy, r) in ((30, 22, 10), (66, 18, 8), (50, 10, 6), (76, 42, 7)):
            pts = []
            for i in range(8):
                a = i * math.pi / 4
                rr = r if i % 2 == 0 else r * 0.35
                pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
            poly(d, pts, (255, 255, 220, 255), width=2)
    elif kind == "bluecap":
        c = hexc("3a6fe0")
        rrect(d, (38, 46, 58, 90), 6, (240, 232, 210, 255))
        d.pieslice([S(12), S(12), S(84), S(80)], 180, 360, fill=c, outline=OUTLINE, width=S(3))
        d.line([S(12), S(46), S(84), S(46)], fill=OUTLINE, width=S(3))
        for (x, y, r) in ((32, 30, 6), (54, 22, 5), (66, 36, 5)):
            ellipse(d, (x - r, y - r, x + r, y + r), (255, 255, 255, 255), outline=None)
    elif kind == "ironroot":
        c = hexc("8a7a6a")
        poly(d, [(40, 6), (56, 6), (60, 40), (76, 62), (70, 66), (56, 52), (58, 90), (46, 90), (42, 60),
                 (26, 76), (20, 70), (38, 44)], c)
        for y in (20, 34, 48):
            d.line([S(44), S(y), S(54), S(y + 3)], fill=lighten(c, 0.4), width=S(2))
        ellipse(d, (44, 30, 54, 40), (170, 180, 200, 255), width=2)
    elif kind == "swiftmint":
        c = hexc("4fd18a")
        for (cx, cy, a) in ((34, 50, -30), (62, 50, 30), (48, 30, 0)):
            pts = []
            for i in range(12):
                t = i / 12 * 2 * math.pi
                pts.append((cx + 16 * math.cos(t) * (0.55 if True else 1), cy + 22 * math.sin(t)))
            # rotate
            ra = math.radians(a)
            pts = [(cx + (x - cx) * math.cos(ra) - (y - cy) * math.sin(ra),
                    cy + (x - cx) * math.sin(ra) + (y - cy) * math.cos(ra)) for x, y in pts]
            poly(d, pts, c)
        d.line([S(48), S(50), S(48), S(90)], fill=hexc("2f7a4a"), width=S(4))
        shine(d, (40, 18, 46, 30))
    return done(img, 96, 96)


# --------------------------------------------------------------- misc icons
def icon(kind):
    img = new(96, 96)
    d = ImageDraw.Draw(img)
    if kind == "coin":
        ellipse(d, (8, 8, 88, 88), (232, 176, 48, 255), width=4)
        ellipse(d, (20, 20, 76, 76), (250, 206, 80, 255), outline=(190, 130, 30, 255), width=3)
        d.line([S(48), S(30), S(48), S(66)], fill=(190, 130, 30, 255), width=S(6))
        shine(d, (24, 22, 36, 34))
    elif kind == "heart":
        poly(d, [(48, 86), (12, 50), (10, 30), (22, 14), (38, 14), (48, 26), (58, 14), (74, 14), (86, 30),
                 (84, 50)], (232, 72, 92, 255), width=4)
        shine(d, (22, 24, 34, 36))
    elif kind == "star":
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            r = 42 if i % 2 == 0 else 18
            pts.append((48 + r * math.cos(a), 52 + r * math.sin(a)))
        poly(d, pts, (255, 206, 60, 255), width=4)
        shine(d, (40, 26, 48, 36))
    elif kind == "gear":
        pts = []
        for i in range(16):
            a = i * math.pi / 8
            r = 40 if (i % 2 == 0) else 30
            pts.append((48 + r * math.cos(a), 48 + r * math.sin(a)))
        poly(d, pts, (180, 186, 200, 255), width=4)
        ellipse(d, (34, 34, 62, 62), (80, 86, 100, 255), width=3)
    elif kind == "orders":
        rrect(d, (18, 10, 78, 86), 6, (240, 225, 185, 255), width=4)
        ellipse(d, (12, 4, 84, 20), (214, 190, 140, 255), width=3)
        ellipse(d, (12, 78, 84, 94), (214, 190, 140, 255), width=3)
        for y in (30, 44, 58):
            d.line([S(28), S(y), S(68), S(y)], fill=(120, 90, 60, 255), width=S(4))
    elif kind == "bag":
        poly(d, [(26, 30), (70, 30), (84, 82), (12, 82)], (176, 120, 70, 255), width=4)
        rrect(d, (22, 20, 74, 34), 4, (150, 100, 56, 255), width=3)
        d.arc([S(34), S(4), S(62), S(32)], 180, 360, fill=OUTLINE, width=S(4))
        poly(d, [(42, 46), (54, 46), (58, 60), (48, 68), (38, 60)], (90, 180, 90, 255), width=3)
    elif kind == "upgrades":
        poly(d, [(48, 8), (84, 46), (62, 46), (62, 88), (34, 88), (34, 46), (12, 46)], (90, 200, 110, 255), width=4)
        shine(d, (42, 24, 50, 40))
    elif kind == "workers":
        ellipse(d, (30, 8, 66, 44), (245, 205, 165, 255), width=4)
        rrect(d, (18, 48, 78, 92), 16, (80, 140, 210, 255), width=4)
        poly(d, [(30, 16), (66, 16), (60, 4), (36, 4)], (110, 70, 40, 255), width=3)
    elif kind == "expand":
        poly(d, [(48, 10), (88, 44), (78, 44), (78, 86), (18, 86), (18, 44), (8, 44)], (230, 150, 90, 255), width=4)
        rrect(d, (38, 56, 58, 86), 3, (120, 80, 50, 255), width=3)
        poly(d, [(48, 10), (88, 44), (8, 44)], (180, 70, 60, 255), width=4)
    elif kind == "close":
        ellipse(d, (6, 6, 90, 90), (200, 70, 60, 255), width=4)
        d.line([S(30), S(30), S(66), S(66)], fill=(255, 255, 255, 255), width=S(10))
        d.line([S(66), S(30), S(30), S(66)], fill=(255, 255, 255, 255), width=S(10))
    elif kind == "check":
        ellipse(d, (6, 6, 90, 90), (80, 180, 90, 255), width=4)
        d.line([S(26), S(50), S(42), S(66), S(70), S(32)], fill=(255, 255, 255, 255), width=S(10), joint="curve")
    elif kind == "plus":
        ellipse(d, (6, 6, 90, 90), (80, 160, 220, 255), width=4)
        d.line([S(48), S(26), S(48), S(70)], fill=(255, 255, 255, 255), width=S(10))
        d.line([S(26), S(48), S(70), S(48)], fill=(255, 255, 255, 255), width=S(10))
    elif kind == "lock":
        d.arc([S(26), S(8), S(70), S(56)], 180, 360, fill=OUTLINE, width=S(10))
        d.arc([S(26), S(8), S(70), S(56)], 180, 360, fill=(160, 166, 180, 255), width=S(5))
        rrect(d, (18, 40, 78, 88), 8, (226, 176, 60, 255), width=4)
        ellipse(d, (42, 52, 54, 64), OUTLINE, outline=None)
        d.rectangle([S(45), S(60), S(51), S(76)], fill=OUTLINE)
    elif kind == "hourglass":
        poly(d, [(22, 8), (74, 8), (74, 16), (54, 48), (74, 80), (74, 88), (22, 88), (22, 80), (42, 48), (22, 16)],
             (200, 230, 245, 255), width=4)
        poly(d, [(30, 22), (66, 22), (48, 44)], (240, 200, 90, 255), outline=None)
        poly(d, [(48, 60), (68, 82), (28, 82)], (240, 200, 90, 255), outline=None)
    elif kind == "broom":
        d.line([S(70), S(8), S(42), S(56)], fill=OUTLINE, width=S(10))
        d.line([S(70), S(8), S(42), S(56)], fill=(170, 110, 60, 255), width=S(5))
        poly(d, [(36, 50), (52, 60), (40, 90), (12, 78)], (230, 200, 90, 255), width=4)
    elif kind == "brew":
        rrect(d, (14, 34, 82, 84), 18, (60, 62, 72, 255), width=4)
        rrect(d, (10, 28, 86, 40), 5, (90, 94, 106, 255), width=3)
        ellipse(d, (18, 30, 78, 40), (150, 90, 230, 255), outline=None)
        for (x, y, r) in ((36, 18, 6), (54, 10, 5), (60, 22, 4)):
            ellipse(d, (x - r, y - r, x + r, y + r), (190, 140, 255, 255), width=2)
    elif kind == "order":
        rrect(d, (16, 12, 80, 86), 6, (250, 245, 230, 255), width=4)
        for y in (30, 44, 58, 72):
            d.line([S(26), S(y), S(70 if y < 70 else 52), S(y)], fill=(120, 120, 140, 255), width=S(4))
        d.line([S(64), S(60), S(84), S(16)], fill=OUTLINE, width=S(8))
        d.line([S(64), S(60), S(84), S(16)], fill=(70, 120, 200, 255), width=S(4))
    elif kind == "book":
        rrect(d, (12, 14, 84, 84), 6, (140, 50, 50, 255), width=4)
        rrect(d, (20, 14, 84, 76), 4, (245, 235, 205, 255), width=3)
        d.line([S(20), S(14), S(20), S(84)], fill=OUTLINE, width=S(3))
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            r = 16 if i % 2 == 0 else 7
            pts.append((52 + r * math.cos(a), 46 + r * math.sin(a)))
        poly(d, pts, (230, 180, 60, 255), width=2)
    elif kind == "sparkle":
        for (cx, cy, r) in ((48, 48, 34), (20, 20, 12), (76, 74, 10)):
            pts = []
            for i in range(8):
                a = i * math.pi / 4
                rr = r if i % 2 == 0 else r * 0.3
                pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
            poly(d, pts, (255, 245, 170, 255), width=3)
    elif kind == "exclaim":
        ellipse(d, (6, 6, 90, 90), (240, 180, 40, 255), width=4)
        rrect(d, (40, 18, 56, 58), 6, (255, 255, 255, 255), outline=None)
        ellipse(d, (40, 64, 56, 80), (255, 255, 255, 255), outline=None)
    elif kind == "sound":
        poly(d, [(14, 36), (32, 36), (54, 16), (54, 80), (32, 60), (14, 60)], (220, 220, 230, 255), width=4)
        d.arc([S(48), S(28), S(76), S(68)], -60, 60, fill=OUTLINE, width=S(5))
        d.arc([S(52), S(16), S(90), S(80)], -60, 60, fill=OUTLINE, width=S(5))
    elif kind == "trash":
        rrect(d, (22, 26, 74, 90), 6, (180, 186, 200, 255), width=4)
        rrect(d, (14, 14, 82, 28), 4, (150, 156, 170, 255), width=3)
        for x in (36, 48, 60):
            d.line([S(x), S(38), S(x), S(78)], fill=(110, 116, 130, 255), width=S(4))
    elif kind == "speed":
        for (y, l) in ((30, 50), (48, 66), (66, 42)):
            rrect(d, (16, y - 6, 16 + l, y + 6), 6, (120, 200, 255, 255), width=3)
        poly(d, [(60, 24), (86, 48), (60, 72)], (80, 160, 230, 255), width=4)
    elif kind == "tables":
        rrect(d, (10, 36, 86, 50), 5, (190, 130, 70, 255), width=4)
        rrect(d, (42, 48, 54, 88), 2, (150, 100, 56, 255), width=3)
        rrect(d, (26, 80, 70, 90), 3, (150, 100, 56, 255), width=3)
        ellipse(d, (40, 12, 56, 34), (250, 240, 200, 255), width=3)
    elif kind == "patience":
        ellipse(d, (8, 8, 88, 88), (250, 240, 220, 255), width=4)
        d.line([S(48), S(48), S(48), S(22)], fill=OUTLINE, width=S(6))
        d.line([S(48), S(48), S(66), S(58)], fill=OUTLINE, width=S(6))
    elif kind == "quality":
        poly(d, [(48, 6), (86, 36), (48, 90), (10, 36)], (120, 220, 240, 255), width=4)
        poly(d, [(48, 6), (66, 36), (48, 90), (30, 36)], (170, 240, 255, 255), width=2)
        d.line([S(10), S(36), S(86), S(36)], fill=OUTLINE, width=S(3))
    return done(img, 96, 96)


def mood_icon(kind):
    img = new(96, 96)
    d = ImageDraw.Draw(img)
    colors = {"happy": (120, 210, 110, 255), "neutral": (250, 214, 80, 255),
              "annoyed": (250, 150, 60, 255), "angry": (230, 70, 60, 255)}
    ellipse(d, (6, 6, 90, 90), colors[kind], width=4)
    # eyes
    if kind == "angry":
        d.line([S(24), S(28), S(42), S(38)], fill=OUTLINE, width=S(6))
        d.line([S(72), S(28), S(54), S(38)], fill=OUTLINE, width=S(6))
    ellipse(d, (28, 34, 40, 50), OUTLINE, outline=None)
    ellipse(d, (56, 34, 68, 50), OUTLINE, outline=None)
    if kind == "happy":
        d.arc([S(26), S(40), S(70), S(74)], 20, 160, fill=OUTLINE, width=S(6))
    elif kind == "neutral":
        d.line([S(32), S(66), S(64), S(66)], fill=OUTLINE, width=S(6))
    elif kind == "annoyed":
        d.line([S(32), S(70), S(64), S(62)], fill=OUTLINE, width=S(6))
    else:
        d.arc([S(28), S(60), S(68), S(90)], 200, 340, fill=OUTLINE, width=S(6))
    shine(d, (20, 18, 32, 28))
    return done(img, 96, 96)


# --------------------------------------------------------------- panels
def panel_wood():
    w = h = 96
    img = new(w, h)
    d = ImageDraw.Draw(img)
    rrect(d, (2, 2, 94, 94), 16, (110, 66, 36, 255), width=4)
    rrect(d, (8, 8, 88, 88), 12, (150, 96, 52, 255), outline=(90, 54, 30, 255), width=2)
    rrect(d, (16, 16, 80, 80), 8, (244, 228, 192, 255), outline=(90, 54, 30, 255), width=3)
    # rivets
    for (x, y) in ((12, 12), (84, 12), (12, 84), (84, 84)):
        ellipse(d, (x - 3, y - 3, x + 3, y + 3), (232, 190, 90, 255), outline=(90, 54, 30, 255), width=1)
    return done(img, w, h)


def panel_parchment():
    w = h = 96
    img = new(w, h)
    d = ImageDraw.Draw(img)
    rrect(d, (2, 2, 94, 94), 14, (250, 238, 206, 255), outline=(150, 110, 70, 255), width=3)
    rrect(d, (8, 8, 88, 88), 10, None, outline=(220, 196, 150, 255), width=2)
    return done(img, w, h)


def panel_dark():
    w = h = 64
    img = new(w, h)
    d = ImageDraw.Draw(img)
    rrect(d, (2, 2, 62, 62), 18, (34, 24, 30, 200), outline=(250, 220, 160, 230), width=2)
    return done(img, w, h)


def button(color):
    w = h = 64
    img = new(w, h)
    d = ImageDraw.Draw(img)
    c = hexc(color)
    rrect(d, (2, 4, 62, 62), 14, darken(c, 0.45), width=3)
    rrect(d, (2, 2, 62, 56), 14, c, width=3)
    rrect(d, (8, 7, 56, 24), 8, lighten(c, 0.3), outline=None)
    return done(img, w, h)


def bar(color, w=64, h=20):
    img = new(w, h)
    d = ImageDraw.Draw(img)
    c = hexc(color)
    rrect(d, (1, 1, w - 1, h - 1), (h - 2) // 2, c, outline=(30, 20, 20, 255) if color == "2a2024" else None,
          width=2)
    if color != "2a2024":
        rrect(d, (3, 3, w - 3, h // 2), (h - 6) // 2, lighten(c, 0.35), outline=None)
    return done(img, w, h)


def speech_bubble():
    w, h = 104, 112
    img = new(w, h)
    d = ImageDraw.Draw(img)
    poly(d, [(40, 88), (52, 108), (64, 88)], (255, 255, 255, 255), width=3)
    rrect(d, (4, 4, 100, 92), 22, (255, 255, 255, 255), width=3)
    d.rectangle([S(42), S(86), S(62), S(92)], fill=(255, 255, 255, 255))
    return done(img, w, h)


def ring_frames(n=48, size=112):
    frames = []
    for i in range(n + 1):
        img = new(size, size)
        d = ImageDraw.Draw(img)
        t = i / n
        if t > 0:
            r0 = 8
            d.arc([S(r0), S(r0), S(size - r0), S(size - r0)], -90, -90 + 360 * t, fill=(255, 255, 255, 255),
                  width=S(14))
        frames.append(done(img, size, size))
    return frames


def ring_back(size=112):
    img = new(size, size)
    d = ImageDraw.Draw(img)
    ellipse(d, (2, 2, size - 2, size - 2), (30, 22, 30, 215), outline=(255, 240, 210, 255), width=3)
    ellipse(d, (8, 8, size - 8, size - 8), None, outline=(80, 66, 80, 255), width=14)
    ellipse(d, (24, 24, size - 24, size - 24), (250, 244, 230, 255), outline=(255, 240, 210, 255), width=2)
    return done(img, size, size)


def soft_glow(size=128, color=(255, 230, 150)):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i in range(size // 2, 0, -1):
        a = int(255 * (1 - i / (size / 2)) ** 2)
        d.ellipse([size / 2 - i, size / 2 - i, size / 2 + i, size / 2 + i], fill=color + (a,))
    return img


def floor_marker(size=128):
    img = new(size, size)
    d = ImageDraw.Draw(img)
    ellipse(d, (6, 6, size - 6, size - 6), None, outline=(255, 220, 90, 255), width=8)
    ellipse(d, (22, 22, size - 22, size - 22), None, outline=(255, 240, 180, 200), width=4)
    return done(img, size, size)


def liquid_texture(size=64):
    import numpy as np
    yy, xx = np.mgrid[0:size, 0:size]
    c = (size - 1) / 2
    ang = np.arctan2(yy - c, xx - c)
    r = np.hypot(yy - c, xx - c)
    s = np.sin(ang * 3 + r * 0.25) * 0.5 + 0.5
    v = (170 + 85 * s).astype(np.uint8)
    arr = np.stack([v, v, v, np.full_like(v, 255)], axis=-1)
    rng = np.random.default_rng(3)
    for _ in range(14):
        x, y = rng.integers(3, size - 4, 2)
        arr[y - 2:y + 2, x - 2:x + 2, :3] = 255
    return Image.fromarray(arr, "RGBA").resize((128, 128), Image.NEAREST)


def solid(color, size=8):
    return Image.new("RGBA", (size, size), color)


def main():
    os.makedirs(OUT, exist_ok=True)
    potions = {"healing": ("round", "e0303a"), "energy": ("bolt", "ffb020"), "mana": ("vial", "3a7cff"),
               "strength": ("square", "b0602d"), "speed": ("wing", "39d98a"), "sludge": ("sludge", "6a7a4a")}
    for name, (kind, col) in potions.items():
        potion_icon(kind, col).save(os.path.join(OUT, "potion_%s.png" % name))
    for name in ("redleaf", "moonwater", "sunroot", "sparkdust", "bluecap", "ironroot", "swiftmint"):
        ingredient_icon(name).save(os.path.join(OUT, "ing_%s.png" % name))
    for name in ("coin", "heart", "star", "gear", "orders", "bag", "upgrades", "workers", "expand", "close",
                 "check", "plus", "lock", "hourglass", "broom", "brew", "order", "book", "sparkle", "exclaim",
                 "sound", "trash", "speed", "tables", "patience", "quality"):
        icon(name).save(os.path.join(OUT, "icon_%s.png" % name))
    for name in ("happy", "neutral", "annoyed", "angry"):
        mood_icon(name).save(os.path.join(OUT, "mood_%s.png" % name))
    panel_wood().save(os.path.join(OUT, "panel_wood.png"))
    panel_parchment().save(os.path.join(OUT, "panel_parchment.png"))
    panel_dark().save(os.path.join(OUT, "panel_dark.png"))
    for name, col in (("green", "5cb85c"), ("gold", "e8a33a"), ("red", "d9534f"), ("gray", "9a9aa6"),
                      ("blue", "4a8fd8"), ("purple", "8a5ad0")):
        button(col).save(os.path.join(OUT, "btn_%s.png" % name))
    bar("2a2024").save(os.path.join(OUT, "bar_back.png"))
    bar("ffffff").save(os.path.join(OUT, "bar_fill.png"))
    speech_bubble().save(os.path.join(OUT, "bubble.png"))
    for i, f in enumerate(ring_frames()):
        f.save(os.path.join(OUT, "ring_%02d.png" % i))
    ring_back().save(os.path.join(OUT, "ring_back.png"))
    soft_glow().save(os.path.join(OUT, "glow.png"))
    floor_marker().save(os.path.join(OUT, "floor_marker.png"))
    liquid_texture().save(os.path.join(OUT, "liquid.png"))
    solid((0, 0, 0, 255)).save(os.path.join(OUT, "dim.png"))
    solid((255, 40, 40, 110), 32).save(os.path.join(OUT, "navblock.png"))
    solid((255, 255, 255, 255), 16).save(os.path.join(OUT, "white.png"))


if __name__ == "__main__":
    main()
