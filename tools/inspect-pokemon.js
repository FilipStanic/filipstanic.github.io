// Usage :  node tools/inspect-pokemon.js assets/pokemon/<dossier>
// Liste les animations d'un dossier de sprites PMDCollab (noms, taille d'image, nombre d'images,
// image de frappe "hit") pour t'aider à remplir `anim` et `hits` dans data/pokemon.js.
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
if (!dir) { console.log('Usage : node tools/inspect-pokemon.js assets/pokemon/<dossier>'); process.exit(1); }
const xml = fs.readFileSync(path.join(dir, 'AnimData.xml'), 'utf8');
const tag = (s, t) => { const m = s.match(new RegExp('<' + t + '>([^<]*)</' + t + '>')); return m ? m[1].trim() : null; };
const blocks = xml.split('<Anim>').slice(1).map(b => b.split('</Anim>')[0]);
console.log('Dossier :', dir, '| ShadowSize :', tag(xml, 'ShadowSize'));
console.log('Nom'.padEnd(14), 'taille'.padEnd(9), 'images', 'durée(ticks)', ' rush hit return  fichier');
for (const b of blocks) {
  const name = tag(b, 'Name'), copy = tag(b, 'CopyOf');
  if (copy) { console.log(name.padEnd(14), '= alias de', copy); continue; }
  const durs = [...b.matchAll(/<Duration>(\d+)<\/Duration>/g)].map(m => +m[1]);
  const ok = fs.existsSync(path.join(dir, name + '-Anim.png')) ? 'OK' : 'MANQUANT';
  console.log(name.padEnd(14), (tag(b, 'FrameWidth') + 'x' + tag(b, 'FrameHeight')).padEnd(9), String(durs.length).padEnd(6),
    String(durs.reduce((a, c) => a + c, 0)).padEnd(12), String(tag(b, 'RushFrame') ?? '-').padEnd(5), String(tag(b, 'HitFrame') ?? '-').padEnd(4), String(tag(b, 'ReturnFrame') ?? '-').padEnd(7), ok);
}
console.log('\nIdées : attaque de contact -> Attack, Strike, Swing, MultiScratch, Charge (hits = [HitFrame])');
console.log('        attaque à distance -> Shoot (kind:"fan")   |   saut -> Hop');
console.log('Rappel : Idle-Anim.png est obligatoire ; les autres animations sont optionnelles.');
