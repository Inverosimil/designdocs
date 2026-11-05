---
name: designdocs
description: "Crea informes y presentaciones que se entienden a la primera, en un solo archivo HTML que funciona sin internet, y los exporta a PDF o PPTX. Úsala siempre que alguien pida un informe, reporte, presentación, deck, láminas, diapositivas, resumen ejecutivo, minuta visual, one-pager o \"algo para mostrar o explicar\" a otra persona, aunque no diga HTML, sea de trabajo o personal. Parte por el guion y la conclusión, con títulos que afirman algo, adapta el largo y el nivel al lector y elige el gráfico, diagrama o imagen que ayuda a entender cada idea. Si el trabajo es para Dinámica Plataforma (DP), para un cliente de DP o el pedido dice \"marca DP\", aplica la marca DP con el kit incluido: logos, colores, tipografías y plantillas. Si no, usa el estilo que pida el usuario, el de su proyecto o el estilo propio de la skill."
---

# Informes y presentaciones

Esta skill hace documentos que **comunican**: el lector entiende la idea principal en 30 segundos y puede actuar. Un documento bonito que no se entiende es un documento fallido.

**Lee `references/entorno.md`: cómo abrir, guardar, recibir comentarios y grabar en este entorno.** Las rutas son relativas a la carpeta de esta skill; nunca edites las plantillas originales, cópialas a la carpeta de trabajo.

## Formato

| Formato | Cuándo | Plantilla |
|---|---|---|
| **Presentación (deck):** láminas 16:9, una idea por lámina | se va a **exponer** | `assets/deck.html` |
| **Informe:** una página con scroll, resumen arriba | se va a **leer** solo | `assets/informe.html` |
| **Deck narrado:** una voz lo presenta sola; parte apagada (`N` o panel de opciones) | se mira sin presentador, o piden "narrada", "guiada", "con voz", "tipo video". También como **ensayo** de un deck que se expondrá: ofrécelo en una línea | la del deck |

## Qué leer según el caso

| Caso | Lee | Parte de |
|---|---|---|
| Informe simple | `html-informe.md`, `revision.md` | `assets/informe.html` |
| Deck | `comunicar.md`, `html-deck.md`, `componentes.md`, `visuales.md` (tablas), `revision.md` | `assets/deck.html` |
| Deck DP | lo del deck, más `marcas.md` y `marca-dp.md` | `assets/deck-dp.html` (obligatorio) |
| Documento existente (Word, PPT, PDF, texto dado) | paso 1 aquí, `comunicar.md` (Honestidad) | la plantilla que toque |
| Narrado | `html-deck.md` (Narración) | el deck |
| Video de una página | `visuales.md` (Videos), `scripts.md` | `scripts/grabar.mjs` |
| Una ronda de cambios | "Comentarios y rondas" aquí | el archivo fuente |
| Gráficos raros, mapas, diagramas, fórmulas | `librerias.md` | `assets/librerias.html` |

Todas las guías viven en `references/`. Comandos de cada script: `references/scripts.md`.

## Tres modos

- **Normal:** el proceso de abajo. Pregunta solo lo que no puedas inferir y cambie mucho el resultado: máximo 2 o 3 preguntas, en un mensaje, **cada una con tu propuesta al lado**, para que basten con un "ok".
- **Autónomo** (dan un plazo o piden no preguntar): no preguntes. Asume, marca lo asumido en el documento y lista cada supuesto en la entrega.
- **Rápido** (cambio urgente, reunión encima): aplica el cambio, captura solo lo tocado, entrega y di qué no se revisó. No regeneres la voz si el guion no cambió.

Si el usuario dice haber adjuntado imágenes y no llegan, avísalo en tu primera respuesta.

## Proceso

Los pasos 1 a 3 deciden casi toda la calidad; no los saltes para ir directo al HTML.

### 1. Brief

Infiérelo del pedido y del contexto. Anótalo en pocas líneas; todo lo demás se decide contra él.

| Pregunta | Si no lo dicen |
|---|---|
| ¿Quién lo lee? (perfil, qué le importa) | una persona inteligente que **no** conoce el tema |
| ¿Qué ya sabe ese público? | no vuelvas a vender lo conocido: segunda iteración o equipo conocido parte de lo nuevo |
| ¿Qué debe saber, decidir o hacer después? | escríbelo tú en una frase |
| ¿Formato? | tabla de arriba |
| ¿Largo o duración? | medio (ver "Escala") |
| ¿Nivel? | ejecutivo (ver "Nivel") |
| ¿Estilo o marca? ¿Marca de un cliente o campaña? | paso 5 |
| ¿Animación, sobria o wow? | la de la plantilla |
| ¿Palabras exactas del proyecto? | saca un mini glosario del pedido y de sus documentos; normaliza lo dictado por voz |

**Si se expone en vivo,** suma: qué dirá de palabra (va a notas, no a la lámina), cuántos minutos y si habrá demo. Lo que muestra la demo no lleva lámina.

**Si parte de un documento o contenido dado,** elige y dilo:

- **Fiel** ("exacto", "tal cual", una v1 de un Word): texto literal, nada agregado. Ni etiquetas de rol, ni responsables deducidos, ni dibujos que afirmen algo. Las dudas van fuera de la lámina (notas o entrega). La skill aporta solo diseño.
- **Reinterpretado:** se reescribe con este proceso y la entrega dice qué cambió.
- **Contenido dado** (el usuario trae texto o guion lámina por lámina): no se resume ni se agrega. Un visual solo dibuja lo que el texto ya dice.
- **Link y texto a la vez:** lee primero el link, compara y **reporta el cotejo** (qué difiere y qué usaste). Un texto pegado puede ser una versión vieja. Si el link no se puede leer, dilo antes de construir.

### 2. Mensaje

- Escribe la **idea principal** en una frase que cualquiera entienda, y debajo 3 a 5 ideas de apoyo.
- Lo que no apoye una de ellas se corta o va al anexo.
- Escribe las 5 preguntas que hará el lector; `comunicar.md` dice cómo responderlas.
- Cómo sintetizar, simplificar y escribir títulos: `comunicar.md`.

### 3. Guion antes de diseñar

Esqueleto en texto, una línea por lámina o sección: **título-afirmación**, objetivo y visual.

- **Objetivo:** qué entiende el público al salir de esa lámina, en una frase. Si no sale, no entra.
- **Muéstralo al usuario antes de construir** en decks de varias láminas, salvo en modo autónomo.
- **Prueba de los títulos:** leyendo solo los títulos, en orden, se entiende la historia y la conclusión. Si no, rehaz el guion, no el diseño.
- **Tope:** sin largo pedido, 12 láminas. Cuéntalas; pasarse exige justificarlo en una línea.
- **Antes de construir pregúntate:** "¿Qué dos láminas se pueden fusionar o borrar?".

Estructura base (adáptala):

1. **Conclusión primero:** qué pasa, qué recomiendo, qué necesito.
2. **Contexto:** lo mínimo para entender por qué importa.
3. **Ideas de apoyo:** una por lámina o sección, con su evidencia.
4. **Qué sigue:** pasos, decisiones o preguntas abiertas.
5. **Anexo:** detalle técnico, fórmulas, supuestos y fuentes.

**Variante deck de producto o demo:** problema breve → cómo funciona, simple → cada módulo con un separador "Ahora: módulo" y su video o captura → lo técnico → qué sigue. Lo técnico nunca va antes de mostrar el producto.

### 4. Visual de cada idea

Cada sección o lámina lleva al menos un componente gráfico; en decks, la mayoría lleva una imagen de verdad. Decide con la tabla de `visuales.md`. Lo corto:

- **Un número** → número grande con su comparación. **Varios** → gráfico.
- **Un proceso o sistema** → diagrama simple.
- **Algo físico, un lugar o una pantalla** → foto, captura real o mapa.
- **Cómo se usa una página** → video corto grabado de verdad.
- **Un mecanismo difícil de imaginar** → quizá una figura interactiva.

Si un visual solo impresiona, se saca.

### 5. Diseño

Gana el primero que aplique:

1. **El que pida el usuario.**
2. **La marca DP o la de un cliente:** `marcas.md`. Para DP se parte obligatoriamente de `assets/deck-dp.html`, nunca de `assets/deck.html` con colores encima.
3. **El del proyecto,** si tiene identidad propia: `diseno.md` ("Estilo del proyecto"). En la entrega di qué tomaste.
4. **El de la skill,** ya hecho en las plantillas: `diseno.md`.

Debe verse bien en celular, escritorio e impresión.

### 6. Construir y cerrar

Parte de la plantilla y llénala; no cambies sus tokens sin motivo. El orden es uno solo:

**escribir → narrar → empaquetar → revisar el final**

1. **Escribir** la fuente `.html`. Si el deck se narra, escribe el guion de voz (`html-deck.md`).
2. **Narrar**, solo si lleva voz y el contenido ya está estable: `scripts/narrar.py`.
3. **Empaquetar** en un archivo autocontenido: `scripts/empaquetar.py` (con `--remoto` para que funcione sin internet).
4. **Revisar el archivo final**, no la fuente: paso 7.

`scripts/entregar.mjs` hace los pasos de cierre con un solo comando (`scripts.md`).

### 7. Revisa como lo haría el lector

Corre `scripts/capturas.mjs`, **mira cada imagen** y pasa `revision.md`. Corrige y vuelve a capturar hasta que pase. Lo que el script revisa y lo que no: `scripts.md`. Si un revisor no pudo correr, dilo en la entrega ("no revisado").

Un deck narrado se prueba con `?mudo` y queda con el narrador apagado (`html-deck.md`, "Una sola voz").

### 8. Entrega

Cada entrega termina con `scripts/entregar.mjs` y abriendo **el archivo final, nunca la fuente**, según `entorno.md`. El HTML y el PDF siempre son de la última versión.

Di en 2 o 3 líneas:

- dónde quedó, con la ruta absoluta, y cómo se abre;
- qué decisión o acción pide el documento;
- los supuestos, uno por uno.

Si se expone, agrega la **hoja del expositor** (`html-deck.md`). Si lo piden, un **resumen en texto** para correo o WhatsApp.

## Comentarios y rondas

Dónde llegan los comentarios: `entorno.md`. En cualquier entorno sirve el **modo comentar** de la plantilla: tecla `C`.

1. Atiende lo pedido.
2. **Aplica el mismo arreglo en todos los casos iguales** del documento y en el guion de voz. Una corrección de palabra se busca en todo el archivo y se suma al glosario.
3. Si corriges una cifra, recalcula lo que depende de ella y di qué cambia.
4. **Cierra con una lista punto por punto:** qué aplicaste, qué no y por qué, y qué extendiste a otros lugares sin que lo pidieran.
5. Tras eliminar o mover láminas, entrega la lista renumerada.
6. Termina con el paso 8.

## Escala según el largo pedido

| Largo | Deck | Informe | Qué entra |
|---|---|---|---|
| Corto ("rápido", "una lámina", "resumen") | 1 a 6 láminas | 1 pantalla a ~400 palabras | conclusión + 2 o 3 apoyos + qué sigue |
| Medio (por defecto) | 8 a 12 láminas | 800 a 1.500 palabras | estructura base completa |
| Largo ("completo", "detallado", "todo") | 15 a 30 láminas | 1.500 a 4.000 palabras | igual, con más evidencia y anexo |
| Por minutos | 5 min son unas 6 láminas | no aplica | si sigue una demo, lo que muestra no lleva lámina |

Más largo no es más claro. Ante la duda, corta. Lo que sobra va al anexo.

## Nivel según el lector

| Nivel | Para quién | Cómo se escribe |
|---|---|---|
| Simple | cualquier persona | sin jerga, con analogías y ejemplos, frases cortas, un número por idea |
| Ejecutivo | quien decide | conclusión, impacto, costo, riesgo y opciones; el cómo, solo si cambia la decisión |
| Técnico | quien lo construye o audita | términos exactos, método, supuestos y datos; igual con conclusión arriba y cada término definido |

"Explícalo simple" → nivel simple siempre, aunque el tema sea técnico. Se puede combinar: cuerpo simple y anexo técnico.

## Errores que esta skill evita

- **Empezar por el método:** fórmulas o datos antes de decir qué se concluye.
- **Largo innecesario:** cubrir lo que se sabe en vez de lo que el lector necesita.
- **Jerga sin traducir:** siglas y nombres internos sin explicar.
- **Visual que complica:** una figura vistosa donde bastaba una barra o una frase.
- **Diseño plano o espacio mal usado:** muros de texto, o una columna medio vacía.
- **Inventar:** datos, personas, áreas o plazos sin fuente (`comunicar.md`, Honestidad).
- **No cerrar:** el lector termina sin saber el resultado ni qué hacer.

## Archivos

Guías en `references/`: `comunicar`, `visuales`, `diseno`, `html-deck`, `html-informe`, `componentes` (catálogo), `marcas`, `marca-dp`, `librerias`, `scripts`, `revision` y `entorno`. Plantillas y ejemplos en `assets/`; herramientas en `scripts/`.
