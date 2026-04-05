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
const VILLAGE_TILES = [
//   0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29
  [TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR],
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  W,  W, DR,  W,  G,  G,  G,  G,  G,  G,  W,  W, DR,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G, SG,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR],
  [TR, TR, TR, TR, TR,  P, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR],
  [TR, TR, TR, TR, TR, ST, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR],
];

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
    { id:'elder', name:'Elder Maren', x:4, y:5, portrait:'👴', color:'#d0c870', history:[],
      role:'The elderly leader of Eldoria. Wise but frightened — darkness spreads from the Cursed Mines to the south. He desperately needs someone to investigate. He will explicitly ask the player to enter the mines, promising a reward. If the player has entered the mines (quest_into_dark_complete=true), he reacts with relief and asks what they found.' },
    { id:'blacksmith', name:'Daran', x:15, y:4, portrait:'🔨', color:'#d07040', history:[],
      role:'The village blacksmith. Gruff, grieving. His brother Henrick went into the mines 3 months ago and never returned. He will ask the player to look for any sign of Henrick. If quest_brothers_fate_complete=true (Henrick\'s ring found), he breaks down and thanks the player, and says at least now he knows.' },
    { id:'traveler', name:'Veyla', x:22, y:10, portrait:'🧝', color:'#70a0e0', history:[],
      role:'A mysterious elven wanderer. Cryptic, testing. She knows an ancient sealed entity called the Hollow King lies in the mines. She will ask the player to find the ancient tablet that describes the seal. If quest_sealed_truth_complete=true, she reveals she is a Warden\'s descendant sent to reinforce the seal.' },
];

const VILLAGE_SIGNS = [
    { x:10, y:7, text:'— ELDORIA —\n\nFounded in the Year of the Third Moon.\nPopulation: 23.\n\n"May the Old Gods light your path."' },
    { x:5, y:21, text:'THE CURSED MINES\n\n"Turn back. Whatever you hear below,\ndo not answer it."\n\n— scratched into the stone by a shaking hand', type:'stairs' },
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
        id:'village', w:30, h:23,
        tiles: VILLAGE_TILES,
        npcs:  VILLAGE_NPCS,
        signs: VILLAGE_SIGNS,
        items: [],
        playerStart:{x:7,y:8},
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
const ui      = { dialogue:null, sign:null, loading:false, questLog:false };
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
    if (e.key === 'Escape') { closeDialogue(); closeSign(); closeQuestLog(); }
});
document.addEventListener('keyup', e => KEYS.delete(e.key));

let moveAccum = 999;

function updateMovement(dt) {
    if (ui.dialogue || ui.sign || ui.questLog || ui.loading) { JUST_PRESSED.clear(); return; }
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
    changeMap('village', 5, 20);
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
//  TILE RENDERING
// ═══════════════════════════════════════════════════════
function drawTile(tile, px, py, tx, ty) {
    const dark = currentMap.dark;
    switch (tile) {
        case TILE.GRASS:    drawGrass(px,py,tx,ty);       break;
        case TILE.PATH:     drawPath(px,py,tx,ty);        break;
        case TILE.FLOOR:    drawFloor(px,py,dark);        break;
        case TILE.WALL:     drawWall(px,py,dark);         break;
        case TILE.TREE:     drawTree(px,py,tx,ty);        break;
        case TILE.WATER:    drawWater(px,py);             break;
        case TILE.DOOR:     drawDoor(px,py);              break;
        case TILE.STAIRS:   drawStairs(px,py);            break;
        case TILE.STAIRSUP: drawStairsUp(px,py);         break;
        case TILE.SIGN:     dark?drawFloor(px,py,true):drawGrass(px,py,tx,ty);
                            drawSignPost(px,py);          break;
        case TILE.TORCH:    drawTorch(px,py);             break;
        default: ctx.fillStyle='#000'; ctx.fillRect(px,py,TS,TS);
    }
}

function drawGrass(px,py,tx,ty) {
    const s=(tx*7+ty*13)%7, sh=['#2d5a1b','#305e1e','#2a5618','#326020','#2e5c1c','#305f1e','#2c5a1a'];
    ctx.fillStyle=sh[s]; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#3a7022';
    for(let i=0;i<3;i++){const bx=px+((tx*3+ty*5+i*7)%(TS-6))+3,by=py+((tx*5+ty*7+i*11)%(TS-7))+3;ctx.fillRect(bx,by,2,5);ctx.fillRect(bx+4,by+2,2,4);}
}

function drawPath(px,py,tx,ty) {
    ctx.fillStyle='#7a5a12'; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#8a6820';
    for(let i=0;i<3;i++){const s=(tx*11+ty*7+i*13),pbx=px+(s%(TS-8))+4,pby=py+((s*3)%(TS-8))+4;ctx.beginPath();ctx.ellipse(pbx,pby,3,2,0.3,0,Math.PI*2);ctx.fill();}
}

function drawFloor(px,py,dark) {
    ctx.fillStyle = dark ? '#28201e' : '#4a4040';
    ctx.fillRect(px,py,TS,TS);
    ctx.strokeStyle = dark ? '#1e1614' : '#3a3030'; ctx.lineWidth=1;
    ctx.strokeRect(px+1,py+1,TS-2,TS-2);
    ctx.beginPath();ctx.moveTo(px+TS/2,py);ctx.lineTo(px+TS/2,py+TS);ctx.stroke();
    ctx.beginPath();ctx.moveTo(px,py+TS/2);ctx.lineTo(px+TS,py+TS/2);ctx.stroke();
}

function drawWall(px,py,dark) {
    ctx.fillStyle = dark ? '#1e1010' : '#3a2828'; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle = dark ? '#2a1a18' : '#4a3838'; ctx.fillRect(px,py,TS,3);
    ctx.strokeStyle = dark ? '#150a0a' : '#2a1a1a'; ctx.lineWidth=1;
    const bh=12;
    for(let row=0;row*bh<TS;row++){const y=py+row*bh;ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px+TS,y);ctx.stroke();const off=(row%2)*(TS/2);for(let bx=px+off;bx<px+TS;bx+=TS/2){ctx.beginPath();ctx.moveTo(bx,y);ctx.lineTo(bx,y+bh);ctx.stroke();}}
}

function drawTree(px,py,tx,ty) {
    ctx.fillStyle='#1a2a0a'; ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#3a2010'; ctx.fillRect(px+TS/2-4,py+TS*0.55,8,TS*0.45);
    const s=(tx*5+ty*9)%5,g=['#1a4a08','#224e0c','#1e4a0a','#264f0e','#1c4806'];
    ctx.fillStyle=g[s]; ctx.beginPath();ctx.arc(px+TS/2,py+TS*0.5,TS*0.36,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a6010'; ctx.beginPath();ctx.arc(px+TS/2,py+TS*0.35,TS*0.27,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3a7818'; ctx.beginPath();ctx.arc(px+TS/2,py+TS*0.22,TS*0.16,0,Math.PI*2);ctx.fill();
}

function drawWater(px,py) {
    ctx.fillStyle='#10304a'; ctx.fillRect(px,py,TS,TS);
    const t=timeMs/1000; ctx.strokeStyle=`rgba(40,100,160,${0.4+0.2*Math.sin(t+px*0.05)})`; ctx.lineWidth=1.5;
    for(let i=0;i<3;i++){const wy=py+(TS/4)*(i+1)+Math.sin(t*1.5+px*0.1+i)*3;ctx.beginPath();ctx.moveTo(px+4,wy);ctx.bezierCurveTo(px+TS*0.3,wy-3,px+TS*0.7,wy+3,px+TS-4,wy);ctx.stroke();}
}

function drawDoor(px,py) {
    ctx.fillStyle='#3a2828';ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#5a3010';ctx.fillRect(px+6,py,TS-12,TS-4);
    ctx.strokeStyle='#4a2808';ctx.lineWidth=1;
    for(let i=0;i<3;i++){const lx=px+12+i*8;ctx.beginPath();ctx.moveTo(lx,py+4);ctx.lineTo(lx,py+TS-6);ctx.stroke();}
    ctx.fillStyle='#c8922a';ctx.beginPath();ctx.arc(px+TS-14,py+TS/2,3,0,Math.PI*2);ctx.fill();
}

function drawStairs(px,py) {
    ctx.fillStyle='#1a1a2a';ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#2a2a3a';for(let i=0;i<4;i++)ctx.fillRect(px+i*5,py+i*9,TS-i*10,10);
    const t=timeMs/1000,a=0.25+0.1*Math.sin(t*2);
    ctx.fillStyle=`rgba(100,80,200,${a})`;ctx.beginPath();ctx.arc(px+TS/2,py+TS/2,TS*0.3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#9070d0';ctx.font=`${TS*0.35}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('↓',px+TS/2,py+TS/2);
}

function drawStairsUp(px,py) {
    ctx.fillStyle='#1a2a1a';ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#2a3a2a';for(let i=3;i>=0;i--)ctx.fillRect(px+i*5,py+(3-i)*9,TS-i*10,10);
    const t=timeMs/1000,a=0.25+0.1*Math.sin(t*2);
    ctx.fillStyle=`rgba(80,200,80,${a})`;ctx.beginPath();ctx.arc(px+TS/2,py+TS/2,TS*0.3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#70d070';ctx.font=`${TS*0.35}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('↑',px+TS/2,py+TS/2);
}

function drawSignPost(px,py) {
    ctx.fillStyle='#6a4010';ctx.fillRect(px+TS/2-2,py+TS*0.35,4,TS*0.65);
    ctx.fillStyle='#8a5820';ctx.fillRect(px+TS*0.18,py+TS*0.1,TS*0.64,TS*0.32);
    ctx.strokeStyle='#5a3808';ctx.lineWidth=1;ctx.strokeRect(px+TS*0.18,py+TS*0.1,TS*0.64,TS*0.32);
    ctx.fillStyle='#3a1a00';for(let i=0;i<3;i++)ctx.fillRect(px+TS*0.24,py+TS*(0.17+i*0.07),TS*0.52,2);
}

function drawTorch(px,py) {
    ctx.fillStyle=currentMap.dark?'#1a0808':'#2a1a1a';ctx.fillRect(px,py,TS,TS);
    const t=timeMs/1000,fl=0.75+0.25*Math.sin(t*9+px*0.2);
    ctx.fillStyle='#4a3020';ctx.fillRect(px+TS/2-3,py+TS*0.35,6,TS*0.4);
    ctx.shadowColor='#ff8820';ctx.shadowBlur=18*fl;
    ctx.fillStyle=`rgba(255,${Math.floor(110+80*fl)},10,0.95)`;
    ctx.beginPath();ctx.ellipse(px+TS/2,py+TS*0.28,TS*0.1*fl,TS*0.18,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    // ambient light spill on nearby floor
    const gr=ctx.createRadialGradient(px+TS/2,py+TS/2,0,px+TS/2,py+TS/2,TS*1.8);
    gr.addColorStop(0,`rgba(255,140,20,${0.12*fl})`);gr.addColorStop(1,'rgba(255,140,20,0)');
    ctx.fillStyle=gr;ctx.fillRect(px-TS,py-TS,TS*3,TS*3);
}

// ═══════════════════════════════════════════════════════
//  ENTITY & ITEM RENDERING
// ═══════════════════════════════════════════════════════
const CLASS_COLORS = {Warrior:'#c8922a',Rogue:'#9a40d0',Wizard:'#3a8ad0',Cleric:'#d0c840'};

function drawCharacter(sx,sy,color,facing,name,isPlayer,isNear,ghost) {
    const cx=sx+TS/2,cy=sy+TS/2,r=TS*0.3,t=timeMs/1000;
    const bob=isPlayer?0:Math.sin(t*1.6+cx*0.02)*1.2;
    ctx.save();ctx.translate(0,bob);
    if(ghost){ctx.globalAlpha=0.65+0.15*Math.sin(t*2);}
    ctx.fillStyle='rgba(0,0,0,0.28)';ctx.beginPath();ctx.ellipse(cx,cy+r+2,r*0.7,r*0.22,0,0,Math.PI*2);ctx.fill();
    if(isPlayer){ctx.shadowColor=color;ctx.shadowBlur=14;}
    if(ghost){ctx.shadowColor='#a0c8ff';ctx.shadowBlur=20;}
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.4)';ctx.lineWidth=2;ctx.stroke();
    ctx.shadowBlur=0;
    const HD={up:[0,-0.5],down:[0,0.4],left:[-0.42,0],right:[0.42,0]};
    const [hx,hy]=HD[facing]||[0,0.4];
    ctx.fillStyle=ghost?'#c0d8ff':'#e8cfa0';
    ctx.beginPath();ctx.arc(cx+hx*r,cy+hy*r,r*0.42,0,Math.PI*2);ctx.fill();
    const FD={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
    const [fdx,fdy]=FD[facing]||[0,1];
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.beginPath();ctx.arc(cx+fdx*r*0.74,cy+fdy*r*0.74,r*0.14,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.restore();
    if(!isPlayer){
        ctx.font='11px sans-serif';ctx.textAlign='center';
        const nw=ctx.measureText(name).width;
        ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(cx-nw/2-3,sy-20,nw+6,14);
        ctx.fillStyle=ghost?'#a0c8ff':'#e8d0b0';ctx.textBaseline='top';ctx.fillText(name,cx,sy-19);
    }
    if(!isPlayer&&isNear){
        ctx.fillStyle='#ffe040';ctx.font=`bold ${Math.max(14,TS*0.3)}px sans-serif`;
        ctx.textAlign='center';ctx.textBaseline='bottom';
        ctx.fillText('!',cx,sy-2+Math.sin(timeMs/300)*3);
    }
}

function drawItem(item,sx,sy) {
    const cx=sx+TS/2,cy=sy+TS/2,t=timeMs/1000;
    const bob=Math.sin(t*2+cx*0.1)*3,glow=0.5+0.3*Math.sin(t*3);
    ctx.save();ctx.translate(cx,cy+bob);
    ctx.shadowColor=item.color;ctx.shadowBlur=12*glow;
    ctx.fillStyle=item.color;
    const s=TS*0.18;
    ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*0.7,0);ctx.lineTo(0,s);ctx.lineTo(-s*0.7,0);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.restore();
    ctx.font='10px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillStyle='#e8d090';ctx.fillText(item.name,cx,sy-2);
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(currentMap.dark){ctx.fillStyle='#0a0608';ctx.fillRect(0,0,canvas.width,canvas.height);}

    const stx=Math.max(0,Math.floor(cam.x/TS)),sty=Math.max(0,Math.floor(cam.y/TS));
    const etx=Math.min(currentMap.w-1,Math.ceil((cam.x+canvas.width)/TS));
    const ety=Math.min(currentMap.h-1,Math.ceil((cam.y+canvas.height)/TS));

    for(let ty=sty;ty<=ety;ty++)
        for(let tx=stx;tx<=etx;tx++)
            drawTile(currentMap.tiles[ty][tx],tx*TS-cam.x,ty*TS-cam.y,tx,ty);

    // Items
    for(const item of currentMap.items){
        const sx=item.x*TS-cam.x,sy=item.y*TS-cam.y;
        if(sx>-TS&&sx<canvas.width+TS&&sy>-TS&&sy<canvas.height+TS)
            drawItem(item,sx,sy);
    }

    // NPCs
    for(const npc of currentMap.npcs){
        const sx=npc.x*TS-cam.x,sy=npc.y*TS-cam.y;
        if(sx>-TS*2&&sx<canvas.width+TS&&sy>-TS*2&&sy<canvas.height+TS)
            drawCharacter(sx,sy,npc.color,'down',npc.name,false,isAdjacent(npc.x,npc.y),npc.ghost);
    }

    // Player
    drawCharacter(
        player.x*TS-cam.x, player.y*TS-cam.y,
        CLASS_COLORS[gs.charClass]||CLASS_COLORS.Warrior,
        player.facing,'',true,false,false
    );

    // Dungeon vignette
    if(currentMap.dark){
        const gr=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.width*0.18,canvas.width/2,canvas.height/2,canvas.width*0.72);
        gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,0.7)');
        ctx.fillStyle=gr;ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    updateHintBar();
}

function isAdjacent(nx,ny){return Math.abs(nx-player.x)+Math.abs(ny-player.y)===1;}

function updateHintBar() {
    const adj=[{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    let hint='';
    for(const d of adj){
        const tx=player.x+d.dx,ty=player.y+d.dy;
        if(tx<0||tx>=currentMap.w||ty<0||ty>=currentMap.h)continue;
        const tile=currentMap.tiles[ty][tx];
        if(tile===TILE.SIGN)                         {hint='Press E to read';break;}
        if(tile===TILE.STAIRS)                       {hint='Press E to descend';break;}
        if(tile===TILE.STAIRSUP)                     {hint='Press E to ascend';break;}
        if(currentMap.npcs.find(n=>n.x===tx&&n.y===ty)){
            const npc=currentMap.npcs.find(n=>n.x===tx&&n.y===ty);
            hint=`Press E to talk to ${npc.name}`;break;
        }
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
    ui.dialogue=null;ui.sign=null;ui.questLog=false;ui.loading=false;
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
