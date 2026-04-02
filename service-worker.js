const CACHE_NAME = "gamestore-cache-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./game.html",

    "./mystyles/base.css",
    "./mystyles/layout.css",
    "./mystyles/navbar.css",
    "./mystyles/cart.css",
    "./mystyles/game.css",

    "./myscripts/main.js",
    "./myscripts/game.js",
    "./myscripts/checkout.js"
];

// INSTALAR
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// ACTIVAR (borra cache viejo)
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});