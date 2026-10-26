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

## Progression (Milestone 2)

- **7 potions**, unlocked by shop level:
  - Healing and Energy (level 1);
  - Mana (2), Strength (3), Speed (4);
  - Night Vision (5) and Fire Shield (6).
- **Herb pantry:** 20 of each herb to start; the Bigger Pantry upgrade adds 10 per level. The bag icon in the top bar warns when a known recipe can't be brewed.
- **Upgrades:** Quick Brew, Swift Shoes, Quick Hands, Cozy Decor, Fine Bottles and Bigger Pantry, with costs that rise each level.
- **Expansion:** up to 6 table slots and 3 cauldrons. They appear in the shop when bought.
- **Customers:** 7 types (some arrive from later levels) with different patience, tips and speed. When all tables are full, up to 4 customers queue outside the door and come in first-come, first-served.

## Workers (Milestone 3)

- **Apprentices:** hire Pip (shop level 2, 150g), Maple (level 3, 500g) and Bramble (level 5, 1500g) in the **Workers** tab.
- **What they do on their own:** collect finished potions, bring potions from the counter, take orders (most impatient customer first), and start brewing for orders nobody is making yet. The owner keeps following your taps.
- **No double work:** a job is claimed by one worker at a time. A small worker badge on a customer's bubble shows an apprentice is on it.
- **Roles:** All jobs, Orders & delivery, or Brewing only. Tap the blue button on an apprentice's card to switch.
- **Training:** each apprentice has Speed, Brewing and Service upgrades (5 levels each), with costs that rise per level and per apprentice.
- **Save format version 2:** progress is split into `meta`, which is kept forever (shop level, XP, stats, prestige, gems), and `run`, which resets on a future prestige (gold, herbs, upgrades, potions, workers). Version 1 saves migrate automatically.

## Advanced crafting (Milestone 4)

- **Extra herb (optional third slot):** each recipe has a secret bonus herb.
  - Use it to brew **Fine** quality. The first time, it's recorded as a discovery and shown in the recipe book.
  - Any other extra herb makes **Poor** quality and may cause an accident.
- **Quality** changes the price (Poor ×0.6, Standard ×1, Fine ×1.4, Superb ×2), tips and satisfaction. Finished potions show their quality as stars.
- **Accidents:** a risky brew bubbles over with dark foam, then explodes into smoke and a glowing spill.
  - The cauldron can't be used until someone cleans it: tap it, or let an apprentice handle it.
  - Cleaning shows a circular broom-icon ring. Nothing is ever destroyed.
- **Rare herbs:**
  - **Starbloom** makes Superb quality.
  - **Glowcap** makes Fine quality, brews twice as fast and never explodes.
  - Both are found in the garden, and sold in the Herb shop from level 6.
- **Upgrades:** Safety Goggles (fewer accidents) and Master Brewer (a chance of one quality level higher).
- **Herb Garden** (Herb shop → *Visit the Herb Garden*, from shop level 2): a separate `Garden` scene shown on top of the paused shop.
  - Tap a ripe plant to gather it, with a circular progress ring.
  - Plots regrow in real time, and rare herbs glow. The well gives Moonwater. (Since Milestone 6 you choose what to plant; see below.)
  - Herbs go into the shop's pantry.

## Polish (Milestone 5)

- **First-time tutorial:** a hand and a banner guide new players step by step. The hints adapt to what the player does, the current part is saved, and **Skip** ends it at any time.
  1. Take an order, brew and deliver the first potion.
  2. Brew a better potion: the hand shows how to add the recipe's bonus herb as a third ingredient for Fine quality, and warns that a wrong extra herb makes Poor quality or an accident.
  3. Open the **Upgrades** tab and buy an upgrade. If none is affordable yet, an OK button moves on.
  4. Open the **Herb shop** and buy the herb that is running lowest.
  5. Visit the **Herb Garden** once it opens at shop level 2 (until then the tutorial waits quietly). Plant a herb, then learn about speed-ups and harvesting.
- **Art:** a round iron cauldron on a stone fire pit. Its liquid takes each potion's color and flickers dark before an accident. Workers carry a real bottle in their hands, with a carrying pose.
- **Audio:** a cozy background music loop, with separate Sounds and Music switches in Settings.
- **Offline earnings:** with at least one apprentice, the shop earns part of your recent income while the game is closed, up to 2 hours. A "Welcome back!" panel collects it.
- **Busier when happy:** high satisfaction brings customers a little more often.
- **Big numbers** display as 12.3k, 4.6M, 1.2B and 3.4T, ready for prestige costs.
- **Performance:** the number of effect particles is capped. Shadows can be turned off in Settings.

## Prestige, long tables and the garden (Milestone 6)

- **Prestige** (Expand tab → *Prestige*): unlocks once every shop upgrade is maxed and every apprentice is hired. The details panel lists what is still missing.
  - **Kept:** shop level, gems, **Potion Mastery**, discovered recipes and stats.
  - **Reset:** gold, herbs, shop upgrades, tables, cauldrons, apprentices and the garden.
  - Each prestige gives gems (20 × the new prestige level). The top bar shows the prestige level under the star (P1, P2, ...).
- **Scaling per prestige:**
  - potions sell for 3× more;
  - shop upgrades and apprentices cost 5× more;
  - herbs cost 2× more;
  - customers are a little less patient.
  - Costs reach millions after a few prestiges.
- **Potion Mastery** (Upgrades → *Mastery*): +15% price per level for one potion, up to level 10. Kept forever.
- **Long tables:** after prestige 1, each table becomes a long table with 2 seats, then 3, 4 and 5 (the maximum). Small decorations in the way are put aside.
- **Bigger orders:** a customer may order up to 1 potion per prestige level plus one (5 at most). Each potion is paid when it is delivered, with a tip based on the customer's patience at that moment. The customer stays at the table until every potion has arrived.
  - Their bubble shows each potion and ticks off delivered ones.
  - Workers deliver and brew each potion separately.
- **6 prestige potions:**
  - Frost and Love (prestige 1);
  - Invisibility and Luck (prestige 2);
  - Dragon and Grand Elixir (prestige 3).
  - They come with 5 new herbs: Frostberry, Emberpepper, Shadowmoss, Lucky Clover and Dragonscale.
- **Gifts:** a customer served before their patience drops below 90% has a 30% chance to leave a special herb (Starbloom or Glowcap) on top of paying.
- **Shop closing:** if satisfaction falls to 8% or lower, the shop closes and no new customers come.
  - Customers already inside can still be served.
  - Reopen with gold, 15 gems or a rewarded ad. Satisfaction restarts at 55%.
- **Garden planting:** plots start empty. Tap a plot to pick a herb and pay for its seeds. Rarer herbs grow longer: from 30 seconds for Redleaf to more than 6 minutes for Dragonscale.
  - Tap a growing plot to speed it up: finish now with gems or gold, or watch an ad to halve the time left.
  - Each harvest gives 4 herbs (5 from shop level 8), with a 12% chance of a bonus special herb. The well still gives Moonwater on its own.
- **Gems:** earned on level-ups (3 each) and prestiges. They are used to reopen the shop and to finish garden plots.
- **Rewarded ads:** always optional, limited to 10 per day. This web build shows a 3-second placeholder; real ads, an ad-free option and coin packs need the mobile app build (a later milestone).
- **Narrow phones:** on narrow screens the satisfaction meter moves to the second row of the top bar.

## Installable web app (PWA) and rewarded ads

The exported build in `docs/` is also a Progressive Web App:
- install it with Add to Home Screen (iPhone Safari) or Install app (Android Chrome);
- it plays offline after the first launch and updates cleanly when a new version is deployed;
- it has a rewarded-ad adapter that only grants a reward when a real ad network confirms it.

`docs/` uses clearly labelled **simulated test ads**. The production deploy to Cloudflare Pages (`.github/workflows/deploy.yml`) uses no ads until an ad network approves the game. Setup, provider research and the steps that need your accounts are in **[pwa/README.md](pwa/README.md)**.

## Playgama release

`releases/potion-shop-playgama.zip` is the upload for Playgama. It has Bridge SDK integration, saves through Bridge storage, interstitial and rewarded ads through Bridge, and pause/mute on platform events. Build it with `python3 tools/platforms/build_playgama.py`. Upload steps and suggested listing text are in **[platforms/playgama/README.md](platforms/playgama/README.md)**.

## Project structure

| Path | What it is |
| --- | --- |
| `game/PotionShop.json` | The GDevelop project: scene, objects, layers, lights, events and global variables |
| `game/assets/models/*.glb` | Blocky 3D models: shop, furniture, cauldron, 8 characters with Idle/Walk/Work/Sit/Cheer/Angry animations |
| `game/assets/ui/*.png` | Icons, panels, buttons and the 48-frame circular progress ring |
| `game/assets/sfx/*.wav` | Sound effects |
| `src/*.js` | Game systems. Each file is one JavaScript event in the `Shop` scene's events sheet |
| `src/garden/*.js` | The herb garden, the JavaScript event of the `Garden` scene |
| `tools/` | Asset generators, project builder, export script and Playwright play-tests |
| `docs/` | Exported HTML5 build with the PWA layer (test build, simulated ads) |
| `platforms/playgama/` | Playgama Bridge integration and config (applied by `tools/platforms/build_playgama.py`) |
| `releases/` | Ready-to-upload builds (Playgama zip) |
| `pwa/` | PWA layer: service worker template, ad adapter, ad configs, icons (applied by `tools/pwa/apply_pwa.py`) |

### Editing in GDevelop

- **Recipes, ingredients, customer types, upgrades and balance values** are in **Project manager → Global variables**: `Recipes`, `Ingredients`, `CustomerTypes`, `Upgrades`, `WorkerTypes` and `Balance`. To add a potion, add a `Recipes` entry and give it a potion icon animation in the `Icon` object.
  - `Prestige` on a recipe or herb sets the prestige level that unlocks it.
  - `GrowTime` on a herb is its garden growing time in seconds.
  - The prestige multipliers, gem rewards, gift chance, closing threshold and daily ad limit are in `Balance`.
- **Long tables** are the `TableGroup2` to `TableGroup5` objects. They replace each `TableSet` at runtime after prestiges.
- **Tables (`TableSet`) and cauldrons (`Cauldron`)** are placed in the `Shop` scene. Their `Order` instance variable is the order in which they are bought. Furniture in the `NavObstacles` group automatically blocks walking.
- **Walls and waypoints** (door, queue spots, spawn points, the owner's home spot) are on the hidden `Nav` layer.
- **Game logic** lives in the JavaScript events of the `Shop` scene: data, utilities, navigation (A* pathfinding), save system, world (customers, seating, queue, patience), workers (task queue), brewing, interface, and the main loop.

### Rebuilding from the tools (optional)

```
python3 tools/build_models.py    # 3D models   -> game/assets/models
python3 tools/build_ui.py        # UI images   -> game/assets/ui
python3 tools/build_sfx.py       # sounds and music -> game/assets/sfx
python3 tools/build_project.py   # GDevelop project (embeds src/*.js as events)
tools/export.sh <GDevelop portable app dir> docs   # HTML5 export with the official GDevelop CLI
node tools/test/play.js docs out loop              # headless play-test (also: smoke, queue, saveload, m2, m3, m4, m5, m6, tutorial, pwa, prodads, playgama, bot, showcase)
```

Note: `build_project.py` regenerates `game/PotionShop.json`. If you edit the project in GDevelop, keep working in GDevelop or port your changes back to the tools.

## GitHub Pages

The build in `docs/` is served by GitHub Pages once it is enabled: **Settings → Pages → Build and deployment → Deploy from a branch**, then pick the branch and the `/docs` folder. The game is then at `https://lonewolfproduction99-cpu.github.io/PotionShop/`.

## Credits

- Font: Lilita One by Juan Montoreano (SIL Open Font License, see `game/assets/fonts/LilitaOne-OFL.txt`).
- All 3D models, textures, icons and sounds were generated procedurally for this project by the scripts in `tools/`.
