// ============================================================
//  ÉCRANS DU MENU : principal, équipes (liste + éditeur), solo.
//  Le menu principal est piloté par data/menu.js (MAIN_MENU) ; les écrans sont enregistrés dans SCREENS.
// ============================================================
const SCREENS = {};
let MENU_WARN = '';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const thumb = id => ORDER.includes(id) ? `<img src='${spr(id).toDataURL()}'>` : '';
const bindAll = (sel, fn) => document.querySelectorAll(sel).forEach(el => el.onclick = () => fn(el));
const teamOk = t => t.members.length === t.size && t.members.every(id => ORDER.includes(id));

function showMain(){
  G = null;
  menu(`<h1>Arène des Créatures</h1><div class='mlist'>${MAIN_MENU.map(m =>
    `<button class='mbtn' data-id='${m.id}' ${m.soon ? 'disabled' : ''}><b>${m.label}</b><small>${m.soon ? 'Bientôt' : m.desc}</small></button>`).join('')}</div>${MENU_WARN}`);
  bindAll('.mbtn', el => {
    const it = MAIN_MENU.find(m => m.id === el.dataset.id), fn = SCREENS[it.screen];
    if(fn) fn(); else console.warn('Écran inconnu : ' + it.screen);
  });
}
function pick(){ showMain(); }          // (nom historique utilisé par le moteur)

// ---------- Mes équipes ----------
function showTeams(){
  const teams = Save.teams();
  menu(`<h1>Mes équipes</h1><div class='scroll'>${teams.length ? teams.map(t => `
    <div class='trow'><div class='tinfo'><b>${esc(t.name)}</b> <span class='tag'>${t.size}v${t.size}</span>${teamOk(t) ? '' : ' <span class="tag bad">incomplète</span>'}
    <div class='tmem'>${t.members.map(thumb).join('')}</div></div>
    <button class='btn2' data-edit='${t.id}'>Modifier</button><button class='btn2' data-del='${t.id}'>✕</button></div>`).join('') : '<p>Aucune équipe.</p>'}</div>
    <div class='row'><button class='btn2' data-new='3'>+ Équipe 3v3</button><button class='btn2' data-new='6'>+ Équipe 6v6</button><button class='btn2' id='back'>Retour</button></div>`);
  bindAll('[data-edit]', el => showTeamEditor(Save.team(el.dataset.edit)));
  bindAll('[data-del]', el => { Save.deleteTeam(el.dataset.del); showTeams(); });
  bindAll('[data-new]', el => showTeamEditor({ id:null, name:'Équipe ' + (Save.teams().length + 1), size:+el.dataset.new, members:[] }));
  document.getElementById('back').onclick = showMain;
}

function showTeamEditor(team){
  const ed = { id:team.id, name:team.name, size:team.size, members:team.members.filter(id => ORDER.includes(id)) };
  const sync = () => { const el = document.getElementById('tn'); if(el) ed.name = el.value; };
  const render = () => {
    menu(`<h1>${ed.id ? 'Modifier' : 'Nouvelle'} équipe</h1>
    <div class='row'><input id='tn' value="${esc(ed.name)}" maxlength='18'>
      <button class='btn2 ${ed.size === 3 ? 'on' : ''}' data-size='3'>3v3</button><button class='btn2 ${ed.size === 6 ? 'on' : ''}' data-size='6'>6v6</button></div>
    <div class='row'>${Array.from({ length:ed.size }, (_, i) => `<div class='slot' data-rm='${i}'>${ed.members[i] ? thumb(ed.members[i]) : '+'}</div>`).join('')}</div>
    <div class='scroll'><div class='grid2'>${ORDER.map(id => `<button class='card ${ed.members.includes(id) ? 'sel' : ''}' data-add='${id}'>${thumb(id)}<small>${NAME[id]}</small><small class='ty'>${typesOf(id).map(t => `<span class='tc' style='background:${COL[t]}'>${TN[t] || t}</span>`).join('')}</small></button>`).join('')}</div></div>
    <div class='row'><button class='btn' id='sv'>Enregistrer</button><button class='btn2' id='cn'>Annuler</button></div>`);
    bindAll('[data-size]', el => { sync(); ed.size = +el.dataset.size; ed.members = ed.members.slice(0, ed.size); render(); });
    bindAll('[data-rm]', el => { sync(); ed.members.splice(+el.dataset.rm, 1); render(); });
    bindAll('[data-add]', el => {
      sync(); const id = el.dataset.add, i = ed.members.indexOf(id);
      if(i >= 0) ed.members.splice(i, 1); else if(ed.members.length < ed.size) ed.members.push(id);
      render();
    });
    document.getElementById('sv').onclick = () => { sync(); Save.saveTeam({ id:ed.id, name:ed.name.trim() || 'Équipe', size:ed.size, members:ed.members }); showTeams(); };
    document.getElementById('cn').onclick = showTeams;
  };
  render();
}

// ---------- Solo ----------
function showSolo(sel){
  const teams = Save.teams().filter(teamOk);
  if(!teams.length){
    menu(`<h1>Solo</h1><p>Crée d'abord une équipe complète (3v3 ou 6v6).</p><div class='row'><button class='btn' id='mk'>Mes équipes</button><button class='btn2' id='back'>Retour</button></div>`);
    document.getElementById('mk').onclick = showTeams; document.getElementById('back').onclick = showMain; return;
  }
  sel = sel || {};
  const t = sel.team || teams.find(x => x.id === Save.lastTeam) || teams[0];
  const cleared = Save.cleared(t.size), stage = Math.min(sel.stage ?? cleared, STAGES.length - 1);
  menu(`<h1>Solo — ${t.size}v${t.size}</h1>
    <div class='row'>${teams.map(x => `<button class='btn2 ${x.id === t.id ? 'on' : ''}' data-team='${x.id}'>${esc(x.name)} (${x.size}v${x.size})</button>`).join('')}</div>
    <div class='scroll'><div class='stages'>${STAGES.map((s, i) => `<button class='stg ${i === stage ? 'on' : ''}' data-stage='${i}' ${i > cleared ? 'disabled' : ''}><b>${i + 1}</b><small>${i > cleared ? '🔒' : esc(s.name)}</small><span class='stars'>${'★'.repeat(s.level || 0)}</span></button>`).join('')}</div></div>
    <div class='row'><button class='btn' id='go'>Jouer : ${esc(STAGES[stage].name)}</button><button class='btn2' id='back'>Retour</button></div>`);
  bindAll('[data-team]', el => showSolo({ team:Save.team(el.dataset.team) }));
  bindAll('[data-stage]', el => showSolo({ team:t, stage:+el.dataset.stage }));
  document.getElementById('go').onclick = () => startSolo(t, stage);
  document.getElementById('back').onclick = showMain;
}

SCREENS.solo = showSolo;
SCREENS.teams = showTeams;
