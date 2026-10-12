// ============================================================
//  MODES DE JEU : composition des équipes ennemies, lancement d'un combat, fin de combat, pause.
//  Pour créer un nouveau mode : écris une fonction qui appelle start({...}) comme startSolo ci-dessous.
// ============================================================
function enemyTeam(size){
  const pool = [...ORDER].sort(() => Math.random() - .5), out = [];
  for(let i = 0; i < size; i++) out.push(pool[i % pool.length]);
  return out;
}

function startSolo(team, stageIndex){
  const S = STAGES[stageIndex];
  Save.lastTeam = team.id;
  start({ mode:'solo', team:team.members.slice(), size:team.size, teamId:team.id, stageIndex, stage:S, arena:S.arena, enemies:enemyTeam(team.size) });
}

function battleEnd(win){
  const c = G.cfg, bind = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
  if(c.mode === 'solo'){
    const t = Save.team(c.teamId), next = c.stageIndex + 1 < STAGES.length;
    if(win){
      Save.clear(c.size, c.stageIndex);
      menu(`<h1>🏆 Victoire !</h1><p>${esc(STAGES[c.stageIndex].name)} terminé</p><div class='row'>
        ${next ? `<button class='btn' id='nx'>Niveau suivant</button>` : '<p>Tous les niveaux sont terminés !</p>'}
        <button class='btn2' id='rp'>Rejouer</button><button class='btn2' id='mn'>Menu</button></div>`);
      bind('nx', () => startSolo(t, c.stageIndex + 1));
    } else {
      menu(`<h1>Défaite</h1><p>${G.wave} adversaire(s) battu(s) sur ${G.et.length}</p><div class='row'>
        <button class='btn' id='rp'>Réessayer</button><button class='btn2' id='mn'>Menu</button></div>`);
    }
    bind('rp', () => startSolo(t, c.stageIndex)); bind('mn', showMain);
  } else { menu(`<h1>${win ? 'Victoire !' : 'Défaite'}</h1><div class='row'><button class='btn2' id='mn'>Menu</button></div>`); bind('mn', showMain); }
}

function pauseGame(){
  if(!G || G.over || G.paused) return;
  G.paused = true;
  menu(`<h1>Pause</h1><div class='row'><button class='btn' id='rs'>Reprendre</button><button class='btn2' id='qt'>Quitter</button></div>`);
  document.getElementById('rs').onclick = resumeGame;
  document.getElementById('qt').onclick = () => { G = null; showMain(); };
}
function resumeGame(){ if(!G) return; G.paused = false; menu(''); last = performance.now(); }
document.getElementById('pauseBtn').addEventListener('pointerdown', () => { if(G && G.paused) resumeGame(); else pauseGame(); });
addEventListener('keydown', e => { if(e.code === 'Escape'){ if(G && G.paused) resumeGame(); else pauseGame(); } });
