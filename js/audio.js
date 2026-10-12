// ============================================================
//  audio.js — Sons et musique générés par le navigateur (aucun fichier audio à ajouter).
//  Volumes réglables dans Options (général / effets / musique). playSfx('nom') joue un effet.
//  Pour remplacer par de vrais fichiers plus tard : change le contenu de playSfx() pour lire un <audio>.
// ============================================================
const AU = { ctx:null, mg:null, sg:null, mu:null, nb:null };
function audioInit(){
  if(AU.ctx) return;
  try{
    const C = window.AudioContext || window.webkitAudioContext; AU.ctx = new C();
    AU.mg = AU.ctx.createGain(); AU.sg = AU.ctx.createGain(); AU.mu = AU.ctx.createGain();
    AU.sg.connect(AU.mg); AU.mu.connect(AU.mg); AU.mg.connect(AU.ctx.destination);
    const n = AU.ctx.sampleRate; AU.nb = AU.ctx.createBuffer(1, n, n); const d = AU.nb.getChannelData(0); for(let i = 0; i < n; i++) d[i] = Math.random()*2 - 1;
    applyAudio();
  }catch(e){ AU.ctx = null; }
}
function applyAudio(){
  if(!AU.ctx) return; const s = Settings.get();
  AU.mg.gain.value = s.master; AU.sg.gain.value = s.sfx; AU.mu.gain.value = s.music*.45;
}
['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => { audioInit(); if(AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); }));

function tone(f, d, type, v, slide, delay, dest){
  if(!AU.ctx) return; const t = AU.ctx.currentTime + (delay || 0), o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(dest || AU.sg); o.start(t); o.stop(t + d + .02);
}
function noise(d, v, f0, f1, type, delay){
  if(!AU.ctx) return; const t = AU.ctx.currentTime + (delay || 0), s = AU.ctx.createBufferSource(), fl = AU.ctx.createBiquadFilter(), g = AU.ctx.createGain();
  s.buffer = AU.nb; fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(fl); fl.connect(g); g.connect(AU.sg); s.start(t); s.stop(t + d + .02);
}
// playSfx('cast:feu'), playSfx('hit:eau', 1.4), playSfx('ko'), playSfx('ball_open'), playSfx('click')…
function playSfx(name, k){
  if(!AU.ctx) return; k = k || 1; const [kind, tp] = name.split(':');
  const R = Math.random;
  if(kind === 'click') tone(660, .05, 'square', .07);
  else if(kind === 'ko'){ tone(420, .6, 'sawtooth', .22, -360); noise(.5, .35, 1800, 120); tone(70, .5, 'sine', .4, -30); }
  else if(kind === 'crit') tone(1500, .14, 'square', .12, 500);
  else if(kind === 'recall') tone(1300, .35, 'sine', .1, -1000);
  else if(kind === 'throw') tone(280, .28, 'sine', .08, 500);
  else if(kind === 'ball_open'){ noise(.12, .2, 5000, 800, 'highpass'); tone(700, .25, 'triangle', .13, 900); tone(1400, .2, 'sine', .06, 600, .08); }
  else if(kind === 'cast' || kind === 'hit'){
    const hit = kind === 'hit', v = (hit ? .3 : .2)*k;
    if(hit) tone(120, .13, 'sine', .3*k, -70);
    switch(tp){
      case 'feu': noise(hit ? .25 : .45, v, 1400, 300); tone(130, .3, 'sawtooth', .08*k, -70); break;
      case 'glace': noise(.4, v*.7, 7000, 2200, 'bandpass'); tone(1500, .3, 'sine', .06*k, -700); tone(2200, .2, 'sine', .04*k, -900, .06); break;
      case 'eau': for(let i = 0; i < 3; i++) tone(380 + R()*500, .12, 'sine', .1*k, 250, i*.05); noise(.2, v*.5, 2500, 600); break;
      case 'foudre': tone(950, .16, 'sawtooth', .14*k, -800); noise(.15, v, 6000, 1500, 'highpass'); break;
      case 'plante': noise(.22, v*.6, 3200, 1800, 'bandpass'); break;
      case 'poison': tone(190, .28, 'sine', .12*k, 160); tone(260, .2, 'sine', .08*k, 120, .08); break;
      case 'dragon': tone(95, .5, 'sawtooth', .2*k, -35); noise(.4, v*.7, 900, 200); break;
      case 'tenebres': tone(190, .38, 'triangle', .15*k, -120); noise(.3, v*.4, 700, 150); break;
      case 'acier': tone(1900, .12, 'square', .06*k, -900); tone(2600, .1, 'square', .04*k, -1200, .03); break;
      case 'vol': noise(.32, v*.6, 800, 3500, 'bandpass'); break;
      default: noise(.09, v, 2500, 500); tone(230, .09, 'square', .08*k, -110);
    }
  }
}

// ---------- musique (petite boucle générée) ----------
const MU = { id:null, step:0, kind:null };
const SCALE = [0, 3, 5, 7, 10], PAT = { menu:[0, 2, 4, 2, 3, 2, 1, 2], battle:[0, 4, 2, 4, 3, 4, 1, 3, 0, 4, 2, 4, 5, 4, 3, 1] };
function musicSet(kind){
  if(MU.kind === kind) return; MU.kind = kind; clearInterval(MU.id); MU.id = null; MU.step = 0;
  if(!kind) return;
  const bpm = kind === 'battle' ? 160 : 100, dt = 60/bpm/2;
  MU.id = setInterval(() => {
    if(!AU.ctx || AU.ctx.state !== 'running') return;
    const pat = PAT[kind], n = pat[MU.step % pat.length], oct = (MU.step % 32 > 15) ? 12 : 0;
    const f = 196*Math.pow(2, (SCALE[n % 5] + oct + Math.floor(n/5)*12)/12);
    tone(f, dt*1.7, kind === 'battle' ? 'square' : 'triangle', kind === 'battle' ? .09 : .12, 0, 0, AU.mu);
    if(MU.step % 2 === 0) tone(f/4, dt*3, 'triangle', .22, 0, 0, AU.mu);
    MU.step++;
  }, dt*1000);
}
// la musique suit l'écran : menu / combat
const _showMainA = showMain; showMain = function(){ _showMainA(); musicSet('menu'); };
const _startA = start; start = function(cfg){ _startA(cfg); musicSet('battle'); };
document.getElementById('menu').addEventListener('click', e => { if(e.target.closest('button')) playSfx('click'); });
