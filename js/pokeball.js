// ============================================================
//  pokeball.js — Animations de Pokéball : rappel (rayon rouge dans la ball) + envoi (ball lancée qui s'ouvre
//  dans un flash, le Pokémon apparaît). Utilisé pour la Relève, l'entrée automatique après un K.O. et l'arrivée
//  de chaque ennemi. Le joueur est invulnérable et bloqué pendant l'animation.
//  Réglage des durées : constantes en haut de la fonction updSwap.
// ============================================================
const TC = new WeakMap();
function tint(s, col){
  let m = TC.get(s); if(!m){ m = {}; TC.set(s, m); }
  if(m[col]) return m[col];
  const c = document.createElement('canvas'); c.width = s.width; c.height = s.height; const x = c.getContext('2d');
  x.drawImage(s, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return m[col] = c;
}
function drawBall(x, y, r, open, spin){
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin || 0);
  const half = (top) => { ctx.beginPath(); ctx.arc(0, 0, r, top ? Math.PI : 0, top ? 6.283 : Math.PI); ctx.closePath(); ctx.fillStyle = top ? '#e8403c' : '#f4f4f4'; ctx.fill(); ctx.strokeStyle = '#14101c'; ctx.lineWidth = 2; ctx.stroke(); };
  if(open > 0){
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .9*open; ctx.drawImage(glow('#ffffff'), -r*3, -r*3, r*6, r*6); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    half(false); ctx.save(); ctx.translate(-r, 0); ctx.rotate(-open*1.2); ctx.translate(r, 0); half(true); ctx.restore();
  } else { half(false); half(true); }
  ctx.fillStyle = '#14101c'; ctx.fillRect(-r, -1.5, r*2, 3); ctx.beginPath(); ctx.arc(0, 0, r*.32, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
  ctx.restore();
}
function stars(x, y, n, col){ burst(n, (i, a) => vp({ x, y, vx:Math.cos(a)*R_(60, 160), vy:Math.sin(a)*R_(60, 160), life:R_(.4, .7), s:R_(5, 9), s1:2, kind:'star', col:col || '#fff6c0', rot:a, vr:5, fr:2 })); }

// ----- relève du joueur -----
const _doSwapB = doSwap;
doSwap = function(n){
  if(!G || G.sw) return;
  const o = G.p, ko = o.hp <= 0;
  G.sw = { from:o, to:n, t0:G.time, x:o.x, y:o.y, ko, did:false, ev:{} };
  G.swc = 3; down[0] = down[1] = down[2] = 0;
  if(!ko){ o.inv = 3; o.hid = true; playSfx('recall'); }
};
function updSwap(){
  const S = G && G.sw; if(!S) return;
  const t = G.time - S.t0, tSwap = S.ko ? .9 : .55, tThrow = .35, tEmerge = .4, tEnd = tSwap + tThrow + tEmerge;
  if(!S.did && t >= tSwap){
    S.did = true; _doSwapB(S.to); S.from.hid = false; S.to.hid = true; S.to.inv = 1.2;
    playSfx('throw');
  }
  if(S.did) S.to.inv = Math.max(S.to.inv, .2);
  if(t >= tSwap + tThrow && !S.ev.open){ S.ev.open = true; playSfx('ball_open'); flashScreen(.25); stars(S.x, S.y, 14); vp({ x:S.x, y:S.y, life:.4, s:10, s1:70, kind:'ring', col:'#ffffff' }); }
  if(t >= tEnd){ S.to.hid = false; S.from.hid = false; G.sw = null; }
}
function drawSwap(){
  const S = G && G.sw; if(!S) return; const t = G.time - S.t0, tSwap = S.ko ? .9 : .55, tThrow = .35, tEmerge = .4, o = S.from, k = 2;
  if(!S.ko && t < tSwap){                                           // rappel : silhouette rouge aspirée dans la ball
    const u = Math.min(1, t/.4), bx = S.x, by = S.y - 46, fr = mon(o, 0), sc = k*(1 - u*.92);
    ctx.save(); ctx.globalAlpha = .9 - u*.3; ctx.translate(S.x + (bx - S.x)*u*.7, S.y + (by - S.y)*u); ctx.drawImage(tint(fr, '#ff4a3a'), -fr.width*sc/2, -fr.height*sc/2, fr.width*sc, fr.height*sc); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,70,50,${.8*(1 - u)})`; ctx.lineWidth = 8*(1 - u) + 2; ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(bx, by); ctx.stroke(); ctx.restore();
    drawBall(bx, by, 9, t > .4 ? 0 : (1 - u), 0);
    if(t > .4){ ctx.save(); ctx.globalAlpha = Math.max(0, 1 - (t - .4)/.15); ctx.drawImage(glow('#ffffff'), bx - 26, by - 26, 52, 52); ctx.restore(); }
  }
  if(S.did){                                                         // envoi : la ball arrive, s'ouvre, le Pokémon sort
    const tt = t - tSwap, n = S.to;
    if(tt < tThrow){ const u = tt/tThrow, bx = S.x - 60*(1 - u), by = S.y - 120*(1 - u)*(1 - u*.2) + 6*u; drawBall(bx, by, 9, 0, u*12); }
    else {
      const u = Math.min(1, (tt - tThrow)/tEmerge), fr = mon(n, 0), sc = k*(.3 + .7*(1 - Math.pow(1 - u, 2)));
      drawBall(S.x, S.y - 14*u, 9, Math.max(0, 1 - u*1.5), 0);
      ctx.save(); ctx.globalAlpha = Math.min(1, 1.3 - u*.3); ctx.translate(S.x, S.y); ctx.drawImage(tint(fr, u < .6 ? '#ffffff' : '#ffe8e8'), -fr.width*sc/2, -fr.height*sc/2, fr.width*sc, fr.height*sc);
      ctx.globalAlpha = (1 - u)*.9; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow('#ffffff'), -50, -50, 100, 100); ctx.restore();
    }
  }
}
// ----- arrivée de l'ennemi : sort d'une Pokéball -----
const _spawnB = spawn;
spawn = function(){
  _spawnB(); const e = G.e; e.hid = true; G.em = { e, t0:G.time, ev:false };
};
function updEmerge(){
  const M = G && G.em; if(!M) return; const t = G.time - M.t0;
  if(t >= .3 && !M.ev){ M.ev = true; playSfx('ball_open'); stars(M.e.x, M.e.y, 16); vp({ x:M.e.x, y:M.e.y, life:.45, s:10, s1:90, kind:'ring', col:'#ffffff' }); flashScreen(.2); }
  if(t >= .75){ M.e.hid = false; G.em = null; }
}
function drawEmerge(){
  const M = G && G.em; if(!M) return; const t = G.time - M.t0, e = M.e;
  if(t < .3){ const u = t/.3; drawBall(e.x, e.y - 90*(1 - u)*(1 - u), 11, 0, u*10); }
  else { const u = Math.min(1, (t - .3)/.45), fr = mon(e, 1), sc = (e.boss ? 3 : 2)*(.3 + .7*(1 - Math.pow(1 - u, 2)));
    drawBall(e.x, e.y - 14*u, 11, Math.max(0, 1 - u*1.4), 0);
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(Math.PI*0); ctx.globalAlpha = Math.min(1, 1.3 - u*.3); ctx.drawImage(tint(fr, '#ffffff'), -fr.width*sc/2, -fr.height*sc/2, fr.width*sc, fr.height*sc);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - u); ctx.drawImage(glow('#ffffff'), -60, -60, 120, 120); ctx.restore(); }
}
// ----- branchements -----
const _stepB = step;
step = function(dt){
  if(G && G.sw){                                 // joueur bloqué pendant l'animation
    const p = G.p, x = p.x, y = p.y; _stepB(dt); if(G && !G.over){ p.x = x; p.y = y; }
  } else _stepB(dt);
  if(G && !G.over){ updSwap(); updEmerge(); }
};
const _pressB = press; press = function(i){ if(G && G.sw) return; _pressB(i); };
const _dashB = dash; dash = function(){ if(G && G.sw) return; _dashB(); };
const _dbB = drawBullets; drawBullets = function(){ _dbB(); drawSwap(); drawEmerge(); };
