#!/usr/bin/env python3
"""Deja un HTML en un solo archivo, con todo incrustado.

    python3 empaquetar.py entrada.html salida.html [--remoto] [--ancho 1600]

- Incrusta como data URI las imágenes locales (<img src>, srcset no), los CSS (<link rel=stylesheet>),
  los JS (<script src>) y los url(...) de los CSS (fuentes, fondos).
- --remoto también descarga e incrusta lo que viene de internet (Google Fonts, CDN), para que
  el archivo funcione sin conexión. Sin --remoto, lo remoto queda como enlace.
- Si Pillow está instalado, achica las fotos (JPEG/PNG/WebP) a --ancho px como máximo.
"""
import base64, mimetypes, os, re, ssl, sys, urllib.error, urllib.request
from urllib.parse import unquote, urljoin, urlparse

args = [a for a in sys.argv[1:] if not a.startswith('--')]
flags = [a for a in sys.argv[1:] if a.startswith('--')]
if len(args) < 2:
    sys.exit(__doc__)
SRC, OUT = os.path.abspath(args[0]), os.path.abspath(args[1])
REMOTO = '--remoto' in flags
ANCHO = 1600
if '--ancho' in sys.argv:
    ANCHO = int(sys.argv[sys.argv.index('--ancho') + 1])
BASE = os.path.dirname(SRC)
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36'}

try:
    from PIL import Image
    import io
except ImportError:
    Image = None

stats = {'incrustados': 0, 'remotos': 0, 'faltan': []}


def is_remote(u):
    return urlparse(u).scheme in ('http', 'https') or u.startswith('//')


def fetch(ref, base):
    """Devuelve (bytes, mime, url_absoluta) o None."""
    if ref.startswith('data:') or ref.startswith('#') or not ref.strip():
        return None
    if is_remote(ref) or is_remote(base):
        url = ref if is_remote(ref) else urljoin(base, ref)
        if url.startswith('//'):
            url = 'https:' + url
        if not REMOTO:
            return None
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                data, mime = r.read(), r.headers.get_content_type()
            stats['remotos'] += 1
            return data, mime, url
        except Exception as e:
            motivo = str(e)
            if isinstance(e, ssl.SSLError) or isinstance(getattr(e, 'reason', None), ssl.SSLError) or 'CERTIFICATE' in motivo.upper():
                motivo = ('certificado SSL no verificado. En Mac corre "Install Certificates.command" de la carpeta de Python, '
                          'o instala certifi (pip install certifi); en una red con proxy pide el certificado a TI')
            stats['faltan'].append(f'{url} ({motivo})')
            return None
    path = os.path.normpath(os.path.join(base, unquote(ref.split('?')[0].split('#')[0])))   # mi%20foto.png es «mi foto.png»
    if not os.path.exists(path):
        stats['faltan'].append(path)
        return None
    with open(path, 'rb') as f:
        data = f.read()
    return data, mimetypes.guess_type(path)[0] or 'application/octet-stream', path


def shrink(data, mime):
    if not Image or mime not in ('image/jpeg', 'image/png', 'image/webp'):
        return data, mime
    try:
        im = Image.open(io.BytesIO(data))
        if im.width <= ANCHO and len(data) < 400_000:
            return data, mime
        im.thumbnail((ANCHO, ANCHO * 4))
        buf = io.BytesIO()
        if mime == 'image/png' and im.mode in ('RGBA', 'LA', 'P'):
            im.save(buf, 'PNG', optimize=True)
        else:
            im.convert('RGB').save(buf, 'JPEG', quality=80, optimize=True)
            mime = 'image/jpeg'
        return (buf.getvalue(), mime) if buf.tell() < len(data) else (data, mime)
    except Exception:
        return data, mime


def data_uri(data, mime):
    stats['incrustados'] += 1
    return f'data:{mime};base64,{base64.b64encode(data).decode()}'


def carpeta_de(ruta):
    """Los url(...) de un CSS se resuelven desde la carpeta del CSS (o desde su URL, si es remoto)."""
    return ruta if is_remote(ruta) else os.path.dirname(ruta)


def inline_css(css, base):
    # Google Fonts: deja solo los subconjuntos latinos (español); el resto infla el archivo
    css = re.sub(r'/\*\s*([a-z0-9\-\[\]\s]+?)\s*\*/\s*@font-face\s*\{[^}]*\}',
                 lambda m: m.group(0) if m.group(1) in ('latin', 'latin-ext') else '', css)

    def rep(m):
        ref = m.group(2).strip()
        got = fetch(ref, base)
        if not got:
            return m.group(0)
        data, mime, _ = got
        if mime in ('text/plain', 'application/octet-stream'):
            ext = os.path.splitext(urlparse(ref).path)[1].lower()
            mime = {'.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.svg': 'image/svg+xml'}.get(ext, mime)
        data, mime = shrink(data, mime)
        return f'url("{data_uri(data, mime)}")'
    css = re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', rep, css)

    def imp(m):
        got = fetch(m.group(1), base)
        return inline_css(got[0].decode('utf-8', 'replace'), carpeta_de(got[2])) if got else m.group(0)
    return re.sub(r'@import\s+(?:url\()?[\'"]?([^\'")\s;]+)[\'"]?\)?\s*;', imp, css)


html = open(SRC, encoding='utf-8').read()


def link_rep(m):
    tag = m.group(0)
    if not re.search(r'rel=["\']?stylesheet', tag):
        return '' if (REMOTO and 'preconnect' in tag) else tag
    href = re.search(r'href=["\']([^"\']+)["\']', tag)
    got = fetch(href.group(1), BASE) if href else None
    if not got:
        return tag
    return '<style>\n' + inline_css(got[0].decode('utf-8', 'replace'), carpeta_de(got[2])) + '\n</style>'


html = re.sub(r'<link\b[^>]*>', link_rep, html)


def script_rep(m):
    src = m.group(1)
    got = fetch(src, BASE)
    if not got:
        return m.group(0)
    code = got[0].decode('utf-8', 'replace').replace('</script', '<\\/script')
    attrs = re.sub(r'\s(src|integrity|crossorigin)=["\'][^"\']*["\']', '', m.group(0).split('>')[0])
    return attrs + '>' + code + '</script>'


html = re.sub(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>\s*</script>', script_rep, html)


def img_rep(m):
    if '…' in m.group(2) or '${' in m.group(2) or '{{' in m.group(2):   # plantillas dentro del código de una librería, no archivos
        return m.group(0)
    got = fetch(m.group(2), BASE)
    if not got:
        return m.group(0)
    data, mime = shrink(got[0], got[1])
    return m.group(1) + data_uri(data, mime) + m.group(3)


html = re.sub(r'(<(?:img|source|image|video)\b[^>]*?\s(?:src|href|poster)=["\'])([^"\']+)(["\'])', img_rep, html)
# Logo fijo del deck: lo dibuja un script desde estos atributos
html = re.sub(r'(\bdata-logo(?:-oscuro)?=["\'])([^"\']+)(["\'])', img_rep, html)
html = re.sub(r'(<style[^>]*>)([\s\S]*?)(</style>)', lambda m: m.group(1) + inline_css(m.group(2), BASE) + m.group(3), html)
html = re.sub(r'(style=")([^"]*url\([^"]*)(")', lambda m: m.group(1) + inline_css(m.group(2).replace('&quot;', "'"), BASE) + m.group(3), html)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)
size = os.path.getsize(OUT) / 1_048_576
print(f'{OUT}: {size:.1f} MB, {stats["incrustados"]} recursos incrustados; de ellos {stats["remotos"]} venían de internet y se descargaron e incrustaron, {len(stats["faltan"])} sin resolver.')
if stats['faltan']:
    print('No se pudieron incrustar:\n- ' + '\n- '.join(stats['faltan'][:20]))
if not REMOTO and re.search(r'(href|src)=["\']https?://', html):
    print('Aviso: quedan recursos de internet (fuentes o CDN). Usa --remoto para que funcione sin conexión.')
if size > 15:
    print('Aviso: pesa más de 15 MB; achica imágenes (--ancho 1200) o usa menos.')
