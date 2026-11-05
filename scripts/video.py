#!/usr/bin/env python3
"""Mete cualquier MP4 dentro del HTML.

    python3 video.py informe.html [salida.html] [--conservar]

En el HTML, cada video va como marcador con la ruta del MP4 (por ejemplo, el que hizo grabar.mjs):

    <video data-video="grabaciones/menu.mp4" aria-label="Abrir el menú y elegir un mapa"></video>

El script lo cambia por el video incrustado (data URI), con muted, autoplay, loop y playsinline
si no los tiene. Sin salida, reescribe el mismo HTML. No borra el MP4 original.
"""
import base64, os, re, sys

args = [a for a in sys.argv[1:] if not a.startswith('--')]
if not args:
    sys.exit(__doc__)
SRC = os.path.abspath(args[0])
OUT = os.path.abspath(args[1]) if len(args) > 1 else SRC
CONSERVAR = '--conservar' in sys.argv   # sin efecto si no hay temporales que limpiar
BASE = os.path.dirname(SRC)

html = open(SRC, encoding='utf-8').read()
usados = []


def ruta(valor):
    p = os.path.expanduser(valor)
    return p if os.path.isabs(p) else os.path.join(BASE, p)


def incrustar(m):
    etiqueta = m.group(0)
    archivo = ruta(m.group(2))
    if not os.path.isfile(archivo):
        sys.exit(f'No existe el video: {archivo}')
    datos = base64.b64encode(open(archivo, 'rb').read()).decode()
    etiqueta = etiqueta.replace(m.group(1), f'src="data:video/mp4;base64,{datos}"', 1)
    for atributo in ('muted', 'autoplay', 'loop', 'playsinline'):
        if not re.search(rf'\s{atributo}(\s|=|>)', etiqueta):
            etiqueta = etiqueta.replace('<video', f'<video {atributo}', 1)
    usados.append(archivo)
    return etiqueta


html = re.sub(r'<video\b[^>]*?(data-video="([^"]+)")[^>]*>', incrustar, html)
if not usados:
    sys.exit('No hay <video data-video="…"> en el HTML.')
open(OUT, 'w', encoding='utf-8').write(html)




for archivo in usados:
    tam = os.path.getsize(archivo) / 1e6
    print(f'Incrustado: {archivo} ({tam:.1f} MB)')
print(f'Listo: {OUT}')
