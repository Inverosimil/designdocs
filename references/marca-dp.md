# Marca DP (Dinámica Plataforma)

**Edición liviana, no oficial.** Sirve para borradores y presentaciones de trabajo con la imagen de DP. Para el PPTX oficial o la versión final de una pieza, consulta al responsable del design system de DP.

## Cuándo aplica

El pedido dice DP, Dinámica Plataforma o "marca DP", o es un proyecto o cliente de DP. Si el documento va en nombre de un cliente, manda la marca del cliente (`marcas.md`). Fuera de DP, no uses esta marca.

## Cómo se usa

- **Deck:** parte de `assets/deck-dp.html`, nunca de `assets/deck.html` con colores encima. Copia el archivo **junto con la carpeta `assets/marca-dp/`** (las rutas son relativas) a tu carpeta de trabajo, y reemplaza las láminas de ejemplo por las tuyas. Todo el contenido del ejemplo es ficticio.
- **Informe:** parte de `assets/informe-dp.html` (mismo trato con `marca-dp/`).
- El motor es el mismo de las plantillas genéricas (panel de opciones, barra con miniaturas, narrador, modo comentar). Lo que cambia es `marca-dp/dp.css` (deck) y `marca-dp/dp-informe.css` (informe).
- `python3 assets/marca-dp/armar.py` **regenera** `deck-dp.html` e `informe-dp.html` desde las plantillas genéricas y `marca-dp/laminas-deck.html`. Úsalo solo si cambias una plantilla; lo que edites a mano en `deck-dp.html` se pierde al regenerar.
- El resto del proceso es el de siempre (brief, guion, revisión): la marca decide lo visual, la skill decide el contenido.

## Qué trae `assets/marca-dp/`

- `logos/`: logo horizontal color y blanco, vertical color y blanco, icono D azul y blanco (SVG con el relleno ya aplicado), máscara de la D.
- `fuentes/`: Inter (variable) e IBM Plex Mono, subconjunto latino, incrustables.
- `texturas/`: dos texturas de degradado para láminas oscuras. `iconos/`: íconos Material para usar con `<use href="#d-nombre">`.
- **No trae fotos.** Donde las láminas de ejemplo llevan foto, hay una textura de relleno: cámbiala por una foto que entregue el usuario (copiada a la carpeta de trabajo) o déjala. No inventes rutas ni bajes fotos de internet.

## Reglas visuales

- Fondo claro por defecto; lo oscuro es **por lámina** (`class="slide dp oscura"` con `<div class="tex"></div>`), no un tema global.
- Títulos en Inter liviano (200) y **azul** `#0047BA` sobre claro, blanco sobre oscuro; textos de apoyo y etiquetas en IBM Plex Mono.
- Azul `#0047BA` como color principal; apoyos `--deep` `#003995`, `--navy` `#00286E`, verde `--teal8` `#02725E`, naranja `--orange8` `#CB6915` (solo decoración) y `--orange9` `#AE5810` (cuando lleva texto blanco encima o texto de color: pasa contraste), lavanda `--lav`. **El color va por rol** (una línea de trabajo, un estado, un responsable), no por adorno.
- Tarjetas gris muy claro (`#F5F6F9`) sin borde; una cifra o idea por tarjeta.
- Marco: título arriba a la izquierda, la D arriba a la derecha (capa fija, no la pegues a mano), número abajo a la izquierda y "Dinámica Plataforma" abajo a la derecha. La portada lleva su propio logo (`data-sin-logo`).
- Fotos solo aportadas por el usuario, con permiso para usarlas.
- Íconos solo de `marca-dp/iconos`.

## Familias de láminas (en `laminas-deck.html`)

1. **Portada:** fondo azul con textura, título grande y liviano, tres cifras clave y una foto a la derecha.
2. **Índice:** lista numerada con una foto.
3. **Cifras:** tarjetas con ícono, cifra grande y una frase, más una tarjeta destacada oscura.
4. **Estados:** cuatro columnas con etiqueta, estado, detalle y barra de avance.
5. **Líneas de trabajo con foto:** cuatro tarjetas con imagen arriba.
6. **Cronograma (Gantt DP):** meses, semanas, barras por rol, hitos y la línea "Hoy"; lo posterior queda rayado como tentativo.
7. **Proceso en pasos:** cinco chevrones numerados, uno por etapa, con quién participa.
8. **Equipo:** cuatro círculos con ícono, rol, nombre del frente y una banda azul de cierre.
9. **Decisiones con foto:** columna con foto y lista numerada, más un recuadro "si no se decide".
10. **Cierre oscuro:** mensaje grande y recuadro con lo que se pide y el plazo.

## Cómo partir (deck)

1. Copia `assets/deck-dp.html` **junto con la carpeta `marca-dp/`** (el HTML la lee por ruta relativa) y cambia `<title>` y `data-title`.
2. Las láminas son todo lo que hay dentro de `<div class="stage" id="stage" ...>`, hasta el `</div></div>` que va justo antes de `<div class="ui">`. Reemplaza solo eso y conserva los atributos de `.stage` (`data-logo`, `data-numeros`...). Las láminas de ejemplo están también sueltas en `marca-dp/laminas-deck.html`, para copiarlas de a una.
3. **Plan sin fechas:** el Gantt DP (`g-*`) siempre lleva fechas y no acepta `data-cols`. Para un plan por fases, usa la familia 7 (pasos en chevrón) y pon "fechas por definir" en la bajada.

## Qué no hacer

- No copies colores de DP sobre `deck.html`, ni redibujes o deformes el logo, ni cambies su color: usa los archivos de `logos/`.
- No inventes áreas, nombres, roles ni procesos internos de DP (`comunicar.md`, Honestidad). En el equipo, pon el frente o el rol; los nombres solo si vienen en la fuente.
- No pongas clientes, personas reales, capturas de plataformas con datos reales ni logos de terceros en el kit ni en los ejemplos.
- No uses fotos de ilustración como evidencia. Para mostrar algo real (una pantalla, un lugar), usa una captura o foto real aportada por el usuario.
- No uses íconos de otros sets (Lucide, Font Awesome) ni stock con esta marca.
- La marca oficial es editorial: foto, escala y tipografía mandan, pocas cajas y sin sombras. Las tarjetas de este kit son la versión liviana; no anides cajas ni las repitas por costumbre.
- No mezcles esta marca con otra en el mismo deck.
- No llenes láminas: los decks DP tienden a salir largos y técnicos; respeta el tope del brief.
- El revisor deja pasar los rótulos mono en mayúsculas desde 16 px y acepta hasta ~70 palabras por lámina `.dp` (tarjetas). Un texto de contenido va a 22 px o más. Una lámina de 80 palabras sigue siendo demasiado: corta.
- Con textos de 1 o 2 líneas, las familias de tarjetas (estados, cifras, equipo, pasos) quedan con aire sobrante abajo: llénalas con 2 a 4 líneas por tarjeta o elige una familia menos alta.

## Exportar

- HTML y PDF: como siempre (`scripts.md`, `entregar.mjs`).
- PPTX: `exportar-pptx.mjs` da una aproximación editable; **no es el PPTX oficial** de DP. Límites conocidos: las fuentes (Inter, IBM Plex Mono) **no van embebidas**: instálalas o PowerPoint usará otras y algunos textos cambiarán de línea; los íconos y la D salen como imagen; las texturas y fotos se achican a 1920 px; el "1 mapa" corto o un recuadro de texto largo pueden desbordar un poco. No se probó en PowerPoint: ábrelo y revísalo antes de enviar. Para el oficial, consulta al responsable del design system.
- Licencias del kit: `LICENCIAS.md` en la versión compartible.
