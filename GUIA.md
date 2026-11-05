# Guía de designdocs

Instalación paso a paso, requisitos y detalles. Lo esencial está en el [README](README.md).

El resultado es un solo archivo HTML: lo abres en cualquier navegador, funciona sin internet y se puede enviar por correo. Si lo necesitas, se exporta a PDF o PowerPoint.

## Qué hace

- **Parte por el mensaje, no por el diseño:** pregunta para quién es, propone un guion y deja la conclusión primero. Los títulos dicen algo ("las ventas crecieron 12 %", no "Ventas").
- **Se adapta al lector:** corto o largo; simple, ejecutivo o técnico.
- **Elige el visual de cada idea:** gráfico, diagrama, línea de tiempo o imagen, solo cuando ayuda a entender.
- **Aplica la marca DP** si el pedido es de DP o dice "marca DP": logos, colores, tipografías y plantillas. Si no, usa el estilo que pidas, el de tu proyecto o uno propio, sobrio.
- **Presentaciones con panel de opciones:** barra con miniaturas, controles, tema claro u oscuro y narrador con voz (apagado hasta que lo enciendas).
- **Se revisa sola** si tu equipo tiene lo necesario: saca capturas en escritorio y celular y avisa de textos que se salen o letra muy chica.

## Tres ejemplos de pedidos

No hay comandos que aprender. Se pide como a una persona:

> Arma una presentación con marca DP de 8 láminas para proponerle al cliente la segunda etapa del proyecto. Te paso las notas de la reunión. Tienen que aprobar el plazo.

> Hazme un informe corto con esta planilla de avance, para gerencia. No conocen el detalle; quieren saber qué está atrasado y qué decidir.

> Quiero entender estos gastos de la casa. Hazme un resumen simple de una página, con lo que podría recortar.

## Instalación

Elige dónde usas tu agente. Solo necesitas uno de estos caminos.

### Claude en el chat (web o app de escritorio, sin terminal)

1. Descarga `designdocs-chat.zip`. No lo descomprimas.
2. En Claude, abre **Personalizar > Skills** (en inglés: Customize > Skills).
3. Elige subir una skill y selecciona el ZIP.
4. Activa la skill y pruébala: "hazme un informe corto de…".

**Si tu organización tiene plan Team o Enterprise,** quien administra la cuenta puede subirla una vez para todos (Configuración de la organización > Plugins & skills) o compartirla desde Skills. Hay que tener activa la ejecución de código. Esto último no se verificó para el plan de DP: confírmalo con quien administre la cuenta.

**Esta versión es más liviana:** no exporta a PowerPoint. En el chat también puede no haber navegador para la revisión automática ni internet para bajar lo que falte; si es así, el agente te dirá "no revisado". Para todo lo demás, usa la versión completa con Claude Code.

### Claude Code

**Con git (lo más simple si lo tienes):**

```bash
git clone https://github.com/Inverosimil/designdocs.git ~/.claude/skills/designdocs
```

Para actualizarla más adelante: `git -C ~/.claude/skills/designdocs pull`.

**Sin git:** descarga el ZIP del repositorio (botón verde **Code > Download ZIP**) o `designdocs.zip`, y descomprímelo. Te queda una carpeta; si se llama `designdocs-main`, renómbrala a `designdocs`. Muévela a la carpeta de skills:

**En Mac:**

1. En Finder, presiona `Cmd + Mayús + G` y escribe `~/.claude/skills`. Si no existe, abre la app Terminal y corre `mkdir -p ~/.claude/skills`.
2. Arrastra ahí la carpeta `designdocs`.

**En Windows:**

1. En el Explorador de archivos, escribe `%USERPROFILE%\.claude\skills` en la barra de direcciones. Si no existe, crea esas carpetas: `.claude` y, dentro, `skills`.
2. Copia ahí la carpeta `designdocs`.

Abre una conversación nueva. Se activa sola cuando pides un informe o una presentación; si quieres forzarla, di "usa la skill designdocs".

### Codex

Copia la carpeta `designdocs` a `~/.agents/skills/` (en Windows, `%USERPROFILE%\.agents\skills\`) y abre una sesión nueva. Si tu versión usa otra carpeta, pídele a Codex que lea `SKILL.md`. El archivo `AGENTS.md` trae las instrucciones para otros agentes.

## Qué instalar para cada función

Para **ver** los informes solo necesitas un navegador. Para que el agente haga lo demás en tu equipo:

| Quieres | Necesitas |
|---|---|
| Revisión automática, PDF y PPTX | Node 22 o más nuevo, y Chrome o Edge |
| Empaquetar todo en un archivo y narración con voz | Python 3 |
| Saber la duración de los videos o procesarlos (opcional) | ffmpeg |
| Diagramas D2 (opcional) | d2 |

Para no adivinar, pídele al agente que corra el revisor del equipo:

```
node scripts/doctor.mjs
```

Dice qué tienes, qué falta y para qué sirve cada cosa. Si te falta algo, la skill sigue con lo que haya y te avisa qué no pudo hacer.

## Cómo comentar un informe

1. Abre el informe o la presentación en el navegador.
2. Presiona la tecla **C** para entrar al modo comentar.
3. Marca lo que quieres cambiar y escribe tu comentario. Repite las veces que necesites.
4. Exporta los comentarios y pégalos en el chat.

También puedes decirlo con tus palabras en el chat: "en la lámina 3, cambia el título por…".

## Cómo exportar

Pídeselo al agente:

- **PDF:** "déjalo también en PDF". También puedes hacerlo tú desde el navegador: Imprimir > Guardar como PDF.
- **PowerPoint:** "expórtalo a PPTX". Solo con la versión completa. El texto queda editable; los gráficos quedan como imagen. Revísalo en PowerPoint antes de enviarlo.

## Skills que combinan bien

Son sugerencias; esta skill funciona sin ellas. Se encuentran en el repositorio oficial de skills de Anthropic (`github.com/anthropics/skills`):

- **frontend-design:** una segunda mirada al diseño de una página.
- **skill-creator:** para crear tus propias skills o medir si una mejora de verdad sirve.

## Para tener en cuenta

- Trátala como cualquier programa que instalas: el agente ejecuta sus scripts en tu equipo.
- Los archivos que genera llevan los datos que le diste. Revisa antes de compartir un informe fuera de DP.
- La marca DP es de uso de DP; las licencias de lo que trae la skill están en `LICENCIAS.md`.
- **El kit de marca no trae fotos:** las láminas de ejemplo usan una textura donde iría una foto. Pásale al agente las tuyas, con permiso para usarlas.
- Para actualizarla, reemplaza la carpeta o vuelve a subir el ZIP.
