#!/usr/bin/env node
// Revisa lo que usan los scripts y dice qué funciona, qué no y el comando exacto para arreglarlo.
//   node scripts/doctor.mjs
import { spawnSync } from 'node:child_process';
import { buscarChrome, buscarPython } from './lib-chrome.mjs';

const so = process.platform, nombre = { darwin: 'Mac', win32: 'Windows' }[so] || 'Linux';
const fix = (mac, win, lin) => ({ darwin: mac, win32: win }[so] || lin);
const ver = (c, a = ['--version']) => { const r = spawnSync(c, a, { encoding: 'utf8', shell: false }); return r.status === 0 ? ((r.stdout || r.stderr || '').trim().split('\n')[0]) : null; };
const filas = [];
const fila = (ok, que, detalle, para, arreglo) => filas.push({ ok, que, detalle, para, arreglo });

const nodeM = +process.versions.node.split('.')[0];
fila(nodeM >= 22, 'Node', 'v' + process.versions.node, 'todos los .mjs', nodeM >= 22 ? '' : fix('brew install node', 'winget install OpenJS.NodeJS.LTS', 'https://nodejs.org (versión 22 o superior)'));
const ch = buscarChrome();
fila(!!ch, 'Chrome, Edge o Brave', ch || 'no encontrado', 'capturas, PDF, PPTX, grabar', ch ? '' : fix('brew install --cask google-chrome', 'winget install Google.Chrome', 'sudo apt install chromium-browser') + ' (o define CHROME con la ruta)');
const py = await buscarPython();
fila(!!py, 'Python 3', py ? py.join(' ') + ' · ' + ver(py[0], [...py.slice(1), '--version']) : 'no encontrado', 'narrar, empaquetar, diagrama, video', py ? '' : fix('brew install python', 'winget install Python.Python.3.12', 'sudo apt install python3 python3-venv'));
const ff = ver('ffmpeg', ['-version']);
fila(!!ff, 'ffmpeg', ff ? ff.slice(0, 40) : 'no encontrado', 'grabar (solo video)', ff ? '' : fix('brew install ffmpeg', 'winget install Gyan.FFmpeg', 'sudo apt install ffmpeg'));
const d2 = ver('d2');
fila(!!d2, 'd2', d2 || 'no encontrado', 'diagrama.py (solo diagramas)', d2 ? '' : fix('brew install d2', 'winget install terrastruct.d2', 'curl -fsSL https://d2lang.com/install.sh | sh -s --'));
let red = false, detalleRed = '';
try { const r = await fetch('https://speech.platform.bing.com/', { signal: AbortSignal.timeout(6000) }); red = true; detalleRed = 'OK'; }
catch (e) { detalleRed = String(e.cause?.code || e.message); }
fila(red, 'Red', detalleRed, 'narrar (voz), empaquetar --remoto', red ? '' : 'Revisa la conexión o el proxy. Sin red funciona todo menos la voz y las fuentes remotas.');

console.log(`Sistema: ${nombre}`);
for (const f of filas) console.log(`${f.ok ? 'OK   ' : 'FALTA'} ${f.que}: ${f.detalle} · sirve para: ${f.para}${f.arreglo ? `\n      Arreglo: ${f.arreglo}` : ''}`);
const clave = filas.slice(0, 2).every(f => f.ok);
console.log(clave ? 'Lo básico funciona: crear, revisar y sacar PDF.' : 'Falta lo básico: sin Node 22 y un navegador no se puede revisar ni sacar PDF.');
process.exit(clave ? 0 : 1);
