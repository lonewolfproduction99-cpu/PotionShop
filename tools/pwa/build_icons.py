"""Generate the Potion Shop app icons (home screen, splash, manifest) into pwa/icons/.

Built from the game's own potion icon on a warm round badge:
  icon-192.png, icon-512.png           regular icons (transparent corners)
  icon-maskable-512.png                full-bleed background, art inside the 80% safe zone
  apple-touch-icon.png (180x180)       iOS home screen (opaque, iOS rounds the corners)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import build_ui  # noqa: E402  (the game's icon drawing code)

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
OUT = os.path.join(ROOT, "pwa", "icons")


def potion_art(size):
    """The Healing Potion icon drawn directly at `size` pixels (sharp at 512 px)."""
    build_ui.SS = max(4, size // 24)
    old_done = build_ui.done
    build_ui.done = lambda img, w, h: img.resize((size, size), Image.LANCZOS)
    try:
        return build_ui.potion_icon("round", "e0303a").convert("RGBA")
    finally:
        build_ui.done = old_done
        build_ui.SS = 4


def background(size, rounded):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Warm purple-to-brown gradient (potion shop at night).
    grad = Image.new("RGBA", (size, size))
    gd = ImageDraw.Draw(grad)
    for y in range(size):
        t = y / (size - 1)
        c = (int(92 + (58 - 92) * t), int(52 + (30 - 52) * t), int(140 + (40 - 140) * t), 255)
        gd.line([(0, y), (size, y)], fill=c)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    if rounded:
        md.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255)
    else:
        md.rectangle([0, 0, size, size], fill=255)
    img.paste(grad, (0, 0), mask)
    # Soft golden glow behind the bottle.
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([size * 0.18, size * 0.16, size * 0.82, size * 0.8], fill=(255, 210, 110, 120))
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.08))
    img = Image.alpha_composite(img, Image.composite(glow, Image.new("RGBA", (size, size)), mask))
    # Stars
    for (x, y, r) in ((0.2, 0.22, 0.018), (0.8, 0.18, 0.014), (0.84, 0.66, 0.012), (0.16, 0.7, 0.012)):
        d = ImageDraw.Draw(img)
        d.ellipse([size * (x - r), size * (y - r), size * (x + r), size * (y + r)], fill=(255, 240, 190, 230))
    return img


def make(size, rounded=True, art_scale=0.78, opaque=False):
    img = background(size, rounded and not opaque)
    s = int(size * art_scale)
    potion = potion_art(s)
    img.alpha_composite(potion, ((size - s) // 2, int((size - s) * 0.46)))
    if opaque:
        flat = Image.new("RGB", (size, size), (58, 30, 40))
        flat.paste(img, (0, 0), img)
        return flat
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    make(192).save(os.path.join(OUT, "icon-192.png"))
    make(512).save(os.path.join(OUT, "icon-512.png"))
    # Maskable: the platform crops to its own shape; keep the art inside the safe zone.
    make(512, rounded=False, art_scale=0.6).save(os.path.join(OUT, "icon-maskable-512.png"))
    make(180, art_scale=0.74, opaque=True).save(os.path.join(OUT, "apple-touch-icon.png"))
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
