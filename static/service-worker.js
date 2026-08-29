const CACHE_NAME = "storyteller-v1";

self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {

    if (
        event.request.method !== "GET" ||
        event.request.url.includes("/chat") ||
        event.request.url.includes("/new-chat")
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {

                if (response.ok) {
                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, copy);
                        });
                }

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});