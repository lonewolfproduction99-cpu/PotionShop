# Potion Shop: export an edited model back to a game-ready .glb file.
#
# How to use:
#   1. Select any object of the asset you edited (for example a part of the owner).
#   2. Scripting workspace -> open this file -> Run Script.
#   3. The file is written to art/blender/exported/<asset>.glb, next to this script.
#      Send me those files (or commit them to the repository) and I put them in
#      the game; tools/blender/update_models.py does that.
#
# Rules that keep the model working in the game:
#   - Keep the asset at the origin, standing on the ground (Z = 0), facing the
#     same way. The import script moved each asset along X only for display;
#     this script removes that offset while exporting.
#   - Keep the size roughly the same (1 unit = 1 game pixel).
#   - Characters: keep the separate body parts (head, arms, legs...) and their
#     names; the animations move those parts. Edit their shapes freely.
#   - Liquids (cauldron liquid, bottle liquid): keep the material named "unlit";
#     the game recolours it for each potion.
import os

import bpy

txt = None
try:
    space = bpy.context.space_data
    txt = space.text if space is not None and hasattr(space, "text") else None
except AttributeError:
    pass
if "__file__" in globals() and os.path.isfile(__file__):
    HERE = os.path.dirname(os.path.abspath(__file__))
elif txt and txt.filepath:
    HERE = os.path.dirname(bpy.path.abspath(txt.filepath))
else:
    HERE = os.path.dirname(bpy.data.filepath)
OUT = os.path.join(HERE, "exported")


def asset_collection(obj):
    for col in obj.users_collection:
        c = col
        while c is not None:
            if "potion_asset" in c:
                return c
            c = next((p for p in bpy.data.collections if c.name in p.children), None)
    return None


def main():
    obj = bpy.context.active_object or (bpy.context.selected_objects[0] if bpy.context.selected_objects else None)
    if obj is None:
        raise RuntimeError("Select an object of the asset to export first.")
    col = asset_collection(obj)
    if col is None:
        raise RuntimeError("This object is not in a Potion Shop asset collection (import them with import_into_current_scene.py).")
    name = col["potion_asset"]
    objs = list(col.all_objects)
    tops = [o for o in objs if o.parent is None]
    # Back to the origin for export.
    offsets = {o.name: o.get("potion_display_offset", 0.0) for o in tops}
    for o in tops:
        o.location.x -= offsets[o.name]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name + ".glb")
    args = dict(filepath=path, export_format="GLB", use_selection=True, export_yup=True,
                export_animations=True, export_apply=False)
    try:
        bpy.ops.export_scene.gltf(export_animation_mode="ACTIONS", export_vertex_color="ACTIVE", **args)
    except TypeError:
        bpy.ops.export_scene.gltf(**args)  # older Blender versions
    finally:
        for o in tops:
            o.location.x += offsets[o.name]
    print("Exported", path)
    self_report = "Exported %s" % path
    if not bpy.app.background:  # a message box needs Blender's window
        bpy.context.window_manager.popup_menu(lambda m, c: m.layout.label(text=self_report), title="Potion Shop")


main()
