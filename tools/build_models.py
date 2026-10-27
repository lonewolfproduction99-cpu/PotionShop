"""Generate every GLB model used by Potion Shop and write a size manifest."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from characters import CHARACTERS, build_character  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "models")
PROP_SCALE = 1.35


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    manifest_path = os.path.join(OUT, "manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        manifest = json.load(open(manifest_path))
    builders = {}
    for name, spec in CHARACTERS.items():
        builders["char_" + name] = (lambda n=name, s=spec: build_character("char_" + n, s))
    try:
        import props
        builders.update(props.BUILDERS)
    except ImportError:
        pass
    # Models edited by hand in Blender (tools/blender/update_models.py) are kept.
    edited_path = os.path.join(os.path.dirname(__file__), "..", "art", "blender", "edited.json")
    edited = set(json.load(open(edited_path))) if os.path.exists(edited_path) else set()
    for name, fn in builders.items():
        if only and name not in only:
            continue
        if name in edited:
            print(name, "kept (edited in Blender)")
            continue
        model = fn()
        # Furniture and characters are authored small and scaled up together;
        # the room shell and the exterior are authored at their final size.
        scale = 1.0 if name in ("room", "exterior", "garden") else PROP_SCALE
        info = model.save(os.path.join(OUT, name + ".glb"), scale)
        manifest[name] = info
        print(name, info["min"], info["max"])
    json.dump(manifest, open(manifest_path, "w"), indent=1, sort_keys=True)


if __name__ == "__main__":
    main(sys.argv[1:] or None)
