# Editing Potion Shop models in Blender

This folder is a small kit for reshaping the game's models in Blender and putting them back in the game.

| File | What it is |
| --- | --- |
| `models/char_owner.glb` | The shop owner, with 7 animations: Idle, Walk, Work, Sit, Cheer, Angry and Carry |
| `models/table_set.glb` | Waiting table with its chair (one seat) |
| `models/table_group_2.glb` … `table_group_5.glb` | Long tables used after prestiges (2–5 seats) |
| `models/cauldron.glb` | Cauldron on its stone fire pit |
| `models/liquid.glb` | The cauldron's liquid surface |
| `models/held_bottle.glb` | The bottle workers carry |
| `models/counter.glb` | The shop counter |
| `models/texture_atlas.png` | The shared colour texture, if you want to repaint colours |
| `import_into_current_scene.py` | Imports all of the above into the scene you have open |
| `export_for_game.py` | Exports the asset you selected as a game-ready `.glb` |

## Step by step

1. **Get the files.** Download the repository as a ZIP (GitHub → Code → Download ZIP, branch `claude/potion-shop-gdevelop-766frn`) and unzip it. Or download only the `art/blender` folder. Keep `models/` next to the two scripts.
2. **Import into your scene.**
   1. Open your scene in Blender.
   2. Go to the **Scripting** tab → **Text → Open…** → `art/blender/import_into_current_scene.py` → **Run Script** (▶ or Alt+P).
   3. A collection **Potion Shop assets** appears. It holds one collection per model, spread along the X axis.
3. **Edit.** Things that are easy to change:
   - **Owner:** reshape or replace each body part (head, hat, torso, arms, legs). The animations move whole parts, so as long as each part keeps its name and parent, it keeps animating.
     - To check a pose, pick an animation in the Action editor (Dope Sheet → Action Editor) and scrub the timeline.
     - Adding a new piece (a beard, a staff…)? Parent it to the part it should follow (for example the head or right arm) and it will move with it.
   - **Tables and chairs:** any shape you like. Keep the chair where it is (on the +Y side in Blender), because customers sit at that spot.
     - `table_set` is the normal table.
     - `table_group_N` are the long tables with N chairs 40 units apart.
   - **Cauldron:** keep its size about the same (about 100 units wide). The **liquid** is a separate model placed at the cauldron's rim.
   - **Colours:** the models use `texture_atlas.png`. Repaint it, assign your own materials, or use plain colours. Liquids must keep a material named **`unlit`**, because the game recolours that material for each potion.
4. **Rules that keep things working.**
   - **Scale:** 1 Blender unit = 1 game pixel, so the owner is about 92 units tall. Zoom out rather than scaling objects.
   - **Position:** keep each model centred on the origin with its base on the ground (Z = 0), facing the same way. The import script moved models along X only so you can see them side by side; the export script moves them back.
   - **Size:** the game uses each model's new size automatically, but very different proportions can make it bump into furniture.
5. **Export.** Select any part of the edited asset and run `export_for_game.py` the same way as the import script. The file appears in `art/blender/exported/` with the right name, for example `char_owner.glb`.
6. **Give the files to me.** Commit them to the repository in `art/blender/exported/`, or upload them here in the chat. I then run `tools/blender/update_models.py`, which:
   - checks the files (characters need all 7 animations);
   - copies them into the game and measures their new size;
   - rebuilds the GDevelop project.

   After that the play link, the home-screen app and the Playgama zip can be rebuilt.

## Export settings, if you export by hand

**File → Export → glTF 2.0 (.glb)**, with these settings:
- Format: **glTF Binary (.glb)**
- Include → **Selected Objects**
- Transform → **+Y Up** (on)
- Data → Mesh → Vertex Color: **Active**, which keeps the soft shading baked into the blocks
- Animation → on, mode **Actions**

Name the file exactly like the original (`char_owner.glb`, `table_set.glb`, …).
