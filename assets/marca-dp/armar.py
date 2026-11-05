#!/usr/bin/env python3
"""Regenera assets/deck-dp.html y assets/informe-dp.html desde las plantillas vigentes.

    python3 assets/marca-dp/armar.py

Toma deck.html e informe.html tal como estén (motor, narrador, panel), cambia el head y deja
las láminas de marca-dp/laminas-deck.html. Las plantillas no se tocan.
"""
import pathlib, re

KIT = pathlib.Path(__file__).resolve().parent
A = KIT.parent
FUENTES = re.compile(r'[ \t]*<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?')


def simbolos():
    out = []
    for f in sorted((KIT / 'iconos').glob('*.svg')):
        caminos = re.findall(r'<path d="([^"]+)"', f.read_text())
        out.append(f'  <symbol id="d-{f.stem}" viewBox="0 -960 960 960">' + ''.join(f'<path d="{d}"/>' for d in caminos) + '</symbol>')
    return '\n'.join(out)


def uno(s, viejo, nuevo):
    if viejo not in s:
        raise SystemExit(f'armar.py: la plantilla cambió, no encontré: {viejo[:70]}')
    return s.replace(viejo, nuevo, 1)


def deck():
    s = (A / 'deck.html').read_text()
    s = re.sub(r'<html lang="es"[^>]*>', '<html lang="es" data-theme="light">', s, count=1)
    s = re.sub(r'<title>.*?</title>', '<title>Deck DP de ejemplo</title>', s, count=1)
    s = FUENTES.sub('', s)
    s = uno(s, '</head>', '<link rel="stylesheet" href="marca-dp/dp.css">\n</head>')
    # Íconos de la marca: se suman al sprite de la plantilla
    s, n = re.subn(r'</svg>(\s*<div class="viewport")', lambda m: simbolos() + '\n</svg>' + m.group(1), s, count=1)
    if not n:
        raise SystemExit('armar.py: no encontré el sprite de íconos antes de .viewport')
    # Láminas: todo lo que hay dentro de .stage
    laminas = (KIT / 'laminas-deck.html').read_text()
    s, n = re.subn(r'<div class="stage" id="stage"[^>]*>.*?</div></div>\s*(<div class="ui">)',
                   lambda m: '<div class="stage" id="stage" data-title="Proyecto de ejemplo" data-numeros data-logo="marca-dp/logos/Icono_DP_Azul.svg" data-logo-oscuro="marca-dp/logos/Icono_DP_Blanco.svg" data-logo-pos="sup-der" data-logo-alto="52">\n\n' + laminas + '\n</div></div>\n' + m.group(1),
                   s, count=1, flags=re.S)
    if not n:
        raise SystemExit('armar.py: no encontré .stage en deck.html')
    s = uno(s, '<script>', '<script src="marca-dp/dp.js" defer></script>\n<script>')
    (A / 'deck-dp.html').write_text(s)


def informe():
    s = (A / 'informe.html').read_text()
    s = re.sub(r'<html lang="es"[^>]*>', '<html lang="es" data-theme="light">', s, count=1)
    s = re.sub(r'<title>.*?</title>', '<title>Informe DP de ejemplo</title>', s, count=1)
    s = FUENTES.sub('', s)
    s = uno(s, '</head>', '<link rel="stylesheet" href="marca-dp/dp-informe.css">\n</head>')
    s = re.sub(r'(<aside class="rail" id="rail">\s*<div>)', r'\1\n      <img class="dp-logo" src="marca-dp/logos/Logo_DP_Color_Horizontal.png" alt="Dinámica Plataforma">', s, count=1)
    s = re.sub(r'(<main>)', r'\1\n    <img class="dp-banda" src="marca-dp/texturas/Dp_textura01_1920.jpg" alt="">', s, count=1)
    s = re.sub(r'(\s*</main>)', r'\n    <div class="dp-pie"><span>Dinámica Plataforma</span><img src="marca-dp/logos/Icono_DP_Azul.svg" alt=""></div>\1', s, count=1)
    (A / 'informe-dp.html').write_text(s)


deck(); informe()
print('deck-dp.html e informe-dp.html regenerados')
