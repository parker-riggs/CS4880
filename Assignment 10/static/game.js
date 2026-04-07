'use strict';

// ═══════════════════════════════════════════════════════
//  TILE DEFINITIONS
// ═══════════════════════════════════════════════════════
const TILE = Object.freeze({
    GRASS:0, PATH:1, FLOOR:2, WALL:3,
    TREE:4, WATER:5, DOOR:6, STAIRS:7, SIGN:8,
    STAIRSUP:9, TORCH:10,
});
const WALKABLE = new Set([
    TILE.GRASS, TILE.PATH, TILE.FLOOR,
    TILE.DOOR, TILE.SIGN, TILE.STAIRS, TILE.STAIRSUP,
]);
const { GRASS:G, PATH:P, FLOOR:F, WALL:W, TREE:TR,
        WATER:WA, DOOR:DR, STAIRS:ST, SIGN:SG,
        STAIRSUP:SU, TORCH:TC } = TILE;

// ═══════════════════════════════════════════════════════
//  MAP TILE DATA
// ═══════════════════════════════════════════════════════
function buildVillageTiles() {
    const W_=48, H_=36;
    const m = Array.from({length:H_}, () => new Array(W_).fill(TR));
    const s = (x,y,t) => { if(y>=0&&y<H_&&x>=0&&x<W_) m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    const house = (x1,y1,x2,y2) => { fill(x1,y1,x2,y2,W); };

    // ── 1. Playable ground ───────────────────────────────────
    fill(1,1,46,34, G);

    // ── 2. Main roads ────────────────────────────────────────
    // N–S spine x=21,22; E–W spine y=16,17
    // All buildings stay clear of these columns/rows.
    fill(21,1,22,34, P);
    fill(1,16,46,17, P);

    // ── 3. Decorative tree fills (placed before buildings so
    //        buildings/paths naturally overwrite them) ────────
    fill(31,2,32,11, TR);   // forest strip between Merchant and Blacksmith
    fill(44,2,46,15, TR);   // east border fringe NE
    fill(44,18,46,27, TR);  // east border fringe SE
    fill(37,29,43,34, TR);  // SE corner south of chapel

    // ── 4. Pond (NW decorative water feature) ────────────────
    //  Water: x=13–19, y=3–12  (safely west of N–S road x=21)
    fill(13,3,19,12, WA);
    fill(12,2,20,2,  P);    // north rim path
    fill(12,13,20,13,P);    // south rim path
    fill(12,2,12,13, P);    // west rim path
    // east rim is x=20, adjacent to N–S road at x=21 (already path)

    // ── 5. Buildings ──────────────────────────────────────────
    // Layout (verified non-overlapping, no road tiles covered):
    //   A: Elder's Hall    x= 2–11, y= 2–11   (NW)
    //   B: Merchant House  x=24–30, y= 2– 9   (NE upper)
    //   C: Blacksmith      x=33–43, y= 2–11   (NE)
    //   D: Tavern          x= 2–12, y=19–27   (SW)
    //   E: Market Hall     x=24–36, y=19–27   (SE upper)
    //   F: Small Cottage   x= 2– 9, y=29–34   (SW lower)
    //   G: Chapel          x=27–36, y=29–34   (SE lower)
    //   H: Veyla's Cottage x=38–45, y=19–26   (SE right)

    // A: Elder's Hall — 10×10
    house(2,2, 11,11);
    s(6,11,DR); s(7,11,DR);             // south entrance

    // B: Merchant House — 7×8
    house(24,2, 30,9);
    s(26,9,DR); s(27,9,DR);             // south entrance

    // C: Blacksmith — 11×10
    house(33,2, 43,11);
    s(36,11,DR); s(37,11,DR);           // south entrance

    // D: Tavern — 11×9
    house(2,19, 12,27);
    s(6,19,DR); s(7,19,DR);             // north entrance (faces E–W road gap at y=18)

    // E: Market Hall — 13×9
    house(24,19, 36,27);
    s(24,22,DR); s(24,23,DR);           // west entrance (faces N–S road at x=22)

    // F: Small Cottage — 8×6
    house(2,29, 9,34);
    s(9,31,DR); s(9,32,DR);             // east entrance

    // G: Chapel — 10×6
    house(27,29, 36,34);
    s(30,29,DR); s(31,29,DR);           // north entrance

    // H: Veyla's Cottage — 8×8
    house(38,19, 45,26);
    s(41,19,DR); s(42,19,DR);           // north entrance (faces E–W road at y=17)

    // ── 6. Connecting paths ───────────────────────────────────
    // A south exit → E–W road
    fill(6,12,7,16, P);
    // Horizontal shortcut east across the NW quadrant to N–S road
    fill(6,13,20,13, P);

    // B south → E–W road
    fill(26,10,27,16, P);

    // C south → E–W road
    fill(36,12,37,16, P);

    // D north door gap (y=18) → E–W road at y=17
    fill(6,18,7,18, P);
    // D south step
    fill(5,28,6,28, P);

    // F east door → N–S road
    fill(10,31,20,32, P);

    // E west door → N–S road
    fill(23,22,23,23, P);
    // E south → G north
    fill(29,28,31,28, P);

    // H north door gap (y=18) → E–W road at y=17
    fill(41,18,42,18, P);

    // ── 7. Signs ────────────────────────────────────────────
    s(21,8,  SG);   // village welcome sign (on N–S road, y=8)
    s(21,32, SG);   // dungeon warning sign

    // ── 8. Dungeon stairs ────────────────────────────────────
    s(21,34, ST);
    s(22,34, ST);

    return m;
}

function buildDungeonTiles() {
    const rows = 21, cols = 30;
    const m = Array.from({length:rows}, () => new Array(cols).fill(W));
    const fill = (x1,y1,x2,y2,t) => {
        for (let y=y1;y<=y2;y++) for (let x=x1;x<=x2;x++) m[y][x]=t;
    };
    fill(1,1,10,6,F);   // Room A (entry)
    m[2][8] = SG;        // warning sign
    m[3][3] = SU;        // stairs up
    for (let y=7;y<=9;y++) m[y][5]=F;  // corridor A→B
    fill(1,10,10,16,F);  // Room B (ghost room)
    for (let x=11;x<=19;x++) m[13][x]=F; // bridge B→C
    fill(20,10,28,16,F); // Room C (item room)
    m[11][22]=SG;        // lore tablet
    for (let y=17;y<=18;y++) m[y][5]=F; // corridor south
    m[19][5]=ST;         // stairs down (future)
    // Torches
    m[1][0]=TC; m[6][0]=TC; m[1][10]=TC; m[6][10]=TC;
    m[10][0]=TC; m[16][0]=TC; m[10][10]=TC; m[16][10]=TC;
    m[10][20]=TC; m[16][20]=TC; m[10][28]=TC; m[16][28]=TC;
    return m;
}

function buildEldersHallInterior() {
    const W_=14, H_=12;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    // Torches on north wall
    s(3,0,TC); s(10,0,TC);
    // Council table (hollow rectangle)
    fill(2,2,11,5,W); fill(3,3,10,4,F);
    // Bookcase strip on east wall
    fill(12,1,12,5,W);
    // Notice board sign on north wall
    s(6,0,SG);
    // Exit tiles
    s(6,H_-2,SU); s(7,H_-2,SU);
    return m;
}

function buildMerchantInterior() {
    const W_=12, H_=10;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    s(2,0,TC); s(9,0,TC);
    // L-shape counter
    fill(1,2,8,2,W);
    s(8,3,W); s(8,4,W);
    // Goods display east
    fill(10,2,10,5,W);
    s(5,H_-2,SU); s(6,H_-2,SU);
    return m;
}

function buildBlacksmithInterior() {
    const W_=14, H_=12;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    s(2,0,TC); s(11,0,TC);
    // Forge torch (east side — forge fire)
    s(11,1,TC);
    // Anvil
    s(9,3,W);
    // Tool rack on north wall
    fill(2,1,6,1,W);
    // Weapon rack on west wall
    fill(1,2,1,6,W);
    s(6,H_-2,SU); s(7,H_-2,SU);
    return m;
}

function buildTavernInterior() {
    const W_=14, H_=12;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    s(2,0,TC); s(11,0,TC);
    // Bar counter (L-shape)
    fill(1,2,9,2,W);
    fill(1,3,1,5,W);
    // 2 tables
    fill(4,5,5,6,W); fill(8,5,9,6,W);
    // Barrels on east wall
    fill(12,3,12,6,W);
    s(6,H_-2,SU); s(7,H_-2,SU);
    return m;
}

function buildMarketInterior() {
    const W_=16, H_=12;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    s(2,0,TC); s(13,0,TC);
    // 3 market stalls
    fill(2,2,4,4,W); fill(7,2,9,4,W); fill(12,2,14,4,W);
    s(7,H_-2,SU); s(8,H_-2,SU);
    return m;
}

function buildCottageInterior() {
    const W_=10, H_=10;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    s(2,0,TC); s(7,0,TC);
    // Bed (NE)
    fill(8,1,8,3,W);
    // Table
    fill(2,2,3,3,W);
    // Fireplace on west wall
    s(1,4,TC);
    s(4,H_-2,SU); s(5,H_-2,SU);
    return m;
}

function buildChapelInterior() {
    const W_=12, H_=12;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    s(2,0,TC); s(9,0,TC);
    // Altar signs on north wall
    s(5,0,SG); s(6,0,SG);
    // Altar flanking walls
    s(3,2,W); s(4,2,W); s(7,2,W); s(8,2,W);
    // Pews (2 rows of 2)
    fill(2,5,3,5,W); fill(8,5,9,5,W);
    fill(2,7,3,7,W); fill(8,7,9,7,W);
    s(5,H_-2,SU); s(6,H_-2,SU);
    return m;
}

function buildVeylaInterior() {
    const W_=12, H_=10;
    const m = Array.from({length:H_}, () => new Array(W_).fill(W));
    const s = (x,y,t) => { m[y][x]=t; };
    const fill = (x1,y1,x2,y2,t) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) s(x,y,t); };
    fill(1,1,W_-2,H_-2, F);
    s(2,0,TC); s(9,0,TC);
    // Bookshelves on east/west walls
    fill(1,2,1,5,W); fill(10,2,10,5,W);
    // Crystal table centerpiece (hollow)
    fill(4,3,7,4,W); fill(5,3,6,4,F);
    s(5,H_-2,SU); s(6,H_-2,SU);
    return m;
}

// ═══════════════════════════════════════════════════════
//  WORLD ENTITY DATA
// ═══════════════════════════════════════════════════════
const VILLAGE_NPCS = [];  // NPCs are now inside their respective buildings

const ELDER_NPCS = [
    { id:'elder', name:'Elder Maren', x:6, y:5, portrait:'👴', color:'#d0c870', history:[],
      role:'The elderly leader of Eldoria. Wise but frightened — darkness spreads from the Cursed Mines to the south. He desperately needs someone to investigate. He will explicitly ask the player to enter the mines, promising a reward. If the player has entered the mines (quest_into_dark_complete=true), he reacts with relief and asks what they found.' },
];

const BLACKSMITH_NPCS = [
    { id:'blacksmith', name:'Daran', x:4, y:4, portrait:'🔨', color:'#d07040', history:[],
      role:'The village blacksmith. Gruff, grieving. His brother Henrick went into the mines 3 months ago and never returned. He will ask the player to look for any sign of Henrick. If quest_brothers_fate_complete=true (Henrick\'s ring found), he breaks down and thanks the player, and says at least now he knows.' },
];

const VEYLA_NPCS = [
    { id:'traveler', name:'Veyla', x:5, y:2, portrait:'🧝', color:'#70a0e0', history:[],
      role:'A mysterious elven wanderer. Cryptic, testing. She knows an ancient sealed entity called the Hollow King lies in the mines. She will ask the player to find the ancient tablet that describes the seal. If quest_sealed_truth_complete=true, she reveals she is a Warden\'s descendant sent to reinforce the seal.' },
];

const VILLAGE_SIGNS = [
    { x:21, y:8, text:'— ELDORIA —\n\nFounded in the Year of the Third Moon.\nPopulation: 23.\n\n"May the Old Gods light your path."' },
    { x:21, y:32, text:'THE CURSED MINES\n\n"Turn back. Whatever you hear below,\ndo not answer it."\n\n— scratched into the stone by a shaking hand', type:'stairs' },
];

const DUNGEON_NPCS = [
    { id:'ghost', name:"Mira's Ghost", x:5, y:12, portrait:'👻', color:'rgba(160,200,255,0.85)', history:[], ghost:true,
      role:'The ghost of Mira, a young woman who died in the Cursed Mines three months ago. She is confused and fragmented, unable to fully remember what happened. She knows Henrick — he survived longer than the others and made it to the eastern passage before succumbing. She felt the presence of something cold and immense in the deep. She can guide the player east toward where Henrick fell.' },
];

const DUNGEON_SIGNS = [
    { x:8, y:2, text:'ENTRY CHAMBER\n\nYou are not the first to descend.\nYou may be the last to leave.\n\n— Etched by an unknown hand' },
    { x:22, y:11,
      text:'— ANCIENT TABLET —\n\n[Written in Old Script, barely legible...]\n\n"Here rests the Hollow King, sealed by the Three Wardens\nin the Age Before Memory. Should the seal fracture,\ndarkness will pour forth until the realm above\nknows only endless night."\n\n[The stone is cracked. Something has been pressing from within.]',
      questComplete: { given:'quest_sealed_truth_given', complete:'quest_sealed_truth_complete' } },
];

const DUNGEON_ITEMS = [
    { id:'henrick_ring', name:"Henrick's Ring", x:25, y:13, color:'#e8c050', icon:'💍',
      desc:"A worn iron ring with 'H.D.' engraved on the inside. This belonged to Daran's brother.",
      questComplete:'quest_brothers_fate_complete' },
];

// ═══════════════════════════════════════════════════════
//  MAP DEFINITIONS
// ═══════════════════════════════════════════════════════
const MAPS = {
    village: {
        id:'village', w:48, h:36,
        tiles: buildVillageTiles(),
        npcs:  VILLAGE_NPCS,
        signs: VILLAGE_SIGNS,
        items: [],
        playerStart:{x:21,y:16},
        name:'Eldoria Village',
        dark:false,
    },
    dungeon_1: {
        id:'dungeon_1', w:30, h:21,
        tiles: buildDungeonTiles(),
        npcs:  DUNGEON_NPCS,
        signs: DUNGEON_SIGNS,
        items: DUNGEON_ITEMS,
        playerStart:{x:4,y:4},
        name:'Cursed Mines — Floor 1',
        dark:true,
    },
    int_elder: {
        id:'int_elder', w:14, h:12,
        tiles: buildEldersHallInterior(),
        npcs:  ELDER_NPCS,
        signs: [{ x:6, y:0, text:"ELDER'S HALL\n\nThe council chamber of Eldoria.\nAll matters of import are decided here." }],
        items: [],
        playerStart:{x:6, y:8},
        name:"Elder's Hall",
        dark:false,
        returnMap:'village', returnX:6, returnY:12,
    },
    int_merchant: {
        id:'int_merchant', w:12, h:10,
        tiles: buildMerchantInterior(),
        npcs:  [],
        signs: [],
        items: [],
        playerStart:{x:5, y:6},
        name:'Merchant House',
        dark:false,
        returnMap:'village', returnX:26, returnY:10,
    },
    int_blacksmith: {
        id:'int_blacksmith', w:14, h:12,
        tiles: buildBlacksmithInterior(),
        npcs:  BLACKSMITH_NPCS,
        signs: [],
        items: [],
        playerStart:{x:6, y:8},
        name:"Daran's Forge",
        dark:false,
        returnMap:'village', returnX:36, returnY:12,
    },
    int_tavern: {
        id:'int_tavern', w:14, h:12,
        tiles: buildTavernInterior(),
        npcs:  [],
        signs: [],
        items: [],
        playerStart:{x:6, y:8},
        name:'The Wanderer\'s Rest',
        dark:false,
        returnMap:'village', returnX:6, returnY:18,
    },
    int_market: {
        id:'int_market', w:16, h:12,
        tiles: buildMarketInterior(),
        npcs:  [],
        signs: [],
        items: [],
        playerStart:{x:7, y:8},
        name:'Market Hall',
        dark:false,
        returnMap:'village', returnX:23, returnY:22,
    },
    int_cottage: {
        id:'int_cottage', w:10, h:10,
        tiles: buildCottageInterior(),
        npcs:  [],
        signs: [],
        items: [],
        playerStart:{x:4, y:6},
        name:'Village Cottage',
        dark:false,
        returnMap:'village', returnX:10, returnY:31,
    },
    int_chapel: {
        id:'int_chapel', w:12, h:12,
        tiles: buildChapelInterior(),
        npcs:  [],
        signs: [{ x:5, y:0, text:"CHAPEL OF THE OLD GODS\n\n\"Light endures.\nDarkness merely waits its turn.\"\n\n— The Third Scripture" },
                { x:6, y:0, text:"CHAPEL OF THE OLD GODS\n\n\"Light endures.\nDarkness merely waits its turn.\"\n\n— The Third Scripture" }],
        items: [],
        playerStart:{x:5, y:8},
        name:'Chapel of the Old Gods',
        dark:false,
        returnMap:'village', returnX:30, returnY:30,
    },
    int_veyla: {
        id:'int_veyla', w:12, h:10,
        tiles: buildVeylaInterior(),
        npcs:  VEYLA_NPCS,
        signs: [],
        items: [],
        playerStart:{x:5, y:6},
        name:"Veyla's Study",
        dark:false,
        returnMap:'village', returnX:41, returnY:20,
    },
};

// ═══════════════════════════════════════════════════════
//  BUILDING ENTRANCE LOOKUP
// ═══════════════════════════════════════════════════════
const BUILDING_ENTRANCES = {
    village: {
        '6,11':'int_elder',   '7,11':'int_elder',
        '26,9':'int_merchant','27,9':'int_merchant',
        '36,11':'int_blacksmith','37,11':'int_blacksmith',
        '6,19':'int_tavern',  '7,19':'int_tavern',
        '24,22':'int_market', '24,23':'int_market',
        '9,31':'int_cottage', '9,32':'int_cottage',
        '30,29':'int_chapel', '31,29':'int_chapel',
        '41,19':'int_veyla',  '42,19':'int_veyla',
    },
};

// ═══════════════════════════════════════════════════════
//  QUEST DEFINITIONS
// ═══════════════════════════════════════════════════════
const QUESTS = [
    { id:'into_the_dark',    title:'Into the Dark',
      giver:'elder',        giverName:'Elder Maren',
      objective:'Descend into the Cursed Mines south of Eldoria.',
      flag_given:'quest_into_dark_given', flag_complete:'quest_into_dark_complete' },
    { id:'brothers_fate',   title:"Brother's Fate",
      giver:'blacksmith',   giverName:'Daran',
      objective:"Find any trace of Henrick in the mines.",
      flag_given:'quest_brothers_fate_given', flag_complete:'quest_brothers_fate_complete' },
    { id:'sealed_truth',    title:'The Sealed Truth',
      giver:'traveler',     giverName:'Veyla',
      objective:'Find the ancient tablet deep in the mines.',
      flag_given:'quest_sealed_truth_given', flag_complete:'quest_sealed_truth_complete' },
];

const QUEST_GIVER_FLAGS = {
    elder:       'quest_into_dark_given',
    blacksmith:  'quest_brothers_fate_given',
    traveler:    'quest_sealed_truth_given',
};

// ═══════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════
const gs = { charName:'Hero', charClass:'Warrior', flags:{}, inventory:[] };
let currentMap = MAPS.village;

const player  = { x:7, y:8, facing:'down' };
const cam     = { x:0, y:0 };
const ui      = { dialogue:null, sign:null, loading:false, questLog:false, paused:false };
let timeMs    = 0;
let TS        = 48;
const HUD_H   = 40, HINT_H = 26;

// ═══════════════════════════════════════════════════════
//  CANVAS
// ═══════════════════════════════════════════════════════
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight - HUD_H - HINT_H;
    TS = Math.floor(Math.min(canvas.width / 15, canvas.height / 11));
    TS = Math.max(32, Math.min(TS, 64));
    lightCanvas = null; // force recreation at new size
}
window.addEventListener('resize', resizeCanvas);

// ═══════════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════════
const KEYS         = new Set();
const JUST_PRESSED = new Set();

document.addEventListener('keydown', e => {
    if (document.activeElement?.tagName === 'INPUT') return;
    const nav = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '];
    if (nav.includes(e.key)) e.preventDefault();
    if (!KEYS.has(e.key)) JUST_PRESSED.add(e.key);
    KEYS.add(e.key);
    if (e.key === 'e' || e.key === 'E') { e.preventDefault(); handleInteract(); }
    if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); toggleQuestLog(); }
    if (e.key === 'Escape') {
        if (ui.paused) { closePause(); }
        else if (ui.dialogue || ui.sign || ui.questLog) { closeDialogue(); closeSign(); closeQuestLog(); }
        else { openPause(); }
    }
});
document.addEventListener('keyup', e => KEYS.delete(e.key));

let moveAccum = 999;

function updateMovement(dt) {
    if (ui.dialogue || ui.sign || ui.questLog || ui.loading || ui.paused) { JUST_PRESSED.clear(); return; }
    const dirs = [
        { keys:['ArrowUp','w','W'],    dx:0,  dy:-1, f:'up'    },
        { keys:['ArrowDown','s','S'],  dx:0,  dy:1,  f:'down'  },
        { keys:['ArrowLeft','a','A'],  dx:-1, dy:0,  f:'left'  },
        { keys:['ArrowRight','d','D'], dx:1,  dy:0,  f:'right' },
    ];
    for (const d of dirs) {
        if (d.keys.some(k => JUST_PRESSED.has(k))) {
            JUST_PRESSED.clear(); tryMove(d.dx, d.dy, d.f); moveAccum=0; return;
        }
    }
    JUST_PRESSED.clear();
    moveAccum += dt;
    if (moveAccum < 130) return;
    for (const d of dirs) {
        if (d.keys.some(k => KEYS.has(k))) {
            if (tryMove(d.dx, d.dy, d.f)) moveAccum = 0;
            return;
        }
    }
}

function tryMove(dx, dy, facing) {
    player.facing = facing;
    const nx = player.x + dx, ny = player.y + dy;
    if (nx < 0 || nx >= currentMap.w || ny < 0 || ny >= currentMap.h) return false;
    if (!NPCS_OK(nx, ny)) return false;
    const tile = currentMap.tiles[ny][nx];
    if (!WALKABLE.has(tile)) return false;
    player.x = nx; player.y = ny;
    // Building entry via door tiles
    if (tile === TILE.DOOR) {
        const key = `${nx},${ny}`;
        const entrances = BUILDING_ENTRANCES[currentMap.id];
        if (entrances?.[key]) { changeMap(entrances[key]); return true; }
    }
    // Stairs transitions
    if (tile === TILE.STAIRS)   handleStairsDown();
    if (tile === TILE.STAIRSUP) handleStairsUp();
    // Item pickup
    checkItemPickup();
    return true;
}

function NPCS_OK(nx, ny) {
    return !currentMap.npcs.some(n => n.x === nx && n.y === ny);
}

// ═══════════════════════════════════════════════════════
//  MAP TRANSITIONS
// ═══════════════════════════════════════════════════════
function handleStairsDown() {
    if (currentMap.id === 'village') {
        changeMap('dungeon_1');
    } else {
        showSign('The passage leads deeper into the earth.\n\n[ Floor 2 — Coming Soon ]');
    }
}

function handleStairsUp() {
    if (currentMap.returnMap) {
        changeMap(currentMap.returnMap, currentMap.returnX, currentMap.returnY);
    } else {
        changeMap('village', 22, 32);
    }
}

function changeMap(mapId, sx, sy) {
    currentMap = MAPS[mapId];
    player.x   = sx !== undefined ? sx : currentMap.playerStart.x;
    player.y   = sy !== undefined ? sy : currentMap.playerStart.y;
    player.facing = 'down';
    updateCamera();

    document.getElementById('hud-location').textContent = currentMap.name;

    // Quest: entering dungeon for first time
    if (mapId === 'dungeon_1' && !gs.flags.quest_into_dark_complete) {
        gs.flags.quest_into_dark_complete = true;
        setTimeout(() => showNotification('Quest Complete: Into the Dark', 'quest'), 800);
        updateQuestUI();
    }
}

// ═══════════════════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════════════════
function updateCamera() {
    const tx = player.x * TS + TS/2 - canvas.width/2;
    const ty = player.y * TS + TS/2 - canvas.height/2;
    cam.x = Math.max(0, Math.min(tx, currentMap.w * TS - canvas.width));
    cam.y = Math.max(0, Math.min(ty, currentMap.h * TS - canvas.height));
}

// ═══════════════════════════════════════════════════════
//  TILE RENDERING  (pixel-art style, procedural)
// ═══════════════════════════════════════════════════════
function drawTile(tile, px, py, tx, ty) {
    const dark = currentMap.dark;
    switch (tile) {
        case TILE.GRASS:    drawGrass(px,py,tx,ty);      break;
        case TILE.PATH:     drawPath(px,py,tx,ty);       break;
        case TILE.FLOOR:    drawFloor(px,py,dark);       break;
        case TILE.WALL:     drawWall(px,py,dark);        break;
        case TILE.TREE:     drawTree(px,py,tx,ty);       break;
        case TILE.WATER:    drawWater(px,py);            break;
        case TILE.DOOR:     drawDoor(px,py);             break;
        case TILE.STAIRS:   drawStairs(px,py);           break;
        case TILE.STAIRSUP: drawStairsUp(px,py);        break;
        case TILE.SIGN: {
            // Match background to surrounding tiles so the sign blends in
            if (dark) {
                drawFloor(px,py,true);
            } else {
                const nb = [
                    currentMap.tiles[ty]?.[tx-1], currentMap.tiles[ty]?.[tx+1],
                    currentMap.tiles[ty-1]?.[tx],  currentMap.tiles[ty+1]?.[tx],
                ];
                if      (nb.some(t=>t===TILE.FLOOR)) drawFloor(px,py,false);
                else if (nb.some(t=>t===TILE.PATH))  drawPath(px,py,tx,ty);
                else                                  drawGrass(px,py,tx,ty);
            }
            drawSignPost(px,py);
            break;
        }
        case TILE.TORCH:    drawTorch(px,py);            break;
        default: ctx.fillStyle='#000'; ctx.fillRect(px,py,TS,TS);
    }
}

function drawGrass(px, py, tx, ty) {
    const s = tx*7 + ty*13;
    const U = Math.max(1, Math.floor(TS/16));
    // 2-tone checkerboard base
    ctx.fillStyle = (tx+ty)%2 ? '#3c8c2c' : '#388828';
    ctx.fillRect(Math.floor(px), Math.floor(py), TS, TS);
    // 3 pixel highlight rects
    ctx.fillStyle = '#48a834';
    ctx.fillRect(Math.floor(px + ((s*3)%14)*U),    Math.floor(py + ((s*7)%14)*U),    U, U);
    ctx.fillRect(Math.floor(px + ((s*11)%14)*U),   Math.floor(py + ((s*13+4)%14)*U), U, U);
    ctx.fillRect(Math.floor(px + ((s*5+7)%14)*U),  Math.floor(py + ((s*9+3)%14)*U),  U, U);
    // 2 grass tufts (1×3U)
    ctx.fillStyle = '#56b840';
    ctx.fillRect(Math.floor(px + ((s*17)%13)*U),   Math.floor(py + ((s*19+2)%10)*U), U, U*3);
    ctx.fillRect(Math.floor(px + ((s*23+5)%13)*U), Math.floor(py + ((s*29+6)%10)*U), U, U*3);
    // Flower (1 in 13 tiles)
    if (s % 13 === 0) {
        const fx = Math.floor(px + TS*.3), fy = Math.floor(py + TS*.3);
        ctx.fillStyle = (s%2===0) ? '#e8d030' : '#e87878';
        ctx.fillRect(fx, fy, U*2, U*2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx+U, fy+U, U, U);
    }
}

function drawPath(px, py, tx, ty) {
    const s = tx*11 + ty*7;
    const gap = Math.max(1, Math.floor(TS/20));
    const half = Math.floor(TS/2);
    // Mortar base
    ctx.fillStyle = '#8a7030';
    ctx.fillRect(Math.floor(px), Math.floor(py), TS, TS);
    // 4 flat cobblestones in 2×2 grid
    const cols = ['#b49040','#c4a850','#a87c30','#bc9848'];
    const offsets = [[gap, gap],[half+gap, gap],[gap, half+gap],[half+gap, half+gap]];
    offsets.forEach(([ox, oy], i) => {
        const sx = Math.floor(px+ox), sy = Math.floor(py+oy);
        const sw = half - gap*2, sh = half - gap*2;
        ctx.fillStyle = cols[(s+i) % cols.length];
        ctx.fillRect(sx, sy, sw, sh);
        // top 1-px highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(sx, sy, sw, 1);
        // bottom 1-px shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(sx, sy+sh-1, sw, 1);
    });
}

function drawFloor(px, py, dark) {
    const darkCols  = ['#231830','#2e2040','#1a1028'];
    const lightCols = ['#8a5a28','#7a4e20','#9a6832'];
    const cols = dark ? darkCols : lightCols;
    const plankH = Math.floor(TS/3);
    // vertical joint offset alternates per tile column
    const jointX = Math.floor(px/TS) % 2 === 0 ? Math.floor(TS*.42) : Math.floor(TS*.60);
    for (let i = 0; i < 3; i++) {
        const py2 = Math.floor(py + i*plankH);
        const h   = (i === 2) ? TS - 2*plankH : plankH;
        ctx.fillStyle = cols[i];
        ctx.fillRect(Math.floor(px), py2, TS, h);
        // top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(Math.floor(px), py2, TS, 1);
        // vertical joint divider
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(Math.floor(px)+jointX, py2, 1, h);
    }
}

function drawWall(px, py, dark) {
    const mortar   = dark ? '#120e18' : '#4a3828';
    const brickCols = dark
        ? ['#1c1428','#221830','#181222']
        : ['#6a4830','#7a5838','#5c3c24'];
    // Mortar base
    ctx.fillStyle = mortar;
    ctx.fillRect(Math.floor(px), Math.floor(py), TS, TS);
    // Top accent strip
    ctx.fillStyle = dark ? '#1a1422' : '#5a4432';
    ctx.fillRect(Math.floor(px), Math.floor(py), TS, Math.max(1, Math.floor(TS*.06)));
    // 4 brick rows, each offset half a brick
    const bH = Math.floor(TS/4), bW = Math.floor(TS/2);
    for (let row = 0; row < 4; row++) {
        const by = Math.floor(py + row*bH);
        const offset = (row%2) * Math.floor(bW/2);
        for (let col = -1; col < 3; col++) {
            const bx = Math.floor(px + col*bW + offset);
            const x1 = Math.max(Math.floor(px)+1, bx+1);
            const x2 = Math.min(Math.floor(px)+TS-1, bx+bW-1);
            const y1 = by+1, y2 = by+bH-1;
            if (x2 <= x1 || y2 <= y1) continue;
            ctx.fillStyle = brickCols[(row+col+3) % brickCols.length];
            ctx.fillRect(x1, y1, x2-x1, y2-y1);
            // top 1-px highlight
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(x1, y1, x2-x1, 1);
            // bottom 1-px shadow
            ctx.fillStyle = 'rgba(0,0,0,0.20)';
            ctx.fillRect(x1, y2-1, x2-x1, 1);
        }
    }
}

function drawTree(px, py, tx, ty) {
    // 1. Grass base
    drawGrass(px, py, tx, ty);
    // 2. Ground shadow (flat ellipse)
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(Math.floor(px+TS*.52), Math.floor(py+TS*.68), TS*.34, TS*.12, 0, 0, Math.PI*2);
    ctx.fill();
    // 3. Trunk (two flat rects — dark base + lighter center strip)
    ctx.fillStyle = '#4a2808';
    ctx.fillRect(Math.floor(px+TS*.44), Math.floor(py+TS*.44), Math.floor(TS*.12), Math.floor(TS*.22));
    ctx.fillStyle = '#6e3e14';
    ctx.fillRect(Math.floor(px+TS*.46), Math.floor(py+TS*.44), Math.floor(TS*.05), Math.floor(TS*.22));
    // 4. Canopy — 3 flat arc passes (no gradient)
    const cx2 = Math.floor(px+TS*.5), cy2 = Math.floor(py+TS*.38), r = TS*.38;
    // Dark outer ring
    ctx.fillStyle = '#1a4a08';
    ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI*2); ctx.fill();
    // Main mid-green
    ctx.fillStyle = '#2a6814';
    ctx.beginPath(); ctx.arc(cx2, cy2 - Math.floor(r*.06), Math.floor(r*.84), 0, Math.PI*2); ctx.fill();
    // Lighter highlight offset upper-left
    ctx.fillStyle = '#3a8020';
    ctx.beginPath(); ctx.arc(cx2 - Math.floor(r*.18), cy2 - Math.floor(r*.20), Math.floor(r*.62), 0, Math.PI*2); ctx.fill();
    // Bright specular rect upper-left (flat rect instead of arc)
    ctx.fillStyle = '#50a030';
    ctx.fillRect(Math.floor(cx2 - r*.38), Math.floor(cy2 - r*.44), Math.floor(r*.28), Math.floor(r*.22));
}

function drawWater(px, py) {
    const t = timeMs/1000;
    // Dark base
    ctx.fillStyle = '#1a5a8c';
    ctx.fillRect(Math.floor(px), Math.floor(py), TS, TS);
    // Lighter mid band
    ctx.fillStyle = '#2472a8';
    ctx.fillRect(Math.floor(px), Math.floor(py+TS*.35), TS, Math.floor(TS*.30));
    // 3 animated wave bands (flat fillRect)
    for (let i = 0; i < 3; i++) {
        const wy = Math.floor(py + (TS/4)*(i+1) + Math.sin(t*1.4+px*.04+i*1.2)*2);
        ctx.fillStyle = `rgba(80,160,210,${0.25+0.12*Math.sin(t*1.8+i)})`;
        ctx.fillRect(Math.floor(px+TS*.05), wy, Math.floor(TS*.90), Math.max(1, Math.floor(TS*.06)));
    }
    // Glint top-left
    ctx.fillStyle = 'rgba(200,235,255,0.22)';
    ctx.fillRect(Math.floor(px+TS*.08), Math.floor(py+TS*.10), Math.floor(TS*.18), Math.floor(TS*.06));
}

function drawDoor(px, py) {
    const dark = currentMap.dark;
    drawWall(px, py, dark);
    // 3 flat wood planks
    const plankH = Math.floor(TS*.88/3);
    const plankC = ['#7a4018','#8a4c20','#6a3410'];
    for (let i = 0; i < 3; i++) {
        const plankY = Math.floor(py+TS*.07+i*plankH);
        ctx.fillStyle = plankC[i];
        ctx.fillRect(Math.floor(px+TS*.15), plankY, Math.floor(TS*.70), plankH-1);
        // top highlight per plank
        ctx.fillStyle = 'rgba(255,255,255,0.09)';
        ctx.fillRect(Math.floor(px+TS*.15), plankY, Math.floor(TS*.70), 1);
        // 3 grain lines per plank
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        for (let g = 0; g < 3; g++) {
            ctx.fillRect(Math.floor(px+TS*.19+g*(TS*.20)), plankY+2, 1, plankH-4);
        }
    }
    // Hinges: 2 dark gray rects
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(Math.floor(px+TS*.13), Math.floor(py+TS*.18), Math.floor(TS*.10), Math.floor(TS*.10));
    ctx.fillRect(Math.floor(px+TS*.13), Math.floor(py+TS*.62), Math.floor(TS*.10), Math.floor(TS*.10));
    // Knob: 2 stacked rects
    ctx.fillStyle = '#505050';
    ctx.fillRect(Math.floor(px+TS*.74), Math.floor(py+TS*.42), Math.floor(TS*.06), Math.floor(TS*.08));
    ctx.fillStyle = '#707070';
    ctx.fillRect(Math.floor(px+TS*.75), Math.floor(py+TS*.45), Math.floor(TS*.04), Math.floor(TS*.04));
}

function drawStairs(px, py) {
    ctx.fillStyle='#12101a'; ctx.fillRect(px,py,TS,TS);
    for (let i=0;i<5;i++) {
        const sy=py+i*(TS/5), inset=i*(TS/11);
        ctx.fillStyle=`hsl(240,8%,${28+i*9}%)`; ctx.fillRect(px+inset,sy,TS-inset*2,TS/5-1);
        ctx.fillStyle='rgba(255,255,255,0.10)'; ctx.fillRect(px+inset,sy,TS-inset*2,2);
        ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(px+inset,sy+TS/5-3,TS-inset*2,2);
    }
    const t=timeMs/1000, a=0.28+0.12*Math.sin(t*2.2);
    const gr2=ctx.createRadialGradient(px+TS/2,py+TS,0,px+TS/2,py+TS,TS*.85);
    gr2.addColorStop(0,`rgba(100,70,220,${a})`); gr2.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gr2; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle=`rgba(180,150,255,${0.65+0.18*Math.sin(t*3)})`;
    ctx.font=`bold ${TS*.3}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('↓',px+TS/2,py+TS*.46+Math.sin(t*2.5)*2);
}

function drawStairsUp(px, py) {
    if (currentMap?.returnMap) {
        // Interior exit — draw as a floor doormat with EXIT label
        drawFloor(px, py, false);
        ctx.fillStyle = '#6a3a10';
        ctx.fillRect(Math.floor(px+TS*.10), Math.floor(py+TS*.25), Math.floor(TS*.80), Math.floor(TS*.50));
        ctx.fillStyle = '#8a5020';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(Math.floor(px+TS*.15+i*TS*.18), Math.floor(py+TS*.30), Math.max(1,Math.floor(TS*.04)), Math.floor(TS*.40));
        }
        ctx.fillStyle = '#c8a050';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.floor(TS*.22)}px sans-serif`;
        ctx.fillText('EXIT', Math.floor(px+TS/2), Math.floor(py+TS*.52));
        return;
    }
    ctx.fillStyle='#0e1812'; ctx.fillRect(px,py,TS,TS);
    for (let i=4;i>=0;i--) {
        const sy=py+i*(TS/5), inset=(4-i)*(TS/11);
        ctx.fillStyle=`hsl(140,10%,${16+(5-i)*7}%)`; ctx.fillRect(px+inset,sy,TS-inset*2,TS/5-1);
        ctx.fillStyle='rgba(255,255,255,0.09)'; ctx.fillRect(px+inset,sy,TS-inset*2,2);
        ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(px+inset,sy+TS/5-3,TS-inset*2,2);
    }
    const t=timeMs/1000, a=0.28+0.12*Math.sin(t*2.2);
    const gr2=ctx.createRadialGradient(px+TS/2,py,0,px+TS/2,py,TS*.85);
    gr2.addColorStop(0,`rgba(50,190,70,${a})`); gr2.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gr2; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle=`rgba(100,230,130,${0.65+0.18*Math.sin(t*3)})`;
    ctx.font=`bold ${TS*.3}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('↑',px+TS/2,py+TS*.54+Math.sin(t*2.5)*2);
}

function drawSignPost(px, py) {
    const U = Math.max(1, Math.floor(TS/16));
    // ── Post (3-color flat strips) ──────────────────────
    const postX = Math.floor(px+TS*.44), postY = Math.floor(py+TS*.32);
    const postW = Math.floor(TS*.12), postH = Math.floor(TS*.68);
    ctx.fillStyle = '#4a2808'; ctx.fillRect(postX, postY, postW, postH);
    ctx.fillStyle = '#6e3e14'; ctx.fillRect(postX+Math.floor(postW*.25), postY, Math.floor(postW*.35), postH);
    ctx.fillStyle = '#3a1e08'; ctx.fillRect(postX+Math.floor(postW*.75), postY, Math.floor(postW*.25), postH);

    // ── Board ──────────────────────────────────────────
    const bx = Math.floor(px+TS*.08), by = Math.floor(py+TS*.04);
    const bw = Math.floor(TS*.84),    bh = Math.floor(TS*.30);
    // Dark border fill
    ctx.fillStyle = '#4a2808'; ctx.fillRect(bx, by, bw, bh);
    // Mid color
    ctx.fillStyle = '#8a5018'; ctx.fillRect(bx+1, by+1, bw-2, bh-2);
    // Lighter top half
    ctx.fillStyle = '#b07028'; ctx.fillRect(bx+1, by+1, bw-2, Math.floor(bh/2)-1);

    // Carved text lines
    const lm = bx + Math.floor(bw*.14), lw = Math.floor(bw*.72);
    ctx.fillStyle = 'rgba(50,20,5,0.70)';
    ctx.fillRect(lm, Math.floor(by+bh*.22), lw,                 2);
    ctx.fillRect(lm, Math.floor(by+bh*.46), lw,                 2);
    ctx.fillRect(lm, Math.floor(by+bh*.68), Math.floor(lw*.55), 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(lm, Math.floor(by+bh*.22)+2, lw,                 1);
    ctx.fillRect(lm, Math.floor(by+bh*.46)+2, lw,                 1);
    ctx.fillRect(lm, Math.floor(by+bh*.68)+2, Math.floor(lw*.55), 1);

    // 4 corner nail dots (flat rects)
    ctx.fillStyle = '#2a1a08';
    [[bx+Math.floor(bw*.12), by+Math.floor(bh*.18)],
     [bx+Math.floor(bw*.88), by+Math.floor(bh*.18)],
     [bx+Math.floor(bw*.12), by+Math.floor(bh*.80)],
     [bx+Math.floor(bw*.88), by+Math.floor(bh*.80)]].forEach(([nx,ny]) => {
        ctx.fillRect(Math.floor(nx)-U, Math.floor(ny)-U, U*2, U*2);
    });
}

function drawTorch(px, py) {
    drawWall(px,py,currentMap.dark);
    const t=timeMs/1000, fl=0.88+0.12*Math.sin(t*11+px*.28);
    ctx.fillStyle='#282828';
    ctx.fillRect(px+TS*.42,py+TS*.34,TS*.16,TS*.36);
    ctx.fillStyle='#363636'; ctx.fillRect(px+TS*.38,py+TS*.34,TS*.24,TS*.05);
    ctx.fillRect(px+TS*.38,py+TS*.66,TS*.24,TS*.05);
    const tcx=px+TS*.5, tcy=py+TS*.26;
    ctx.fillStyle=`rgba(220,55,0,${(0.7+0.3*Math.sin(t*8+px*.2))*.85})`;
    ctx.beginPath(); ctx.ellipse(tcx,tcy+TS*.05,TS*.14*fl,TS*.20,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,118,0,0.9)';
    ctx.beginPath(); ctx.ellipse(tcx,tcy,TS*.09*fl,TS*.16,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,238,100,0.95)';
    ctx.beginPath(); ctx.ellipse(tcx,tcy+TS*.03,TS*.05*fl,TS*.10,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,230,0.85)';
    ctx.beginPath(); ctx.arc(tcx,tcy+TS*.04,TS*.024*fl,0,Math.PI*2); ctx.fill();
}

// ═══════════════════════════════════════════════════════
//  ENTITY & ITEM RENDERING
// ═══════════════════════════════════════════════════════
const CLASS_COLORS = {Warrior:'#c8922a',Rogue:'#9a40d0',Wizard:'#3a8ad0',Cleric:'#d0c840'};
const CLASS_CLOAK  = {Warrior:'#6a2808',Rogue:'#2a0e3a',Wizard:'#101e3a',Cleric:'#5a4808'};

function drawCharacter(sx, sy, color, facing, name, isPlayer, isNear, ghost) {
    const cx=sx+TS/2, cy=sy+TS/2, r=TS*.28, t=timeMs/1000;
    const bob=isPlayer?0:Math.sin(t*1.6+cx*.02)*1.5;
    ctx.save(); ctx.translate(0,bob);
    if (ghost) { ctx.globalAlpha=0.55+0.15*Math.sin(t*2.2); ctx.shadowColor='#80b0ff'; ctx.shadowBlur=18; }
    // shadow
    ctx.fillStyle='rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(cx,cy+r+3,r*.7,r*.22,0,0,Math.PI*2); ctx.fill();
    // cloak (slightly larger circle behind body)
    const cloakC=ghost?'rgba(80,110,200,0.7)':isPlayer?(CLASS_CLOAK[gs.charClass]||'#4a2810'):'rgba(20,12,8,0.65)';
    ctx.shadowBlur=0;
    if (isPlayer) { ctx.shadowColor=color; ctx.shadowBlur=12; }
    ctx.fillStyle=cloakC; ctx.beginPath(); ctx.arc(cx,cy+r*.1,r*1.12,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    // body
    ctx.fillStyle=ghost?'rgba(140,180,255,0.82)':color;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.45)'; ctx.lineWidth=1.5; ctx.stroke();
    // armor sheen (player only)
    if (isPlayer&&!ghost) {
        ctx.fillStyle='rgba(255,255,255,0.13)'; ctx.beginPath(); ctx.arc(cx,cy-r*.1,r*.46,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.arc(cx-r*.18,cy-r*.22,r*.18,0,Math.PI*2); ctx.fill();
    }
    // head
    const hOff={up:[0,-.48],down:[0,.38],left:[-.42,0],right:[.42,0]};
    const [hox,hoy]=hOff[facing]||[0,.38];
    const hx=cx+hox*r, hy=cy+hoy*r;
    ctx.fillStyle=ghost?'#c0d0ff':'#e8cfa0';
    ctx.beginPath(); ctx.arc(hx,hy,r*.40,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=1; ctx.stroke();
    // eyes (directional)
    const eyePos={
        up:   [{x:-.15,y:-.18},{x:.15,y:-.18}],
        down: [{x:-.15,y:.10},{x:.15,y:.10}],
        left: [{x:-.18,y:-.08},{x:-.05,y:.10}],
        right:[{x:.18,y:-.08},{x:.05,y:.10}],
    };
    ctx.fillStyle=ghost?'#a0c8ff':'#281808';
    (eyePos[facing]||eyePos.down).forEach(e => {
        ctx.beginPath(); ctx.arc(hx+e.x*r,hy+e.y*r,r*.10,0,Math.PI*2); ctx.fill();
    });
    // class weapon (player only)
    if (isPlayer&&!ghost) drawWeapon(cx,cy,r,facing);
    ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.restore();
    // name tag (NPCs only)
    if (!isPlayer) {
        ctx.font='11px sans-serif'; ctx.textAlign='center';
        const nw=ctx.measureText(name).width;
        ctx.fillStyle='rgba(0,0,0,0.72)'; ctx.fillRect(cx-nw/2-4,sy-23,nw+8,15);
        ctx.fillStyle=ghost?'#b0d0ff':'#e8d0b0'; ctx.textBaseline='top'; ctx.fillText(name,cx,sy-22);
    }
    if (!isPlayer&&isNear) {
        ctx.fillStyle='#ffe040'; ctx.font=`bold ${Math.max(14,TS*.32)}px sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='bottom';
        ctx.fillText('!',cx,sy-2+Math.sin(timeMs/280)*3);
    }
}

function drawWeapon(cx, cy, r, facing) {
    const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
    const [dx,dy]=dirs[facing]||[0,1];
    const [px2,py2]=[-dy,dx]; // perpendicular
    const charClass=gs.charClass||'Warrior';
    const t=timeMs/1000;
    if (charClass==='Warrior') {
        // sword blade
        ctx.strokeStyle='#c8d0d8'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(cx+dx*r*1.1,cy+dy*r*1.1);
        ctx.lineTo(cx+dx*(r*1.1+TS*.27),cy+dy*(r*1.1+TS*.27)); ctx.stroke();
        ctx.strokeStyle='#e8eef4'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(cx+dx*r*1.2,cy+dy*r*1.2);
        ctx.lineTo(cx+dx*(r*1.2+TS*.23),cy+dy*(r*1.2+TS*.23)); ctx.stroke();
        // guard
        const gx=cx+dx*r*1.1, gy=cy+dy*r*1.1;
        ctx.strokeStyle='#c8922a'; ctx.lineWidth=3.5;
        ctx.beginPath(); ctx.moveTo(gx-px2*TS*.10,gy-py2*TS*.10);
        ctx.lineTo(gx+px2*TS*.10,gy+py2*TS*.10); ctx.stroke();
    } else if (charClass==='Rogue') {
        [-1,1].forEach(side => {
            const ax=cx+dx*r*1.1+px2*r*.55*side, ay=cy+dy*r*1.1+py2*r*.55*side;
            ctx.strokeStyle='#b8c0c8'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax+dx*TS*.16,ay+dy*TS*.16); ctx.stroke();
            ctx.strokeStyle='#9a40d0'; ctx.lineWidth=2.5;
            ctx.beginPath(); ctx.moveTo(ax-px2*TS*.04,ay-py2*TS*.04);
            ctx.lineTo(ax+px2*TS*.04,ay+py2*TS*.04); ctx.stroke();
        });
    } else if (charClass==='Wizard') {
        const sx2=cx+px2*r*.85, sy2=cy+py2*r*.85;
        ctx.strokeStyle='#7a4818'; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(sx2-dx*TS*.18,sy2-dy*TS*.18);
        ctx.lineTo(sx2+dx*TS*.18,sy2+dy*TS*.18); ctx.stroke();
        ctx.shadowColor='#6090ff'; ctx.shadowBlur=10;
        ctx.fillStyle=`rgba(80,130,255,${0.6+0.3*Math.sin(t*3)})`;
        ctx.beginPath(); ctx.arc(sx2+dx*TS*.18,sy2+dy*TS*.18,TS*.055,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
    } else if (charClass==='Cleric') {
        const hx2=cx+dx*r*1.55, hy2=cy+dy*r*1.55;
        ctx.shadowColor='#ffff80'; ctx.shadowBlur=8;
        ctx.strokeStyle='#e0d840'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(hx2-dx*TS*.10,hy2-dy*TS*.10);
        ctx.lineTo(hx2+dx*TS*.10,hy2+dy*TS*.10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hx2-px2*TS*.07,hy2-py2*TS*.07);
        ctx.lineTo(hx2+px2*TS*.07,hy2+py2*TS*.07); ctx.stroke();
        ctx.shadowBlur=0;
    }
}

function drawItem(item, sx, sy) {
    const cx=sx+TS/2, cy=sy+TS/2, t=timeMs/1000;
    const bob=Math.sin(t*2+cx*.08)*3, pulse=0.5+0.35*Math.sin(t*2.5);
    ctx.save(); ctx.translate(cx,cy+bob);
    ctx.shadowColor=item.color; ctx.shadowBlur=18+10*pulse;
    const s=TS*.20;
    ctx.fillStyle=item.color;
    ctx.beginPath();
    ctx.moveTo(0,-s*1.1); ctx.lineTo(s*.80,0); ctx.lineTo(0,s*.95); ctx.lineTo(-s*.80,0);
    ctx.closePath(); ctx.fill();
    // facet highlights
    ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.moveTo(0,-s*1.1); ctx.lineTo(s*.80,0); ctx.lineTo(0,-s*.15); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.moveTo(0,-s*1.1); ctx.lineTo(-s*.80,0); ctx.lineTo(0,-s*.15); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.10)';
    ctx.beginPath(); ctx.moveTo(s*.80,0); ctx.lineTo(0,s*.95); ctx.lineTo(0,-s*.15); ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0; ctx.restore();
    ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.shadowColor=item.color; ctx.shadowBlur=5;
    ctx.fillStyle='#f0e0c0'; ctx.fillText(item.name,cx,sy-3+bob);
    ctx.shadowBlur=0;
}

// ═══════════════════════════════════════════════════════
//  DYNAMIC LIGHTING
// ═══════════════════════════════════════════════════════
let lightCanvas = null, lightCtx2 = null;

function ensureLightCanvas() {
    if (!lightCanvas||lightCanvas.width!==canvas.width||lightCanvas.height!==canvas.height) {
        lightCanvas=document.createElement('canvas');
        lightCanvas.width=canvas.width; lightCanvas.height=canvas.height;
        lightCtx2=lightCanvas.getContext('2d');
    }
}

function renderLighting() {
    if (!currentMap.dark) return;
    ensureLightCanvas();
    const lc=lightCtx2, t=timeMs/1000, W=lightCanvas.width, H=lightCanvas.height;
    lc.clearRect(0,0,W,H);
    lc.fillStyle='rgba(2,1,4,0.95)'; lc.fillRect(0,0,W,H);
    lc.globalCompositeOperation='destination-out';

    function punch(lx,ly,rad,alpha,fp,fa) {
        const fl=1+fa*Math.sin(fp), r=rad*fl;
        const g=lc.createRadialGradient(lx,ly,0,lx,ly,r);
        g.addColorStop(0,`rgba(255,255,255,${alpha})`);
        g.addColorStop(0.45,`rgba(255,255,255,${alpha*.55})`);
        g.addColorStop(0.8,`rgba(255,255,255,${alpha*.18})`);
        g.addColorStop(1,'rgba(0,0,0,0)');
        lc.fillStyle=g; lc.beginPath(); lc.arc(lx,ly,r,0,Math.PI*2); lc.fill();
    }

    // Player carries a dim ambient glow
    punch(player.x*TS-cam.x+TS/2, player.y*TS-cam.y+TS/2, TS*2.3, 0.52, t*5, 0.04);

    // Scan visible tiles for torches
    const stx=Math.max(0,Math.floor(cam.x/TS)-2), sty=Math.max(0,Math.floor(cam.y/TS)-2);
    const etx=Math.min(currentMap.w-1,Math.ceil((cam.x+W)/TS)+2);
    const ety=Math.min(currentMap.h-1,Math.ceil((cam.y+H)/TS)+2);
    for (let ty=sty;ty<=ety;ty++) for (let tx=stx;tx<=etx;tx++) {
        if (currentMap.tiles[ty][tx]===TILE.TORCH) {
            const lx=tx*TS-cam.x+TS/2, ly=ty*TS-cam.y+TS/2;
            punch(lx,ly, TS*5, 0.98, t*10.5+tx*2.7+ty*1.3, 0.10);
        }
    }
    lc.globalCompositeOperation='source-over';

    // Draw darkness layer onto scene
    ctx.drawImage(lightCanvas,0,0);

    // Warm color bleed at each torch (screen blend adds orange tint to lit areas)
    ctx.save(); ctx.globalCompositeOperation='screen';
    for (let ty=sty;ty<=ety;ty++) for (let tx=stx;tx<=etx;tx++) {
        if (currentMap.tiles[ty][tx]===TILE.TORCH) {
            const lx=tx*TS-cam.x+TS/2, ly=ty*TS-cam.y+TS/2;
            const fl=0.11+0.04*Math.sin(t*10.5+tx*2.7);
            const g=ctx.createRadialGradient(lx,ly,0,lx,ly,TS*4);
            g.addColorStop(0,`rgba(255,130,20,${fl*1.9})`);
            g.addColorStop(0.45,`rgba(200,65,5,${fl})`);
            g.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=g; ctx.fillRect(lx-TS*4.5,ly-TS*4.5,TS*9,TS*9);
        }
    }
    ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (currentMap.dark) { ctx.fillStyle='#080408'; ctx.fillRect(0,0,canvas.width,canvas.height); }

    const stx=Math.max(0,Math.floor(cam.x/TS)), sty=Math.max(0,Math.floor(cam.y/TS));
    const etx=Math.min(currentMap.w-1,Math.ceil((cam.x+canvas.width)/TS));
    const ety=Math.min(currentMap.h-1,Math.ceil((cam.y+canvas.height)/TS));
    for (let ty=sty;ty<=ety;ty++)
        for (let tx=stx;tx<=etx;tx++)
            drawTile(currentMap.tiles[ty][tx],tx*TS-cam.x,ty*TS-cam.y,tx,ty);

    for (const item of currentMap.items) {
        const sx=item.x*TS-cam.x, sy=item.y*TS-cam.y;
        if (sx>-TS&&sx<canvas.width+TS&&sy>-TS&&sy<canvas.height+TS) drawItem(item,sx,sy);
    }
    for (const npc of currentMap.npcs) {
        const sx=npc.x*TS-cam.x, sy=npc.y*TS-cam.y;
        if (sx>-TS*2&&sx<canvas.width+TS&&sy>-TS*2&&sy<canvas.height+TS)
            drawCharacter(sx,sy,npc.color,'down',npc.name,false,isAdjacent(npc.x,npc.y),npc.ghost);
    }
    drawCharacter(player.x*TS-cam.x, player.y*TS-cam.y,
        CLASS_COLORS[gs.charClass]||CLASS_COLORS.Warrior,
        player.facing,'',true,false,false);

    renderLighting(); // dynamic darkness + torch light + warm color bleed
    updateHintBar();
}

function isAdjacent(nx,ny){return Math.abs(nx-player.x)+Math.abs(ny-player.y)===1;}

function updateHintBar() {
    const adj=[{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    let hint='';
    for (const d of adj) {
        const tx=player.x+d.dx, ty=player.y+d.dy;
        if (tx<0||tx>=currentMap.w||ty<0||ty>=currentMap.h) continue;
        const tile=currentMap.tiles[ty][tx];
        if (tile===TILE.SIGN)    { hint='Press E to read'; break; }
        if (tile===TILE.DOOR) {
            const entrances = BUILDING_ENTRANCES[currentMap.id];
            if (entrances?.[`${tx},${ty}`]) { hint='Walk into door to enter'; break; }
        }
        if (tile===TILE.STAIRS)  { hint='Press E to descend'; break; }
        if (tile===TILE.STAIRSUP){ hint=currentMap.returnMap?'Press E to exit':'Press E to ascend'; break; }
        const npc=currentMap.npcs.find(n=>n.x===tx&&n.y===ty);
        if (npc) { hint=`Press E to talk to ${npc.name}`; break; }
    }
    document.getElementById('hint-bar').textContent=hint;
}

// ═══════════════════════════════════════════════════════
//  INTERACTION
// ═══════════════════════════════════════════════════════
function handleInteract() {
    if(ui.questLog){closeQuestLog();return;}
    if(ui.dialogue){closeDialogue();return;}
    if(ui.sign)    {closeSign();return;}

    const adj=[{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    for(const d of adj){
        const tx=player.x+d.dx,ty=player.y+d.dy;
        if(tx<0||tx>=currentMap.w||ty<0||ty>=currentMap.h)continue;
        const tile=currentMap.tiles[ty][tx];

        if(tile===TILE.SIGN){
            const s=currentMap.signs.find(s=>s.x===tx&&s.y===ty);
            if(s) showSign(s.text, s.questComplete);
            return;
        }
        if(tile===TILE.STAIRS){handleStairsDown();return;}
        if(tile===TILE.STAIRSUP){handleStairsUp();return;}

        const npc=currentMap.npcs.find(n=>n.x===tx&&n.y===ty);
        if(npc){startDialogue(npc);return;}
    }
}

// ─ Sign ────────────────────────────────────────────────
function showSign(text, questComplete) {
    if(questComplete&&gs.flags[questComplete.given]&&!gs.flags[questComplete.complete]){
        gs.flags[questComplete.complete]=true;
        const q=QUESTS.find(q=>q.flag_complete===questComplete.complete);
        if(q) setTimeout(()=>showNotification(`Quest Complete: ${q.title}`,'quest'),800);
        updateQuestUI();
    }
    ui.sign=true;
    document.getElementById('sign-text').textContent=text;
    document.getElementById('sign-box').classList.remove('hidden');
}
function closeSign(){ui.sign=false;document.getElementById('sign-box').classList.add('hidden');}

// ─ Items ───────────────────────────────────────────────
function checkItemPickup() {
    const items=currentMap.items;
    for(let i=items.length-1;i>=0;i--){
        if(items[i].x===player.x&&items[i].y===player.y){
            const item=items.splice(i,1)[0];
            gs.inventory.push(item);
            showNotification(`Found: ${item.name}`,'item');
            if(item.questComplete&&!gs.flags[item.questComplete]){
                gs.flags[item.questComplete]=true;
                const q=QUESTS.find(q=>q.flag_complete===item.questComplete);
                if(q) setTimeout(()=>showNotification(`Quest Complete: ${q.title}`,'quest'),600);
                updateQuestUI();
            }
            updateInventoryUI();
        }
    }
}

// ─ Dialogue ────────────────────────────────────────────
async function startDialogue(npc) {
    ui.loading=true;
    const box=document.getElementById('dialogue-box');
    document.getElementById('dlg-name').textContent=npc.name;
    document.getElementById('dlg-portrait').textContent=npc.portrait;
    document.getElementById('dlg-text').textContent='…';
    document.getElementById('dlg-options').innerHTML='';
    box.classList.remove('hidden');
    const data=await callInteract(npc,'',npc.history);
    npc.history=data.history;
    ui.dialogue=npc;ui.loading=false;
    showDialogueData(data,npc);
}

async function chooseOption(npc,optText) {
    if(ui.loading)return;
    ui.loading=true;
    document.getElementById('dlg-text').textContent='…';
    document.getElementById('dlg-options').innerHTML='';
    const data=await callInteract(npc,optText,npc.history);
    npc.history=data.history;ui.loading=false;
    if(data.ended){closeDialogue();return;}
    showDialogueData(data,npc);
}

async function callInteract(npc,choice,history) {
    const res=await fetch('/interact',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({npc:{name:npc.name,role:npc.role},choice,history,flags:gs.flags})});
    return res.json();
}

function showDialogueData(data,npc) {
    document.getElementById('dlg-text').textContent=data.dialogue;
    const op=document.getElementById('dlg-options');op.innerHTML='';
    for(const opt of data.options){
        const btn=document.createElement('button');
        btn.className='dlg-opt';btn.textContent=opt;
        btn.onclick=()=>chooseOption(npc,opt);op.appendChild(btn);
    }
}

function closeDialogue() {
    if(ui.dialogue){
        const npc=ui.dialogue;
        const flag=QUEST_GIVER_FLAGS[npc.id];
        if(flag&&!gs.flags[flag]){
            gs.flags[flag]=true;
            const q=QUESTS.find(q=>q.flag_given===flag);
            if(q) showNotification(`New Quest: ${q.title}`,'quest');
            updateQuestUI();
        }
    }
    ui.dialogue=null;ui.loading=false;
    document.getElementById('dialogue-box').classList.add('hidden');
}

// ─ Quest Log ───────────────────────────────────────────
function toggleQuestLog(){ui.questLog?closeQuestLog():openQuestLog();}

function openQuestLog() {
    if(ui.dialogue||ui.sign)return;
    ui.questLog=true;
    updateQuestUI();
    document.getElementById('quest-log').classList.remove('hidden');
}
function closeQuestLog(){ui.questLog=false;document.getElementById('quest-log').classList.add('hidden');}

function updateQuestUI() {
    const list=document.getElementById('quest-list');
    list.innerHTML='';
    let active=0;
    for(const q of QUESTS){
        const given=gs.flags[q.flag_given],done=gs.flags[q.flag_complete];
        if(!given)continue;
        active+=done?0:1;
        const el=document.createElement('div');
        el.className='quest-entry'+(done?' quest-done':'');
        el.innerHTML=`<div class="quest-title">${done?'✓ ':'▸ '}${q.title}</div>
                      <div class="quest-giver">From: ${q.giverName}</div>
                      <div class="quest-obj">${done?'<em>Completed.</em>':q.objective}</div>`;
        list.appendChild(el);
    }
    if(!list.children.length){
        list.innerHTML='<p class="quest-empty">No quests yet. Talk to the villagers.</p>';
    }
    const btn=document.getElementById('quest-btn');
    if(btn) btn.textContent=`📜 Quests${active>0?` (${active})`:''}`;
}

function updateInventoryUI() {
    const bar=document.getElementById('inv-bar');
    if(!bar)return;
    bar.innerHTML='';
    for(const item of gs.inventory){
        const el=document.createElement('div');
        el.className='inv-item';el.title=item.desc||item.name;
        el.textContent=item.icon||'◆';
        bar.appendChild(el);
    }
}

// ─ Notifications ───────────────────────────────────────
function showNotification(msg,type='info') {
    const el=document.createElement('div');
    el.className=`notif notif-${type}`;el.textContent=msg;
    document.getElementById('notifications').appendChild(el);
    requestAnimationFrame(()=>el.classList.add('notif-show'));
    setTimeout(()=>el.classList.remove('notif-show'),2800);
    setTimeout(()=>el.remove(),3300);
}

// ═══════════════════════════════════════════════════════
//  AMBIENT AUDIO
// ═══════════════════════════════════════════════════════
let audioCtx=null,masterGain=null,melodyTimer=null,allNodes=[],musicOn=true;
const SCALE_VILLAGE=[110,123.47,130.81,146.83,164.81,174.61,196,220,246.94,261.63,293.66,329.63,349.23,392,440];
const SCALE_DUNGEON=[110,116.54,130.81,138.59,164.81,174.61,185,220,233.08,261.63,277.18,329.63,349.23,370,440];

function startMusic() {
    if(audioCtx)return;
    audioCtx=new(window.AudioContext||window['webkitAudioContext'])();
    masterGain=audioCtx.createGain();masterGain.gain.value=0.25;
    const delay=audioCtx.createDelay(3);delay.delayTime.value=0.45;
    const fb=audioCtx.createGain();fb.gain.value=0.42;
    const lpf=audioCtx.createBiquadFilter();lpf.type='lowpass';lpf.frequency.value=1800;
    delay.connect(lpf);lpf.connect(fb);fb.connect(delay);
    delay.connect(masterGain);masterGain.connect(audioCtx.destination);
    allNodes.push(delay,fb,lpf);
    startWind(masterGain);startDrone(55,masterGain);
    scheduleMelody(delay,masterGain);
}

function startDrone(f,out){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=0.055;o.connect(g);g.connect(out);o.start();allNodes.push(o,g);}

function startWind(out){const len=audioCtx.sampleRate*3,buf=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=audioCtx.createBufferSource();src.buffer=buf;src.loop=true;const flt=audioCtx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=400;flt.Q.value=0.5;const wg=audioCtx.createGain();wg.gain.value=0.04;const lfo=audioCtx.createOscillator(),lfog=audioCtx.createGain();lfo.frequency.value=0.06;lfog.gain.value=0.03;lfo.connect(lfog);lfog.connect(wg.gain);lfo.start();src.connect(flt);flt.connect(wg);wg.connect(out);src.start();allNodes.push(src,flt,wg,lfo,lfog);}

function playNote(freq,wet,dry){const now=audioCtx.currentTime,o=audioCtx.createOscillator(),e=audioCtx.createGain();o.type='sine';o.frequency.value=freq;e.gain.setValueAtTime(0,now);e.gain.linearRampToValueAtTime(0.18,now+0.05);e.gain.exponentialRampToValueAtTime(0.001,now+4.5);o.connect(e);e.connect(wet);e.connect(dry);o.start(now);o.stop(now+4.6);}

function scheduleMelody(wet,dry){
    const scale=currentMap.dark?SCALE_DUNGEON:SCALE_VILLAGE;
    [scale[0],scale[2],scale[4]].forEach(f=>playNote(f,wet,dry));
    melodyTimer=setInterval(()=>{if(!audioCtx||audioCtx.state==='closed')return;
        const sc=currentMap.dark?SCALE_DUNGEON:SCALE_VILLAGE;
        const n=Math.random()<0.25?2:1;
        for(let i=0;i<n;i++)playNote(sc[Math.floor(Math.random()*sc.length)],wet,dry);
    },2800+Math.random()*2000);
}

function stopMusic(){clearInterval(melodyTimer);melodyTimer=null;allNodes.forEach(n=>{try{n.stop?n.stop():n.disconnect();}catch(e){}});allNodes=[];if(audioCtx){audioCtx.close();audioCtx=null;masterGain=null;}}

// ═══════════════════════════════════════════════════════
//  PAUSE MENU
// ═══════════════════════════════════════════════════════
const _pauseEl  = () => document.getElementById('pause-menu');
const _pauseVol = () => document.getElementById('pause-vol');

function openPause() {
    if (document.getElementById('game-screen').classList.contains('hidden')) return;
    ui.paused = true;
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
    // Sync slider to current master volume
    const vol = masterGain ? Math.round(masterGain.gain.value / 0.25 * 50) : 50;
    const slider = _pauseVol();
    slider.value = Math.min(100, Math.max(0, vol));
    _updateSliderFill(slider);
    _pauseEl().classList.remove('hidden');
}

function closePause() {
    ui.paused = false;
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    _pauseEl().classList.add('hidden');
}

function _updateSliderFill(slider) {
    slider.style.setProperty('--pct', slider.value + '%');
}

// Wire up slider
document.getElementById('pause-vol').addEventListener('input', function() {
    _updateSliderFill(this);
    if (masterGain) masterGain.gain.value = (this.value / 100) * 0.25;
});

// Resume button
document.getElementById('pause-resume').addEventListener('click', closePause);

// Main Menu button (reuses the restart flow)
document.getElementById('pause-mainmenu').addEventListener('click', () => {
    closePause();
    document.getElementById('restart-btn').click();
});

// ═══════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════
let lastTs=0;
function loop(ts){
    const dt=Math.min(ts-lastTs,100);lastTs=ts;timeMs=ts;
    updateMovement(dt);updateCamera();render();
    requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════
function startGame(name,charClass) {
    gs.charName=name;gs.charClass=charClass;gs.flags={};gs.inventory=[];
    currentMap=MAPS.village;
    [...VILLAGE_NPCS,...DUNGEON_NPCS,...ELDER_NPCS,...BLACKSMITH_NPCS,...VEYLA_NPCS].forEach(n=>n.history=[]);
    MAPS.dungeon_1.items=[...DUNGEON_ITEMS.map(i=>({...i}))];
    player.x=currentMap.playerStart.x;player.y=currentMap.playerStart.y;player.facing='down';
    ui.dialogue=null;ui.sign=null;ui.questLog=false;ui.loading=false;ui.paused=false;
    _pauseEl().classList.add('hidden');
    resizeCanvas();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('hud-name').textContent=name;
    document.getElementById('hud-class').textContent=charClass;
    document.getElementById('hud-location').textContent=currentMap.name;
    updateQuestUI();updateInventoryUI();
    startMusic();
    requestAnimationFrame(loop);
    // Fade overlay out now that the game is ready
    if (typeof fadeOverlay === 'function') fadeOverlay('out');
}

document.getElementById('begin-btn').addEventListener('click',()=>{
    const name=document.getElementById('char-name').value.trim();
    const charClass=document.querySelector('.class-card.selected')?.dataset.class;
    if (!name || !charClass) return; // button should already be disabled; guard anyway
    setTimeout(()=>startGame(name,charClass), 340);
});

document.getElementById('restart-btn').addEventListener('click',()=>{
    stopMusic();closeDialogue();closeSign();closeQuestLog();
    // Fade to black, swap back to menu, then fade in
    if (typeof fadeOverlay === 'function') {
        fadeOverlay('in', ()=>{
            document.getElementById('game-screen').classList.add('hidden');
            const ss=document.getElementById('start-screen');ss.classList.remove('hidden');
            document.querySelectorAll('.menu-panel').forEach(p=>{p.classList.add('hidden');p.style.opacity='0';p.style.transform='';});
            const main=document.getElementById('menu-main');
            main.classList.remove('hidden');
            main.style.transform='translateY(0)';
            requestAnimationFrame(()=>{main.style.opacity='1';});
            menuLoop&&menuLoop();
            // Reset character creation form
            document.getElementById('char-name').value='';
            document.querySelectorAll('.class-card').forEach(c=>c.classList.remove('selected'));
            document.getElementById('begin-btn').disabled=true;
            document.getElementById('create-error').classList.add('hidden');
            fadeOverlay('out');
        });
    } else {
        document.getElementById('game-screen').classList.add('hidden');
        const ss=document.getElementById('start-screen');ss.classList.remove('hidden');
        document.querySelectorAll('.menu-panel').forEach(p=>{p.classList.add('hidden');p.style.opacity='0';});
        const main=document.getElementById('menu-main');main.classList.remove('hidden');
        requestAnimationFrame(()=>{main.style.opacity='1';});
        menuLoop&&menuLoop();
    }
});

document.getElementById('music-toggle').addEventListener('click',()=>{
    musicOn=!musicOn;const btn=document.getElementById('music-toggle');
    musicOn?(startMusic(),btn.classList.add('active')):(stopMusic(),btn.classList.remove('active'));
});

document.getElementById('quest-btn').addEventListener('click',toggleQuestLog);
document.getElementById('close-quest-log').addEventListener('click',closeQuestLog);
