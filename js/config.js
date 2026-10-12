// ============================================================
//  config.js — Constantes du jeu (taille de l'arène, canvas), couleurs, créatures d'origine (Pyrex, Aquor, Floria, Voltus) et leurs attaques.
// ============================================================
const W=1280,H=720,VW=640,VH=360,cv=document.getElementById('cv'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
const COL={feu:'#e8603c',eau:'#3b8fd9',plante:'#5aa845',foudre:'#e3b72a'};
const mult=(a,d)=>typeMult(a,d);   // multiplicateur de type (voir data/types.js)
const NAME={feu:'Pyrex',eau:'Aquor',plante:'Floria',foudre:'Voltus'};
const HERO={feu:{hp:100,sp:150},eau:{hp:125,sp:125},plante:{hp:110,sp:135},foudre:{hp:90,sp:175}};
const MV={
feu:[{n:'Braise',k:'shot',d:9,cd:.35,s:330},{n:'Éventail',k:'spread',d:7,cd:1.5,s:280},{n:'Nova',k:'big',d:26,cd:3.5,s:200}],
eau:[{n:'Jet',k:'shot',d:8,cd:.3,s:360},{n:'Vagues',k:'spread',d:7,cd:1.3,s:290},{n:'Raz-de-marée',k:'big',d:24,cd:3.2,s:220,pierce:1}],
plante:[{n:'Feuille',k:'shot',d:8,cd:.32,s:340},{n:'Pollen',k:'spread',d:6,cd:1.2,s:260},{n:'Liane',k:'big',d:22,cd:3,s:180,home:1}],
foudre:[{n:'Éclair',k:'shot',d:7,cd:.22,s:420},{n:'Arc',k:'spread',d:6,cd:1.1,s:320},{n:'Foudre',k:'big',d:28,cd:3.8,s:260}]};
const TN={feu:'Feu',eau:'Eau',plante:'Plante',foudre:'Foudre'};   // noms de types (complétés par data/types.js)
Object.values(HERO).forEach(h=>h.sp*=1.25);
Object.values(MV).flat().forEach(m=>{m.s*=1.25;m.cd*=.8});
const tw=(t,i,o)=>Object.assign(MV[t][i],o);
tw('feu',0,{n:'Braise',k:'shot'});
tw('feu',1,{n:'Lance-flammes',k:'flame',cd:1.6,d:8});
tw('feu',2,{n:'Météore',k:'meteor',cd:3.6,d:24});
tw('eau',0,{n:'Hydrocanon',k:'shot'});
tw('eau',1,{n:'Houle',k:'wave',cd:1.3,d:8});
tw('eau',2,{n:'Raz-de-marée',k:'tide',cd:3.4,d:22});
tw('plante',0,{n:'Tranch’herbe',k:'leaf'});
tw('plante',1,{n:'Spores',k:'spore',cd:1.5,d:7});
tw('plante',2,{n:'Vampigraine',k:'drain',cd:3.2,d:18});
tw('foudre',0,{n:'Éclair',k:'bolt'});
tw('foudre',1,{n:'Tonnerre',k:'strike',cd:2,d:6});
tw('foudre',2,{n:'Fulguro-rayon',k:'beam',cd:3.8,d:26});
