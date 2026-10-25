"""
Tiny blocky-model builder that writes binary glTF (.glb) files for GDevelop.

Authoring frame (same as a GDevelop scene):
    X = right, Y = towards the camera / "south", Z = up.
Units are GDevelop pixels, so a model authored 60 units tall is 60 pixels
tall in the game when the object size matches the model size.

GDevelop's 3D model object is configured with rotationX = 90, which maps glTF
(gx, gy, gz) to GDevelop (gx, gz, gy). The writer converts authoring
coordinates to glTF space with that mapping and fixes the triangle winding.

Every box face references a texture tile by name. Tiles are painted by the
functions registered in textures.py and packed in a per-model atlas. Large
surfaces can instead use a repeating texture ("rep:<name>").
"""

import io
import json
import math
import struct

import numpy as np
from PIL import Image

import textures

TILE = textures.TILE  # Tile size in pixels inside the atlas.

FACE_DIRS = {
    # name: (axis, sign)
    "east": (0, 1),
    "west": (0, -1),
    "south": (1, 1),
    "north": (1, -1),
    "top": (2, 1),
    "bottom": (2, -1),
}


def to_gltf(p):
    x, y, z = p
    return (x, z, y)


def rotation_matrix(rx, ry, rz):
    """Authoring-frame rotation matrix (degrees), X applied first, then Y, then Z."""
    a, b, c = (math.radians(v) for v in (rx, ry, rz))
    Rx = np.array([[1, 0, 0], [0, math.cos(a), -math.sin(a)], [0, math.sin(a), math.cos(a)]])
    Ry = np.array([[math.cos(b), 0, math.sin(b)], [0, 1, 0], [-math.sin(b), 0, math.cos(b)]])
    Rz = np.array([[math.cos(c), -math.sin(c), 0], [math.sin(c), math.cos(c), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


def quat_from_euler_deg(rx, ry, rz):
    """Rotation in authoring frame (degrees, applied X then Y then Z) -> glTF quaternion."""
    # Convert to glTF axes: authoring X->gx, Y->gz, Z->gy.
    # Authoring frame is mirrored relative to glTF, so rotation angles about
    # the swapped axes change sign.
    ax = math.radians(rx)  # around gx (sign chosen so +rx swings limbs forward)
    ay = math.radians(-rz)  # around gy (authoring Z)
    az = math.radians(-ry)  # around gz (authoring Y)

    def q_axis(axis, ang):
        s = math.sin(ang / 2)
        c = math.cos(ang / 2)
        return [axis[0] * s, axis[1] * s, axis[2] * s, c]

    def q_mul(a, b):
        ax_, ay_, az_, aw = a
        bx, by, bz, bw = b
        return [
            aw * bx + ax_ * bw + ay_ * bz - az_ * by,
            aw * by - ax_ * bz + ay_ * bw + az_ * bx,
            aw * bz + ax_ * by - ay_ * bx + az_ * bw,
            aw * bw - ax_ * bx - ay_ * by - az_ * bz,
        ]

    qx = q_axis((1, 0, 0), ax)
    qz = q_axis((0, 0, 1), az)
    qy = q_axis((0, 1, 0), ay)
    # Apply X first, then authoring Y (gz), then authoring Z (gy).
    return q_mul(qy, q_mul(qz, qx))


class Node:
    def __init__(self, name, pivot, parent):
        self.name = name
        self.pivot = pivot  # absolute authoring position of the pivot
        self.parent = parent
        # material -> lists
        self.prims = {}


class Model:
    def __init__(self, name, nearest=True):
        self.name = name
        self.nodes = {"root": Node("root", (0, 0, 0), None)}
        self.node_order = ["root"]
        self.tiles = []  # tile names, index = atlas slot
        self.tile_index = {}
        self.rep_textures = []
        self.animations = []
        self.nearest = nearest
        self.unlit_tiles = set()
        self.offset = (0, 0, 0)  # added to every box/cylinder (compose models)

    # ------------------------------------------------------------------ nodes
    def node(self, name, pivot, parent="root"):
        self.nodes[name] = Node(name, tuple(pivot), parent)
        self.node_order.append(name)
        return name

    def _tile(self, name):
        if name not in self.tile_index:
            self.tile_index[name] = len(self.tiles)
            self.tiles.append(name)
        return self.tile_index[name]

    def _prim(self, node, material):
        n = self.nodes[node]
        if material not in n.prims:
            n.prims[material] = {"pos": [], "nrm": [], "uv": [], "col": [], "idx": []}
        return n.prims[material]

    # ------------------------------------------------------------------ geometry
    def quad(self, node, corners, normal, tile, tint=(1, 1, 1), uv=None, shade=None, unlit=False, xf=None):
        """corners: 4 absolute authoring points in order (tl, tr, br, bl) as seen from outside."""
        if xf is not None:
            corners = [xf(c) for c in corners]
            normal = xf(normal, True)
        if tile.startswith("rep:"):
            material = tile
            if tile not in self.rep_textures:
                self.rep_textures.append(tile)
        else:
            material = "unlit" if (unlit or tile in self.unlit_tiles) else "atlas"
        prim = self._prim(node, material)
        piv = self.nodes[node].pivot
        base = len(prim["pos"])
        if uv is None:
            uv = [(0, 0), (1, 0), (1, 1), (0, 1)]
        if not tile.startswith("rep:"):
            slot = self._tile(tile)
            uv = [self._atlas_uv(slot, u, v) for (u, v) in uv]
        shade = shade or [1, 1, 1, 1]
        for i, c in enumerate(corners):
            rel = (c[0] - piv[0], c[1] - piv[1], c[2] - piv[2])
            prim["pos"].append(to_gltf(rel))
            prim["nrm"].append(to_gltf(normal))
            prim["uv"].append(uv[i])
            s = shade[i]
            prim["col"].append((tint[0] * s, tint[1] * s, tint[2] * s, 1.0))
        # Winding: make (v1-v0)x(v2-v0) point along the normal in glTF space.
        p = [np.array(prim["pos"][base + i]) for i in range(4)]
        n = np.array(to_gltf(normal))
        if np.dot(np.cross(p[1] - p[0], p[2] - p[0]), n) >= 0:
            prim["idx"] += [base, base + 1, base + 2, base, base + 2, base + 3]
        else:
            prim["idx"] += [base, base + 2, base + 1, base, base + 3, base + 2]

    def _atlas_uv(self, slot, u, v):
        # Tiles are padded in the atlas; stay half a texel inside the tile.
        cols = textures.ATLAS_COLS
        px = (slot % cols) * textures.SLOT + textures.PAD
        py = (slot // cols) * textures.SLOT + textures.PAD
        u = 0.5 + u * (TILE - 1)
        v = 0.5 + v * (TILE - 1)
        return ((px + u) / textures.ATLAS_PX, (py + v) / textures.ATLAS_PX)

    def box(self, x, y, z, sx, sy, sz, tiles, node="root", tint=(1, 1, 1),
            faces=None, rep_scale=64.0, ao=True, unlit=False, rot=None, pivot=None):
        """Axis-aligned box. (x, y, z) is the minimum corner (west, north, bottom).

        tiles: a tile name for all faces, or a dict with keys among
        'all', 'side', 'top', 'bottom', 'north', 'south', 'east', 'west'.
        """
        if isinstance(tiles, str):
            tiles = {"all": tiles}
        faces = faces or ["east", "west", "south", "north", "top", "bottom"]
        x, y, z = x + self.offset[0], y + self.offset[1], z + self.offset[2]
        if pivot:
            pivot = (pivot[0] + self.offset[0], pivot[1] + self.offset[1], pivot[2] + self.offset[2])
        x0, y0, z0 = x, y, z
        x1, y1, z1 = x + sx, y + sy, z + sz
        xf = None
        if rot:
            R = rotation_matrix(*rot)
            pc = np.array(pivot if pivot else (x + sx / 2, y + sy / 2, z + sz / 2))

            def xf(p, is_dir=False, R=R, pc=pc):
                if is_dir:
                    return tuple(R @ np.array(p, dtype=float))
                return tuple(R @ (np.array(p, dtype=float) - pc) + pc)
        for f in faces:
            if f == "top":
                t = tiles.get("top", tiles.get("all"))
            elif f == "bottom":
                t = tiles.get("bottom", tiles.get("side", tiles.get("all")))
            else:
                t = tiles.get(f, tiles.get("side", tiles.get("all")))
            if t is None:
                continue
            # Corners as seen from outside: tl, tr, br, bl
            if f == "south":
                c = [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)]
                n = (0, 1, 0)
                w, h = sx, sz
            elif f == "north":
                c = [(x1, y0, z1), (x0, y0, z1), (x0, y0, z0), (x1, y0, z0)]
                n = (0, -1, 0)
                w, h = sx, sz
            elif f == "east":
                c = [(x1, y1, z1), (x1, y0, z1), (x1, y0, z0), (x1, y1, z0)]
                n = (1, 0, 0)
                w, h = sy, sz
            elif f == "west":
                c = [(x0, y0, z1), (x0, y1, z1), (x0, y1, z0), (x0, y0, z0)]
                n = (-1, 0, 0)
                w, h = sy, sz
            elif f == "top":
                c = [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
                n = (0, 0, 1)
                w, h = sx, sy
            else:  # bottom
                c = [(x0, y1, z0), (x1, y1, z0), (x1, y0, z0), (x0, y0, z0)]
                n = (0, 0, -1)
                w, h = sx, sy
            uv = None
            if t.startswith("rep:"):
                if f == "south":
                    o = (x0, z1)
                elif f == "north":
                    o = (-x1, z1)
                elif f == "east":
                    o = (-y1, z1)
                elif f == "west":
                    o = (y0, z1)
                else:
                    o = (x0, y0)
                if f in ("top", "bottom"):
                    uv = [(o[0] / rep_scale, o[1] / rep_scale),
                          ((o[0] + w) / rep_scale, o[1] / rep_scale),
                          ((o[0] + w) / rep_scale, (o[1] + h) / rep_scale),
                          (o[0] / rep_scale, (o[1] + h) / rep_scale)]
                else:
                    uv = [(o[0] / rep_scale, -o[1] / rep_scale),
                          ((o[0] + w) / rep_scale, -o[1] / rep_scale),
                          ((o[0] + w) / rep_scale, (-o[1] + h) / rep_scale),
                          (o[0] / rep_scale, (-o[1] + h) / rep_scale)]
            shade = None
            if ao and f not in ("top", "bottom"):
                # Fake ambient occlusion: darker near the bottom of vertical faces.
                shade = [1.0, 1.0, 0.82, 0.82]
            elif f == "bottom":
                shade = [0.7, 0.7, 0.7, 0.7]
            self.quad(node, c, n, t, tint=tint, uv=uv, shade=shade, unlit=unlit, xf=xf)

    def cyl(self, cx, cy, z, r, h, tiles, segments=8, node="root", tint=(1, 1, 1),
            top=True, bottom=False, r_top=None, unlit=False):
        """Faceted cylinder (low-poly), axis along Z."""
        if isinstance(tiles, str):
            tiles = {"all": tiles}
        cx, cy, z = cx + self.offset[0], cy + self.offset[1], z + self.offset[2]
        side = tiles.get("side", tiles.get("all"))
        cap = tiles.get("top", tiles.get("all"))
        rt = r if r_top is None else r_top
        for i in range(segments):
            a0 = 2 * math.pi * i / segments
            a1 = 2 * math.pi * (i + 1) / segments
            p0 = (cx + r * math.cos(a0), cy + r * math.sin(a0))
            p1 = (cx + r * math.cos(a1), cy + r * math.sin(a1))
            q0 = (cx + rt * math.cos(a0), cy + rt * math.sin(a0))
            q1 = (cx + rt * math.cos(a1), cy + rt * math.sin(a1))
            am = (a0 + a1) / 2
            n = (math.cos(am), math.sin(am), 0)
            c = [(q1[0], q1[1], z + h), (q0[0], q0[1], z + h), (p0[0], p0[1], z), (p1[0], p1[1], z)]
            self.quad(node, c, n, side, tint=tint, uv=[(1, 0), (0, 0), (0, 1), (1, 1)],
                      shade=[1, 1, 0.85, 0.85], unlit=unlit)
        if top:
            self._disc(node, cx, cy, z + h, rt, segments, cap, tint, up=True, unlit=unlit)
        if bottom:
            self._disc(node, cx, cy, z, r, segments, cap, tint, up=False, unlit=unlit)

    def _disc(self, node, cx, cy, z, r, segments, tile, tint, up=True, unlit=False):
        for i in range(segments):
            a0 = 2 * math.pi * i / segments
            a1 = 2 * math.pi * (i + 1) / segments
            p0 = (cx + r * math.cos(a0), cy + r * math.sin(a0), z)
            p1 = (cx + r * math.cos(a1), cy + r * math.sin(a1), z)
            c = (cx, cy, z)
            uv = [(0.5 + 0.5 * math.cos(a0), 0.5 + 0.5 * math.sin(a0)),
                  (0.5 + 0.5 * math.cos(a1), 0.5 + 0.5 * math.sin(a1)),
                  (0.5, 0.5), (0.5, 0.5)]
            n = (0, 0, 1 if up else -1)
            self.quad(node, [p0, p1, c, c], n, tile, tint=tint, uv=uv, unlit=unlit)

    # ------------------------------------------------------------------ animation
    def animation(self, name, duration, tracks):
        """tracks: list of (node, 'rotation'|'translation', [(t, value), ...]).

        rotation values are (rx, ry, rz) degrees in authoring frame.
        translation values are authoring offsets added to the rest pivot.
        """
        self.animations.append((name, duration, tracks))

    # ------------------------------------------------------------------ export
    def bounds(self):
        mins = np.array([1e9, 1e9, 1e9])
        maxs = -mins
        for n in self.nodes.values():
            for prim in n.prims.values():
                if not prim["pos"]:
                    continue
                pts = np.array(prim["pos"])  # glTF space, relative to pivot
                piv = np.array(to_gltf(n.pivot))
                pts = pts + piv
                mins = np.minimum(mins, pts.min(axis=0))
                maxs = np.maximum(maxs, pts.max(axis=0))
        # back to authoring: (gx, gy, gz) -> (X=gx, Y=gz, Z=gy)
        amin = (mins[0], mins[2], mins[1])
        amax = (maxs[0], maxs[2], maxs[1])
        return amin, amax

    def save(self, path, scale=1.0):
        atlas = textures.build_atlas(self.tiles)
        self.scale = scale
        bin_chunks = bytearray()
        buffer_views = []
        accessors = []

        def add_view(data, target=None):
            nonlocal bin_chunks
            while len(bin_chunks) % 4:
                bin_chunks.append(0)
            off = len(bin_chunks)
            bin_chunks += data
            bv = {"buffer": 0, "byteOffset": off, "byteLength": len(data)}
            if target:
                bv["target"] = target
            buffer_views.append(bv)
            return len(buffer_views) - 1

        def add_accessor(arr, comp_type, typ, target=None, minmax=False):
            arr = np.ascontiguousarray(arr)
            view = add_view(arr.tobytes(), target)
            acc = {"bufferView": view, "componentType": comp_type, "count": int(arr.shape[0]), "type": typ}
            if minmax:
                acc["min"] = [float(v) for v in arr.min(axis=0)]
                acc["max"] = [float(v) for v in arr.max(axis=0)]
            accessors.append(acc)
            return len(accessors) - 1

        images = []
        textures_js = []
        materials = []
        samplers = [{"magFilter": 9728 if self.nearest else 9729,
                     "minFilter": 9986 if self.nearest else 9987,
                     "wrapS": 10497, "wrapT": 10497}]
        mat_index = {}

        def add_image(img):
            b = io.BytesIO()
            img.save(b, format="PNG", optimize=True)
            v = add_view(b.getvalue())
            images.append({"bufferView": v, "mimeType": "image/png"})
            textures_js.append({"sampler": 0, "source": len(images) - 1})
            return len(textures_js) - 1

        used_materials = set()
        for n in self.nodes.values():
            used_materials.update(n.prims.keys())
        atlas_tex = None
        if "atlas" in used_materials or "unlit" in used_materials:
            atlas_tex = add_image(atlas)
        for m in sorted(used_materials):
            if m in ("atlas", "unlit"):
                tex = atlas_tex
            else:
                tex = add_image(textures.build_repeat(m[4:]))
            mat = {"name": m, "pbrMetallicRoughness": {"baseColorTexture": {"index": tex},
                                                        "metallicFactor": 0.0, "roughnessFactor": 0.9}}
            if m == "unlit":
                mat["extensions"] = {"KHR_materials_unlit": {}}
                mat["emissiveFactor"] = [0.0, 0.0, 0.0]
            materials.append(mat)
            mat_index[m] = len(materials) - 1

        meshes = []
        nodes_js = []
        node_idx = {}
        for name in self.node_order:
            node_idx[name] = len(nodes_js)
            n = self.nodes[name]
            parent = self.nodes[n.parent] if n.parent else None
            rel = n.pivot if parent is None else tuple(n.pivot[i] - parent.pivot[i] for i in range(3))
            nj = {"name": name, "translation": [float(v) * scale for v in to_gltf(rel)]}
            prims = []
            for m, prim in n.prims.items():
                if not prim["idx"]:
                    continue
                pos = np.array(prim["pos"], dtype=np.float32) * scale
                nrm = np.array(prim["nrm"], dtype=np.float32)
                uv = np.array(prim["uv"], dtype=np.float32)
                col = np.array(prim["col"], dtype=np.float32)
                idx = np.array(prim["idx"], dtype=np.uint32 if len(pos) > 65000 else np.uint16)
                a_pos = add_accessor(pos, 5126, "VEC3", 34962, minmax=True)
                a_nrm = add_accessor(nrm, 5126, "VEC3", 34962)
                a_uv = add_accessor(uv, 5126, "VEC2", 34962)
                a_col = add_accessor(col, 5126, "VEC4", 34962)
                a_idx = add_accessor(idx, 5125 if idx.dtype == np.uint32 else 5123, "SCALAR", 34963)
                prims.append({"attributes": {"POSITION": a_pos, "NORMAL": a_nrm, "TEXCOORD_0": a_uv,
                                             "COLOR_0": a_col},
                              "indices": a_idx, "material": mat_index[m]})
            if prims:
                meshes.append({"name": name, "primitives": prims})
                nj["mesh"] = len(meshes) - 1
            nodes_js.append(nj)
        for name in self.node_order:
            n = self.nodes[name]
            if n.parent:
                p = nodes_js[node_idx[n.parent]]
                p.setdefault("children", []).append(node_idx[name])

        anims = []
        for (aname, duration, tracks) in self.animations:
            samplers_a = []
            channels = []
            for (node, prop, keys) in tracks:
                times = np.array([k[0] for k in keys], dtype=np.float32)
                if prop == "rotation":
                    vals = np.array([quat_from_euler_deg(*k[1]) for k in keys], dtype=np.float32)
                    typ = "VEC4"
                else:
                    n = self.nodes[node]
                    parent = self.nodes[n.parent] if n.parent else None
                    rest = n.pivot if parent is None else tuple(n.pivot[i] - parent.pivot[i] for i in range(3))
                    vals = np.array([to_gltf(tuple(rest[i] + k[1][i] for i in range(3))) for k in keys],
                                    dtype=np.float32) * scale
                    typ = "VEC3"
                a_in = add_accessor(times.reshape(-1, 1), 5126, "SCALAR", None, minmax=True)
                a_out = add_accessor(vals, 5126, typ)
                samplers_a.append({"input": a_in, "output": a_out, "interpolation": "LINEAR"})
                channels.append({"sampler": len(samplers_a) - 1,
                                 "target": {"node": node_idx[node], "path": prop}})
            anims.append({"name": aname, "samplers": samplers_a, "channels": channels})

        gltf = {
            "asset": {"version": "2.0", "generator": "PotionShop blocky modeler"},
            "scene": 0,
            "scenes": [{"nodes": [node_idx["root"]]}],
            "nodes": nodes_js,
            "meshes": meshes,
            "materials": materials,
            "textures": textures_js,
            "images": images,
            "samplers": samplers,
            "accessors": accessors,
            "bufferViews": buffer_views,
            "buffers": [{"byteLength": len(bin_chunks)}],
        }
        if any("extensions" in m for m in materials):
            gltf["extensionsUsed"] = ["KHR_materials_unlit"]
        if anims:
            gltf["animations"] = anims
        while len(bin_chunks) % 4:
            bin_chunks.append(0)
        js = json.dumps(gltf, separators=(",", ":")).encode()
        while len(js) % 4:
            js += b" "
        total = 12 + 8 + len(js) + 8 + len(bin_chunks)
        with open(path, "wb") as f:
            f.write(struct.pack("<III", 0x46546C67, 2, total))
            f.write(struct.pack("<II", len(js), 0x4E4F534A))
            f.write(js)
            f.write(struct.pack("<II", len(bin_chunks), 0x004E4942))
            f.write(bin_chunks)
        amin, amax = self.bounds()
        return {"min": [float(v) * scale for v in amin], "max": [float(v) * scale for v in amax],
                "animations": [a[0] for a in self.animations]}
