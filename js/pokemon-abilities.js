// ============================================================
//  CAPACITÉS SPÉCIALES (champ `ability` dans data/pokemon*.js)
//    critBonus : +x de chance de critique sur les attaques ayant un champ `crit`
//    lowHp     : { below, type, mult, label } -> sous x % de PV, attaques de ce type x mult      (js/pokemon-moves.js)
//    lastStand : { below, invuln, heal, label } -> 1 fois par combat, sous x % PV : invulnérable + soin
//    absorb    : { type, heal } -> les attaques de ce type soignent au lieu de blesser
//    onHurt    : { speedBoost, time } -> quand il est touché, gagne de la vitesse pendant `time` secondes (joueur)
//  Pour inventer une nouvelle capacité : ajoute un champ dans `ability` puis traite-le ici.
// ============================================================
function abilityOf(o){ const P = POKEMON[o.t]; return P && P.ability; }

const _hP = hurtP;
hurtP = function(d, b){
  const p0 = G.p, ab0 = abilityOf(p0);
  if(ab0 && ab0.absorb && b.t === ab0.absorb.type && p0.hp > 0){
    p0.hp = Math.min(p0.max, p0.hp + p0.max*(ab0.absorb.heal || .1)); dmgTxt(p0.x, p0.y - 50, ab0.name.toUpperCase() + ' !', '#9fe8ff'); return;
  }
  const r = _hP(d, b), p = G.p, ab = abilityOf(p);
  if(!r && ab && ab.lastStand && !p.lsUsed && p.hp > 0 && p.hp < p.max * ab.lastStand.below){
    p.lsUsed = 1; p.inv = ab.lastStand.invuln || 1;
    p.hp = Math.min(p.max, p.hp + p.max * (ab.lastStand.heal || 0));
    dmgTxt(p.x, p.y - 50, ab.lastStand.label || ab.name.toUpperCase() + ' !', '#9fffa0');
  }
  if(!r && ab && ab.onHurt && p.hp > 0 && p === p0){
    p.boost = G.time + (ab.onHurt.time || 2); p.boostK = 1 + (ab.onHurt.speedBoost || .3);
  }
  return r;
};

const _hE = hurtE;
hurtE = function(d, b){
  const e = G.e; if(e.invT > G.time) return;
  const ab0 = abilityOf(e);
  if(ab0 && ab0.absorb && b.t === ab0.absorb.type && e.hp > 0){
    e.hp = Math.min(e.max, e.hp + e.max*(ab0.absorb.heal || .1)); dmgTxt(e.x, e.y - 50, ab0.name.toUpperCase() + ' !', '#9fe8ff'); return;
  }
  const r = _hE(d, b), ab = abilityOf(e);
  if(!r && ab && ab.lastStand && !e.lsUsed && e.hp > 0 && e.hp < e.max * ab.lastStand.below){
    e.lsUsed = 1; e.invT = G.time + (ab.lastStand.invuln || 1);
    e.hp = Math.min(e.max, e.hp + e.max * (ab.lastStand.heal || 0));
    dmgTxt(e.x, e.y - 50, ab.lastStand.label || ab.name.toUpperCase() + ' !', '#9fffa0');
  }
  return r;
};
