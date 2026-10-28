// Lets the studio open offline and install as an app (from the Borhan Poster Studio).
// Two caches:
//  - files that never change (fonts, libraries, flags, icons) are served from the phone straight away and kept across
//    updates, so a new version does not download 3 MB again;
//  - the studio's own files (html, js, css) are fetched fresh when the network answers within 3 s, otherwise the saved
//    copy is used, so slow mobile data never holds the app up.
const STATIC = "st-static-1", APP = "st-app";
const VERSION = "v9";   // bump with version.js so phones pick up the new service worker
const APP_FILES = ["./", "index.html", "manifest.webmanifest", "version.js", "css/app.css", "css/poster.css", "fonts/fonts.css",
  "js/colors.js", "js/library.js", "js/brand.js", "js/core.js", "js/flags.js", "js/cards.js", "js/cards2.js", "js/i18n.js", "js/studio-edit.js", "js/app.js"];
const isStatic = (u) => /\/(fonts\/.*\.woff2|lib\/|flags\/|icons\/)/.test(u);

self.addEventListener("install", (e) => { e.waitUntil(caches.open(APP).then((c) => c.addAll(APP_FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  // drop the old per-version caches (st-studio-v1 … v7) that each held a full copy
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== STATIC && k !== APP).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (isStatic(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(STATIC).then((c) => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  const net = fetch(new Request(req.url, { cache: "no-cache" })).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(APP).then((c) => c.put(req, copy)); }
    return res;
  });
  const slow = new Promise((ok) => setTimeout(ok, 3000)).then(() => caches.match(req, { ignoreSearch: true }));
  e.respondWith(Promise.race([net.catch(() => caches.match(req, { ignoreSearch: true })), slow.then((hit) => hit || net)])
    .then((res) => res || net));
});
