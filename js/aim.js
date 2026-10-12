// ============================================================
//  VISÉE — glisser le doigt depuis un bouton d'attaque (A/B/C) pour viser, relâcher pour tirer.
//    • simple appui  = tir assisté : part vers la position ACTUELLE de l'ennemi (rate si l'ennemi bouge)
//    • glisser + relâcher = tir précis : direction choisie, +25 % de dégâts ; la longueur du glissé
//      règle la portée des attaques à zone (Tonnerre, Vol…)
//  Sur ordinateur : bouge la souris, puis J/K/L tirent vers le curseur.
// ============================================================
const AIM = {
  on:[0, 0, 0], a:[0, 0, 0], r:[0, 0, 0], c:[[0, 0], [0, 0], [0, 0]], mouse:null, mouseT:0,
  start(i, b){ const rc = b.getBoundingClientRect(); this.c[i] = [rc.left + rc.width/2, rc.top + rc.height/2]; this.on[i] = 0; },
  move(i, e){
    let dx = e.clientX - this.c[i][0], dy = e.clientY - this.c[i][1];
    if(innerHeight > innerWidth){ const q = dx; dx = dy; dy = -q; }          // jeu pivoté en portrait
    const m = Math.hypot(dx, dy);
    if(m > 24){ this.on[i] = 1; this.a[i] = Math.atan2(dy, dx); this.r[i] = Math.min(1, (m - 24)/110); } else this.on[i] = 0;
  },
  stop(i){ this.on[i] = 0; },
  key(i){      // clavier + souris
    if(!this.mouse || performance.now() - this.mouseT > 4000 || !G || G.over) return;
    const p = G.p, dx = this.mouse.x + CAM.x - p.x, dy = this.mouse.y + CAM.y - p.y;
    this.on[i] = 1; this.a[i] = Math.atan2(dy, dx); this.r[i] = Math.min(1, Math.max(0, (Math.hypot(dx, dy) - 40)/260));
  },
  take(i, p, e){
    const manual = !!this.on[i]; let ang, range;
    if(manual){ ang = this.a[i]; range = 60 + this.r[i]*260; }
    else { ang = Math.atan2(e.y - p.y, e.x - p.x); range = Math.hypot(e.x - p.x, e.y - p.y); }
    this.on[i] = 0; return { manual, ang, range };
  }
};
cv.addEventListener('mousemove', e => {
  const r = cv.getBoundingClientRect(), s = Math.min(r.width/VW, r.height/VH), ox = r.left + (r.width - VW*s)/2, oy = r.top + (r.height - VH*s)/2;
  AIM.mouse = { x:(e.clientX - ox)/s, y:(e.clientY - oy)/s }; AIM.mouseT = performance.now();
});

function drawAim(){
  if(!G || G.over) return;
  const p = G.p;
  for(let i = 0; i < 3; i++){
    if(!AIM.on[i] || !down[i]) continue;
    const m = p.mv[i], len = 60 + AIM.r[i]*260;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(AIM.a[i]); ctx.globalAlpha = .85;
    ctx.strokeStyle = COL[m.tp || p.t] || '#fff'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(len, 0); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(len, 0, 6, 0, 6.283); ctx.stroke(); ctx.restore();
  }
}
const _dbAim = drawBullets;
drawBullets = function(){ _dbAim(); drawAim(); };
