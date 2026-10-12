// ============================================================
//  AFFICHAGE ANIMÉ DES POKÉMON (sprites PMD) : choix de l'animation, de la direction (8 sens),
//  recadrage des images. Les anciennes créatures dessinées par code gardent leur rendu d'origine.
//  Animations utilisées (nom par défaut, modifiable via `anims` dans data/pokemon.js) :
//    idle:Idle  walk:Walk  hurt:Hurt  faint:Faint  charge:Charge  dash:Hop  fly:Hop  pain:Pain
//    spawn:Wake  swap:Double   (+ l'animation indiquée dans chaque attaque)
//  Si une animation n'existe pas dans le dossier, on retombe sur Hurt/Idle automatiquement.
// ============================================================
const ANIM_DEFAULT = { idle:'Idle', walk:'Walk', hurt:'Hurt', faint:'Faint', charge:'Charge', dash:'Hop', fly:'Hop', pain:'Pain', spawn:'Wake', swap:'Double' };

function animName(S, key, fallback){
  const n = (S.def.anims && S.def.anims[key]) || ANIM_DEFAULT[key];
  return resolveAnim(S, n) || resolveAnim(S, fallback) || 'Idle';
}
// direction : 0 bas, 1 bas-droite, 2 droite, 3 haut-droite, 4 haut, 5 haut-gauche, 6 gauche, 7 bas-gauche
function rowOf(a){ return (((Math.round((90 - a*180/Math.PI)/45)) % 8) + 8) % 8; }
function frameAt(S, an, tk, loop){
  const d = S.D.anim[an], T = S.TOT[an]; if(loop) tk = ((tk % T) + T) % T;
  let acc = 0; for(let i = 0; i < d.dur.length; i++){ acc += d.dur[i]; if(tk < acc) return i; }
  return d.dur.length - 1;
}
function snFrame(id, an, row, fi){
  const S = SPR[id], d = S.D.anim[an], im = S.IM[an], key = an + row + '_' + fi;
  if(S.SC[key]) return S.SC[key];
  const C = S.D.cs, cv = document.createElement('canvas'); cv.width = cv.height = C;
  cv.sy = 14; cv.sw = S.D.sw; cv.sh = S.D.sh;                      // taille/position de l'ombre au sol
  if(!im || !im.complete || !im.naturalWidth) return cv;
  const nr = Math.floor(im.naturalHeight/d.fh), r = nr >= 8 ? row : 0;
  const a2 = (S.D.anc[an] && S.D.anc[an][r] && S.D.anc[an][r][fi]) || [d.fw/2, d.fh*.72];
  cv.getContext('2d').drawImage(im, fi*d.fw, r*d.fh, d.fw, d.fh, Math.round(C/2 - a2[0]), Math.round(C/2 + 14 - a2[1]), d.fw, d.fh);
  return S.SC[key] = cv;
}

const _mon = mon;
mon = function(o, en){
  const S = SPR[o.t]; if(!S) return _mon(o, en);
  const T = S.TOT, t = G.time, wk = (o.wm || 0) > .25;
  const tx = o.tx ?? (en ? 0 : W), ty = o.ty ?? o.y, row = rowOf(Math.atan2(ty - o.y, tx - o.x));
  let an, tk, loop = 1;
  if(o.hp <= 0){ if(o.ko === undefined) o.ko = t; an = animName(S, 'faint', 'Hurt'); tk = (t - o.ko)*72; loop = 0; }
  else if(o.ann && (an = resolveAnim(S, o.ann.an) || 'Idle', (t - o.ann.t0)*60*AS < T[an])){ tk = (t - o.ann.t0)*60*AS; loop = 0; }
  else if(o.fl){ an = animName(S, 'fly', 'Idle'); tk = Math.min(.99, (t - o.fl.t0)/o.fl.tot)*T[an]; loop = 0; }
  else if(o.rs){ an = resolveAnim(S, o.rs.an) || 'Attack'; tk = rsTick(o.rs, t - o.rs.t0); loop = 0; }
  else if(o.hitT > 0){ an = animName(S, 'hurt', 'Idle'); tk = (.2 - o.hitT)*60; loop = 0; }
  else if(o.dT > 0){ an = animName(S, 'dash', 'Idle'); tk = (.2 - o.dT)/.2*T[an]; loop = 0; }
  else if(o.ch && Math.max(...o.ch) > 0){ an = animName(S, 'charge', 'Idle'); tk = Math.min(.99, Math.max(...o.ch))*S.CUM[an][Math.min(5, S.CUM[an].length - 1)]; loop = 0; }
  else if(o.st && !wk){ an = animName(S, 'pain', 'Hurt'); tk = t*30; }
  else if(wk){ an = animName(S, 'walk', 'Idle'); tk = t*60*AS; }
  else { an = animName(S, 'idle', 'Idle'); tk = t*48; }
  return snFrame(o.t, an, row, frameAt(S, an, tk, loop));
};

// Miniature (menu + HUD) = 1re image d'Idle, de face
const TH = {}, _spr = spr;
spr = function(t, b){
  const S = SPR[t]; if(!S) return _spr(t, b);
  const cv = TH[t] || (TH[t] = document.createElement('canvas')), im = S.IM.Idle, d = S.D.anim.Idle;
  cv.width = cv.height = 48; const c = cv.getContext('2d'); c.clearRect(0, 0, 48, 48);
  if(im && im.complete && im.naturalWidth){ const k = Math.min(1, 48/Math.max(d.fw, d.fh)), w = d.fw*k, h = d.fh*k; c.drawImage(im, 0, 0, d.fw, d.fh, (48 - w)/2, (48 - h)/2, w, h); }
  return cv;
};

// Pas de rotation/déformation pour les sprites PMD (la direction vient de la feuille de sprites)
const _an = animOf;
animOf = function(o, tx, ty, en){
  o.tx = tx; o.ty = ty; const r = _an(o, tx, ty, en);
  if(SPR[o.t]){ r.rot = 0; r.sx = 1; r.sy = 1; r.oy = o.fl ? (o.fl.oy || 0) : 0; r.ox = o.hitT > 0 ? (Math.random() - .5)*5 : 0; }
  return r;
};

// Animations d'entrée en jeu
const _ds = doSwap;
doSwap = function(n){ _ds(n); const S = SPR[n.t]; if(S) n.ann = { an:animName(S, 'swap', 'Idle'), t0:G.time }; };
const _spw = spawn;
spawn = function(){ _spw(); const S = SPR[G.e.t]; if(S) G.e.ann = { an:animName(S, 'spawn', 'Idle'), t0:G.time }; };
