const CACHE_NAME = "adeebsaifi-portfolio-v1";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./travel.html",
    "./blog.html",
    "./gallery.html",
    "./features.html",
    "./404.html",
    "./hacker.html",
    "./systemupdate.html",
    "./firewall.html",
    "./network.html",
    "./city.html",
    "./css/main.css",
    "./css/animations.css",
    "./css/hacker.css",
    "./css/systemupdate.css",
    "./css/firewall.css",
    "./css/network.css",
    "./css/city.css",
    "./js/main.js",
    "./js/travel-map.js",
    "./js/gallery.js",
    "./js/blog.js",
    "./js/contact.js",
    "./js/features-hub.js",
    "./js/hacker.js",
    "./js/systemupdate.js",
    "./js/firewall.js",
    "./js/network.js",
    "./js/world.js",
    "./js/player.js",
    "./js/camera.js",
    "./js/vehicles.js",
    "./js/weather.js",
    "./js/daynight.js",
    "./js/ui.js",
    "./js/city.js",
    "./manifest.json",
    "./Images/photos.json"
];

// Install Event
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Pre-caching static core shells");
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event (Cleanup older caches)
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("[Service Worker] Removing old cache", key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Cache falling back to network approach)
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                // If valid request/response, save duplicate to cache
                if (networkResponse && networkResponse.status === 200 && e.request.method === "GET") {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback to offline page if available and matching HTML request
                const acceptHeader = e.request.headers.get("accept");
                if (acceptHeader && acceptHeader.includes("text/html")) {
                    return caches.match("./404.html");
                }
            });
        })
    );
});
