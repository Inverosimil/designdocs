#!/usr/bin/env node
// PPTX editable de un deck HTML, con dom-to-pptx 2.1.2 (assets/vendor) y el Chrome del sistema.
//
//   node scripts/exportar-pptx.mjs deck.html [salida.pptx] [--ancho 10] [--alto 5.625] [--sin-comprobar]
//
// Fuerza el estado final (?estatico: todos los pasos visibles, contadores en su valor) antes de exportar.
// Tamaño en pulgadas. Textos y formas salen editables; los SVG (gráficos, diagramas) salen como imagen.
// Al terminar abre el .pptx (es un zip), cuenta textos y compara las cifras con las del HTML.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { abrirChrome, sleep } from './lib-chrome.mjs';

const args = process.argv.slice(2), val = n => { const k = args.indexOf(n); return k >= 0 ? args.splice(k, 2)[1] : null; };
const ancho = +(val('--ancho') || 10), alto = +(val('--alto') || 5.625), comprobar = !args.includes('--sin-comprobar');
const [src, dst] = args.filter(a => !a.startsWith('--'));
if (!src) { console.error('Uso: node scripts/exportar-pptx.mjs deck.html [salida.pptx] [--ancho 10] [--alto 5.625]'); process.exit(2); }
const file = resolve(src), salida = resolve(dst || file.replace(/\.html?$/i, '') + '.pptx');
if (!existsSync(file)) { console.error(`No existe: ${file}`); process.exit(2); }
const bundle = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'vendor', 'dom-to-pptx-2.1.2.bundle.js');
if (!existsSync(bundle)) { console.error(`Falta ${bundle}`); process.exit(2); }

const leerZip = buf => { // Lector mínimo de zip: nombre → contenido
  const fin = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 5, 6])), n = buf.readUInt16LE(fin + 10); let p = buf.readUInt32LE(fin + 16); const out = {};
  for (let i = 0; i < n; i++) {
    const met = buf.readUInt16LE(p + 10), tam = buf.readUInt32LE(p + 20), ln = buf.readUInt16LE(p + 28), lx = buf.readUInt16LE(p + 30), lc = buf.readUInt16LE(p + 32), loc = buf.readUInt32LE(p + 42);
    const nombre = buf.slice(p + 46, p + 46 + ln).toString(); p += 46 + ln + lx + lc;
    const ini = loc + 30 + buf.readUInt16LE(loc + 26) + buf.readUInt16LE(loc + 28), datos = buf.slice(ini, ini + tam);
    out[nombre] = met === 8 ? inflateRawSync(datos) : datos;
  }
  return out;
};

let c; try { c = await abrirChrome(['--allow-file-access-from-files']); } catch (e) { console.error(e.message); process.exit(2); }
const { send, evaluate, ir } = c;
let codigo = 0;
try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await ir(pathToFileURL(file).href + '?estatico#1', 600);
  if (!(await evaluate(`!!document.querySelector('.stage > .slide, section.slide')`))) throw new Error('No encontré láminas (.stage > .slide): el PPTX es solo para decks.');
  // Estado final: pasos visibles, contadores en su valor, sin interfaz ni animación; láminas en columna
  await evaluate(`(() => {
    const st = document.createElement('style');
    st.textContent = 'html,body{height:auto!important;overflow:visible!important}.viewport{position:static!important;overflow:visible!important}.stage{position:static!important;transform:none!important;height:auto!important;width:1920px!important}.slide{position:relative!important;opacity:1!important;visibility:visible!important;width:1920px;height:1080px}[data-step]{opacity:1!important;transform:none!important}.voz,.notas,.ui,.rotate,.nar-ui,.nar-ring,.nar-line,.nar-barra,.nar-prev,.nar-sub,.nar-ctl,.nar-rueda,.nar-panel,.nar-orilla,.cm-ui{display:none!important}*{animation:none!important;transition:none!important}';
    document.head.appendChild(st);
    st.textContent += '.logo-fijo:not(.logo-print){display:none!important}.num{white-space:nowrap!important}';
    // Íconos <use href="#..."> (sprite): la librería los rasteriza vacíos. Se copia el símbolo dentro del propio svg, con el color ya resuelto
    document.querySelectorAll('svg').forEach(sv => {
      const u = sv.querySelector(':scope > use[href^="#"]'); if (!u) return;
      const sym = document.getElementById(u.getAttribute('href').slice(1)); if (!sym) return;
      const cs = getComputedStyle(sv), vb = sym.getAttribute('viewBox'); if (vb) sv.setAttribute('viewBox', vb);
      sv.setAttribute('width', sv.getBoundingClientRect().width); sv.setAttribute('height', sv.getBoundingClientRect().height);
      sv.innerHTML = sym.innerHTML;
      sv.querySelectorAll('*').forEach(g => { g.setAttribute('fill', cs.fill); g.setAttribute('stroke', cs.stroke); g.setAttribute('stroke-width', cs.strokeWidth); g.setAttribute('stroke-linecap', cs.strokeLinecap); g.setAttribute('stroke-linejoin', cs.strokeLinejoin); });
    });
    // Logo fijo: en el HTML es una capa sobre el lienzo; aquí se repite en cada lámina, como al imprimir
    window.dispatchEvent(new Event('beforeprint'));
    document.querySelectorAll('[data-to],[data-count],.count').forEach(e => { const v = e.dataset.to ?? e.dataset.count; if (v != null && v !== '') e.textContent = v; });
    document.querySelectorAll('[data-step]').forEach(e => e.classList.add('shown'));
  })()`);
  // Peso: la librería rasteriza fondos y texturas en PNG al doble de tamaño (un PPTX de 6 láminas llegaba a 37 MB).
  // Se achican a 1920 px de ancho como máximo y, si no tienen transparencia, salen como JPEG calidad 80.
  await evaluate(`(() => {
    const o = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (tipo, q) {
      if ((tipo && tipo !== 'image/png') || !this.width || !this.height || this.width * this.height < 400000) return o.apply(this, arguments);
      try {
        const k = Math.min(1, 1920 / this.width), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(this.width * k)); c.height = Math.max(1, Math.round(this.height * k));
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(this, 0, 0, c.width, c.height);
        const d = x.getImageData(0, 0, c.width, c.height).data; let opaco = true;
        for (let i = 3; i < d.length; i += 4 * 7) if (d[i] < 255) { opaco = false; break; }
        return opaco ? o.call(c, 'image/jpeg', .8) : o.call(c, 'image/png');
      } catch (e) { return o.apply(this, arguments); }
    };
  })()`);
  const lib = readFileSync(bundle, 'utf8');
  await send('Runtime.evaluate', { expression: lib, returnByValue: false });
  await sleep(300);
  const r = await evaluate(`(async () => {
    const lib = window.domToPptx || window.DomToPptx; if (!lib) return { error: 'No cargó dom-to-pptx' };
    const els = [...document.querySelectorAll('.stage > .slide, section.slide')];
    const textoHtml = els.map(s => { const c = s.cloneNode(true); c.querySelectorAll('.voz,.notas,script,style').forEach(x => x.remove()); return c.textContent; }).join(' ');
    try {
      const b = await lib.exportToPptx(els, { skipDownload: true, svgAsVector: false, autoEmbedFonts: false, width: ${ancho}, height: ${alto} });
      const buf = new Uint8Array(await b.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode.apply(null, buf.subarray(i, i + 32768));
      return { b64: btoa(s), textoHtml, n: els.length };
    } catch (e) { return { error: String(e) + ' ' + (e.stack || '') }; }
  })()`);
  if (r.error) throw new Error(r.error);
  const buf = Buffer.from(r.b64, 'base64');
  writeFileSync(salida, buf);
  console.log(`PPTX: ${salida} · ${(buf.length / 1048576).toFixed(1)} MB · ${r.n} láminas · ${ancho} x ${alto} pulgadas`);
  if (buf.length > 15 * 1048576) console.log(`AVISO: el PPTX pesa ${(buf.length / 1048576).toFixed(1)} MB y no cabe en la mayoría de los correos (límite habitual 20-25 MB). Usa menos fotos grandes o comparte el PDF.`);
  console.log('Ojo: los SVG (gráficos, diagramas) salen como imagen; textos y formas quedan editables.');
  if (comprobar) {
    const z = leerZip(buf), laminas = Object.keys(z).filter(k => /^ppt\/slides\/slide\d+\.xml$/.test(k));
    const textos = laminas.flatMap(k => [...z[k].toString('utf8').matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]));
    const cifras = t => new Set((t.match(/\d[\d.,]*\d|\d/g) || []));
    const enHtml = cifras(r.textoHtml), enPptx = cifras(textos.join(' ')), faltan = [...enHtml].filter(x => !enPptx.has(x));
    console.log(`Comprobado en el zip: ${laminas.length} láminas, ${textos.length} textos, ${enPptx.size} de ${enHtml.size} cifras del HTML` + (faltan.length ? `; faltan (quizá dentro de un SVG): ${faltan.slice(0, 15).join(', ')}` : '.'));
    if (laminas.length !== r.n) { console.error(`ERROR: el HTML tiene ${r.n} láminas y el PPTX ${laminas.length}.`); codigo = 1; }
    if (!textos.length) { console.error('ERROR: el PPTX no tiene textos editables.'); codigo = 1; }
  }
} catch (e) { console.error('Falló: ' + e.message); codigo = 1; }
await c.cerrar();
process.exit(codigo);
