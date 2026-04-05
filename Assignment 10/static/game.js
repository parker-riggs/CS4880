'use strict';

// ═══════════════════════════════════════════════════════
//  TILE DEFINITIONS
// ═══════════════════════════════════════════════════════
const TILE = Object.freeze({
    GRASS:0, PATH:1, FLOOR:2, WALL:3,
    TREE:4,  WATER:5, DOOR:6, STAIRS:7, SIGN:8,
});
const WALKABLE = new Set([TILE.GRASS, TILE.PATH, TILE.FLOOR, TILE.DOOR, TILE.SIGN]);
const { GRASS:G, PATH:P, FLOOR:F, WALL:W, TREE:TR, WATER:WA, DOOR:DR, STAIRS:ST, SIGN:SG } = TILE;

// ═══════════════════════════════════════════════════════
//  MAP  (30 cols × 23 rows)
// ═══════════════════════════════════════════════════════
const MAP_W = 30, MAP_H = 23;

const WORLD_MAP = [
//   0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29
  [TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR], // 0
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 1
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 2
  [TR,  G,  G,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 3
  [TR,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 4
  [TR,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  W,  F,  F,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 5
  [TR,  G,  G,  W,  W, DR,  W,  G,  G,  G,  G,  G,  G,  W,  W, DR,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 6
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G, SG,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 7
  [TR,  G,  G,  G,  G,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 8
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 9
  [TR,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 10
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 11
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 12
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 13
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 14
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 15
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 16
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 17
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 18
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 19
  [TR,  G,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G, TR], // 20
  [TR, TR, TR, TR, TR,  P, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR], // 21
  [TR, TR, TR, TR, TR, ST, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR], // 22
];

// ═══════════════════════════════════════════════════════
//  WORLD ENTITIES
// ═══════════════════════════════════════════════════════
const NPCS = [
    {
        id: 'elder', name: 'Elder Maren', x: 4, y: 5,
        portrait: '👴', color: '#d0c870',
        role: 'The elderly leader of Eldoria village. Wise but frightened — the darkness spreading from the Cursed Mines to the south has kept him awake for weeks. He is desperately looking for someone brave enough to investigate. He will hint at a reward.',
        history: [],
    },
    {
        id: 'blacksmith', name: 'Daran', x: 15, y: 4,
        portrait: '🔨', color: '#d07040',
        role: 'The village blacksmith. Gruff, grieving, and suspicious of strangers. His younger brother Henrick went into the Cursed Mines three months ago with a group of six and never returned. He blames himself and is barely holding it together.',
        history: [],
    },
    {
        id: 'traveler', name: 'Veyla', x: 22, y: 10,
        portrait: '🧝', color: '#70a0e0',
        role: 'A mysterious elven wanderer. She speaks cryptically, never giving a straight answer. She actually knows what is inside the Cursed Mines — an ancient sealed entity — but will only reveal this gradually through conversation, dropping hints and testing whether the player can be trusted.',
        history: [],
    },
];

const SIGNS = [
    {
        x: 10, y: 7,
        text: '— ELDORIA —\n\nFounded in the Year of the Third Moon.\nPopulation: 23.\n\n"May the Old Gods light your path."',
    },
    {
        x: 5, y: 22,
        type: 'stairs',
        text: 'THE CURSED MINES\n\n"Turn back. Whatever you hear below,\ndo not answer it."\n\n— scratched into the stone by a shaking hand\n\n[ Dungeon area — coming soon ]',
    },
];

// ═══════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════
const gs = {
    charName:  'Hero',
    charClass: 'Warrior',
    flags: {},
};

const player = { x: 7, y: 8, facing: 'down' };
const cam    = { x: 0, y: 0 };
const ui     = { dialogue: null, sign: null, loading: false };

let timeMs   = 0;
let TS       = 48;   // tile size — recalculated on resize

// ═══════════════════════════════════════════════════════
//  CANVAS
// ═══════════════════════════════════════════════════════
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

const HUD_H  = 40;
const HINT_H = 26;

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight - HUD_H - HINT_H;
    // Recalculate tile size to always show at least 15 columns
    TS = Math.floor(Math.min(canvas.width / 15, canvas.height / 11));
    TS = Math.max(32, Math.min(TS, 64));
}

window.addEventListener('resize', resizeCanvas);

// ═══════════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════════
const KEYS        = new Set();
const JUST_PRESSED = new Set();

document.addEventListener('keydown', e => {
    const nav = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '];
    if (nav.includes(e.key)) e.preventDefault();

    if (!KEYS.has(e.key)) JUST_PRESSED.add(e.key);
    KEYS.add(e.key);

    if (e.key === 'e' || e.key === 'E') { e.preventDefault(); handleInteract(); }
    if (e.key === 'Escape') { closeDialogue(); closeSign(); }
});

document.addEventListener('keyup', e => KEYS.delete(e.key));

let moveAccum = 999;  // start high so first key press moves immediately

function updateMovement(dt) {
    if (ui.dialogue || ui.sign || ui.loading) { JUST_PRESSED.clear(); return; }

    const dirs = [
        { keys:['ArrowUp','w','W'],    dx:0,  dy:-1, f:'up'    },
        { keys:['ArrowDown','s','S'],  dx:0,  dy:1,  f:'down'  },
        { keys:['ArrowLeft','a','A'],  dx:-1, dy:0,  f:'left'  },
        { keys:['ArrowRight','d','D'], dx:1,  dy:0,  f:'right' },
    ];

    // Immediate move on first keypress
    for (const d of dirs) {
        if (d.keys.some(k => JUST_PRESSED.has(k))) {
            JUST_PRESSED.clear();
            tryMove(d.dx, d.dy, d.f);
            moveAccum = 0;
            return;
        }
    }
    JUST_PRESSED.clear();

    // Held repeat
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
    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return false;
    if (!WALKABLE.has(WORLD_MAP[ny][nx])) return false;
    if (NPCS.some(n => n.x === nx && n.y === ny)) return false;
    player.x = nx; player.y = ny;
    return true;
}

// ═══════════════════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════════════════
function updateCamera() {
    const tx = player.x * TS + TS / 2 - canvas.width  / 2;
    const ty = player.y * TS + TS / 2 - canvas.height / 2;
    cam.x = Math.max(0, Math.min(tx, MAP_W * TS - canvas.width));
    cam.y = Math.max(0, Math.min(ty, MAP_H * TS - canvas.height));
}

// ═══════════════════════════════════════════════════════
//  TILE DRAWING
// ═══════════════════════════════════════════════════════
function drawTile(tile, px, py, tx, ty) {
    switch (tile) {
        case TILE.GRASS:  drawGrass(px, py, tx, ty);  break;
        case TILE.PATH:   drawPath(px, py, tx, ty);   break;
        case TILE.FLOOR:  drawFloor(px, py);           break;
        case TILE.WALL:   drawWall(px, py);            break;
        case TILE.TREE:   drawTree(px, py, tx, ty);   break;
        case TILE.WATER:  drawWater(px, py);           break;
        case TILE.DOOR:   drawDoor(px, py);            break;
        case TILE.STAIRS: drawStairs(px, py);          break;
        case TILE.SIGN:
            drawGrass(px, py, tx, ty);
            drawSignPost(px, py);
            break;
        default:
            ctx.fillStyle = '#080808';
            ctx.fillRect(px, py, TS, TS);
    }
}

function drawGrass(px, py, tx, ty) {
    const seed  = (tx * 7 + ty * 13) % 7;
    const shades = ['#2d5a1b','#305e1e','#2a5618','#326020','#2e5c1c','#305f1e','#2c5a1a'];
    ctx.fillStyle = shades[seed];
    ctx.fillRect(px, py, TS, TS);
    // Blade clusters
    ctx.fillStyle = '#3a7022';
    for (let i = 0; i < 3; i++) {
        const bx = px + ((tx * 3 + ty * 5 + i * 7) % (TS - 6)) + 3;
        const by = py + ((tx * 5 + ty * 7 + i * 11) % (TS - 7)) + 3;
        ctx.fillRect(bx, by, 2, 5);
        ctx.fillRect(bx + 4, by + 2, 2, 4);
    }
}

function drawPath(px, py, tx, ty) {
    ctx.fillStyle = '#7a5a12';
    ctx.fillRect(px, py, TS, TS);
    ctx.fillStyle = '#8a6820';
    for (let i = 0; i < 3; i++) {
        const s   = (tx * 11 + ty * 7 + i * 13);
        const pbx = px + (s % (TS - 8)) + 4;
        const pby = py + ((s * 3) % (TS - 8)) + 4;
        ctx.beginPath(); ctx.ellipse(pbx, pby, 3, 2, 0.3, 0, Math.PI * 2); ctx.fill();
    }
}

function drawFloor(px, py) {
    ctx.fillStyle = '#4a4040';
    ctx.fillRect(px, py, TS, TS);
    ctx.strokeStyle = '#3a3030'; ctx.lineWidth = 1;
    ctx.strokeRect(px + 1, py + 1, TS - 2, TS - 2);
    ctx.beginPath(); ctx.moveTo(px + TS/2, py); ctx.lineTo(px + TS/2, py + TS); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py + TS/2); ctx.lineTo(px + TS, py + TS/2); ctx.stroke();
}

function drawWall(px, py) {
    ctx.fillStyle = '#3a2828';
    ctx.fillRect(px, py, TS, TS);
    ctx.fillStyle = '#4a3838';
    ctx.fillRect(px, py, TS, 3);  // top highlight
    ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 1;
    const bh = 12;
    for (let row = 0; row * bh < TS; row++) {
        const y = py + row * bh;
        ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + TS, y); ctx.stroke();
        const off = (row % 2) * (TS / 2);
        for (let bx = px + off; bx < px + TS; bx += TS / 2) {
            ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx, y + bh); ctx.stroke();
        }
    }
}

function drawTree(px, py, tx, ty) {
    ctx.fillStyle = '#1a2a0a';
    ctx.fillRect(px, py, TS, TS);
    // Trunk
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(px + TS/2 - 4, py + TS * 0.55, 8, TS * 0.45);
    // Foliage
    const seed    = (tx * 5 + ty * 9) % 5;
    const greens  = ['#1a4a08','#224e0c','#1e4a0a','#264f0e','#1c4806'];
    ctx.fillStyle = greens[seed];
    ctx.beginPath(); ctx.arc(px + TS/2, py + TS*0.5,  TS*0.36, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2a6010';
    ctx.beginPath(); ctx.arc(px + TS/2, py + TS*0.35, TS*0.27, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a7818';
    ctx.beginPath(); ctx.arc(px + TS/2, py + TS*0.22, TS*0.16, 0, Math.PI*2); ctx.fill();
}

function drawWater(px, py) {
    ctx.fillStyle = '#10304a';
    ctx.fillRect(px, py, TS, TS);
    const t = timeMs / 1000;
    ctx.strokeStyle = `rgba(40,100,160,${0.4 + 0.2 * Math.sin(t + px * 0.05)})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
        const wy = py + (TS/4) * (i+1) + Math.sin(t * 1.5 + px * 0.1 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(px + 4, wy);
        ctx.bezierCurveTo(px+TS*0.3, wy-3, px+TS*0.7, wy+3, px+TS-4, wy);
        ctx.stroke();
    }
}

function drawDoor(px, py) {
    ctx.fillStyle = '#3a2828'; ctx.fillRect(px, py, TS, TS);
    ctx.fillStyle = '#5a3010'; ctx.fillRect(px + 6, py, TS - 12, TS - 4);
    ctx.strokeStyle = '#4a2808'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const lx = px + 12 + i * 8;
        ctx.beginPath(); ctx.moveTo(lx, py+4); ctx.lineTo(lx, py+TS-6); ctx.stroke();
    }
    ctx.fillStyle = '#c8922a';
    ctx.beginPath(); ctx.arc(px + TS - 14, py + TS/2, 3, 0, Math.PI*2); ctx.fill();
}

function drawStairs(px, py) {
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(px, py, TS, TS);
    ctx.fillStyle = '#2a2a3a';
    for (let i = 0; i < 4; i++) ctx.fillRect(px + i*5, py + i*9, TS - i*10, 10);
    const t = timeMs / 1000;
    ctx.fillStyle = `rgba(100,80,200,${0.25 + 0.1 * Math.sin(t * 2)})`;
    ctx.beginPath(); ctx.arc(px + TS/2, py + TS/2, TS*0.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#9070d0'; ctx.font = `${TS*0.35}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('↓', px + TS/2, py + TS/2);
}

function drawSignPost(px, py) {
    ctx.fillStyle = '#6a4010';
    ctx.fillRect(px + TS/2 - 2, py + TS*0.35, 4, TS*0.65);
    ctx.fillStyle = '#8a5820';
    ctx.fillRect(px + TS*0.18, py + TS*0.1, TS*0.64, TS*0.32);
    ctx.strokeStyle = '#5a3808'; ctx.lineWidth = 1;
    ctx.strokeRect(px + TS*0.18, py + TS*0.1, TS*0.64, TS*0.32);
    ctx.fillStyle = '#3a1a00';
    for (let i = 0; i < 3; i++)
        ctx.fillRect(px + TS*0.24, py + TS*(0.17 + i*0.07), TS*0.52, 2);
}

// ═══════════════════════════════════════════════════════
//  ENTITY DRAWING
// ═══════════════════════════════════════════════════════
const CLASS_COLORS = {
    Warrior:'#c8922a', Rogue:'#9a40d0', Wizard:'#3a8ad0', Cleric:'#d0c840',
};

function drawCharacter(sx, sy, color, facing, name, isPlayer, isNear) {
    const cx = sx + TS/2, cy = sy + TS/2;
    const r  = TS * 0.3;
    const t  = timeMs / 1000;
    const bob = isPlayer ? 0 : Math.sin(t * 1.6 + cx * 0.02) * 1.2;

    ctx.save();
    ctx.translate(0, bob);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(cx, cy + r + 2, r*0.7, r*0.22, 0, 0, Math.PI*2); ctx.fill();

    // Player glow
    if (isPlayer) { ctx.shadowColor = color; ctx.shadowBlur = 14; }

    // Body
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;

    // Head (offset toward facing direction)
    const HD = { up:[0,-0.5], down:[0,0.4], left:[-0.42,0], right:[0.42,0] };
    const [hx, hy] = HD[facing] || [0, 0.4];
    ctx.fillStyle = '#e8cfa0';
    ctx.beginPath(); ctx.arc(cx + hx*r, cy + hy*r, r*0.42, 0, Math.PI*2); ctx.fill();

    // Facing dot
    const FD = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [fdx, fdy] = FD[facing] || [0, 1];
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.arc(cx + fdx*r*0.74, cy + fdy*r*0.74, r*0.14, 0, Math.PI*2); ctx.fill();

    ctx.restore();

    // NPC name tag
    if (!isPlayer) {
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        const nw = ctx.measureText(name).width;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(cx - nw/2 - 3, sy - 20, nw + 6, 14);
        ctx.fillStyle = '#e8d0b0'; ctx.textBaseline = 'top';
        ctx.fillText(name, cx, sy - 19);
    }

    // Interaction bubble
    if (!isPlayer && isNear) {
        const t2 = timeMs / 1000;
        const bub = sy - 30 + Math.sin(t2 * 3) * 3;
        ctx.fillStyle = '#ffe040'; ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('!', cx, bub);
    }
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startTX = Math.max(0, Math.floor(cam.x / TS));
    const startTY = Math.max(0, Math.floor(cam.y / TS));
    const endTX   = Math.min(MAP_W - 1, Math.ceil((cam.x + canvas.width)  / TS));
    const endTY   = Math.min(MAP_H - 1, Math.ceil((cam.y + canvas.height) / TS));

    for (let ty = startTY; ty <= endTY; ty++) {
        for (let tx = startTX; tx <= endTX; tx++) {
            drawTile(WORLD_MAP[ty][tx], tx*TS - cam.x, ty*TS - cam.y, tx, ty);
        }
    }

    // NPCs
    for (const npc of NPCS) {
        const sx = npc.x * TS - cam.x, sy = npc.y * TS - cam.y;
        if (sx > -TS*2 && sx < canvas.width + TS && sy > -TS*2 && sy < canvas.height + TS) {
            drawCharacter(sx, sy, npc.color, 'down', npc.name, false, isAdjacent(npc.x, npc.y));
        }
    }

    // Player
    drawCharacter(
        player.x * TS - cam.x, player.y * TS - cam.y,
        CLASS_COLORS[gs.charClass] || CLASS_COLORS.Warrior,
        player.facing, gs.charName, true, false
    );

    updateHintBar();
}

function isAdjacent(nx, ny) {
    return Math.abs(nx - player.x) + Math.abs(ny - player.y) === 1;
}

function updateHintBar() {
    const adj = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    let hint = '';
    for (const d of adj) {
        const tx = player.x + d.dx, ty = player.y + d.dy;
        if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) continue;
        const tile = WORLD_MAP[ty][tx];
        if (tile === TILE.SIGN || tile === TILE.STAIRS) { hint = 'Press E to read'; break; }
        const npc = NPCS.find(n => n.x === tx && n.y === ty);
        if (npc) { hint = `Press E to talk to ${npc.name}`; break; }
    }
    document.getElementById('hint-bar').textContent = hint;
}

// ═══════════════════════════════════════════════════════
//  INTERACTION
// ═══════════════════════════════════════════════════════
function handleInteract() {
    if (ui.dialogue) { closeDialogue(); return; }
    if (ui.sign)     { closeSign();     return; }

    const adj = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    for (const d of adj) {
        const tx = player.x + d.dx, ty = player.y + d.dy;
        if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) continue;

        const tile = WORLD_MAP[ty][tx];

        if (tile === TILE.SIGN || tile === TILE.STAIRS) {
            const s = SIGNS.find(s => s.x === tx && s.y === ty);
            showSign(s ? s.text : 'A dark passage leads below.');
            return;
        }

        const npc = NPCS.find(n => n.x === tx && n.y === ty);
        if (npc) { startDialogue(npc); return; }
    }
}

// ─ Sign ────────────────────────────────────────────────
function showSign(text) {
    ui.sign = true;
    document.getElementById('sign-text').textContent = text;
    document.getElementById('sign-box').classList.remove('hidden');
}

function closeSign() {
    ui.sign = false;
    document.getElementById('sign-box').classList.add('hidden');
}

// ─ Dialogue ────────────────────────────────────────────
async function startDialogue(npc) {
    ui.loading = true;
    const box = document.getElementById('dialogue-box');
    document.getElementById('dlg-name').textContent    = npc.name;
    document.getElementById('dlg-portrait').textContent = npc.portrait;
    document.getElementById('dlg-text').textContent    = '…';
    document.getElementById('dlg-options').innerHTML   = '';
    box.classList.remove('hidden');

    const data = await callInteract(npc, '', npc.history);
    npc.history = data.history;
    ui.dialogue = npc;
    ui.loading  = false;
    showDialogueData(data, npc);
}

async function chooseOption(npc, optText) {
    if (ui.loading) return;
    ui.loading = true;
    document.getElementById('dlg-text').textContent  = '…';
    document.getElementById('dlg-options').innerHTML = '';

    const data = await callInteract(npc, optText, npc.history);
    npc.history = data.history;
    ui.loading  = false;

    if (data.ended) {
        gs.flags[`talked_${npc.id}`] = true;
        closeDialogue();
        return;
    }
    showDialogueData(data, npc);
}

async function callInteract(npc, choice, history) {
    const res = await fetch('/interact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            npc:     { name: npc.name, role: npc.role },
            choice,
            history,
            flags:   gs.flags,
        }),
    });
    return res.json();
}

function showDialogueData(data, npc) {
    document.getElementById('dlg-text').textContent = data.dialogue;
    const optsEl = document.getElementById('dlg-options');
    optsEl.innerHTML = '';
    for (const opt of data.options) {
        const btn = document.createElement('button');
        btn.className = 'dlg-opt';
        btn.textContent = opt;
        btn.onclick = () => chooseOption(npc, opt);
        optsEl.appendChild(btn);
    }
}

function closeDialogue() {
    ui.dialogue = null;
    ui.loading  = false;
    document.getElementById('dialogue-box').classList.add('hidden');
}

// ═══════════════════════════════════════════════════════
//  AMBIENT AUDIO
// ═══════════════════════════════════════════════════════
let audioCtx = null, masterGain = null, melodyTimer = null, allNodes = [];
let musicOn = true;

const SCALE = [110,123.47,130.81,146.83,164.81,174.61,196,220,246.94,261.63,293.66,329.63,349.23,392,440];

function startMusic() {
    if (audioCtx) return;
    audioCtx   = new (window.AudioContext || window['webkitAudioContext'])();
    masterGain = audioCtx.createGain(); masterGain.gain.value = 0.25;

    const delay = audioCtx.createDelay(3); delay.delayTime.value = 0.45;
    const fb    = audioCtx.createGain();   fb.gain.value = 0.42;
    const lpf   = audioCtx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1800;
    delay.connect(lpf); lpf.connect(fb); fb.connect(delay);
    delay.connect(masterGain); masterGain.connect(audioCtx.destination);
    allNodes.push(delay, fb, lpf);

    startWind(masterGain);
    startDrone(55, masterGain);
    scheduleMelody(delay, masterGain);
}

function startDrone(freq, out) {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq; g.gain.value = 0.055;
    o.connect(g); g.connect(out); o.start(); allNodes.push(o, g);
}

function startWind(out) {
    const len = audioCtx.sampleRate * 3;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const flt = audioCtx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 400; flt.Q.value = 0.5;
    const wg  = audioCtx.createGain(); wg.gain.value = 0.04;
    const lfo = audioCtx.createOscillator(); const lfog = audioCtx.createGain();
    lfo.frequency.value = 0.06; lfog.gain.value = 0.03;
    lfo.connect(lfog); lfog.connect(wg.gain); lfo.start();
    src.connect(flt); flt.connect(wg); wg.connect(out); src.start();
    allNodes.push(src, flt, wg, lfo, lfog);
}

function playNote(freq, wet, dry) {
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), e = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    e.gain.setValueAtTime(0, now);
    e.gain.linearRampToValueAtTime(0.18, now + 0.05);
    e.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
    o.connect(e); e.connect(wet); e.connect(dry);
    o.start(now); o.stop(now + 4.6);
}

function scheduleMelody(wet, dry) {
    [SCALE[0], SCALE[2], SCALE[4]].forEach(f => playNote(f, wet, dry));
    melodyTimer = setInterval(() => {
        if (!audioCtx || audioCtx.state === 'closed') return;
        const n = Math.random() < 0.25 ? 2 : 1;
        for (let i = 0; i < n; i++) playNote(SCALE[Math.floor(Math.random() * SCALE.length)], wet, dry);
    }, 2800 + Math.random() * 2000);
}

function stopMusic() {
    clearInterval(melodyTimer); melodyTimer = null;
    allNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e) {} });
    allNodes = [];
    if (audioCtx) { audioCtx.close(); audioCtx = null; masterGain = null; }
}

// ═══════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════
let lastTs = 0;

function loop(ts) {
    const dt = Math.min(ts - lastTs, 100); // cap dt to avoid huge jumps
    lastTs = ts; timeMs = ts;

    updateMovement(dt);
    updateCamera();
    render();

    requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════
function startGame(name, charClass) {
    gs.charName  = name;
    gs.charClass = charClass;
    gs.flags     = {};

    player.x = 7; player.y = 8; player.facing = 'down';

    for (const npc of NPCS) npc.history = [];
    ui.dialogue = null; ui.sign = null; ui.loading = false;

    resizeCanvas();

    const ss = document.getElementById('start-screen');
    ss.classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('hud-name').textContent  = name;
    document.getElementById('hud-class').textContent = charClass;

    startMusic();
    requestAnimationFrame(loop);
}

document.getElementById('begin-btn').addEventListener('click', () => {
    const name      = document.getElementById('char-name').value.trim() || 'Hero';
    const charClass = document.querySelector('.class-card.selected')?.dataset.class || 'Warrior';
    startGame(name, charClass);
});

document.getElementById('restart-btn').addEventListener('click', () => {
    stopMusic();
    document.getElementById('game-screen').classList.add('hidden');
    const ss = document.getElementById('start-screen');
    ss.classList.remove('hidden');
    // Return to main menu panel
    document.querySelectorAll('.menu-panel').forEach(p => {
        p.classList.add('hidden'); p.style.opacity = '0';
    });
    const main = document.getElementById('menu-main');
    main.classList.remove('hidden');
    requestAnimationFrame(() => { main.style.opacity = '1'; });
    // Restart particle loop
    menuLoop && menuLoop();
    closeDialogue(); closeSign();
});

document.getElementById('music-toggle').addEventListener('click', () => {
    musicOn = !musicOn;
    const btn = document.getElementById('music-toggle');
    if (musicOn) { startMusic(); btn.classList.add('active'); }
    else         { stopMusic();  btn.classList.remove('active'); }
});
