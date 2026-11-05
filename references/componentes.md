# Componentes

Catálogo de lo que traen las plantillas. Los ejemplos vivos están en `assets/deck.html` (láminas `cronograma` y `piezas`, y el comentario "CÓMO SE USA") y en `assets/informe.html`. Copia el fragmento a tu documento; no edites la plantilla original. Colores y tamaños salen de las variables (`--accent`, `--fg`, `--bg`, `--line`, `--soft`, `--r`): cámbialas en un lugar y todo sigue.

## Marco del deck (atributos de `.stage` y de cada lámina)

| Atributo | Dónde | Qué hace |
|---|---|---|
| `data-title="Texto"` | `.stage` | título corto del marco de arriba |
| `data-sec="Sección"` | `.slide` | arma el marco y el índice lateral. Portada y cierre no llevan barra superior |
| `data-id="nombre"` | `.slide` | enlace estable: `archivo.html#nombre` (o `#3`) abre esa lámina y sigue vivo si cambia el orden |
| `data-src="Fuente: …"` | `.slide` | fuente abajo a la izquierda, solo en las láminas que la traen |
| `data-numeros` | `.stage` | muestra "03 / 12" (por defecto el marco es sobrio y no lo muestra; la portada nunca lo lleva) |
| `data-logo="logo.svg"` | `.stage` | un solo logo fijo, fuera de las láminas, sin animación |
| `data-logo-oscuro`, `data-logo-pos`, `data-logo-alto` | `.stage` | versión para fondo oscuro (si falta, se invierte a blanco), posición (`inf-der` por defecto, `inf-izq`, `sup-der`, `sup-izq`) y alto en px (44) |
| `data-sin-logo` | `.slide` | esa lámina no muestra el logo (portada que ya trae el suyo) |
| `data-step="1"`, `"2"`… | cualquier pieza | revela por pasos con la flecha o el espacio |
| `data-k="clave"` | pieza en dos láminas | la pieza viaja de una lámina a la siguiente |
| `<aside class="notas">` | `.slide` | notas del orador, no se ven en la lámina |
| `<aside class="voz">` | `.slide` | guion del narrador (`html-deck.md`, "Narración") |

El logo se elige solo (versión clara u oscura) por la luminancia del fondo de la lámina y sigue al tema; en el PDF se repite en cada página. Parámetros de URL: `?estatico` deja todos los pasos visibles y sin animación (capturas y PDF), `?mudo` apaga la voz, y se combinan con `#id`: `deck.html?estatico#cronograma`.

Texto mínimo en el lienzo: 22 px; el revisor avisa de lo menor.

## Gantt (`.gantt`)

Cuándo: cronogramas, fases, hitos. Una fila por actividad.

```html
<div class="gantt" data-ini="2026-11-02" data-fin="2027-01-04" data-hoy="2026-11-16">
  <div class="gt-fila"><span class="gt-nom">Contratar</span>
    <div class="gt-pista"><i data-a="2026-11-03" data-b="2026-11-09"></i></div></div>
  <div class="gt-fila"><span class="gt-nom">Medir</span>
    <div class="gt-pista"><i data-a="2026-11-10" data-b="2026-12-08"></i><u data-a="2026-12-08"></u></div></div>
  <div class="gt-fila"><span class="gt-nom">Atender</span><div class="gt-pista"><i class="cont"></i></div></div>
</div>
```

- `<i data-a data-b>` barra; `<i class="cont">` actividad continua (sin fechas ocupa todo el período); `<i class="neutra">` barra gris; `<u data-a>` hito (rombo).
- `data-hoy` marca "Hoy"; lo posterior se dibuja rayado con la etiqueta "Tentativo" (cámbiala con `data-futuro="Propuesta"`). La parte de una barra posterior a hoy sale clara.
- Sin fechas (solo el Gantt genérico; el de la marca DP `g-*` no lo admite, ver `marca-dp.md`): `data-cols="Fase 1,Fase 2,Fase 3"` y números de columna en `data-a`, `data-b` y `data-hoy` (`data-a="2" data-b="3"`).
- Meses y semanas los dibuja el script. Con la marca DP se usa el Gantt de `marca-dp` (clases `g-*`); el genérico se salta si encuentra `.g-semanas`.

## Avatar y círculo

```html
<span class="avatar a" style="--d:72px">R1</span>                 <!-- iniciales; .a = color de acento -->
<span class="avatar"><img src="persona.jpg" alt=""></span>         <!-- o foto, o <svg class="ic"> -->
<div class="circulo a" style="--d:150px"><b>52</b><span>min hoy</span></div>
```

`--d` es el diámetro. Avatar: equipos y responsables (solo con datos reales). Círculo: una cifra con su unidad, o dos con una línea entre ellas.

## Árbol (`.arbol`)

Cuándo: jerarquías de equipo o de decisiones. Listas anidadas; los conectores los dibuja el CSS.

```html
<ul class="arbol"><li><div class="nodo inv"><b>Local</b><span>coordina</span></div>
  <ul><li><div class="nodo"><b>Norte</b><span>zona</span></div></li>
      <li><div class="nodo hot"><b>Sur</b><span>zona</span></div></li></ul></li></ul>
```

`.inv` marca el nodo principal; `.hot` lo resalta con el acento. Variables: `--h` alto del nodo, `--v` separación vertical.

## Variantes de tarjeta

Dentro de `<div class="cards c3">` (o `c2`, `c4`):

```html
<div class="card foto" style="--hf:150px"><div class="cf"><img src="foto.jpg" alt="…"></div><b>Título</b><p>Texto.</p></div>
<div class="card icono"><svg class="ic g a"><use href="#i-ruta"/></svg><b>Título</b><p>Texto.</p></div>
<div class="card numerada" data-n="03"><b>Título</b><p>Texto.</p></div>
<div class="cards libre">…</div>      <!-- sin caja, solo filete arriba -->
<div class="card inv">…</div>          <!-- invertida -->
```

`foto`: cuando hay imagen real (`--hf` es su alto). `icono`: sin foto. `numerada`: pasos en orden.

## Prioridad y pasos con casilla

```html
<span class="prio alta">Alta</span>     <!-- alta | media | baja -->
<ul class="pasos-check" data-clave="plan-t3">
  <li>Contratar <span class="prio alta">Alta</span></li>
  <li>Medir cuatro semanas</li>
</ul>
```

Deck: el script agrega las casillas y una barra de avance; lo marcado se recuerda en el navegador de quien lo ve (con `data-clave` distinta por lista). Informe: el mismo nombre, con detalle por paso:

```html
<ol class="pasos-check" data-id="listo">
  <li><label><input type="checkbox"><span class="pc-t"><b>Paso</b><small>detalle</small></span></label><span class="prio alta">Alta</span></li>
</ol>
```

## Línea animada (`.linea-flujo`)

Cuándo: flujo o dirección entre dos piezas. Horizontal: `<div class="linea-flujo" style="flex:1"></div>`; vertical: `class="linea-flujo v"`; en un SVG, `<path class="linea-flujo" d="…">`. Variables `--on`, `--off` (largo de raya y hueco) y `--g` (grosor). Con `?estatico` o movimiento reducido no se anima.

## Tipos de lámina documentados

`.demo` (una demostración: título, y una pantalla en `.dm-nb`) y `.despedida` (cierre simple): el fragmento está en el comentario "CÓMO SE USA" de `deck.html`.

## Video en lámina

```html
<video muted playsinline src="demo.mp4" data-avance-fin></video>
<video muted playsinline src="demo.mp4" data-tramo="12,30,52" data-caps="Uno|Dos|Tres"></video>
```

- `data-avance-fin`: al terminar, pasa solo a la lámina siguiente.
- `data-tramo="12,30,52"`: segundos donde termina cada tramo. Cada flecha reproduce un tramo y se queda en su último cuadro (cada tramo cuenta como un paso; no hace falta `data-step`). Con `data-avance-fin` los tramos corren solos. `data-caps` pone una leyenda por tramo.
- Con el narrador encendido no hay avance automático; con `?estatico` queda el último cuadro. Para grabar el video: `scripts.md`, `grabar.mjs`.

## Modo comentar (`assets/comentar.js`)

Quien lee deja notas ancladas a lo que ve, las copia en Markdown y te las pasa. Ya viene dentro de `deck.html` e `informe.html` (entre `>>> comentar.js` y `<<< comentar.js`); la copia suelta es `assets/comentar.js`: si cambias una, cambia la otra.

- Tecla `C` (o "Comentar" en el panel de opciones del deck, o el botón flotante en el informe). Un clic abre la nota; en el deck no cambia de lámina ni sigue enlaces; `Esc` sale. `Ctrl+Enter` guarda.
- Lista con Ir, Editar y Borrar; "Copiar comentarios" y "Bajar .comentarios.md". Formato de cada línea: `- Lámina 3 · Título · "extracto": nota` (en el informe, "Sección").
- Las notas se guardan en el navegador de quien comenta, no viajan con el archivo: tiene que copiarlas y enviártelas.
- No sale al imprimir ni con `?estatico`. API: `window.__comentar.abrir()`, `cerrar()`, `alternar()`, `montarEn(panel, {cerrar})`, `ignorar('.mi-ui')`.
- Para insertarlo en una plantilla propia: pega el contenido en un `<script>` antes del script de la guía y, en el deck, llama `window.__comentar?.montarEn(panel, …)` tras armar el panel.

## Decisiones punto por punto (informe)

Cuándo: el informe pide respuestas ("¿de acuerdo con A, B y C?").

```html
<div class="decision" data-id="decisiones">
  <article class="dec-item" data-id="d1">
    <header><h3>Sumar un segundo repartidor</h3><span class="prio alta">Alta</span></header>
    <p class="dec-prob"><b>El problema</b>…</p>
    <p class="dec-prop"><b>Propuesta</b>…</p>
  </article>
</div>
```

El script agrega a cada ítem los botones De acuerdo / No / No entendí y una línea de comentario, y una barra para copiar o bajar las respuestas en un archivo Markdown. Todo queda en el navegador de quien responde; pídele que copie y te pegue el resultado.
