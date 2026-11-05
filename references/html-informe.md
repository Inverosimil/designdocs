# Informe HTML

Plantilla: `assets/informe.html`. Columna lateral fija con título e índice (en celular se vuelve encabezado y el índice es un botón ≡), resumen y cifras arriba, secciones que se acomodan al contenido, tema claro/oscuro e impresión en A4.

## Cómo partir

1. Copia `assets/informe.html` a la carpeta de trabajo con un nombre claro (`informe-ventas-2026-10.html`).
2. Cambia `<title>`, el encabezado dentro de `<aside class="rail">` y `--hue`.
3. No borres la etiqueta de tiempo de lectura (`<span id="rt">`) si quieres que muestre los minutos; si la quitas, el script la ignora.
4. Borra las secciones de ejemplo y escribe las tuyas siguiendo el guion (paso 3 de `SKILL.md`).

## Estructura

```
aside.rail      hey (etiqueta) · h1 (la conclusión; .hl en 2–3 palabras) · bajada corta · meta · índice (se arma solo)
main
  .sum          idea principal · 3 apoyos · "Qué necesito"
  .kpis         4 tarjetas de cifras; la principal con .inv
  section.sec.lado | section.sec.ancho   × N   (cada una con .sh, .st, .sf)
  section#s-anexo                        glosario, método, supuestos (details.ax)
```

- El índice y los números de sección (`.sh .n` vacíos) se arman solos desde los `<h2>`.
- La columna lateral nunca tiene scroll: escribe un título de 6 a 12 palabras y una bajada de 1 o 2 líneas. Si igual no cabe, la plantilla esconde la bajada, después las etiquetas y después achica el índice.

## Lado o ancho

| La evidencia es… | Usa | Por qué |
|---|---|---|
| un gráfico de alto parecido al texto, un simulador, barras cortas | `.sec.lado` | texto y evidencia se equilibran |
| un gráfico de tiempo o apaisado | `.sec.ancho` | gana lectura a lo ancho |
| 3 opciones, 3 pasos, 3 cifras | `.sec.ancho` + `.cards.c3` | una fila de tarjetas |
| 4 preguntas, 4 fuentes, 2 comparaciones | `.sec.ancho` + `.cards.c2` | grilla de 2 |
| una imagen con su lista | `.sec.ancho` + `.img-row` | imagen grande y lista al lado |

Si al mirar la captura una columna queda medio vacía, cambia la forma de la sección.

## Componentes

| Uso | Marcado |
|---|---|
| Figura | `figure.fg > figcaption.fl (b "Fig. 01" + span qué muestra) + gráfico + p.cap (b la lectura + span.src la fuente)` |
| Gráfico de líneas | SVG con clases `grid`, `ln-key` (la serie clave, en acento), `ln-off`, `dot`, `lab-key`, `note` (anotación) |
| Barras | `.bars > div[style="--v:.82"]`, la clave con `.key` |
| Pictograma "N de cada 10" | `<div class="waffle" style="--n:8">` + `.waffle-l` |
| Antes y después | `.ba` con dos `div` y `.arrow` en medio; el "después" con `.inv` |
| Lista con íconos | `ul.ilist > li > svg.ic (use #i-…) + div (b + span)`; íconos disponibles al inicio del `<body>` |
| Imagen real | `figure.img > img + figcaption.cap` (siempre con pie y crédito); `.img-row` para imagen + lista |
| Explicar simple | `.box` con `<span class="t">En simple</span>` |
| Fórmula | `.fx` con `.formula`, `.frac` y `.legend-f`; regla en `visuales.md` ("Fórmulas") |
| Simulador | `.sim[data-sim="nombre"]` con botones `.pick` y salidas `[data-out]`; la función va en `SIMULADORES` |
| Tarjetas | `.cards.c3` / `.cards.c2` con `.card` (`.ol`, `b`, `p`, `.oc`, `.d`, `.top`); la recomendada con `.inv` y `.tag` |
| Origen de una cifra | `.chip` (dato), `.chip.est` (estimado), `.chip.sup` (supuesto) |
| Tabla (si de verdad hace falta) | `table.t` con `data-l` en cada `td` (en celular se vuelve ficha) |
| Anexo | `details.ax > summary + div` |

## Secciones que casi siempre van

- **Lo que te vas a preguntar:** tarjetas `.c2` con respuesta corta (`comunicar.md`, "Anticipar las preguntas").
- **De dónde sale cada número:** cada cifra importante con su chip (`comunicar.md`, "Honestidad").

## Hoja de plan

Para un plan de acción, sin rodeos: **una pantalla** con qué hacer ahora, pasos por momento o fecha, lo que hay que tener a mano, y el porqué en una línea por paso. Sin contexto largo ni anexo: si piden "más claro y resumido", es esto. Componentes: `componentes.md`.

## Informe de decisiones

Cuando el informe se usa para decidir punto por punto: cada ítem lleva **el problema en lenguaje simple, la propuesta y la decisión pedida**, numerado para que se pueda responder "3: de acuerdo". Una decisión por ítem. Sin jerga: si el lector tiene que preguntar qué significa, el ítem falló. Componentes: `componentes.md`.

## Largo y ritmo

- Párrafos de 2 a 4 frases. Una idea por párrafo.
- Cada sección: título-afirmación, 1 o 2 párrafos y al menos un componente gráfico.
- Fórmulas y cálculos largos van al anexo; en el cuerpo, el resultado y un ejemplo.

## Relato al bajar (Scrollama)

Para un informe que cuenta una historia en pasos: el gráfico queda fijo y cambia mientras se baja leyendo. Ejemplo y reglas en `references/librerias.md` y `assets/librerias.html`. Úsalo en una sección, no en todo el informe.
