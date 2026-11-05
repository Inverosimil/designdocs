# Entorno: el equipo de quien usa la skill

Todo lo que depende del equipo vive aquí. El resto de la skill es genérico. Esta skill no depende de ninguna app ni servicio externo.

## Abrir y revisar

- **Para mostrar:** abre el archivo final con el comando del sistema (`open` en Mac, `start "" archivo.html` en Windows, `xdg-open` en Linux) o con el navegador que tengas disponible. **Di siempre la ruta absoluta del archivo,** aunque lo hayas abierto: en algunos entornos el agente no puede abrir nada y esa ruta es lo único que tiene el usuario. Di "lo abrí" solo si el comando funcionó.
- **Para revisar:** `node scripts/capturas.mjs archivo.html carpeta`, con escritorio y celular, y mira las imágenes que deja. Revisa el final empaquetado, nunca la fuente: una fuente sin voz hace creer que el narrador desapareció.
- **Si no hay Node o Chrome o Edge,** corre `node scripts/doctor.mjs` si puedes y dilo en la entrega con esas palabras: "no revisado". No afirmes que se ve bien sin haberlo visto.
- **Deck narrado:** para probar, abre con `?mudo` (`archivo.html?mudo#3`) y deja el narrador apagado. Nunca lo enciendas para comprobarlo: mira los pasos con `window.__deck` y el estado con `window.__voz`.
- **Código propio sobre el deck:** el deck escucha los clics en fase normal, nunca en captura; si agregas código, haz lo mismo, para no romper las herramientas que anotan encima.

**Estilo del proyecto:** además de lo que dice `diseno.md`, pide o toma una captura de la app del proyecto si está corriendo, y mira los informes anteriores que estén en la carpeta de trabajo.

**Metadatos `informe:*` del `<head>`:** si la plantilla los trae, bórralos. Filtrarían rutas de tu equipo en un archivo que se comparte.

## Guardar y entregar

- La fuente y el final quedan en la carpeta de trabajo. Con el HTML ya empaquetado, corre `node scripts/entregar.mjs` (sus opciones las muestra el propio script): deja el final y su PDF juntos.
- Sin Node, deja el HTML final en la carpeta de trabajo y di que el PDF se saca desde el navegador con Imprimir > Guardar como PDF.
- En un chat sin carpeta propia, entrega el archivo como descarga y dilo.
- **En la entrega di dónde quedó:** la ruta absoluta del final y la de la fuente.
- Si el informe cambia, vuelve a generarlo y reemplaza la versión final, con su PDF. Nunca dejes dos versiones finales sin explicar cuál vale.

## Comentarios

El usuario comenta de dos maneras:

- **En el chat,** con palabras.
- **Con la tecla `C` en el informe o el deck:** marca lo que quiere cambiar, escribe el comentario, exporta y pega el texto en el chat. Cada comentario dice a qué lámina o parte apunta; atiéndelos uno por uno y di cuáles quedaron hechos.

## Grabar videos

`visuales.md` ("Videos") dice qué grabar y con qué ritmo; esto es solo cómo.

- Usa `scripts/grabar.mjs` o un video que entregue el usuario, y `scripts/video.py` para incrustarlo.
- Mira el video antes de incrustarlo y repítelo si algo salió mal.
- **Sin grabador ni video:** muestra capturas por pasos y dilo en la entrega. No prometas un video que no hiciste.
- No borres videos del usuario. Si dejaste grabaciones de prueba que ningún `data-video` usa, avísalas o elimínalas si son tuyas.

## Skills opcionales

Si tu agente tiene instaladas `frontend-design`, `impeccable` o similares, úsalas como segunda mirada antes de entregar. Lo mismo vale para skills de gráficos, de diagramas o de PDF.

- **La skill no depende de ellas.** Si no están, sigue sin decir nada.
- **Mandan las reglas de esta skill:** `diseno.md` en el estilo y `marca-dp.md` en la marca DP, aunque una herramienta de crítica lo marque como "por defecto de IA".
- No crees archivos de configuración de esas herramientas en las carpetas del usuario, salvo que lo pida.

## Precedentes

Sirven los decks que el usuario te dé o que estén en la carpeta de trabajo: mira cómo resolvieron algo, sin editar los originales. Para la marca DP, `assets/deck-dp.html` siempre es la base técnica.

**Contexto DP que no se supone:** si el usuario no lo dio, pregúntalo o márcalo como supuesto.
