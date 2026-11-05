// Chrome o Edge por CDP, sin dependencias. Lo usan capturas.mjs, exportar-pptx.mjs y grabar.mjs.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function buscarChrome() {
  const e = process.env, h = homedir(), mac = a => [`/Applications/${a}`, join(h, 'Applications', a)];
  const win = [e.PROGRAMFILES, e['PROGRAMFILES(X86)'], e.LOCALAPPDATA].filter(Boolean).flatMap(b => [
    join(b, 'Google/Chrome/Application/chrome.exe'),
    join(b, 'Microsoft/Edge/Application/msedge.exe'),
    join(b, 'BraveSoftware/Brave-Browser/Application/brave.exe')]);
  return [e.CHROME,
    ...mac('Google Chrome.app/Contents/MacOS/Google Chrome'),
    ...mac('Chromium.app/Contents/MacOS/Chromium'),
    ...mac('Microsoft Edge.app/Contents/MacOS/Microsoft Edge'),
    ...mac('Brave Browser.app/Contents/MacOS/Brave Browser'),
    ...win,
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/usr/bin/brave-browser',
  ].find(p => p && existsSync(p)) || null;
}

export async function abrirChrome(extra = []) {
  if (typeof WebSocket === 'undefined') throw new Error('Necesita Node 22 o superior (WebSocket global).');
  const bin = buscarChrome();
  if (!bin) throw new Error('No encontré Chrome, Edge ni Brave. Instala uno o define CHROME con la ruta al ejecutable (node scripts/doctor.mjs te dice cómo).');
  const perfil = mkdtempSync(join(tmpdir(), 'informes-chrome-'));
  const chrome = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-color-profile=srgb', ...extra, 'about:blank'], { stdio: 'ignore' });
  let puerto;
  for (let k = 0; k < 300 && !puerto; k++) { // hasta 30 s: en Windows o con antivirus tarda
    await sleep(100);
    try { puerto = readFileSync(join(perfil, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch {}
  }
  const cerrar = async () => {
    try { ws?.close(); } catch {}
    try { chrome.kill(); } catch {}
    await sleep(150);
    try { rmSync(perfil, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  };
  let ws;
  if (!puerto) { await cerrar(); throw new Error(`Chrome no arrancó en 30 s (${bin}).`); }
  const target = await (await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: 'PUT' })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let seq = 0; const pend = new Map(), esperas = [], oyentes = {};
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) {
      (oyentes[m.method] || []).forEach(f => f(m.params));
      esperas.filter(w => w.method === m.method).forEach(w => { esperas.splice(esperas.indexOf(w), 1); w.res(m.params); });
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
  const once = method => new Promise(res => esperas.push({ method, res }));
  const on = (method, f) => { (oyentes[method] = oyentes[method] || []).push(f); };
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  let nav = 0;
  // Un parámetro distinto en cada visita obliga a cargar de nuevo (si no, un cambio de #hash no recarga)
  const ir = async (url, espera = 400) => {
    const [base, hash = ''] = url.split('#');
    const u = base + (base.includes('?') ? '&' : '?') + '_v=' + (++nav) + (hash ? '#' + hash : '');
    const cargado = once('Page.loadEventFired');
    await send('Page.navigate', { url: u });
    await Promise.race([cargado, sleep(30000)]);
    await evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
    await sleep(espera);
  };
  await send('Page.enable'); await send('Runtime.enable');
  return { send, once, on, evaluate, ir, cerrar, bin };
}

// Python del sistema: py -3 en Windows, luego python3 o python
export async function buscarPython() {
  const { spawnSync } = await import('node:child_process');
  const opciones = process.platform === 'win32' ? [['py', '-3'], ['python'], ['python3']] : [['python3'], ['python'], ['py', '-3']];
  for (const [c, ...a] of opciones) {
    const r = spawnSync(c, [...a, '--version'], { encoding: 'utf8' });
    if (r.status === 0 && /Python 3/.test((r.stdout || '') + (r.stderr || ''))) return [c, ...a];
  }
  return null;
}
