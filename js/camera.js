// ============================================================
//  camera.js — Caméra : le monde (1280x720) est plus grand que l'écran (640x360).
//  La caméra suit un point entre toi et l'ennemi ; une flèche rouge indique l'ennemi s'il sort de l'écran.
// ============================================================
const CAM = { x:0, y:0, init:false };
function updCam(p, e){
  const fx = p.x*.6 + e.x*.4, fy = p.y*.6 + e.y*.4;
  const tx = Math.max(0, Math.min(W - VW, fx - VW/2)), ty = Math.max(0, Math.min(H - VH, fy - VH/2));
  if(!CAM.init){ CAM.x = tx; CAM.y = ty; CAM.init = true; }
  else { CAM.x += (tx - CAM.x)*.14; CAM.y += (ty - CAM.y)*.14; }
}
function offscreenArrow(p, e){
  const sx = e.x - CAM.x, sy = e.y - CAM.y;
  if(sx > 16 && sx < VW - 16 && sy > 16 && sy < VH - 16) return;
  const cx = VW/2, cy = VH/2, a = Math.atan2(sy - cy, sx - cx);
  const k = Math.min((VW/2 - 22)/Math.abs(Math.cos(a) || 1e-6), (VH/2 - 22)/Math.abs(Math.sin(a) || 1e-6));
  ctx.save(); ctx.translate(cx + Math.cos(a)*k, cy + Math.sin(a)*k); ctx.rotate(a);
  ctx.fillStyle = '#ff5a4a'; ctx.strokeStyle = '#14101c'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, -9); ctx.lineTo(-4, 0); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
