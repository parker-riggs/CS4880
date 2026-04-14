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
    TILE.DOOR, TILE.STAIRS, TILE.STAIRSUP,
]);

// ═══════════════════════════════════════════════════════
//  ENEMY DEFINITIONS
// ═══════════════════════════════════════════════════════
const ENEMY_DEFS = {
    shade: {
        name:'Shade', hp:22, atk:8, xp:15,
        speed:1100, aggroRange:7, aggroSpeed:420,
        color:'#4010a0', eyeColor:'#ff1020',
        desc:'A wraith of living shadow.',
    },
    lurker: {
        name:'Cave Lurker', hp:55, atk:18, xp:35,
        speed:1900, aggroRange:3, aggroSpeed:1000,
        color:'#5a4030', eyeColor:'#ff8010',
        desc:'A massive stone-skinned predator.',
    },
};
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

// ═══════════════════════════════════════════════════════
//  PROCEDURAL MINE GENERATOR
//  Generates a large connected cave network using Prim's
//  MST room connection + L-shaped mine shaft corridors.
// ═══════════════════════════════════════════════════════
function buildMineTiles(rng) {
    const MW = 100, MH = 65;
    const tiles = Array.from({length:MH}, () => new Array(MW).fill(W));
    const rooms = [], signs = [];

    // ── 1. Room placement ─────────────────────────────────
    const TARGET = 24, TRIES = 600, PAD = 2;
    for (let t = 0; t < TRIES && rooms.length < TARGET; t++) {
        const rw = 5  + Math.floor(rng() * 11);   // 5–15 wide
        const rh = 4  + Math.floor(rng() * 7);    // 4–10 tall
        const rx = 2  + Math.floor(rng() * (MW - rw - 4));
        const ry = 2  + Math.floor(rng() * (MH - rh - 4));
        const bad = rooms.some(r =>
            rx < r.x+r.w+PAD && rx+rw+PAD > r.x &&
            ry < r.y+r.h+PAD && ry+rh+PAD > r.y);
        if (!bad) rooms.push({x:rx,y:ry,w:rw,h:rh,
            cx:rx+Math.floor(rw/2), cy:ry+Math.floor(rh/2)});
    }

    // Fill rooms with FLOOR
    for (const r of rooms)
        for (let y=r.y; y<r.y+r.h; y++)
            for (let x=r.x; x<r.x+r.w; x++) tiles[y][x]=F;

    // ── 2. Corridor carving (Prim MST + extra loops) ──────
    const dig = (x,y) => { if(x>=1&&x<MW-1&&y>=1&&y<MH-1) tiles[y][x]=F; };
    const carve = (x1,y1,x2,y2,wide=false) => {
        const hf = rng()>.5;
        const row = (y,xa,xb) => { for(let x=Math.min(xa,xb);x<=Math.max(xa,xb);x++){dig(x,y);if(wide)dig(x,y+1);} };
        const col = (x,ya,yb) => { for(let y=Math.min(ya,yb);y<=Math.max(ya,yb);y++){dig(x,y);if(wide)dig(x+1,y);} };
        if (hf) { row(y1,x1,x2); col(x2,y1,y2); }
        else    { col(x1,y1,y2); row(y2,x1,x2); }
    };

    // Prim's algorithm — connect each room to nearest in-tree room
    const inTree = new Set([0]);
    while (inTree.size < rooms.length) {
        let bDist=Infinity, bI=-1, bJ=-1;
        for (const i of inTree) {
            for (let j=0;j<rooms.length;j++) {
                if (inTree.has(j)) continue;
                const dx=rooms[i].cx-rooms[j].cx, dy=rooms[i].cy-rooms[j].cy;
                const d=dx*dx+dy*dy;
                if (d<bDist){bDist=d;bI=i;bJ=j;}
            }
        }
        if (bJ===-1) break;
        inTree.add(bJ);
        carve(rooms[bI].cx,rooms[bI].cy,rooms[bJ].cx,rooms[bJ].cy, rng()<.22);
    }
    // Extra loops for interest (~25% extra connections)
    for (let i=0;i<Math.floor(rooms.length*.25);i++) {
        const a=Math.floor(rng()*rooms.length), b=Math.floor(rng()*rooms.length);
        if (a!==b) carve(rooms[a].cx,rooms[a].cy,rooms[b].cx,rooms[b].cy);
    }

    // ── 3. Torches ────────────────────────────────────────
    for (const r of rooms) {
        const count = r.w>=9 ? 2 : 1;
        for (let i=0;i<count;i++) {
            const tx = r.x+1+Math.floor(i*(r.w-3)/Math.max(count-1,1));
            tiles[r.y][Math.min(tx,r.x+r.w-2)] = TC;
        }
    }

    // ── 4. Underground water pools ────────────────────────
    let wc=0;
    for (let ri=3; ri<rooms.length && wc<6; ri++) {
        const r=rooms[ri];
        if (r.w<7||r.h<5||rng()>.35) continue;
        const wx=r.x+1+Math.floor(rng()*(r.w-4));
        const wy=r.y+1+Math.floor(rng()*(r.h-3));
        const ww=1+Math.floor(rng()*3), wh=1+Math.floor(rng()*2);
        for (let py=wy;py<=Math.min(wy+wh,r.y+r.h-2);py++)
            for (let px=wx;px<=Math.min(wx+ww,r.x+r.w-2);px++)
                if (tiles[py][px]===F) tiles[py][px]=WA;
        wc++;
    }

    // ── 5. Lore signs ─────────────────────────────────────
    const LORE = [
        'Day 12. The sounds have returned.\nHenrick says to ignore them.\nI am trying.',
        'DANGER — SHAFT UNSTABLE\nProceed at your own risk.\n\nManagement accepts\nno liability.',
        'The ore ran dry at depth four.\nThe miners kept digging.\nThey found something else.',
        'If you find this note:\nWE MADE IT TO THE EAST PASSAGE.\nWe did not make it out.',
        '— H.D. WAS HERE —\nDay 47. Still breathing.\nSomething in the dark breathes back.',
        'DEPTH MARKER: LOWER LEVEL\nTurn-back rate: 100%\nSurvival rate: pending.',
        'Do not answer the voice.\nIt learns your name.\nThen it uses it.',
        'Property of the Eldoria Mining Guild\nFounded Year of the Third Moon\n[THE REST IS SCRATCHED OUT]',
    ];
    let li=0;
    for (let ri=1; ri<rooms.length&&li<LORE.length; ri++) {
        if (rng()>.45) continue;
        const r=rooms[ri];
        const sx=r.x+1, sy=r.y;
        if (tiles[sy][sx]===TC||tiles[sy][sx]===SG) continue;
        tiles[sy][sx]=SG;
        signs.push({x:sx,y:sy,text:LORE[li++]});
    }

    // Ancient tablet (Veyla's quest) — deep room, not the exit room
    const deepIdx = Math.min(
        Math.floor(rooms.length*.65)+Math.floor(rng()*Math.floor(rooms.length*.30)),
        rooms.length-1);
    const deepR = rooms[deepIdx];
    const tabX=deepR.x+Math.floor(deepR.w/2), tabY=deepR.y;
    if (tiles[tabY][tabX]!==SG&&tiles[tabY][tabX]!==TC) {
        tiles[tabY][tabX]=SG;
        signs.push({x:tabX,y:tabY,
            text:'— ANCIENT TABLET —\n\n[Written in Old Script, barely legible...]\n\n"Here rests the Hollow King, sealed by the Three Wardens\nin the Age Before Memory. Should the seal fracture,\ndarkness will pour forth until the realm above\nknows only endless night."\n\n[The stone is cracked. Something has been pressing from within.]',
            questComplete:{given:'quest_sealed_truth_given',complete:'quest_sealed_truth_complete'}
        });
    }

    // ── 6. Player start + exit stairsup ───────────────────
    const startR = rooms[0];
    // StairsUp at center of entry room
    tiles[startR.cy][startR.cx] = SU;
    // Player spawns one step south
    const ps = { x:startR.cx, y:Math.min(startR.cy+1, startR.y+startR.h-2) };
    if (tiles[ps.y][ps.x]!==F) tiles[ps.y][ps.x]=F;

    // ── 7. Item + NPC positions ───────────────────────────
    // Henrick's ring — farthest room from start
    let farR=rooms[1], farD=0;
    for (let ri=1;ri<rooms.length;ri++) {
        const dx=rooms[ri].cx-startR.cx, dy=rooms[ri].cy-startR.cy;
        const d=dx*dx+dy*dy;
        if (d>farD){farD=d;farR=rooms[ri];}
    }
    const itemPos = { x:farR.cx, y:farR.cy };

    // Mira's ghost — mid-map room
    const ghostR = rooms[Math.floor(rooms.length*.4)];
    const ghostPos = { x:ghostR.cx, y:ghostR.cy };

    // ── 8. Enemy spawns ──────────────────────────────────
    // Skip room 0 (entry), ghost room, and item room to avoid overcrowding
    const enemySpawns = [];
    const skipRooms = new Set([0, Math.floor(rooms.length*.4), deepIdx]);
    for (let ri = 1; ri < rooms.length; ri++) {
        if (skipRooms.has(ri)) continue;
        const r = rooms[ri];
        // Lurker every 5 rooms (slow, tanky), Shade every other room (fast, weak)
        if (ri % 5 === 2) {
            enemySpawns.push({ type:'lurker', x:r.cx, y:r.cy });
        } else if (ri % 2 === 1) {
            enemySpawns.push({ type:'shade', x:r.cx, y:r.cy });
        }
    }

    return { tiles, w:MW, h:MH, playerStart:ps, signs, itemPos, ghostPos, enemySpawns };
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
const GUIDE_NPCS = [
    { id:'guide', name:'Rowan', x:21, y:15, portrait:'🧑', color:'#80c870', history:[],
      role:'A friendly young villager who greets newcomers and introduces them to Eldoria.' },
];

const VILLAGE_NPCS = [];  // Major NPCs are inside buildings; Rowan stays in the village square

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

// Dungeon signs are generated procedurally by buildMineTiles()

const DUNGEON_ITEMS = [
    { id:'henrick_ring', name:"Henrick's Ring", x:25, y:13, color:'#e8c050', icon:'💍',
      desc:"A worn iron ring with 'H.D.' engraved on the inside. This belonged to Daran's brother.",
      questRequired:'quest_brothers_fate_given',
      questComplete:'quest_brothers_fate_complete' },
];

// ═══════════════════════════════════════════════════════
//  MAP DEFINITIONS
// ═══════════════════════════════════════════════════════
const MAPS = {
    village: {
        id:'village', w:48, h:36,
        tiles: buildVillageTiles(),
        npcs:  [...VILLAGE_NPCS, ...GUIDE_NPCS],
        signs: VILLAGE_SIGNS,
        items: [],
        playerStart:{x:21,y:16},
        name:'Eldoria Village',
        dark:false,
    },
    dungeon_1: {
        id:'dungeon_1', w:100, h:65,
        tiles: [],          // populated by rebuildDungeon()
        npcs:  DUNGEON_NPCS,
        signs: [],          // populated by rebuildDungeon()
        items: [],          // populated by rebuildDungeon()
        enemies: [],        // populated by rebuildDungeon()
        playerStart:{x:5,y:5}, // populated by rebuildDungeon()
        name:'Cursed Mines',
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
        returnMap:'village', returnX:30, returnY:28,
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
        returnMap:'village', returnX:41, returnY:18,
    },
};

// ── Rebuild dungeon with fresh procedural generation ────
function rebuildDungeon() {
    const seed = Math.floor(Math.random() * 0xFFFFFF);
    const data = buildMineTiles(_rng(seed));
    const d = MAPS.dungeon_1;
    d.tiles = data.tiles;
    d.w = data.w; d.h = data.h;
    d.playerStart = data.playerStart;
    d.signs = data.signs;
    d.items = [{ ...DUNGEON_ITEMS[0], x:data.itemPos.x, y:data.itemPos.y }];
    DUNGEON_NPCS[0].x = data.ghostPos.x;
    DUNGEON_NPCS[0].y = data.ghostPos.y;
    DUNGEON_NPCS[0].history = [];
    d.enemies = data.enemySpawns.map((sp, i) => ({
        ...ENEMY_DEFS[sp.type],
        id: `enemy_${i}`,
        type: sp.type,
        x: sp.x, y: sp.y,
        hp: ENEMY_DEFS[sp.type].hp,
        moveTimer: 300 + Math.floor(Math.random() * 700),
        aggroed: false,
        alive: true,
    }));
}
rebuildDungeon(); // initial build so tiles array is never empty

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
    { id:'find_weapon',     title:'Armed and Ready',
      giver:'guide',        giverName:'Rowan',
      objective:'Find your weapon hidden somewhere in the village.',
      flag_given:'quest_weapon_given', flag_complete:'quest_weapon_complete' },
    { id:'into_the_dark',   title:'Into the Dark',
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
    guide:       'quest_weapon_given',
    elder:       'quest_into_dark_given',
    blacksmith:  'quest_brothers_fate_given',
    traveler:    'quest_sealed_truth_given',
};

// ═══════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════
// XP thresholds — xpThresholds[level] = total XP needed to reach that level
const XP_THRESHOLDS = [0, 0, 60, 150, 280, 450, 670, 950, 1300, 1720, 2220];
// Max level = XP_THRESHOLDS.length - 1
const MAX_LEVEL = XP_THRESHOLDS.length - 1;

const gs = { charName:'Hero', charClass:'Warrior', flags:{}, inventory:[], hp:50, maxHp:50, xp:0, level:1 };
let currentMap = MAPS.village;

// ── XP helpers ────────────────────────────────────────
function xpForLevel(lvl) { return XP_THRESHOLDS[Math.min(lvl, MAX_LEVEL)] || 0; }
function xpToNext() {
    if (gs.level >= MAX_LEVEL) return 0;
    return xpForLevel(gs.level + 1) - gs.xp;
}
function xpProgressPct() {
    if (gs.level >= MAX_LEVEL) return 1;
    const base = xpForLevel(gs.level), next = xpForLevel(gs.level + 1);
    return (gs.xp - base) / (next - base);
}
function grantXP(amount) {
    if (gs.level >= MAX_LEVEL) return;
    gs.xp += amount;
    while (gs.level < MAX_LEVEL && gs.xp >= xpForLevel(gs.level + 1)) {
        gs.level++;
        // Stat boost on level up
        const hpGain = { Warrior:10, Cleric:9, Rogue:7, Wizard:6 }[gs.charClass] || 8;
        gs.maxHp += hpGain;
        gs.hp = Math.min(gs.hp + Math.ceil(hpGain / 2), gs.maxHp);
        updateHPUI();
        showNotification(`Level Up!  Lv ${gs.level}  +${hpGain} Max HP`, 'levelup');
    }
    updateInventoryUI();
}

// ── Battle state ──────────────────────────────────────
// Phases:
//  'player_menu'     — main action menu (FIGHT / ITEM / FLEE)
//  'player_item'     — item submenu
//  'player_timing'   — timing-bar minigame after FIGHT
//  'player_result'   — show hit label + damage number
//  'no_weapon'       — brief "no weapon" warning, then enemy turn
//  'flee_attempt'    — flee animation / result
//  'enemy_turn'      — pause before enemy strike
//  'enemy_result'    — show enemy damage
//  'victory'         — win screen
//  'defeat'          — defeat screen
const battle = {
    active: false,
    enemy: null,
    phase: 'player_menu',
    timer: 0,
    // Menu navigation
    menuCursor: 0,   // 0=FIGHT 1=ITEM 2=FLEE
    // Item submenu
    itemCursor: 0,
    // Timing bar
    cursorPos: 0.1,
    cursorDir: 1,
    // Results
    hitResult: '',
    hitDmg: 0,
    playerDmgTaken: 0,
    message: '',     // text shown in left dialogue box
    shakeTimer: 0,
};

const player  = {
    x:7, y:8, facing:'down',
    renderX:7*48, renderY:8*48,   // sub-tile pixel position for smooth rendering
    prevX:7*48,   prevY:8*48,     // start of current move interpolation
    moveT:1, moveDuration:130,    // move progress (0→1) and duration in ms
    walkPhase:0,                  // advances each step; drives leg/bob animation
    isMoving:false,
};
const cam     = { x:0, y:0 };
const ui      = { dialogue:null, sign:null, loading:false, questLog:false, paused:false, inventory:false };
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
    invalidateTileCache(); // rebuild tile variants at new TS
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
    if (battle.active) { e.preventDefault(); handleBattleInput(e.key); return; }
    if (e.key === 'Tab') { e.preventDefault(); toggleInventory(); return; }
    if (e.key === 'e' || e.key === 'E') { e.preventDefault(); handleInteract(); }
    if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); toggleQuestLog(); }
    if (e.key === 'Escape') {
        if (ui.paused) { closePause(); }
        else if (ui.inventory) { closeInventory(); }
        else if (ui.dialogue || ui.sign || ui.questLog) { closeDialogue(); closeSign(); closeQuestLog(); }
        else { openPause(); }
    }
});
document.addEventListener('keyup', e => KEYS.delete(e.key));
document.addEventListener('keydown', e => {
    if(e.target?.id==='dlg-input'&&e.key==='Enter'){e.preventDefault();sendDialogueMessage();}
});

let moveAccum = 999;

function updateMovement(dt) {
    if (battle.active || ui.inventory || ui.dialogue || ui.sign || ui.questLog || ui.loading || ui.paused) { JUST_PRESSED.clear(); return; }
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
    // Start smooth interpolation from current render position to new tile
    player.prevX = player.renderX; player.prevY = player.renderY;
    player.x = nx; player.y = ny;
    player.moveT = 0; player.isMoving = true;
    player.walkPhase += Math.PI; // half-cycle per step drives alternating legs
    // Footstep dust puff at the tile we just left
    spawnParticle('dust', player.prevX/TS + 0.5, player.prevY/TS + 0.5);
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
    player.renderX = player.x * TS; player.renderY = player.y * TS;
    player.prevX = player.renderX;  player.prevY = player.renderY;
    player.moveT = 1; player.isMoving = false;
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
function updatePlayerAnim(dt) {
    if (player.moveT >= 1) {
        player.renderX = player.x * TS;
        player.renderY = player.y * TS;
        player.isMoving = false;
        return;
    }
    player.moveT = Math.min(1, player.moveT + dt / player.moveDuration);
    const t = player.moveT;
    const ease = t * t * (3 - 2 * t); // smoothstep
    player.renderX = player.prevX + (player.x * TS - player.prevX) * ease;
    player.renderY = player.prevY + (player.y * TS - player.prevY) * ease;
}

function updateCamera() {
    const tx = player.renderX + TS/2 - canvas.width/2;
    const ty = player.renderY + TS/2 - canvas.height/2;
    cam.x = Math.round(Math.max(0, Math.min(tx, currentMap.w * TS - canvas.width)));
    cam.y = Math.round(Math.max(0, Math.min(ty, currentMap.h * TS - canvas.height)));
}

// ═══════════════════════════════════════════════════════
//  TILE VARIANT CACHE
//  Pre-renders N variants of each tile into offscreen
//  canvases at startup.  drawTile() just calls drawImage()
//  which is ~10× faster than re-drawing every frame, and
//  allows richly detailed artwork on each tile.
// ═══════════════════════════════════════════════════════
const _tc  = {};   // cache:  key string → HTMLCanvasElement
let  _tcTS = 0;    // TS value at last build; 0 = dirty

// Seeded deterministic PRNG (LCG) — returns values in [0, 1)
function _rng(seed) {
    let s = (seed * 1664525 + 1013904223) >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function _mkTile() {
    const c = document.createElement('canvas');
    c.width = c.height = TS;
    return c;
}

function invalidateTileCache() { _tcTS = 0; }

function ensureTileCache() {
    if (_tcTS === TS) return;
    _tcTS = TS;
    _buildTileCache();
}

function _buildTileCache() {
    for (const k of Object.keys(_tc)) delete _tc[k];
    const T = TS, U = Math.max(1, Math.floor(T / 16));

    // ─── GRASS  8 variants ─────────────────────────────
    for (let v = 0; v < 8; v++) {
        const can = _mkTile(), c = can.getContext('2d');
        const rng = _rng(v * 37 + 5);
        const isDry  = v === 5, isDark = v === 6;
        const base1  = isDry ? '#4a6818' : isDark ? '#2c5816' : '#388828';
        const base2  = isDry ? '#547020' : isDark ? '#347220' : '#3c8c2c';
        // Organic scatter base — no visible grid
        c.fillStyle = base1; c.fillRect(0, 0, T, T);
        c.fillStyle = base2;
        for (let i = 0; i < 28; i++) {
            const sw = Math.floor(rng() * U * 5 + U * 2);
            const sh = Math.floor(rng() * U * 4 + U * 2);
            c.fillRect(Math.floor(rng() * (T - sw)), Math.floor(rng() * (T - sh)), sw, sh);
        }
        // Highlight scatter + tufts
        c.fillStyle = isDry ? '#7a9030' : isDark ? '#3a8020' : '#48a834';
        for (let i = 0; i < (v === 4 ? 6 : 3); i++)
            c.fillRect(Math.floor(rng() * (T - U*2)), Math.floor(rng() * (T - U*2)), U, U);
        c.fillStyle = isDry ? '#6a8828' : isDark ? '#2a7818' : '#56b840';
        for (let i = 0; i < (v === 4 ? 5 : 2); i++)
            c.fillRect(Math.floor(rng()*(T-U*2)), Math.floor(rng()*(T-U*5)), U, U*3);
        // Per-variant decoration
        switch (v) {
            case 1: { // wildflowers — 2 four-petal flowers
                for (let f = 0; f < 2; f++) {
                    const fx = Math.floor(rng()*(T-U*6)+U*3), fy = Math.floor(rng()*(T-U*6)+U*3);
                    const fc = f ? '#e87870' : '#e8d030';
                    c.fillStyle = fc;
                    c.fillRect(fx-U, fy, U, U); c.fillRect(fx+U, fy, U, U);
                    c.fillRect(fx, fy-U, U, U); c.fillRect(fx, fy+U, U, U);
                    c.fillStyle = '#ffffc0'; c.fillRect(fx, fy, U, U);
                }
                break;
            }
            case 2: { // pebbles — small flat stones with highlights
                for (let p = 0; p < 6; p++) {
                    const px2 = Math.floor(rng()*(T-U*3)), py2 = Math.floor(rng()*(T-U*2));
                    c.fillStyle = p%2 ? '#7a7868' : '#6e6c5a';
                    c.fillRect(px2, py2, U*2, U);
                    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(px2, py2, U*2, 1);
                    c.fillStyle = 'rgba(0,0,0,0.18)';       c.fillRect(px2, py2+U-1, U*2, 1);
                }
                break;
            }
            case 3: { // mushroom — stem + cap + dot highlights
                const mx = Math.floor(T*0.37), my = Math.floor(T*0.44);
                c.fillStyle = '#c8a860'; c.fillRect(mx, my, U*2, U*3);
                c.fillStyle = '#c83820'; c.fillRect(mx-U, my-U*2, U*4, U*2);
                c.fillStyle = '#e05038'; c.fillRect(mx, my-U*2, U, U);
                c.fillStyle = 'rgba(255,255,255,0.75)';
                c.fillRect(mx+U, my-U*2, U, U); c.fillRect(mx-U+1, my-U, U, U);
                // second small mushroom
                const mx2 = Math.floor(T*0.62), my2 = Math.floor(T*0.56);
                c.fillStyle = '#c8a860'; c.fillRect(mx2, my2, U, U*2);
                c.fillStyle = '#d04828'; c.fillRect(mx2-U, my2-U, U*3, U);
                break;
            }
            case 4: { // dense — extra dark blades + slight darkening
                c.fillStyle = 'rgba(0,0,0,0.06)'; c.fillRect(0, 0, T, T);
                c.fillStyle = '#2a6010';
                for (let i = 0; i < 5; i++)
                    c.fillRect(Math.floor(rng()*(T-U)), Math.floor(rng()*(T-U*4)), U, U*2);
                break;
            }
            case 5: { // dry — warm tint + cracked earth patch
                c.fillStyle = 'rgba(160,100,0,0.10)'; c.fillRect(0, 0, T, T);
                const cpx = Math.floor(rng()*T*0.5+T*0.2), cpy = Math.floor(rng()*T*0.4+T*0.3);
                c.fillStyle = '#5a4010'; c.fillRect(cpx, cpy, U*3, U*2);
                c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(cpx, cpy, U*3, 1);
                // Dry crack line
                c.fillStyle = 'rgba(0,0,0,0.20)';
                for (let i = 0; i < 6; i++) c.fillRect(cpx+i, cpy+i%3, 1, 1);
                break;
            }
            case 6: { // mossy — dark wet oval + bright green dots
                c.fillStyle = 'rgba(8,68,8,0.30)';
                c.beginPath(); c.ellipse(T/2, T/2, T*0.32, T*0.24, 0, 0, Math.PI*2); c.fill();
                c.fillStyle = '#1a8020';
                for (let i = 0; i < 5; i++)
                    c.fillRect(Math.floor(T*0.22+rng()*T*0.56), Math.floor(T*0.22+rng()*T*0.56), U, U);
                break;
            }
            case 7: { // clover — 2 three-leaf clusters
                for (let cl = 0; cl < 2; cl++) {
                    const clx = Math.floor(rng()*(T-U*8)+U*4), cly = Math.floor(rng()*(T-U*8)+U*4);
                    c.fillStyle = '#38c820';
                    c.beginPath(); c.arc(clx,      cly-U*1.2, U*1.1, 0, Math.PI*2); c.fill();
                    c.beginPath(); c.arc(clx-U*1.2, cly+U*.7, U*1.1, 0, Math.PI*2); c.fill();
                    c.beginPath(); c.arc(clx+U*1.2, cly+U*.7, U*1.1, 0, Math.PI*2); c.fill();
                    c.fillStyle = '#60e840';
                    c.beginPath(); c.arc(clx, cly, Math.max(1,U*.7), 0, Math.PI*2); c.fill();
                    c.fillStyle = '#38c820';
                }
                break;
            }
        }
        // Soft blur pass to smooth scatter edges into organic texture
        const blurred = _mkTile(), bc2 = blurred.getContext('2d');
        bc2.filter = 'blur(0.6px)';
        bc2.drawImage(can, 0, 0);
        _tc[`g${v}`] = blurred;
    }

    // ─── PATH  4 variants ──────────────────────────────
    for (let v = 0; v < 4; v++) {
        const can = _mkTile(), c = can.getContext('2d');
        const gap = Math.max(1, Math.floor(T/20)), half = Math.floor(T/2);
        const mortars = ['#8a7030','#7a6028','#787a38','#8a7828'];
        c.fillStyle = mortars[v]; c.fillRect(0, 0, T, T);
        if (v === 2) { // mossy mortar lines
            c.fillStyle = 'rgba(40,80,8,0.45)';
            c.fillRect(0, half-1, T, 2); c.fillRect(half-1, 0, 2, T);
        }
        const stoneColorSets = [
            ['#b49040','#c4a850','#a87c30','#bc9848'],
            ['#a08030','#b08840','#986828','#ac8438'],
            ['#9a9030','#aaA040','#8c8028','#b0a840'],
            ['#c0a840','#d0b850','#b09838','#c8b04a'],
        ];
        const sc = stoneColorSets[v];
        [[gap,gap],[half+gap,gap],[gap,half+gap],[half+gap,half+gap]].forEach(([ox,oy],i) => {
            const sw = half-gap*2, sh = half-gap*2;
            c.fillStyle = sc[i]; c.fillRect(ox, oy, sw, sh);
            c.fillStyle = 'rgba(255,255,255,0.20)'; c.fillRect(ox, oy, sw, 1);
            c.fillStyle = 'rgba(0,0,0,0.22)';       c.fillRect(ox, oy+sh-1, sw, 1);
        });
        if (v === 1) { // hairline cracks
            c.fillStyle = 'rgba(0,0,0,0.40)';
            for (let i = 0; i < 8; i++) c.fillRect(gap+1+i, gap+1+i, 1, 1);
            for (let i = 0; i < 6; i++) c.fillRect(half+gap+2+i, half+gap+4+i, 1, 1);
        }
        if (v === 3) { // worn center highlight
            c.fillStyle = 'rgba(255,255,255,0.06)';
            c.fillRect(Math.floor(T*0.3), Math.floor(T*0.3), Math.floor(T*0.4), Math.floor(T*0.4));
        }
        _tc[`p${v}`] = can;
    }

    // ─── WALL  4 variants × light/dark ─────────────────
    for (let dk = 0; dk < 2; dk++) {
        const mortar    = dk ? '#120e18' : '#4a3828';
        const accentTop = dk ? '#1a1422' : '#5a4432';
        const brickSets = dk ? [
            ['#1c1428','#221830','#181222'],
            ['#1a1226','#1e1530','#161020'],
            ['#1c1428','#221830','#181222'],
            ['#201630','#1e1428','#1a1228'],
        ] : [
            ['#6a4830','#7a5838','#5c3c24'],
            ['#5c3c20','#6a4828','#503418'],
            ['#6a4830','#7a5838','#5c3c24'],
            ['#724830','#806040','#5a3820'],
        ];
        for (let v = 0; v < 4; v++) {
            const can = _mkTile(), c = can.getContext('2d');
            const rng = _rng(v*53 + (dk?1000:0) + 13);
            const bH  = Math.floor(T/4), bW = Math.floor(T/2);
            c.fillStyle = mortar;    c.fillRect(0, 0, T, T);
            c.fillStyle = accentTop; c.fillRect(0, 0, T, Math.max(1,Math.floor(T*0.06)));
            const bc = brickSets[v];
            for (let row = 0; row < 4; row++) {
                const by = Math.floor(row*bH), off = (row%2)*Math.floor(bW/2);
                for (let col = -1; col < 3; col++) {
                    const bx = Math.floor(col*bW+off);
                    const x1 = Math.max(1,bx+1), x2 = Math.min(T-1,bx+bW-1);
                    const y1 = by+1, y2 = by+bH-1;
                    if (x2<=x1||y2<=y1) continue;
                    c.fillStyle = bc[(row+col+3)%bc.length]; c.fillRect(x1,y1,x2-x1,y2-y1);
                    c.fillStyle = 'rgba(255,255,255,0.08)';   c.fillRect(x1,y1,x2-x1,1);
                    c.fillStyle = 'rgba(0,0,0,0.20)';          c.fillRect(x1,y2-1,x2-x1,1);
                }
            }
            // Overlays
            if (v===1) { // aged — darker lower half
                c.fillStyle = `rgba(0,0,0,${dk?'0.10':'0.12'})`; c.fillRect(0,Math.floor(T*.5),T,Math.floor(T*.5));
            } else if (v===2) { // mossy streak + dots near base
                c.fillStyle = dk?'rgba(5,50,5,0.32)':'rgba(10,70,10,0.22)';
                c.fillRect(0, Math.floor(T*.58), T, Math.floor(T*.42));
                c.fillStyle = dk?'#062808':'#1a5010';
                for (let i=0;i<5;i++) c.fillRect(Math.floor(rng()*T), Math.floor(T*.65+rng()*T*.30), U, U);
            } else if (v===3&&!dk) { // crumbling top — debris
                c.fillStyle = mortar; c.fillRect(0,0,T,Math.floor(T*.08));
                c.fillStyle = bc[0];
                for (let i=0;i<5;i++) c.fillRect(Math.floor(rng()*(T-U*2)), Math.floor(rng()*T*.14), U*2, U);
            }
            _tc[dk ? `wd${v}` : `wl${v}`] = can;
        }
    }

    // ─── FLOOR  4 variants × light/dark ────────────────
    const floorColSets = [
        [['#8a5a28','#7a4e20','#9a6832'],['#231830','#2e2040','#1a1028']],  // v0 standard
        [['#9a6a38','#8a5e28','#aa783a'],['#281a38','#322444','#1e142c']],  // v1 worn/lighter
        [['#8a5a28','#7a4e20','#9a6832'],['#231830','#2e2040','#1a1028']],  // v2 stained (overlay)
        [['#7a4a18','#6a3e10','#8a5820'],['#1a1028','#241838','#120820']],  // v3 dark
    ];
    for (let dk = 0; dk < 2; dk++) {
        for (let v = 0; v < 4; v++) {
            const can = _mkTile(), c = can.getContext('2d');
            const rng = _rng(v*59+(dk?2000:0)+17);
            const cols   = floorColSets[v][dk];
            const plankH = Math.floor(T/3);
            const jointX = v%2===0 ? Math.floor(T*.42) : Math.floor(T*.60);
            for (let i = 0; i < 3; i++) {
                const py2 = Math.floor(i*plankH), h = i===2?T-2*plankH:plankH;
                c.fillStyle = cols[i]; c.fillRect(0, py2, T, h);
                c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(0, py2, T, 1);
                c.fillStyle = 'rgba(0,0,0,0.15)';       c.fillRect(0, py2+h-1, T, 1);
                c.fillStyle = 'rgba(0,0,0,0.18)';       c.fillRect(jointX, py2, 1, h);
                if (v===1) { // scratches
                    c.fillStyle = 'rgba(0,0,0,0.10)';
                    for (let s=0;s<2;s++)
                        c.fillRect(Math.floor(rng()*T*.7+T*.1), py2+Math.floor(rng()*(h-2)+1), Math.floor(rng()*T*.35+T*.1), 1);
                } else if (v===2&&i===1) { // stain patch on middle plank
                    c.fillStyle = 'rgba(0,0,0,0.16)';
                    c.fillRect(Math.floor(T*.15), py2+2, Math.floor(T*.48), h-4);
                }
            }
            _tc[dk?`fd${v}`:`fl${v}`] = can;
        }
    }

    // ─── TREE  4 variants (transparent bg) ─────────────
    const treeCfg = [
        {r:.38,cx:.50,cy:.38,dense:false,wide:false},
        {r:.42,cx:.50,cy:.40,dense:true, wide:false},
        {r:.34,cx:.50,cy:.44,dense:false,wide:true },
        {r:.30,cx:.50,cy:.31,dense:false,wide:false},
    ];
    for (let v = 0; v < 4; v++) {
        const can = _mkTile(), c = can.getContext('2d');
        const cfg = treeCfg[v];
        const cx2 = Math.floor(T*cfg.cx), cy2 = Math.floor(T*cfg.cy), r = T*cfg.r;
        const tW  = cfg.wide?Math.floor(T*.15):v===3?Math.floor(T*.08):Math.floor(T*.12);
        const tH  = v===3?Math.floor(T*.34):Math.floor(T*.22);
        // Shadow
        c.fillStyle = 'rgba(0,0,0,0.32)';
        c.beginPath(); c.ellipse(Math.floor(T*.52),Math.floor(T*.68),T*.32,T*.11,0,0,Math.PI*2); c.fill();
        // Trunk
        c.fillStyle = '#4a2808'; c.fillRect(Math.floor(T/2-tW/2), Math.floor(T*.44), tW, tH);
        c.fillStyle = '#6e3e14'; c.fillRect(Math.floor(T/2-tW/2+tW*.25), Math.floor(T*.44), Math.floor(tW*.4), tH);
        // Canopy layers
        const outer = cfg.dense?'#154008':'#1a4a08';
        const mid   = cfg.dense?'#225814':'#2a6814';
        const hi    = cfg.dense?'#306018':'#3a8020';
        c.fillStyle = outer; c.beginPath(); c.arc(cx2,cy2,r,0,Math.PI*2); c.fill();
        c.fillStyle = mid;   c.beginPath(); c.arc(cx2,cy2-Math.floor(r*.06),Math.floor(r*.84),0,Math.PI*2); c.fill();
        c.fillStyle = hi;    c.beginPath(); c.arc(cx2-Math.floor(r*.18),cy2-Math.floor(r*.20),Math.floor(r*.62),0,Math.PI*2); c.fill();
        c.fillStyle = '#50a030'; c.fillRect(Math.floor(cx2-r*.38),Math.floor(cy2-r*.44),Math.floor(r*.28),Math.floor(r*.22));
        if (cfg.dense) { // extra perimeter clusters
            c.fillStyle = outer;
            for (let i=0;i<5;i++) {
                const a=(i/5)*Math.PI*2;
                c.beginPath(); c.arc(cx2+Math.cos(a)*r*.65,cy2+Math.sin(a)*r*.5,r*.22,0,Math.PI*2); c.fill();
            }
        }
        if (cfg.wide) { // lateral side lobes
            c.fillStyle = mid;
            c.beginPath(); c.arc(cx2-Math.floor(r*.55),cy2+Math.floor(r*.12),r*.28,0,Math.PI*2); c.fill();
            c.beginPath(); c.arc(cx2+Math.floor(r*.55),cy2+Math.floor(r*.12),r*.28,0,Math.PI*2); c.fill();
        }
        _tc[`tr${v}`] = can;
    }
}

// ═══════════════════════════════════════════════════════
//  TILE RENDERING
// ═══════════════════════════════════════════════════════
function drawTile(tile, px, py, tx, ty) {
    ensureTileCache();
    const dark = currentMap.dark;
    const ipx = Math.floor(px), ipy = Math.floor(py);
    const S1 = TS + 1; // draw 1px over to close sub-pixel seams
    switch (tile) {
        case TILE.GRASS: {
            ctx.drawImage(_tc[`g${(tx*7+ty*13)&7}`], ipx, ipy, S1, S1);
            break;
        }
        case TILE.PATH: {
            ctx.drawImage(_tc[`p${(tx*11+ty*7)&3}`], ipx, ipy, S1, S1);
            break;
        }
        case TILE.FLOOR: {
            const v = (tx*5+ty*17)&3;
            ctx.drawImage(_tc[dark?`fd${v}`:`fl${v}`], ipx, ipy, S1, S1);
            break;
        }
        case TILE.WALL: {
            const v = (tx*3+ty*11)&3;
            ctx.drawImage(_tc[dark?`wd${v}`:`wl${v}`], ipx, ipy, S1, S1);
            break;
        }
        case TILE.TREE: {
            const gv = (tx*7+ty*13)&7, tv = (tx*5+ty*9)&3;
            ctx.drawImage(_tc[`g${gv}`], ipx, ipy, S1, S1);
            ctx.drawImage(_tc[`tr${tv}`], ipx, ipy, S1, S1);
            break;
        }
        case TILE.WATER:    drawWater(px,py);    break;
        case TILE.DOOR:     drawDoor(px,py);     break;
        case TILE.STAIRS:   drawStairs(px,py);   break;
        case TILE.STAIRSUP: drawStairsUp(px,py); break;
        case TILE.SIGN: {
            const snb = [
                currentMap.tiles[ty]?.[tx-1], currentMap.tiles[ty]?.[tx+1],
                currentMap.tiles[ty-1]?.[tx],  currentMap.tiles[ty+1]?.[tx],
            ];
            const onWall = snb.some(t=>t===TILE.WALL);
            if (dark || onWall) {
                ctx.drawImage(_tc[dark?`fd${(tx*5+ty*17)&3}`:`wl${(tx*3+ty*11)&3}`], ipx, ipy, S1, S1);
            } else if (snb.some(t=>t===TILE.FLOOR)) {
                ctx.drawImage(_tc[`fl${(tx*5+ty*17)&3}`], ipx, ipy, S1, S1);
            } else if (snb.some(t=>t===TILE.PATH)) {
                ctx.drawImage(_tc[`p${(tx*11+ty*7)&3}`],  ipx, ipy, S1, S1);
            } else {
                ctx.drawImage(_tc[`g${(tx*7+ty*13)&7}`],  ipx, ipy, S1, S1);
            }
            if (onWall) drawWallPlaque(px, py);
            else        drawSignPost(px,py);
            break;
        }
        case TILE.TORCH:    drawTorch(px,py);    break;
        default: ctx.fillStyle='#000'; ctx.fillRect(ipx,ipy,TS,TS);
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
    const tx = Math.round(px/TS), ty = Math.round(py/TS);
    const ws = tx*7 + ty*13; // tile seed
    // Dark base + lighter mid band
    ctx.fillStyle = '#1a5a8c'; ctx.fillRect(Math.floor(px), Math.floor(py), TS, TS);
    ctx.fillStyle = '#2472a8'; ctx.fillRect(Math.floor(px), Math.floor(py+TS*.35), TS, Math.floor(TS*.30));
    // 3 animated wave bands
    for (let i = 0; i < 3; i++) {
        const wy = Math.floor(py + (TS/4)*(i+1) + Math.sin(t*1.4+px*.04+i*1.2)*2);
        ctx.fillStyle = `rgba(80,160,210,${0.25+0.12*Math.sin(t*1.8+i)})`;
        ctx.fillRect(Math.floor(px+TS*.05), wy, Math.floor(TS*.90), Math.max(1,Math.floor(TS*.06)));
    }
    // Shimmer glint
    ctx.fillStyle = `rgba(200,235,255,${0.12+0.10*Math.sin(t*2.8+px*.08)})`;
    ctx.fillRect(Math.floor(px+TS*.06), Math.floor(py+TS*.10), Math.floor(TS*.20), Math.floor(TS*.06));
    // Lily pad (1 in 5 water tiles, anchored by tile seed)
    if (ws % 5 === 0) {
        const lpx = Math.floor(px + TS*.18 + (ws%3)*TS*.22);
        const lpy = Math.floor(py + TS*.30 + ((ws>>2)%3)*TS*.20);
        const lpR = Math.floor(TS*.13);
        // Pad body
        ctx.fillStyle = '#1a6810';
        ctx.beginPath(); ctx.arc(lpx, lpy, lpR, 0, Math.PI*2); ctx.fill();
        // Notch cut-out (wedge in water color)
        ctx.fillStyle = '#1e6494';
        ctx.beginPath(); ctx.moveTo(lpx,lpy); ctx.arc(lpx,lpy,lpR+1,-0.45,0.15); ctx.closePath(); ctx.fill();
        // Highlight on pad
        ctx.fillStyle = 'rgba(60,200,60,0.25)';
        ctx.beginPath(); ctx.arc(lpx-Math.floor(lpR*.3), lpy-Math.floor(lpR*.3), Math.floor(lpR*.5), 0, Math.PI*2); ctx.fill();
        // Tiny pink/white flower on some pads
        if (ws % 15 === 0) {
            ctx.fillStyle = '#e8a0c0';
            ctx.beginPath(); ctx.arc(lpx, lpy-Math.floor(lpR*.1), Math.max(1,Math.floor(lpR*.35)), 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff8e0';
            ctx.beginPath(); ctx.arc(lpx, lpy-Math.floor(lpR*.1), Math.max(1,Math.floor(lpR*.16)), 0, Math.PI*2); ctx.fill();
        }
    }
}

function drawDoor(px, py) {
    const dark = currentMap.dark;
    const T = TS;
    const ipx = Math.floor(px), ipy = Math.floor(py);

    // ── 1. Wall background (full tile) ──────────────────
    drawWall(ipx, ipy, dark);

    // ── 2. Stone door frame (recessed arch) ─────────────
    const frameL = Math.floor(T*.13), frameR = Math.floor(T*.87);
    const frameW  = frameR - frameL;
    const frameTop = Math.floor(T*.05), frameBot = Math.floor(T*.86);
    const frameH  = frameBot - frameTop;
    const frameCol = dark ? '#0e0b16' : '#3a2a18';
    ctx.fillStyle = frameCol;
    ctx.fillRect(ipx+frameL-2, ipy+frameTop, frameW+4, frameH); // recess shadow

    // Arch top — 3 flat rect approximation
    const archH = Math.floor(T*.10);
    ctx.fillStyle = dark ? '#16121e' : '#4a3828';
    ctx.fillRect(ipx+frameL, ipy+frameTop, frameW, archH);
    ctx.fillStyle = dark ? '#1c1828' : '#5a4838';
    ctx.fillRect(ipx+frameL+2, ipy+frameTop+1, frameW-4, archH-2);

    // ── 3. Door panel (wood planks) ───────────────────────
    const dL = ipx+frameL+2, dTop = ipy+frameTop+archH;
    const dW = frameW-4,    dH  = frameBot - frameTop - archH - 2;
    const plankH = Math.floor(dH/4);
    const plankCols = dark
        ? ['#2a1808','#321e0c','#241408','#2e1c0a']
        : ['#7a4018','#8a4c20','#6a3410','#7c4820'];
    for (let i = 0; i < 4; i++) {
        const plankY = dTop + i*plankH;
        const ph = i === 3 ? dH - 3*plankH : plankH;
        ctx.fillStyle = plankCols[i];
        ctx.fillRect(dL, plankY, dW, ph - 1);
        // Highlight top edge
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(dL, plankY, dW, 1);
        // Vertical grain lines
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.fillRect(dL+Math.floor(dW*.33), plankY+1, 1, ph-2);
        ctx.fillRect(dL+Math.floor(dW*.66), plankY+1, 1, ph-2);
    }
    // Panel inset shadow on sides
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(dL, dTop, 2, dH);
    ctx.fillRect(dL+dW-2, dTop, 2, dH);

    // ── 4. Door handle (brass) ────────────────────────────
    const hx = ipx + Math.floor(T*.70), hy = ipy + Math.floor(T*.50);
    ctx.fillStyle = '#c8901a';
    ctx.fillRect(hx, hy, Math.floor(T*.06), Math.floor(T*.10));
    ctx.fillStyle = '#e8b030';
    ctx.fillRect(hx+1, hy+1, Math.floor(T*.03), Math.floor(T*.04));

    // ── 5. Hinges (iron) ─────────────────────────────────
    const hingeX = ipx+frameL+2, hingeW = Math.floor(T*.07), hingeH = Math.floor(T*.06);
    ctx.fillStyle = '#282828';
    ctx.fillRect(hingeX, ipy+Math.floor(T*.20), hingeW, hingeH);
    ctx.fillRect(hingeX, ipy+Math.floor(T*.62), hingeW, hingeH);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(hingeX, ipy+Math.floor(T*.20), hingeW, 1);
    ctx.fillRect(hingeX, ipy+Math.floor(T*.62), hingeW, 1);

    // ── 6. Stone step (threshold) at bottom ──────────────
    const stepH = Math.floor(T*.14);
    ctx.fillStyle = dark ? '#1e1830' : '#8a7a60';
    ctx.fillRect(ipx+frameL-3, ipy+frameBot, frameW+6, stepH);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(ipx+frameL-3, ipy+frameBot, frameW+6, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(ipx+frameL-3, ipy+frameBot+stepH-1, frameW+6, 1);

    // ── 7. Small transom window above door ────────────────
    const winY = ipy+frameTop+2, winH = archH-4;
    const winL = dL+Math.floor(dW*.20), winW = Math.floor(dW*.60);
    if (winH > 2) {
        ctx.fillStyle = dark ? '#0a0818' : '#4a6a8a'; // glass
        ctx.fillRect(winL, winY, winW, winH);
        ctx.fillStyle = 'rgba(255,255,255,0.20)';
        ctx.fillRect(winL, winY, winW, 1);
        ctx.fillRect(winL, winY, 1, winH);
        ctx.fillStyle = dark ? '#1a1430' : '#6a8aaa';
        ctx.fillRect(winL+Math.floor(winW/2)-1, winY, 1, winH); // center bar
    }
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

function drawWallPlaque(px, py) {
    const U = Math.max(1, Math.floor(TS/16));
    // Stone bracket mounts (left + right)
    ctx.fillStyle = '#3a2c1c';
    ctx.fillRect(Math.floor(px+TS*.10), Math.floor(py+TS*.30), U*2, U*3);
    ctx.fillRect(Math.floor(px+TS*.82), Math.floor(py+TS*.30), U*2, U*3);
    // Plaque board: dark border
    const bx = Math.floor(px+TS*.12), by = Math.floor(py+TS*.22);
    const bw = Math.floor(TS*.76),    bh = Math.floor(TS*.44);
    ctx.fillStyle = '#2a1a08'; ctx.fillRect(bx, by, bw, bh);
    // Mid fill
    ctx.fillStyle = '#a06828'; ctx.fillRect(bx+2, by+2, bw-4, bh-4);
    // Top half highlight
    ctx.fillStyle = '#c08038'; ctx.fillRect(bx+2, by+2, bw-4, Math.floor((bh-4)/2));
    // 3 carved text lines
    const lm = bx+Math.floor(bw*.14), lw = Math.floor(bw*.72);
    ctx.fillStyle = 'rgba(40,15,5,0.72)';
    ctx.fillRect(lm, Math.floor(by+bh*.24), lw,                 2);
    ctx.fillRect(lm, Math.floor(by+bh*.50), lw,                 2);
    ctx.fillRect(lm, Math.floor(by+bh*.72), Math.floor(lw*.55), 2);
    // Bottom shadow
    ctx.fillStyle = 'rgba(0,0,0,0.20)'; ctx.fillRect(bx+2, by+bh-4, bw-4, 2);
    // Corner nail dots
    ctx.fillStyle = '#1a1008';
    [[bx+Math.floor(bw*.10), by+Math.floor(bh*.15)],
     [bx+Math.floor(bw*.90), by+Math.floor(bh*.15)],
     [bx+Math.floor(bw*.10), by+Math.floor(bh*.82)],
     [bx+Math.floor(bw*.90), by+Math.floor(bh*.82)]].forEach(([nx,ny]) => {
        ctx.fillRect(Math.floor(nx)-U, Math.floor(ny)-U, U*2, U*2);
    });
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
//  PARTICLE SYSTEM
//  Types: 'firefly' (outdoor), 'dust' (dungeon/interior),
//         'spark' (forge), 'leaf' (windy outdoor areas)
// ═══════════════════════════════════════════════════════
const PARTICLES = [];
let _partTimer  = 0;

function spawnParticle(type, x, y) {
    const r = Math.random;
    const p = { type, x, y, life:0 };
    if (type==='firefly') Object.assign(p,{vx:(r()-.5)*.28,vy:(r()-.5)*.28,maxLife:5000+r()*5000,size:1.5+r()*1.5,phase:r()*Math.PI*2});
    else if (type==='dust')  Object.assign(p,{vx:(r()-.5)*.07,vy:-.03-r()*.04,maxLife:3000+r()*2000,size:1+r()*.8});
    else if (type==='spark') Object.assign(p,{vx:(r()-.5)*2.2,vy:-1.4-r()*2,maxLife:350+r()*500,size:1.5+r(),color:r()<.5?'#ff8020':'#ffcc00'});
    else if (type==='leaf')  Object.assign(p,{vx:.15+r()*.35,vy:.08+r()*.18,maxLife:6000+r()*4000,size:2+r(),color:r()<.5?'#8a5820':'#a86820',angle:r()*Math.PI*2,spin:(r()-.5)*.05});
    PARTICLES.push(p);
}

function updateParticles(dt) {
    if (ui.loading||ui.paused) return;
    _partTimer += dt;
    if (_partTimer > 280) { _partTimer = 0; _spawnAmbient(); }
    for (let i = PARTICLES.length-1; i >= 0; i--) {
        const p = PARTICLES[i];
        p.life += dt;
        if (p.life >= p.maxLife) { PARTICLES.splice(i,1); continue; }
        p.x += p.vx; p.y += p.vy;
        if (p.type==='firefly') {
            p.vx += (Math.random()-.5)*.024; p.vy += (Math.random()-.5)*.024;
            p.vx = Math.max(-.38,Math.min(.38,p.vx));
            p.vy = Math.max(-.38,Math.min(.38,p.vy));
        } else if (p.type==='spark') {
            p.vy += .09; // gravity
        } else if (p.type==='leaf') {
            p.vx += Math.sin(p.life*.002)*.012; p.vy += .005; p.angle += p.spin;
        }
    }
}

function _spawnAmbient() {
    if (!currentMap) return;
    const maxR = 13;
    if (!currentMap.dark && !currentMap.returnMap) {
        // Outdoor — fireflies
        if (PARTICLES.filter(p=>p.type==='firefly').length < 7) {
            const tx = Math.floor(player.x+(Math.random()-.5)*maxR*2);
            const ty = Math.floor(player.y+(Math.random()-.5)*maxR*2);
            const t  = currentMap.tiles[ty]?.[tx];
            if (t===TILE.GRASS||t===TILE.TREE)
                spawnParticle('firefly',(tx+Math.random())*TS,(ty+Math.random())*TS-TS*.3);
        }
        // Occasional leaf drift near trees
        if (PARTICLES.filter(p=>p.type==='leaf').length < 4) {
            const tx = Math.floor(player.x+(Math.random()-.5)*maxR*2);
            const ty = Math.floor(player.y+(Math.random()-.5)*maxR*2);
            if (currentMap.tiles[ty]?.[tx]===TILE.TREE)
                spawnParticle('leaf',(tx+Math.random())*TS,(ty+Math.random())*TS);
        }
    } else {
        // Dungeon / dark interior — dust motes
        if (PARTICLES.filter(p=>p.type==='dust').length < 14)
            spawnParticle('dust',
                (player.x+(Math.random()-.5)*maxR)*TS,
                (player.y+(Math.random()-.5)*maxR)*TS);
    }
    // Forge sparks in blacksmith interior
    if (currentMap.id==='int_blacksmith') {
        if (PARTICLES.filter(p=>p.type==='spark').length < 12)
            spawnParticle('spark', 11*TS+TS*.5, 1*TS+TS*.25);
    }
}

function renderParticles() {
    ctx.save();
    for (const p of PARTICLES) {
        const pct = p.life/p.maxLife;
        const sx  = p.x-cam.x, sy = p.y-cam.y;
        if (sx<-30||sx>canvas.width+30||sy<-30||sy>canvas.height+30) continue;
        if (p.type==='firefly') {
            const alpha = Math.sin(pct*Math.PI)*(.5+.4*Math.sin(p.life*.008+p.phase));
            ctx.globalAlpha  = alpha;
            ctx.shadowColor  = '#80ff80';
            ctx.shadowBlur   = 10;
            ctx.fillStyle    = '#c0ffc0';
            ctx.beginPath(); ctx.arc(Math.floor(sx),Math.floor(sy),p.size,0,Math.PI*2); ctx.fill();
        } else if (p.type==='dust') {
            ctx.globalAlpha = Math.sin(pct*Math.PI)*.22;
            ctx.shadowBlur  = 0;
            ctx.fillStyle   = '#806050';
            ctx.fillRect(Math.floor(sx),Math.floor(sy),Math.ceil(p.size),Math.ceil(p.size));
        } else if (p.type==='spark') {
            ctx.globalAlpha = (1-pct)*.9;
            ctx.shadowColor = p.color; ctx.shadowBlur = 5;
            ctx.fillStyle   = p.color;
            ctx.fillRect(Math.floor(sx),Math.floor(sy),Math.ceil(p.size),Math.ceil(p.size));
        } else if (p.type==='leaf') {
            ctx.globalAlpha = Math.sin(pct*Math.PI)*.75;
            ctx.shadowBlur  = 0;
            ctx.fillStyle   = p.color;
            ctx.save(); ctx.translate(Math.floor(sx),Math.floor(sy)); ctx.rotate(p.angle);
            ctx.fillRect(-p.size,-p.size*.5,p.size*2,p.size); ctx.restore();
        }
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    ctx.restore();
}

function renderVignette() {
    // Soft corner darkening for interiors — makes small rooms feel enclosed
    if (!currentMap?.returnMap) return;
    const grd = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, Math.min(canvas.width,canvas.height)*.32,
        canvas.width/2, canvas.height/2, Math.min(canvas.width,canvas.height)*.75
    );
    grd.addColorStop(0,'rgba(0,0,0,0)');
    grd.addColorStop(1,'rgba(0,0,0,0.48)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

// ═══════════════════════════════════════════════════════
//  ENTITY & ITEM RENDERING
// ═══════════════════════════════════════════════════════
const CLASS_COLORS = {Warrior:'#c8922a',Rogue:'#9a40d0',Wizard:'#3a8ad0',Cleric:'#d0c840'};
const CLASS_CLOAK  = {Warrior:'#6a2808',Rogue:'#2a0e3a',Wizard:'#101e3a',Cleric:'#5a4808'};

function drawCharacter(sx, sy, color, facing, name, isPlayer, isNear, ghost, walkPhase=0, isMoving=false) {
    const cx=sx+TS/2, cy=sy+TS/2, r=TS*.28, t=timeMs/1000;

    // ── Walk bob: player bounces on each step; NPCs idle-sway ──
    const walkBob = isMoving ? Math.abs(Math.sin(walkPhase)) * TS * 0.055 : 0;
    const idlePhase = t * 1.1 + cx * 0.031;
    const npcBob = isPlayer ? 0 : Math.sin(idlePhase) * 1.4;
    const totalBob = isPlayer ? -walkBob : npcBob;

    ctx.save(); ctx.translate(0, totalBob);
    if (ghost) { ctx.globalAlpha=0.55+0.15*Math.sin(t*2.2); ctx.shadowColor='#80b0ff'; ctx.shadowBlur=18; }

    // ── Feet / legs (drawn under body) ──────────────────
    {
        const dirs = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
        const [fdx,fdy] = dirs[facing] || [0,1];
        const [fpx,fpy] = [-fdy, fdx]; // perpendicular to facing
        const footR = r * 0.22;
        const footPhase = isPlayer ? walkPhase : idlePhase * 0.6;
        const footSwing = isPlayer ? (isMoving ? r * 0.38 : r * 0.08) : r * 0.13;
        const footColor = ghost ? '#8090c0' : '#2a1a0a';
        // foot base position (bottom-center of body)
        const fbx = cx - fdx * r * 0.15;
        const fby = cy - fdy * r * 0.15;
        ctx.fillStyle = footColor;
        // left foot
        const lx = fbx + fpx * Math.sin(footPhase) * footSwing;
        const ly = fby + fpy * Math.sin(footPhase) * footSwing;
        ctx.beginPath(); ctx.arc(lx, ly, footR, 0, Math.PI*2); ctx.fill();
        // right foot (opposite phase)
        const rx2 = fbx + fpx * Math.sin(footPhase + Math.PI) * footSwing;
        const ry2 = fby + fpy * Math.sin(footPhase + Math.PI) * footSwing;
        ctx.beginPath(); ctx.arc(rx2, ry2, footR, 0, Math.PI*2); ctx.fill();
    }

    // ── Ground shadow (squishes up slightly during bob upstroke) ─
    const shadowScale = 1 - (walkBob / (TS * 0.12)) * 0.25;
    ctx.fillStyle='rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(cx,cy+r+3,r*.7*shadowScale,r*.22*shadowScale,0,0,Math.PI*2); ctx.fill();
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
    // class weapon (player only — only shown after the starter weapon is picked up)
    const hasWeapon = gs.inventory.some(i => i.questComplete === 'quest_weapon_complete');
    if (isPlayer&&!ghost&&hasWeapon) drawWeapon(cx,cy,r,facing);
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
//  ENEMY AI
// ═══════════════════════════════════════════════════════
function updateEnemies(dt) {
    if (battle.active || ui.dialogue || ui.sign || ui.paused || ui.loading) return;
    if (!currentMap.enemies) return;
    for (const en of currentMap.enemies) {
        if (!en.alive) continue;
        en.moveTimer -= dt;
        if (en.moveTimer > 0) continue;

        const dx = player.x - en.x, dy = player.y - en.y;
        const dist = Math.abs(dx) + Math.abs(dy);

        // Aggro check
        en.aggroed = dist <= en.aggroRange;
        en.moveTimer = en.aggroed ? en.aggroSpeed : en.speed;

        if (!en.aggroed) continue;

        // Adjacent to player → start battle
        if (dist <= 1) { startBattle(en); return; }

        // Move one step toward player
        let mx = 0, my = 0;
        if (Math.abs(dx) >= Math.abs(dy)) mx = dx > 0 ? 1 : -1;
        else my = dy > 0 ? 1 : -1;
        const nx2 = en.x + mx, ny2 = en.y + my;
        if (nx2 >= 0 && nx2 < currentMap.w && ny2 >= 0 && ny2 < currentMap.h) {
            const tile = currentMap.tiles[ny2][nx2];
            const blocked = currentMap.enemies.some(e => e !== en && e.alive && e.x === nx2 && e.y === ny2);
            if (WALKABLE.has(tile) && !blocked) { en.x = nx2; en.y = ny2; }
        }
    }
}

function drawEnemyOverworld(sx, sy, en) {
    const cx = sx + TS/2, cy = sy + TS/2, r = TS * 0.3;
    const t = timeMs / 1000;
    // Aggro indicator: red glow pulsing when aggroed
    if (en.aggroed) {
        ctx.save();
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 12 + 6 * Math.sin(t * 6);
    }
    ctx.save();
    if (en.type === 'shade') {
        // Wispy cloud body — three overlapping dark circles
        const fl = Math.sin(t * 3.1 + en.x) * 2;
        ctx.globalAlpha = 0.88 + 0.12 * Math.sin(t * 2.2);
        ctx.fillStyle = '#1a0838';
        ctx.beginPath(); ctx.arc(cx, cy + fl, r * 1.1, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#2a0860';
        ctx.beginPath(); ctx.arc(cx - r*.3, cy - r*.2 + fl, r * .9, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + r*.3, cy + r*.1 + fl, r * .85, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3a1080';
        ctx.beginPath(); ctx.arc(cx, cy - r*.1 + fl, r * .7, 0, Math.PI*2); ctx.fill();
        // Glowing red eyes
        const ep = Math.sin(t * 4) * r * 0.08;
        ctx.fillStyle = '#ff1020'; ctx.shadowColor = '#ff1020'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(cx - r*.22, cy - r*.05 + fl + ep, r*.12, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + r*.22, cy - r*.05 + fl + ep, r*.12, 0, Math.PI*2); ctx.fill();
    } else {
        // Cave Lurker — squat rocky body
        ctx.fillStyle = '#2a1a10';
        ctx.beginPath(); ctx.ellipse(cx, cy + r*.2, r * 1.2, r * .85, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#5a3820';
        ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.05, r * .75, 0, 0, Math.PI*2); ctx.fill();
        // Rocky texture patches
        ctx.fillStyle = '#7a5030';
        ctx.fillRect(cx - r*.7, cy - r*.3, r*.4, r*.3);
        ctx.fillRect(cx + r*.2, cy + r*.05, r*.45, r*.25);
        ctx.fillStyle = '#483020';
        ctx.fillRect(cx - r*.15, cy - r*.5, r*.3, r*.22);
        // Three orange eyes in a row
        ctx.fillStyle = '#ff8010'; ctx.shadowColor = '#ff8010'; ctx.shadowBlur = 7;
        for (let i = -1; i <= 1; i++)
            ctx.beginPath(), ctx.arc(cx + i * r * .38, cy - r * .1, r * .13, 0, Math.PI*2), ctx.fill();
    }
    ctx.restore();
    if (en.aggroed) ctx.restore();

    // HP bar above enemy
    const bw = TS * .8, bh = 5, bx = sx + TS*.1, by = sy - 10;
    ctx.fillStyle = '#400000'; ctx.fillRect(bx, by, bw, bh);
    const maxHp = ENEMY_DEFS[en.type].hp;
    ctx.fillStyle = en.hp / maxHp > .5 ? '#40d040' : en.hp / maxHp > .25 ? '#d0a000' : '#d02020';
    ctx.fillRect(bx, by, bw * (en.hp / maxHp), bh);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
}

// ═══════════════════════════════════════════════════════
//  BATTLE SYSTEM
// ═══════════════════════════════════════════════════════
function getPlayerAtk() {
    return { Warrior:16, Rogue:13, Wizard:20, Cleric:11 }[gs.charClass] || 15;
}

function hasWeapon() {
    return gs.inventory.some(i => i.questComplete === 'quest_weapon_complete');
}

function startBattle(enemy) {
    battle.active   = true;
    battle.enemy    = enemy;
    battle.phase    = 'player_menu';
    battle.timer    = 0;
    battle.menuCursor = 0;
    battle.itemCursor = 0;
    battle.cursorPos = 0.1;
    battle.cursorDir = 1;
    battle.hitResult = '';
    battle.hitDmg   = 0;
    battle.playerDmgTaken = 0;
    battle.shakeTimer = 0;
    battle.message  = `A wild ${enemy.name} appeared!`;
    showNotification(`A ${enemy.name} appears!`, 'danger');
}

// ── Battle input handler ────────────────────────────────
function handleBattleInput(key) {
    if (!battle.active) return false;

    // Only accept input on interactive phases
    if (battle.phase === 'player_menu') {
        const MENU = ['FIGHT', 'ITEM', 'FLEE'];
        if (key === 'ArrowUp'   || key === 'w' || key === 'W') { battle.menuCursor = (battle.menuCursor + MENU.length - 1) % MENU.length; return true; }
        if (key === 'ArrowDown' || key === 's' || key === 'S') { battle.menuCursor = (battle.menuCursor + 1) % MENU.length; return true; }
        if (key === ' ' || key === 'Enter' || key === 'e' || key === 'E') {
            if (battle.menuCursor === 0) {      // FIGHT
                if (!hasWeapon()) {
                    battle.phase = 'no_weapon';
                    battle.timer = 1600;
                    battle.message = "You have no weapon! You can't fight!";
                } else {
                    battle.phase = 'player_timing';
                    battle.cursorPos = 0.1;
                    battle.cursorDir = 1;
                    battle.message = 'Strike at the right moment!';
                }
            } else if (battle.menuCursor === 1) { // ITEM
                if (gs.inventory.length === 0) {
                    battle.message = "Your pack is empty!";
                } else {
                    battle.phase = 'player_item';
                    battle.itemCursor = 0;
                    battle.message = 'Choose an item.';
                }
            } else {                            // FLEE
                battle.phase = 'flee_attempt';
                battle.timer = 900;
                battle.message = 'Getting away…';
            }
            return true;
        }
        return true;
    }

    if (battle.phase === 'player_item') {
        const items = gs.inventory;
        if (key === 'ArrowUp'   || key === 'w' || key === 'W') { battle.itemCursor = Math.max(0, battle.itemCursor - 1); return true; }
        if (key === 'ArrowDown' || key === 's' || key === 'S') { battle.itemCursor = Math.min(items.length - 1, battle.itemCursor + 1); return true; }
        if (key === 'Escape' || key === 'Backspace') {
            battle.phase = 'player_menu';
            battle.message = `A wild ${battle.enemy.name} appeared!`;
            return true;
        }
        if (key === ' ' || key === 'Enter' || key === 'e' || key === 'E') {
            const item = items[battle.itemCursor];
            if (!item) return true;
            if (item.questComplete === 'quest_weapon_complete') {
                battle.message = `${item.name} is already equipped!`;
                battle.phase = 'player_item_msg';
                battle.timer = 1100;
            } else if (item.healAmt) {
                // Consumable heal item
                const healed = Math.min(item.healAmt, gs.maxHp - gs.hp);
                gs.hp = Math.min(gs.maxHp, gs.hp + item.healAmt);
                gs.inventory.splice(battle.itemCursor, 1);
                battle.itemCursor = Math.min(battle.itemCursor, gs.inventory.length - 1);
                updateHPUI();
                battle.message = `Used ${item.name}! Restored ${healed} HP.`;
                battle.phase = 'player_item_use';
                battle.timer = 1400;
            } else {
                battle.message = `${item.name} can't be used in battle.`;
                battle.phase = 'player_item_msg';
                battle.timer = 1100;
            }
            return true;
        }
        return true;
    }

    if (battle.phase === 'player_timing') {
        if (key === ' ') { resolvePlayerAttack(); return true; }
        return true;
    }

    return true; // swallow all keys during other phases
}

function resolvePlayerAttack() {
    if (!battle.active || battle.phase !== 'player_timing') return;
    const p = battle.cursorPos;
    let mult = 0, result = 'MISS!';
    if      (p >= 0.44 && p <= 0.56) { mult = 1.6; result = 'CRITICAL!'; }
    else if ((p >= 0.32 && p < 0.44) || (p > 0.56 && p <= 0.68)) { mult = 1.0; result = 'HIT!'; }
    else if ((p >= 0.15 && p < 0.32) || (p > 0.68 && p <= 0.85)) { mult = 0.5; result = 'WEAK!'; }

    battle.hitDmg    = Math.round(getPlayerAtk() * mult);
    battle.hitResult = result;
    battle.phase     = 'player_result';
    battle.timer     = 1050;
    battle.message   = result === 'MISS!' ? 'Your attack missed!' :
                       result === 'WEAK!' ? 'A glancing blow...' :
                       result === 'HIT!'  ? 'A solid hit!' : 'CRITICAL HIT!';
}

function updateBattle(dt) {
    if (!battle.active) return;
    const en = battle.enemy;
    if (battle.shakeTimer > 0) battle.shakeTimer = Math.max(0, battle.shakeTimer - dt);

    if (battle.phase === 'player_timing') {
        const speed = en.type === 'shade' ? 1.45 : 0.88;
        battle.cursorPos += battle.cursorDir * speed * (dt / 1000);
        if (battle.cursorPos >= 1) { battle.cursorPos = 1; battle.cursorDir = -1; }
        if (battle.cursorPos <= 0) { battle.cursorPos = 0; battle.cursorDir = 1;  }

    } else if (battle.phase === 'player_result') {
        battle.timer -= dt;
        if (battle.timer <= 0) {
            en.hp -= battle.hitDmg;
            if (en.hp <= 0) {
                en.hp = 0; en.alive = false;
                battle.phase = 'victory'; battle.timer = 2200;
                battle.message = `${en.name} was defeated!`;
            } else {
                battle.phase = 'enemy_turn'; battle.timer = 1100;
                battle.message = `${en.name}'s turn…`;
            }
        }

    } else if (battle.phase === 'no_weapon') {
        battle.timer -= dt;
        if (battle.timer <= 0) {
            battle.phase = 'enemy_turn'; battle.timer = 1100;
            battle.message = `${en.name}'s turn…`;
        }

    } else if (battle.phase === 'player_item_use') {
        battle.timer -= dt;
        if (battle.timer <= 0) {
            battle.phase = 'enemy_turn'; battle.timer = 1100;
            battle.message = `${en.name}'s turn…`;
        }

    } else if (battle.phase === 'player_item_msg') {
        battle.timer -= dt;
        if (battle.timer <= 0) {
            battle.phase = 'player_item';
            battle.message = 'Choose an item.';
        }

    } else if (battle.phase === 'flee_attempt') {
        battle.timer -= dt;
        if (battle.timer <= 0) {
            // Flee success rate: fast enemies harder to escape
            const chance = en.type === 'shade' ? 0.55 : 0.82;
            if (Math.random() < chance) {
                battle.message = 'Got away safely!';
                battle.phase = 'flee_success'; battle.timer = 1200;
            } else {
                battle.message = `Can't escape from ${en.name}!`;
                battle.phase = 'enemy_turn'; battle.timer = 1100;
            }
        }

    } else if (battle.phase === 'flee_success') {
        battle.timer -= dt;
        if (battle.timer <= 0) endBattle('flee');

    } else if (battle.phase === 'enemy_turn') {
        battle.timer -= dt;
        if (battle.timer <= 0) {
            battle.playerDmgTaken = ENEMY_DEFS[en.type].atk;
            gs.hp = Math.max(0, gs.hp - battle.playerDmgTaken);
            updateHPUI();
            battle.shakeTimer = 500;
            battle.phase = 'enemy_result'; battle.timer = 1100;
            battle.message = `${en.name} attacked for ${battle.playerDmgTaken} damage!`;
        }

    } else if (battle.phase === 'enemy_result') {
        battle.timer -= dt;
        if (battle.timer <= 0) {
            if (gs.hp <= 0) {
                battle.phase = 'defeat'; battle.timer = 2400;
                battle.message = 'You were defeated…';
            } else {
                battle.phase = 'player_menu';
                battle.message = `What will ${gs.charName} do?`;
            }
        }

    } else if (battle.phase === 'victory') {
        battle.timer -= dt;
        if (battle.timer <= 0) endBattle('victory');

    } else if (battle.phase === 'defeat') {
        battle.timer -= dt;
        if (battle.timer <= 0) endBattle('defeat');
    }
}

function endBattle(outcome) {
    battle.active = false;
    if (outcome === 'victory') {
        const xp = ENEMY_DEFS[battle.enemy.type].xp;
        grantXP(xp);
        showNotification(`${battle.enemy.name} defeated! (+${xp} XP)`, 'quest');
    } else if (outcome === 'defeat') {
        gs.hp = Math.max(1, Math.floor(gs.maxHp * 0.2));
        updateHPUI();
        showNotification('You were defeated… Waking up in Eldoria.', 'danger');
        setTimeout(() => changeMap('village', 22, 32), 600);
    }
    // 'flee' just closes battle; no penalty, no XP
}

// ── Battle Rendering ────────────────────────────────────
function renderBattle() {
    if (!battle.active) return;
    const W = canvas.width, H = canvas.height, t = timeMs / 1000;
    const en = battle.enemy;

    // Player shake offset (on hit)
    const shakeAmt = battle.shakeTimer > 0 ? Math.sin(battle.shakeTimer * 0.08) * 5 : 0;

    // ── Background ─────────────────────────────────────
    ctx.fillStyle = '#080308'; ctx.fillRect(0, 0, W, H);
    const wallH = H * 0.52;
    // Cave wall
    ctx.fillStyle = '#120a10'; ctx.fillRect(0, 0, W, wallH);
    // Ground strip
    ctx.fillStyle = '#1e1018'; ctx.fillRect(0, wallH, W, H - wallH);
    ctx.fillStyle = '#2a1622'; ctx.fillRect(0, wallH, W, 3);
    // Stalactites
    ctx.fillStyle = '#0e080c';
    for (let i = 0; i < 7; i++) {
        const sx2 = W * 0.08 + i * W * 0.13;
        const sh  = H * (0.06 + (i % 3) * 0.04);
        ctx.beginPath(); ctx.moveTo(sx2 - W*.022, 0); ctx.lineTo(sx2 + W*.022, 0); ctx.lineTo(sx2, sh); ctx.closePath(); ctx.fill();
    }
    // Ground platform shadow lines
    ctx.strokeStyle = '#3a1a30'; ctx.lineWidth = 1;
    for (let y2 = wallH + 10; y2 < H; y2 += 20) {
        ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(W, y2); ctx.stroke();
    }

    // ── Enemy HP card (top-left) ────────────────────────
    const emaxhp = ENEMY_DEFS[en.type].hp;
    drawBattleCard(W * 0.04, H * 0.04, W * 0.38, 56, en.name, `Lv ${en.type === 'lurker' ? 8 : 3}`, en.hp, emaxhp, false);

    // ── Enemy sprite (top-right, with death fade) ──────
    const ESZ = Math.min(W * 0.28, H * 0.40);
    const ESX = W * 0.56, ESY = H * 0.03;
    if (en.alive || battle.phase === 'victory') {
        ctx.save();
        if (battle.phase === 'player_result' && battle.hitDmg > 0) {
            const frac = 1 - battle.timer / 1050;
            const flashAlpha = frac < 0.3 ? frac / 0.3 : frac < 0.6 ? 1 : (1 - frac) / 0.4;
            ctx.globalAlpha = Math.max(0.3, 1 - flashAlpha * 0.5);
        }
        drawBattleSprite(ESX, ESY, ESZ, en.type, t);
        ctx.restore();
    }

    // ── Player HP card (bottom, left of menu) ──────────
    const playerShakeX = shakeAmt;
    ctx.save(); ctx.translate(playerShakeX, 0);
    drawBattleCard(W * 0.04, wallH + H * 0.04, W * 0.40, 56, gs.charName, `Lv ${gs.level}`, gs.hp, gs.maxHp, true);
    // Player sprite (above card, bottom-left zone)
    const PSZ = Math.min(W * 0.18, H * 0.28);
    const PSX = W * 0.12, PSY = wallH - PSZ * 1.0;
    drawBattlePlayerSprite(PSX, PSY, PSZ);
    ctx.restore();

    // ── Bottom UI area ─────────────────────────────────
    const uiTop  = wallH + H * 0.01;
    const uiH    = H - uiTop;
    const msgW   = W * 0.48, menuW = W * 0.44;
    const msgX   = W * 0.04, menuX = W * 0.52;
    const boxH   = uiH * 0.86;
    const boxY   = uiTop + uiH * 0.08;

    // Full-width message box (victory/defeat only)
    if (battle.phase === 'victory' || battle.phase === 'defeat') {
        drawDialogueBox(W * 0.04, boxY, W * 0.92, boxH);
        ctx.font = `bold ${Math.floor(H * 0.09)}px 'Cinzel', serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (battle.phase === 'victory') {
            ctx.fillStyle = '#ffd040'; ctx.shadowColor = '#ffa000'; ctx.shadowBlur = 24;
            ctx.fillText('VICTORY!', W / 2, boxY + boxH * 0.38);
            ctx.shadowBlur = 0; ctx.font = `${Math.floor(H * 0.042)}px sans-serif`;
            ctx.fillStyle = '#c8e890';
            ctx.fillText(`${en.name} was defeated!`, W / 2, boxY + boxH * 0.62);
            ctx.font = `${Math.floor(H * 0.036)}px sans-serif`; ctx.fillStyle = '#c8922a';
            ctx.fillText(`+${ENEMY_DEFS[en.type].xp} XP`, W / 2, boxY + boxH * 0.80);
        } else {
            ctx.fillStyle = '#ff3030'; ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 24;
            ctx.fillText('DEFEATED', W / 2, boxY + boxH * 0.38);
            ctx.shadowBlur = 0; ctx.font = `${Math.floor(H * 0.038)}px sans-serif`;
            ctx.fillStyle = '#c0a0b0';
            ctx.fillText('Returning to Eldoria…', W / 2, boxY + boxH * 0.68);
        }
        ctx.shadowBlur = 0; ctx.textBaseline = 'alphabetic';
        return;
    }

    // ── Left: dialogue message box ─────────────────────
    drawDialogueBox(msgX, boxY, msgW, boxH);
    ctx.font = `${Math.floor(H * 0.038)}px 'IM Fell English', serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#e8d8c0';
    // Word-wrap message
    wrapTextInBox(battle.message, msgX + 18, boxY + 16, msgW - 36, Math.floor(H * 0.038), Math.floor(H * 0.046));

    // Damage pop-up on enemy (player_result)
    if (battle.phase === 'player_result' && battle.hitDmg > 0) {
        const colors = { 'CRITICAL!':'#ffd040', 'HIT!':'#90ff90', 'WEAK!':'#ff9040', 'MISS!':'#909090' };
        const col = colors[battle.hitResult] || '#fff';
        const pop = 1 - battle.timer / 1050;
        const py = ESY + ESZ * 0.3 - pop * H * 0.12;
        ctx.save(); ctx.globalAlpha = Math.min(1, (1 - pop) * 3);
        ctx.font = `bold ${Math.floor(H * 0.065)}px 'Cinzel', serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = col;
        ctx.shadowColor = col; ctx.shadowBlur = 18;
        ctx.fillText(battle.hitDmg > 0 ? `-${battle.hitDmg}` : 'MISS', ESX + ESZ / 2, py);
        ctx.shadowBlur = 0; ctx.restore();
    }
    // Damage pop-up on player (enemy_result)
    if (battle.phase === 'enemy_result') {
        const pop = 1 - battle.timer / 1100;
        const py = PSY + PSZ * 0.1 - pop * H * 0.10;
        ctx.save(); ctx.globalAlpha = Math.min(1, (1 - pop) * 3);
        ctx.font = `bold ${Math.floor(H * 0.060)}px 'Cinzel', serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#ff5050';
        ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 16;
        ctx.fillText(`-${battle.playerDmgTaken}`, PSX + PSZ / 2 + playerShakeX, py);
        ctx.shadowBlur = 0; ctx.restore();
    }

    // ── Right: action menu or timing bar ───────────────
    drawDialogueBox(menuX, boxY, menuW, boxH);

    if (battle.phase === 'player_menu') {
        drawBattleMenu(menuX, boxY, menuW, boxH);

    } else if (battle.phase === 'player_item') {
        drawBattleItemMenu(menuX, boxY, menuW, boxH);

    } else if (battle.phase === 'player_timing') {
        drawTimingBarInBox(menuX, boxY, menuW, boxH, en);

    } else {
        // Waiting phases — show an animated ellipsis
        ctx.font = `${Math.floor(H * 0.042)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#6a5040';
        const dots = '.'.repeat(1 + Math.floor((t * 2) % 3));
        ctx.fillText(dots, menuX + menuW / 2, boxY + boxH / 2);
    }

    ctx.shadowBlur = 0; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
}

function drawDialogueBox(x, y, w, h) {
    ctx.fillStyle = 'rgba(10,6,2,0.96)';
    ctx.strokeStyle = '#5a3820';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();
}

function wrapTextInBox(text, x, y, maxW, fontSize, lineH) {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, x, cy);
            line = word; cy += lineH;
        } else { line = test; }
    }
    if (line) ctx.fillText(line, x, cy);
}

function drawBattleCard(x, y, w, h, name, lvlText, hp, maxHp, showXp) {
    ctx.fillStyle = 'rgba(10,6,2,0.90)';
    ctx.strokeStyle = '#4a2818'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.fill(); ctx.stroke();

    const pad = 10, bh = 8;
    // Name + level
    ctx.font = `bold ${Math.floor(h * 0.30)}px 'Cinzel', serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#d4b896'; ctx.fillText(name, x + pad, y + pad);
    ctx.font = `${Math.floor(h * 0.22)}px sans-serif`;
    ctx.fillStyle = '#7a5a38'; ctx.fillText(lvlText, x + w - pad - ctx.measureText(lvlText).width, y + pad);

    // HP bar
    const barY = y + h * 0.55, barX = x + pad, barW = w - pad * 2;
    ctx.fillStyle = '#1a0a08'; ctx.fillRect(barX, barY, barW, bh);
    const pct = Math.max(0, hp / maxHp);
    const barCol = pct > 0.5 ? '#40c840' : pct > 0.25 ? '#c8a800' : '#c82020';
    ctx.fillStyle = barCol; ctx.fillRect(barX, barY, barW * pct, bh);
    ctx.strokeStyle = '#3a1a10'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, bh);

    ctx.font = `${Math.floor(h * 0.20)}px sans-serif`;
    ctx.textAlign = 'right'; ctx.fillStyle = '#8a6050';
    ctx.fillText(`${Math.ceil(hp)}/${maxHp}`, x + w - pad, barY + bh + 3);

    if (showXp) {
        const xpBarY = barY + bh + 14;
        ctx.fillStyle = '#0a0a10'; ctx.fillRect(barX, xpBarY, barW, 5);
        ctx.fillStyle = '#4060c0'; ctx.fillRect(barX, xpBarY, barW * xpProgressPct(), 5);
        ctx.strokeStyle = '#1a1a30'; ctx.lineWidth = 1; ctx.strokeRect(barX, xpBarY, barW, 5);
        ctx.font = `${Math.floor(h * 0.17)}px sans-serif`;
        ctx.textAlign = 'right'; ctx.fillStyle = '#4060a0';
        ctx.fillText(gs.level < MAX_LEVEL ? `XP: ${xpToNext()} to Lv${gs.level + 1}` : 'MAX', x + w - pad, xpBarY + 6);
    }
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
}

function drawBattleMenu(x, y, w, h) {
    const MENU = [
        { label:'⚔  FIGHT', sub:'Timing minigame', color:'#c8922a', warn: !hasWeapon() },
        { label:'🎒  ITEM',  sub:`${gs.inventory.length} item${gs.inventory.length !== 1 ? 's' : ''}`, color:'#5090d0' },
        { label:'💨  FLEE',  sub:'Try to escape',  color:'#40a060' },
    ];
    const rowH = h / MENU.length;
    MENU.forEach((opt, i) => {
        const ry = y + i * rowH;
        const selected = battle.menuCursor === i;
        if (selected) {
            ctx.fillStyle = 'rgba(200,146,42,0.10)';
            ctx.beginPath(); ctx.roundRect(x + 4, ry + 4, w - 8, rowH - 8, 4); ctx.fill();
            ctx.strokeStyle = '#c8922a'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(x + 4, ry + 4, w - 8, rowH - 8, 4); ctx.stroke();
        }
        // Cursor arrow
        ctx.font = `bold ${Math.floor(rowH * 0.42)}px sans-serif`;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const midY = ry + rowH / 2;
        ctx.fillStyle = selected ? '#c8922a' : 'transparent';
        ctx.fillText('▶', x + 14, midY);
        // Label
        ctx.fillStyle = opt.warn ? '#806040' : (selected ? '#e8c890' : opt.color);
        ctx.font = `bold ${Math.floor(rowH * 0.42)}px 'Cinzel', serif`;
        ctx.fillText(opt.label, x + 34, midY - rowH * 0.08);
        // Sub-text
        ctx.font = `${Math.floor(rowH * 0.28)}px sans-serif`;
        ctx.fillStyle = opt.warn ? '#a04020' : (selected ? '#8a7050' : '#4a3a28');
        ctx.fillText(opt.warn ? '⚠ No weapon equipped' : opt.sub, x + 34, midY + rowH * 0.22);
        // Divider
        if (i < MENU.length - 1) {
            ctx.strokeStyle = '#2a1808'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x + 12, ry + rowH); ctx.lineTo(x + w - 12, ry + rowH); ctx.stroke();
        }
    });
    ctx.textBaseline = 'alphabetic';
}

function drawBattleItemMenu(x, y, w, h) {
    const items = gs.inventory;
    if (items.length === 0) {
        ctx.font = `italic ${Math.floor(h * 0.14)}px 'IM Fell English', serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#7a5a40';
        ctx.fillText('Pack is empty.', x + w / 2, y + h / 2);
        ctx.textBaseline = 'alphabetic'; return;
    }
    const rowH = Math.min(h / Math.max(items.length, 1), h / 4);
    const pad = 12;
    items.forEach((item, i) => {
        const ry = y + i * rowH;
        const sel = battle.itemCursor === i;
        if (sel) {
            ctx.fillStyle = 'rgba(80,144,208,0.12)';
            ctx.beginPath(); ctx.roundRect(x + 4, ry + 3, w - 8, rowH - 6, 4); ctx.fill();
            ctx.strokeStyle = '#5090d0'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(x + 4, ry + 3, w - 8, rowH - 6, 4); ctx.stroke();
        }
        const midY = ry + rowH / 2;
        ctx.font = `${Math.floor(rowH * 0.48)}px sans-serif`;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = sel ? '#e8c890' : '#8a6840';
        ctx.fillText(sel ? '▶' : ' ', x + pad, midY);
        ctx.fillText(item.icon || '◆', x + pad + 20, midY);
        ctx.font = `${Math.floor(rowH * 0.36)}px 'Cinzel', serif`;
        ctx.fillStyle = item.questComplete ? '#c8922a' : (sel ? '#d4b896' : '#7a5a38');
        ctx.fillText(item.name, x + pad + 44, midY - rowH * 0.06);
        ctx.font = `${Math.floor(rowH * 0.26)}px sans-serif`;
        ctx.fillStyle = '#4a3828';
        const subText = item.healAmt ? `Restores ${item.healAmt} HP` : item.questComplete ? 'Equipped' : 'No battle use';
        ctx.fillText(subText, x + pad + 44, midY + rowH * 0.24);
    });
    // Back hint
    ctx.font = `${Math.floor(h * 0.09)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#3a2818';
    ctx.fillText('[Esc] Back', x + w / 2, y + h - 6);
    ctx.textBaseline = 'alphabetic';
}

function drawTimingBarInBox(x, y, w, h, en) {
    const pad = 16, bh = Math.floor(h * 0.18);
    const barY = y + h * 0.46, barX = x + pad, barW = w - pad * 2;

    // Zone fills — MISS(dark) | WEAK(orange) | HIT(yellow-green) | CRIT(bright green) | HIT | WEAK | MISS
    const zones = [
        {from:0,    to:0.15,  col:'#3a0e06'},
        {from:0.15, to:0.32,  col:'#7a3206'},
        {from:0.32, to:0.44,  col:'#7a7408'},
        {from:0.44, to:0.56,  col:'#0a7820'},
        {from:0.56, to:0.68,  col:'#7a7408'},
        {from:0.68, to:0.85,  col:'#7a3206'},
        {from:0.85, to:1.0,   col:'#3a0e06'},
    ];
    for (const z of zones) {
        ctx.fillStyle = z.col;
        ctx.fillRect(barX + barW * z.from, barY, barW * (z.to - z.from), bh);
    }
    // Zone labels inside bar
    ctx.font = `bold ${Math.floor(bh * 0.40)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('CRIT', barX + barW * 0.50, barY + bh / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText('HIT', barX + barW * 0.38, barY + bh / 2);
    ctx.fillText('HIT', barX + barW * 0.62, barY + bh / 2);
    // Border
    ctx.strokeStyle = '#6a4030'; ctx.lineWidth = 1.5; ctx.strokeRect(barX, barY, barW, bh);

    // Cursor
    const cx2 = barX + barW * battle.cursorPos;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(cx2, barY - 7); ctx.lineTo(cx2 - 6, barY - 15); ctx.lineTo(cx2 + 6, barY - 15); ctx.closePath(); ctx.fill();
    ctx.fillRect(cx2 - 3, barY, 6, bh);
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(cx2, barY + bh / 2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Label above bar
    ctx.font = `bold ${Math.floor(h * 0.13)}px 'Cinzel', serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#c8922a';
    ctx.fillText('STRIKE!', x + w / 2, y + h * 0.10);
    ctx.font = `${Math.floor(h * 0.09)}px sans-serif`;
    ctx.fillStyle = '#6a5040';
    ctx.fillText('Press SPACE at the right moment', x + w / 2, y + h * 0.25);

    // Speed label
    const speedLabel = en.type === 'shade' ? '⚡ Fast' : '🐢 Slow';
    ctx.font = `${Math.floor(h * 0.09)}px sans-serif`;
    ctx.fillStyle = en.type === 'shade' ? '#c85050' : '#508050';
    ctx.fillText(speedLabel, x + w / 2, y + h * 0.80);
    ctx.textBaseline = 'alphabetic';
}

function drawBattleSprite(sx, sy, sz, type, t) {
    const cx = sx + sz/2, cy = sy + sz * 0.5;
    ctx.save();
    if (type === 'shade') {
        // Large wispy shade — multiple dark lobes
        const fl = Math.sin(t * 2.4) * sz * 0.04;
        ctx.fillStyle = '#0a021a';
        ctx.beginPath(); ctx.arc(cx, cy + fl, sz * .42, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#150535';
        ctx.beginPath(); ctx.arc(cx - sz*.18, cy - sz*.12 + fl, sz*.36, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + sz*.18, cy + sz*.04 + fl, sz*.34, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#220a50';
        ctx.beginPath(); ctx.arc(cx, cy - sz*.06 + fl, sz*.30, 0, Math.PI*2); ctx.fill();
        // Tendrils dripping down
        ctx.fillStyle = '#0d0220';
        for (let i = 0; i < 4; i++) {
            const tx2 = cx + (i - 1.5) * sz * .18;
            const th = sz * (0.18 + Math.sin(t*1.8 + i) * 0.06);
            ctx.beginPath(); ctx.ellipse(tx2, cy + sz*.3 + th/2, sz*.045, th/2, 0, 0, Math.PI*2); ctx.fill();
        }
        // Glowing red eyes
        ctx.shadowColor = '#ff0010'; ctx.shadowBlur = sz * .12;
        ctx.fillStyle = '#ff1020';
        ctx.beginPath(); ctx.arc(cx - sz*.10, cy - sz*.06 + fl, sz*.07, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + sz*.10, cy - sz*.06 + fl, sz*.07, 0, Math.PI*2); ctx.fill();
        // Bright inner eye
        ctx.fillStyle = '#ff9090'; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(cx - sz*.10, cy - sz*.06 + fl, sz*.025, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + sz*.10, cy - sz*.06 + fl, sz*.025, 0, Math.PI*2); ctx.fill();

    } else {
        // Cave Lurker — large armored blob
        // Body shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(cx, cy + sz*.50, sz*.50, sz*.10, 0, 0, Math.PI*2); ctx.fill();
        // Main body
        ctx.fillStyle = '#1e0e08';
        ctx.beginPath(); ctx.ellipse(cx, cy, sz*.45, sz*.40, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4a2818';
        ctx.beginPath(); ctx.ellipse(cx, cy - sz*.03, sz*.40, sz*.35, 0, 0, Math.PI*2); ctx.fill();
        // Rock armor plating
        const plates = [
            {ox:-0.22,oy:-0.18,w:.22,h:.17},
            {ox: 0.05,oy:-0.26,w:.26,h:.15},
            {ox: 0.18,oy:-0.06,w:.20,h:.18},
            {ox:-0.10,oy: 0.08,w:.24,h:.16},
            {ox: 0.10,oy: 0.15,w:.18,h:.14},
        ];
        for (const pl of plates) {
            ctx.fillStyle = '#6a3c20';
            ctx.beginPath();
            ctx.ellipse(cx + pl.ox*sz, cy + pl.oy*sz, pl.w*sz, pl.h*sz, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#8a5030';
            ctx.beginPath();
            ctx.ellipse(cx + pl.ox*sz - sz*.01, cy + pl.oy*sz - sz*.015, pl.w*sz*.65, pl.h*sz*.55, 0, 0, Math.PI*2);
            ctx.fill();
        }
        // Three glowing orange eyes
        ctx.shadowColor = '#ff8010'; ctx.shadowBlur = sz * .10;
        ctx.fillStyle = '#ff8010';
        const eyeY = cy - sz * .07;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.arc(cx + i*sz*.18, eyeY, sz*.065, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#ffdd80'; ctx.shadowBlur = 0;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.arc(cx + i*sz*.18, eyeY, sz*.022, 0, Math.PI*2); ctx.fill();
        }
        // Claws at bottom
        ctx.fillStyle = '#2a1208';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i*sz*.20 - sz*.05, cy + sz*.30);
            ctx.lineTo(cx + i*sz*.20, cy + sz*.48);
            ctx.lineTo(cx + i*sz*.20 + sz*.05, cy + sz*.30);
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawBattlePlayerSprite(sx, sy, sz) {
    // Small player silhouette for battle scene (back-facing, slightly simplified)
    const cx = sx + sz/2, cy = sy + sz/2;
    const col = CLASS_COLORS[gs.charClass] || CLASS_COLORS.Warrior;
    const cloak = CLASS_CLOAK[gs.charClass] || '#4a2810';
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cx, cy + sz*.40, sz*.30, sz*.07, 0, 0, Math.PI*2); ctx.fill();
    // Cloak / body
    ctx.fillStyle = cloak;
    ctx.beginPath(); ctx.arc(cx, cy + sz*.05, sz*.38, 0, Math.PI*2); ctx.fill();
    // Body
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(cx, cy, sz*.32, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    // Head (facing up — back to camera)
    ctx.fillStyle = '#e8cfa0';
    ctx.beginPath(); ctx.arc(cx, cy - sz*.28, sz*.17, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke();
    // Hair/hood
    ctx.fillStyle = cloak;
    ctx.beginPath(); ctx.arc(cx, cy - sz*.32, sz*.16, Math.PI, Math.PI*2); ctx.fill();
    // Weapon visible on side
    const hasWeapon2 = gs.inventory.some(i => i.questComplete === 'quest_weapon_complete');
    if (hasWeapon2) {
        ctx.fillStyle = '#a0a8d0'; ctx.strokeStyle = '#606080'; ctx.lineWidth = 2;
        ctx.save(); ctx.translate(cx + sz*.25, cy - sz*.12); ctx.rotate(-0.3);
        ctx.fillRect(-sz*.04, -sz*.30, sz*.07, sz*.42); // blade
        ctx.fillStyle = '#6a3010'; ctx.fillRect(-sz*.06, sz*.05, sz*.11, sz*.08); // guard
        ctx.restore();
    }
    ctx.restore();
}


function updateHPUI() {
    const fill = document.getElementById('hp-fill');
    const text = document.getElementById('hp-text');
    if (fill) {
        const pct = Math.max(0, gs.hp / gs.maxHp);
        fill.style.width = `${pct * 100}%`;
        if (pct > 0.60) {
            fill.style.background = 'linear-gradient(to right, #208820, #40c040)';
        } else if (pct > 0.30) {
            fill.style.background = 'linear-gradient(to right, #c07010, #e0a020)';
        } else {
            fill.style.background = 'linear-gradient(to right, #c02020, #e04040)';
        }
    }
    if (text) text.textContent = `${Math.ceil(gs.hp)}/${gs.maxHp}`;
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (currentMap.dark) { ctx.fillStyle='#080408'; ctx.fillRect(0,0,canvas.width,canvas.height); }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const stx=Math.max(0,Math.floor(cam.x/TS)), sty=Math.max(0,Math.floor(cam.y/TS));
    const etx=Math.min(currentMap.w-1,Math.ceil((cam.x+canvas.width)/TS));
    const ety=Math.min(currentMap.h-1,Math.ceil((cam.y+canvas.height)/TS));
    for (let ty=sty;ty<=ety;ty++)
        for (let tx=stx;tx<=etx;tx++)
            drawTile(currentMap.tiles[ty][tx],tx*TS-cam.x,ty*TS-cam.y,tx,ty);

    for (const item of currentMap.items) {
        if (!itemVisible(item)) continue;
        const sx=item.x*TS-cam.x, sy=item.y*TS-cam.y;
        if (sx>-TS&&sx<canvas.width+TS&&sy>-TS&&sy<canvas.height+TS) drawItem(item,sx,sy);
    }
    for (const npc of currentMap.npcs) {
        const sx=npc.x*TS-cam.x, sy=npc.y*TS-cam.y;
        if (sx>-TS*2&&sx<canvas.width+TS&&sy>-TS*2&&sy<canvas.height+TS)
            drawCharacter(sx,sy,npc.color,'down',npc.name,false,isAdjacent(npc.x,npc.y),npc.ghost);
    }
    // Draw overworld enemies
    if (currentMap.enemies) {
        for (const en of currentMap.enemies) {
            if (!en.alive) continue;
            const sx=en.x*TS-cam.x, sy=en.y*TS-cam.y;
            if (sx>-TS*2&&sx<canvas.width+TS*2&&sy>-TS*2&&sy<canvas.height+TS*2)
                drawEnemyOverworld(sx, sy, en);
        }
    }
    drawCharacter(player.renderX-cam.x, player.renderY-cam.y,
        CLASS_COLORS[gs.charClass]||CLASS_COLORS.Warrior,
        player.facing,'',true,false,false,player.walkPhase,player.isMoving);

    renderParticles();  // ambient particles (fireflies, dust, sparks, leaves)
    renderLighting();   // dynamic darkness + torch light + warm color bleed
    renderVignette();   // corner vignette in interiors
    if (battle.active) renderBattle();
    else updateHintBar();
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
        if (tile===TILE.STAIRS) {
            const noWeapon = !gs.inventory.some(i => i.questComplete === 'quest_weapon_complete');
            hint = noWeapon
                ? '⚠ No weapon equipped — the mines are dangerous! (Press E to descend anyway)'
                : 'Press E to descend into the Cursed Mines';
            break;
        }
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
function itemVisible(item) {
    return !item.questRequired || !!gs.flags[item.questRequired];
}

function checkItemPickup() {
    const items=currentMap.items;
    for(let i=items.length-1;i>=0;i--){
        if(!itemVisible(items[i])) continue;
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
    const dlgText=document.getElementById('dlg-text');
    dlgText.textContent='Thinking…';
    dlgText.classList.add('dlg-loading');
    document.getElementById('dlg-player-msg').textContent='';
    _dlgSetInputEnabled(false);
    box.classList.remove('hidden');
    const data=await callInteract(npc,'',npc.history);
    npc.history=data.history;
    ui.dialogue=npc; ui.loading=false;
    showDialogueData(data);
    _dlgFocus();
}

async function sendDialogueMessage() {
    if(ui.loading||!ui.dialogue)return;
    const input=document.getElementById('dlg-input');
    const text=input.value.trim();
    if(!text)return;
    input.value='';
    const npc=ui.dialogue;
    ui.loading=true;
    document.getElementById('dlg-player-msg').textContent=`You: "${text}"`;
    const dlgText2=document.getElementById('dlg-text');
    dlgText2.textContent='Thinking…';
    dlgText2.classList.add('dlg-loading');
    _dlgSetInputEnabled(false);
    const data=await callInteract(npc,text,npc.history);
    npc.history=data.history;
    ui.loading=false;
    // Grant quest only when LLM explicitly signals it
    if(data.quest_given){
        const flag=QUEST_GIVER_FLAGS[npc.id];
        if(flag&&!gs.flags[flag]){
            gs.flags[flag]=true;
            const q=QUESTS.find(q=>q.flag_given===flag);
            if(q) showNotification(`New Quest: ${q.title}`,'quest');
            updateQuestUI();
        }
    }
    if(data.ended){closeDialogue();return;}
    showDialogueData(data);
    _dlgFocus();
}

async function callInteract(npc,playerText,history) {
    const res=await fetch('/interact',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({npc:{name:npc.name,role:npc.role,id:npc.id},playerText,history,flags:gs.flags})});
    return res.json();
}

function showDialogueData(data) {
    const el=document.getElementById('dlg-text');
    el.textContent=data.dialogue;
    el.classList.remove('dlg-loading');
    _dlgSetInputEnabled(true);
}

function _dlgSetInputEnabled(on) {
    const inp=document.getElementById('dlg-input');
    const btn=document.getElementById('dlg-send');
    if(inp) inp.disabled=!on;
    if(btn) btn.disabled=!on;
}

function _dlgFocus() {
    setTimeout(()=>document.getElementById('dlg-input')?.focus(),50);
}

function closeDialogue() {
    // Quest is granted via LLM signal, NOT automatically on close
    ui.dialogue=null; ui.loading=false;
    document.getElementById('dialogue-box').classList.add('hidden');
    document.getElementById('dlg-player-msg').textContent='';
    const inp=document.getElementById('dlg-input');
    if(inp){inp.value='';inp.disabled=false;}
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
    // Refresh the full inventory screen if it's open
    if (ui.inventory) renderInventoryScreen();
}

// ─ Full Inventory / Character Screen ───────────────────
let _selectedItem = null;

const CLASS_STATS = {
    Warrior: { atk:16, def:8,  spd:'Normal' },
    Rogue:   { atk:13, def:5,  spd:'Fast'   },
    Wizard:  { atk:20, def:3,  spd:'Slow'   },
    Cleric:  { atk:11, def:10, spd:'Normal' },
};
const CLASS_ICONS = { Warrior:'⚔️', Rogue:'🗡️', Wizard:'🪄', Cleric:'🔱' };

function toggleInventory() {
    if (ui.inventory) closeInventory();
    else openInventory();
}

function openInventory() {
    if (battle.active || ui.dialogue || ui.sign || ui.paused) return;
    ui.inventory = true;
    closeQuestLog();
    _selectedItem = null;
    renderInventoryScreen();
    document.getElementById('inventory-screen').classList.remove('hidden');
}

function closeInventory() {
    ui.inventory = false;
    _selectedItem = null;
    document.getElementById('inventory-screen').classList.add('hidden');
}

function renderInventoryScreen() {
    const stats = CLASS_STATS[gs.charClass] || CLASS_STATS.Warrior;

    // ── Character panel ────────────────────────────────
    document.getElementById('inv-char-portrait').textContent = CLASS_ICONS[gs.charClass] || '🧑';
    document.getElementById('inv-char-name').textContent = gs.charName;
    document.getElementById('inv-char-class').textContent = gs.charClass.toUpperCase();
    document.getElementById('inv-level-badge').textContent = `Lv ${gs.level}`;

    // HP bar
    const hpPct = Math.max(0, gs.hp / gs.maxHp);
    document.getElementById('inv-hp-fill').style.width = `${hpPct * 100}%`;
    document.getElementById('inv-hp-val').textContent = `${Math.ceil(gs.hp)}/${gs.maxHp}`;

    // XP bar
    const xpPct = gs.level >= MAX_LEVEL ? 1 : xpProgressPct();
    document.getElementById('inv-xp-fill').style.width = `${xpPct * 100}%`;
    const nextXP = gs.level >= MAX_LEVEL ? '—' : xpToNext() + ' XP';
    document.getElementById('inv-xp-val').textContent = gs.level >= MAX_LEVEL ? 'MAX' : `${gs.xp - xpForLevel(gs.level)} / ${xpForLevel(gs.level+1) - xpForLevel(gs.level)}`;

    // Stats (scale slightly with level)
    const lvlBonus = gs.level - 1;
    document.getElementById('inv-atk-val').textContent = stats.atk + lvlBonus * 2;
    document.getElementById('inv-def-val').textContent = stats.def + lvlBonus;
    document.getElementById('inv-spd-val').textContent = stats.spd;
    document.getElementById('inv-next-val').textContent = gs.level >= MAX_LEVEL ? 'MAX LEVEL' : nextXP;

    // Equipped weapon
    const weapon = gs.inventory.find(i => i.questComplete === 'quest_weapon_complete');
    if (weapon) {
        document.getElementById('inv-equipped-icon').textContent = weapon.icon || '⚔️';
        document.getElementById('inv-equipped-name').textContent = weapon.name;
    } else {
        document.getElementById('inv-equipped-icon').textContent = '—';
        document.getElementById('inv-equipped-name').textContent = 'Nothing equipped';
    }

    // ── Item grid ─────────────────────────────────────
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';

    const GRID_SIZE = 20; // always show 20 slots
    const emptyMsg = document.getElementById('inv-empty-msg');
    emptyMsg.style.display = gs.inventory.length === 0 ? 'block' : 'none';

    for (let i = 0; i < GRID_SIZE; i++) {
        const slot = document.createElement('div');
        const item = gs.inventory[i];
        if (item) {
            slot.className = 'inv-slot' + (_selectedItem === item ? ' selected' : '');
            slot.innerHTML = `<div class="slot-icon">${item.icon || '◆'}</div><div class="slot-name">${item.name}</div>`;
            // Quest badge if it's a quest item
            if (item.questComplete) {
                const badge = document.createElement('div');
                badge.className = 'slot-quest-badge';
                badge.title = 'Quest Item';
                slot.appendChild(badge);
            }
            slot.addEventListener('click', () => selectItem(item));
        } else {
            slot.className = 'inv-slot empty-slot';
        }
        grid.appendChild(slot);
    }

    // ── Item detail panel ──────────────────────────────
    renderItemDetail();
}

function selectItem(item) {
    _selectedItem = _selectedItem === item ? null : item;
    renderInventoryScreen();
}

function renderItemDetail() {
    const detail = document.getElementById('inv-item-detail');
    if (!_selectedItem) { detail.classList.add('hidden'); return; }
    detail.classList.remove('hidden');
    document.getElementById('inv-detail-icon').textContent = _selectedItem.icon || '◆';
    document.getElementById('inv-detail-name').textContent = _selectedItem.name;
    document.getElementById('inv-detail-desc').textContent = _selectedItem.desc || 'A mysterious item.';
    const useBtn = document.getElementById('inv-use-btn');
    // Only consumables (not quest weapons) can be "used" — for now, just inspect
    useBtn.textContent = _selectedItem.questComplete ? 'Equipped' : 'Examine';
    useBtn.disabled = false;
}

function useSelectedItem() {
    if (!_selectedItem) return;
    if (_selectedItem.questComplete) {
        showNotification(`${_selectedItem.name} — equipped.`, 'info');
    } else {
        showNotification(`${_selectedItem.name}: ${_selectedItem.desc || 'Nothing happens.'}`, 'info');
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
    masterGain=audioCtx.createGain();masterGain.gain.value=((window.gameVolumePct??50)/100)*0.25;
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
    // Sync pause slider to shared volume preference
    const vol = window.gameVolumePct ?? 50;
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

// Wire up pause slider — delegates to syncVolSliders so menu slider stays in sync too
document.getElementById('pause-vol').addEventListener('input', function() {
    _updateSliderFill(this);
    if (typeof syncVolSliders === 'function') syncVolSliders(+this.value);
    else if (masterGain) masterGain.gain.value = (this.value / 100) * 0.25;
});

// Resume button
document.getElementById('pause-resume').addEventListener('click', closePause);

// Fullscreen button
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}

function updateFullscreenLabel() {
    const inFS = !!document.fullscreenElement;
    const pauseBtn = document.getElementById('pause-fullscreen');
    if (pauseBtn) pauseBtn.textContent = inFS ? '✕ Exit Fullscreen' : '⛶ Fullscreen';
    // also update the main menu options button if it exists
    if (typeof window['updateOptFullscreenLabel'] === 'function') window['updateOptFullscreenLabel']();
}

document.getElementById('pause-fullscreen').addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenLabel);

// F11 shortcut toggles fullscreen from anywhere in-game
document.addEventListener('keydown', e => {
    if (e.key === 'F11') { e.preventDefault(); toggleFullscreen(); }
}, true);

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
    updateMovement(dt);updatePlayerAnim(dt);updateCamera();
    updateEnemies(dt);updateBattle(dt);
    updateParticles(dt);render();
    requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════
// ── Starter weapon placement ────────────────────────────
const STARTER_WEAPONS = {
    Warrior: { name:'Iron Sword',    icon:'⚔️',  color:'#b0b8e8', desc:'A well-worn iron sword. Still sharp.' },
    Rogue:   { name:'Shadow Dagger', icon:'🗡️',  color:'#80c0d8', desc:'Light, quick, and quiet.'             },
    Wizard:  { name:'Arcane Staff',  icon:'🪄',  color:'#c090e8', desc:'Hums faintly with old magic.'         },
    Cleric:  { name:'Holy Mace',     icon:'🔱',  color:'#e8c060', desc:'Blessed by the Old Gods.'             },
};

function placeStarterWeapon(charClass) {
    const weapon = { ...STARTER_WEAPONS[charClass] || STARTER_WEAPONS.Warrior,
                     questRequired:'quest_weapon_given',
                     questComplete:'quest_weapon_complete' };
    const sx = currentMap.playerStart.x, sy = currentMap.playerStart.y;
    const walkable = new Set([TILE.GRASS, TILE.PATH]);
    // Try random positions in a ring of radius 4–10 around start
    for (let attempt = 0; attempt < 60; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = 4 + Math.floor(Math.random() * 7);
        const tx = Math.round(sx + Math.cos(angle) * dist);
        const ty = Math.round(sy + Math.sin(angle) * dist);
        if (tx<1||ty<1||tx>=currentMap.w-1||ty>=currentMap.h-1) continue;
        const tile = currentMap.tiles[ty]?.[tx];
        if (!walkable.has(tile)) continue;
        if (currentMap.npcs.some(n=>n.x===tx&&n.y===ty)) continue;
        if (currentMap.items.some(i=>i.x===tx&&i.y===ty)) continue;
        currentMap.items.push({ ...weapon, x:tx, y:ty });
        return;
    }
    // Fallback: place south of player on path
    currentMap.items.push({ ...weapon, x:sx, y:sy+5 });
}

// ── Intro cinematic sequence ────────────────────────────
function playIntroSequence() {
    const ov = document.getElementById('intro-overlay');
    const lines = [
        'You open your eyes…',
        'Eldoria.\nA village clinging to the edge of darkness.',
        'Someone is calling your name.',
    ];
    let i = 0;
    const txt = document.getElementById('intro-text');
    ov.style.opacity = '1';
    ov.classList.remove('hidden');

    function showLine() {
        if (i >= lines.length) {
            // Fade out intro overlay → game becomes fully visible
            ov.style.transition = 'opacity 1.2s ease';
            ov.style.opacity = '0';
            setTimeout(() => { ov.classList.add('hidden'); }, 1250);
            return;
        }
        txt.style.opacity = '0';
        txt.textContent = lines[i];
        // Small pause then fade in text
        setTimeout(() => {
            txt.style.transition = 'opacity 0.7s ease';
            txt.style.opacity = '1';
        }, 100);
        // Hold then fade out
        setTimeout(() => {
            txt.style.transition = 'opacity 0.5s ease';
            txt.style.opacity = '0';
        }, 1900);
        setTimeout(() => { i++; showLine(); }, 2500);
    }
    showLine();
}

function startGame(name,charClass) {
    gs.charName=name;gs.charClass=charClass;gs.flags={};gs.inventory=[];
    const classMaxHp={Warrior:60,Rogue:45,Wizard:35,Cleric:55};
    gs.maxHp=classMaxHp[charClass]||50; gs.hp=gs.maxHp;
    gs.xp=0; gs.level=1;
    currentMap=MAPS.village;
    [...VILLAGE_NPCS,...GUIDE_NPCS,...DUNGEON_NPCS,...ELDER_NPCS,...BLACKSMITH_NPCS,...VEYLA_NPCS].forEach(n=>n.history=[]);
    MAPS.village.items=[];
    rebuildDungeon(); // fresh procedurally generated mine every new game
    placeStarterWeapon(charClass);
    player.x=currentMap.playerStart.x; player.y=currentMap.playerStart.y; player.facing='down';
    player.renderX=player.x*TS; player.renderY=player.y*TS;
    player.prevX=player.renderX; player.prevY=player.renderY;
    player.moveT=1; player.isMoving=false; player.walkPhase=0;
    ui.dialogue=null;ui.sign=null;ui.questLog=false;ui.loading=false;ui.paused=false;ui.inventory=false;
    _pauseEl().classList.add('hidden');
    resizeCanvas();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('hud-name').textContent=name;
    document.getElementById('hud-class').textContent=charClass;
    document.getElementById('hud-location').textContent=currentMap.name;
    updateQuestUI();updateInventoryUI();updateHPUI();
    startMusic();
    requestAnimationFrame(loop);
    // Black intro sequence — fades out after the cinematic lines
    if (typeof fadeOverlay === 'function') fadeOverlay('out');
    playIntroSequence();
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
