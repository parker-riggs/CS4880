'use strict';
// ═══════════════════════════════════════════════════════════════════
//  TILE_MANIFEST.js  —  The Forgotten Realm
//
//  Maps every game tile type and entity type to its sprite sheet.
//
//  HOW TO VERIFY COORDINATES
//  ─────────────────────────
//  Every coordinate marked ⚠️ VERIFY was estimated from pack
//  documentation and needs one-time visual confirmation:
//
//    1. Run the game and press F3 to open the Sprite Picker overlay.
//    2. The overlay draws the loaded sheet with a clickable tile grid.
//    3. Click any tile cell → its col/row/sx/sy prints to the console.
//    4. Update the matching v(col,row) / i(col,row) / k(col,row) call
//       in this file, then refresh.
//
//  Call TILE_MANIFEST.listUnverified() in the console at any time to
//  see a checklist of all items that still need inspection.
//
//  COORDINATE HELPERS
//  ──────────────────
//  v(col, row)  — Serene Village 48 px grid  (48 px tiles, no gap)
//  i(col, row)  — Modern Interiors 48 px grid (48 px tiles, no gap)
//  k(col, row)  — Kenney 16 px grid           (16 px tiles, 1 px gap → 17 px stride)
//  n(col, row)  — Ninja Adventure 16 px grid  (16 px tiles, no gap)
// ═══════════════════════════════════════════════════════════════════


// ─── SHEET REGISTRY ──────────────────────────────────────────────────────────
//  All file paths relative to the server root.
//  Flask serves /graphics/ via the route added in app.py.
//  null = deliberate no-match (procedural fallback will be used).
const SHEET_PATHS = Object.freeze({

    // ── OUTDOOR / OVERWORLD ───────────────────────────────────────
    //  Serene Village Revamped by LimeZu — 48 px native tiles, no gap
    VILLAGE:         '/graphics/Outer World/SERENE_VILLAGE_REVAMPED/Serene_Village_48x48.png',

    //  Animated tiles (horizontal frame strips at 48 px)
    WATER_ANIM:      '/graphics/Outer World/SERENE_VILLAGE_REVAMPED/Animated stuff/water_waves_48x48.png',
    DOOR_ANIM:       '/graphics/Outer World/SERENE_VILLAGE_REVAMPED/Animated stuff/door_48x48.png',

    // ── INTERIOR ─────────────────────────────────────────────────
    //  Modern Interiors Revamped by LimeZu — 48 px native
    INTERIORS:       '/graphics/Indoor & Dungeon/Modern tiles_Free/Interiors_free/48x48/Interiors_free_48x48.png',
    ROOM_BUILDER:    '/graphics/Indoor & Dungeon/Modern tiles_Free/Interiors_free/48x48/Room_Builder_free_48x48.png',

    // ── DUNGEON ───────────────────────────────────────────────────
    //  Kenney Roguelike/RPG Pack — 16 px native, 17 px stride (16 + 1 px gap)
    //  SpriteRenderer scales each cut tile 3× (16 → 48 px) to match TS.
    KENNEY:          '/graphics/Indoor & Dungeon/Kenny-Rougelike/Spritesheet/roguelikeSheet_transparent.png',

    // ── PLAYER — one sheet per character class ────────────────────
    //  Ninja Adventure Asset Pack — 16 px frames, no gap
    //  Standard per-sheet layout:
    //    Row 0 — Walk Down   cols 0–8  (9 frames)
    //    Row 1 — Walk Up
    //    Row 2 — Walk Left
    //    Row 3 — Walk Right
    //    (further rows: attack, idle, jump, item, special1/2 — unused here)
    //  ⚠️ VERIFY row order against each character's SeparateAnim/Walk.png
    CHAR_KNIGHT:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Knight/SpriteSheet.png',
    CHAR_NINJA_BLUE: '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/NinjaBlue/SpriteSheet.png',
    CHAR_SORCERER:   '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/SorcererBlack/SpriteSheet.png',
    CHAR_MONK:       '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Monk2/SpriteSheet.png',

    // ── NPC CHARACTERS ────────────────────────────────────────────
    CHAR_BOY:        '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Boy/SpriteSheet.png',        // Rowan
    CHAR_OLDMAN:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/OldMan2/SpriteSheet.png',    // Elder Maren
    CHAR_FIGHTER:    '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/FighterRed/SpriteSheet.png', // Daran
    CHAR_NOBLE:      '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Noble/SpriteSheet.png',      // Veyla
    CHAR_SPIRIT:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/Spirit/SpriteSheet.png',     // Mira (ghost)

    // ── ENEMIES ───────────────────────────────────────────────────
    ENEMY_SHADE:     '/graphics/Character & NPC/Ninja Adventure - Asset Pack/Actor/Character/NinjaDark/SpriteSheet.png',
    // ⚠️ NO_MATCH — Cave Lurker: no stone-monster sprite in any available pack.
    //   EntityRenderer uses procedural drawEnemyOverworld() for 'lurker'.
    //   To add a sprite: set this to a path and update TILE_MANIFEST.CHAR.enemy.lurker
    ENEMY_LURKER:    null,
});


// ─── TILE-SIZE CONSTANTS (native pixels, before scaling) ─────────────────────
const V_TILE   = 48;   // Serene Village / Modern Interiors — 48 px, no gap
const K_TILE   = 16;   // Kenney — 16 px tile
const K_STRIDE = 17;   // Kenney — 17 px stride (16 + 1 px gap)


// ─── COORDINATE HELPERS ──────────────────────────────────────────────────────

/** Serene Village 48 px grid: col × 48, row × 48, 48×48 px */
function v(col, row) {
    return { sx: col * V_TILE, sy: row * V_TILE, sw: V_TILE, sh: V_TILE };
}

/** Modern Interiors 48 px grid: col × 48, row × 48, 48×48 px */
function i(col, row) {
    return { sx: col * V_TILE, sy: row * V_TILE, sw: V_TILE, sh: V_TILE };
}

/** Kenney 16 px / 17 px-stride grid: returns a 16×16 source rect */
function k(col, row) {
    return { sx: col * K_STRIDE, sy: row * K_STRIDE, sw: K_TILE, sh: K_TILE };
}

/** Ninja Adventure 16 px grid (no gap): col × 16, row × 16, 16×16 px */
function n(col, row) {
    return { sx: col * 16, sy: row * 16, sw: 16, sh: 16 };
}


// ═══════════════════════════════════════════════════════════════════
//  TILE_MANIFEST
//  ─────────────
//  Each entry key matches the tile name used in game.js (TILE.*).
//  Fields:
//    sheet     — key into SHEET_PATHS
//    variants  — array of source rects for static / multi-variant tiles
//    animated  — present on animated tiles; contains fps + frames[]
//    isOverlay — true for TREE: SpriteRenderer draws GRASS first, then this
//    fallback  — 'procedural' → use existing _tc cache when sheet not loaded
//
//  Context-dependent wall/floor keys (WALL_EXT, WALL_INT, WALL_DUN,
//  CEILING, FLOOR_LIGHT, FLOOR_DARK) are selected by SpriteRenderer
//  at draw time based on the map's dark / isInterior flags.
// ═══════════════════════════════════════════════════════════════════
const TILE_MANIFEST = {

    // ─────────────────────────────────────────────────────────────
    //  GRASS  (TILE.GRASS = 0)
    //  Pack: Serene Village 48 px
    //  8 variants matching game.js _tc variants:
    //    0=plain  1=flowers  2=pebbles  3=mushroom
    //    4=dense-blades  5=dry  6=dark  7=clover
    //
    //  ⚠️ VERIFY — open Serene_Village_48x48.png, use F3 Sprite Picker
    // ─────────────────────────────────────────────────────────────
    GRASS: {
        sheet: 'VILLAGE',
        variants: [
            v(0, 0),   // 0 — plain grass         ⚠️ VERIFY col/row
            v(1, 0),   // 1 — flowers
            v(2, 0),   // 2 — pebbles
            v(3, 0),   // 3 — mushroom
            v(4, 0),   // 4 — dense blades
            v(5, 0),   // 5 — dry
            v(6, 0),   // 6 — dark
            v(7, 0),   // 7 — clover
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  PATH  (TILE.PATH = 1)
    //  Pack: Serene Village 48 px
    //  4 variants: 0=plain  1=cracked  2=mossy  3=worn
    //  ⚠️ VERIFY row — stone path tiles typically in rows 2–4
    // ─────────────────────────────────────────────────────────────
    PATH: {
        sheet: 'VILLAGE',
        variants: [
            v(0, 2),   // 0 — plain cobble         ⚠️ VERIFY
            v(1, 2),   // 1 — cracked cobble
            v(2, 2),   // 2 — mossy cobble
            v(3, 2),   // 3 — worn cobble
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  FLOOR — light interior  (TILE.FLOOR, dark=false)
    //  Pack: Modern Interiors 48 px
    //  4 variants — wood plank / stone floor variants
    //  ⚠️ VERIFY — open Interiors_free_48x48.png, F3 to inspect
    // ─────────────────────────────────────────────────────────────
    FLOOR_LIGHT: {
        sheet: 'INTERIORS',
        variants: [
            i(0, 0),   // 0 — plank light           ⚠️ VERIFY
            i(1, 0),   // 1 — plank worn
            i(2, 0),   // 2 — plank marked
            i(3, 0),   // 3 — dark plank
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  FLOOR — dark dungeon  (TILE.FLOOR, dark=true)
    //  Pack: Kenney Roguelike (16 px → scaled 3× to 48 px)
    //  4 variants — stone/rubble floor
    //  ⚠️ VERIFY — stone floor tiles typically rows 3–5, cols 0–4
    // ─────────────────────────────────────────────────────────────
    FLOOR_DARK: {
        sheet: 'KENNEY',
        variants: [
            k(0, 3),   // 0 — stone floor plain     ⚠️ VERIFY
            k(1, 3),   // 1 — stone floor alt
            k(2, 3),   // 2 — stone floor cracked
            k(3, 3),   // 3 — stone floor dark
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WALL_EXT — exterior stone  (TILE.WALL, outdoor map)
    //  Pack: Serene Village 48 px
    //  4 variants: plain / mossy / dark / stained
    //  ⚠️ VERIFY — exterior walls typically rows 5–9
    // ─────────────────────────────────────────────────────────────
    WALL_EXT: {
        sheet: 'VILLAGE',
        variants: [
            v(0, 5),   // 0 — plain stone wall       ⚠️ VERIFY
            v(1, 5),   // 1 — mossy
            v(2, 5),   // 2 — dark
            v(3, 5),   // 3 — stained
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WALL_INT — interior wood plank  (TILE.WALL, interior map)
    //  Pack: Room Builder 48 px
    //  4 variants (plank variants + overhead beam for variant 3)
    //  ⚠️ VERIFY — open Room_Builder_free_48x48.png
    // ─────────────────────────────────────────────────────────────
    WALL_INT: {
        sheet: 'ROOM_BUILDER',
        variants: [
            i(0, 0),   // 0 — plank A                ⚠️ VERIFY
            i(1, 0),   // 1 — plank B
            i(2, 0),   // 2 — plank C
            i(3, 0),   // 3 — beam
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WALL_DUN — dungeon hewn rock  (TILE.WALL, dark map)
    //  Pack: Kenney Roguelike (16 px → 3×)
    //  4 variants: plain / cracked / damp / veined
    //  ⚠️ VERIFY — dungeon wall tiles typically rows 0–2, cols 0–3
    // ─────────────────────────────────────────────────────────────
    WALL_DUN: {
        sheet: 'KENNEY',
        variants: [
            k(0, 0),   // 0 — stone wall plain       ⚠️ VERIFY
            k(1, 0),   // 1 — cracked
            k(0, 1),   // 2 — damp
            k(2, 0),   // 3 — veined
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  CEILING — interior overhead beam  (TILE.WALL, ty===0, interior)
    //  Pack: Room Builder 48 px
    //  4 variants
    //  ⚠️ VERIFY — ceiling / beam row in Room_Builder_free_48x48.png
    // ─────────────────────────────────────────────────────────────
    CEILING: {
        sheet: 'ROOM_BUILDER',
        variants: [
            i(0, 1),   // 0                          ⚠️ VERIFY
            i(1, 1),
            i(2, 1),
            i(3, 1),
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  TREE  (TILE.TREE = 4)
    //  Pack: Serene Village 48 px
    //  isOverlay = true: SpriteRenderer draws GRASS underneath first,
    //  then this tile on top — matching game.js composite draw logic.
    //  2 variants: 0=summer  1=autumn
    //  ⚠️ VERIFY — single-cell tree-top sprites; often right half of sheet
    //    or in a dedicated decorative row
    // ─────────────────────────────────────────────────────────────
    TREE: {
        sheet:     'VILLAGE',
        isOverlay: true,
        variants: [
            v(8, 0),   // 0 — summer tree top        ⚠️ VERIFY
            v(9, 0),   // 1 — autumn tree top
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  WATER  (TILE.WATER = 5)  — animated, 4 frames
    //  Pack: water_waves_48x48.png
    //  Layout assumed: 4 horizontal frames, each 48×48 px
    //    Total sheet: 192 × 48 px  (4 × 48)
    //  fps: 8 → 125 ms/frame, matching existing game code
    //
    //  ⚠️ If the sheet has a different frame count, check:
    //    actual PNG width ÷ 48 = frame count
    //    Then add/remove frames[] entries to match.
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
    //  Pack: door_48x48.png
    //  Layout assumed: 4 horizontal frames
    //    frame 0 = closed  (used for static background bake)
    //    frame 3 = fully open
    //  ⚠️ If only 2 frames exist (closed/open), remove frames 1–2
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
    //  Pack: Kenney Roguelike (16 px → 3×)
    //  ⚠️ VERIFY — stair tiles vary per sheet; typically rows 5–9
    // ─────────────────────────────────────────────────────────────
    STAIRS: {
        sheet: 'KENNEY',
        variants: [
            k(4, 5),   // stairs down                ⚠️ VERIFY
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  STAIRS UP  (TILE.STAIRSUP = 9)
    //  Pack: Kenney Roguelike (16 px → 3×)
    //  ⚠️ VERIFY
    // ─────────────────────────────────────────────────────────────
    STAIRSUP: {
        sheet: 'KENNEY',
        variants: [
            k(5, 5),   // stairs up                  ⚠️ VERIFY
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  SIGN  (TILE.SIGN = 8)
    //  Pack: Serene Village 48 px
    //  3 sub-types selected by context at render time:
    //    0 = wall plaque   (WALL neighbour to the north)
    //    1 = floor sign    (surrounded by FLOOR)
    //    2 = post sign     (outdoor / GRASS context)
    //  ⚠️ VERIFY — sign sprites typically mid/right section of sheet
    // ─────────────────────────────────────────────────────────────
    SIGN: {
        sheet: 'VILLAGE',
        variants: [
            v(10, 2),  // 0 — wall plaque             ⚠️ VERIFY
            v(11, 2),  // 1 — floor sign
            v(12, 2),  // 2 — post sign
        ],
        fallback: 'procedural',
    },

    // ─────────────────────────────────────────────────────────────
    //  TORCH  (TILE.TORCH = 10)  — animated, 2 frames
    //  Pack: Kenney Roguelike (16 px → 3×)
    //  Timing: irregular 4–6 fps (per-torch phase, matching game.js)
    //  ⚠️ VERIFY — torch/fire tiles typically rows 3–4 in Kenney sheet
    // ─────────────────────────────────────────────────────────────
    TORCH: {
        sheet:    'KENNEY',
        animated: true,
        fps:      8,
        frames: [
            k(5, 3),   // frame A — tall flame        ⚠️ VERIFY
            k(6, 3),   // frame B — wide flame
        ],
        fallback: 'procedural',
    },


    // ═══════════════════════════════════════════════════════════════
    //  CHARACTER DEFINITIONS
    //  Used by EntityRenderer (Phase 4).
    //
    //  Ninja Adventure walk animation layout (16 px per frame, no gap):
    //    Row 0 — Walk Down    cols 0–8  (9 frames, 144 × 16 px per row)
    //    Row 1 — Walk Up
    //    Row 2 — Walk Left
    //    Row 3 — Walk Right
    //
    //  The game uses 3 visible walk frames (idle / left-step / right-step).
    //  We use column indices 0, 1, 2 from the appropriate walk row.
    //
    //  ⚠️ VERIFY walkRows against each SpriteSheet.png — compare with
    //    the matching SeparateAnim/Walk.png for ground truth.
    // ═══════════════════════════════════════════════════════════════
    CHAR: Object.freeze({
        frameW:    16,   // native frame width  (px)
        frameH:    16,   // native frame height (px)

        // direction string → row index in the walk animation strip
        // ⚠️ VERIFY — most Ninja Adventure chars follow this order,
        //   but a few differ.  Check SeparateAnim/Walk.png if sprites
        //   face the wrong way.
        walkRows: Object.freeze({ down: 0, up: 1, left: 2, right: 3 }),

        // Column indices used for the walk cycle
        //   walkFrames[0] = idle / standing still
        //   walkFrames[1] = left-foot forward
        //   walkFrames[2] = right-foot forward
        walkFrames: Object.freeze([0, 1, 2]),

        // ── Player — one sheet key per class ──────────────────────
        player: Object.freeze({
            Warrior: 'CHAR_KNIGHT',
            Rogue:   'CHAR_NINJA_BLUE',
            Wizard:  'CHAR_SORCERER',
            Cleric:  'CHAR_MONK',
        }),

        // ── NPCs — keyed by id from game.js NPC definition arrays ─
        npc: Object.freeze({
            guide:      'CHAR_BOY',      // Rowan
            elder:      'CHAR_OLDMAN',   // Elder Maren
            blacksmith: 'CHAR_FIGHTER',  // Daran
            traveler:   'CHAR_NOBLE',    // Veyla
            ghost:      'CHAR_SPIRIT',   // Mira
            _default:   'CHAR_BOY',      // fallback for any unrecognised id
        }),

        // ── Enemies ───────────────────────────────────────────────
        enemy: Object.freeze({
            shade:  'ENEMY_SHADE',
            lurker: null,   // ⚠️ NO_MATCH → EntityRenderer uses procedural
        }),
    }),
};

// Freeze the whole manifest so nothing mutates it at runtime
Object.freeze(TILE_MANIFEST);


// ─── VERIFICATION HELPER ─────────────────────────────────────────────────────
//  Call TILE_MANIFEST.listUnverified() in the browser console to print
//  every tile entry that still needs visual coordinate confirmation.
(function attachHelpers() {
    const lines = [];

    const entries = Object.entries(TILE_MANIFEST);
    for (const [name, def] of entries) {
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

    // Attach as a non-enumerable method so freeze still works above
    Object.defineProperty(TILE_MANIFEST, 'listUnverified', {
        value() {
            console.group('⚠️  TILE_MANIFEST — all tile source coordinates (verify each)');
            lines.forEach(l => console.log(l));
            console.log('\nTip: Press F3 in-game → click any cell → sx/sy prints to console.');
            console.groupEnd();
            return lines;
        },
        enumerable:   false,
        configurable: false,
        writable:     false,
    });
})();
