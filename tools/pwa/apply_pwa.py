"""Turn a GDevelop HTML5 export into an installable, offline-capable PWA.

    python3 tools/pwa/apply_pwa.py <export dir> [<output dir>] --ads development|production

Runs after every export (tools/export.sh calls it) and is safe to run again on
an already-patched build. It never edits GDevelop's game files (code*.js,
data.js, assets); it only:
  - copies pwa/pwa.js, pwa/ads.js, the app icons, _headers and the chosen
    ads-config into the build,
  - rewrites manifest.webmanifest (standalone, portrait, icons, theme),
  - adds a marked block of tags and scripts to index.html (iPhone meta tags,
    safe areas, touch CSS, ad adapter, service worker registration),
  - generates sw.js with the list of every file of the build and a version
    hash of their contents (any change gives a new version).
"""
import argparse
import hashlib
import json
import os
import re
import shutil

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
PWA = os.path.join(ROOT, "pwa")
BEGIN = "<!-- PWA:BEGIN (added by tools/pwa/apply_pwa.py) -->"
END = "<!-- PWA:END -->"
THEME = "#1e1528"

HEAD_BLOCK = """%s
    <meta name="apple-mobile-web-app-title" content="Potion Shop">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
    <style>
        html, body { height: 100%%; background: %s; }
        body {
            overscroll-behavior: none;           /* no pull-to-refresh / rubber band */
            touch-action: none;                  /* the game handles every touch */
            -webkit-user-select: none; user-select: none;
            -webkit-touch-callout: none;         /* no long-press menu on iPhone */
            -webkit-tap-highlight-color: transparent;
        }
        #potion-rotate {
            display: none; position: fixed; inset: 0; z-index: 100000; background: %s; color: #fff;
            align-items: center; justify-content: center; text-align: center;
            font: 600 20px system-ui, sans-serif; padding: 24px;
        }
        @media (orientation: landscape) and (max-height: 500px) { #potion-rotate { display: flex; } }
    </style>
    <script src="ads-config.js"></script>
    <script src="ads.js"></script>
    <script src="pwa.js"></script>
    %s""" % (BEGIN, THEME, THEME, END)


def manifest():
    return {
        "name": "Potion Shop",
        "short_name": "Potion Shop",
        "id": "./",
        "description": "A cozy 3D potion shop management game: brew potions, serve customers, grow your shop.",
        "start_url": "./index.html",
        "scope": "./",
        "display": "standalone",
        "orientation": "portrait",
        "background_color": THEME,
        "theme_color": THEME,
        "categories": ["games", "entertainment"],
        "icons": [
            {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }


def patch_index(path):
    html = open(path, encoding="utf-8").read()
    html = re.sub(r"[ \t]*" + re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n?", "", html, flags=re.S)  # idempotent
    # Status bar: "black" keeps the game below the iPhone status bar (no notch overlap).
    html = re.sub(r'<meta name="apple-mobile-web-app-status-bar-style"[^>]*>',
                  '<meta name="apple-mobile-web-app-status-bar-style" content="black">', html)
    # viewport-fit=cover exposes the home-indicator inset (env(safe-area-inset-bottom)).
    html = re.sub(r'<meta name="viewport"[^>]*>',
                  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, '
                  'user-scalable=no, viewport-fit=cover" />', html)
    html = re.sub(r'<meta name="theme-color"[^>]*>', '<meta name="theme-color" content="%s" />' % THEME, html)
    if "</head>" not in html or "<body>" not in html:
        raise SystemExit("index.html does not look like a GDevelop export")
    # Before GDevelop's scripts so the ad adapter and service worker start early.
    html = html.replace("<!-- Libs and GDJS core files : -->", HEAD_BLOCK + "\n    <!-- Libs and GDJS core files : -->", 1) \
        if "<!-- Libs and GDJS core files : -->" in html else html.replace("</head>", HEAD_BLOCK + "\n</head>", 1)
    html = re.sub(r'\s*<div id="potion-rotate">.*?</div>', "", html, flags=re.S)
    html = html.replace("<body>", '<body>\n    <div id="potion-rotate">Turn your phone upright to play Potion Shop.</div>', 1)
    open(path, "w", encoding="utf-8").write(html)


def build_sw(out):
    files = []
    for base, dirs, names in os.walk(out):
        for n in names:
            rel = os.path.relpath(os.path.join(base, n), out).replace(os.sep, "/")
            if rel in ("sw.js", "_headers", ".nojekyll") or rel.startswith("."):
                continue
            files.append(rel)
    files.sort()
    h = hashlib.sha256()
    for rel in files:
        h.update(rel.encode())
        h.update(open(os.path.join(out, rel), "rb").read())
    version = h.hexdigest()[:12]
    precache = ["./"] + ["./" + f for f in files]
    tpl = open(os.path.join(PWA, "sw.template.js"), encoding="utf-8").read()
    sw = tpl.replace("'__VERSION__'", json.dumps(version)).replace("__PRECACHE__", json.dumps(precache, indent=1))
    open(os.path.join(out, "sw.js"), "w", encoding="utf-8").write(sw)
    total = sum(os.path.getsize(os.path.join(out, f)) for f in files)
    return version, len(files), total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst", nargs="?")
    ap.add_argument("--ads", choices=["development", "production"], required=True)
    a = ap.parse_args()
    src = os.path.abspath(a.src)
    out = os.path.abspath(a.dst or a.src)
    if not os.path.exists(os.path.join(src, "index.html")):
        raise SystemExit("no index.html in " + src)
    if out != src:
        if os.path.exists(out):
            shutil.rmtree(out)
        shutil.copytree(src, out)
    for name in ("pwa.js", "ads.js", "_headers"):
        shutil.copy(os.path.join(PWA, name), os.path.join(out, name))
    shutil.copy(os.path.join(PWA, "config", "ads-config.%s.js" % a.ads), os.path.join(out, "ads-config.js"))
    icons = os.path.join(out, "icons")
    if os.path.exists(icons):
        shutil.rmtree(icons)
    shutil.copytree(os.path.join(PWA, "icons"), icons)
    with open(os.path.join(out, "manifest.webmanifest"), "w", encoding="utf-8") as f:
        json.dump(manifest(), f, indent=2)
    patch_index(os.path.join(out, "index.html"))
    version, n, total = build_sw(out)
    print("PWA ready in %s (ads: %s, version %s, %d files, %.1f MB precached)" % (out, a.ads, version, n, total / 1e6))


if __name__ == "__main__":
    main()
