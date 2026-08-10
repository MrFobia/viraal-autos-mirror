#!/usr/bin/env python3
"""Turn the static mirror into Backbone AI project views.

- copies every asset to <root>/assets/  (served at /projects/<slug>/assets/...)
- writes every mirror page to <root>/production/views/*.blade.php with asset
  URLs pointing at that public prefix.

Internal page links need the platform's per-view preview URLs, which only exist
after the views are registered. So this runs in two passes:

  pass 1 (no id map)  -> links stay root-relative, views get registered
  pass 2 (with map)   -> links become /preview/<id>

`preview_ids.json` is the map {view file name: preview id}, scraped from the
Generated Views page between the two passes.
"""
import json, os, re, shutil, posixpath, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, "site")
ASSETS_OUT = os.path.join(ROOT, "assets")
VIEWS_OUT = os.path.join(ROOT, "production", "views")
IDMAP_FILE = os.path.join(ROOT, "preview_ids.json")
SLUG = "viraal-marketplace"
PREFIX = f"/projects/{SLUG}/assets/"

ASSET_EXT = re.compile(r"\.(css|js|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|json|webmanifest|pdf)$", re.I)
URL_ATTR = re.compile(r"""(?P<pre>\b(?:href|src|data-src|poster|action)\s*=\s*)(?P<q>["'])(?P<url>[^"']+)(?P=q)""", re.I)
SRCSET = re.compile(r"""(\bsrcset\s*=\s*)(["'])([^"']+)(["'])""", re.I)
CSS_URL = re.compile(r"""url\(\s*(['"]?)([^'")]+)\1\s*\)""", re.I)

# pretty names for the pages that are not just <path>/index.html
SPECIAL = {
    "index.html": "home",
    "blog/-conviene-comprar-o-financiar-tu-auto-en-2025-/index__id=29&category_id=7.html": "blog-conviene-comprar-o-financiar",
    "blog/tendencias-que-dominaran-el-mercado-de-autos-usados-en-mexico/index__id=30&category_id=7.html": "blog-tendencias-autos-usados",
    "my-business/auth/inicio-sesion/index.html": "inicio-sesion",
    "my-business/index.html": "my-business",
}


def view_name(page):
    """mirror page path -> view file base name (no extension)."""
    if page in SPECIAL:
        return SPECIAL[page]
    d = posixpath.dirname(page)
    base = posixpath.basename(page)
    m = re.match(r"index__(.+)\.html$", base)
    if m:
        qs = m.group(1).replace("&", "-").replace("=", "-")
        stem = f"{d}-{qs}" if d else qs
    else:
        stem = d or "index"
    return re.sub(r"[^A-Za-z0-9._-]", "-", stem.replace("/", "-")).strip("-").lower()


def discover_pages():
    pages = []
    for dirpath, _, files in os.walk(SITE):
        for fn in files:
            if not fn.endswith(".html"):
                continue
            pages.append(os.path.relpath(os.path.join(dirpath, fn), SITE).replace(os.sep, "/"))
    return sorted(pages)


def copy_assets():
    if os.path.isdir(ASSETS_OUT):
        shutil.rmtree(ASSETS_OUT)
    n = 0
    for dirpath, _, files in os.walk(SITE):
        for fn in files:
            if fn.endswith(".html"):
                continue
            src = os.path.join(dirpath, fn)
            dst = os.path.join(ASSETS_OUT, os.path.relpath(src, SITE))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            n += 1
    return n


def resolve(url, page_dir):
    """site-root-relative path for a mirror URL, or None if external/non-navigable."""
    if url.startswith(("http://", "https://", "//", "data:", "mailto:", "tel:", "javascript:", "#")):
        return None
    base = "/" + page_dir + "/" if page_dir else "/"
    joined = posixpath.normpath(posixpath.join(base, url.split("#")[0].split("?")[0]))
    return joined.lstrip("/")


def page_target(root_rel, idmap):
    """A page link: preview URL when we know the id, canonical path otherwise."""
    root_rel = urllib.parse.unquote(root_rel)
    if not root_rel.endswith(".html"):
        root_rel = posixpath.join(root_rel, "index.html") if root_rel else "index.html"
    name = view_name(root_rel)
    pid = idmap.get(name)
    if pid:
        return f"/preview/{pid}"
    m = re.search(r"index__(.+)\.html$", root_rel)
    if m:
        return "/" + root_rel[: m.start()] + "?" + m.group(1)
    if root_rel.endswith("index.html"):
        root_rel = root_rel[: -len("index.html")]
    return "/" + root_rel


def to_public(url, page_dir, idmap, pages):
    root_rel = resolve(url, page_dir)
    if root_rel is None:
        return None
    if ASSET_EXT.search(root_rel):
        frag = "?" + url.split("?", 1)[1] if "?" in url else ""
        return PREFIX + urllib.parse.quote(urllib.parse.unquote(root_rel)) + frag
    return page_target(root_rel, idmap)


def convert(html, page_dir, idmap, pages):
    def sub_attr(m):
        new = to_public(m.group("url").strip(), page_dir, idmap, pages)
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
            new = to_public(bits[0], page_dir, idmap, pages)
            if new:
                bits[0] = new
            out.append(" ".join(bits))
        return f'{m.group(1)}{m.group(2)}{", ".join(out)}{m.group(4)}'

    html = SRCSET.sub(sub_srcset, html)

    def sub_css(m):
        u = m.group(2).strip()
        rr = resolve(u, page_dir)
        if rr is None or not ASSET_EXT.search(rr):
            return m.group(0)
        return f'url("{to_public(u, page_dir, idmap, pages)}")'

    return CSS_URL.sub(sub_css, html)


def main():
    idmap = {}
    if os.path.exists(IDMAP_FILE):
        idmap = json.load(open(IDMAP_FILE))
    print(f"id map: {len(idmap)} entries")

    n_assets = copy_assets()
    if os.path.isdir(VIEWS_OUT):
        shutil.rmtree(VIEWS_OUT)
    os.makedirs(VIEWS_OUT, exist_ok=True)

    pages = discover_pages()
    names = {}
    for page in pages:
        name = view_name(page)
        if name in names:
            raise SystemExit(f"view name collision: {name} ({page} vs {names[name]})")
        names[name] = page

    for page in pages:
        html = open(os.path.join(SITE, page), encoding="utf-8").read()
        out = convert(html, posixpath.dirname(page), idmap, pages)
        with open(os.path.join(VIEWS_OUT, view_name(page) + ".blade.php"), "w", encoding="utf-8") as f:
            f.write(out)

    linked = sum(1 for p in pages if view_name(p) in idmap)
    print(f"assets: {n_assets}   views: {len(pages)}   views con preview id: {linked}")


if __name__ == "__main__":
    main()
