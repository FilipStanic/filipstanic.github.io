// ============================================================
//  NIVEAUX SOLO — de plus en plus durs. Modifie, ajoute ou retire des niveaux ici.
//  Chaque niveau = une série de combats (3 en mode 3v3, 6 en mode 6v6) contre une équipe
//  de la même taille que la tienne ; le dernier adversaire est un boss.
//    name   : nom du niveau            arena  : 0 prairie, 1 grotte, 2 désert, 3 banquise, 4 lave, 5 ruines
//    hp     : multiplicateur de PV ennemis       dmg    : multiplicateur de dégâts ennemis
//    speed  : vitesse de déplacement ennemie     pspeed : vitesse de leurs projectiles
//    rate   : délai entre attaques (plus petit = plus agressif)    tele : durée du signal d'attaque (plus petit = plus dur à lire)
//    aim    : 0..1, l'ennemi anticipe ton déplacement (1 = vise très bien)
//    boss   : multiplicateur de PV du boss final
// ============================================================
const STAGE_DEFAULT = { name:'Entraînement', level:1, arena:0, hp:1, dmg:1, speed:1, pspeed:1, rate:1, tele:1, aim:0, boss:2.2 };

const STAGE_NAMES = ['Prairie', 'Grotte cristalline', 'Désert brûlant', 'Banquise', 'Route des collines',
                     'Cratère de lave', 'Ruines anciennes', 'Lac gelé', 'Arène des champions', 'Ligue des maîtres'];
// Décor de chaque niveau (voir ARENAS dans js/arena.js) : 0 prairie, 1 grotte, 2 désert, 3 banquise, 4 lave, 5 ruines
const STAGE_ARENAS = [0, 1, 2, 3, 0, 4, 5, 3, 5, 4];

// Difficulté générée automatiquement (progressive). Remplace par une liste écrite à la main si tu veux.
const STAGES = STAGE_NAMES.map((name, i) => {
  const t = i / (STAGE_NAMES.length - 1), f = x => +x.toFixed(2);
  return { name, level:Math.ceil((i + 1)/2), arena:STAGE_ARENAS[i],
    hp:f(.8 + t*.9), dmg:f(.7 + t*.8), speed:f(.8 + t*.55), pspeed:f(.85 + t*.55),
    rate:f(1.3 - t*.6), tele:f(1.2 - t*.45), aim:f(Math.min(1, t*1.1)), boss:f(1.8 + t*1.4) };
});
