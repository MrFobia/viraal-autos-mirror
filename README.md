# Viraal Autos — espejo estático

Clon fiel de https://shinylonelysatyr.xpr.cloud/ (Viraal Marketplace / Viraal Autos),
capturado el 2026-08-10.

- `site/` — espejo tal cual: 102 páginas HTML + 299 assets (CSS, JS, imágenes, fuentes, video).
  Todas las URLs internas fueron reescritas a rutas relativas, así que el directorio
  se sirve standalone: `python3 -m http.server --directory site`.
- `production/` — las mismas páginas empaquetadas como views de la plataforma Backbone AI,
  con los assets apuntando a `/projects/{slug}/assets/`.

Stack original: Bootstrap 5.2.2, jQuery 3.7.1, Swiper 11, Select2 4.1, template Vehica.
