// ============================================================
//  TYPES — tableau complet des 18 types (clés en français)
//  Pour ajouter / corriger un type : modifie uniquement ce fichier.
// ============================================================
const TYPE_NAMES = {
  normal:'Normal', feu:'Feu', eau:'Eau', foudre:'Électrik', plante:'Plante', glace:'Glace',
  combat:'Combat', poison:'Poison', sol:'Sol', vol:'Vol', psy:'Psy', insecte:'Insecte',
  roche:'Roche', spectre:'Spectre', dragon:'Dragon', tenebres:'Ténèbres', acier:'Acier', fee:'Fée'
};

// Couleur utilisée pour les projectiles, pastilles de type, effets…
const TYPE_COLORS = {
  normal:'#c8c8c8', feu:'#e8603c', eau:'#3b8fd9', foudre:'#e3b72a', plante:'#5aa845', glace:'#9fe3ff',
  combat:'#c04030', poison:'#a050c0', sol:'#c8a060', vol:'#a8b8ff', psy:'#f070a0', insecte:'#a8c030',
  roche:'#b8a860', spectre:'#705898', dragon:'#6a5acd', tenebres:'#8a5ac8', acier:'#b8b8d0', fee:'#f0a8d0'
};

// x2 = super efficace, x05 = peu efficace, x0 = aucun effet (type attaquant -> types défenseurs)
const TYPE_CHART = {
  normal:  { x2:[], x05:['roche','acier'], x0:['spectre'] },
  feu:     { x2:['plante','glace','insecte','acier'], x05:['feu','eau','roche','dragon'], x0:[] },
  eau:     { x2:['feu','sol','roche'], x05:['eau','plante','dragon'], x0:[] },
  foudre:  { x2:['eau','vol'], x05:['foudre','plante','dragon'], x0:['sol'] },
  plante:  { x2:['eau','sol','roche'], x05:['feu','plante','poison','vol','insecte','dragon','acier'], x0:[] },
  glace:   { x2:['plante','sol','vol','dragon'], x05:['feu','eau','glace','acier'], x0:[] },
  combat:  { x2:['normal','glace','roche','tenebres','acier'], x05:['poison','vol','psy','insecte','fee'], x0:['spectre'] },
  poison:  { x2:['plante','fee'], x05:['poison','sol','roche','spectre'], x0:['acier'] },
  sol:     { x2:['feu','foudre','poison','roche','acier'], x05:['plante','insecte'], x0:['vol'] },
  vol:     { x2:['plante','combat','insecte'], x05:['foudre','roche','acier'], x0:[] },
  psy:     { x2:['combat','poison'], x05:['psy','acier'], x0:['tenebres'] },
  insecte: { x2:['plante','psy','tenebres'], x05:['feu','combat','poison','vol','spectre','acier','fee'], x0:[] },
  roche:   { x2:['feu','glace','vol','insecte'], x05:['combat','sol','acier'], x0:[] },
  spectre: { x2:['psy','spectre'], x05:['tenebres'], x0:['normal'] },
  dragon:  { x2:['dragon'], x05:['acier'], x0:['fee'] },
  tenebres:{ x2:['psy','spectre'], x05:['combat','tenebres','fee'], x0:[] },
  acier:   { x2:['glace','roche','fee'], x05:['feu','eau','foudre','acier'], x0:[] },
  fee:     { x2:['combat','dragon','tenebres'], x05:['feu','poison','acier'], x0:[] }
};

// Types d'une créature : ['feu','vol'] pour un Pokémon de data/pokemon.js, sinon [id] (créatures d'origine).
function typesOf(id){ return (typeof POKEMON !== 'undefined' && POKEMON[id]) ? POKEMON[id].types : [id]; }

// Multiplicateur d'un type d'attaque contre un défenseur.
// `def` peut être un type ('feu') OU l'id d'un Pokémon de data/pokemon.js (double type géré).
function typeMult(att, def){
  const defTypes = typesOf(def);
  const c = TYPE_CHART[att]; if(!c) return 1;
  let m = 1;
  for(const t of defTypes){
    if(c.x0.includes(t)) m *= 0;
    else if(c.x2.includes(t)) m *= 2;
    else if(c.x05.includes(t)) m *= .5;
  }
  return m;
}

// Complète les tables du moteur (couleurs, noms) pour les types absents.
function registerTypes(){
  Object.keys(TYPE_COLORS).forEach(k => { if(!COL[k]) COL[k] = TYPE_COLORS[k]; });
  Object.keys(TYPE_NAMES).forEach(k => { if(!TN[k]) TN[k] = TYPE_NAMES[k]; });
}
