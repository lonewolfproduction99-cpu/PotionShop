"""Make the Playgama upload (a ZIP with index.html at its root) from the HTML5 export.

    python3 tools/platforms/build_playgama.py [export dir, default docs] [output dir, default dist/playgama]

The GDevelop game files are not changed. The script:
  - removes the PWA layer (service worker, manifest, install banner): the game
    runs inside Playgama's page,
  - loads Playgama Bridge from Playgama's CDN (the only external file allowed)
    plus platforms/playgama/playgama.js, the Bridge config and the ad adapter
    with the "playgama" provider,
  - starts the game only after Bridge is initialized and the save is loaded,
  - turns off GDevelop's own usage analytics (external analytics are not
    allowed on Playgama),
  - writes <output>/potion-shop-playgama.zip and copies it to releases/ (the file to upload).
"""
import os
import re
import shutil
import sys
import zipfile

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
PG = os.path.join(ROOT, "platforms", "playgama")
BRIDGE_CDN = "https://bridge.playgama.com/v2/stable/playgama-bridge.js"
BEGIN = "<!-- PLAYGAMA:BEGIN (added by tools/platforms/build_playgama.py) -->"
END = "<!-- PLAYGAMA:END -->"
PWA_FILES = ("sw.js", "pwa.js", "ads-config.js", "_headers", ".nojekyll", "manifest.webmanifest")

HEAD = """    %s
    <script src="%s"></script>
    <script src="playgama.js"></script>
    <script src="ads-config.js"></script>
    <script src="ads.js"></script>
    <style>
        html, body { height: 100%%; background: #1e1528; }
        body { overscroll-behavior: none; touch-action: none; -webkit-user-select: none; user-select: none;
               -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
    </style>
    %s
""" % (BEGIN, BRIDGE_CDN, END)


def patch_index(path):
    html = open(path, encoding="utf-8").read()
    # Remove the PWA layer and any earlier Playgama block.
    html = re.sub(r"[ \t]*<!-- PWA:BEGIN.*?<!-- PWA:END -->\n?", "", html, flags=re.S)
    html = re.sub(r"[ \t]*" + re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n?", "", html, flags=re.S)
    html = re.sub(r'\s*<div id="potion-rotate">.*?</div>', "", html, flags=re.S)
    html = re.sub(r'\s*<link rel="manifest"[^>]*>', "", html)
    marker = "<!-- Libs and GDJS core files : -->"
    if marker not in html:
        raise SystemExit("index.html does not look like a GDevelop export")
    html = html.replace("    " + marker, HEAD + "    " + marker, 1)
    # No GDevelop usage analytics (it needs the project UUID).
    boot = "var game = new gdjs.RuntimeGame(gdjs.projectData, gdjs.runtimeGameOptions);"
    if boot not in html:
        raise SystemExit("GDevelop start script not found in index.html")
    if "projectUuid = ''" not in html:
        html = html.replace(boot, "gdjs.projectData.properties.projectUuid = ''; // Playgama: no external analytics\n        " + boot)
    # Start only when Bridge is ready and the save is loaded.
    start = "game.startGameLoop();"
    if "PotionPlatform.ready" not in html:
        html = html.replace(start, "window.PotionPlatform.ready.then(function () { game.startGameLoop(); });", 1)
    open(path, "w", encoding="utf-8").write(html)


def main():
    src = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs"))
    out = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "dist", "playgama"))
    if not os.path.exists(os.path.join(src, "index.html")):
        raise SystemExit("no index.html in " + src)
    build = os.path.join(out, "build")
    if os.path.exists(build):
        shutil.rmtree(build)
    shutil.copytree(src, build, ignore=shutil.ignore_patterns(*PWA_FILES, "icons", "build-note.txt"))
    shutil.copy(os.path.join(PG, "playgama.js"), build)
    shutil.copy(os.path.join(PG, "playgama-bridge-config.json"), build)
    shutil.copy(os.path.join(PG, "ads-config.js"), build)
    shutil.copy(os.path.join(ROOT, "pwa", "ads.js"), build)
    patch_index(os.path.join(build, "index.html"))
    # File and folder names must be Latin characters only.
    for base, dirs, names in os.walk(build):
        for n in dirs + names:
            if not re.fullmatch(r"[A-Za-z0-9._\-]+", n):
                raise SystemExit("non-Latin or unusual file name: " + os.path.join(base, n))
    zpath = os.path.join(out, "potion-shop-playgama.zip")
    if os.path.exists(zpath):
        os.remove(zpath)
    total = 0
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for base, dirs, names in os.walk(build):
            dirs.sort()
            for n in sorted(names):
                full = os.path.join(base, n)
                rel = os.path.relpath(full, build).replace(os.sep, "/")
                z.write(full, rel)
                total += os.path.getsize(full)
    rel_dir = os.path.join(ROOT, "releases")
    os.makedirs(rel_dir, exist_ok=True)
    shutil.copy(zpath, os.path.join(rel_dir, "potion-shop-playgama.zip"))
    print("Playgama build: %s (%.1f MB of files, zip %.1f MB), copied to releases/" %
          (zpath, total / 1e6, os.path.getsize(zpath) / 1e6))


if __name__ == "__main__":
    main()
