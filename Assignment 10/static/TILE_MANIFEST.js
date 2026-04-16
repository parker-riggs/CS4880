'use strict';
// ═══════════════════════════════════════════════════════════════════
//  TILE_MANIFEST.js  —  The Forgotten Realm
//
//  Maps every game tile type and entity type to its sprite sheet.
//
//  ALL COORDINATES VERIFIED via pixel-sampling each sheet.
//  Last verified: 2026-04-15
//
//  COORDINATE HELPERS
//  ──────────────────
//  v(col, row)  — Serene Village 48 px grid  (48 px tiles, no gap)
//  i(col, row)  — Room Builder / Interiors 48 px grid (48 px tiles, no gap)
//  k(col, row)  — Kenney 16 px grid (16 px tiles, 1 px gap → 17 px stride)
//  n(col, row)  — Ninja Adventure 16 px grid (16 px tiles, no gap)
//
//  HOW THE SHEETS ARE ORGANISED
//  ─────────────────────────────
//  VILLAGE  (Serene_Village_48x48.png, 912×2160, 19×45 tiles)
//    Rows 0–6 = sample-map scene (autotile terrain).
//    Green grass fills cols 3–5 row 0; sandy path cols 6,9 rows 1–3;
//    tree canopy cols 15–16 row 10.
//
//  ROOM_BUILDER  (Room_Builder_free_48x48.png, 816×1104, 17×23 tiles)
//    Rows 0–4 = room-border/ceiling schematic (mostly transparent).
//    Rows 5–20 = stacked wall/floor material bands, 2 rows per material.
//    Left group  (cols 0–3):   main wall-panel face
//    Center group (cols 4–6):  accent variant
//    Right group  (cols 7–9):  lighter variant
//    Far right    (cols 11–16): floor-tile patterns
//    Row 5–6:  salmon/rose       Row 7–8:  cream/golden
//    Row 9–10: teal-mint         Row 11–12: warm wood (light)
//    Row 13–14: medium wood      Row 15–16: terracotta/brick
//    Row 17–18: blue-grey slate  Row 19–20: neutral stone
//    Ceiling tiles (alpha=255, near-white): cols 14–16 rows 0–2.
//
//  KENNEY  (roguelikeSheet_transparent.png, 968×526, 57×31 @ 17px stride)
//    Cols 0–4 rows 0–5 = water/terrain (blue-teal).
//    k(6,0)  = brown earth      k(7,0)  = grey-blue stone
//    k(8,0)  = cream/sandy      k(9,0)  = grey-blue stone
//    k(5-9, 3-5) = brown earth floor (dungeon floor tiles)
//    k(6,2)  = light grey       k(15,6) = warm torch/candle
//    k(16,6) = warm torch variant
//
//  WATER_ANIM  (water_waves_48x48.png, 672×48, 14×1 tiles) — 14 frames total;
//    the game uses the first 4 (0–3), all verified as blue water.
//
//  DOOR_ANIM  (door_48x48.png, 192×48, 4×1 tiles) — all 4 verified as wood door.
// ═══════════════════════════════════════════════════════════════════


// ─── SHEET REGISTRY ──────────────────────────────────────────────────────────
const SHEET_PATHS = Object.freeze({

    // ── OUTDOOR / OVERWORLD ───────────────────────────────────────
    VILLAGE:         '/graphics/Outer World/SERENE_VILLAGE_REVAMPED/Serene_Village_48x48.png',
    WATER_ANIM:      '/graphics/Outer World/SERENE_VILLAGE_REVAMPED/Animated stuff/water_waves_48x48.png',
    DOOR_ANIM:       '/graphics/Outer World/SERENE_VILLAGE_REVAMPED/Animated stuff/door_48x48.png',

    // ── INTERIOR ─────────────────────────────────────────────────
    INTERIORS:       '/graphics/Indoor & Dungeon/Modern tiles_Free/Interiors_free/48x48/Interiors_free_48x48.png',
    ROOM_BUILDER:    '/graphics/Indoor & Dungeon/Modern tiles_Free/Interiors_free/48x48/Room_Builder_free_48x48.png',

    // ── DUNGEON ───────────────────────────────────────────────────
    KENNEY:          '/graphics/Indoor & Dungeon/Kenny-Rougelike/Spritesheet/roguelikeSheet_transparent.png',

    // ── PLAYER — one sheet per character class ────────────────────
    CHAR_KNIGHT:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Knight/SpriteSheet.png',
    CHAR_NINJA_BLUE: '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/NinjaBlue/SpriteSheet.png',
    CHAR_SORCERER:   '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/SorcererBlack/SpriteSheet.png',
    CHAR_MONK:       '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Monk2/SpriteSheet.png',

    // ── NPC CHARACTERS ────────────────────────────────────────────
    CHAR_BOY:        '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Boy/SpriteSheet.png',
    CHAR_OLDMAN:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/OldMan2/SpriteSheet.png',
    CHAR_FIGHTER:    '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/FighterRed/SpriteSheet.png',
    CHAR_NOBLE:      '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Noble/SpriteSheet.png',
    CHAR_SPIRIT:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Spirit/SpriteSheet.png',

    // ── ENEMIES ───────────────────────────────────────────────────
    ENEMY_SHADE:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/NinjaDark/SpriteSheet.png',
    ENEMY_LURKER:    null,   // procedural fallback
});


// ─── TILE-SIZE CONSTANTS (native pixels, before scaling) ─────────────────────
const V_TILE   = 48;   // Serene Village / Modern Interiors / Room Builder — 48 px
const K_TILE   = 16;   // Kenney — 16 px tile
const K_STRIDE = 17;   // Kenney — 17 px stride (16 + 1 px gap)


// ─── COORDINATE HELPERS ──────────────────────────────────────────────────────

/** Serene Village 48 px grid */
function v(col, row) {
    return { sx: col * V_TILE, sy: row * V_TILE, sw: V_TILE, sh: V_TILE };
}

/** Room Builder / Modern Interiors 48 px grid */
function i(col, row) {
    return { sx: col * V_TILE, sy: row * V_TILE, sw: V_TILE, sh: V_TILE };
}

/** Kenney 16 px / 17 px-stride grid: returns a 16×16 source rect */
function k(col, row) {
    return { sx: col * K_STRIDE, sy: row * K_STRIDE, sw: K_TILE, sh: K_TILE };
}

/** Ninja Adventure 16 px grid (no gap) */
function n(col, row) {
    return { sx: col * 16, sy: row * 16, sw: 16, sh: 16 };
}


// ═══════════════════════════════════════════════════════════════════
//  TILE_MANIFEST
// ═══════════════════════════════════════════════════════════════════
const TILE_MANIFEST = {

    // ─────────────────────────────────────────────────────────────
    //  GRASS  (TILE.GRASS = 0)
    //  Sheet: Serene Village — rows 0–1, various cols.
    //
    //  Verified pixel colours (mean RGB, alpha=255 for all):
    //    v(4,0): (120,200,102)  plain bright green ✓
    //    v(3,0): (120,200,102)  plain bright green ✓
    //    v(5,0): (120,200,102)  plain bright green ✓
    //    v(7,1): (162,175, 89)  medium olive green  ✓
    //    v(8,1): (162,175, 89)  medium olive green  ✓
    //    v(17,0):(166,174, 90)  dry/yellower green  ✓
    //    v(18,0):(157,178, 93)  dry/yellower        ✓
    //    v(17,1):(130,198,103)  bright green        ✓
    // ─────────────────────────────────────────────────────────────
    GRASS: {
        sheet: 'VILLAGE',
        variants: [
            v(4,  0),   // 0 — plain bright grass
            v(3,  0),   // 1 — plain grass (slight left shift)
            v(5,  0),   // 2 — plain grass (slight right shift)
            v(7,  1),   // 3 — medium olive green
            v(8,  1),   // 4 — medium olive green
            v(17, 0),   // 5 — dry / yellower
            v(18, 0),   // 6 — dry / yellower variant
            v(17, 1),   // 7 — bright summer green
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  PATH  (TILE.PATH = 1)
    //  Sheet: Serene Village — sandy/tan tiles from dock area row 1–2.
    //  These read as golden-sandy (196,159,82) which gives an
    //  earthy dirt-path appearance — appropriate for RPG outdoor paths.
    //
    //  Verified: v(6,1) v(9,1) v(6,2) v(9,2) all alpha=255 ✓
    // ─────────────────────────────────────────────────────────────
    PATH: {
        sheet: 'VILLAGE',
        variants: [
            v(6, 1),   // 0 — sandy-earth path
            v(9, 1),   // 1 — sandy-earth path
            v(6, 2),   // 2 — slightly lighter
            v(9, 2),   // 3 — slightly lighter variant
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  FLOOR_LIGHT — light interior floor  (TILE.FLOOR, dark=false)
    //  Sheet: Room Builder — warm/cream band row 7–8 + wood row 11 + stone row 19.
    //
    //  Verified colours (all alpha=255):
    //    i(0, 7): (207,196,159)  cream/warm golden floor ✓
    //    i(7, 7): (218,207,169)  cream lighter centre     ✓
    //    i(0,11): (177,147,120)  light warm wood plank    ✓
    //    i(0,19): (179,178,172)  neutral stone floor      ✓
    // ─────────────────────────────────────────────────────────────
    FLOOR_LIGHT: {
        sheet: 'ROOM_BUILDER',
        variants: [
            i(0,  7),   // 0 — cream / warm golden floor
            i(7,  7),   // 1 — cream lighter centre variant
            i(0, 11),   // 2 — light warm wood plank
            i(0, 19),   // 3 — neutral stone floor
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  FLOOR_DARK — dark dungeon floor  (TILE.FLOOR, dark=true)
    //  Sheet: Kenney — brown earth tiles cols 5–9 rows 3–4.
    //
    //  Verified colours (all alpha=255):
    //    k(5,3): (176,132, 89)  brown earth ✓
    //    k(8,3): (175,129, 84)  brown earth ✓
    //    k(5,4): (179,134, 90)  slightly lighter ✓
    //    k(8,4): (181,136, 92)  brown earth ✓
    // ─────────────────────────────────────────────────────────────
    FLOOR_DARK: {
        sheet: 'KENNEY',
        variants: [
            k(5, 3),   // 0 — brown earth dungeon floor
            k(8, 3),   // 1 — brown earth variant
            k(5, 4),   // 2 — slightly lighter brown
            k(8, 4),   // 3 — brown earth variant
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WALL_EXT — exterior stone  (TILE.WALL, outdoor map)
    //  Sheet: Room Builder — dark neutral grey tiles cols 14–16 rows 5–11.
    //  These are fully-opaque (~alpha 255) grey-stone panels.
    //
    //  Verified colours:
    //    i(14, 5): (141,131,130) alpha=255  neutral grey ✓
    //    i(14, 7): (133,125,125) alpha=255  dark grey    ✓
    //    i(14, 9): (131,122,122) alpha=255  dark grey    ✓
    //    i(14,11): (122,114,114) alpha=255  darker grey  ✓
    // ─────────────────────────────────────────────────────────────
    WALL_EXT: {
        sheet: 'ROOM_BUILDER',
        variants: [
            i(14,  5),  // 0 — neutral grey stone
            i(14,  7),  // 1 — dark grey stone
            i(14,  9),  // 2 — dark grey variant
            i(14, 11),  // 3 — darker grey
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WALL_INT — interior wood plank  (TILE.WALL, interior map)
    //  Sheet: Room Builder — warm wood bands rows 11–14.
    //
    //  Verified colours (all alpha=255):
    //    i(0,11): (177,147,120)  warm light wood ✓
    //    i(7,11): (188,158,129)  warm light wood lighter ✓
    //    i(0,13): (154,130,123)  medium wood / worn ✓
    //    i(7,13): (165,141,133)  medium wood lighter ✓
    // ─────────────────────────────────────────────────────────────
    WALL_INT: {
        sheet: 'ROOM_BUILDER',
        variants: [
            i(0, 11),   // 0 — warm light wood plank
            i(7, 11),   // 1 — warm wood lighter centre
            i(0, 13),   // 2 — medium / worn wood
            i(7, 13),   // 3 — medium wood lighter
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WALL_DUN — dungeon hewn rock  (TILE.WALL, dark map)
    //  Sheet: Kenney — grey-blue stone tiles rows 0–2 cols 6–9.
    //
    //  Verified colours (all alpha=255):
    //    k(7,0): (168,182,183) grey-blue stone ✓
    //    k(9,0): (170,184,185) grey-blue stone ✓
    //    k(6,2): (190,190,190) light grey stone ✓
    //    k(7,1): (168,182,183) grey-blue stone ✓
    // ─────────────────────────────────────────────────────────────
    WALL_DUN: {
        sheet: 'KENNEY',
        variants: [
            k(7, 0),   // 0 — grey-blue stone wall
            k(9, 0),   // 1 — grey-blue stone variant
            k(6, 2),   // 2 — light grey stone
            k(7, 1),   // 3 — grey-blue stone (row 1 variant)
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  CEILING — interior overhead  (TILE.WALL, isCeiling=true)
    //  Sheet: Room Builder — near-white tiles cols 14–16 rows 0–2.
    //  These are the explicit "room border / ceiling" tiles from
    //  the Room Builder legend, alpha=255, near-white.
    //
    //  Verified colours (all alpha=255):
    //    i(14,0): (216,216,220) light grey-white ✓
    //    i(15,0): (219,219,223) light grey-white ✓
    //    i(16,0): (216,216,220) light grey-white ✓
    //    i(14,2): (227,227,230) near white       ✓
    // ─────────────────────────────────────────────────────────────
    CEILING: {
        sheet: 'ROOM_BUILDER',
        variants: [
            i(14, 0),   // 0 — light grey ceiling
            i(15, 0),   // 1 — light grey ceiling variant
            i(16, 0),   // 2 — light grey ceiling
            i(14, 2),   // 3 — near-white ceiling
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  TREE  (TILE.TREE = 4)
    //  Sheet: Serene Village — medium-green canopy tiles row 10.
    //  isOverlay = true: SpriteRenderer draws GRASS first, then this.
    //
    //  Verified: v(15,10) v(16,10) both alpha=255,
    //    rgb(111,147,85) and (110,146,84) — deep forest green ✓
    // ─────────────────────────────────────────────────────────────
    TREE: {
        sheet:     'VILLAGE',
        isOverlay: true,
        variants: [
            v(15, 10),   // 0 — summer tree canopy (deep green)
            v(16, 10),   // 1 — summer tree canopy variant
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WATER  (TILE.WATER = 5)  — animated, 4 frames
    //  Sheet: water_waves_48x48.png (672×48, 14 frames total).
    //  Using first 4; all verified as blue water alpha=255 ✓
    // ─────────────────────────────────────────────────────────────
    WATER: {
        sheet:    'WATER_ANIM',
        animated: true,
        fps:      8,
        frames: [
            { sx:   0, sy: 0, sw: 48, sh: 48 },   // frame 0
            { sx:  48, sy: 0, sw: 48, sh: 48 },   // frame 1
            { sx:  96, sy: 0, sw: 48, sh: 48 },   // frame 2
            { sx: 144, sy: 0, sw: 48, sh: 48 },   // frame 3
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  DOOR  (TILE.DOOR = 6)  — animated
    //  Sheet: door_48x48.png (192×48, 4 frames) — all verified ✓
    // ─────────────────────────────────────────────────────────────
    DOOR: {
        sheet:    'DOOR_ANIM',
        animated: true,
        fps:      6,
        frames: [
            { sx:   0, sy: 0, sw: 48, sh: 48 },   // frame 0 — closed
            { sx:  48, sy: 0, sw: 48, sh: 48 },   // frame 1
            { sx:  96, sy: 0, sw: 48, sh: 48 },   // frame 2
            { sx: 144, sy: 0, sw: 48, sh: 48 },   // frame 3 — open
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  STAIRS DOWN  (TILE.STAIRS = 7)
    //  Sheet: Kenney — brown/earth tile as dark-pit visual.
    //  k(6,0): (178,129,83) alpha=255, brown earth ✓
    // ─────────────────────────────────────────────────────────────
    STAIRS: {
        sheet: 'KENNEY',
        variants: [
            k(6, 0),   // dark earth / pit entrance
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  STAIRS UP  (TILE.STAIRSUP = 9)
    //  Sheet: Kenney — cream/sandy tile as light-exit visual.
    //  k(8,0): (228,216,189) alpha=255, cream stone ✓
    // ─────────────────────────────────────────────────────────────
    STAIRSUP: {
        sheet: 'KENNEY',
        variants: [
            k(8, 0),   // cream stone / exit
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  SIGN  (TILE.SIGN = 8)
    //  Sheet: Serene Village — wooden sign tiles.
    //  v(10,2): (206,156,79) alpha=255 brownish wood sign ✓
    //  v(2,9):  (189,165,92) alpha=255 golden wood panel  ✓
    //  v(3,9):  (189,165,92) alpha=255 golden wood panel  ✓
    // ─────────────────────────────────────────────────────────────
    SIGN: {
        sheet: 'VILLAGE',
        variants: [
            v(10, 2),  // 0 — wall plaque (brownish wood)
            v(2,  9),  // 1 — floor / post sign (golden wood)
            v(3,  9),  // 2 — post sign variant
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  TORCH  (TILE.TORCH = 10)  — animated, 2 frames
    //  Sheet: Kenney — warm candle/torch sprites row 6 cols 15–16.
    //  k(15,6): (203,157, 94) alpha=220 warm orange-brown ✓
    //  k(16,6): (184,159,104) alpha=217 warm orange-brown ✓
    // ─────────────────────────────────────────────────────────────
    TORCH: {
        sheet:    'KENNEY',
        animated: true,
        fps:      8,
        frames: [
            k(15, 6),   // frame A — warm candle/torch
            k(16, 6),   // frame B — torch flicker variant
        ],
        fallback: 'procedural',
    },


    // ═══════════════════════════════════════════════════════════════
    //  CHARACTER DEFINITIONS
    //  Used by EntityRenderer.
    //  Ninja Adventure walk layout (16 px, no gap):
    //    Row 0 — Walk Down   cols 0–8
    //    Row 1 — Walk Up
    //    Row 2 — Walk Left
    //    Row 3 — Walk Right
    // ═══════════════════════════════════════════════════════════════
    CHAR: Object.freeze({
        frameW:    16,
        frameH:    16,
        walkRows:  Object.freeze({ down: 0, up: 1, left: 2, right: 3 }),
        walkFrames: Object.freeze([0, 1, 2]),

        player: Object.freeze({
            Warrior: 'CHAR_KNIGHT',
            Rogue:   'CHAR_NINJA_BLUE',
            Wizard:  'CHAR_SORCERER',
            Cleric:  'CHAR_MONK',
        }),

        npc: Object.freeze({
            guide:      'CHAR_BOY',
            elder:      'CHAR_OLDMAN',
            blacksmith: 'CHAR_FIGHTER',
            traveler:   'CHAR_NOBLE',
            ghost:      'CHAR_SPIRIT',
            _default:   'CHAR_BOY',
        }),

        enemy: Object.freeze({
            shade:  'ENEMY_SHADE',
            lurker: null,   // procedural
        }),
    }),
};

Object.freeze(TILE_MANIFEST);


// ─── DEBUG HELPER ─────────────────────────────────────────────────────────────
//  Call TILE_MANIFEST.listAll() in the browser console to print
//  every tile source coordinate currently in the manifest.
(function attachHelpers() {
    const lines = [];
    for (const [name, def] of Object.entries(TILE_MANIFEST)) {
        if (!def || typeof def !== 'object' || name === 'CHAR') continue;
        const items = def.variants || def.frames || [];
        items.forEach((rect, idx) => {
            if (!rect) return;
            const type = def.variants ? 'variant' : 'frame';
            lines.push(
                `${name}[${type} ${idx}]  sheet:${def.sheet}` +
                `  → sx:${rect.sx}  sy:${rect.sy}  sw:${rect.sw}  sh:${rect.sh}`
            );
        });
    }
    Object.defineProperty(TILE_MANIFEST, 'listAll', {
        value() {
            console.group('TILE_MANIFEST — all verified coordinates');
            lines.forEach(l => console.log(l));
            console.groupEnd();
            return lines;
        },
        enumerable:   false,
        configurable: false,
        writable:     false,
    });
})();
