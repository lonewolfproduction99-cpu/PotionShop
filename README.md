# Potion Shop

A cozy 3D potion shop management game made with **GDevelop 5** (portrait, touch controls, mobile browsers first).

Customers walk in, sit at waiting tables and order potions. You take their orders, brew the potions in a cauldron, then deliver them before the customers run out of patience. Use the gold you earn to buy herbs, upgrades, more tables and more cauldrons.

## Open the project in GDevelop (browser)

The project is `game/PotionShop.json`. Its assets sit next to it in `game/assets/`.

- **Open in the GDevelop web editor:**
  https://editor.gdevelop.io/?project=https%3A%2F%2Fraw.githubusercontent.com%2Flonewolfproduction99-cpu%2FPotionShop%2Fclaude%2Fpotion-shop-gdevelop-766frn%2Fgame%2FPotionShop.json

  GDevelop loads the JSON from GitHub and fetches the assets relative to it. A project opened from a URL is read-only, so use **File → Save as** to keep your own copy (GDevelop Cloud or your computer).
- **Desktop GDevelop:** clone or download this repository and open `game/PotionShop.json`.

## Play in the browser

The exported HTML5 build is in `docs/`. It is published with GitHub Pages from that folder. See "GitHub Pages" below.

## How to play

- **Tap a seated customer** (the one with a 📝 badge) to send the owner to take their order.
- **Tap the cauldron** to open the brew panel. It is pre-filled with the oldest order's recipe. Pick 2 ingredients and press **BREW**. The owner adds the ingredients, then a circular progress ring shows the brew.
- **Tap the finished cauldron.** The owner collects the potion and delivers it to the customer who ordered it first (FIFO). Extra potions are kept on the counter.
- Every tap becomes a task in the owner's queue, up to 6 tasks. Purple numbers show the order the tasks will run in.
- Patience bars go from green to yellow to red. When patience runs out, the customer leaves without paying. Faster service earns bigger tips.
- Bottom menu: **Orders** (order list with a quick Brew button), **Herbs** (buy ingredients), **Upgrades**, **Workers**, **Expand** (tables and cauldrons). Gold price tags in the shop mark slots you can buy.

## Project structure

| Path | What it is |
| --- | --- |
| `game/PotionShop.json` | The GDevelop project: scene, objects, layers, lights, events and global variables |
| `game/assets/models/*.glb` | Blocky 3D models: shop, furniture, cauldron, 8 characters with Idle/Walk/Work/Sit/Cheer/Angry animations |
| `game/assets/ui/*.png` | Icons, panels, buttons and the 48-frame circular progress ring |
| `game/assets/sfx/*.wav` | Sound effects |
| `src/*.js` | Game systems. Each file is one JavaScript event in the scene's events sheet |
| `tools/` | Asset generators, project builder, export script and Playwright play-tests |
| `docs/` | Exported HTML5 build (GitHub Pages) |

### Editing in GDevelop

- **Recipes, ingredients, customer types, upgrades and balance values** are in **Project manager → Global variables**: `Recipes`, `Ingredients`, `CustomerTypes`, `Upgrades` and `Balance`. To add a potion, add a `Recipes` entry and give it a potion icon animation in the `Icon` object.
- **Tables (`TableSet`) and cauldrons (`Cauldron`)** are placed in the `Shop` scene. Their `Order` instance variable is the order in which they are bought. Furniture in the `NavObstacles` group automatically blocks walking.
- **Walls and waypoints** (door, queue spots, spawn points, the owner's home spot) are on the hidden `Nav` layer.
- **Game logic** lives in the JavaScript events of the `Shop` scene: data, utilities, navigation (A* pathfinding), save system, world (customers, seating, queue, patience), workers (task queue), brewing, interface, and the main loop.

### Rebuilding from the tools (optional)

```
python3 tools/build_models.py    # 3D models   -> game/assets/models
python3 tools/build_ui.py        # UI images   -> game/assets/ui
python3 tools/build_sfx.py       # sounds      -> game/assets/sfx
python3 tools/build_project.py   # GDevelop project (embeds src/*.js as events)
tools/export.sh <GDevelop portable app dir> docs   # HTML5 export with the official GDevelop CLI
node tools/test/play.js docs out loop              # headless play-test (also: smoke, queue, saveload, showcase)
```

Note: `build_project.py` regenerates `game/PotionShop.json`. If you edit the project in GDevelop, keep working in GDevelop or port your changes back to the tools.

## GitHub Pages

The build in `docs/` is served by GitHub Pages once it is enabled: **Settings → Pages → Build and deployment → Deploy from a branch**, then pick the branch and the `/docs` folder. The game is then at `https://lonewolfproduction99-cpu.github.io/PotionShop/`.

## Credits

- Font: Lilita One by Juan Montoreano (SIL Open Font License, see `game/assets/fonts/LilitaOne-OFL.txt`).
- All 3D models, textures, icons and sounds were generated procedurally for this project by the scripts in `tools/`.
