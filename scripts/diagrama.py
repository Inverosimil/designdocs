#!/usr/bin/env python3
"""Convierte un diagrama D2 (texto) en un SVG que usa los colores del documento.

Uso:  python3 scripts/diagrama.py flujo.d2 flujo.svg [--a-mano]
      python3 scripts/diagrama.py flujo.d2 --validar     (revisa conexiones, sin dibujar ni necesitar d2)

- Necesita `d2` (ver INSTALAR abajo o node scripts/doctor.mjs). El SVG no lleva JavaScript: pesa poco y funciona sin internet.
- Los colores del tema de D2 se cambian por las variables de la plantilla (--fg, --line, --accent…),
  así el diagrama sigue al tema claro/oscuro y al color de acento. Pégalo dentro del HTML (inline):
  un <img> no hereda las variables.
- Una pieza con `class: clave` va en el color de acento (definir en el .d2:
  classes: { clave: { style.stroke-width: 3 } }).
- --a-mano: trazo dibujado a mano (modo sketch de D2), para bocetos o explicaciones informales.
- --validar: todo nodo tiene entrada y salida, salvo el inicio y el fin (los con id o etiqueta inicio/fin).

Carriles por rol (un contenedor por persona; las flechas cruzan de uno a otro):

    direction: right
    cliente: Cliente { pide: Hace el pedido }
    tienda: Tienda { prepara: Prepara; entrega: Entrega }
    inicio -> cliente.pide -> tienda.prepara -> tienda.entrega -> fin
"""
import argparse, re, shutil, subprocess, sys, tempfile, pathlib

INSTALAR = {'darwin': 'brew install d2', 'win32': 'winget install terrastruct.d2'}.get(sys.platform, 'curl -fsSL https://d2lang.com/install.sh | sh -s --')

COLORES = {
    'N1': 'var(--fg)', 'N2': 'var(--soft)', 'N3': 'var(--soft)', 'N4': 'var(--faint)', 'N5': 'var(--line)', 'N6': 'var(--muted)', 'N7': 'transparent',
    'B1': 'var(--off)', 'B2': 'var(--off)', 'B3': 'var(--faint)', 'B4': 'var(--line)', 'B5': 'var(--muted)', 'B6': 'var(--bg)',
    'AA2': 'var(--accent)', 'AA4': 'var(--accent)', 'AA5': 'var(--muted)', 'AB4': 'var(--accent)', 'AB5': 'var(--muted)',
}
EXTRA = """
.d2 text{font-family:var(--sans,Inter,sans-serif)!important}
.d2 .connection{stroke:var(--faint)}
.d2 .connection.fill-B1,.d2 path.fill-B1{fill:var(--faint)}
.d2 .clave .shape>*{stroke:var(--accent)!important}
.d2 .clave text{fill:var(--accent)!important}
"""


def validar(ruta):
    """Lee las flechas del .d2 y lista los nodos sin entrada o sin salida. Devuelve la cantidad de problemas."""
    texto = pathlib.Path(ruta).read_text(encoding='utf-8')
    entran, salen, pila = set(), set(), []
    for linea in re.split(r'[\n;]', re.sub(r'#.*', '', texto)):
        l = linea.strip()
        if l.endswith('{') and '->' not in l:
            pila.append(l[:-1].split(':')[0].strip()); continue
        if l == '}':
            if pila: pila.pop()
            continue
        if '->' not in l and '<-' not in l: continue
        l = re.sub(r'\{.*$', '', l).split(':')[0]
        partes = re.split(r'(<?->|<-)', l)
        for k in range(1, len(partes) - 1, 2):
            a, b = ['.'.join(pila + [x.strip()]) for x in (partes[k - 1], partes[k + 1])]
            if partes[k] == '<-': a, b = b, a
            salen.add(a); entran.add(b)
            if partes[k] == '<->': salen.add(b); entran.add(a)
    extremo = lambda n: re.search(r'(^|\.)(inicio|start|fin|end)$', n, re.I)
    malos = [f'{n}: sin entrada' for n in sorted(salen - entran) if not extremo(n)] + [f'{n}: sin salida' for n in sorted(entran - salen) if not extremo(n)]
    print(f'{len(entran | salen)} nodos conectados.' + (' Todos con entrada y salida.' if not malos else ''))
    if malos: print('Revisar:\n- ' + '\n- '.join(malos))
    return len(malos)


def main():
    ap = argparse.ArgumentParser(description='D2 → SVG con los colores de la plantilla')
    ap.add_argument('entrada'); ap.add_argument('salida', nargs='?')
    ap.add_argument('--a-mano', action='store_true', help='trazo a mano (sketch)')
    ap.add_argument('--validar', action='store_true', help='todo nodo con entrada y salida, salvo inicio y fin')
    a = ap.parse_args()
    if a.validar:
        sys.exit(1 if validar(a.entrada) else 0)
    if not a.salida:
        ap.error('falta el archivo de salida')
    if not shutil.which('d2'):
        sys.exit(f'Falta d2. Instálalo con: {INSTALAR}')
    with tempfile.TemporaryDirectory() as tmp:
        out = pathlib.Path(tmp) / 'd.svg'
        cmd = ['d2', '--theme', '0', '--pad', '8', a.entrada, str(out)] + (['--sketch'] if a.a_mano else [])
        r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        if r.returncode:
            sys.exit(r.stderr.strip() or f'd2 falló. Para instalarlo: {INSTALAR}')
        svg = out.read_text(encoding='utf-8')
    for k, v in COLORES.items():
        svg = re.sub(r'\.(fill|stroke|color)-' + k + r'\{(fill|stroke|color):#[0-9A-Fa-f]{3,8};\}', lambda m: f'.{m.group(1)}-{k}{{{m.group(2)}:{v};}}', svg)
    svg = re.sub(r'^<\?xml[^>]*\?>\s*', '', svg)   # para pegarlo dentro del HTML
    # Sin ancho ni alto fijos: el SVG se adapta a su contenedor
    svg = re.sub(r'(<svg[^>]*?) width="[^"]*" height="[^"]*"', r'\1', svg, count=1)
    svg = svg.replace('<svg ', '<svg class="d2-diagrama" ', 1)
    svg = svg.replace('</style>', EXTRA + '</style>', 1)
    # d2 pone class="d2-…" en el svg interno: se marca para las reglas de arriba
    svg = re.sub(r'class="(d2-\d+) d2-svg"', r'class="\1 d2-svg d2"', svg)
    pathlib.Path(a.salida).write_text(svg, encoding='utf-8')
    print(f'{a.salida}: {len(svg) // 1024} KB')


if __name__ == '__main__':
    main()
