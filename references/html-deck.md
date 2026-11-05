# Presentación HTML (deck)

Plantilla: `assets/deck.html`. Lienzo de 1920×1080 que se escala a cualquier pantalla. Mismo estilo que el informe: blanco sobre negro, un acento que solo marca, tarjetas con borde fino y radio mínimo, figuras sin contenedor.

## Cómo partir

**Si es marca DP, parte de `assets/deck-dp.html` (`marca-dp.md`), no de `deck.html`.**

1. Copia `assets/deck.html` a la carpeta de trabajo con un nombre claro.
2. Cambia `<title>`, `--hue` y, si se proyecta en una sala con luz, `data-theme="light"` en `<html>`.
3. Borra las láminas de ejemplo y escribe las tuyas siguiendo el guion.

## Para quien mira (ya incluido)

| Acción | Cómo |
|---|---|
| Avanzar y retroceder | flechas, espacio, Enter, PageUp/PageDown, Inicio, Fin; clic a la derecha o a la izquierda; deslizar en celular |
| Pantalla completa, tema | `F`, `T` |
| Comentar | `C` (modo comentar: `componentes.md`) |
| Panel de opciones | `O`, o la rueda de arriba a la derecha (aparece al acercar el mouse; en celular está siempre) |
| Narrador, sus controles, sus resaltados | `N` (apagado por defecto), `M`, `R` |
| Barra de la presentación | `B` |

- La URL guarda la lámina (`#5`); `?estatico` muestra todo sin animación (capturas y PDF); `?mudo` abre sin voz. Al imprimir: una lámina por página.
- **Barra de la presentación:** una línea fina bajo las láminas, con un tramo por lámina; cada paso suma 30 % al tramo. Al pasar el mouse se ensancha y muestra la miniatura; con clic se va a esa lámina. No la saques.
- El panel también trae el color del acento (9 tonos). Lo que se cambia se recuerda en el navegador.
- **Código propio:** escucha los clics en fase normal, nunca en captura.

## Marco de cada lámina (se arma solo)

- `<div class="stage" data-title="Tienda Raíz · T3 2026">`: título corto que va arriba a la derecha en cada lámina.
- `data-sec="Sección"` en cada lámina: arriba a la izquierda, con un cuadrito de acento, sobre una línea fina.
- `data-src="Fuente: …"`: la fuente abajo a la izquierda, solo si aporta. La fuente de rutina va en notas.

## Tipos de lámina

| Clase | Para qué |
|---|---|
| `.portada` | título descriptivo y foto. Las cifras (`.side`) son opcionales: solo si son reales y conocidas |
| `.lado` | título y bajada a la izquierda, evidencia a la derecha (gráfico, barras, simulador, antes/después) |
| `.std` | encabezado (`.head`: título + bajada) y evidencia a lo ancho (`.sbody`): cifras, gráfico apaisado, fila de tarjetas |
| `.dato` | una cifra enorme (`.bignum`) con su frase, y su visual al lado (pictograma, barras) |
| `.seccion` | separador de capítulo con número en contorno; en presentaciones de 10 láminas o más |
| `.partida` | dos mitades (imagen + texto). **Solo de vez en cuando**: una imagen fuerte o una decisión |
| `.cierre` | lo que se pide, en grande, con una tarjeta invertida (`.ask.inv`) |

Arma el deck alternando: portada → resumen (`.lado`) → cifras (`.std`) → capítulos con `.dato`, gráficos y evidencia → decisión (tarjetas + antes/después) → plan → cierre.

## Índice lateral

Oculto por defecto (la barra fina de progreso cumple esa función). Solo aparece con `data-rail="on"` en `.stage`. Vive en el margen izquierdo, una raya y un número por sección, y no le quita ancho al contenido. No aparece en la portada, los separadores, las láminas partidas ni el cierre.

## Piezas (las mismas del informe, a tamaño de lámina)

`.cards.c2/.c3/.c4` y `.card` (cifras con `.kpi`, opciones con `.ol` y `.oc`, pasos con `.d` y un ícono), `.inv` para lo recomendado, `.tag`, `figure.fg` con `.fl` y `.cap`, `.chart`, `.bars`, `.waffle`, `.ba` (antes/después), `ul.ilist` con íconos `svg.ic` (`#i-reloj`, `#i-ruta`, `#i-personas`, `#i-check`, `#i-dinero`, `#i-sube`, `#i-alerta`, `#i-dato`), `.sim` con `SIMULADORES`, `ul.pts`, `.act`, imagen con `img.img` dentro de `.partida .half.media`.

Catálogo completo, con las variantes de tarjeta: `componentes.md`. Regla de visuales: `visuales.md`.

## Simulador gráfico

Un simulador se ve, no solo se lee: botones de opción (`.pick`, con ícono), las piezas que entran en cada opción (`.piezas` con `data-en="1 2 3"`: visible solo en esas opciones; aparecen con un salto) y medidores que crecen (`.medidor` con `.pista` e `<i data-ancho="clave">`, cuyo ancho es el valor 0 a 1 que devuelve el simulador; `.medidor.key` va en acento; `<s style="--m:.24">` marca una referencia). Las cifras van en la columna derecha del medidor, nunca encima de otra. 

```js
plan(v) { return { costo: '3.500', venta: '×6,0', costoV: 3500 / 20500, ventaV: 6 / 25.5 }; }
```

## Clases propias

Si una presentación necesita clases nuevas, no reutilices nombres de la plantilla (`.ic`, `.k`, `.v`, `.l`, `.d`, `.t`, `.on`, `.key`, `.inv`, `.an`…): una clase repetida hereda tamaños y bordes que no esperas (por ejemplo, `.ic` es el ícono de 64 px con borde).

## Componentes animados

| Componente | Marcado | Qué hace al entrar |
|---|---|---|
| Flujo de un proceso | `.flow` con `.node` (ícono, `b`, `span`, `.t`); `.hot` marca el cuello de botella | los nodos entran en orden, las uniones avanzan, el cuello pulsa |
| Línea de tiempo | `<div class="tline" style="--n:3"><span></span>…</div>` sobre una fila de tarjetas | la línea se llena y los hitos aparecen uno a uno |
| Anillo | `svg.donut` con `circle.t` y `circle.v[pathLength=100][style="--p:41"]` | se llena hasta el porcentaje |
| Gráfico de líneas | `path.ln-key` | se dibuja de izquierda a derecha; después aparecen etiquetas y notas |
| Barras | `.bars` | crecen una tras otra |
| Pictograma | `.waffle` | los cuadros aparecen uno a uno |
| Cifras | `.bignum .hl`, `.kpi .v`, `.ba .v`, `.card .oc`, `.flow .t`, o cualquier `.count` | cuentan desde cero |
| Imagen | `img.img` dentro de `.half.media` | se acerca despacio |
| Todo lo demás | títulos, bajadas, tarjetas, listas | suben en cascada |

## Pasos y piezas que viajan

- `data-step="1"`, `"2"`… revela por pasos antes de pasar de lámina. **Si el deck se va a exponer, va por defecto** en toda lista, secuencia de tarjetas o diagrama; se omite solo en láminas de una sola idea.
- `data-k="nombre"`: si dos láminas seguidas tienen un elemento con la misma clave, viaja de su lugar anterior al nuevo.

## Ritmo y tamaño

- Una idea por lámina; máximo ~40 palabras visibles.
- Alterna láminas densas con láminas de una sola cifra o imagen.
- Texto: tamaños y umbral en `diseno.md` ("Tipografía").
- **Encuadre:** el contenido llena la lámina. Si queda una franja vacía, agranda la evidencia o súmale una imagen.
- El contenido no debe verse gigante: las medidas de la plantilla ya están calibradas.

## Qué no va en la lámina

Va a `<aside class="notas">`, no a la lámina:

- lo pendiente y lo que dirá el presentador de palabra;
- nombres, fechas de ingreso, links, accesos y logística;
- fuentes de rutina y numeración interna.

Nada de textos de trabajo: "Pendiente foto", "Puntos X a Y de 48", una barra "Cierre". Tampoco obviedades para este público.

**Variedad de layouts:** máximo 2 o 3 láminas por variante de tarjeta, y nunca más de dos seguidas iguales. Las tarjetas con imagen funcionan. Variantes: `componentes.md`.

**Lo que se repite** (logo, marca) va en la capa fija, para que no se anime al cambiar de lámina.

**Portada, capturas, organigramas, flujos, fórmulas:** reglas en `visuales.md`.

## Hoja del expositor

Si el deck se expone, entrega además una hoja breve, **fuera del deck**: las **5 preguntas probables** con su respuesta en una o dos líneas, rangos si preguntan por costos, y qué se dice de palabra en cada parte.

## Narración (presentaciones guiadas)

Una voz presenta el deck sola: avanza, revela los pasos y destaca cada pieza justo cuando la nombra, con subtítulos. Cuándo usarla: `SKILL.md` ("Formato").

**Como ensayo del presentador:** en un deck que se va a exponer, la voz muestra cómo se pensó la presentación. Apagada por defecto, para que no estorbe a lo que se muestra. **Genera la voz al final,** cuando el contenido esté estable.

**Voz:** Catalina (Chile), por defecto. Jorge (México) solo si la piden (`--voz jorge`). Es la voz neuronal de Microsoft Edge: gratis, sin cuenta; necesita internet al generar, no al ver.

### 1. Escribe el guion de cada lámina

Dentro de cada `<section class="slide">`, un `<aside class="voz">` (no se ve en la lámina):

```html
<aside class="voz">
¿Por qué el canal online? Mira estas barras.
[foco .bars>div:nth-child(1)] La tienda sola multiplica por 2,6.
[foco .bars>div:nth-child(2)] Con el canal online llegas a seis veces. Ese es el punto dulce.
</aside>
```

| Marca | Qué hace en ese momento de la frase |
|---|---|
| `[paso N]` | revela el paso N (`data-step`); también avanza la línea de tiempo (`.tline`) |
| `[foco SEL]` | destaca SEL (selector dentro de la lámina) y atenúa sus vecinas; las cifras de SEL vuelven a contar |
| `[foco A \| B]` | destaca varias piezas juntas. Si dos `[foco]` caen a menos de ~1 s, se juntan solos |
| `[foco:modo SEL]` | fuerza el modo de resaltado (abajo) |
| `[foco -]` | quita el resaltado |
| `[clic SEL]` | hace clic (por ejemplo, en un botón del simulador) y lo destaca |
| `{visto\|dicho}` | muestra «visto» en los subtítulos y dice «dicho» (`{USD 5,99\|cinco dólares con noventa y nueve}`) |

**Modos de resaltado** (la plantilla elige sola; fuerza uno solo si el automático no sirve):

| Modo | Cómo se ve | Lo elige solo para |
|---|---|---|
| `marco` | un marco de acento que viaja de una pieza a otra | tarjetas, filas, nodos, botones |
| `zoom` | la pieza crece un poco y brilla, sin marco | piezas que ya tienen borde o fondo propio (`.hot`, `.inv`, `.key`) y cifras grandes |
| `luz` | solo atenúa lo demás | bloques muy anchos |
| `subraya` | una línea de acento bajo el texto | títulos, bajadas y frases |

Cómo escribir para el oído:

- Frases cortas, como se habla. Una idea por frase. Di qué mirar ("mira estas barras", "la de arriba").
- 15 a 30 segundos por lámina (~40 a 80 palabras). La voz no lee la lámina: la explica.
- Una marca por cosa que nombras, justo antes de nombrarla. Lo que nombras junto, destácalo junto (`|`).
- Cifras como se dicen: "tres mil quinientos" sale bien escrito "3.500"; los decimales con coma ("2,6"). Monedas y siglas raras, con `{visto|dicho}`.
- Cierra con lo que quien escucha debe hacer o decidir.
- Un arreglo en la lámina se aplica también aquí.

### 2. Glosario de pronunciación

Términos en inglés, nombres o siglas que la voz dice mal: en el `<head>`, un JSON que solo cambia el audio.

```html
<script type="application/json" id="pronunciacion">{ "Dashboard": "Dáshbord", "Machine learning": "Mashín Lérning" }</script>
```

Truco: escribe como suena en español, con tildes donde va el acento. Si dudas, genera la lámina y escúchala.

### 3. Genera la voz y empaqueta

```
python3 scripts/narrar.py deck.html deck.narrado.html          # Catalina
python3 scripts/narrar.py deck.html deck.narrado.html --voz jorge
python3 scripts/empaquetar.py deck.narrado.html final.html --remoto
```

El orden es el de `SKILL.md`: escribir → narrar → empaquetar → revisar el final.

`narrar.py` crea su entorno la primera vez (`~/.local/share/informes-narracion`, solo `edge-tts`), guarda los audios en caché (si el guion de una lámina no cambia, no la vuelve a generar) e incrusta la voz, los tiempos de cada marca y los subtítulos en el HTML (~250 KB por minuto).

### Una sola voz (no se superponen narradores)

La plantilla garantiza que suene **un solo narrador**, aunque haya varias copias abiertas: pestañas, ventanas, la versión vieja y la nueva tras actualizar. Las copias se avisan entre sí (BroadcastChannel y `localStorage`); habla la que tiene el foco y, si no, una sola elegida por id; las demás siguen sincronizadas, en silencio. Una pestaña oculta se pausa. `?mudo` abre el deck sin voz.

**Al probar un deck narrado (agentes):** ábrelo siempre con `?mudo` (`archivo.html?mudo#3`), nunca dejes el narrador encendido y apágalo (`N`) antes de terminar. Una voz sonando en una pestaña que nadie ve no se puede parar. Al actualizar un deck abierto, no enciendas el narrador para comprobarlo: revisa los pasos con `window.__deck` y el estado con `window.__voz`.

### Cómo se ve

El deck abre como una presentación normal, con su barra fina. El narrador **parte apagado**: al encenderlo, la voz presenta desde la lámina actual, con subtítulos y la barra tipo video; espacio o clic pausan y las flechas cambian de lámina. Con la voz silenciada avanza igual. Al apagarlo vuelve la presentación a mano; con "Resaltados del narrador" encendido, las flechas recorren lo que destaca.
