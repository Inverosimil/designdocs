# Comunicar: sintetizar, simplificar y adaptar

Lo que hace bueno un documento es que el lector entienda, no que esté todo. Esta guía cubre cómo decidir qué decir y cómo decirlo.

## 1. Sintetizar

**Pirámide:** la conclusión arriba, después las razones y abajo la evidencia. El lector puede parar en cualquier nivel y ya se lleva lo importante.

```
Idea principal (1 frase)
├── Apoyo 1 → evidencia, ejemplo, número
├── Apoyo 2 → evidencia
└── Apoyo 3 → evidencia
```

Cómo llegar a la idea principal:

1. Escribe todo lo que sabes del tema en bruto (para ti, no va al documento).
2. Pregúntate: "Si el lector recuerda una sola cosa, ¿cuál es?". Esa es la idea principal.
3. Agrupa el resto en 3 a 5 grupos que la sostengan. Ponle a cada grupo una frase-afirmación.
4. Lo que no entra en ningún grupo: anexo o fuera.

**Cortar sin miedo.** Para cada párrafo, lámina o figura: "¿El lector lo echaría de menos?". Si no, se va. Que algo sea cierto, interesante o haya costado trabajo no es razón para dejarlo.

**Corto vs. largo.** Lo largo no agrega ideas principales: agrega evidencia, ejemplos y anexo. Un informe de 4.000 palabras tiene la misma idea principal y los mismos 3 a 5 apoyos que uno de 400.

## 2. Simplificar sin mentir

Simplificar es quitar lo que el lector no necesita, no cambiar lo que es verdad.

Técnicas, en orden de uso:

1. **Concreto antes que abstracto.** Primero el ejemplo, después la regla. "De cada 100 pedidos, 18 llegan tarde; con el canal online, 5" antes que la fórmula.
2. **Analogía con algo cotidiano.** "Un índice de base de datos es como el índice de un libro: no lees todo para encontrar una palabra". Usa una por concepto, no la estires y di dónde deja de valer si importa.
3. **Una idea por frase.** Frases de 15 a 20 palabras. Si lleva "y además", son dos frases.
4. **Números con contexto.** Nunca un número solo: compáralo ("3 veces más que el mes pasado"), tradúcelo ("unas 2 horas al día") o redondéalo (37,4821 → "unos 37").
5. **Nombrar las cosas como el lector.** Si el lector dice "la app", no escribas "el cliente frontend".
6. **Definir al primer uso.** Todo término técnico, sigla o nombre interno se explica la primera vez, en una línea: "PMTiles (un archivo que guarda el mapa ya cortado en piezas)".
7. **Mostrar el resultado antes que el cálculo.** "Conviene abrir el sábado: se vende el doble". El cálculo, después o en el anexo.

Prueba de la abuela: lee el texto como alguien que no sabe del tema. Marca cada palabra que te obligaría a preguntar "¿qué es eso?". Cada marca se explica o se cambia.

## 3. Adaptar al perfil

Antes de escribir, completa: "El lector es ___, sabe ___, no sabe ___, le importa ___, va a usar esto para ___".

| Si el lector… | Entonces… |
|---|---|
| no conoce el tema | analogías, ejemplos, glosario, menos números |
| decide (jefe, cliente, directorio) | conclusión, impacto, costo, riesgo, opciones; nada de "cómo" que no cambie la decisión |
| ejecuta (equipo, técnico) | pasos, responsables, detalles exactos, datos de entrada |
| es experto | términos precisos, método y supuestos; igual con conclusión arriba |
| tiene poco tiempo | formato corto, resumen arriba, todo lo demás plegado |
| es mixto | cuerpo para el menos experto, anexo para el más experto |

Si el pedido dice "para X" (mi jefe, un cliente, mi mamá, el equipo técnico), ese es el perfil. Si no lo dice, asume una persona inteligente que no conoce el tema.

## 4. Redacción

**Títulos-afirmación.** Cada título dice la conclusión de su lámina o sección.

| Mal (tema) | Bien (afirmación) |
|---|---|
| Resultados | El canal online explica el 80 % del crecimiento |
| Arquitectura | Todo pasa por una sola base, y ahí está el cuello de botella |
| Opción B | Abrir el sábado duplica la venta |

**Una afirmación es un hecho verificable, no un eslogan.** Si suena a aviso publicitario en un deck informativo, reescríbelo. Sin superlativos ni frases de venta, salvo que sea una venta.

| Malo (eslogan) | Bueno (hecho) |
|---|---|
| La plataforma ahora tiene mapa | Los módulos del mapa ya muestran las zonas por comuna |
| Transformamos la gestión de horas | Registrar horas toma 2 clics en vez de 6 |

**La portada lleva un nombre descriptivo,** no un titular: de qué es, para quién y cuándo. La conclusión va en la lámina siguiente, salvo que pidan lo contrario.

**Palabras del proyecto.** Usa los términos exactos del glosario del brief: nombre del producto, áreas, personas. Lo dictado por voz llega con errores de transcripción: normalízalo y confirma lo dudoso. Si corrigen un término, se corrige en todo el archivo y en el guion de voz.

**Voz activa y directa.** "Recomiendo esperar" en lugar de "se sugiere considerar la posibilidad de esperar".

**Listas cortas.** De 3 a 5 ítems, paralelos (todos empiezan igual: verbo, sustantivo…). Más de 7 → agrupa.

**Negrita para la frase clave**, una por párrafo como máximo.

**Recomendación explícita.** Si hay opciones, di cuál recomiendas y por qué, en una línea, antes de detallarlas.

**Supuestos visibles.** Lo que no es seguro se marca: "Supuesto: el precio no cambia" (reglas en "Honestidad").

## 5. Honestidad

Lo que no salga de una fuente va **marcado como supuesto**, o se pregunta. Esto no cubre solo cifras: también **personas, áreas, roles, procesos, fechas, días, responsables, dotación y plazos**. En decks reales se presentó como hecho un departamento que no existía, días de la semana nunca acordados y una deuda leída de una captura: cada error así destruye la confianza en todo lo demás.

- **Cifras con origen.** Cada cifra importante dice si es **dato** (medido, con fuente), **estimado** (calculado, con cómo) o **supuesto** (se dice que se asume). En las plantillas: `.chip`, `.chip.est`, `.chip.sup`, y la sección "De dónde sale cada número". Lo inferido de una captura o por cálculo propio se marca "a confirmar".
- **Dos fuentes que no coinciden:** dilo, di cuál usaste y por qué.
- **Una cifra que falta:** se dice que falta. No se rellena.
- **No comprometer al presentador.** En un deck que se expone no van fechas exactas, días, responsables, nombres, carga de trabajo ni cifras que el expositor no pueda sostener, salvo que estén en la fuente. Si no están: "por definir" o se saca.
- **Recomendaciones posibles.** Comprueba que cada una se pueda hacer hoy en la situación real del lector (requisitos, saldo, permisos). Lo que no se pudo verificar, se dice.
- **Al corregir una cifra,** recalcula lo que depende de ella y di qué cambia.

## 6. Decks de avance

Conclusión primero no significa redondear para arriba.

- Sin "listo", "completo", "casi", "funciona completa" ni "no falta nada". Se afirma lo avanzado y **se dice qué falta**, con su tamaño.
- Todo lo futuro va **tentativo**: plazos, lanzamientos, próximas etapas.

| Malo | Bueno |
|---|---|
| El sistema está casi listo | Ya se puede registrar y aprobar; faltan reportes y la carga masiva |
| Lanzamiento en 14 días | Lanzamiento tentativo: fines de mes, si se cierra la carga masiva |

## 7. Propuestas y visión

Cada idea futura o módulo propuesto responde tres cosas: **qué problema resuelve, a quién y qué pasa hoy sin ella**. Si no se puede responder, **avisa al usuario** en vez de rellenar: un presentador no puede defender una idea que no entiende.

## 8. Anticipar las preguntas

Antes de cerrar el guion, escribe las 5 preguntas que el lector hará ("¿y si…?", "¿cuánto cuesta?", "¿qué pasa con…?", "¿desde cuándo?", "¿y lo otro?"). Cada una se responde en el cuerpo o en la sección "Lo que te vas a preguntar". Si el lector tiene que volver a preguntar lo obvio, el documento quedó corto. Si lo expone alguien, van a la hoja del expositor (`html-deck.md`).

## 9. Antes y después (ejemplo real)

Un informe técnico empezó así: "Método verificado: V = f(p, c, …)", con fórmulas, tablas de parámetros y luego cinco propuestas. El lector no entendió el resultado.

Rehecho con esta guía:

> **Abre el sábado en el local del centro y venderás unas 2,6 veces más que hoy.**
> Hoy no conviene: faltan 3 cosas que hay que tener listas antes (abajo).
> ¿Por qué funciona? → sección 2, con un ejemplo de números simples.
> ¿Cómo se calculó? → anexo.

Misma información, distinto orden y lenguaje.
