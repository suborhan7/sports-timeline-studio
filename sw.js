// Lets the studio open offline and install as an app (from the Borhan Poster Studio).
// Network first: online you always get the newest version; the saved copy is only used offline.
const CACHE = "st-studio-v4";
const FILES = ["./", "index.html", "manifest.webmanifest", "version.js", "css/app.css", "css/poster.css", "fonts/fonts.css", "fonts/AnekBangla-normal-100-800-bengali.woff2","fonts/AnekBangla-normal-100-800-latin.woff2","fonts/Atma-normal-400-bengali.woff2","fonts/Atma-normal-400-latin.woff2","fonts/Atma-normal-500-bengali.woff2","fonts/Atma-normal-500-latin.woff2","fonts/Atma-normal-600-bengali.woff2","fonts/Atma-normal-600-latin.woff2","fonts/Atma-normal-700-bengali.woff2","fonts/Atma-normal-700-latin.woff2","fonts/BalooDa2-normal-400-800-bengali.woff2","fonts/BalooDa2-normal-400-800-latin.woff2","fonts/BarlowCondensed-normal-500-latin.woff2","fonts/BarlowCondensed-normal-600-latin.woff2","fonts/BarlowCondensed-normal-700-latin.woff2","fonts/BarlowCondensed-normal-800-latin.woff2","fonts/BebasNeue-normal-400-latin.woff2","fonts/Galada-normal-400-bengali.woff2","fonts/Galada-normal-400-latin.woff2","fonts/HindSiliguri-normal-400-bengali.woff2","fonts/HindSiliguri-normal-400-latin.woff2","fonts/HindSiliguri-normal-500-bengali.woff2","fonts/HindSiliguri-normal-500-latin.woff2","fonts/HindSiliguri-normal-600-bengali.woff2","fonts/HindSiliguri-normal-600-latin.woff2","fonts/HindSiliguri-normal-700-bengali.woff2","fonts/HindSiliguri-normal-700-latin.woff2","fonts/Mina-normal-400-bengali.woff2","fonts/Mina-normal-400-latin.woff2","fonts/Mina-normal-700-bengali.woff2","fonts/Mina-normal-700-latin.woff2","fonts/NotoSerifBengali-normal-400-900-bengali.woff2","fonts/NotoSerifBengali-normal-400-900-latin.woff2","fonts/TiroBangla-italic-400-bengali.woff2","fonts/TiroBangla-italic-400-latin.woff2","fonts/TiroBangla-normal-400-bengali.woff2","fonts/TiroBangla-normal-400-latin.woff2",
  "lib/html-to-image.js", "lib/bg-removal.js", "js/colors.js", "js/library.js", "js/brand.js", "js/core.js", "js/flags.js", "js/cards.js", "js/cards2.js", "js/i18n.js", "js/studio-edit.js", "js/app.js", "icons/icon-192.png"];

self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(new URL(e.request.url).origin === location.origin ? new Request(e.request.url, { cache: "no-cache" }) : e.request)
      .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
