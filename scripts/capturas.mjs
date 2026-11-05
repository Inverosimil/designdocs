#!/usr/bin/env node
// Capturas y revisión de un informe o deck HTML, sin dependencias (Node 22+ y Chrome, Edge o Brave).
//
//   node capturas.mjs <archivo.html[#N]> <carpeta-salida> [--pdf] [--oscuro] [--estricto]
//
// Deck: una PNG por lámina (todos los pasos visibles), hoja de contactos y celular.
// Informe: página completa en escritorio (1440) y celular (390), en tramos.
// --pdf genera el PDF con los estilos de impresión. --oscuro agrega capturas y contraste en oscuro.
// --estricto termina con código 1 si hay errores. La lista completa queda en revision.json.

import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { abrirChrome, sleep } from './lib-chrome.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const [input, outArg] = args.filter(a => !a.startsWith('--'));
if (!input || !outArg) { console.error('Uso: node capturas.mjs <archivo.html[#N]> <carpeta-salida> [--pdf] [--oscuro] [--estricto]'); process.exit(2); }

// La ruta puede llevar # en una carpeta: primero se prueba tal cual; si no existe, lo que sigue al último # es el estado
let inputFile = input, inputHash = '';
if (!existsSync(input) && input.includes('#')) { const k = input.lastIndexOf('#'); inputFile = input.slice(0, k); inputHash = input.slice(k + 1); }
const file = resolve(inputFile), out = resolve(outArg);
if (!existsSync(file)) { console.error(`No existe: ${file}`); process.exit(2); }
mkdirSync(out, { recursive: true });

let c;
try { c = await abrirChrome(['--autoplay-policy=no-user-gesture-required']); }
catch (e) { console.error(e.message); process.exit(2); }
const { send, on, evaluate, ir } = c;

const errores = [], avisos = [];
const anota = (nivel, donde, sel, texto) => {
  const l = `${donde ? donde + ' · ' : ''}${sel ? sel + ': ' : ''}${texto}`;
  const lista = nivel === 'error' ? errores : avisos;
  if (!lista.includes(l)) lista.push(l);
};

// Consola y recursos que fallan, durante todas las cargas
const consola = new Set(), fallidos = new Map(); const reqs = new Map();
on('Runtime.exceptionThrown', p => consola.add(p.exceptionDetails.exception?.description?.split('\n')[0] || p.exceptionDetails.text));
on('Runtime.consoleAPICalled', p => { if (p.type === 'error') consola.add(p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 200)); });
on('Network.requestWillBeSent', p => reqs.set(p.requestId, p.request.url));
on('Network.loadingFailed', p => { if (p.errorText !== 'net::ERR_ABORTED' && !p.canceled) fallidos.set(reqs.get(p.requestId) || '?', p.errorText); });
on('Network.responseReceived', p => { if (p.response.status >= 400) fallidos.set(p.response.url, 'HTTP ' + p.response.status); });
await send('Network.enable');
// Detecta audio que suena solo: cualquier play() sin silencio antes de un gesto
await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { window.__rvPlay = []; const o = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { if (!this.muted) window.__rvPlay.push(this.tagName); return o.apply(this, arguments); }; })();` });

const viewport = (width, height, mobile = false, dpr = 1) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
const scheme = dark => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
const shot = async (name, clip) => {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!clip, ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
  writeFileSync(join(out, name), Buffer.from(r.data, 'base64'));
  return name;
};
// Página completa en tramos de 3000 px (más fácil de leer y sin límite de textura)
const fullPage = async (prefix, width) => {
  const h = await evaluate('Math.ceil(document.documentElement.scrollHeight)');
  const names = [];
  for (let y = 0, n = 1; y < h; y += 3000, n++) names.push(await shot(`${prefix}-${String(n).padStart(2, '0')}.png`, { x: 0, y, width, height: Math.min(3000, h - y) }));
  return names;
};

// Revisión dentro de la página. __rv(raíz, opciones) devuelve [{n:'error'|'aviso', s:selector, t:texto}]
const REVISOR = String.raw`(() => {
  const FUERA = '.voz,.notas,.nar-ui,.nar-ring,.nar-line,.nar-barra,.nar-prev,.ui,.rotate,.logo-fijo,.mbar,.srcl,.num,.rail-s,script,style,template,noscript';
  const MEDIA = 'img,video,canvas';
  const sel = el => { const u = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : '')); const p = el.parentElement; return (p && !p.matches('section,body,main') ? u(p) + ' > ' : '') + u(el); };
  const corto = (t, n = 36) => { t = (t || '').trim().replace(/\s+/g, ' '); return t.length > n ? t.slice(0, n) + '…' : t; };
  const vis = el => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; if (e.tagName === 'DETAILS' && !e.open && el !== e && !el.closest('summary')) return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const textos = el => [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
  const lineas = el => { const rg = document.createRange(), out = []; for (const n of textos(el)) { rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width && r.height) out.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom }); } return out; };
  const rectTexto = el => { const rg = document.createRange(); let a; for (const n of textos(el)) { rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (!r.width || !r.height) continue; a = a ? { left: Math.min(a.left, r.left), right: Math.max(a.right, r.right), top: Math.min(a.top, r.top), bottom: Math.max(a.bottom, r.bottom) } : { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; } return a; };
  const pasoDe = el => { let k = 0; for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (e.dataset && e.dataset.step) k = Math.max(k, +e.dataset.step); return k; };
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const mezcla = (c, base) => { cx.globalCompositeOperation = 'copy'; cx.fillStyle = base; cx.fillRect(0, 0, 1, 1); cx.globalCompositeOperation = 'source-over'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')'; };
  const lum = c => { const d = c.match(/\d+/g).map(Number).map(v => (v /= 255) <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * d[0] + .7152 * d[1] + .0722 * d[2]; };
  const detras = e => e.parentElement && [...e.parentElement.children].some(c => c !== e && (c.matches('img,video,canvas,picture') || /(^|[ _-])(bg|fondo|media|tex)([ _-]|$)/.test(typeof c.className === 'string' ? c.className : '')) && ['absolute', 'fixed'].includes(getComputedStyle(c).position));
  const fondo = el => { const capas = []; let incierto = false; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none' || detras(e)) incierto = true; const b = cs.backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') capas.push(b); } return { c: capas.reverse().reduce((acc, x) => mezcla(x, acc), 'rgb(255,255,255)'), incierto }; };
  const tiene = cs => cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;

  window.__rvContraste = (root, sufijo = '') => {
    const malos = {}, out = [];
    root.querySelectorAll('*').forEach(el => {
      if (el.closest(FUERA + ',svg,.ph,.media') || !textos(el).length || !vis(el) || parseFloat(getComputedStyle(el).webkitTextStrokeWidth || 0) > 0) return;
      const cs = getComputedStyle(el), f = fondo(el), fg = mezcla(cs.color, f.c), fs = parseFloat(cs.fontSize);
      const r = (Math.max(lum(fg), lum(f.c)) + .05) / (Math.min(lum(fg), lum(f.c)) + .05);
      const k = window.__rvCanvas || 1, min = fs >= 40 * k || (fs >= 32 * k && +cs.fontWeight >= 600) ? 3 : 4.5;
      if (r < min) { const niv = r < 2.2 && !f.incierto && !el.closest('a,button,[aria-hidden=true],[disabled]') ? 'error' : 'aviso'; (malos[niv] = malos[niv] || []).push({ r, el }); }
    });
    for (const [n, xs] of Object.entries(malos)) { const w = xs.sort((a, b) => a.r - b.r)[0]; out.push({ n, s: sel(w.el), t: 'contraste bajo' + sufijo + ' (' + w.r.toFixed(1) + ':1) en ' + xs.length + ' texto' + (xs.length > 1 ? 's' : '') + ', por ejemplo «' + corto(w.el.textContent, 28) + '»' }); }
    return out;
  };

  window.__rv = (root, o) => {
    const out = [], k = o.k || 1, add = (n, el, t) => out.push({ n, s: el ? sel(el) : '', t });
    const todos = [...root.querySelectorAll('*')].filter(e => !e.closest(FUERA));
    const visibles = todos.filter(vis);
    const R = root.getBoundingClientRect();

    // Texto contra texto o media. Los pasos se acumulan: cada choque se ve desde el mayor paso de los dos
    // El rectángulo del texto incluye el aire de la fuente: se recorta a la altura real de las letras
    const conTexto = visibles.filter(e => !e.closest('svg') && textos(e).length).map(e => { const r = rectTexto(e); if (!r) return null; const a = parseFloat(getComputedStyle(e).fontSize) * (o.k || 1) * .16; return { e, tx: true, r: { left: r.left, right: r.right, top: r.top + a, bottom: r.bottom - a }, ls: lineas(e).map(q => ({ left: q.left, right: q.right, top: q.top + a, bottom: q.bottom - a })) }; }).filter(Boolean);
    const medias = visibles.filter(e => e.matches(MEDIA) || (e.matches('svg') && e.getBoundingClientRect().width > 60 * k)).map(e => ({ e, r: e.getBoundingClientRect(), tx: false }));
    const choques = new Set();
    for (let i = 0; i < conTexto.length; i++) {
      const a = conTexto[i];
      for (const b of [...conTexto.slice(i + 1), ...medias]) {
        if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
        // Texto contra texto: se comparan las líneas (un texto que se parte en dos renglones no ocupa el rectángulo entre ellos)
        const ra = b.tx && a.ls.length ? a.ls : [a.r], rb = b.tx && b.ls && b.ls.length ? b.ls : [b.r];
        let w = 0, h = 0, f = 0;
        for (const p of ra) for (const q of rb) {
          const ww = Math.min(p.right, q.right) - Math.max(p.left, q.left), hh = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
          if (ww <= 6 * k || hh <= 3 * k) continue;
          const ff = hh / Math.min(p.bottom - p.top, q.bottom - q.top);
          if (ff > f) { f = ff; w = ww; h = hh; }
        }
        if (w <= 6 * k || h <= 3 * k || f < .2) continue;
        const paso = Math.max(pasoDe(a.e), pasoDe(b.e)), est = paso ? ' (desde el paso ' + paso + ')' : '';
        if (b.tx) { const n = f >= .4 ? 'error' : 'aviso'; add(n, a.e, 'texto solapado con «' + corto(b.e.textContent, 24) + '» ' + sel(b.e) + est); }
        else {
          // Sobre una imagen a propósito: el texto o su contenedor van con fondo, o la imagen es el fondo de la tarjeta
          const propio = a.e.closest('figure,.media,.foto,.hero,[class*=img],[class*=foto],[class*=card]');
          if (!(propio && propio.contains(b.e)) && !choques.has(b.e)) { choques.add(b.e); add('aviso', a.e, 'texto sobre ' + b.e.tagName.toLowerCase() + ' ' + sel(b.e) + est); }
        }
      }
    }

    // SVG visible sin viewBox (no escala con su caja); los íconos de sprite (<use>) no cuentan
    visibles.filter(e => e.matches('svg:not([viewBox])') && e.getBoundingClientRect().width > 40 * k && !e.querySelector(':scope > use') && !e.parentElement.closest('svg')).forEach(svg => add('aviso', svg, 'svg sin viewBox: no escala con su caja'));

    // SVG con contenido fuera del viewBox
    visibles.filter(e => e.matches('svg[viewBox]')).forEach(svg => {
      const vb = svg.viewBox.baseVal, m = svg.getScreenCTM(); if (!m || !vb.width) return;
      const x0 = m.a * vb.x + m.e, y0 = m.d * vb.y + m.f, x1 = m.a * (vb.x + vb.width) + m.e, y1 = m.d * (vb.y + vb.height) + m.f, t = getComputedStyle(svg).overflow === 'visible' ? 8 * k : 2;
      for (const g of svg.querySelectorAll('text,rect,circle,ellipse,line,path,polygon,polyline,image')) {
        if (g.closest('defs,clipPath,mask,marker,symbol,pattern,[clip-path]')) continue;
        const cs = getComputedStyle(g); if (cs.display === 'none' || (cs.fill === 'none' && cs.stroke === 'none')) continue;
        const r = g.getBoundingClientRect(); if (!r.width && !r.height) continue;
        if (r.left < x0 - t || r.top < y0 - t || r.right > x1 + t || r.bottom > y1 + t) { add('aviso', svg, 'contenido fuera del viewBox: ' + g.tagName + (g.textContent.trim() ? ' «' + corto(g.textContent, 24) + '»' : '')); break; }
      }
    });

    // Contenido descentrado en círculos o contenedores chicos
    visibles.filter(e => !e.closest('svg')).forEach(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e), lado = Math.min(r.width, r.height);
      if (lado < 14 * k || r.width > 150 * k || r.height > 150 * k || !tiene(cs)) return;
      const redondo = parseFloat(cs.borderTopLeftRadius) >= lado * .4 || cs.borderTopLeftRadius.includes('%');
      if (!redondo && cs.textAlign !== 'center' && cs.justifyContent !== 'center') return;
      const hijos = [...e.children].filter(vis);
      let c = null;
      if (hijos.length === 1 && !textos(e).length) c = hijos[0].matches('svg') || !textos(hijos[0]).length ? hijos[0].getBoundingClientRect() : rectTexto(hijos[0]);
      else if (!hijos.length && textos(e).length) c = rectTexto(e);
      if (!c) return;
      const dx = Math.abs((c.left + c.right) / 2 - (r.left + r.right) / 2) / k, dy = Math.abs((c.top + c.bottom) / 2 - (r.top + r.bottom) / 2) / k;
      if (dx > 3 || dy > 3) add('aviso', e, 'contenido descentrado (' + Math.round(Math.max(dx, dy)) + ' px)' + (textos(e).length ? ' «' + corto(e.textContent, 16) + '»' : ''));
    });

    // Hermanos de una fila desalineados o con alturas muy distintas (solo tarjetas: con fondo o borde)
    visibles.filter(e => !e.closest('svg') && /flex|grid/.test(getComputedStyle(e).display) && !/column/.test(getComputedStyle(e).flexDirection)).forEach(p => {
      const cards = [...p.children].filter(h => vis(h) && !h.closest(FUERA) && !['absolute', 'fixed'].includes(getComputedStyle(h).position) && tiene(getComputedStyle(h)) && !getComputedStyle(h).alignSelf.match(/end|center/));
      if (cards.length < 2 || getComputedStyle(p).alignItems.match(/baseline|end|center/)) return;
      const rs = cards.map(h => h.getBoundingClientRect());
      for (let i = 1; i < rs.length; i++) {
        const a = rs[i - 1], b = rs[i], cruce = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (cruce < Math.min(a.height, b.height) * .5 || Math.min(a.height, b.height) < 40 * k) continue;
        if (Math.abs(a.top - b.top) / k > 3) { add('aviso', cards[i], 'desalineado con su vecino (' + Math.round(Math.abs(a.top - b.top) / k) + ' px)'); break; }
        if (Math.max(a.height, b.height) / Math.min(a.height, b.height) > 1.5) { add('aviso', cards[i], 'alturas muy distintas en la fila (' + Math.round(a.height / k) + ' y ' + Math.round(b.height / k) + ' px)'); break; }
      }
    });

    // Textos de trabajo
    const firme = /\bTODO\b|\bFIXME\b|lorem ipsum|\bplaceholder\b|\bfoto aqu[ií]\b|\bimagen aqu[ií]\b|\bt[ií]tulo aqu[ií]\b|\btexto aqu[ií]\b|\btu logo\b|\bXXX+\b/i;
    const dudoso = /\(pendiente\)|\bpor (confirmar|definir|completar)\b|\bTBD\b/i;
    visibles.forEach(e => { const t = textos(e).map(n => n.textContent).join(' '); if (!t.trim()) return;
      const m = (/\btodo\b/i.test(t) && !/\bTODO\b/.test(t)) ? t.replace(/\btodo\b/gi, '').match(firme) : t.match(firme);
      if (m) add(o.plantilla ? 'aviso' : 'error', e, 'texto de trabajo visible «' + corto(t, 40) + '»');
      else if (dudoso.test(t) && !/\b(fechas?|plazos?|semanas?|meses|d[ií]as?|hitos?)\b[^.]{0,24}\bpor (definir|confirmar)|\bpor (definir|confirmar)\b[^.]{0,24}\b(fechas?|plazos?)/i.test(t) && !(t.trim().split(/\s+/).length <= 3 && /^por (definir|confirmar)$/i.test(t.trim()))) add('aviso', e, 'posible texto de trabajo «' + corto(t, 40) + '»');
    });
    if (!o.plantilla) visibles.filter(e => e.matches('.ph')).forEach(e => add('error', e, 'marcador de imagen sin reemplazar «' + corto(e.textContent, 30) + '»'));

    // Visual
    if (o.pideVisual) {
      const hay = root.querySelector('img,video,canvas,table,[data-sim],.bars,.waffle,.gauge,.chart,.flow,.media,.ph,.tline,.donut,.ba,.d2-diagrama,.gantt,.arbol,.circulo,.dm-nb,.linea-flujo,.fc,.est,.mp,.eq-c,.c4c,.cifra2,.g-semanas,.pasos2,.lado-foto,.demo,.base,.macro') || [...root.querySelectorAll('svg')].some(s => vis(s) && s.getBoundingClientRect().width > 80 * k);
      if (!hay) add('aviso', root, o.deck ? 'lámina sin visual' : 'sección sin visual');
    }

    // Imágenes de baja resolución para su tamaño
    visibles.filter(e => e.matches('img')).forEach(im => {
      if (!im.naturalWidth) return add('error', im, 'imagen rota');
      if (/\.svg|^data:image\/svg/i.test(im.currentSrc || im.src)) return;
      const w = im.offsetWidth, h = im.offsetHeight, fit = getComputedStyle(im).objectFit;
      const esc = fit === 'cover' ? Math.max(w / im.naturalWidth, h / im.naturalHeight) : fit === 'contain' ? Math.min(w / im.naturalWidth, h / im.naturalHeight) : w / im.naturalWidth;
      if (esc > 1.02) add('aviso', im, 'imagen de baja resolución (' + im.naturalWidth + ' px de ancho para ' + w + ' px, ' + (1 / esc).toFixed(2) + 'x)');
    });

    // Texto chico: el umbral de la guía (22 px en deck, 14 px en informe)
    const chicos = {};
    visibles.filter(e => !e.closest('svg') && textos(e).length).forEach(e => { const cs0 = getComputedStyle(e), fs = parseFloat(cs0.fontSize), eti = cs0.textTransform === 'uppercase' && /mono|plex mono|jetbrains|courier/i.test(cs0.fontFamily) && parseFloat(cs0.letterSpacing) > 0 ? (o.deck ? 16 : 11) * (o.k || 1) : 0; if (fs < o.chico - .5 && !(eti && fs >= eti - .5)) (chicos[Math.round(fs)] = chicos[Math.round(fs)] || []).push(e); });
    for (const [fs, xs] of Object.entries(chicos)) add('aviso', xs[0], 'texto chico (' + fs + ' px, mínimo ' + o.chico + ') en ' + xs.length + ' texto' + (xs.length > 1 ? 's' : '') + ', por ejemplo «' + corto(xs[0].textContent, 24) + '»');

    return out;
  };

  // Palabras visibles, sin guion, notas ni marco
  window.__rvPalabras = root => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n = 0, t; while ((t = w.nextNode())) { const p = t.parentElement; if (!p || p.closest(FUERA + ',svg')) continue; n += (t.textContent.match(/\S+/g) || []).length; } return n; };

  // Marcas del guion
  window.__rvMarcas = sl => {
    const g = sl.querySelector('aside.voz'); if (!g) return [];
    const t = g.textContent, out = []; let i = 0, m; const re = /\[(paso|foco|clic)(?::\w+)?\s/;
    while ((m = re.exec(t.slice(i)))) {
      const a = i + m.index; let d = 0, j = a;
      while (j < t.length) { if (t[j] === '[') d++; if (t[j] === ']') d--; j++; if (!d) break; }
      const arg = t.slice(a + m[0].length, j - 1).trim(); i = j;
      if (m[1] === 'paso') { if (!sl.querySelector('[data-step="' + arg + '"]')) out.push({ n: 'error', s: 'aside.voz', t: '[paso ' + arg + '] sin data-step="' + arg + '" en la lámina' }); continue; }
      if (arg === '-') continue;
      for (const s of arg.split(/\s+\|\s+/)) { let ok = false; try { ok = !!sl.querySelector(s); } catch { out.push({ n: 'error', s: 'aside.voz', t: '[' + m[1] + ' ' + s + ']: selector inválido' }); continue; } if (!ok) out.push({ n: 'error', s: 'aside.voz', t: '[' + m[1] + ' ' + s + ']: el selector no existe en la lámina' }); }
    }
    return out;
  };

  // Recursos remotos: lo que dejaría de verse sin internet
  window.__rvRemotos = () => { const out = []; document.querySelectorAll('link[rel=stylesheet][href],script[src],img[src],video[src],audio[src],source[src],iframe[src]').forEach(e => { const u = e.getAttribute('href') || e.getAttribute('src'); if (/^(https?:)?\/\//.test(u)) out.push({ s: e.tagName.toLowerCase(), u: u.slice(0, 80) }); }); return out; };
  window.__rvBusca = nombre => { const e = [...document.querySelectorAll('[src],[href],[poster]')].find(x => (x.getAttribute('src') || x.getAttribute('href') || x.getAttribute('poster') || '').includes(nombre)); if (!e) return null; const sl = e.closest('.slide'); return { s: sel(e), n: sl ? [...document.querySelectorAll('.stage > .slide')].indexOf(sl) + 1 : 0 }; };
  window.__rvSonando = () => (window.__rvPlay || []).length + [...document.querySelectorAll('audio,video')].filter(m => !m.paused && !m.muted && m.volume > 0).length;
})();`;

const url = pathToFileURL(file).href;
const html = readFileSync(file, 'utf8');
const isDeck = /class="stage"/.test(html) && /__deck/.test(html);
// La plantilla misma trae ejemplos a propósito: sus restos no son errores
const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const esPlantilla = dirname(file) === resolve(assets);
const reconocido = isDeck || /<main[\s>]/i.test(html);
const titulosDe = async () => evaluate(`[...document.querySelectorAll('${isDeck ? '.stage > .slide' : 'h1, main h2'}')].map(s => { const h = ${isDeck ? "s.querySelector('h1,h2,h3')" : 's'}; return h ? h.textContent.trim().replace(/\\s+/g, ' ') : '(sin título)'; })`);
const queLamina = n => `Lámina ${n}`;
const revisado = [];

// Fuente: rutas locales y peso
const sinData = html.replace(/data:[a-z0-9.+\/-]+;base64,[A-Za-z0-9+\/=]+/gi, 'data:');
const reRuta = /(?:\/Users\/|\/home\/|[A-Za-z]:\\+Users\\+)[^\s"'<>…]+/g;
for (const m of sinData.matchAll(reRuta)) {
  const antes = sinData.slice(0, m.index), linea = antes.split('\n').length;
  const lam = (antes.match(/<section\b[^>]*class="[^"]*\bslide\b/g) || []).length;
  const enMeta = /<meta\s+name="informe:/.test(antes.slice(antes.lastIndexOf('\n') + 1));
  anota(enMeta ? 'aviso' : 'error', lam ? queLamina(lam) : `Línea ${linea}`, enMeta ? 'meta informe:carpeta' : `línea ${linea}`, `ruta local en el HTML (${m[0].slice(0, 50)})`);
}
const mb = statSync(file).size / 1048576;
if (mb > 15) anota('aviso', '', '', `el archivo pesa ${mb.toFixed(1)} MB (más de 15 MB)`);
revisado.push('rutas locales', 'peso');

const pasarLista = (donde, lista) => lista.forEach(x => anota(x.n, donde, x.s, x.t));
let titulos = [];

// Audio al abrir: se carga como lo abriría una persona, sin ?estatico
await viewport(1600, 900); await scheme(false);
await ir(url + (inputHash ? '#' + inputHash : ''), 1500);
await evaluate(REVISOR);
if (await evaluate('window.__rvSonando()')) anota('error', '', 'audio/video', 'hay audio sonando al abrir (el narrador parte apagado)');
(await evaluate('window.__rvRemotos()')).forEach(x => anota('aviso', '', x.s, `recurso remoto, no se verá sin internet: ${x.u}`));
revisado.push('audio al abrir', 'recursos remotos');

if (isDeck) {
  const base = url + '?estatico';
  await viewport(1920, 1080);
  await ir(base + '#' + (inputHash || '1'));
  await evaluate(REVISOR);
  await evaluate('window.__rvCanvas = 1');
  const count = await evaluate('window.__deck ? window.__deck.count : 0');
  titulos = await titulosDe();
  const propios = esPlantilla ? new Set() : new Set(titulosPlantilla('deck.html'));
  const names = [];
  for (let n = 1; n <= count; n++) {
    await evaluate(`window.__deck.show(${n - 1}, 'end')`); await sleep(120);
    names.push(await shot(`lamina-${String(n).padStart(2, '0')}.png`));
    const donde = queLamina(n), sl = `document.querySelectorAll('.stage > .slide')[${n - 1}]`;
    // Desbordes, encuadre y clases fuera de uso
    pasarLista(donde, await evaluate(`(() => {
      const sl = ${sl}, R = sl.getBoundingClientRect(), out = [], FUERA = '.voz,.notas,.nar-ui,.ui,.rotate,script,style';
      const nom = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/)[0] : '');
      sl.querySelectorAll('*').forEach(el => {
        if (el.closest(FUERA) || el.closest('svg') && !el.matches('svg')) return;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
        if (r.right > R.right + 2 || r.bottom > R.bottom + 2 || r.left < R.left - 2 || r.top < R.top - 2) {
          if (el.matches('.tex') || el.closest('.tex')) return; // texturas decorativas que sangran del borde a propósito
          for (let a = el.parentElement; a && a !== sl; a = a.parentElement) { const o = getComputedStyle(a); if (o.overflow !== 'visible' && o.overflow !== '') { const q = a.getBoundingClientRect(); if (q.left >= R.left - 2 && q.right <= R.right + 2 && q.top >= R.top - 2 && q.bottom <= R.bottom + 2) return; } } // recortado por un contenedor que sí cabe
          const dec = el.closest('.media,[aria-hidden=true]') || el.matches('img,video') || !el.textContent.trim() && !el.matches('svg,canvas'); out.push({ n: dec ? 'aviso' : 'error', s: nom(el), t: 'se sale de la lámina' + (el.textContent.trim() ? ' «' + el.textContent.trim().slice(0, 32) + '»' : '') }); }
        else if (['P','LI','H1','H2','H3','TD','DIV','SPAN'].includes(el.tagName) && !el.querySelector(':scope > .tex') && el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') out.push({ n: 'aviso', s: nom(el), t: 'texto cortado' });
      });
      sl.querySelectorAll('.ic:not(svg)').forEach(e => out.push({ n: 'aviso', s: nom(e), t: 'usa la clase .ic en un ' + e.tagName.toLowerCase() + ' (es la del ícono de la plantilla; usa otro nombre)' }));
      if (!sl.matches('.seccion,.partida,.portada,.portada2,.cierre,.cierre-dp')) {
        const hojas = [...sl.querySelectorAll('*')].filter(e => !e.closest('.mbar,.srcl,.num,.rail-s,.voz,.notas,svg>*') && !e.children.length || e.matches('img,svg,.bars>div,.waffle,.gauge'));
        const rs = hojas.map(e => e.getBoundingClientRect()).filter(r => r.width && r.height);
        if (rs.length) {
          const top = Math.min(...rs.map(r => r.top)), bot = Math.max(...rs.map(r => r.bottom)), k = R.height / 1080;
          const alto = (bot - top) / (800 * k), arriba = (top - R.top) / k - 150, abajo = 950 - (bot - R.top) / k;
          if (alto < .6) out.push({ n: 'aviso', s: '', t: 'encuadre: el contenido usa ' + Math.round(alto * 100) + ' % del alto útil (sobran ' + Math.round(Math.max(0, arriba)) + ' px arriba y ' + Math.round(Math.max(0, abajo)) + ' px abajo)' });
        }
      }
      return out;
    })()`));
    pasarLista(donde, await evaluate(`__rv(${sl}, { k: ${sl}.getBoundingClientRect().width / 1920, chico: 22, deck: true, plantilla: ${esPlantilla}, pideVisual: !${sl}.matches('.portada,.portada2,.seccion,.partida,.cierre,.cierre-dp') })`));
    pasarLista(donde, await evaluate(`__rvContraste(${sl})`));
    pasarLista(donde, await evaluate(`__rvMarcas(${sl})`));
    const pal = await evaluate(`__rvPalabras(${sl})`);
    const tope = await evaluate(`${sl}.classList.contains('dp') ? 70 : 40`);
    if (pal > tope) anota('aviso', donde, '', `${pal} palabras en la lámina (guía: unas 40` + (tope === 70 ? '; en láminas .dp, hasta unas 70' : '') + ')');
    if (propios.has(titulos[n - 1])) anota('aviso', donde, 'título', `resto de plantilla: el título es igual al del ejemplo («${titulos[n - 1].slice(0, 40)}»)`);
  }
  revisado.push('desbordes', 'texto chico', 'contraste', 'encuadre', 'solapes por paso', 'SVG y viewBox', 'centrado y filas', 'textos de trabajo', 'palabras', 'visual por lámina', 'resolución', 'marcas del guion');
  // Hoja de contactos
  const sheet = join(out, '_hoja.html');
  writeFileSync(sheet, `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:12px;font:12px sans-serif;color:#ccc">` +
    names.map((f, k) => `<div><img src="${f}" style="width:100%;display:block;border-radius:4px"><div style="padding:4px 2px">${k + 1}</div></div>`).join('') + '</body>');
  await viewport(1600, 900);
  await ir(pathToFileURL(sheet).href);
  await fullPage('hoja', 1600);
  rmSync(sheet);
  // Celular: horizontal y vertical; se revisa el desborde de todas las láminas
  const portada = Math.min(2, count || 1);
  for (const [nombre, w, h] of [['movil-horizontal', 844, 390], ['movil-vertical', 390, 844]]) {
    await viewport(w, h, true, 2); await ir(`${base}#${portada}`); await shot(nombre + '.png');
    for (let n = 1; n <= count; n++) {
      await evaluate(`window.__deck.show(${n - 1}, 'end')`);
      const d = await evaluate(`(() => { const W = ${w}, sw = document.documentElement.scrollWidth, s = document.querySelector('.stage').getBoundingClientRect(); return sw > W + 1 ? 'scroll horizontal (' + sw + ' px en ' + W + ')' : (s.left < -1 || s.right > W + 1) ? 'la lámina se sale del ancho' : ''; })()`);
      if (d) anota('error', queLamina(n), nombre, d);
    }
  }
  revisado.push('desborde en celular');
  if (flags.has('--oscuro')) {
    await viewport(1920, 1080); await scheme(true); await ir(base + '#1'); await evaluate(REVISOR);
    for (let n = 1; n <= count; n++) {
      await evaluate(`window.__deck.show(${n - 1}, 'end')`); await sleep(80);
      await shot(`oscuro-lamina-${String(n).padStart(2, '0')}.png`);
      pasarLista(queLamina(n), await evaluate(`__rvContraste(document.querySelectorAll('.stage > .slide')[${n - 1}], ' en oscuro')`));
    }
    await scheme(false); revisado.push('modo oscuro');
  }
  if (flags.has('--pdf')) {
    await viewport(1920, 1080); await ir(base + '#1');
    const r = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
    writeFileSync(join(out, basename(file, '.html') + '.pdf'), Buffer.from(r.data, 'base64'));
  }
  console.log(`Deck: ${count} láminas → ${out}`);
  if (count > 12) anota('aviso', '', '', `${count} láminas (guía: hasta 12)`);
} else {
  const raices = `[...document.querySelectorAll('main section, main > article')].filter(s => !s.parentElement.closest('section'))`;
  const principal = `(document.querySelector('main') || document.body)`;
  await viewport(1440, 900); await scheme(false); await ir(url + (inputHash ? '#' + inputHash : ''));
  await evaluate(REVISOR);
  titulos = await titulosDe();
  const d = await fullPage('escritorio', 1440);
  const secciones = await evaluate(`${raices}.length`);
  pasarLista('Página', await evaluate(`__rv(${principal}, { k: 1, chico: 14, plantilla: ${esPlantilla}, pideVisual: false })`));
  for (let n = 0; n < secciones; n++) {
    const pedido = await evaluate(`(() => { const s = ${raices}[${n}]; const h = s.querySelector('h2,h3'); return (h ? h.textContent : s.id || '').trim().slice(0, 40); })()`);
    pasarLista(`Sección ${n + 1}${pedido ? ' «' + pedido + '»' : ''}`, await evaluate(`__rv(${raices}[${n}], { k: 1, chico: 0, plantilla: true, pideVisual: true }).filter(x => /sin visual/.test(x.t))`));
  }
  pasarLista('Página', await evaluate(`__rvContraste(document.body)`));
  // Encuadre del informe: huecos verticales grandes o contenido angosto
  pasarLista('Página', await evaluate(`(() => {
    const m = ${principal}, out = [], R = m.getBoundingClientRect();
    const rs = [...m.querySelectorAll('*')].filter(e => !e.children.length || e.matches('img,svg,table')).filter(e => !e.closest('svg>*')).map(e => e.getBoundingClientRect()).filter(r => r.width && r.height).sort((a, b) => a.top - b.top);
    let bot = rs.length ? rs[0].bottom : 0;
    for (const r of rs) { if (r.top - bot > 500) out.push({ n: 'aviso', s: 'main', t: 'encuadre: hueco vertical de ' + Math.round(r.top - bot) + ' px cerca de y=' + Math.round(bot + scrollY) }); bot = Math.max(bot, r.bottom); }
    if (rs.length) { const der = Math.max(...rs.map(r => r.right)), izq = Math.min(...rs.map(r => r.left)); if ((der - izq) < R.width * .5) out.push({ n: 'aviso', s: 'main', t: 'encuadre: el contenido usa ' + Math.round((der - izq) / R.width * 100) + ' % del ancho' }); }
    return out;
  })()`));
  await viewport(390, 844, true, 2); await ir(url);
  const m = await fullPage('movil', 390);
  const wide = await evaluate(`(() => {
    const W = 390, out = [];
    if (document.documentElement.scrollWidth > W + 1) out.push({ n: 'error', s: 'html', t: 'la página tiene scroll horizontal en celular (' + document.documentElement.scrollWidth + ' px)' });
    document.querySelectorAll('main *, header *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > W + 1 && r.width && !el.closest('.table-wrap') && ![...(function*(e){ for (; e; e = e.parentElement) yield e; })(el)].some(x => getComputedStyle(x).position === 'fixed')) out.push({ n: 'aviso', s: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''), t: 'se sale en celular' });
    });
    document.querySelectorAll('main *, header *, aside *').forEach(el => {
      const own = [...el.childNodes].some(c => c.nodeType === 3 && c.textContent.trim()), cs = getComputedStyle(el);
      if (own && !el.closest('svg') && cs.display !== 'none' && el.offsetParent && parseFloat(cs.fontSize) < 11) out.push({ n: 'aviso', s: el.tagName.toLowerCase(), t: 'texto chico en celular (' + parseFloat(cs.fontSize) + ' px): «' + el.textContent.trim().slice(0, 30) + '»' });
    });
    return out;
  })()`);
  pasarLista('Celular', wide);
  revisado.push('desbordes en celular', 'texto chico', 'contraste', 'encuadre', 'solapes', 'SVG y viewBox', 'centrado y filas', 'textos de trabajo', 'visual por sección', 'resolución');
  if (flags.has('--oscuro')) {
    await viewport(1440, 900); await scheme(true); await ir(url); await evaluate(REVISOR);
    await shot('escritorio-oscuro.png');
    pasarLista('Página', await evaluate(`__rvContraste(document.body, ' en oscuro')`));
    await scheme(false); revisado.push('modo oscuro');
  }
  if (flags.has('--pdf')) {
    await viewport(1440, 900); await ir(url);
    await evaluate(`document.querySelectorAll('details').forEach(d => d.open = true)`);
    const r = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
    writeFileSync(join(out, basename(file, '.html') + '.pdf'), Buffer.from(r.data, 'base64'));
  }
  console.log(`Informe: ${d.length} tramos de escritorio y ${m.length} de celular → ${out}`);
}

// Consola y recursos fallidos
await sleep(100);
for (const t of consola) anota('error', '', 'consola', t);
for (const [u, why] of fallidos) {
  const nombre = decodeURIComponent(u.split('?')[0].split('/').pop() || u);
  let d = null; try { d = await evaluate(`window.__rvBusca ? window.__rvBusca(${JSON.stringify(nombre)}) : null`); } catch {}
  anota('error', d?.n ? queLamina(d.n) : '', d?.s || 'recurso', `no cargó ${nombre.slice(0, 60)} (${why})`);
}
revisado.push('errores de consola', 'recursos fallidos');

if (!reconocido) {
  anota('error', '', 'formato', 'formato no reconocido: no es un deck de esta skill (.stage con __deck) ni un informe (<main>); NO se revisó su contenido. Un "sin errores" aquí no vale.');
  console.log('FORMATO NO RECONOCIDO: este HTML no sigue las plantillas de la skill, así que la revisión no aplica.');
}
console.log(`Títulos (${titulos.length}):`);
titulos.forEach((t, k) => console.log(`  ${String(k + 1).padStart(2)}. ${t}`));
const MAX = 40, lista = (nom, xs) => { if (!xs.length) return; console.log(`${nom} (${xs.length}):`); xs.slice(0, MAX).forEach(x => console.log('- ' + x)); if (xs.length > MAX) console.log(`- … y ${xs.length - MAX} más (revision.json)`); };
lista('ERRORES', errores); lista('AVISOS, revisar', avisos);
if (!errores.length && !avisos.length) console.log('Sin errores ni avisos.');
console.log(`Revisado: ${[...new Set(revisado)].join(', ')}. Igual mira cada imagen.`);
writeFileSync(join(out, 'revision.json'), JSON.stringify({ errores, avisos, titulos, revisado: [...new Set(revisado)] }, null, 1));
await c.cerrar();
process.exit(!reconocido ? 2 : flags.has('--estricto') && errores.length ? 1 : 0);

function titulosPlantilla(nombre) {
  try { return [...readFileSync(join(assets, nombre), 'utf8').matchAll(/<h[12][^>]*>([^<]+)<\/h[12]>/g)].map(m => m[1].trim()); } catch { return []; }
}
