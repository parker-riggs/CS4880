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
    const house = (x1,y1,x2,y2) => { fill(x1,y1,x2,y2,W); fill(x1+1,y1+1,x2-1,y2-1,F); };

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

    // A: Elder's Hall — 10×10, two-chamber with council room
    house(2,2, 11,11);
    for (let x=3;x<=10;x++) s(x,6,W);   // divider wall
    s(6,6,DR); s(7,6,DR);               // interior arch
    s(6,11,DR); s(7,11,DR);             // south entrance

    // B: Merchant House — 7×8
    house(24,2, 30,9);
    s(26,9,DR); s(27,9,DR);             // south entrance

    // C: Blacksmith — 11×10 with forge partition
    house(33,2, 43,11);
    for (let y=3;y<=10;y++) s(39,y,W);  // forge partition at x=39
    s(39,6,DR); s(39,7,DR);             // forge door
    s(36,11,DR); s(37,11,DR);           // south entrance

    // D: Tavern — 11×9 with bar divider
    house(2,19, 12,27);
    for (let x=3;x<=11;x++) s(x,23,W); // bar wall
    s(6,23,DR); s(7,23,DR);             // bar passage
    s(6,19,DR); s(7,19,DR);             // north entrance (faces E–W road gap at y=18)
    s(5,27,DR); s(6,27,DR);             // south exit

    // E: Market Hall — 13×9
    house(24,19, 36,27);
    s(24,22,DR); s(24,23,DR);           // west entrance (faces N–S road at x=22)
    s(29,27,DR); s(30,27,DR);           // south passage toward chapel

    // F: Small Cottage — 8×6
    house(2,29, 9,34);
    s(9,31,DR); s(9,32,DR);             // east entrance

    // G: Chapel — 10×6 with altar alcove
    house(27,29, 36,34);
    s(30,29,DR); s(31,29,DR);           // north entrance
    s(28,30,W); s(29,30,W);             // altar flanking left
    s(34,30,W); s(35,30,W);             // altar flanking right
    s(31,30,SG); s(32,30,SG);           // altar plaque (sign tile)

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

// ═══════════════════════════════════════════════════════
//  WORLD ENTITY DATA
// ═══════════════════════════════════════════════════════
const VILLAGE_NPCS = [
    { id:'elder', name:'Elder Maren', x:6, y:8, portrait:'👴', color:'#d0c870', history:[],
      role:'The elderly leader of Eldoria. Wise but frightened — darkness spreads from the Cursed Mines to the south. He desperately needs someone to investigate. He will explicitly ask the player to enter the mines, promising a reward. If the player has entered the mines (quest_into_dark_complete=true), he reacts with relief and asks what they found.' },
    { id:'blacksmith', name:'Daran', x:37, y:6, portrait:'🔨', color:'#d07040', history:[],
      role:'The village blacksmith. Gruff, grieving. His brother Henrick went into the mines 3 months ago and never returned. He will ask the player to look for any sign of Henrick. If quest_brothers_fate_complete=true (Henrick\'s ring found), he breaks down and thanks the player, and says at least now he knows.' },
    { id:'traveler', name:'Veyla', x:41, y:22, portrait:'🧝', color:'#70a0e0', history:[],
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
    changeMap('village', 22, 32);
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
        case TILE.SIGN:     dark?drawFloor(px,py,true):drawGrass(px,py,tx,ty);
                            drawSignPost(px,py);         break;
        case TILE.TORCH:    drawTorch(px,py);            break;
        default: ctx.fillStyle='#000'; ctx.fillRect(px,py,TS,TS);
    }
}

function drawGrass(px, py, tx, ty) {
    const s = tx*7+ty*13;
    const shades = ['#2d5a1b','#305e1e','#2a5618','#326020','#2e5c1c','#2b5a1a','#306218'];
    ctx.fillStyle = shades[s % shades.length]; ctx.fillRect(px,py,TS,TS);
    if (s%4===0) { ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(px+TS*.08,py+TS*.08,TS*.42,TS*.38); }
    ctx.strokeStyle='#3a7022'; ctx.lineWidth=1.2;
    for (let i=0;i<5;i++) {
        const bx=px+3+((s*3+i*17)%(TS-6)), by=py+4+((s*7+i*13)%(TS-9));
        const lean=((s+i*3)%5-2)*2;
        ctx.beginPath(); ctx.moveTo(bx,by+6); ctx.lineTo(bx+lean,by); ctx.stroke();
    }
    if (s%11===0) {
        const fx=px+5+(s%(TS-10)), fy=py+5+((s*3)%(TS-10));
        ctx.fillStyle=(s%2===0)?'#e8d848':'#e87878';
        ctx.beginPath(); ctx.arc(fx,fy,2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#ffffa0'; ctx.beginPath(); ctx.arc(fx,fy,1,0,Math.PI*2); ctx.fill();
    }
}

function drawPath(px, py, tx, ty) {
    const s = tx*11+ty*7;
    ctx.fillStyle='#5e4610'; ctx.fillRect(px,py,TS,TS);
    const stones=[{rx:.06,ry:.06,rw:.42,rh:.44},{rx:.52,ry:.06,rw:.42,rh:.44},
                  {rx:.06,ry:.54,rw:.42,rh:.40},{rx:.52,ry:.54,rw:.42,rh:.40}];
    const cols=['#8a7040','#907848','#7a6030','#9a7848','#857038'];
    stones.forEach((st,i) => {
        const col=cols[(s+i*3)%cols.length];
        const sx=px+st.rx*TS, sy=py+st.ry*TS, sw=st.rw*TS, sh=st.rh*TS, r=TS*.04;
        ctx.fillStyle=col;
        ctx.beginPath();
        ctx.moveTo(sx+r,sy); ctx.lineTo(sx+sw-r,sy); ctx.quadraticCurveTo(sx+sw,sy,sx+sw,sy+r);
        ctx.lineTo(sx+sw,sy+sh-r); ctx.quadraticCurveTo(sx+sw,sy+sh,sx+sw-r,sy+sh);
        ctx.lineTo(sx+r,sy+sh); ctx.quadraticCurveTo(sx,sy+sh,sx,sy+sh-r);
        ctx.lineTo(sx,sy+r); ctx.quadraticCurveTo(sx,sy,sx+r,sy); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.14)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(sx+r,sy); ctx.lineTo(sx+sw-r,sy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx,sy+r); ctx.lineTo(sx,sy+sh*.5); ctx.stroke();
        ctx.strokeStyle='rgba(0,0,0,0.22)';
        ctx.beginPath(); ctx.moveTo(sx+sw-r,sy+sh); ctx.lineTo(sx+r,sy+sh); ctx.stroke();
    });
}

function drawFloor(px, py, dark) {
    ctx.fillStyle = dark ? '#131018' : '#2a2028'; ctx.fillRect(px,py,TS,TS);
    const bW=Math.round(TS/2), bH=Math.round(TS/2);
    const mortar = dark ? '#0a080d' : '#181018';
    const bCols = dark
        ? ['#1e1820','#1a141c','#22182a','#1c1420']
        : ['#342830','#2e2228','#38282e','#2c2028'];
    for (let row=0;row<2;row++) {
        const by=py+row*bH, shift=row%2===0?0:Math.round(TS/4);
        for (let col=0;col<3;col++) {
            const bx=px+col*bW-shift;
            const x1=Math.max(px,bx)+1, x2=Math.min(px+TS,bx+bW)-1;
            const y1=by+1, y2=by+bH-1; if (x2<=x1) continue;
            ctx.fillStyle=bCols[(row*3+col)%bCols.length]; ctx.fillRect(x1,y1,x2-x1,y2-y1);
            ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(x1,y1,x2-x1,1);
            if ((row+col)%3===0) {
                ctx.strokeStyle='rgba(0,0,0,0.16)'; ctx.lineWidth=.5;
                ctx.beginPath(); ctx.moveTo(x1+(x2-x1)*.25,y1+(y2-y1)*.3);
                ctx.lineTo(x1+(x2-x1)*.45,y1+(y2-y1)*.75); ctx.stroke();
            }
        }
        ctx.fillStyle=mortar; ctx.fillRect(px,by,TS,1);
        for (let col=1;col<3;col++) {
            const vx=px+col*bW-shift;
            if (vx>px&&vx<px+TS) { ctx.fillStyle=mortar; ctx.fillRect(vx,by,1,bH); }
        }
    }
}

function drawWall(px, py, dark) {
    ctx.fillStyle = dark ? '#100c10' : '#221818'; ctx.fillRect(px,py,TS,TS);
    const bW=Math.round(TS*.46), bH=Math.round(TS*.30);
    const mortar = dark ? '#080610' : '#120c0e';
    for (let row=0;row<5;row++) {
        const by=py+row*bH-Math.round(bH/2);
        if (by+bH<py||by>py+TS) continue;
        const offset=(row%2)*Math.round(bW/2);
        for (let col=-1;col<4;col++) {
            const bx=px+col*bW+offset; if (bx+bW<px||bx>px+TS) continue;
            const cx2=Math.max(px+1,bx+2), cy2=Math.max(py+1,by+2);
            const cw=Math.min(px+TS-1,bx+bW-1)-cx2, ch=Math.min(py+TS-1,by+bH-1)-cy2;
            if (cw<=0||ch<=0) continue;
            ctx.fillStyle=(row+col)%3===2?(dark?'#161018':'#281c1c'):(dark?'#1a1218':'#2e2020');
            ctx.fillRect(cx2,cy2,cw,ch);
            ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(cx2,cy2,cw,2);
            ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(cx2,cy2,2,ch);
            ctx.fillStyle='rgba(0,0,0,0.20)'; ctx.fillRect(cx2,cy2+ch-2,cw,2);
            ctx.fillStyle='rgba(0,0,0,0.14)'; ctx.fillRect(cx2+cw-2,cy2,2,ch);
        }
        ctx.fillStyle=mortar; ctx.fillRect(px,by,TS,2);
    }
}

function drawTree(px, py, tx, ty) {
    const s=tx*5+ty*9;
    ctx.fillStyle='#0d1804'; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#3a2010'; ctx.fillRect(px+TS*.43,py+TS*.52,TS*.14,TS*.48);
    ctx.fillStyle='#4a2a18'; ctx.fillRect(px+TS*.43,py+TS*.52,TS*.04,TS*.48);
    ctx.fillStyle='#3a2010'; ctx.fillRect(px+TS*.30,py+TS*.88,TS*.40,TS*.12);
    const layers=[{cy:.58,r:.38},{cy:.40,r:.30},{cy:.24,r:.20}];
    const baseC=['#1a4808','#22600e','#2a7014'];
    const hiC  =['#1e5c0a','#286a12','#347a1a'];
    layers.forEach((l,i) => {
        const lcx=px+TS*.5, lcy=py+TS*l.cy, lr=TS*l.r;
        for (let b=0;b<3;b++) {
            const a=(b/3)*Math.PI*2+(s*.4+i);
            ctx.fillStyle=baseC[i];
            ctx.beginPath(); ctx.arc(lcx+Math.cos(a)*lr*.65,lcy+Math.sin(a)*lr*.45,lr*.52,0,Math.PI*2); ctx.fill();
        }
        ctx.fillStyle=baseC[i]; ctx.beginPath(); ctx.arc(lcx,lcy,lr,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=hiC[i]; ctx.beginPath(); ctx.arc(lcx-lr*.22,lcy-lr*.22,lr*.62,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(140,210,70,0.18)'; ctx.beginPath(); ctx.arc(lcx-lr*.28,lcy-lr*.32,lr*.28,0,Math.PI*2); ctx.fill();
    });
}

function drawWater(px, py) {
    const t=timeMs/1000;
    const gr=ctx.createLinearGradient(px,py,px,py+TS);
    gr.addColorStop(0,'#122e42'); gr.addColorStop(1,'#081824');
    ctx.fillStyle=gr; ctx.fillRect(px,py,TS,TS);
    for (let i=0;i<3;i++) {
        const wy=py+(TS/4)*(i+1)+Math.sin(t*1.4+px*.04+i*1.2)*2.5;
        ctx.strokeStyle=`rgba(80,160,210,${0.28+0.14*Math.sin(t*1.8+i)})`; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(px+2,wy);
        ctx.bezierCurveTo(px+TS*.28,wy-2.5,px+TS*.72,wy+2.5,px+TS-2,wy); ctx.stroke();
    }
    ctx.fillStyle=`rgba(160,220,255,${(0.5+0.3*Math.sin(t*2.5+px*.1))*0.11})`;
    ctx.fillRect(px+TS*.1,py+TS*.14,TS*.18,TS*.06);
}

function drawDoor(px, py) {
    ctx.fillStyle='#2e2020'; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#221818';
    ctx.fillRect(px,py,TS*.14,TS); ctx.fillRect(px+TS*.86,py,TS*.14,TS);
    ctx.fillRect(px,py,TS,TS*.07);
    const plankH=TS*.88/3;
    const plankC=['#6a3c14','#5e3010','#723e16'];
    for (let i=0;i<3;i++) {
        ctx.fillStyle=plankC[i%3]; ctx.fillRect(px+TS*.15,py+TS*.07+i*plankH,TS*.70,plankH-2);
        ctx.strokeStyle='rgba(0,0,0,0.14)'; ctx.lineWidth=.7;
        for (let g=0;g<4;g++) {
            const gx=px+TS*.18+g*(TS*.16);
            ctx.beginPath(); ctx.moveTo(gx,py+TS*.08+i*plankH); ctx.lineTo(gx+1.5,py+TS*.07+(i+1)*plankH-2); ctx.stroke();
        }
        ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(px+TS*.15,py+TS*.07+i*plankH,TS*.70,2);
    }
    ctx.fillStyle='#2a2a2a';
    [.18,.62].forEach(hy => {
        ctx.fillRect(px+TS*.12,py+TS*hy,TS*.12,TS*.12);
        ctx.fillStyle='#404040'; ctx.fillRect(px+TS*.13,py+TS*hy+1,TS*.04,TS*.10);
        ctx.fillStyle='#2a2a2a';
    });
    ctx.fillStyle='#3a3a3a'; ctx.fillRect(px+TS*.74,py+TS*.40,TS*.06,TS*.20);
    ctx.fillStyle='#525252'; ctx.beginPath(); ctx.arc(px+TS*.77,py+TS*.44,TS*.036,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#181010'; ctx.beginPath(); ctx.arc(px+TS*.77,py+TS*.51,TS*.020,0,Math.PI*2); ctx.fill();
    ctx.fillRect(px+TS*.758,py+TS*.51,TS*.024,TS*.04);
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
    ctx.fillStyle='#523208'; ctx.fillRect(px+TS*.44,py+TS*.36,TS*.12,TS*.64);
    ctx.fillStyle='#623a10'; ctx.fillRect(px+TS*.44,py+TS*.36,TS*.03,TS*.64);
    ctx.fillStyle='#8a5820'; ctx.fillRect(px+TS*.10,py+TS*.05,TS*.80,TS*.34);
    ctx.fillStyle='#9a6828'; ctx.fillRect(px+TS*.10,py+TS*.05,TS*.80,3);
    ctx.fillRect(px+TS*.10,py+TS*.05,3,TS*.34);
    ctx.fillStyle='#5a3808'; ctx.fillRect(px+TS*.10,py+TS*.05+TS*.34-3,TS*.80,3);
    ctx.fillRect(px+TS*.10+TS*.80-3,py+TS*.05,3,TS*.34);
    ctx.fillStyle='#3a1a00';
    for (let i=0;i<2;i++) ctx.fillRect(px+TS*.18,py+TS*(.12+i*.11),TS*.64,2.5);
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
        if (tile===TILE.STAIRS)  { hint='Press E to descend'; break; }
        if (tile===TILE.STAIRSUP){ hint='Press E to ascend'; break; }
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
    [...VILLAGE_NPCS,...DUNGEON_NPCS].forEach(n=>n.history=[]);
    MAPS.dungeon_1.items=[...DUNGEON_ITEMS.map(i=>({...i}))];
    player.x=7;player.y=8;player.facing='down';
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
    const name=document.getElementById('char-name').value.trim()||'Hero';
    const charClass=document.querySelector('.class-card.selected')?.dataset.class||'Warrior';
    // Small delay so the overlay fade-in completes before we swap screens
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
