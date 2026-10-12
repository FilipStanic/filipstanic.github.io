// ============================================================
//  state.js — État global du jeu : partie en cours (G), listes de projectiles/particules/textes, équipe, rochers, canvas de décor.
// ============================================================
// décor
const bg=document.createElement('canvas');
bg.width=W;
bg.height=H;
const fx=[],lb=[null,null];
// contrôles
let jx=0,jy=0,kx=0,ky=0;
const down=[0,0,0],keys={};
// jeu
let G=null;
const bullets=[],txt=[];
const dmgTxt=(x,y,s,c='#fff')=>txt.push({x,y,s,c,t:.9});
let last=0;
// ---- v3 : equipe 4v4, releve, statuts, rochers destructibles
const ORDER=[];   // rempli automatiquement avec les Pokémon de data/pokemon*.js
const mkp=t=>{const h=HERO[t];return{t,x:W*.3,y:H*.5,r:12,hp:h.hp,max:h.hp,sp:h.sp,mv:MV[t],cd:[0,0,0],cm:[1,1,1],ch:[0,0,0],dT:0,dC:0,inv:0,dx:0,dy:-1,st:null,stT:0}};
let rocks=[];
// ---- v4 : animations, arenes, impacts
let DT=.016,HS=0;
const pt=[],TR=document.createElement('canvas');
TR.width=W;
TR.height=H;
const OL='#14101c',zn=[],bm=[];
