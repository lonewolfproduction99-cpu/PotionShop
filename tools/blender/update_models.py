"""Bring models edited in Blender back into the game.

    python3 tools/blender/update_models.py [glb files or folders, default art/blender/exported]

For each .glb (named like the game model it replaces, e.g. char_owner.glb):
  - checks it is a valid glTF binary and, for characters, that every animation
    the game uses is still there,
  - copies it to game/assets/models/,
  - measures its size (all meshes, with node transforms) and updates
    game/assets/models/manifest.json, which sets the object size in GDevelop,
  - then rebuilds game/PotionShop.json (tools/build_project.py).
Re-export afterwards (tools/export.sh) to update the playable builds.

Note: tools/build_models.py regenerates every model from code and would
overwrite edited ones; it skips models listed in art/blender/edited.json, which
this script maintains.
"""
import json
import os
import shutil
import struct
import subprocess
import sys

import numpy as np

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
MODELS = os.path.join(ROOT, "game", "assets", "models")
EDITED = os.path.join(ROOT, "art", "blender", "edited.json")
CHAR_ANIMS = ["Idle", "Walk", "Work", "Sit", "Cheer", "Angry", "Carry"]


def read_glb(path):
    data = open(path, "rb").read()
    magic, version, length = struct.unpack_from("<III", data, 0)
    if magic != 0x46546C67 or version != 2:
        raise ValueError("not a glTF 2.0 binary (.glb)")
    off = 12
    js, binary = None, b""
    while off < len(data):
        clen, ctype = struct.unpack_from("<II", data, off)
        chunk = data[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:
            js = json.loads(chunk)
        elif ctype == 0x004E4942:
            binary = chunk
        off += 8 + clen
    return js, binary


def quat_matrix(q):
    x, y, z, w = q
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def local_matrix(node):
    if "matrix" in node:
        return np.array(node["matrix"], dtype=float).reshape(4, 4).T
    m = np.eye(4)
    s = np.diag(node.get("scale", [1, 1, 1]))
    m[:3, :3] = quat_matrix(node.get("rotation", [0, 0, 0, 1])) @ s
    m[:3, 3] = node.get("translation", [0, 0, 0])
    return m


def bounds(js, binary):
    """Min/max of every vertex in glTF space (accessor min/max with node transforms)."""
    pts = []

    def visit(i, parent):
        node = js["nodes"][i]
        world = parent @ local_matrix(node)
        if "mesh" in node:
            for prim in js["meshes"][node["mesh"]]["primitives"]:
                acc = js["accessors"][prim["attributes"]["POSITION"]]
                lo, hi = acc["min"], acc["max"]
                for cx in (lo[0], hi[0]):
                    for cy in (lo[1], hi[1]):
                        for cz in (lo[2], hi[2]):
                            pts.append(world @ np.array([cx, cy, cz, 1.0]))
        for c in node.get("children", []):
            visit(c, world)

    scene = js["scenes"][js.get("scene", 0)]
    for i in scene["nodes"]:
        visit(i, np.eye(4))
    if not pts:
        raise ValueError("no meshes found")
    p = np.array(pts)[:, :3]
    return p.min(axis=0), p.max(axis=0)


def main():
    targets = sys.argv[1:] or [os.path.join(ROOT, "art", "blender", "exported")]
    files = []
    for t in targets:
        if os.path.isdir(t):
            files += [os.path.join(t, f) for f in sorted(os.listdir(t)) if f.endswith(".glb")]
        else:
            files.append(t)
    if not files:
        raise SystemExit("no .glb files found in " + ", ".join(targets))
    manifest_path = os.path.join(MODELS, "manifest.json")
    manifest = json.load(open(manifest_path))
    edited = json.load(open(EDITED)) if os.path.exists(EDITED) else []
    for f in files:
        name = os.path.basename(f)[:-4]
        if name not in manifest:
            print("skip %s: no game model with that name" % name)
            continue
        js, binary = read_glb(f)
        anims = [a.get("name", "") for a in js.get("animations", [])]
        if name.startswith("char_"):
            missing = [a for a in CHAR_ANIMS if a not in anims]
            if missing:
                raise SystemExit("%s: missing animations %s (export with animations, mode Actions)" % (name, missing))
        lo, hi = bounds(js, binary)
        # glTF (x, y-up, z) -> game (x, y, z-up), the same mapping as tools/modeler.py.
        gmin = [float(lo[0]), float(lo[2]), float(lo[1])]
        gmax = [float(hi[0]), float(hi[2]), float(hi[1])]
        old = manifest[name]
        manifest[name] = {"min": gmin, "max": gmax, "animations": anims}
        shutil.copy(f, os.path.join(MODELS, name + ".glb"))
        if name not in edited:
            edited.append(name)
        print("%-14s size %s -> %s" % (name, [round(b - a) for a, b in zip(old["min"], old["max"])],
                                        [round(b - a) for a, b in zip(gmin, gmax)]))
    json.dump(manifest, open(manifest_path, "w"), indent=1, sort_keys=True)
    os.makedirs(os.path.dirname(EDITED), exist_ok=True)
    json.dump(sorted(edited), open(EDITED, "w"), indent=1)
    subprocess.check_call([sys.executable, os.path.join(ROOT, "tools", "build_project.py")])


if __name__ == "__main__":
    main()
