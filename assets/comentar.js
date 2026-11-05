/* ===================== MODO COMENTAR (comentar.js) =====================
   Módulo autocontenido, sin dependencias: se pega entero dentro de un <script> de la plantilla (informe o deck).
   Quien lee el documento deja notas ancladas a lo que ve; las copia como Markdown y se las pasa a quien lo hizo.

   Uso del lector: tecla C (o el botón "Comentar") prende el modo; un clic sobre cualquier cosa abre la nota
   (en el deck, el clic NO cambia de lámina ni sigue enlaces mientras el modo está prendido). Esc sale.
   Las notas se guardan en el navegador (localStorage, una clave por documento) y se vuelven a ubicar al cargar.

   Para la plantilla:
   · window.__comentar.abrir() / cerrar() / alternar()  → prender o apagar el modo.
   · window.__comentar.montarEn(panel, {cerrar})        → agrega "Comentar" y "Ver comentarios" a un panel de
     opciones ya armado (copia las clases del primer botón role="switch" del panel). Sin panel, el módulo
     dibuja su propio botón flotante abajo a la izquierda (no en un deck: allí solo la tecla C).
   · window.__comentar.ignorar('.mi-ui')                → clases de UI ajena que nunca se comentan.
   · Lee window.__deck (slides, i, show) si existe: guarda lámina y título; si no, sección y su <h2>.
   · Evento document 'comentar:modo' {detail:{activo}} por si la plantilla quiere pausar algo.
   · Invisible al imprimir y con ?estatico (ahí expone un objeto inerte). Respeta e.defaultPrevented y .nar-ui. */
(() => {
  'use strict';
  if (window.__comentar) return;
  const raiz = document.documentElement;
  if (new URLSearchParams(location.search).has('estatico')) {
    window.__comentar = { inerte: true, activo: false, abrir() {}, cerrar() {}, alternar() {}, montarEn() {}, ignorar() {}, notas: () => [], markdown: () => '' };
    return;
  }

  const ESTILO = `
.cm-capa{position:absolute;left:0;top:0;width:0;height:0;z-index:8900;pointer-events:none;display:none}
html.cm-ver .cm-capa{display:block}
.cm-pin{all:unset;box-sizing:border-box;position:absolute;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;display:grid;place-items:center;pointer-events:auto;cursor:pointer;
  background:var(--accent,#c9f25a);color:var(--bg,#111);font:600 12px/1 var(--mono,ui-monospace,Menlo,monospace);box-shadow:0 0 0 2px var(--bg,#111),0 4px 14px #0007;transition:transform .15s}
.cm-pin:hover,.cm-pin:focus-visible{transform:scale(1.18)}
.cm-pin:focus-visible{outline:2px solid var(--fg,#fff);outline-offset:3px}
.cm-pin.cm-sel{transform:scale(1.25);box-shadow:0 0 0 2px var(--bg,#111),0 0 0 4px var(--accent,#c9f25a)}
.cm-hover{position:absolute;z-index:8800;pointer-events:none;display:none;border:2px dashed var(--accent,#c9f25a);border-radius:var(--r,4px);background:color-mix(in oklab,var(--accent,#c9f25a) 12%,transparent)}
html.cm-on .cm-hover.cm-v{display:block}
.cm-hover.cm-flash{display:block;border-style:solid;animation:cm-fl 1.7s ease-out forwards}
@keyframes cm-fl{0%,60%{opacity:1}100%{opacity:0}}
html.cm-on body :not(.cm-ui):not(.cm-ui *){cursor:crosshair!important}
.cm-ui,.cm-ui *{box-sizing:border-box}
.cm-ui{font:400 14px/1.45 var(--sans,system-ui,-apple-system,"Segoe UI",sans-serif);color:var(--fg,#f1f1f1);letter-spacing:0;text-transform:none;text-align:left}
.cm-ui button{font:inherit;color:inherit}
.cm-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;padding:9px 12px;border-radius:var(--r,4px);
  border:1px solid color-mix(in oklab,currentColor 38%,transparent);font:500 12.5px/1 var(--sans,system-ui,sans-serif);color:inherit}
.cm-btn:hover{background:color-mix(in oklab,currentColor 12%,transparent)}
.cm-btn:focus-visible{outline:2px solid var(--accent,#c9f25a);outline-offset:2px}
.cm-btn.cm-p{background:var(--accent,#c9f25a);border-color:var(--accent,#c9f25a);color:var(--bg,#111)}
.cm-btn.cm-p:hover{filter:brightness(1.08)}
.cm-btn.cm-t{border-color:transparent;padding:6px 8px;font-size:12px;color:var(--soft,#bbb)}
.cm-btn.cm-t:hover{color:var(--fg,#fff)}
.cm-btn[hidden]{display:none}
.cm-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cm-lanz{position:fixed;left:16px;bottom:16px;z-index:9000;display:flex;gap:6px;color:var(--fg,#f1f1f1)}
.cm-lanz .cm-btn{background:var(--bg,#111);border-color:var(--off,rgba(255,255,255,.28));box-shadow:0 10px 30px -14px #000a;padding:11px 14px}
html.cm-on .cm-lanz{display:none}
.cm-barra{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9000;display:none;align-items:center;gap:6px;padding:6px 6px 6px 16px;max-width:calc(100vw - 24px);
  background:var(--fg,#f1f1f1);color:var(--bg,#111);border-radius:var(--r,4px);box-shadow:0 14px 40px -12px #000a}
html.cm-on .cm-barra{display:flex}
.cm-barra b{font:500 11px/1.3 var(--mono,ui-monospace,monospace);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
.cm-barra span{font-size:13px;opacity:.75;margin-right:6px}
.cm-barra i{width:8px;height:8px;border-radius:50%;background:var(--accent,#c9f25a);box-shadow:0 0 0 2px color-mix(in oklab,var(--bg,#111) 40%,transparent);flex:none}
.cm-aviso{position:fixed;left:50%;bottom:76px;transform:translate(-50%,8px);z-index:9100;padding:8px 14px;border-radius:var(--r,4px);background:var(--bg,#111);color:var(--fg,#fff);
  border:1px solid var(--off,rgba(255,255,255,.3));font-size:13px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;max-width:calc(100vw - 24px)}
.cm-aviso.cm-v{opacity:1;transform:translate(-50%,0)}
.cm-ed{position:fixed;z-index:9100;width:min(340px,calc(100vw - 24px));display:none;padding:14px;border-radius:var(--r,4px);background:var(--bg,#111);color:var(--fg,#f1f1f1);
  border:1px solid var(--off,rgba(255,255,255,.3));box-shadow:0 24px 60px -16px #000c}
.cm-ed.cm-v{display:block}
.cm-ed .cm-q{font:500 11px/1.5 var(--mono,ui-monospace,monospace);letter-spacing:.06em;color:var(--faint,#999);margin:0 0 8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-word}
.cm-ed textarea{display:block;width:100%;min-height:84px;resize:vertical;padding:9px 10px;border:1px solid var(--off,rgba(255,255,255,.3));border-radius:var(--r,4px);background:transparent;color:inherit;font:400 14px/1.5 var(--sans,system-ui,sans-serif);outline:0}
.cm-ed textarea:focus{border-color:var(--accent,#c9f25a)}
.cm-ed .cm-fila{display:flex;gap:6px;margin-top:10px;align-items:center}
.cm-ed .cm-fila .cm-sp{flex:1}
.cm-ed small{display:block;color:var(--faint,#999);font-size:11.5px;margin-top:8px}
.cm-lista{position:fixed;top:0;right:0;bottom:0;z-index:9050;width:min(390px,100vw);display:flex;flex-direction:column;background:var(--bg,#111);color:var(--fg,#f1f1f1);border-left:1px solid var(--line,rgba(255,255,255,.15));
  box-shadow:-30px 0 80px #0005;transform:translateX(102%);visibility:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),visibility 0s .35s}
html.cm-lis .cm-lista{transform:none;visibility:visible;transition:transform .35s cubic-bezier(.22,1,.36,1)}
.cm-lista header{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:18px 18px 12px}
.cm-lista h2{margin:0;font:500 11px/1.4 var(--mono,ui-monospace,monospace);letter-spacing:.14em;text-transform:uppercase;color:var(--faint,#999)}
.cm-lista ol{list-style:none;margin:0;padding:0 12px;overflow:auto;flex:1;overscroll-behavior:contain}
.cm-lista li{display:grid;grid-template-columns:28px 1fr;gap:10px;padding:12px 6px;border-top:1px solid var(--line,rgba(255,255,255,.15))}
.cm-lista li>b{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--accent,#c9f25a);color:var(--bg,#111);font:600 12px/1 var(--mono,ui-monospace,monospace)}
.cm-lista li.cm-huerfana>b{background:transparent;color:var(--faint,#999);border:1px dashed var(--off,rgba(255,255,255,.3))}
.cm-lista .cm-lu{font:500 11px/1.5 var(--mono,ui-monospace,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--faint,#999)}
.cm-lista .cm-lq{font-size:12.5px;color:var(--soft,#bbb);font-style:italic;margin:2px 0 4px;word-break:break-word}
.cm-lista .cm-ln{white-space:pre-wrap;word-break:break-word}
.cm-lista .cm-la{display:flex;gap:2px;margin:4px 0 0 -8px}
.cm-lista .cm-vacio{padding:24px 18px;color:var(--soft,#bbb);font-size:13.5px;border:0}
.cm-lista footer{display:flex;flex-wrap:wrap;gap:6px;padding:12px 18px 18px;border-top:1px solid var(--line,rgba(255,255,255,.15))}
.cm-lista footer .cm-btn{flex:1 1 auto}
.cm-op{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 8px;cursor:pointer}
@media (max-width:600px){
.cm-lanz .cm-btn{font-size:0;gap:0;padding:11px}
  .cm-ed{left:8px!important;right:8px;top:auto!important;bottom:8px;width:auto}
  .cm-barra{padding-left:12px;bottom:72px}.cm-barra span{display:none}.cm-aviso{bottom:132px}
  .cm-lanz .cm-btn{padding:12px 14px}
}
@media (prefers-reduced-motion:reduce){.cm-lista,.cm-aviso,.cm-pin{transition:none}.cm-hover.cm-flash{animation:none}}
@media print{.cm-ui,.cm-capa,.cm-hover,.cm-lanz,.cm-barra,.cm-lista,.cm-ed,.cm-aviso{display:none!important}}
`;

  // ---------- utilidades ----------
  const h = (tag, props = {}, ...hijos) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    hijos.flat().forEach(c => c != null && e.append(c));
    return e;
  };
  const svgIcono = d => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS(s.namespaceURI, 'path'); p.setAttribute('d', d); s.append(p); return s; };
  const ICONO = 'M21 12a8 8 0 0 1-11.6 7.1L3 20.5l1.6-4.9A8 8 0 1 1 21 12z';
  const norm = t => (t || '').replace(/\s+/g, ' ').trim();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const IGN0 = '.cm-ui,.nar-ui,.nar-barra,.nar-prev,.nar-orilla' ;
  let ignorarSel = IGN0;
  const ignorado = t => !!t.closest?.(ignorarSel);
  const escribiendo = e => { const t = e.composedPath?.()[0] || e.target; return !!(t && (t.isContentEditable || t.closest?.('input,textarea,select,[contenteditable]'))); };

  // ---------- almacenamiento (una clave por documento) ----------
  const CLAVE = 'comentarios:' + location.pathname;
  let S = { notas: [] };
  const leer = () => {
    try {
      const j = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      S = { notas: Array.isArray(j?.notas) ? j.notas.filter(n => n && typeof n.nota === 'string') : [] };
    } catch (e) { /* sin almacenamiento: las notas viven en memoria */ }
  };
  const guardar = () => {
    try { localStorage.setItem(CLAVE, JSON.stringify(S, (k, v) => k[0] === '_' ? undefined : v)); } catch (e) { /* idem */ }
  };

  // ---------- dónde está algo: unidad (lámina o sección), selector estable y extracto ----------
  const tituloDe = nodo => norm(nodo?.dataset?.titulo || nodo?.querySelector?.('h1,h2,[data-k=titulo]')?.textContent);
  const unidadDe = el => {
    const D = window.__deck;
    if (D?.slides) {
      let n = D.slides.indexOf(el.closest('.slide')); if (n < 0) n = D.i ?? 0;
      return { tipo: 'Lámina', n: n + 1, titulo: tituloDe(D.slides[n]) };
    }
    const secs = [...document.querySelectorAll('main > section')];
    const s = el.closest('main > section');
    if (s) return { tipo: 'Sección', n: secs.indexOf(s) + 1, titulo: norm(s.querySelector('h2')?.textContent) };
    return { tipo: '', n: 0, titulo: '' };
  };
  const pasoDe = el => { const s = el.closest?.('[data-step]'); const p = s ? parseInt(s.dataset.step, 10) : 0; return p > 0 ? p : 0; };
  const unico = sel => { try { return document.querySelectorAll(sel).length === 1; } catch (e) { return false; } };
  const selectorDe = el => {
    const partes = [];
    let n = el, ancla = false;
    while (n && n.nodeType === 1 && n !== document.body && n !== document.documentElement) {
      if (n.id) { const s = '#' + CSS.escape(n.id); if (unico(s)) { partes.unshift(s); ancla = true; break; } }
      const di = n.getAttribute('data-id');
      if (di) { const s = `[data-id="${di.replace(/"/g, '\\"')}"]`; if (unico(s)) { partes.unshift(s); ancla = true; break; } }
      const p = n.parentElement; if (!p) break;
      partes.unshift(`${n.localName}:nth-child(${[...p.children].indexOf(n) + 1})`);
      n = p;
    }
    return (ancla ? '' : 'body > ') + partes.join(' > ');
  };
  const textoDe = el => {
    const dir = el.getAttribute?.('aria-label') || el.getAttribute?.('alt') || '';
    if (el instanceof SVGElement || el.localName === 'img') return norm(dir || el.querySelector?.('title')?.textContent || '');
    return norm(el.innerText ?? el.textContent) || norm(dir || el.querySelector?.('[aria-label]')?.getAttribute('aria-label') || el.querySelector?.('img[alt]')?.alt);
  };
  const extractoDe = el => {
    const t = textoDe(el).replace(/"/g, "'");
    if (t.length <= 70) return t;
    const c = t.slice(0, 70), k = c.lastIndexOf(' ');
    return (k > 40 ? c.slice(0, k) : c) + '…';
  };
  const buscarPorTexto = n => {
    const ext = (n.extracto || '').replace(/…$/, '');
    if (ext.length < 6) return null;
    let mejor = null, mejorLen = Infinity;
    for (const e of document.body.querySelectorAll('*')) {
      if (e.closest('.cm-ui,script,style')) continue;
      const t = textoDe(e);
      if (t.replace(/"/g, "'").startsWith(ext) && t.length < mejorLen) { mejor = e; mejorLen = t.length; }
    }
    return mejor;
  };
  const resolver = n => {
    if (n._el?.isConnected) return n._el;
    let e = null;
    try { e = document.querySelector(n.sel); } catch (err) { /* selector roto */ }
    if (e && n.extracto && !textoDe(e).replace(/"/g, "'").startsWith(n.extracto.replace(/…$/, '').slice(0, 24))) e = buscarPorTexto(n) || e;
    if (!e) e = buscarPorTexto(n);
    return (n._el = e);
  };
  const visible = el => {
    if (!el?.isConnected) return false;
    const r = el.getBoundingClientRect(); if (!r.width && !r.height) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    }
    return true;
  };

  // ---------- notas ----------
  const ordenadas = () => [...S.notas].sort((a, b) => (a.unidad?.n || 0) - (b.unidad?.n || 0) || a.t - b.t);
  const etiqueta = n => {
    const u = n.unidad || {};
    const base = u.tipo ? `${u.tipo} ${u.n}${n.paso ? ` (paso ${n.paso})` : ''}` : 'Inicio';
    return [base, u.titulo].filter(Boolean).join(' · ');
  };
  const markdown = () => {
    const l = ordenadas();
    if (!l.length) return '';
    const cab = `Comentarios sobre «${norm(document.title) || 'este documento'}» (${l.length}):`;
    return cab + '\n' + l.map(n => `- ${etiqueta(n)}${n.extracto ? ` · "${n.extracto}"` : ''}: ${n.nota.replace(/\s*\n\s*/g, ' / ')}`).join('\n') + '\n';
  };
  const nombreArchivo = () => ((location.pathname.split('/').pop() || 'documento').replace(/\.[a-z0-9]+$/i, '') || 'documento') + '.comentarios.md';

  // ---------- interfaz ----------
  let activo = false, listaAbierta = false, edSt = null, conPanel = false, construida = false;
  let capa, hover, barra, lista, ed, edTA, edQ, edBorrar, aviso, lanz, ul, cuentaB, cuentaL, entrada, entradaLista, avisoT = 0;

  const decir = txt => {
    if (!aviso) return;
    aviso.textContent = txt; aviso.classList.add('cm-v');
    clearTimeout(avisoT); avisoT = setTimeout(() => aviso.classList.remove('cm-v'), 2200);
  };
  const cuenta = () => S.notas.length;

  const ubicar = () => {
    if (!construida || !raiz.classList.contains('cm-ver')) return;
    const sx = scrollX, sy = scrollY, ancho = raiz.scrollWidth;
    ordenadas().forEach((n, k) => {
      const pin = n._pin; if (!pin) return;
      const el = resolver(n);
      if (!el || !visible(el)) { pin.hidden = true; return; }
      const r = el.getBoundingClientRect();
      pin.hidden = false;
      pin.style.left = clamp(r.left + sx + (n.fx ?? .5) * r.width, 14, Math.max(14, ancho - 14)) + 'px';
      pin.style.top = Math.max(14, r.top + sy + (n.fy ?? .5) * r.height) + 'px';
    });
  };
  let raf = 0;
  const programar = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; ubicar(); }); };

  const actualizarVista = () => {
    const ver = activo || listaAbierta;
    raiz.classList.toggle('cm-on', activo);
    raiz.classList.toggle('cm-lis', listaAbierta);
    raiz.classList.toggle('cm-ver', ver);
    entrada?.setAttribute('aria-checked', String(activo));
    const c = cuenta();
    if (cuentaB) cuentaB.textContent = c ? `Lista (${c})` : 'Lista';
    if (cuentaL) cuentaL.textContent = c ? `Notas · ${c}` : '';
    if (cuentaL) cuentaL.hidden = !c;
    const sm = entrada?.querySelector('small'); if (sm) sm.textContent = activo ? 'Prendido: un clic en cualquier cosa deja una nota' : 'Un clic en cualquier cosa deja una nota';
    const sm2 = entradaLista?.querySelector('small'); if (sm2) sm2.textContent = c ? `${c} ${c === 1 ? 'nota' : 'notas'}` : 'Aún no hay';
    if (ver) programar();
  };

  const render = () => {
    if (!construida) return;
    capa.querySelectorAll('.cm-pin').forEach(p => p.remove());
    const l = ordenadas();
    l.forEach((n, k) => {
      n._pin = h('button', { class: 'cm-pin', type: 'button', text: String(k + 1), title: n.nota, 'aria-label': `Nota ${k + 1}: ${n.nota}`, onclick: ev => { ev.stopPropagation(); editar(n); } });
      capa.append(n._pin);
    });
    ul.replaceChildren(...(l.length ? l.map((n, k) => {
      const huerfana = !resolver(n);
      return h('li', { class: huerfana ? 'cm-huerfana' : '' },
        h('b', { text: String(k + 1) }),
        h('div', {},
          h('div', { class: 'cm-lu', text: etiqueta(n) + (huerfana ? ' · ya no está' : '') }),
          n.extracto ? h('div', { class: 'cm-lq', text: `"${n.extracto}"` }) : null,
          h('div', { class: 'cm-ln', text: n.nota }),
          h('div', { class: 'cm-la' },
            h('button', { class: 'cm-btn cm-t', type: 'button', text: 'Ir', onclick: () => ir(n) }),
            h('button', { class: 'cm-btn cm-t', type: 'button', text: 'Editar', onclick: () => editar(n) }),
            h('button', { class: 'cm-btn cm-t', type: 'button', text: 'Borrar', onclick: () => borrar(n) }))));
    }) : [h('li', { class: 'cm-vacio', text: 'Aún no hay comentarios. Prende el modo comentar (tecla C) y haz clic en lo que quieras señalar.' })]));
    actualizarVista();
  };

  const ir = n => {
    const D = window.__deck, el = resolver(n);
    if (D?.show && n.unidad?.tipo === 'Lámina') D.show(n.unidad.n - 1, n.paso || 0);
    if (!el) { decir('Ese elemento ya no está en el documento'); return; }
    el.closest('details')?.setAttribute('open', '');
    if (!D) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (window.innerWidth < 700) cerrarLista();
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      Object.assign(hover.style, { left: r.left + scrollX + 'px', top: r.top + scrollY + 'px', width: r.width + 'px', height: r.height + 'px' });
      hover.classList.remove('cm-flash'); void hover.offsetWidth; hover.classList.add('cm-flash');
      programar();
    }, D ? 520 : 450);
  };

  const borrar = n => { S.notas = S.notas.filter(x => x !== n); guardar(); if (edSt?.nota === n) cerrarEditor(false); render(); };

  const posicionarEd = (x, y) => {
    const w = Math.min(340, innerWidth - 24);
    ed.style.left = clamp(x + 14, 12, innerWidth - w - 12) + 'px';
    ed.style.top = clamp(y + 14, 12, Math.max(12, innerHeight - 250)) + 'px';
  };
  const abrirEditor = st => {
    cerrarEditor(true);
    edSt = st;
    edQ.textContent = st.nota ? (st.nota.extracto ? `"${st.nota.extracto}"` : etiqueta(st.nota)) : (extractoDe(st.el) ? `"${extractoDe(st.el)}"` : 'Esta parte del documento');
    edTA.value = st.nota?.nota || '';
    edBorrar.hidden = !st.nota;
    ed.classList.add('cm-v');
    posicionarEd(st.x, st.y);
    document.querySelectorAll('.cm-pin.cm-sel').forEach(p => p.classList.remove('cm-sel'));
    st.nota?._pin?.classList.add('cm-sel');
    setTimeout(() => edTA.focus(), 0);
  };
  const cerrarEditor = guardarTexto => {
    if (!edSt) return;
    const st = edSt, txt = edTA.value.trim();
    edSt = null; ed.classList.remove('cm-v');
    document.querySelectorAll('.cm-pin.cm-sel').forEach(p => p.classList.remove('cm-sel'));
    if (!guardarTexto) return;
    if (st.nota) { if (!txt) S.notas = S.notas.filter(x => x !== st.nota); else if (txt !== st.nota.nota) st.nota.nota = txt; else return; }
    else if (txt) {
      const r = st.el.getBoundingClientRect(), u = unidadDe(st.el);
      S.notas.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(), unidad: u, paso: pasoDe(st.el),
        sel: selectorDe(st.el), extracto: extractoDe(st.el),
        fx: r.width ? +clamp((st.x - r.left) / r.width, 0, 1).toFixed(3) : .5, fy: r.height ? +clamp((st.y - r.top) / r.height, 0, 1).toFixed(3) : .5,
        nota: txt, _el: st.el,
      });
    } else return;
    guardar(); render();
  };
  const editar = n => {
    const p = n._pin?.getBoundingClientRect();
    abrirEditor({ nota: n, x: p && !n._pin.hidden ? p.left : innerWidth - 400, y: p && !n._pin.hidden ? p.top : 120 });
  };

  const copiar = async () => {
    const md = markdown();
    if (!md) { decir('Aún no hay comentarios'); return false; }
    let ok = false;
    try { await navigator.clipboard.writeText(md); ok = true; } catch (e) { /* cae al plan B */ }
    if (!ok) {
      const t = h('textarea', { style: 'position:fixed;left:-9999px;top:0', 'aria-hidden': 'true' }); t.value = md; barra.append(t); t.select();
      try { ok = document.execCommand('copy'); } catch (e) { /* nada */ }
      t.remove();
    }
    decir(ok ? `Copiados ${cuenta()} ${cuenta() === 1 ? 'comentario' : 'comentarios'}. Pégalos en el chat` : 'No pude copiar: usa "Bajar .comentarios.md"');
    return ok;
  };
  const bajar = () => {
    const md = markdown();
    if (!md) { decir('Aún no hay comentarios'); return; }
    const a = h('a', { href: URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' })), download: nombreArchivo() });
    barra.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    decir(`Bajando ${nombreArchivo()}`);
  };
  let confirmarBorrado = 0;
  const borrarTodo = ev => {
    if (!cuenta()) return;
    const b = ev.currentTarget;
    if (!confirmarBorrado) { b.textContent = '¿Seguro? Otro clic'; confirmarBorrado = setTimeout(() => { confirmarBorrado = 0; b.textContent = 'Borrar todo'; }, 3000); return; }
    clearTimeout(confirmarBorrado); confirmarBorrado = 0; b.textContent = 'Borrar todo';
    S.notas = []; guardar(); render(); decir('Comentarios borrados');
  };

  const activar = v => {
    v = !!v; if (v === activo) return;
    activo = v;
    if (!v) { cerrarEditor(true); hover.classList.remove('cm-v'); }
    else if (!construida) construir();
    actualizarVista();
    if (v) decir('Modo comentar: haz clic en lo que quieras comentar');
    document.dispatchEvent(new CustomEvent('comentar:modo', { detail: { activo } }));
  };
  const abrirLista = v => { listaAbierta = v !== false; if (!listaAbierta) cerrarEditor(true); actualizarVista(); if (listaAbierta) render(); };
  const cerrarLista = () => abrirLista(false);

  const construir = () => {
    if (construida || !document.body) return;
    const st = h('style', { id: 'cm-css' }); st.textContent = ESTILO; document.head.append(st);
    capa = h('div', { class: 'cm-capa cm-ui' });
    hover = h('div', { class: 'cm-hover' });
    aviso = h('div', { class: 'cm-aviso cm-ui', role: 'status', 'aria-live': 'polite' });
    cuentaB = h('button', { class: 'cm-btn', type: 'button', text: 'Lista', onclick: () => abrirLista(!listaAbierta) });
    barra = h('div', { class: 'cm-barra cm-ui' }, h('i'), h('b', { text: 'Modo comentar' }), h('span', { text: 'Haz clic en lo que quieras comentar' }), cuentaB,
      h('button', { class: 'cm-btn', type: 'button', onclick: () => activar(false) }, 'Salir ', h('b', { text: 'C' })));
    cuentaL = h('button', { class: 'cm-btn', type: 'button', hidden: true, onclick: () => abrirLista(true) });
    lanz = h('div', { class: 'cm-lanz cm-ui' },
      h('button', { class: 'cm-btn', type: 'button', 'aria-label': 'Comentar (tecla C)', onclick: () => activar(true) }, svgIcono(ICONO), 'Comentar'), cuentaL);
    ul = h('ol');
    lista = h('aside', { class: 'cm-lista cm-ui', 'aria-label': 'Comentarios' },
      h('header', {}, h('h2', { text: 'Comentarios' }), h('button', { class: 'cm-btn cm-t', type: 'button', text: 'Cerrar', onclick: cerrarLista })),
      ul,
      h('footer', {},
        h('button', { class: 'cm-btn cm-p', type: 'button', text: 'Copiar comentarios', onclick: copiar }),
        h('button', { class: 'cm-btn', type: 'button', text: 'Bajar .comentarios.md', onclick: bajar }),
        h('button', { class: 'cm-btn cm-t', type: 'button', text: 'Borrar todo', onclick: borrarTodo })));
    edQ = h('p', { class: 'cm-q' });
    edTA = h('textarea', { rows: 3, placeholder: 'Escribe tu comentario…', 'aria-label': 'Comentario' });
    edBorrar = h('button', { class: 'cm-btn cm-t', type: 'button', text: 'Borrar', hidden: true, onclick: () => edSt?.nota && borrar(edSt.nota) });
    ed = h('div', { class: 'cm-ed cm-ui', role: 'dialog', 'aria-label': 'Nueva nota' }, edQ, edTA,
      h('div', { class: 'cm-fila' },
        h('button', { class: 'cm-btn cm-p', type: 'button', text: 'Guardar', onclick: () => cerrarEditor(true) }),
        h('button', { class: 'cm-btn', type: 'button', text: 'Cancelar', onclick: () => cerrarEditor(false) }),
        h('span', { class: 'cm-sp' }), edBorrar),
      h('small', { text: 'Ctrl o Cmd + Enter guarda · Esc cancela' }));
    // Lo que ocurre dentro de nuestra interfaz no sube a la página (ni cambia la lámina, ni dispara atajos)
    [lista, ed, barra, lanz, capa, aviso].forEach(n => ['click', 'keydown', 'keyup', 'touchstart', 'touchend', 'pointerdown'].forEach(t => n.addEventListener(t, ev => ev.stopPropagation())));
    edTA.addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); cerrarEditor(true); } });
    document.body.append(capa, hover, aviso, ed, lista, barra);
    if (!conPanel && !window.__deck) document.body.append(lanz);
    construida = true;
    render();
    // Mantener los pines pegados a su elemento
    addEventListener('resize', programar);
    addEventListener('scroll', programar, { passive: true, capture: true });
    addEventListener('load', programar);
    document.addEventListener('transitionend', programar, true);
    document.addEventListener('animationend', programar, true);
    document.fonts?.ready.then(programar);
    new MutationObserver(ms => { if (raiz.classList.contains('cm-ver') && ms.some(m => !m.target.closest?.('.cm-ui,.cm-hover'))) programar(); })
      .observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'open', 'hidden'] });
    setInterval(() => { if (!document.hidden) ubicar(); }, 900);
  };

  // ---------- entradas del lector ----------
  let seguir = 0;
  addEventListener('mousemove', e => {
    if (!activo || seguir) return;
    seguir = requestAnimationFrame(() => {
      seguir = 0;
      const t = e.target;
      if (!(t instanceof Element) || ignorado(t) || t === document.body || t === raiz) { hover.classList.remove('cm-v'); return; }
      const el = t.closest('svg') || t, r = el.getBoundingClientRect();
      Object.assign(hover.style, { left: r.left + scrollX + 'px', top: r.top + scrollY + 'px', width: r.width + 'px', height: r.height + 'px' });
      hover.classList.remove('cm-flash'); hover.classList.add('cm-v');
    });
  }, { passive: true });

  // El clic se toma en captura: así la lámina no cambia ni se sigue un enlace. Si otra herramienta
  // (por ejemplo, un overlay de notas) ya lo usó (defaultPrevented) o es interfaz ajena, no se toca.
  addEventListener('click', e => {
    if (!activo || e.defaultPrevented || e.button) return;
    const t = e.target;
    if (!(t instanceof Element) || ignorado(t)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    abrirEditor({ nota: null, el: t.closest('svg') || t, x: e.clientX, y: e.clientY });
  }, true);

  const api = window.__comentar = {
    get activo() { return activo; },
    get tecla() { return tecla; }, set tecla(v) { tecla = String(v).toLowerCase(); },
    abrir() { activar(true); }, cerrar() { activar(false); }, alternar() { activar(!activo); },
    lista: abrirLista, notas: () => ordenadas().map(n => ({ ...n, _el: undefined, _pin: undefined })),
    markdown, copiar, bajar, ignorar(sel) { ignorarSel += ',' + sel; }, clave: CLAVE,
    // Agrega las entradas al panel de opciones de la plantilla, con las clases de sus propios botones
    montarEn(panel, opts = {}) {
      if (!panel) return;
      conPanel = true; lanz?.remove();
      const modelo = panel.querySelector('button[role=switch]');
      const clase = opts.clase || modelo?.className || 'cm-op';
      const claseSw = opts.claseSwitch || modelo?.querySelector('i')?.className || '';
      const titulo = panel.querySelector('h3') ? h(panel.querySelector('h3').localName, { text: 'Comentarios' }) : null;
      entrada = h('button', { class: clase + ' cm-entrada', type: 'button', role: 'switch', 'aria-checked': String(activo) },
        h('span', {}, 'Comentar', h('kbd', { text: 'C' }), h('small')), claseSw ? h('i', { class: claseSw }) : null);
      entrada.addEventListener('click', () => { const a = !activo; activar(a); if (a) opts.cerrar?.(); });
      entradaLista = h('button', { class: clase + ' cm-entrada-lista', type: 'button' }, h('span', {}, 'Ver comentarios', h('small')));
      entradaLista.addEventListener('click', () => { abrirLista(true); opts.cerrar?.(); });
      const nodos = [titulo, entrada, entradaLista].filter(Boolean);
      opts.antes ? opts.antes.before(...nodos) : panel.append(...nodos);
      actualizarVista();
    },
  };
  let tecla = 'c';

  addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (edSt) { e.preventDefault(); e.stopImmediatePropagation(); cerrarEditor(false); }
      else if (activo) { e.preventDefault(); e.stopImmediatePropagation(); activar(false); }
      else if (listaAbierta) { e.preventDefault(); e.stopImmediatePropagation(); cerrarLista(); }
      return;
    }
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || escribiendo(e)) return;
    if (e.key.toLowerCase() === tecla) { e.preventDefault(); e.stopImmediatePropagation(); activar(!activo); }
  }, true);

  addEventListener('storage', e => { if (e.key === CLAVE) { leer(); render(); } });

  leer();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', construir); else construir();
})();
