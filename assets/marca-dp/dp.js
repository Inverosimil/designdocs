/* Carta Gantt: meses, semanas y cada pieza ubicada por su fecha (data-a, data-b). */
(() => {
  document.querySelectorAll('.gantt').forEach(g => {
    if (!g.querySelector('.g-semanas')) return;   // el Gantt genérico de la plantilla tiene su propio script
    const dia = f => new Date(f + 'T12:00:00Z').getTime();
    const ini = dia(g.dataset.ini), fin = dia(g.dataset.fin);
    const pct = f => ((dia(f) - ini) / (fin - ini)) * 100;
    const iso = t => new Date(t).toISOString().slice(0, 10);
    const sem = g.querySelector('.g-semanas'), reja = g.querySelector('.g-reja');
    for (let t = ini; t < fin; t += 7 * 864e5) {
      const s = document.createElement('span');
      s.textContent = iso(t).slice(8, 10);
      s.style.left = pct(iso(t + 3.5 * 864e5)) + '%';
      sem.appendChild(s);
      const i = document.createElement('i'); i.style.left = pct(iso(t)) + '%'; reja.appendChild(i);
    }
    g.querySelectorAll('.g-meses [data-a], .g-pista [data-a]').forEach((el, i) => {
      el.style.left = pct(el.dataset.a) + '%';
      if (el.dataset.b) el.style.width = (pct(el.dataset.b) - pct(el.dataset.a)) + '%';
      el.style.setProperty('--d', i % 9);
    });
    const pos = `calc(330px + (100% - 330px) * ${pct(g.dataset.hoy) / 100})`;
    const h = g.querySelector('.g-hoy'), fu = g.querySelector('.g-futuro');
    if (h) h.style.left = pos;
    if (fu) fu.style.left = pos;
  });
})();
