#!/usr/bin/env python3
"""Mirror shinylonelysatyr.xpr.cloud into a local static site."""
import os, re, sys, time, urllib.parse, urllib.request, collections

ORIGIN = "https://shinylonelysatyr.xpr.cloud"
HOSTS = {"shinylonelysatyr.xpr.cloud"}
OUT = "/Users/nicolasbarrios/Documents/Desarrollo/viraal-autos/site"

PAGE_SEEDS = [
    "/", "/buscador/", "/quienes-somos/", "/blog/", "/servicios/", "/contacto/",
    "/aviso-de-privacidad/", "/aviso-legal-y-datos-del-proveedor/",
    "/politicas-de-privacidad", "/terminos-y-condiciones/",
]

ASSET_EXT = re.compile(r"\.(css|js|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|eot|mp4|webm|json|webmanifest|pdf)(\?|$)", re.I)

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36"}

seen_pages, seen_assets, failed = set(), set(), []


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read(), r.headers.get("Content-Type", "")


def norm(url, base):
    url = urllib.parse.urljoin(base, url)
    p = urllib.parse.urlsplit(url)
    if p.scheme not in ("http", "https"):
        return None
    if p.netloc.lower() not in HOSTS:
        return None
    return urllib.parse.urlunsplit(("https", p.netloc.lower(), p.path, p.query, ""))


def local_path(url, is_page):
    p = urllib.parse.urlsplit(url)
    path = urllib.parse.unquote(p.path)
    if is_page:
        if path.endswith("/") or path == "":
            path = path + "index.html"
        elif not path.endswith(".html"):
            path = path + "/index.html"
        if p.query:
            qs = re.sub(r"[^A-Za-z0-9=&_-]", "_", p.query)
            path = path[: -len("index.html")] + "index__" + qs + ".html"
    else:
        path = path.lstrip("/")
        path = "/" + path
    return os.path.join(OUT, path.lstrip("/"))


def save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


URL_ATTR = re.compile(r"""(?P<pre>\b(?:href|src|data-src|data-bg|content|poster|action)\s*=\s*)(?P<q>["'])(?P<url>[^"']+)(?P=q)""", re.I)
SRCSET = re.compile(r"""(\bsrcset\s*=\s*)(["'])([^"']+)(["'])""", re.I)
CSS_URL = re.compile(r"""url\(\s*(['"]?)([^'")]+)\1\s*\)""", re.I)


def rewrite_html(text, page_url, page_file, asset_queue, page_queue):
    depth = os.path.relpath(OUT, os.path.dirname(page_file))

    def rel(target_local):
        return urllib.parse.quote(os.path.relpath(target_local, os.path.dirname(page_file)))

    def handle(u, allow_pages=True):
        n = norm(u, page_url)
        if not n:
            return None
        if ASSET_EXT.search(urllib.parse.urlsplit(n).path + ("?" if urllib.parse.urlsplit(n).query else "")):
            asset_queue.append(n)
            return rel(local_path(n, False))
        if allow_pages:
            page_queue.append(n)
            return rel(local_path(n, True))
        return None

    def sub_attr(m):
        u = m.group("url").strip()
        if u.startswith(("data:", "mailto:", "tel:", "javascript:", "#")):
            return m.group(0)
        if m.group("pre").lower().startswith("content") and not u.startswith(("http", "/")):
            return m.group(0)
        new = handle(u)
        if new is None:
            return m.group(0)
        return f'{m.group("pre")}{m.group("q")}{new}{m.group("q")}'

    text = URL_ATTR.sub(sub_attr, text)

    def sub_srcset(m):
        parts = []
        for cand in m.group(3).split(","):
            cand = cand.strip()
            if not cand:
                continue
            bits = cand.split()
            new = handle(bits[0])
            bits[0] = new if new else bits[0]
            parts.append(" ".join(bits))
        return f'{m.group(1)}{m.group(2)}{", ".join(parts)}{m.group(4)}'

    text = SRCSET.sub(sub_srcset, text)

    def sub_css(m):
        u = m.group(2).strip()
        if u.startswith(("data:", "#")):
            return m.group(0)
        new = handle(u, allow_pages=False)
        return m.group(0) if new is None else f'url("{new}")'

    text = CSS_URL.sub(sub_css, text)
    return text


def rewrite_css(text, css_url, css_file, asset_queue):
    def sub(m):
        u = m.group(2).strip()
        if u.startswith(("data:", "#")):
            return m.group(0)
        n = norm(u, css_url)
        if not n:
            return m.group(0)
        asset_queue.append(n)
        target = local_path(n, False)
        return 'url("%s")' % urllib.parse.quote(os.path.relpath(target, os.path.dirname(css_file)))
    text = CSS_URL.sub(sub, text)
    text = re.sub(r"""@import\s+(['"])([^'"]+)\1""",
                  lambda m: m.group(0), text)
    return text


def main():
    page_queue = collections.deque(ORIGIN + p for p in PAGE_SEEDS)
    asset_queue = collections.deque()
    extra = sys.argv[1:]
    for e in extra:
        page_queue.append(ORIGIN + e)

    while page_queue:
        url = page_queue.popleft()
        if url in seen_pages:
            continue
        seen_pages.add(url)
        try:
            data, ctype = fetch(url)
        except Exception as ex:
            failed.append((url, str(ex)))
            continue
        pf = local_path(url, True)
        if "html" in ctype:
            text = data.decode("utf-8", "replace")
            newq = []
            text = rewrite_html(text, url, pf, asset_queue, newq)
            for n in newq:
                if n not in seen_pages:
                    page_queue.append(n)
            save(pf, text.encode("utf-8"))
        else:
            save(pf, data)
        print("PAGE", url, "->", os.path.relpath(pf, OUT))

    while asset_queue:
        url = asset_queue.popleft()
        if url in seen_assets:
            continue
        seen_assets.add(url)
        af = local_path(url, False)
        try:
            data, ctype = fetch(url)
        except Exception as ex:
            failed.append((url, str(ex)))
            continue
        if "css" in ctype or af.endswith(".css"):
            text = data.decode("utf-8", "replace")
            text = rewrite_css(text, url, af, asset_queue)
            save(af, text.encode("utf-8"))
        else:
            save(af, data)
        print("ASSET", url)

    print("\npages:", len(seen_pages), "assets:", len(seen_assets), "failed:", len(failed))
    for u, e in failed:
        print("FAIL", u, e)


if __name__ == "__main__":
    main()
