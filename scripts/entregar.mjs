#!/usr/bin/env node
// Un comando para cada ronda de entrega:
//   node scripts/entregar.mjs fuente.html [final.html] [--narrar] [--voz catalina] [--pptx] [--sin-pdf] [--estricto]
//
// Hace, en orden: narrar (opcional), empaquetar con --remoto, capturas sobre el final, PDF y resumen con rutas.
// Falla si un paso falla o si el PDF queda más viejo que el HTML.

import { spawnSync } from 'node:child_process';
import { existsSync, statSync, copyFileSync, mkdirSync, rmSync, readFileSync, utimesSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { buscarPython } from './lib-chrome.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), val = n => { const k = args.indexOf(n); return k >= 0 ? args.splice(k, 2)[1] : null; };
const voz = val('--voz'), f = new Set(args.filter(a => a.startsWith('--')));
const [src, dst] = args.filter(a => !a.startsWith('--'));
if (!src) { console.error('Uso: node scripts/entregar.mjs fuente.html [final.html] [--narrar] [--voz x] [--pptx] [--sin-pdf] [--estricto]'); process.exit(2); }
const fuente = resolve(src);
if (!existsSync(fuente)) { console.error(`No existe: ${fuente}`); process.exit(2); }
const final = resolve(dst || fuente.replace(/(-fuente)?\.html?$/i, m => m.startsWith('-fuente') ? '.html' : '-final.html'));
if (final === fuente) { console.error('El final no puede ser el mismo archivo que la fuente: el empaquetado la reemplazaría.'); process.exit(2); }
const py = await buscarPython();
if (!py) { console.error('Falta Python 3. Corre: node scripts/doctor.mjs'); process.exit(2); }

const corre = (c, a, titulo) => {
  console.log(`\n== ${titulo}`);
  const r = spawnSync(c, a, { stdio: 'inherit' });
  return r.status ?? 1;
};
const pyc = (s, a, t) => { const st = corre(py[0], [...py.slice(1), join(aqui, s), ...a], t); if (st) { console.error(`Falló ${s} (código ${st}).`); process.exit(st); } };
const nodec = (s, a, t) => corre(process.execPath, [join(aqui, s), ...a], t);

mkdirSync(dirname(final), { recursive: true });
let entrada = fuente;
const tmpNarrado = join(tmpdir(), `narrado-${process.pid}.html`);
if (f.has('--narrar')) { pyc('narrar.py', [fuente, join(dirname(fuente), `.${basename(tmpNarrado)}`), ...(voz ? ['--voz', voz] : [])], 'Narrar'); entrada = join(dirname(fuente), `.${basename(tmpNarrado)}`); }
pyc('empaquetar.py', [entrada, final, '--remoto'], 'Empaquetar');
if (entrada !== fuente) rmSync(entrada, { force: true });

const dirCap = final.replace(/\.html?$/i, '') + '-capturas';
rmSync(dirCap, { recursive: true, force: true });
const pedirPdf = !f.has('--sin-pdf');
const estCap = nodec('capturas.mjs', [final, dirCap, ...(pedirPdf ? ['--pdf'] : []), ...(f.has('--estricto') ? ['--estricto'] : [])], 'Revisar');
if (estCap > 1) { console.error('Falló la revisión.'); process.exit(estCap); }

let pdf = null;
if (pedirPdf) {
  const gen = join(dirCap, basename(final).replace(/\.html?$/i, '') + '.pdf');
  pdf = final.replace(/\.html?$/i, '') + '.pdf';
  if (!existsSync(gen)) { console.error('No se generó el PDF.'); process.exit(1); }
  copyFileSync(gen, pdf); rmSync(gen);
  if (statSync(pdf).mtimeMs < statSync(final).mtimeMs) { console.error(`ERROR: el PDF quedó más viejo que el HTML: ${pdf}`); process.exit(1); }
}
let pptx = null;
const esDeck = /class="stage"/.test(readFileSync(final, 'utf8'));
if (f.has('--pptx') && !esDeck) console.log('\nAviso: --pptx es solo para decks; en un informe se ignora (el HTML y el PDF sí quedan hechos).');
else if (f.has('--pptx')) {
  pptx = final.replace(/\.html?$/i, '') + '.pptx';
  const st = nodec('exportar-pptx.mjs', [final, pptx], 'PPTX');
  if (st) { console.error('Falló el PPTX.'); process.exit(st); }
}
let aviso = '';

const rev = JSON.parse(readFileSync(join(dirCap, 'revision.json'), 'utf8'));
console.log(`\n== Resumen\nHTML:     ${final} (${(statSync(final).size / 1048576).toFixed(1)} MB)`);
if (pdf) console.log(`PDF:      ${pdf}`);
if (pptx) console.log(`PPTX:     ${pptx}`);
if (aviso) console.log(aviso);
console.log(`Capturas: ${dirCap}\nRevisión: ${rev.errores.length} errores, ${rev.avisos.length} avisos (${join(dirCap, 'revision.json')})`);
process.exit(estCap);
