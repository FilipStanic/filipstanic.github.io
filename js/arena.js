// ============================================================
//  arena.js — Les ARÈNES : 6 décors en pixel art (herbe, grotte, désert, banquise, volcan, ruines)
//  + rochers destructibles + petits effets d'ambiance (braises, étincelles, poussières).
//
//  Le décor est dessiné en DEMI-résolution (PW x PH) puis agrandi x2 : 1 pixel de décor = 2 pixels écran,
//  exactement comme les sprites Pokémon (affichés x2). Le monde fait W x H (1280x720), l'écran VW x VH (640x360).
//
//  Modifier un décor : édite sa fonction `paint` dans ARENAS. Ajouter une arène : ajoute une entrée à la fin
//  de ARENAS, puis utilise son numéro dans le champ `arena` de data/stages.js.
// ============================================================
const PW = W/2, PH = H/2;
let curArena = 0, ARENA_FX = [];
// Rochers (fractions du monde). Ils bloquent les tirs ; ils se brisent après quelques impacts.
const ROCK_LAYOUT = [[.5,.5],[.42,.27],[.42,.73],[.58,.27],[.58,.73],[.24,.34],[.24,.68],[.76,.34],[.76,.68],[.15,.5],[.85,.5],[.5,.14],[.5,.86]];

// ---------- petits outils pixel art ----------
function hash(x, y, s){ let h = (x*374761393 + y*668265263 + s*1274126177) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0)/4294967295; }
function rng(s){ let a = s >>> 0; return () => ((a = (a*1664525 + 1013904223) >>> 0)/4294967296); }
function mkTile(fn, seed){
  const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
  for(let j = 0; j < 16; j++) for(let i = 0; i < 16; i++){ const col = fn(i, j, hash(i, j, seed)); if(col){ x.fillStyle = col; x.fillRect(i, j, 1, 1); } }
  return c;
}
function fillTiles(a, T, seed){ for(let ty = 0; ty < PH; ty += 16) for(let tx = 0; tx < PW; tx += 16) a.drawImage(T[(hash(tx, ty, seed)*T.length) | 0], tx, ty); }
// boule pixel art : contour (o), lumière (l), ton moyen (m), ombre (d)
function blobPx(a, cx, cy, rx, ry, c){
  cx = Math.round(cx); cy = Math.round(cy);
  for(let y = -ry - 2; y <= ry + 2; y++) for(let x = -rx - 2; x <= rx + 2; x++){
    const q = x*x/(rx*rx) + y*y/(ry*ry);
    if(q <= 1){ const lit = -x/rx*.6 - y/ry*.8; a.fillStyle = lit > .55 ? c.l : lit > -.15 ? c.m : c.d; a.fillRect(cx + x, cy + y, 1, 1); }
    else if(x*x/((rx + 1.2)*(rx + 1.2)) + y*y/((ry + 1.2)*(ry + 1.2)) <= 1){ a.fillStyle = c.o; a.fillRect(cx + x, cy + y, 1, 1); }
  }
}
// pointe (stalagmite, sapin, cristal) : sommet au-dessus de y, base centrée en x
function triPx(a, x, y, w, h, c){
  for(let r = 0; r < h; r++){
    const hw = Math.max(0, Math.round(w/2*(r + 1)/h)), yy = y - h + r + 1;
    a.fillStyle = c.o; a.fillRect(x - hw - 1, yy, 2*hw + 3, 1);
    a.fillStyle = c.m; a.fillRect(x - hw, yy, 2*hw + 1, 1);
    a.fillStyle = c.l; a.fillRect(x - hw, yy, Math.max(1, Math.round(hw*.8)), 1);
    const dx = Math.round(hw*.3); a.fillStyle = c.d; a.fillRect(x + dx, yy, hw - dx + 1, 1);
  }
  a.fillStyle = c.o; a.fillRect(x - Math.round(w/2) - 1, y + 1, w + 3, 1);
}
function shadowPx(a, x, y, rx, ry){ a.fillStyle = 'rgba(0,0,0,.22)'; for(let j = -ry; j <= ry; j++){ const w = Math.round(rx*Math.sqrt(1 - j*j/(ry*ry + .01))); a.fillRect(x - w, y + j, 2*w + 1, 1); } }
function treePx(a, x, y, r){
  shadowPx(a, x + 2, y + r - 1, r, 3);
  a.fillStyle = '#6b4a2c'; a.fillRect(x - 1, y + r - 4, 3, 6); a.fillStyle = '#4a321c'; a.fillRect(x + 1, y + r - 4, 1, 6);
  blobPx(a, x, y, r, r - 1, { o:'#1c4a22', l:'#86d860', m:'#4eaa46', d:'#2e7a34' });
  blobPx(a, x - r*.35, y - r*.3, Math.round(r*.45), Math.round(r*.4), { o:'#2e7a34', l:'#b4f088', m:'#82d45c', d:'#4eaa46' });
}
function pinePx(a, x, y, h){
  shadowPx(a, x + 2, y, 8, 3); a.fillStyle = '#5a3a24'; a.fillRect(x - 1, y - 3, 3, 4);
  const g = { o:'#123a30', l:'#4a9a7a', m:'#2f6a58', d:'#1f4a3e' };
  for(let k = 0; k < 3; k++){ triPx(a, x, y - 3 - k*Math.round(h/3.4), 16 - k*3, Math.round(h/2.2), g); a.fillStyle = '#f4fbff'; a.fillRect(x - 2 + k, y - 3 - k*Math.round(h/3.4) - Math.round(h/2.2) + 2, 4 - k, 2); }
}
function cactusPx(a, x, y, h){
  shadowPx(a, x + 2, y, 6, 2); const o = '#1f5a2c', m = '#3f9a4a', l = '#6cca6c';
  a.fillStyle = o; a.fillRect(x - 3, y - h - 1, 8, h + 2); a.fillStyle = m; a.fillRect(x - 2, y - h, 6, h + 1); a.fillStyle = l; a.fillRect(x - 2, y - h, 2, h + 1);
  const arm = (dx, yy, up) => { a.fillStyle = o; a.fillRect(x + dx, yy, 5, 5); a.fillRect(x + dx + (dx < 0 ? 0 : 2), yy - up, 4, up + 5); a.fillStyle = m; a.fillRect(x + dx + 1, yy + 1, 3, 3); a.fillRect(x + dx + 1 + (dx < 0 ? 0 : 2), yy - up + 1, 2, up + 3); };
  arm(-8, y - Math.round(h*.6), 6); arm(5, y - Math.round(h*.45), 8);
}
const RUNE = '#bcd4ff';
function ringPx(a, cx, cy, r, col){ a.fillStyle = col; for(let t = 0; t < 6.283; t += .012) a.fillRect(Math.round(cx + Math.cos(t)*r), Math.round(cy + Math.sin(t)*r), 1, 1); }
function pondPx(a, cx, cy, rx, ry, water, edge, shore){
  for(let y = -ry - 8; y <= ry + 8; y++) for(let x = -rx - 8; x <= rx + 8; x++){
    const q = x*x/(rx*rx) + y*y/(ry*ry);
    if(q <= .72) a.fillStyle = (x + y*2 + 90)%9 === 0 ? water[1] : water[0];
    else if(q <= 1) a.fillStyle = edge;
    else if(q <= 1.28) a.fillStyle = shore;
    else continue;
    a.fillRect(cx + x, cy + y, 1, 1);
  }
}
function borderBlobs(a, c, step, rx, ry){
  for(let x = 0; x < PW + step; x += step){ blobPx(a, x, 4, rx, ry, c); blobPx(a, x + step/2, PH - 3, rx, ry, c); }
  for(let y = step; y < PH; y += step){ blobPx(a, 4, y, ry, rx, c); blobPx(a, PW - 4, y + step/2, ry, rx, c); }
}
function scatter(a, R, n, fn, ymin){ for(let i = 0; i < n; i++) fn(Math.floor(14 + R()*(PW - 28)), Math.floor((ymin || 22) + R()*(PH - (ymin || 22) - 18)), R); }
function drawSorted(O){ O.sort((p, q) => p.y - q.y).forEach(o => o.fn()); }

// ---------- les 6 arènes ----------
const ARENAS = [
 { name:'Prairie', rock:{ o:'#3c3c36', l:'#bcbcac', m:'#8e8e7e', d:'#605e54' },
   fx:{ k:'dust', c:'#fff8a0', n:14, s:2 },
   paint(a, R){
     const T = [0, 1, 2, 3].map(v => mkTile((i, j, h) => {
       let c = (i + j)%8 === 0 ? '#66bb52' : '#5cb049'; if(h < .05) c = '#4c9a3c'; else if(h > .97) c = '#7ccc66';
       if(v && ((i === 3 + v*3 && j === 9) || (i === 4 + v*3 && j === 8) || (i === 5 + v*3 && j === 9))) c = '#3a8832'; return c; }, v + 1));
     fillTiles(a, T, 3);
     for(let x = 0; x < PW; x++){ const yc = PH*.58 + Math.sin(x/60)*26 + Math.sin(x/21)*3;
       for(let y = Math.floor(yc - 10); y <= yc + 10; y++){ const d = Math.abs(y - yc); if(d >= 9.5) continue;
         a.fillStyle = d < 7.5 ? (hash(x, y, 5) < .15 ? '#c8a860' : hash(x, y, 6) > .9 ? '#e8cc90' : '#d8b878') : '#a88848'; a.fillRect(x, y, 1, 1); } }
     pondPx(a, Math.round(PW*.76), Math.round(PH*.27), 54, 26, ['#4a8ad2', '#78b4f0'], '#3a6cb4', '#dcca94');
     for(let p = 0; p < 5; p++){ const cx = 40 + R()*(PW - 80), cy = 40 + R()*(PH - 80);
       for(let y = -14; y <= 14; y++) for(let x = -26; x <= 26; x++) if(x*x/676 + y*y/196 <= 1){ a.fillStyle = (x + y*2 + 60)%5 === 0 ? '#2f7a2c' : hash(cx + x, cy + y, 8) > .85 ? '#4aa842' : '#3f9a3a'; a.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1); } }
     scatter(a, R, 70, (x, y, r) => { const c = ['#ffffff', '#f6c0d8', '#ffe24a'][(r()*3) | 0]; a.fillStyle = c; a.fillRect(x, y, 2, 2); a.fillStyle = '#ffb030'; a.fillRect(x, y, 1, 1); });
     const O = [];
     for(let x = 8; x < PW; x += 18 + ((hash(x, 1, 9)*8) | 0)) { O.push({ y:8, fn:() => treePx(a, x, 8, 9) }); O.push({ y:PH - 8, fn:() => treePx(a, x + 6, PH - 8, 9) }); }
     for(let y = 30; y < PH - 14; y += 20) { O.push({ y, fn:() => treePx(a, 8, y, 9) }); O.push({ y:y + 8, fn:() => treePx(a, PW - 8, y + 8, 9) }); }
     drawSorted(O);
   } },
 { name:'Grotte cristalline', rock:{ o:'#2a1e40', l:'#c4b6e4', m:'#8c7cb0', d:'#5e4e82' },
   fx:{ k:'sparkle', c:'#cfe6ff', n:26, s:2 },
   paint(a, R){
     const T = [0, 1, 2, 3].map(v => mkTile((i, j, h) => {
       const row = j >> 3, k = (i + (row%2)*8) & 15, jj = j & 7; let c = '#bbabcd';
       if(jj === 7 && k < 11) c = '#a698bc'; else if(jj === 6 && (k === 0 || k === 10)) c = '#a698bc'; else if(jj === 1 && k > 2 && k < 6) c = '#cabcdc';
       if(h < .04) c = '#a090b4'; if(v === 1 && i === 7 && j === 5) c = '#8a7aa4'; return c; }, v + 11));
     fillTiles(a, T, 4);
     a.fillStyle = 'rgba(255,255,255,.10)'; [.14, .44, .74].forEach(f => a.fillRect(Math.round(PW*f), 0, 34, PH));
     for(let i = 0; i < 4; i++) blobPx(a, 60 + R()*(PW - 120), 50 + R()*(PH - 100), 12 + ((R()*8) | 0), 4 + ((R()*3) | 0), { o:'#4a548c', l:'#a8b6f0', m:'#7a88c8', d:'#6670b4' });
     const O = [];
     scatter(a, R, 16, (x, y, r) => O.push({ y, fn:() => { shadowPx(a, x + 2, y, 6, 2); triPx(a, x, y, 7 + ((r()*5) | 0), 11 + ((r()*8) | 0), { o:'#2a1e40', l:'#b6a8d8', m:'#7a6aa0', d:'#54447a' }); } }));
     scatter(a, R, 9, (x, y, r) => O.push({ y, fn:() => { const c = { o:'#1e3a7a', l:'#e4f6ff', m:'#7ab8f0', d:'#4a80d0' }; shadowPx(a, x + 2, y, 8, 2); triPx(a, x - 4, y, 5, 9, c); triPx(a, x + 4, y, 6, 14, c); triPx(a, x, y + 1, 5, 10, c); } }));
     drawSorted(O);
     borderBlobs(a, { o:'#241a38', l:'#8a78b4', m:'#5e4e82', d:'#3a2c5a' }, 20, 14, 10);
   } },
 { name:'Désert', rock:{ o:'#5a3a22', l:'#e0b078', m:'#bd8a54', d:'#8e6238' },
   fx:{ k:'dust', c:'#fff0c0', n:22, s:2 },
   paint(a, R){
     const T = [0, 1, 2, 3].map(v => mkTile((i, j, h) => {
       let c = '#e6c677'; if(((j + Math.round(Math.sin(i/3 + v)*1.3)) % 6 + 6)%6 === 0) c = '#d8b262'; if(h < .04) c = '#c9a050'; else if(h > .97) c = '#f4dc98'; return c; }, v + 21));
     fillTiles(a, T, 5);
     for(let i = 0; i < 7; i++) blobPx(a, 50 + R()*(PW - 100), 50 + R()*(PH - 90), 40 + ((R()*30) | 0), 8 + ((R()*5) | 0), { o:'#c09848', l:'#f8e4a4', m:'#e8c97a', d:'#d9b266' });
     pondPx(a, Math.round(PW*.2), Math.round(PH*.72), 34, 16, ['#4aa8c8', '#80d4ec'], '#2f7a98', '#c8d488');
     const O = [];
     scatter(a, R, 11, (x, y, r) => O.push({ y, fn:() => cactusPx(a, x, y, 14 + ((r()*10) | 0)) }));
     scatter(a, R, 9, (x, y, r) => O.push({ y, fn:() => { shadowPx(a, x + 2, y + 3, 7, 2); blobPx(a, x, y, 6 + ((r()*4) | 0), 4 + ((r()*2) | 0), { o:'#5a3a22', l:'#e0b078', m:'#bd8a54', d:'#8e6238' }); } }));
     drawSorted(O);
     borderBlobs(a, { o:'#5a3a22', l:'#e0b078', m:'#bd8a54', d:'#8e6238' }, 22, 15, 10);
   } },
 { name:'Banquise', rock:{ o:'#3c6a96', l:'#f4fcff', m:'#bfe2f4', d:'#8cbcdc' },
   fx:{ k:'sparkle', c:'#ffffff', n:34, s:2 },
   paint(a, R){
     const T = [0, 1, 2, 3].map(v => mkTile((i, j, h) => {
       let c = '#c4e8f6'; if(((i - j + 32) % 16) < 2) c = '#e4f6ff'; if(h < .04) c = '#a8d8ee';
       if(v === 1 && (i + j === 15 || i + j === 16)) c = '#8fc4e0'; if(v === 2 && j === 7 && i > 3 && i < 12) c = '#8fc4e0'; return c; }, v + 31));
     fillTiles(a, T, 6);
     pondPx(a, Math.round(PW*.3), Math.round(PH*.3), 60, 28, ['#8cc8e8', '#e8f8ff'], '#5a9ec6', '#eaf8ff');
     pondPx(a, Math.round(PW*.78), Math.round(PH*.72), 44, 20, ['#8cc8e8', '#e8f8ff'], '#5a9ec6', '#eaf8ff');
     for(let i = 0; i < 9; i++) blobPx(a, 40 + R()*(PW - 80), 40 + R()*(PH - 70), 14 + ((R()*14) | 0), 4 + ((R()*3) | 0), { o:'#8cb8d8', l:'#ffffff', m:'#eaf6ff', d:'#c8e2f4' });
     const O = [];
     scatter(a, R, 12, (x, y, r) => O.push({ y, fn:() => pinePx(a, x, y, 26 + ((r()*10) | 0)) }));
     scatter(a, R, 8, (x, y, r) => O.push({ y, fn:() => { const c = { o:'#2a5a8c', l:'#ffffff', m:'#9fd4f4', d:'#6aaee0' }; shadowPx(a, x + 2, y, 7, 2); triPx(a, x - 3, y, 5, 8, c); triPx(a, x + 3, y, 6, 13, c); } }));
     drawSorted(O);
     borderBlobs(a, { o:'#3c6a96', l:'#f0faff', m:'#9fd0ec', d:'#6aaedc' }, 20, 14, 10);
   } },
 { name:'Cratère de lave', rock:{ o:'#140f18', l:'#7a6a86', m:'#3e3248', d:'#241c2e' },
   fx:{ k:'ember', c:'#ff9a3c', n:46, s:2 },
   paint(a, R){
     const T = [0, 1, 2, 3].map(v => mkTile((i, j, h) => {
       let c = '#46384a'; if((i + j*2 + v*5) % 13 === 0) c = '#54445a'; if(h < .04) c = '#382c3c'; else if(h > .97) c = '#5e4e64';
       if(v === 2 && (i === j || i === j + 1) && i > 3 && i < 12) c = '#ff7a2c'; if(v === 3 && j === 8 && i > 2 && i < 10) c = '#e0481c'; return c; }, v + 41));
     fillTiles(a, T, 7);
     for(let x = 0; x < PW; x++){ const yc = PH*.5 + Math.sin(x/55)*34 + Math.sin(x/17)*3;
       for(let y = Math.floor(yc - 14); y <= yc + 14; y++){ const d = Math.abs(y - yc);
         a.fillStyle = d < 3 ? '#fff0a0' : d < 6 ? '#ffd23c' : d < 9 ? '#ff8a2c' : d < 12 ? '#e0481c' : '#2a1a22'; a.fillRect(x, y, 1, 1); } }
     for(let i = 0; i < 3; i++) blobPx(a, 60 + R()*(PW - 120), 40 + R()*(PH - 80), 16 + ((R()*8) | 0), 8 + ((R()*3) | 0), { o:'#2a1a22', l:'#fff0a0', m:'#ff8a2c', d:'#e0481c' });
     const O = [];
     scatter(a, R, 12, (x, y, r) => O.push({ y, fn:() => { shadowPx(a, x + 2, y + 2, 7, 2); triPx(a, x, y, 8 + ((r()*5) | 0), 10 + ((r()*9) | 0), { o:'#140f18', l:'#8a7a96', m:'#4a3e56', d:'#2a2034' }); } }));
     drawSorted(O);
     borderBlobs(a, { o:'#140f18', l:'#6a5a78', m:'#3a2e48', d:'#241c30' }, 20, 14, 10);
     for(let i = 0; i < 40; i++){ a.fillStyle = '#ff6a2c'; a.fillRect(Math.floor(R()*PW), Math.floor(R()*4), 2, 1); a.fillRect(Math.floor(R()*PW), PH - 1 - Math.floor(R()*4), 2, 1); }
   } },
 { name:'Ruines', rock:{ o:'#3a3a48', l:'#c4c4d0', m:'#92929e', d:'#666674' },
   fx:{ k:'dust', c:'#e8f0ff', n:16, s:2 },
   paint(a, R){
     const T = [0, 1, 2, 3].map(v => mkTile((i, j, h) => {
       let c = (v%2) ? '#9a9aa8' : '#a2a2ae'; if(j === 0 || i === 0) c = '#b6b6c2'; else if(j === 15 || i === 15) c = '#6c6c7a'; else if(h < .05) c = '#8a8a98'; else if(h > .97) c = '#b0b0bc';
       if(v === 3 && ((i + j === 14 && i > 4) || (i + j === 13 && i > 5 && i < 11))) c = '#5a5a68'; return c; }, v + 51));
     fillTiles(a, T, 8);
     for(let i = 0; i < 9; i++) blobPx(a, 30 + R()*(PW - 60), 40 + R()*(PH - 70), 8 + ((R()*8) | 0), 3 + ((R()*2) | 0), { o:'#4a6a3a', l:'#9ad070', m:'#6f9a5a', d:'#58804a' });
     ringPx(a, PW/2, PH/2 + 8, 62, RUNE); ringPx(a, PW/2, PH/2 + 8, 44, RUNE);
     for(let i = 0; i < 8; i++){ const an = i*.785; for(let r = 44; r < 62; r++) a.fillRect(Math.round(PW/2 + Math.cos(an)*r), Math.round(PH/2 + 8 + Math.sin(an)*r), 1, 1); }
     const O = [];
     const pillar = (x, y, h, broken) => { shadowPx(a, x + 3, y, 9, 3); a.fillStyle = '#3a3a48'; a.fillRect(x - 6, y - h - 1, 13, h + 3); a.fillStyle = '#c4c4d0'; a.fillRect(x - 5, y - h, 11, h + 1); a.fillStyle = '#9a9aa8'; a.fillRect(x - 5, y - h, 4, h + 1); a.fillStyle = '#74747f'; a.fillRect(x + 3, y - h, 3, h + 1);
       a.fillStyle = '#3a3a48'; a.fillRect(x - 8, y - 4, 17, 5); a.fillStyle = '#b4b4c0'; a.fillRect(x - 7, y - 3, 15, 3); if(!broken){ a.fillStyle = '#3a3a48'; a.fillRect(x - 8, y - h - 5, 17, 5); a.fillStyle = '#d0d0da'; a.fillRect(x - 7, y - h - 4, 15, 3); } else { a.fillStyle = '#3a3a48'; a.fillRect(x - 5, y - h - 2, 6, 2); } };
     [[30, 40], [PW - 30, 40], [30, PH - 24], [PW - 30, PH - 24], [PW*.3, 36], [PW*.7, 36], [PW*.3, PH - 20], [PW*.7, PH - 20]].forEach((q, i) => O.push({ y:q[1], fn:() => pillar(Math.round(q[0]), q[1], 26 + (i%3)*4, i%3 === 1) }));
     scatter(a, R, 9, (x, y, r) => O.push({ y, fn:() => { shadowPx(a, x + 2, y + 2, 8, 2); blobPx(a, x, y, 6 + ((r()*4) | 0), 4, { o:'#3a3a48', l:'#c4c4d0', m:'#92929e', d:'#666674' }); } }));
     drawSorted(O);
     for(let x = 0; x < PW; x += 10) for(let row = 0; row < 2; row++){ const bx = x + (row%2)*5; a.fillStyle = '#4a3a34'; a.fillRect(bx, row*5, 10, 5); a.fillStyle = (hash(bx, row, 7) > .5) ? '#8a6a58' : '#7a5a4a'; a.fillRect(bx + 1, row*5 + 1, 8, 3);
       a.fillStyle = '#4a3a34'; a.fillRect(bx, PH - 10 + row*5, 10, 5); a.fillStyle = (hash(bx, row, 8) > .5) ? '#8a6a58' : '#7a5a4a'; a.fillRect(bx + 1, PH - 9 + row*5, 8, 3); }
     for(let y = 10; y < PH - 10; y += 6) for(let row = 0; row < 2; row++){ const by = y + (row%2)*3; a.fillStyle = '#4a3a34'; a.fillRect(row*8, by, 8, 6); a.fillStyle = '#7a5a4a'; a.fillRect(row*8 + 1, by + 1, 6, 4); a.fillStyle = '#4a3a34'; a.fillRect(PW - 16 + row*8, by, 8, 6); a.fillStyle = '#7a5a4a'; a.fillRect(PW - 15 + row*8, by + 1, 6, 4); }
   } }
];

function makeArena(w){
  curArena = ((w % ARENAS.length) + ARENAS.length) % ARENAS.length; const A = ARENAS[curArena];
  const c = document.createElement('canvas'); c.width = PW; c.height = PH; const a = c.getContext('2d'); a.imageSmoothingEnabled = false;
  const R = rng(1234 + curArena*77 + ((Math.random()*1000) | 0));
  A.paint(a, R);
  const b = bg.getContext('2d'); b.imageSmoothingEnabled = false; b.clearRect(0, 0, W, H); b.drawImage(c, 0, 0, W, H);
  const g = b.createRadialGradient(W/2, H/2, H*.42, W/2, H/2, W*.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)'); b.fillStyle = g; b.fillRect(0, 0, W, H);
  ARENA_FX = []; for(let i = 0; i < A.fx.n; i++) ARENA_FX.push({ x:R()*PW, y:R()*PH, o:R()*100, k:A.fx.k, c:A.fx.c, s:A.fx.s });
}

// ---------- rochers (obstacles destructibles) ----------
const RK = {};
function rockSprite(k){
  if(RK[k]) return RK[k];
  const c = document.createElement('canvas'); c.width = 18; c.height = 16; const a = c.getContext('2d'), P = ARENAS[k].rock;
  blobPx(a, 9, 8, 7, 6, P); blobPx(a, 6, 6, 3, 2, { o:P.m, l:P.l, m:P.l, d:P.m });
  return RK[k] = c;
}
function drawRocks(){
  ctx.imageSmoothingEnabled = false; const s = rockSprite(curArena);
  for(const r of rocks){
    if(r.hp <= 0) continue;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(r.x + 4, r.y + 13, 18, 6, 0, 0, 6.3); ctx.fill();
    ctx.drawImage(s, Math.round(r.x - 18), Math.round(r.y - 17), 36, 32);
    if(r.hp < r.m*.6){ ctx.strokeStyle = '#14101c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x - 5, r.y - 11); ctx.lineTo(r.x, r.y - 1); ctx.lineTo(r.x - 3, r.y + 9); ctx.moveTo(r.x, r.y - 1); ctx.lineTo(r.x + 8, r.y + 4); ctx.stroke(); }
  }
  drawArenaFx();
}
// braises, étincelles, poussières : petits effets animés par-dessus le décor
function drawArenaFx(){
  const t = G ? G.time : 0;
  for(const f of ARENA_FX){
    let x = f.x*2, y = f.y*2, al = 1;
    if(f.k === 'ember'){ const u = (t*22 + f.o*2) % 90; y -= u; x += Math.sin(t*2 + f.o)*6; al = 1 - u/90; }
    else if(f.k === 'sparkle') al = .5 + .5*Math.sin(t*3 + f.o);
    else { x += Math.sin(t*.8 + f.o)*10; y += Math.cos(t*.6 + f.o)*6; al = .45; }
    ctx.globalAlpha = Math.max(0, al); ctx.fillStyle = f.c; ctx.fillRect(Math.round(x), Math.round(y), f.s, f.s);
  }
  ctx.globalAlpha = 1;
}
