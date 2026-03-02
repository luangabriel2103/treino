const CACHE_NAME = "treino-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// ─── INSTALL: salva os arquivos no cache ───────────────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Cacheando arquivos...");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE: remove caches antigos ──────────────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Deletando cache antigo:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH: responde com cache, senão busca na rede ───────────────────────
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then(response => {
          // Salva no cache se for uma resposta válida
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline e não tem cache: retorna o index.html
          return caches.match("./index.html");
        });
    })
  );
});
