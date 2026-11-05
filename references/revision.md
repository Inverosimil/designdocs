# Revisión final

Pásala completa sobre **el archivo final** (empaquetado y, si corresponde, narrado), no la fuente. Corre `scripts/capturas.mjs` y **mira cada imagen**: el script no ve si algo se entiende. Qué comprueba y qué no: `scripts.md`. Lo que este script no revisó, lo revisas tú. En modo rápido, solo lo tocado, y dices qué no se revisó.

## Comunicación (lo más importante)

- [ ] La idea principal está en la primera pantalla o lámina, en una frase simple.
- [ ] Leyendo solo los títulos, en orden, se entiende la historia y la conclusión. Cada título es un hecho verificable (`comunicar.md`).
- [ ] Hay recomendación explícita y "qué necesito / qué sigue".
- [ ] Están respondidas las 5 preguntas que el lector hará.
- [ ] El largo coincide con lo pedido; se cumple el tope de láminas. Cada lámina tiene objetivo. "¿Qué dos se pueden fusionar o borrar?".
- [ ] El nivel coincide con el lector: ningún término sin explicar. Se usan las palabras del proyecto.
- [ ] Todo número tiene contexto (comparación, traducción o redondeo).
- [ ] **Honestidad** (`comunicar.md`): cifras con origen; personas, áreas, procesos, fechas y plazos con fuente o marcados como supuesto; nada que comprometa al presentador; sin "listo" ni "casi" en avances; cada recomendación es posible hoy.
- [ ] **Si había documento fuente:** el modo fiel no agregó ni cambió nada; el cotejo está reportado.

## Visuales

- [ ] Cada sección o lámina tiene al menos un componente gráfico; no hay dos párrafos seguidos sin algo que mirar.
- [ ] Cada visual pasa la prueba de 5 segundos y dice algo que el texto solo no dice.
- [ ] **Si trata de una app o pantalla accesible, hay capturas reales,** fieles a la pantalla y ya cargadas. Un esquema dibujado no pasa: captura, o di en la entrega por qué no se pudo.
- [ ] Imágenes reales cuando el tema es físico o un lugar, con pie y crédito. En un deck, la mayoría de las láminas lleva imagen.
- [ ] La portada usa una foto con resolución igual o mayor al lienzo (`visuales.md`).
- [ ] Gráficos y simuladores sin caja; las figuras complejas cumplen los criterios de `visuales.md`.
- [ ] Organigramas, flujos y fórmulas cumplen sus reglas (`visuales.md`).

## La lámina (hoja de contactos)

- [ ] No queda texto de trabajo ("pendiente", "por confirmar", "foto aquí", "TODO", "Puntos X a Y"). Lo pendiente, nombres, links y logística van en notas.
- [ ] Hay variedad de layouts: máximo 2 o 3 láminas por variante de tarjeta, y no más de dos seguidas iguales.
- [ ] Al exponer, listas, secuencias y diagramas van con `data-step`.
- [ ] Si un logo se repite, no se anima al cambiar de lámina.

## Estilo y técnica

- [ ] El color de acento solo marca; lo destacado va invertido, no pintado.
- [ ] Ninguna sección deja una columna medio vacía (si pasa, cambia `.lado` por `.ancho`).
- [ ] La columna lateral cabe sin scroll (título corto, bajada de 1 o 2 líneas).
- [ ] Sin scroll horizontal en celular; nada se corta ni se superpone; sin texto chico (22 px en el lienzo; rótulos mono, 17 a 20 px).
- [ ] **Alineación:** tarjetas hermanas a la misma altura; texto centrado de verdad en círculos y etiquetas. Míralo: casi siempre lo encuentra quien lee, no el script.
- [ ] **Encuadre:** cada lámina ocupa su espacio. Si sobra, agranda la evidencia o suma una imagen, no el texto.
- [ ] **Contraste:** ojo con el acento sobre piezas invertidas y con textos tenues.
- [ ] Se ve bien en claro y en oscuro.
- [ ] Un solo archivo: imágenes incrustadas y sin errores en la consola.
- [ ] El PDF es de esta misma versión y se ve bien.
- [ ] **Deck narrado:** el guion se escucha natural, cada resaltado cae cuando se nombra, los términos raros están en el glosario de pronunciación. Escucha al menos dos láminas. El narrador queda apagado.
- [ ] **Con marca:** pasa también la revisión de la marca (`marcas.md`).
- [ ] **Entregado:** `scripts/entregar.mjs` corrido, archivo final abierto y ruta dicha (`entorno.md`).

## Si algo falla

Corrige la causa (el guion, el visual, el texto, la forma de la sección), no el síntoma: achicar la letra para que quepa casi nunca es la solución; dividir la lámina o cortar texto, casi siempre.
