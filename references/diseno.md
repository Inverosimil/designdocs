# Diseño: el estilo de la skill y el del proyecto

Probado en cinco rondas de pruebas y en decks reales. Las plantillas (`assets/informe.html` y `assets/deck.html`) ya lo traen hecho: llénalas, no lo reinventes.

## Las reglas

1. **Blanco sobre negro, o negro sobre blanco.** El fondo y el texto mandan. Lo más importante (la cifra clave, la opción recomendada) va **invertido** (`.inv`), no en color.
2. **Un solo acento, y solo para marcar.** Número de sección, subrayado, la línea o barra clave, una etiqueta, el índice activo. Nunca rellena superficies grandes ni títulos enteros. Del tema solo cambia el tono: `--hue` en `:root`.
3. **Bordes casi rectos.** Radio de 4 px en tarjetas, botones y etiquetas. Figuras y líneas, rectas.
4. **Sin contenedores para gráficos ni simuladores.** Una figura es: un rótulo ("Fig. 01 · qué muestra") sobre una línea fina, el gráfico suelto y la lectura debajo. Las tarjetas son para cifras, opciones, pasos, preguntas y fuentes.
5. **Ocupa bien el espacio.** Una sección va **lado a lado** (`.sec.lado`) solo si el texto y la evidencia tienen un alto parecido. Si no, va **a lo ancho** (`.sec.ancho`): título y texto arriba en dos columnas, y la evidencia debajo a todo el ancho (gráfico apaisado, fila de 3 tarjetas, grilla de 2). Nunca dejes una columna medio vacía junto a algo largo.
6. **Componentes gráficos en cada sección:** regla y detalle en `visuales.md`.
7. **Columna lateral (informe) sin scroll, nunca.** Lleva el título, una bajada corta, etiquetas y el índice. Si no cabe, la plantilla esconde lo secundario por pasos; igual escribe títulos y bajadas cortas.
8. **Celular impecable.** Sin scroll horizontal ni nada roto: todo pasa a una columna, las tablas se vuelven fichas y el índice es un botón.
9. **Editorial y ancho completo.** Números con opacidad al fondo y neón sutil funcionan; sin hover de fondo en filas ni tarjetas.

## Estilo del proyecto

Si no se pide un estilo y el informe es sobre un proyecto con identidad visual propia, el documento **se parece al proyecto**: quien lo abre debe reconocer el producto del que se habla. (Para DP manda su marca, `marcas.md`; si el usuario pide un estilo, manda ese.)

**Dónde buscarlo**, en este orden: `DESIGN.md`, guía de marca o `PRODUCT.md`; tokens o tema (`tailwind.config.*`, `globals.css`, `theme.*`, variables CSS `--color-…`); logo, favicon e íconos (`public/`, `assets/`); la app corriendo (captura); informes anteriores del proyecto.

**Qué tomar y cómo:** cambia las variables de la plantilla, no la reescribas.

| Del proyecto | En la plantilla |
|---|---|
| Fondo y texto (claro u oscuro) | `--B`, `--F`, `--M` y `data-theme` |
| Color principal | `--accent` (o `--hue` si es un tono de la rueda) |
| Tipografía de títulos y de texto | `--display` y `--sans` (cárgalas igual que la plantilla) |
| Radio de borde | `--r` |
| Logo e íconos | en la portada o el marco, y los íconos del proyecto en vez de los genéricos |

**Lo que se mantiene:** estructura, conclusión primero, un acento que solo marca, figuras sin caja, contraste suficiente (si el color del proyecto no se lee como texto, úsalo en barras y marcas, no en letras) y celular impecable. Si el proyecto no tiene estilo propio claro (solo código sin interfaz, o colores por defecto de una librería), usa el estilo de la skill. En la entrega, di en una línea qué tomaste del proyecto.

## Tipografía

| Uso | Letra |
|---|---|
| Títulos, cifras grandes | **Bebas Neue** (siempre en mayúsculas por diseño) |
| Texto | **Inter** |
| Rótulos, etiquetas, fechas, código | **JetBrains Mono**, en mayúsculas pequeñas con espaciado |

- Texto del informe: 16 px, interlineado 1.7. Rótulos en mayúsculas con tipografía mono: mínimo 11 px; el resto, 14 px (bajo eso el script avisa).
- Deck (lienzo 1920×1080): título 84–96 px, texto 30–34 px, nunca menos de 22 px. El script avisa bajo 22 px, salvo los rótulos en mayúsculas con tipografía mono, que pasan desde 16 px (en la marca DP son de 18 a 22 px).
- Números en tablas y cifras: `font-variant-numeric: tabular-nums`.

## El tono del acento (`--hue`)

| Tema | `--hue` aprox. |
|---|---|
| neutro, finanzas, institucional | 240–260 (azul) |
| crecimiento, ventas, energía (por defecto) | 60–80 (ámbar) |
| salud, territorio, medio ambiente | 140–160 (verde) |
| datos, tecnología | 190–210 (cian) |
| alertas, riesgo | 20–30 (rojo) |
| creatividad, educación | 290–310 (violeta) |
| un juego, una marca o un producto con color propio | ese color |

El acento sale con `oklch()` desde `--hue`, más claro en oscuro y más oscuro en claro, con contraste suficiente en ambos.

## Tema claro y oscuro

- El informe sigue al sistema (`data-theme="auto"`) y trae un botón para cambiarlo. Al imprimir, siempre claro.
- El deck parte en oscuro (`data-theme="dark"`); `T` lo cambia. Si se va a proyectar en una sala con luz, usa `data-theme="light"`.

## Lo que hace que se vea "de plantilla" (evítalo)

- Color en todos lados, degradados, brillos, vidrio esmerilado, sombras grandes.
- Gráficos dentro de cajas, cajas dentro de cajas.
- Grillas de tarjetas idénticas con un ícono cada una, sin jerarquía.
- Emojis como íconos.
- Títulos genéricos ("Introducción", "Conclusiones").

## Si rechazan el diseño

No rehagas todo a ciegas: arma un HTML con 2 o 3 direcciones de la portada y de una lámina clave, y deja elegir.
