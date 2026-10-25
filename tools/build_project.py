"""
Assemble game/PotionShop.json, the GDevelop project, from:
  - the generated assets (game/assets/...),
  - the scene layout defined below,
  - the game data (recipes, ingredients, customers, upgrades),
  - the JavaScript systems in src/*.js (each file becomes a JavaScript event).

The output is a normal GDevelop 5 project: open it in the GDevelop editor
(web or desktop) to edit scenes, objects, variables and events.
"""

import glob
import json
import os
import uuid

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
GAME = os.path.join(ROOT, "game")
ASSETS = os.path.join(GAME, "assets")

_uuid_ns = uuid.UUID("6f1c2a52-6d8e-4f5e-9d39-1c2b3a4d5e6f")


def uid(key):
    """Deterministic UUIDs keep diffs small between builds."""
    return str(uuid.uuid5(_uuid_ns, key))


# ---------------------------------------------------------------- resources
def build_resources():
    res = []
    for f in sorted(glob.glob(os.path.join(ASSETS, "models", "*.glb"))):
        n = os.path.basename(f)
        res.append({"file": "assets/models/" + n, "kind": "model3D", "metadata": "", "name": n, "userAdded": True})
    for f in sorted(glob.glob(os.path.join(ASSETS, "ui", "*.png"))):
        n = os.path.basename(f)
        res.append({"file": "assets/ui/" + n, "kind": "image", "metadata": "", "name": n, "smoothed": True,
                    "userAdded": True})
    for f in sorted(glob.glob(os.path.join(ASSETS, "fonts", "*.ttf"))):
        n = os.path.basename(f)
        res.append({"file": "assets/fonts/" + n, "kind": "font", "metadata": "", "name": n, "userAdded": True})
    for f in sorted(glob.glob(os.path.join(ASSETS, "sfx", "*.wav"))):
        n = os.path.basename(f)
        res.append({"file": "assets/sfx/" + n, "kind": "audio", "metadata": "", "name": n, "preloadAsMusic": False,
                    "preloadAsSound": True, "preloadInCache": False, "userAdded": True})
    return res


# ---------------------------------------------------------------- objects
def var(name, value):
    if isinstance(value, bool):
        return {"name": name, "type": "boolean", "value": value}
    if isinstance(value, (int, float)):
        return {"name": name, "type": "number", "value": value}
    if isinstance(value, str):
        return {"name": name, "type": "string", "value": value}
    if isinstance(value, list):
        return {"name": name, "type": "array", "children": [var_child(v) for v in value]}
    if isinstance(value, dict):
        return {"name": name, "type": "structure", "children": [var(k, v) for k, v in value.items()]}
    raise TypeError(value)


def var_child(value):
    v = var("", value)
    v.pop("name")
    return v


def model_object(name, model, manifest, animations=None, shadows=True, receive=True, scale=1.0):
    info = manifest[model]
    mn = [min(0.0, v) * scale for v in info["min"]]
    mx = [max(0.0, v) * scale for v in info["max"]]
    return {
        "assetStoreId": "",
        "name": name,
        "persistentUuid": uid("obj-" + name),
        "type": "Scene3D::Model3DObject",
        "variables": [],
        "effects": [],
        "behaviors": [],
        "content": {
            "width": round(mx[0] - mn[0], 3),
            "height": round(mx[1] - mn[1], 3),
            "depth": round(mx[2] - mn[2], 3),
            "rotationX": 90,
            "rotationY": 0,
            "rotationZ": 0,
            "modelResourceName": model + ".glb",
            "materialType": "StandardWithoutMetalness",
            "originLocation": "ModelOrigin",
            "centerLocation": "ModelOrigin",
            "keepAspectRatio": True,
            "crossfadeDuration": 0.15,
            "isCastingShadow": shadows,
            "isReceivingShadow": receive,
            "animations": [{"name": a, "source": a, "loop": True} for a in (animations or [])],
        },
    }


def cube_object(name, image, size, material="Basic", tint="255;255;255"):
    faces = {}
    for f in ("front", "back", "left", "right", "top", "bottom"):
        faces[f + "FaceResourceName"] = image
        faces[f + "FaceVisible"] = f != "back"
        faces[f + "FaceResourceRepeat"] = False
    c = {
        "width": size[0],
        "height": size[1],
        "depth": size[2],
        "enableTextureTransparency": False,
        "facesOrientation": "Y",
        "backFaceUpThroughWhichAxisRotation": "X",
        "tileScale": 1,
        "materialType": material,
        "tint": tint,
        "isCastingShadow": False,
        "isReceivingShadow": False,
    }
    c.update(faces)
    return {"assetStoreId": "", "name": name, "persistentUuid": uid("obj-" + name), "type": "Scene3D::Cube3DObject",
            "variables": [], "effects": [], "behaviors": [], "content": c}


def sprite_frame(image):
    return {"hasCustomCollisionMask": False, "image": image, "points": [],
            "originPoint": {"name": "origine", "x": 0, "y": 0},
            "centerPoint": {"automatic": True, "name": "centre", "x": 0, "y": 0}, "customCollisionMask": []}


def sprite_object(name, animations, time_between=0.08, variables=None):
    anims = []
    for aname, frames in animations:
        anims.append({"name": aname, "useMultipleDirections": False,
                      "directions": [{"looping": False, "timeBetweenFrames": time_between,
                                      "sprites": [sprite_frame(f) for f in frames]}]})
    return {"adaptCollisionMaskAutomatically": False, "assetStoreId": "", "name": name,
            "persistentUuid": uid("obj-" + name), "type": "Sprite", "updateIfNotVisible": False,
            "variables": variables or [], "effects": [], "behaviors": [], "animations": anims}


def panel_object(name, image, size, margins):
    l, t, r, b = margins
    return {"assetStoreId": "", "name": name, "persistentUuid": uid("obj-" + name),
            "type": "PanelSpriteObject::PanelSprite", "variables": [], "effects": [], "behaviors": [],
            "texture": image, "width": size[0], "height": size[1], "leftMargin": l, "topMargin": t,
            "rightMargin": r, "bottomMargin": b, "tiled": False}


def text_object(name, font, size=28):
    return {
        "assetStoreId": "", "name": name, "persistentUuid": uid("obj-" + name), "type": "TextObject::Text",
        "variables": [], "effects": [], "behaviors": [],
        "bold": False, "italic": False, "smoothed": True, "underlined": False,
        "string": "Text", "font": font, "textAlignment": "left", "characterSize": size,
        "color": {"r": 255, "g": 255, "b": 255},
        "content": {"bold": False, "isOutlineEnabled": False, "isShadowEnabled": False, "italic": False,
                    "outlineColor": "40;24;16", "outlineThickness": 3, "shadowAngle": 90, "shadowBlurRadius": 2,
                    "shadowColor": "0;0;0", "shadowDistance": 3, "shadowOpacity": 127, "smoothed": True,
                    "underlined": False, "text": "Text", "font": font, "textAlignment": "left",
                    "verticalTextAlignment": "top", "characterSize": size, "lineHeight": 0,
                    "color": "255;255;255"},
    }


CHAR_ANIMS = ["Idle", "Walk", "Work", "Sit", "Cheer", "Angry"]
CHAR_SCALE = 1.0
CUSTOMER_OBJECTS = {
    "knight": "CustKnight", "elf": "CustElf", "farmer": "CustFarmer", "dwarf": "CustDwarf",
    "lady": "CustLady", "mage": "CustMage", "rogue": "CustRogue",
}


def build_objects(manifest):
    objs = []
    # 3D environment and furniture
    objs.append(model_object("Exterior", "exterior", manifest, shadows=False))
    objs.append(model_object("Room", "room", manifest))
    for name, model in (("Counter", "counter"), ("IngredientShelf", "ingredient_shelf"),
                        ("PotionRack", "potion_rack"), ("Bookshelf", "bookshelf"), ("Barrel", "barrel"),
                        ("Crates", "crates"), ("Plant", "plant"), ("Candelabra", "candelabra"),
                        ("TableSet", "table_set"), ("Cauldron", "cauldron"), ("SlotSign", "slot_sign")):
        objs.append(model_object(name, model, manifest))
    for o in objs:
        if o["name"] in ("TableSet", "Cauldron"):
            o["variables"] = [var("Order", 0)]
    # Characters
    # Characters are slightly larger than furniture scale for readability on phones.
    objs.append(model_object("Owner", "char_owner", manifest, CHAR_ANIMS, scale=CHAR_SCALE))
    for cid, oname in CUSTOMER_OBJECTS.items():
        objs.append(model_object(oname, "char_" + cid, manifest, CHAR_ANIMS, scale=CHAR_SCALE))
    # Brewing effects
    objs.append(cube_object("Liquid", "liquid.png", (62, 62, 4)))
    objs.append(cube_object("Bubble", "white.png", (6, 6, 6)))
    # Navigation helpers (hidden "Nav" layer)
    objs.append(sprite_object("NavBlock", [("", ["navblock.png"])]))
    objs.append(sprite_object("Waypoint", [("", ["navblock.png"])], variables=[var("Kind", ""), var("Order", 0)]))
    # Interface
    icons = sorted(os.path.basename(f)[:-4] for f in glob.glob(os.path.join(ASSETS, "ui", "*.png"))
                   if os.path.basename(f).split("_")[0] in ("icon", "potion", "ing", "mood"))
    objs.append(sprite_object("Icon", [(n, [n + ".png"]) for n in icons]))
    objs.append(sprite_object("RingFill", [("", ["ring_%02d.png" % i for i in range(49)])], time_between=9999))
    objs.append(sprite_object("RingBack", [("", ["ring_back.png"])]))
    objs.append(sprite_object("SpeechBubble", [("", ["bubble.png"])]))
    objs.append(sprite_object("Glow", [("", ["glow.png"])]))
    objs.append(panel_object("PanelWood", "panel_wood.png", (96, 96), (30, 30, 30, 30)))
    objs.append(panel_object("PanelParchment", "panel_parchment.png", (96, 96), (22, 22, 22, 22)))
    objs.append(panel_object("PanelDark", "panel_dark.png", (64, 64), (20, 20, 20, 20)))
    for c in ("Green", "Gold", "Red", "Gray", "Blue", "Purple"):
        objs.append(panel_object("Btn" + c, "btn_%s.png" % c.lower(), (64, 64), (18, 18, 18, 20)))
    objs.append(panel_object("BarBack", "bar_back.png", (64, 20), (9, 0, 9, 0)))
    objs.append(panel_object("BarFill", "bar_fill.png", (64, 20), (9, 0, 9, 0)))
    objs.append(text_object("UiText", "LilitaOne-Regular.ttf"))
    return objs


NAV_OBSTACLES = ["TableSet", "Cauldron", "Counter", "IngredientShelf", "PotionRack", "Bookshelf", "Barrel",
                 "Crates", "Plant", "Candelabra"]


# ---------------------------------------------------------------- layout
def inst(name, x, y, z=0, angle=0, layer="", variables=None, size=None, key=None):
    d = {"angle": angle, "customSize": bool(size), "height": size[1] if size else 0, "layer": layer,
         "name": name, "persistentUuid": uid("inst-" + (key or "%s-%s-%s" % (name, x, y))),
         "width": size[0] if size else 0, "x": x, "y": y, "zOrder": 1, "numberProperties": [],
         "stringProperties": [], "initialVariables": variables or [], "z": z, "locked": False}
    if size and len(size) > 2:
        d["depth"] = size[2]
    return d


def build_instances():
    I = []
    I.append(inst("Exterior", 0, 0))
    I.append(inst("Room", 0, 0))
    I.append(inst("IngredientShelf", 116, 24))
    I.append(inst("PotionRack", 524, 22))
    I.append(inst("Counter", 142, 362))
    I.append(inst("Bookshelf", 620, 330, angle=90))
    I.append(inst("Crates", 40, 120))
    I.append(inst("Barrel", 34, 846))
    I.append(inst("Barrel", 30, 800))
    I.append(inst("Plant", 612, 850))
    I.append(inst("Plant", 610, 470))
    I.append(inst("Candelabra", 612, 600))
    # Waiting tables: the Order variable is the purchase order of each slot.
    for i, (x, y) in enumerate(((125, 490), (515, 490), (125, 640), (515, 640), (125, 790), (515, 790))):
        I.append(inst("TableSet", x, y, variables=[var("Order", i + 1)]))
    for i, (x, y) in enumerate(((320, 196), (162, 196), (478, 196))):
        I.append(inst("Cauldron", x, y, variables=[var("Order", i + 1)]))
    # Navigation: walls and blocked areas (hidden layer "Nav").
    blocks = [
        (-60, -80, 760, 80),       # back wall
        (-60, -80, 60, 1010),      # left wall
        (640, -80, 60, 1010),      # right wall
        (-60, 880, 330, 66),       # front wall + fence (left of the door)
        (370, 880, 330, 66),       # front wall + fence (right of the door)
        (160, 936, 110, 24),       # signpost
        (-104, 1074, 28, 28),      # lamp posts
        (716, 1074, 28, 28),
    ]
    for i, (x, y, w, h) in enumerate(blocks):
        I.append(inst("NavBlock", x, y, layer="Nav", size=(w, h), key="navblock-%d" % i))
    wps = [("door", 320, 850, 0), ("doorOutside", 320, 1012, 0), ("home", 214, 312, 0), ("spawn", -170, 1012, 0),
           ("spawn", 810, 1012, 0)]
    # Customers wait outside the door when every table is taken.
    for i, (x, y) in enumerate(((320, 922), (320, 966), (372, 1008), (420, 1008))):
        wps.append(("queue", x, y, i + 1))
    for kind, x, y, order in wps:
        I.append(inst("Waypoint", x - 4, y - 4, layer="Nav", size=(8, 8),
                      variables=[var("Kind", kind), var("Order", order)], key="wp-%s-%d-%d" % (kind, x, y)))
    return I


def light_effects():
    return [
        {"effectType": "Scene3D::HemisphereLight", "name": "Sky",
         "doubleParameters": {"elevation": 90, "intensity": 0.55, "rotation": 0},
         "stringParameters": {"groundColor": "120;84;60", "skyColor": "255;236;210", "top": "Z+"},
         "booleanParameters": {}},
        {"effectType": "Scene3D::AmbientLight", "name": "Ambient", "doubleParameters": {"intensity": 0.35},
         "stringParameters": {"color": "255;240;225"}, "booleanParameters": {}},
        {"effectType": "Scene3D::DirectionalLight", "name": "Sun",
         "doubleParameters": {"distanceFromCamera": 1500, "elevation": 52, "frustumSize": 4000, "intensity": 1.15,
                              "minimumShadowBias": 0.0006, "rotation": 120, "shadowDistance": 2000},
         "stringParameters": {"color": "255;232;196", "shadowQuality": "medium",
                              "shadowRenderingMode": "fittedToCameraView", "top": "Z+"},
         "booleanParameters": {"isCastingShadow": True}},
    ]


def layer(name, rendering="", visible=True, effects=None, fov=35):
    return {"ambientLightColorB": 200, "ambientLightColorG": 200, "ambientLightColorR": 200,
            "camera2DPlaneMaxDrawingDistance": 5000, "camera3DFarPlaneDistance": 8000,
            "camera3DFieldOfView": fov, "camera3DNearPlaneDistance": 20, "cameraType": "",
            "followBaseLayerCamera": False, "isLightingLayer": False, "isLocked": False, "name": name,
            "renderingType": rendering, "visibility": visible,
            "cameras": [{"defaultSize": True, "defaultViewport": True, "height": 0, "viewportBottom": 1,
                         "viewportLeft": 0, "viewportRight": 1, "viewportTop": 0, "width": 0}],
            "effects": effects or []}


# ---------------------------------------------------------------- data
RECIPES = [
    dict(Id="healing", Name="Healing Potion", Ingredients=["redleaf", "moonwater"], Price=14, BrewTime=6,
         Color="235;60;70", Icon="potion_healing", UnlockLevel=1),
    dict(Id="energy", Name="Energy Potion", Ingredients=["sunroot", "sparkdust"], Price=16, BrewTime=7,
         Color="255;176;40", Icon="potion_energy", UnlockLevel=1),
    dict(Id="mana", Name="Mana Potion", Ingredients=["bluecap", "moonwater"], Price=24, BrewTime=8,
         Color="70;130;255", Icon="potion_mana", UnlockLevel=2),
    dict(Id="strength", Name="Strength Potion", Ingredients=["ironroot", "redleaf"], Price=30, BrewTime=9,
         Color="190;100;45", Icon="potion_strength", UnlockLevel=3),
    dict(Id="speed", Name="Speed Potion", Ingredients=["swiftmint", "sparkdust"], Price=36, BrewTime=9,
         Color="60;225;140", Icon="potion_speed", UnlockLevel=4),
]
INGREDIENTS = [
    dict(Id="redleaf", Name="Redleaf", Cost=2, Bundle=5, Icon="ing_redleaf", UnlockLevel=1),
    dict(Id="moonwater", Name="Moonwater", Cost=2, Bundle=5, Icon="ing_moonwater", UnlockLevel=1),
    dict(Id="sunroot", Name="Sunroot", Cost=3, Bundle=5, Icon="ing_sunroot", UnlockLevel=1),
    dict(Id="sparkdust", Name="Sparkdust", Cost=3, Bundle=5, Icon="ing_sparkdust", UnlockLevel=1),
    dict(Id="bluecap", Name="Bluecap", Cost=4, Bundle=5, Icon="ing_bluecap", UnlockLevel=2),
    dict(Id="ironroot", Name="Ironroot", Cost=5, Bundle=5, Icon="ing_ironroot", UnlockLevel=3),
    dict(Id="swiftmint", Name="Swiftmint", Cost=6, Bundle=5, Icon="ing_swiftmint", UnlockLevel=4),
]
CUSTOMERS = [
    dict(Id="farmer", Object="CustFarmer", Name="Farmer", Patience=80, Tip=0.9, Speed=95, MinLevel=1),
    dict(Id="elf", Object="CustElf", Name="Elf ranger", Patience=70, Tip=1.0, Speed=110, MinLevel=1),
    dict(Id="knight", Object="CustKnight", Name="Knight", Patience=60, Tip=1.2, Speed=95, MinLevel=1),
    dict(Id="dwarf", Object="CustDwarf", Name="Dwarf", Patience=55, Tip=1.3, Speed=85, MinLevel=2),
    dict(Id="lady", Object="CustLady", Name="Noble lady", Patience=60, Tip=1.4, Speed=90, MinLevel=2),
    dict(Id="mage", Object="CustMage", Name="Old mage", Patience=90, Tip=1.1, Speed=80, MinLevel=3),
    dict(Id="rogue", Object="CustRogue", Name="Rogue", Patience=45, Tip=1.5, Speed=120, MinLevel=3),
]
UPGRADES = [
    dict(Id="quick_brew", Name="Quick Brew", Description="Potions brew faster.", Icon="icon_hourglass",
         Tab="upgrades", BaseCost=60, CostGrowth=1.6, MaxLevel=5, Effect=0.15, MinShopLevel=1),
    dict(Id="swift_shoes", Name="Swift Shoes", Description="Everyone walks faster.", Icon="icon_speed",
         Tab="upgrades", BaseCost=50, CostGrowth=1.55, MaxLevel=5, Effect=0.12, MinShopLevel=1),
    dict(Id="quick_hands", Name="Quick Hands", Description="Faster order taking, prep and delivery.",
         Icon="icon_order", Tab="upgrades", BaseCost=70, CostGrowth=1.6, MaxLevel=5, Effect=0.15, MinShopLevel=1),
    dict(Id="cozy_decor", Name="Cozy Decor", Description="Customers wait longer before leaving.",
         Icon="icon_patience", Tab="upgrades", BaseCost=80, CostGrowth=1.65, MaxLevel=5, Effect=0.15,
         MinShopLevel=1),
    dict(Id="fine_bottles", Name="Fine Bottles", Description="Potions sell for more gold.", Icon="icon_coin",
         Tab="upgrades", BaseCost=100, CostGrowth=1.7, MaxLevel=5, Effect=0.1, MinShopLevel=2),
    dict(Id="extra_table", Name="Extra Table", Description="Seat one more customer.", Icon="icon_tables",
         Tab="expand", BaseCost=60, CostGrowth=1.8, MaxLevel=3, Effect=1, MinShopLevel=1),
    dict(Id="extra_cauldron", Name="Extra Cauldron", Description="Brew more potions at the same time.",
         Icon="icon_brew", Tab="expand", BaseCost=160, CostGrowth=2.0, MaxLevel=2, Effect=1, MinShopLevel=2),
]
BALANCE = dict(StartGold=40, StartIngredients=6, XpPerServe=10, SpawnIntervalStart=11, SpawnIntervalMin=5,
               QueueSize=3, MaxStock=6, OwnerSpeed=150, TakeOrderTime=1.4, AddIngredientsTime=1.2,
               CollectTime=0.8, DeliverTime=0.7, TipMax=0.5, SludgePrice=0)


# ---------------------------------------------------------------- events
def comment(text):
    return {"type": "BuiltinCommonInstructions::Comment",
            "color": {"b": 109, "g": 230, "r": 255, "textB": 0, "textG": 0, "textR": 0}, "comment": text}


def js_event(code):
    return {"type": "BuiltinCommonInstructions::JsCode", "inlineCode": code, "parameterObjects": "",
            "useStrict": True, "eventsSheetExpanded": False}


def build_events():
    modules = sorted(glob.glob(os.path.join(ROOT, "src", "*.js")))
    defs = []
    for f in modules:
        defs.append(js_event(open(f, encoding="utf-8").read()))
    init_code = (
        "// Create the game once the systems above are defined.\n"
        "const PS = gdjs.PotionShop;\n"
        "runtimeScene.__potionShop = new PS.Game(runtimeScene);\n"
        "if (!PS._saveOnHide && typeof document !== 'undefined') {\n"
        "  PS._saveOnHide = true;\n"
        "  // Save when the app goes to the background (mobile browsers).\n"
        "  document.addEventListener('visibilitychange', () => {\n"
        "    if (document.hidden && PS.game) PS.game.saveNow();\n"
        "  });\n"
        "}\n"
    )
    defs.append(js_event(init_code))
    return [
        comment("POTION SHOP — scene events.\n"
                "Game data (recipes, ingredients, customers, upgrades, balance) is in the project's global "
                "variables.\nTables, cauldrons, furniture and waypoints are placed in this scene: move them in the "
                "scene editor and the game adapts (the Order variable of TableSet/Cauldron is the purchase order).\n"
                "Each JavaScript block below is one game system."),
        {"type": "BuiltinCommonInstructions::Standard",
         "conditions": [{"type": {"value": "SceneJustBegins"}, "parameters": [""]}],
         "actions": [],
         "events": [comment("At the beginning of the scene: define the game systems, then start the game.")] + defs},
        comment("Every frame: run the simulation (customers, workers, brewing, interface)."),
        js_event("const game = runtimeScene.__potionShop;\nif (game) game.update();\n"),
    ]


# ---------------------------------------------------------------- project
def build():
    manifest = json.load(open(os.path.join(ASSETS, "models", "manifest.json")))
    objects = build_objects(manifest)
    scene = {
        "b": 46, "v": 38, "r": 30,
        "disableInputWhenNotFocused": True, "mangledName": "Shop", "name": "Shop",
        "standardSortMethod": True, "stopSoundsOnStartup": True, "title": "",
        "uiSettings": {"grid": False, "gridType": "rectangular", "gridWidth": 16, "gridHeight": 16,
                       "gridDepth": 16, "gridOffsetX": 0, "gridOffsetY": 0, "gridOffsetZ": 0,
                       "gridColor": 10401023, "gridAlpha": 0.8, "snap": False, "zoomFactor": 0.6,
                       "windowMask": False, "selectedLayer": "", "gameEditorMode": "instances-editor"},
        "objectsGroups": [{"name": "NavObstacles", "objects": [{"name": n} for n in NAV_OBSTACLES]}],
        "variables": [],
        "instances": build_instances(),
        "objects": objects,
        "objectsFolderStructure": {"folderName": "__ROOT",
                                   "children": [{"objectName": o["name"]} for o in objects]},
        "events": build_events(),
        "layers": [
            layer("", "", True, light_effects()),
            layer("Overlay", "2d"),
            layer("UI", "2d"),
            layer("Nav", "2d", visible=False),
        ],
        "behaviorsSharedData": [],
    }
    project = {
        "firstLayout": "Shop",
        "gdVersion": {"build": 285, "major": 5, "minor": 6, "revision": 0},
        "properties": {
            "adaptGameResolutionAtRuntime": True, "antialiasingMode": "MSAA", "antialisingEnabledOnMobile": True,
            "folderProject": False, "orientation": "portrait", "packageName": "com.lonewolfproduction.potionshop",
            "pixelsRounding": False, "projectUuid": uid("project"), "scaleMode": "linear",
            "sizeOnStartupMode": "adaptWidth", "templateSlug": "", "useDeprecatedZeroAsDefaultStringVariable": False,
            "version": "0.1.0", "name": "Potion Shop",
            "description": "A cozy 3D potion shop management game: brew potions, serve customers, grow your shop.",
            "author": "", "windowWidth": 720, "windowHeight": 1280, "latestCompilationDirectory": "",
            "maxFPS": 60, "minFPS": 20, "verticalSync": False, "platformSpecificAssets": {},
            "loadingScreen": {"backgroundColor": 1975594, "backgroundFadeInDuration": 0.2,
                              "backgroundImageResourceName": "", "gdevelopLogoStyle": "light",
                              "logoAndProgressFadeInDuration": 0.2, "logoAndProgressLogoFadeInDelay": 0.2,
                              "minDuration": 1, "progressBarColor": 16767066, "progressBarHeight": 20,
                              "progressBarMaxWidth": 300, "progressBarMinWidth": 40,
                              "progressBarWidthPercent": 40, "showGDevelopSplash": True, "showProgressBar": True},
            "watermark": {"placement": "bottom-left", "showWatermark": True},
            "authorIds": [], "authorUsernames": [], "categories": ["simulation"], "playableDevices": ["mobile"],
            "extensionProperties": [], "platforms": [{"name": "GDevelop JS platform"}],
            "currentPlatform": "GDevelop JS platform",
        },
        "resources": {"resources": build_resources()},
        "objects": [],
        "objectsFolderStructure": {"folderName": "__ROOT"},
        "objectsGroups": [],
        "variables": [var("Recipes", RECIPES), var("Ingredients", INGREDIENTS), var("CustomerTypes", CUSTOMERS),
                      var("Upgrades", UPGRADES), var("Balance", BALANCE)],
        "layouts": [scene],
        "externalEvents": [],
        "tests": [],
        "eventsFunctionsExtensions": [],
        "externalLayouts": [],
    }
    out = os.path.join(GAME, "PotionShop.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(project, f, indent=1, ensure_ascii=False)
    print("Wrote", out, "objects:", len(objects), "resources:", len(project["resources"]["resources"]))


if __name__ == "__main__":
    build()
