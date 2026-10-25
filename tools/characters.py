"""Blocky fantasy characters with node animations (Idle, Walk, Work, Sit, Cheer)."""

from modeler import Model

# Body layout (authoring units, Z up, character faces +Y / south).
LEG_H = 14
TORSO_H = 17
HEAD = 15


def build_character(name, spec):
    m = Model(name)
    skin = spec.get("skin", "f2c49a")
    eye = spec.get("eye", "3b2a20")
    hair = spec.get("hair", "5a3a22")
    top = spec.get("top", "cloth:3a6ea5")
    sleeve = spec.get("sleeve", top)
    pants = spec.get("pants", "cloth:4a3b2a")
    shoes = spec.get("shoes", "leather:3b2618")
    expr = spec.get("expr", "smile")
    width = spec.get("width", 16)
    stocky = spec.get("stocky", 0)  # wider and shorter (dwarf)
    leg_h = LEG_H - (4 if stocky else 0)
    torso_w = width + stocky * 2
    hip_z = leg_h
    neck_z = hip_z + TORSO_H

    # Node hierarchy: root -> body(bob) -> legs, torso, arms, head
    m.node("body", (0, 0, 0))
    m.node("legL", (-4, 0, hip_z), "body")
    m.node("legR", (4, 0, hip_z), "body")
    m.node("torso", (0, 0, hip_z), "body")
    m.node("armL", (-(torso_w / 2 + 2.5), 0, neck_z - 2), "torso")
    m.node("armR", (torso_w / 2 + 2.5, 0, neck_z - 2), "torso")
    m.node("head", (0, 0, neck_z), "torso")

    # Legs
    for nd, x in (("legL", -4), ("legR", 4)):
        lw = 6 + stocky
        m.box(x - lw / 2, -3, 3, lw, 6, leg_h - 3, {"all": pants}, node=nd)
        # Boots
        m.box(x - lw / 2 - 0.5, -3.5, 0, lw + 1, 7.5, 4, {"all": shoes, "top": shoes}, node=nd)
        m.box(x - lw / 2 - 0.5, 3.5, 0, lw + 1, 1.5, 2.5, {"all": shoes}, node=nd)  # toe

    # Torso
    tw = torso_w
    m.box(-tw / 2, -4.5, hip_z, tw, 9, TORSO_H, {"all": top, "top": top}, node="torso")
    if spec.get("skirt"):
        sk = spec["skirt"]
        m.box(-tw / 2 - 2, -6, hip_z - 9, tw + 4, 12, 11, {"all": sk}, node="torso")
    if spec.get("apron"):
        ap = spec["apron"]
        m.box(-tw / 2 + 2, 4.5, hip_z - 6, tw - 4, 1, TORSO_H - 2, {"all": ap}, node="torso")
        m.box(-3, 5.5, hip_z + 2, 6, 0.8, 4, {"all": ap}, node="torso", tint=(0.8, 0.8, 0.8))  # pocket
    if spec.get("belt"):
        m.box(-tw / 2 - 0.5, -5, hip_z + 1, tw + 1, 10, 2.5, {"all": spec["belt"]}, node="torso")
        m.box(-1.5, 5, hip_z + 0.5, 3, 0.8, 3.5, {"all": "gold"}, node="torso")
    if spec.get("cape"):
        m.box(-tw / 2 - 1, -6, hip_z - 4, tw + 2, 1.5, TORSO_H + 3, {"all": spec["cape"]}, node="torso")
    if spec.get("armor"):
        m.box(-tw / 2 - 0.5, -5, hip_z + 5, tw + 1, 10, TORSO_H - 6, {"all": spec["armor"]}, node="torso")
        # Shoulder pads
        for sx in (-1, 1):
            m.box(sx * (tw / 2 + 2.5) - 4, -4, neck_z - 4, 8, 8, 4, {"all": spec["armor"]}, node="torso")
    if spec.get("tabard"):
        m.box(-4, 4.6, hip_z - 5, 8, 0.8, TORSO_H, {"all": spec["tabard"]}, node="torso")
    if spec.get("necklace"):
        m.box(-3, 4.6, neck_z - 6, 6, 0.6, 3, {"all": "gold"}, node="torso")
        m.box(-1, 4.8, neck_z - 8, 2, 0.6, 2, {"all": "gem:" + spec["necklace"]}, node="torso")
    if spec.get("satchel"):
        m.box(tw / 2 - 1, -1, hip_z - 2, 4, 6, 6, {"all": spec["satchel"]}, node="torso")

    # Arms (pivot at shoulder)
    for nd, sx in (("armL", -1), ("armR", 1)):
        ax = sx * (tw / 2 + 2.5)
        m.box(ax - 2.5, -2.5, neck_z - 15, 5, 5, 14, {"all": sleeve, "top": sleeve}, node=nd)
        m.box(ax - 2.3, -2.3, neck_z - 18, 4.6, 4.6, 3.5, {"all": "skin:" + skin}, node=nd)  # hand
        if spec.get("gloves"):
            m.box(ax - 2.6, -2.6, neck_z - 18.5, 5.2, 5.2, 5, {"all": spec["gloves"]}, node=nd)
        if spec.get("cuffs"):
            m.box(ax - 2.8, -2.8, neck_z - 15, 5.6, 5.6, 2, {"all": spec["cuffs"]}, node=nd)

    # Head
    hz = neck_z
    hw = HEAD
    face_tile = "face:%s:%s:%s:%s" % (skin, eye, expr, spec.get("brow", hair))
    head_tiles = {"south": face_tile, "all": "skin:" + skin}
    m.box(-hw / 2, -7, hz, hw, 14, HEAD, head_tiles, node="head", ao=False)
    # Ears
    if spec.get("elf_ears"):
        for sx in (-1, 1):
            m.box(sx * (hw / 2) + (0 if sx > 0 else -4), -1, hz + 6, 4, 2.5, 3, {"all": "skin:" + skin}, node="head")
            m.box(sx * (hw / 2) + (2 if sx > 0 else -6), -1, hz + 8, 4, 2, 2.5, {"all": "skin:" + skin}, node="head")
    else:
        for sx in (-1, 1):
            m.box(sx * (hw / 2) + (0 if sx > 0 else -1.5), -1, hz + 5, 1.5, 3, 4, {"all": "skin:" + skin}, node="head")

    style = spec.get("hair_style", "short")
    ht = "hair:" + hair
    if style != "bald":
        # Cap of hair
        m.box(-hw / 2 - 0.8, -7.8, hz + HEAD - 3, hw + 1.6, 15.6, 4.5, {"all": ht}, node="head")
        # Back
        m.box(-hw / 2 - 0.8, -7.8, hz + 4, hw + 1.6, 3, HEAD - 6, {"all": ht}, node="head")
        # Sides
        for sx in (-1, 1):
            m.box(sx * (hw / 2) + (0 if sx > 0 else -0.8), -7.8, hz + 7, 0.8, 9, HEAD - 9, {"all": ht}, node="head")
        # Fringe
        m.box(-hw / 2 - 0.8, 6.9, hz + HEAD - 4, hw + 1.6, 1, 2.5, {"all": ht}, node="head")
        if style == "fringe":
            m.box(-hw / 2 - 0.8, 6.9, hz + HEAD - 6, 6, 1, 3, {"all": ht}, node="head")
        if style == "long":
            m.box(-hw / 2 - 0.8, -7.8, hz - 6, hw + 1.6, 4, 12, {"all": ht}, node="head")
            for sx in (-1, 1):
                m.box(sx * (hw / 2) + (0 if sx > 0 else -1.6), -6, hz - 3, 1.6, 8, 12, {"all": ht}, node="head")
        if style == "bun":
            m.box(-4, -9, hz + HEAD - 2, 8, 6, 7, {"all": ht}, node="head")
        if style == "ponytail":
            m.box(-2.5, -10, hz + 2, 5, 3, 10, {"all": ht}, node="head")
    if spec.get("beard"):
        b = "hair:" + spec["beard"]
        m.box(-hw / 2 + 1, 6.8, hz - 4, hw - 2, 2.5, 8, {"all": b}, node="head")
        m.box(-hw / 2, 4, hz, hw, 3, 5, {"all": b}, node="head")
        if spec.get("long_beard"):
            m.box(-4.5, 6.8, hz - 10, 9, 2.5, 7, {"all": b}, node="head")
        # mustache
        m.box(-5, 7.2, hz + 4, 10, 1.5, 2, {"all": b}, node="head")

    hat = spec.get("hat")
    if hat:
        kind = hat["kind"]
        c = hat["tile"]
        top_z = hz + HEAD
        if kind == "wizard":
            m.box(-hw / 2 - 4, -11, top_z - 1, hw + 8, 22, 2.5, {"all": c}, node="head")  # brim
            band = hat.get("band", "gold")
            m.box(-hw / 2 - 0.5, -7.5, top_z + 1.5, hw + 1, 15, 3, {"all": band}, node="head")
            m.box(-hw / 2 + 0.5, -6.5, top_z + 4.5, hw - 1, 13, 6, {"all": c}, node="head")
            m.box(-hw / 2 + 2.5, -5, top_z + 10.5, hw - 5, 10, 5, {"all": c}, node="head")
            m.box(-hw / 2 + 4.5, -4, top_z + 15.5, hw - 9, 7, 4, {"all": c}, node="head")
            m.box(-1.5, -5, top_z + 19, 4, 4, 3, {"all": c}, node="head")
            if hat.get("star"):
                m.box(-2, 7.6, top_z + 6, 4, 0.6, 4, {"all": "gold"}, node="head")
        elif kind == "straw":
            m.box(-hw / 2 - 6, -13, top_z - 1, hw + 12, 26, 2, {"all": c}, node="head")
            m.box(-hw / 2 + 0.5, -6.5, top_z + 1, hw - 1, 13, 5, {"all": c}, node="head")
            m.box(-hw / 2 + 0.4, -6.6, top_z + 1, hw - 0.8, 13.2, 1.5, {"all": hat.get("band", "cloth:a33a2a")}, node="head")
        elif kind == "helmet":
            m.box(-hw / 2 - 1.5, -8.5, top_z - 6, hw + 3, 17, 8, {"all": c, "south": c}, node="head")
            m.box(-1, 7.6, top_z - 9, 2, 1.5, 5, {"all": c}, node="head")  # nose guard
            if hat.get("plume"):
                m.box(-1.5, -6, top_z + 2, 3, 12, 6, {"all": hat["plume"]}, node="head")
            if hat.get("horns"):
                for sx in (-1, 1):
                    m.box(sx * (hw / 2 + 2) - 2, -2, top_z - 3, 4, 4, 4, {"all": "solid:efe6d0"}, node="head")
                    m.box(sx * (hw / 2 + 4) - 1.5, -1.5, top_z + 1, 3, 3, 4, {"all": "solid:efe6d0"}, node="head")
        elif kind == "hood":
            m.box(-hw / 2 - 1.5, -8.5, hz + 2, hw + 3, 16, HEAD + 1, {"all": c, "south": None}, node="head",
                  faces=["east", "west", "north", "top"])
            m.box(-hw / 2 - 1.5, 7, top_z - 2, hw + 3, 1.5, 4, {"all": c}, node="head")
            for sx in (-1, 1):
                m.box(sx * (hw / 2) + (0 if sx > 0 else -1.5), 7, hz + 2, 1.5, 1.5, HEAD - 2, {"all": c}, node="head")
            m.box(-3, -11, hz + 4, 6, 3, 8, {"all": c}, node="head")
        elif kind == "cap":
            m.box(-hw / 2 - 0.8, -7.8, top_z - 1, hw + 1.6, 15.6, 4, {"all": c}, node="head")
            m.box(-hw / 2 + 2, 7.5, top_z - 1, hw - 4, 5, 1.2, {"all": c}, node="head")
        elif kind == "tiara":
            m.box(-hw / 2, -2, top_z - 1, hw, 2, 2.5, {"all": "gold"}, node="head")
            m.box(-1.5, -1.5, top_z + 1, 3, 1, 3, {"all": "gem:d04ae0"}, node="head")

    if spec.get("scarf"):
        m.box(-hw / 2 + 1, 6.6, hz + 1, hw - 2, 1.4, 5, {"all": spec["scarf"]}, node="head")

    # ------------------------------------------------------------- animations
    sw = 32
    m.animation("Walk", 0.6, [
        ("legL", "rotation", [(0, (sw, 0, 0)), (0.3, (-sw, 0, 0)), (0.6, (sw, 0, 0))]),
        ("legR", "rotation", [(0, (-sw, 0, 0)), (0.3, (sw, 0, 0)), (0.6, (-sw, 0, 0))]),
        ("armL", "rotation", [(0, (-sw, 0, 0)), (0.3, (sw, 0, 0)), (0.6, (-sw, 0, 0))]),
        ("armR", "rotation", [(0, (sw, 0, 0)), (0.3, (-sw, 0, 0)), (0.6, (sw, 0, 0))]),
        ("body", "translation", [(0, (0, 0, 0)), (0.15, (0, 0, 1.5)), (0.3, (0, 0, 0)), (0.45, (0, 0, 1.5)), (0.6, (0, 0, 0))]),
        ("head", "rotation", [(0, (0, 0, 3)), (0.3, (0, 0, -3)), (0.6, (0, 0, 3))]),
    ])
    m.animation("Idle", 2.4, [
        ("body", "translation", [(0, (0, 0, 0)), (1.2, (0, 0, 0.8)), (2.4, (0, 0, 0))]),
        ("armL", "rotation", [(0, (0, 4, 0)), (1.2, (0, -2, 0)), (2.4, (0, 4, 0))]),
        ("armR", "rotation", [(0, (0, -4, 0)), (1.2, (0, 2, 0)), (2.4, (0, -4, 0))]),
        ("head", "rotation", [(0, (0, 0, 0)), (0.8, (0, 0, 6)), (1.6, (0, 0, -6)), (2.4, (0, 0, 0))]),
        ("legL", "rotation", [(0, (0, 0, 0)), (2.4, (0, 0, 0))]),
        ("legR", "rotation", [(0, (0, 0, 0)), (2.4, (0, 0, 0))]),
    ])
    m.animation("Work", 0.8, [
        ("armL", "rotation", [(0, (-70, 0, 15)), (0.2, (-85, 0, -5)), (0.4, (-70, 0, -20)), (0.6, (-55, 0, 0)), (0.8, (-70, 0, 15))]),
        ("armR", "rotation", [(0, (-70, 0, -15)), (0.2, (-55, 0, 0)), (0.4, (-70, 0, 20)), (0.6, (-85, 0, 5)), (0.8, (-70, 0, -15))]),
        ("body", "translation", [(0, (0, 0, 0)), (0.4, (0, 0, 0.8)), (0.8, (0, 0, 0))]),
        ("head", "rotation", [(0, (12, 0, 0)), (0.8, (12, 0, 0))]),
        ("legL", "rotation", [(0, (0, 0, 0)), (0.8, (0, 0, 0))]),
        ("legR", "rotation", [(0, (0, 0, 0)), (0.8, (0, 0, 0))]),
    ])
    m.animation("Sit", 2.0, [
        ("legL", "rotation", [(0, (-90, 0, 0)), (2.0, (-90, 0, 0))]),
        ("legR", "rotation", [(0, (-90, 0, 0)), (2.0, (-90, 0, 0))]),
        ("body", "translation", [(0, (0, 0, 0)), (1.0, (0, 0, 0.5)), (2.0, (0, 0, 0))]),
        ("armL", "rotation", [(0, (-30, 0, 0)), (2.0, (-30, 0, 0))]),
        ("armR", "rotation", [(0, (-30, 0, 0)), (2.0, (-30, 0, 0))]),
        ("head", "rotation", [(0, (0, 0, 0)), (1.0, (-5, 0, 0)), (2.0, (0, 0, 0))]),
    ])
    m.animation("Cheer", 0.5, [
        ("armL", "rotation", [(0, (0, 160, 0)), (0.25, (0, 140, 0)), (0.5, (0, 160, 0))]),
        ("armR", "rotation", [(0, (0, -160, 0)), (0.25, (0, -140, 0)), (0.5, (0, -160, 0))]),
        ("body", "translation", [(0, (0, 0, 0)), (0.25, (0, 0, 5)), (0.5, (0, 0, 0))]),
        ("legL", "rotation", [(0, (0, 0, 0)), (0.5, (0, 0, 0))]),
        ("legR", "rotation", [(0, (0, 0, 0)), (0.5, (0, 0, 0))]),
        ("head", "rotation", [(0, (-10, 0, 0)), (0.5, (-10, 0, 0))]),
    ])
    m.animation("Angry", 0.4, [
        ("armL", "rotation", [(0, (0, 20, 0)), (0.2, (0, 30, 0)), (0.4, (0, 20, 0))]),
        ("armR", "rotation", [(0, (0, -20, 0)), (0.2, (0, -30, 0)), (0.4, (0, -20, 0))]),
        ("head", "rotation", [(0, (0, 0, 8)), (0.2, (0, 0, -8)), (0.4, (0, 0, 8))]),
        ("legL", "rotation", [(0, (0, 0, 0)), (0.4, (0, 0, 0))]),
        ("legR", "rotation", [(0, (0, 0, 0)), (0.4, (0, 0, 0))]),
        ("body", "translation", [(0, (0, 0, 0)), (0.1, (0, 0, 1.5)), (0.2, (0, 0, 0)), (0.4, (0, 0, 0))]),
    ])
    return m


CHARACTERS = {
    "owner": dict(skin="f5cfa6", eye="2e5a3a", hair="9a4a22", hair_style="fringe", expr="smile",
                  top="cloth:efe4c8", sleeve="cloth:efe4c8", pants="cloth:4b3a5e", shoes="leather:4a2c18",
                  apron="cloth_trim:2f7a5a:e2b23c", belt="leather:5a3420", satchel="leather:7a4a28",
                  cuffs="cloth:2f7a5a",
                  hat=dict(kind="wizard", tile="cloth:5b3a8e", band="cloth:e2b23c", star=True)),
    # Hired apprentices wear the shop's teal apron like the owner.
    "pip": dict(skin="f0c8a0", eye="3a2a1a", hair="6a4a2a", hair_style="fringe", expr="open",
                top="cloth:e8d8b8", sleeve="cloth:5a8ac0", pants="cloth:3a4a6a", shoes="leather:4a2c18",
                apron="cloth_trim:2f7a5a:e2b23c", cuffs="cloth:2f7a5a",
                hat=dict(kind="cap", tile="cloth:2f7a5a")),
    "maple": dict(skin="f6d6bc", eye="2a6a4a", hair="c0502a", hair_style="ponytail", expr="smile",
                  top="cloth:f0e6d0", sleeve="cloth:c0602a", pants="cloth:5a3a2a", shoes="leather:5a3420",
                  apron="cloth_trim:2f7a5a:e2b23c", belt="leather:5a3420", cuffs="cloth:2f7a5a"),
    "bramble": dict(skin="e8b090", eye="2a2a3a", hair="f0f0f0", beard="f0f0f0", long_beard=True, stocky=1,
                    top="cloth:8a3a2a", sleeve="cloth:8a3a2a", pants="cloth:3a3a4a", shoes="leather:3a2418",
                    apron="cloth_trim:2f7a5a:e2b23c", expr="smile",
                    hat=dict(kind="wizard", tile="cloth:c0302a", band="cloth:2f7a5a")),
    "knight": dict(skin="e8b48c", eye="2a3a5a", hair="3a2a1a", expr="stern", brow="3a2a1a",
                   top="cloth:7a2a2a", sleeve="metal_plain:9aa0aa", pants="metal_plain:7a808a",
                   shoes="metal_plain:5a5e66", armor="metal:9aa0aa", tabard="cloth_trim:8e2b2b:e2b23c",
                   gloves="leather:4a2c18",
                   hat=dict(kind="helmet", tile="metal:a8aeb8", plume="cloth:c0392b")),
    "elf": dict(skin="f8dcc0", eye="2f8a6a", hair="f0d27a", hair_style="long", elf_ears=True,
                top="cloth:3f7a3a", sleeve="cloth:3f7a3a", pants="leather:6b4a2a", shoes="leather:4a3018",
                belt="leather:4a3018", cape="cloth:2a5a2a", expr="smile"),
    "farmer": dict(skin="e0a67a", eye="3a2a1a", hair="7a4a22", expr="open",
                   top="cloth_check:c0392b:f0e0d0", sleeve="cloth_check:c0392b:f0e0d0",
                   pants="cloth:3a5a8a", shoes="leather:5a3a20", apron="cloth:3a5a8a",
                   hat=dict(kind="straw", tile="solid:e8c870", band="cloth:a33a2a")),
    "dwarf": dict(skin="e6a888", eye="2a2a3a", hair="c0602a", beard="c0602a", long_beard=True, stocky=1,
                  top="cloth:6a4a8a", sleeve="cloth:6a4a8a", pants="cloth:5a4030", shoes="leather:3a2418",
                  belt="leather:3a2418", expr="smile",
                  hat=dict(kind="helmet", tile="metal:8a8e96", horns=True)),
    "lady": dict(skin="f6d2b6", eye="5a2a6a", hair="2a1a1a", hair_style="bun", expr="smile",
                 top="cloth_trim:8a3a9a:e2b23c", sleeve="cloth:8a3a9a", pants="cloth:8a3a9a",
                 shoes="leather:5a2a4a", skirt="cloth_trim:7a2a8a:e2b23c", necklace="e04a8a",
                 hat=dict(kind="tiara", tile="gold")),
    "mage": dict(skin="eec6a6", eye="2a4a8a", hair="d8d8e0", beard="e8e8f0", long_beard=True,
                 top="stars:2a3a7a:ffe27a", sleeve="stars:2a3a7a:ffe27a", pants="cloth:2a3a7a",
                 shoes="leather:3a2a4a", skirt="stars:2a3a7a:ffe27a", expr="smile",
                 hat=dict(kind="wizard", tile="stars:2a3a7a:ffe27a", band="cloth:e2b23c")),
    "rogue": dict(skin="d8a080", eye="6a2a2a", hair="1a1a1a", expr="neutral",
                  top="leather:3a3030", sleeve="cloth:2a2a30", pants="cloth:2a2a30", shoes="leather:1a1414",
                  belt="leather:5a3420", cape="cloth:3a2020", scarf="cloth:5a1a1a",
                  hat=dict(kind="hood", tile="cloth:3a2a2a")),
}
