#!/usr/bin/env python3
"""Turn the static mirror into Backbone AI project views.

- copies every asset to <root>/assets/  (served at /projects/<slug>/assets/...)
- writes the canonical pages to <root>/production/views/*.blade.php with
  asset URLs pointing at that public prefix and page links root-relative.
"""
import os, re, shutil, posixpath, urllib.parse

ROOT = "/Users/nicolasbarrios/Documents/Desarrollo/viraal-autos"
SITE = os.path.join(ROOT, "site")
ASSETS_OUT = os.path.join(ROOT, "assets")
VIEWS_OUT = os.path.join(ROOT, "production", "views")
SLUG = "viraal-autos"
PREFIX = f"/projects/{SLUG}/assets/"

# page path in mirror -> view file
PAGES = {
    "index.html": "home.blade.php",
    "buscador/index.html": "buscador.blade.php",
    "quienes-somos/index.html": "quienes-somos.blade.php",
    "blog/index.html": "blog.blade.php",
    "blog/-conviene-comprar-o-financiar-tu-auto-en-2025-/index__id=29&category_id=7.html": "blog-post-financiar.blade.php",
    "blog/tendencias-que-dominaran-el-mercado-de-autos-usados-en-mexico/index__id=30&category_id=7.html": "blog-post-tendencias.blade.php",
    "servicios/index.html": "servicios.blade.php",
    "servicios/20/index.html": "servicios-detalle.blade.php",
    "vehiculo/index.html": "vehiculo-listado.blade.php",
    "vehiculo/20/index.html": "vehiculo-detalle.blade.php",
    "reservacion/index.html": "reservacion.blade.php",
    "reservacion/20/index.html": "reservacion-detalle.blade.php",
    "contacto/index.html": "contacto.blade.php",
    "my-business/auth/inicio-sesion/index.html": "inicio-sesion.blade.php",
    "aviso-de-privacidad/index.html": "legal-aviso-de-privacidad.blade.php",
    "aviso-legal-y-datos-del-proveedor/index.html": "legal-aviso-legal.blade.php",
    "terminos-y-condiciones/index.html": "legal-terminos-y-condiciones.blade.php",
}

ASSET_EXT = re.compile(r"\.(css|js|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|json|webmanifest|pdf)$", re.I)
URL_ATTR = re.compile(r"""(?P<pre>\b(?:href|src|data-src|poster|action)\s*=\s*)(?P<q>["'])(?P<url>[^"']+)(?P=q)""", re.I)
SRCSET = re.compile(r"""(\bsrcset\s*=\s*)(["'])([^"']+)(["'])""", re.I)
CSS_URL = re.compile(r"""url\(\s*(['"]?)([^'")]+)\1\s*\)""", re.I)


def copy_assets():
    if os.path.isdir(ASSETS_OUT):
        shutil.rmtree(ASSETS_OUT)
    n = 0
    for dirpath, _, files in os.walk(SITE):
        for fn in files:
            if fn.endswith(".html"):
                continue
            src = os.path.join(dirpath, fn)
            rel = os.path.relpath(src, SITE)
            dst = os.path.join(ASSETS_OUT, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            n += 1
    return n


def resolve(url, page_dir):
    """Return site-root-relative path for a mirror URL, or None if external."""
    if url.startswith(("http://", "https://", "//", "data:", "mailto:", "tel:", "javascript:", "#")):
        return None
    base = "/" + page_dir + "/" if page_dir else "/"
    joined = posixpath.normpath(posixpath.join(base, url.split("#")[0].split("?")[0]))
    return joined.lstrip("/")


def to_public(url, page_dir):
    root_rel = resolve(url, page_dir)
    if root_rel is None:
        return None
    if ASSET_EXT.search(root_rel):
        frag = ""
        if "?" in url:
            frag = "?" + url.split("?", 1)[1]
        return PREFIX + urllib.parse.quote(urllib.parse.unquote(root_rel)) + frag
    # page link -> root-relative canonical URL.
    # The crawler flattened query strings into "index__brands=4&model=18.html";
    # undo that so links keep the real ?query the site uses.
    root_rel = urllib.parse.unquote(root_rel)
    m = re.search(r"index__(.+)\.html$", root_rel)
    if m:
        return "/" + root_rel[: m.start()] + "?" + m.group(1)
    if root_rel.endswith("index.html"):
        root_rel = root_rel[: -len("index.html")]
    return "/" + root_rel


def convert(html, page_dir):
    def sub_attr(m):
        new = to_public(m.group("url").strip(), page_dir)
        if new is None:
            return m.group(0)
        return f'{m.group("pre")}{m.group("q")}{new}{m.group("q")}'

    html = URL_ATTR.sub(sub_attr, html)

    def sub_srcset(m):
        out = []
        for cand in m.group(3).split(","):
            cand = cand.strip()
            if not cand:
                continue
            bits = cand.split()
            new = to_public(bits[0], page_dir)
            if new:
                bits[0] = new
            out.append(" ".join(bits))
        return f'{m.group(1)}{m.group(2)}{", ".join(out)}{m.group(4)}'

    html = SRCSET.sub(sub_srcset, html)

    def sub_css(m):
        u = m.group(2).strip()
        new = to_public(u, page_dir)
        if new is None or not ASSET_EXT.search(resolve(u, page_dir) or ""):
            return m.group(0)
        return f'url("{new}")'

    html = CSS_URL.sub(sub_css, html)
    return html


def main():
    n_assets = copy_assets()
    if os.path.isdir(VIEWS_OUT):
        shutil.rmtree(VIEWS_OUT)
    os.makedirs(VIEWS_OUT, exist_ok=True)

    for page, view in PAGES.items():
        src = os.path.join(SITE, page)
        if not os.path.exists(src):
            print("MISSING", page)
            continue
        with open(src, encoding="utf-8") as f:
            html = f.read()
        page_dir = posixpath.dirname(page)
        out = convert(html, page_dir)
        dst = os.path.join(VIEWS_OUT, view)
        with open(dst, "w", encoding="utf-8") as f:
            f.write(out)
        print(f"VIEW {view:42s} <- {page}")

    print(f"\nassets copiados: {n_assets}   views: {len(PAGES)}")


if __name__ == "__main__":
    main()
