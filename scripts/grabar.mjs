#!/usr/bin/env node
// Video de una página, sin apps externas: Chrome por CDP (Page.startScreencast) y MP4 con ffmpeg.
//
//   node scripts/grabar.mjs pagina.html pasos.json salida.mp4 [--ancho 1280] [--alto 720] [--fps 25] [--no-recortar]
//
// pagina.html también puede ser una URL. pasos.json es una lista, por ejemplo:
//   [{"ir":"#2"},{"esperar":800},{"clic":"button.next"},{"escribir":"hola","en":"input"},{"scroll":600},{"esperar":1000}]
// La quietud de más de 1,5 s se recorta a 1 s, salvo con --no-recortar.

import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { abrirChrome, sleep } from './lib-chrome.mjs';

const args = process.argv.slice(2), val = (n, d) => { const k = args.indexOf(n); return k >= 0 ? +args.splice(k, 2)[1] : d; };
const W = val('--ancho', 1280), H = val('--alto', 720), FPS = val('--fps', 25), recortar = !args.includes('--no-recortar');
const [pagina, pasosArg, salidaArg] = args.filter(a => !a.startsWith('--'));
if (!pagina || !pasosArg || !salidaArg) { console.error('Uso: node scripts/grabar.mjs pagina.html pasos.json salida.mp4 [--ancho 1280] [--alto 720] [--fps 25] [--no-recortar]'); process.exit(2); }
if (spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.error(`Falta ffmpeg, que arma el MP4. Instálalo con: ${process.platform === 'darwin' ? 'brew install ffmpeg' : process.platform === 'win32' ? 'winget install Gyan.FFmpeg' : 'sudo apt install ffmpeg'}`);
  process.exit(2);
}
const pasos = JSON.parse(readFileSync(resolve(pasosArg), 'utf8'));
const esUrl = /^https?:\/\//.test(pagina);
if (!esUrl && !existsSync(resolve(pagina.split('#')[0]))) { console.error(`No existe: ${pagina}`); process.exit(2); }
const inicio = esUrl ? pagina : pathToFileURL(resolve(pagina)).href;

let c; try { c = await abrirChrome(); } catch (e) { console.error(e.message); process.exit(2); }
const { send, on, evaluate } = c;
const tmp = mkdtempSync(join(tmpdir(), 'grabar-'));
const cuadros = [];
const clicXY = async sel => {
  const r = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({block:'center'}); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  if (!r) throw new Error(`no existe el selector ${sel}`);
  return r;
};
let codigo = 0;
try {
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await c.ir(inicio, 300);
  on('Page.screencastFrame', p => {
    const n = `f${String(cuadros.length).padStart(6, '0')}.jpg`;
    writeFileSync(join(tmp, n), Buffer.from(p.data, 'base64'));
    cuadros.push({ n, t: p.metadata.timestamp });
    send('Page.screencastFrameAck', { sessionId: p.sessionId }).catch(() => {});
  });
  await send('Page.startScreencast', { format: 'jpeg', quality: 88, everyNthFrame: 1, maxWidth: W, maxHeight: H });
  await sleep(300);
  for (const p of pasos) {
    if (p.ir != null) { p.ir.startsWith('#') ? await evaluate(`location.hash = ${JSON.stringify(p.ir)}`) : await c.ir(/^https?:|^file:/.test(p.ir) ? p.ir : pathToFileURL(resolve(p.ir)).href, 200); }
    else if (p.clic) {
      const { x, y } = await clicXY(p.clic);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(120);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    } else if (p.escribir != null) {
      if (p.en) await evaluate(`document.querySelector(${JSON.stringify(p.en)})?.focus()`);
      for (const ch of String(p.escribir)) { await send('Input.insertText', { text: ch }); await sleep(p.ritmo || 45); }
    } else if (p.scroll != null) {
      const tramos = 18; for (let k = 0; k < tramos; k++) { await evaluate(`scrollBy(0, ${p.scroll / tramos})`); await sleep(16); }
    } else if (p.esperar != null) await sleep(p.esperar);
    else throw new Error('Paso desconocido: ' + JSON.stringify(p));
    await sleep(150);
  }
  await sleep(300);
  await send('Page.stopScreencast'); await sleep(200);
  if (cuadros.length < 2) throw new Error('Chrome no entregó cuadros: la página no cambió nada.');
  // Duración real de cada cuadro; lo quieto se corta en 1 s
  const lista = []; let total = 0, recortado = 0;
  cuadros.forEach((f, k) => {
    let d = k + 1 < cuadros.length ? cuadros[k + 1].t - f.t : 0.5;
    if (recortar && d > 1.5) { recortado += d - 1; d = 1; }
    total += d;
    lista.push(`file '${join(tmp, f.n).replace(/\\/g, '/').replace(/'/g, "'\\''")}'`, `duration ${d.toFixed(3)}`);
  });
  lista.push(`file '${join(tmp, cuadros.at(-1).n).replace(/\\/g, '/').replace(/'/g, "'\\''")}'`);
  const txt = join(tmp, 'lista.txt'); writeFileSync(txt, lista.join('\n'));
  const salida = resolve(salidaArg);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', txt, '-vf', `fps=${FPS},scale=trunc(iw/2)*2:trunc(ih/2)*2`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', salida], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('ffmpeg falló: ' + (r.stderr || '').slice(0, 400));
  console.log(`Video: ${salida} · ${(statSync(salida).size / 1048576).toFixed(1)} MB · ${total.toFixed(1)} s · ${cuadros.length} cuadros` + (recortado ? ` · ${recortado.toFixed(1)} s de quietud recortados` : ''));
} catch (e) { console.error('Falló: ' + e.message); codigo = 1; }
await c.cerrar();
try { rmSync(tmp, { recursive: true, force: true }); } catch {}
process.exit(codigo);
