# Potion Shop: import the editable game models into the Blender scene you have open.
#
# How to use (Blender 4.x / 5.x):
#   1. Open your scene in Blender.
#   2. Scripting workspace -> Text -> Open... -> pick this file -> Run Script (or Alt+P).
#   3. Each model lands in its own collection inside "Potion Shop assets",
#      spread along the X axis so they don't overlap.
#
# The models must stay in the same folder layout as in the repository:
#   art/blender/import_into_current_scene.py   (this file)
#   art/blender/models/*.glb
#
# Scale: the game uses 1 unit = 1 game pixel, so the owner is about 92 units
# tall. Don't rescale objects for comfort; zoom out instead (the script sets
# the viewport clip distance for you).
import os

import bpy

txt = bpy.context.space_data.text if bpy.context.space_data and hasattr(bpy.context.space_data, "text") else None
HERE = os.path.dirname(bpy.path.abspath(txt.filepath)) if txt and txt.filepath else os.path.dirname(bpy.data.filepath)
MODELS = os.path.join(HERE, "models")

# The editable models, in the order they are laid out.
ASSETS = [
    "char_owner",      # the shop owner (animated: Idle, Walk, Work, Sit, Cheer, Angry, Carry)
    "table_set",       # waiting table + chair (one seat)
    "table_group_2",   # long tables after prestiges (2 to 5 seats)
    "table_group_3",
    "table_group_4",
    "table_group_5",
    "cauldron",        # cauldron on its fire pit
    "liquid",          # cauldron liquid surface (tinted per potion in the game)
    "held_bottle",     # bottle the workers carry (liquid tinted in the game)
    "counter",         # shop counter
]
SPACING = 260.0


def main():
    if not os.path.isdir(MODELS):
        raise RuntimeError("Folder not found: %s (keep this script next to the models folder)" % MODELS)
    root = bpy.data.collections.get("Potion Shop assets") or bpy.data.collections.new("Potion Shop assets")
    if root.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(root)
    x = 0.0
    for name in ASSETS:
        path = os.path.join(MODELS, name + ".glb")
        if not os.path.exists(path):
            print("missing", path)
            continue
        col = bpy.data.collections.new(name)
        root.children.link(col)
        # Import into this collection.
        layer = bpy.context.view_layer
        layer.active_layer_collection = _find_layer_collection(layer.layer_collection, col.name)
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=path)
        new = [o for o in bpy.data.objects if o not in before]
        # Move the whole asset (its top-level objects) along X for display only.
        # export_for_game.py puts it back at the origin when exporting.
        for o in new:
            if o.parent is None:
                o.location.x += x
                o["potion_display_offset"] = x
        col["potion_asset"] = name
        x += SPACING
    for area in bpy.context.screen.areas:
        if area.type == "VIEW_3D":
            for space in area.spaces:
                if space.type == "VIEW_3D":
                    space.clip_end = 100000.0
    print("Potion Shop assets imported:", ", ".join(ASSETS))


def _find_layer_collection(lc, name):
    if lc.collection.name == name:
        return lc
    for child in lc.children:
        found = _find_layer_collection(child, name)
        if found:
            return found
    return None


main()
