# Licencias y procedencia

Resumen de lo que trae esta skill y bajo qué condiciones se puede usar. Si algo no está documentado, se dice.

## Lo que se incluye en la skill

| Qué | Dónde | Licencia o condición |
|---|---|---|
| **Inter** (variable, subconjunto latino) | `assets/marca-dp/fuentes/Inter-var-latin.woff2` | SIL Open Font License 1.1. Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter) |
| **IBM Plex Mono** (300, 400, 500, subconjunto latino) | `assets/marca-dp/fuentes/IBMPlexMono-*.woff2` | SIL Open Font License 1.1. Copyright © 2017 IBM Corp., con el nombre reservado "Plex" |
| Texto de la OFL con ambos avisos | `assets/marca-dp/fuentes/OFL.txt` | Debe viajar junto a las fuentes. Las fuentes no se venden por separado ni se renombran |
| **Íconos** (`assets/marca-dp/iconos/`) | Material Symbols Outlined de Google | Apache License 2.0, según el readme del design system de DP. Los archivos SVG del kit no traen un archivo de licencia propio: la condición viene de ese readme, no de los archivos |
| **dom-to-pptx 2.1.2** | `assets/vendor/dom-to-pptx-2.1.2.bundle.js` | MIT. Texto en `assets/vendor/dom-to-pptx-LICENSE.txt` (https://github.com/atharva9167j/dom-to-pptx) |
| **Logos, icono D y texturas** de DP | `assets/marca-dp/logos/`, `texturas/` | Marca de Dinámica Plataforma. Uso para material de DP; no para otras organizaciones. Se modificó solo el relleno del icono D (SVG limpio, sin metadatos) |

La plantilla genérica (`deck.html`, `informe.html`, `comentar.js`) y los scripts son propios de esta skill; lo de terceros es lo de la tabla.

## Lo que se carga o se instala aparte (no viaja en el paquete)

- **`assets/librerias.html`** carga desde internet (jsDelivr) ECharts, D3, Observable Plot, Mermaid, rough.js, Leaflet y Scrollama. Cada una tiene su propia licencia de código abierto (ECharts: Apache 2.0; D3 y Observable Plot: ISC; Mermaid, rough.js y Scrollama: MIT; Leaflet: BSD-2-Clause). Si empaquetas un documento con `--remoto`, esas librerías quedan incrustadas en tu archivo: conserva sus avisos si lo distribuyes. Verifica la licencia en el repositorio de cada una.
- **Lucide** (íconos): no se incluye. Si un documento lo usa, es ISC (con partes bajo MIT); conserva su aviso.
- **edge-tts** (para la voz): `narrar.py` lo instala la primera vez en un entorno propio. Es un proyecto aparte con licencia LGPL-3.0 y usa el servicio de voces de Microsoft Edge, sin cuenta: es un uso no oficial del servicio y puede cambiar o dejar de funcionar.
- **D2** (diagramas): programa externo (MPL-2.0), no incluido.

## Pendiente

- Confirmar la licencia de los íconos directamente en el repositorio de Material Symbols si el kit se va a distribuir fuera de DP.
