# Visuales: qué usar para cada idea

Un visual se gana su lugar si el lector entiende **más rápido o mejor** con él que sin él. Si solo decora o impresiona, se saca.

## Más visuales, siempre

Tiende siempre a más imágenes y componentes gráficos.

- Cada sección o lámina lleva al menos uno, y nunca dos párrafos seguidos sin algo que mirar.
- **En presentaciones, imágenes de verdad:** la mayoría de las láminas lleva una foto, una captura, un ícono grande del tema o una ilustración. Los íconos genéricos de trazo son el último recurso.
- Busca primero en la carpeta del proyecto (íconos, capturas, logos) y úsalos grandes, no como adorno chico.
- Cada ítem de una fila de tarjetas o de una lista lleva su imagen o ilustración. Si no hay, dibuja un ícono de línea grande en SVG (`<symbol>` en el sprite de la plantilla) que muestre la idea.
- **Si el contenido fue dado por el usuario,** el visual solo dibuja lo que el texto dice. "Más visuales" no autoriza a inventar.

Las plantillas traen estos componentes (catálogo completo en `componentes.md`):

| Componente | Sirve para |
|---|---|
| Tarjetas de cifras (`.kpis`) | las 3 o 4 cifras que resumen todo, arriba |
| Gráfico de líneas o barras (`figure.fg`) | tendencias y comparaciones; con anotación directa en el gráfico |
| Pictograma "N de cada 10" (`.waffle`) | proporciones que se entienden de un vistazo |
| Antes y después (`.ba`) | el efecto de una decisión |
| Lista con íconos (`.ilist`) | 3 a 5 puntos concretos con su cifra |
| Imagen real (`figure.img`) | lo físico, un lugar, una pantalla, una persona |
| Tarjetas de opciones, pasos y preguntas (`.cards`) | decisiones, planes y dudas |
| Simulador (`.sim`) | cuando el lector tiene que elegir un número y ver qué pasa |
| Fórmula explicada (`.fx`) | cuando la cuenta importa; siempre con qué es cada símbolo |

Los gráficos y simuladores van **sin caja**: rótulo sobre una línea, el gráfico suelto, la lectura abajo.

## Tabla de decisión

| La idea es… | Usa | Evita |
|---|---|---|
| un número clave | número grande + comparación ("+12 % vs. 2025") | gráfico de una barra |
| comparar pocas cantidades | barras horizontales ordenadas | torta con más de 3 partes, 3D |
| evolución en el tiempo | línea (o barras si son pocos periodos) | áreas apiladas difíciles de leer |
| partes de un todo | barra apilada al 100 % o un número ("3 de cada 4") | torta con muchas porciones |
| un proceso o pasos | fila de pasos numerados, o diagrama de flujo simple | diagramas con flechas en todas direcciones |
| un sistema (piezas que se conectan) | diagrama de cajas con pocas conexiones, agrupado por capas | mostrar todo a la vez; mejor por partes |
| una jerarquía | árbol o lista con sangría | red de nodos |
| un equipo u organigrama | solo la relación que dice la fuente; **estar arriba afirma jefatura**, si no la hay, en fila | dibujar jefaturas deducidas |
| cómo funciona un sistema | la página a un lado y el flujo de datos al otro, por pasos; conceptos generales | nombres de tablas e internos |
| una cuenta o fórmula | fórmula + qué significa cada letra + ejemplo (ver "Fórmulas") | fórmula sola |
| comparar opciones | tabla con la recomendada destacada | párrafos paralelos |
| algo físico, un lugar, una pantalla | foto, captura o mapa real (Leaflet, ver `librerias.md`) | ilustraciones genéricas |
| un mecanismo difícil de imaginar | figura interactiva o animada (ver "Figuras interactivas") | texto largo |
| un concepto abstracto | analogía + ícono o ilustración simple | una figura compleja que hay que descifrar |
| una cita o frase clave | frase grande sola en la lámina | adornos |

Reglas para cualquier visual:

- **Título-afirmación arriba:** dice qué mirar ("Las ventas se duplicaron en marzo"), no qué es ("Ventas por mes").
- **Destaca lo que importa:** la barra, línea o caja clave en el color de acento; el resto en gris.
- **Rotula directo** sobre los datos en vez de usar leyendas aparte.
- **Una idea por visual.** Si dice dos cosas, son dos visuales.
- **Fuente y fecha** de los datos debajo, en pequeño.
- **Prueba de 5 segundos:** míralo 5 segundos. Si no sabes qué dice, simplifícalo.

## Gráficos

Si tu entorno tiene una skill de gráficos (`entorno.md`), úsala para las reglas de cada tipo; la paleta sigue siendo la de `diseno.md`: un solo acento. Para dibujarlos: componentes de la plantilla o SVG a mano si son simples; **Observable Plot** si el gráfico cuenta una idea anotada; **ECharts** si el lector debe explorarlo. Ver `librerias.md`.

## Diagramas

- Si tu entorno tiene una skill de diagramas (`entorno.md`), úsala.
- Si no, **D2** convertido con `scripts/diagrama.py` (liviano, sigue el tema), Mermaid (rápido de escribir) o SVG inline. Para un boceto, D2 `--a-mano` o rough.js. Ver `librerias.md`. Pocas cajas (máximo 7 a 9 por vista), flujo en una sola dirección (izquierda→derecha o arriba→abajo) y etiquetas cortas.
- **Flujo con más de 6 nodos o con carriles por rol:** D2 con `scripts/diagrama.py`, nunca un enrutador a mano (ahí salen las flechas encimadas). **Valida antes de mostrar:** cada nodo tiene entrada y salida, salvo inicio y fin, y el orden tiene lógica. Una tabla de nodos y aristas lo deja claro.
- **Sistema grande → por partes.** Funcionó muy bien en decks reales: primero el mapa completo tal cual es, después el mismo mapa simplificado y luego cada parte por separado, volviendo al mapa con esa parte resaltada. Las piezas que se repiten entre láminas mantienen su posición, para que el ojo las siga.

## Imágenes

Los documentos sin imágenes se sienten planos. Busca, en este orden:

1. **Del proyecto:** capturas, fotos, logos, íconos que ya existan en la carpeta.
2. **Capturas reales:** de la app, la web o el sistema del que se habla. Si la app es accesible, captúrala: un esquema no la reemplaza (reglas abajo).
3. **Bancos con licencia libre:** Wikimedia Commons, Unsplash, Pexels, o wikis del tema (anota la licencia y el autor en el pie).
4. **Íconos:** un solo set por documento (Material Symbols, Lucide o Tabler), SVG inline, en el color del texto o del acento.
5. **Ilustración SVG simple** hecha por ti: formas planas y pocas, al servicio de la idea.

Incrusta siempre las imágenes en el archivo (`scripts/empaquetar.py`); nunca enlaces imágenes de sitios externos. Comprime las fotos interiores a menos de ~300 KB; ancho máximo ~1600 px, salvo la portada.

**Portada:** foto de resolución igual o mayor al lienzo (1920×1080). Nunca un cuadro de video si hay otra: sale con moiré y borroso.

**Capturas:**

- Confirma antes cuál es la URL o rama más reciente.
- Fieles a la pantalla: espera a que carguen imágenes y fuentes, con el tema real de la app, sin sesión de prueba a la vista. Compara cada una con la app; en un caso real, una captura salió con fondo negro y la pantalla era azul.
- Si hay duda, dilo en la entrega.

## Fórmulas

Solo donde hagan falta, y siempre **fórmula + qué significa cada letra en palabras + ejemplo con números**. Con KaTeX (`librerias.md`) o `.fx`. El cálculo largo va al anexo.

## Figuras interactivas

Una figura interactiva o isométrica muestra un objeto cuyo funcionamiento *es* el concepto. Bien usada, aporta mucho. Mal usada, sorprende al principio pero hace más difícil entender la idea. (Skills para hacerlas en este entorno: `entorno.md`.)

**Úsala solo si se cumplen las cuatro:**

1. **Hay un mecanismo:** algo que se mueve, fluye, se llena, se corta o cambia de estado. Una lista o una comparación no son mecanismos.
2. **El objeto se reconoce al instante** y su funcionamiento corresponde uno a uno con el concepto (un mapa que se corta en piezas, una prensa que comprime). Si hay que explicar el objeto antes de explicar la idea, falla.
3. **El lector entiende más rápido con la figura** que con un diagrama de 4 cajas o un gráfico. Compáralos mentalmente; si empatan, gana lo simple.
4. **Cabe en el esfuerzo:** tamaño Figure (una idea, un mecanismo). Un documento lleva como máximo 1 o 2 figuras así.

**No la uses para:** números o comparaciones (usa gráficos), listas de opciones, cálculos, "darle vida" a una lámina, o reemplazar una explicación que faltó.

Si la usas: la figura va **después** de la frase que dice qué muestra, con un pie que explique en una línea qué mirar y qué significa. Los controles (botones de pasos, arrastrar) deben ser evidentes. Debe seguir entendiéndose quieta, en PDF y en celular.

## Animación

**Las presentaciones van siempre animadas.** El nivel se decide en el brief: **sobrio** (lo que la plantilla ya hace) o **wow** (líneas que se dibujan, anillo por tramos, piezas que viajan, cámara sobre un diagrama; pasos solo donde ayudan y sin saltos visibles). Patrones ya aprobados que conviene repetir: líneas animadas, tarjetas con imagen, flujos que se construyen. La plantilla del deck ya lo hace sola al entrar cada lámina: los elementos suben en cascada, las líneas de los gráficos se dibujan, las barras crecen, los pictogramas aparecen uno a uno, los anillos se llenan, las cifras cuentan desde cero, los flujos avanzan, el cuello de botella pulsa y las imágenes se acercan despacio. Tú suma:

- `data-step` para construir una explicación en pasos; al exponer, va por defecto (`html-deck.md`).
- `data-k` para que una pieza viaje de una lámina a la siguiente (por ejemplo, el título o una cifra).
- Visuales animables en vez de texto: flujo (`.flow`), línea de tiempo (`.tline`), anillo (`.donut`), barras, pictograma, gráfico de líneas.
- Narración, si corresponde: la voz dispara los pasos y los resaltados (`html-deck.md`).

Reglas: la animación muestra algo (un cambio, un orden, una causa), nunca retrasa la lectura más de ~1,5 s por lámina; siempre se respeta `prefers-reduced-motion`, y con `?estatico` (capturas y PDF) todo queda quieto y completo.

En el informe, la animación es mínima: el contenido se lee, no se presenta.

## Videos de una página

Para mostrar cómo se usa algo (abrir un menú, filtrar, arrastrar, recorrer un mapa), un video corto dice más que tres capturas.

**Nunca simules un video con capturas y zoom CSS:** se nota y hay que rehacerlo. Si no hay cómo grabar, usa una captura fija y dilo en la entrega.

1. **Confirma que es la URL más reciente,** y anótala.
2. **Escribe el guion del video** antes de grabar: acciones, datos y resultado final, 5 a 30 s, un video por idea. Muéstralo si el video es importante.
3. **Graba.** `scripts/grabar.mjs` (`scripts.md`) o la vía de tu entorno (`entorno.md`, "Grabar videos").
4. **Míralo antes de incrustarlo** y repítelo si algo salió mal.
5. **En el HTML,** el video va donde iría la imagen: `<video data-video="RUTA.mp4" aria-label="qué se ve"></video>`. Luego `scripts/video.py informe.html` lo incrusta (muted, autoplay, loop).

**Mostrar el hacer.** El video muestra el uso completo con complejidad real, no solo el resultado. Con datos reales, y un final vistoso.

**Ritmo.** Quien expone suele hablar encima: cada acción y su resultado se ven con calma.

- Recorta solo las pausas largas (a ~0,6–1 s) y deja ~1,5–2 s sobre cada resultado.
- No aceleres las acciones ni la escritura: "más rápido" significa menos pausas, no pasos acelerados.
- **Corta en quietud:** cuando la pantalla queda quieta, antes de que el puntero se mueva a lo siguiente.

**Datos de prueba y dejar limpio.** Si el video crea algo en un sistema real, usa datos o cuenta de prueba, y bórralo después. Revisa que no quede nada a la vista.

**Limpieza.** Ninguna grabación que no esté en la presentación queda guardada.
