# Scripts

Todos se corren **desde la carpeta de la skill** (donde está `SKILL.md`). Node 22 o más nuevo para los `.mjs`, Python 3 para los `.py`. Si algo falla por falta de una herramienta, corre primero `node scripts/doctor.mjs`.

| Script | Para qué | Comando exacto |
|---|---|---|
| `doctor.mjs` | Dice qué hay instalado, qué falta y el comando para arreglarlo | `node scripts/doctor.mjs` |
| `entregar.mjs` | Cierre de cada ronda: narrar (opcional), empaquetar, revisar y PDF | `node scripts/entregar.mjs fuente.html [final.html] [--narrar] [--voz catalina] [--pptx] [--sin-pdf] [--estricto]` |
| `capturas.mjs` | Capturas y revisión automática | `node scripts/capturas.mjs archivo.html[#N] carpeta-salida [--pdf] [--oscuro] [--estricto]` |
| `empaquetar.py` | Un solo HTML con todo incrustado | `python3 scripts/empaquetar.py entrada.html salida.html [--remoto] [--ancho 1600]` |
| `narrar.py` | Genera la voz de cada lámina y la incrusta | `python3 scripts/narrar.py deck.html salida.html [--voz catalina\|jorge] [--ritmo +0%]` |
| `exportar-pptx.mjs` | PPTX editable de un deck | `node scripts/exportar-pptx.mjs deck.html [salida.pptx] [--ancho 10] [--alto 5.625] [--sin-comprobar]` |
| `grabar.mjs` | Video MP4 de una página | `node scripts/grabar.mjs pagina.html pasos.json salida.mp4 [--ancho 1280] [--alto 720] [--fps 25] [--no-recortar]` |
| `video.py` | Mete un MP4 dentro del HTML | `python3 scripts/video.py informe.html [salida.html]` |
| `diagrama.py` | Diagrama D2 a SVG con los colores del documento | `python3 scripts/diagrama.py flujo.d2 flujo.svg [--a-mano]` · `python3 scripts/diagrama.py flujo.d2 --validar` |

`python3` puede ser `python` o `py -3` en Windows.

## doctor

Lista Node, Chrome/Edge/Brave, Python, ffmpeg, d2 y la conexión a internet, con "OK" o el comando que falta. Sin Chrome no hay capturas, PDF, PPTX ni video; sin Python, no hay voz ni empaquetado; ffmpeg solo se necesita para `grabar`; d2 solo para `diagrama`. Si define la variable `CHROME` con la ruta de un navegador, los scripts la usan.

## entregar

Orden: narrar (solo con `--narrar`), empaquetar con `--remoto`, capturas y PDF sobre el archivo **final**, y un resumen con rutas, pesos y el número de errores y avisos. Sin segundo argumento, el final se llama `<nombre>-final.html` (o `<nombre>.html` si la fuente termina en `-fuente`); nunca puede ser el mismo archivo que la fuente. `--pptx` suma el PPTX (**solo para decks**: en un informe se ignora con un aviso y el resto sigue); `--sin-pdf` lo omite; `--estricto` falla si hay errores. Falla si un paso falla. Las capturas quedan en `<final>-capturas/`.

## capturas

Con un deck: `lamina-NN.png` (todos los pasos visibles), `hoja-01.png` (hoja de contactos), capturas de celular (`movil-vertical.png`, `movil-horizontal.png`) y `revision.json`. Con un informe: `escritorio-NN.png` y `movil-NN.png` en tramos de 3000 px. `--oscuro` suma las del tema oscuro; `--pdf` guarda `<nombre>.pdf` con los estilos de impresión. `archivo.html#N` captura desde esa lámina.

**Siempre mira cada imagen:** el script no ve todo. Lo que sí revisa y reporta (en pantalla y en `revision.json`, `errores` y `avisos`):

- errores de consola y recursos que fallan; rutas locales absolutas; peso; recursos remotos; audio que suena al abrir;
- texto que se sale o queda cortado, texto chico (deck: menos de 22 px; informe: menos de 14), contraste bajo, solapes por paso, SVG sin `viewBox`, elementos mal centrados o filas desalineadas, desborde horizontal en celular;
- textos de trabajo (TODO, lorem ipsum, "(pendiente)"; "fechas por definir" o un "Por definir" suelto **no** cuentan: es lo que `comunicar.md` manda escribir), exceso de palabras por lámina (unas 40), láminas o secciones sin visual, imágenes de baja resolución, marcas del guion de voz sin resolver.

**Formato no reconocido:** si el HTML no es un deck de la skill (`.stage` con `__deck`) ni un informe (`<main>`), el script lo dice, marca error y sale con código 2: no revisó nada y un "sin errores" no vale.

**Avisos esperados:** los de las plantillas (`assets/*.html`) son de ejemplo; no los "limpies" borrando el ejemplo. `meta informe:carpeta` (ruta local) es esperado si llenaste ese metadato. En láminas `.dp`, el tope de palabras es ~70 (tarjetas), las texturas `.tex` que sangran no cuentan y los rótulos mono en mayúsculas pasan desde 16 px (deck) y 11 px (informe).

Lo que **no** revisa: si el mensaje se entiende, si las cifras son correctas, si el visual es el adecuado, la calidad de las fotos ni el sonido. Los avisos de "texto chico" y "sin visual" son avisos, no errores: corrígelos o justifícalos en la entrega. Si Chrome no está, el script termina con código 2: di "no revisado".

## empaquetar

Incrusta imágenes, CSS, JS y `url(...)` de los CSS como data URI. `--remoto` también baja e incrusta lo que viene de internet (fuentes, CDN) para que funcione sin conexión. Si Pillow está instalado, achica las fotos a `--ancho` px (1600). No toca la fuente. **El archivo que se entrega y se revisa es el empaquetado.**

## narrar

Lee el `<aside class="voz">` de cada lámina (marcas `[paso N]`, `[foco SEL]`, `[clic SEL]`, `{visto|dicho}`: `html-deck.md`), genera el audio con voz de Microsoft Edge (gratis, sin cuenta, **necesita internet al generar**) y lo incrusta. Voz por defecto Catalina (Chile); `jorge` (México) si se pide. La primera vez crea su propio entorno de Python y guarda los audios en caché: si el texto de una lámina no cambia, no se regenera. Antes de narrar, el contenido tiene que estar estable.

## exportar-pptx

**Solo decks.** Los fondos y fotos grandes se achican a 1920 px y salen como JPEG (calidad 80) si no tienen transparencia; el script avisa si el PPTX pasa de 15 MB (no cabe en muchos correos: manda el PDF). Los íconos de la marca DP salen como imagen y la D fija se repite en cada lámina.

Usa dom-to-pptx (incluido en `assets/vendor/`) y el Chrome del sistema. Fuerza el estado final (`?estatico`) y exporta textos y formas editables; los SVG (gráficos, diagramas) salen como imagen. Al terminar abre el PPTX, cuenta textos y compara las cifras con las del HTML. Es una aproximación: abre el PPTX y mira cada diapositiva. Para la marca DP, ver `marca-dp.md`.

## grabar

Graba una página con Chrome y arma el MP4 con ffmpeg (sin apps externas). `pasos.json` es una lista de acciones:

```json
[{"ir":"#2"},{"esperar":800},{"clic":"button.siguiente"},{"escribir":"hola","en":"input"},{"scroll":600},{"esperar":1000}]
```

`ir` (un `#hash`, una ruta o una URL), `clic` (selector CSS), `escribir` (texto, con `en` para el campo y `ritmo` en ms por letra), `scroll` (píxeles), `esperar` (ms). La quietud de más de 1,5 s se recorta a 1 s, salvo con `--no-recortar`. Después, `video.py` lo incrusta, o úsalo como `<video data-tramo>` en un deck (`componentes.md`).

## video

Cambia cada `<video data-video="ruta.mp4" aria-label="…">` del HTML por el video incrustado (muted, autoplay, loop, playsinline). Sin segundo argumento reescribe el mismo HTML; no borra el MP4. Los videos pesan: úsalo con clips cortos.

## diagrama

Convierte un `.d2` en un SVG que usa las variables de color del documento (sigue al tema claro u oscuro y al acento); pégalo **inline** en el HTML, un `<img>` no hereda las variables. `--a-mano` da trazo de boceto. `--validar` revisa que todo nodo tenga entrada y salida (salvo `inicio` y `fin`) sin necesitar d2. Con carriles por rol: un contenedor por persona y flechas entre ellos (ejemplo en el encabezado del script). Necesita `d2` para dibujar.
