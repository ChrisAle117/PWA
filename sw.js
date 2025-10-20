
const APP_SHELL_CACHE_NAME = 'app-shell-v2';
const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './calendar.html',
    './form.html',
    './about.html',
    './style.css',
    './register.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap',
    './imgs/512.png',
    './imgs/192.png'
];


const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';
const DYNAMIC_ASSET_URLS = [
    // Para calendar.html (FullCalendar)
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/main.min.css',
    
    // Para form.html (Select2)
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css'
];


function isAppShellAsset(url) {
    return APP_SHELL_ASSETS.some(asset => {
        if (asset === './') {
            return url.endsWith('/') || url.includes('index.html');
        }
        if (asset.startsWith('./')) {
            const assetPath = asset.substring(2);
            return url.includes(assetPath) || url.endsWith(assetPath);
        }
        return url.includes(asset) || url === asset;
    });
}

function isDynamicAsset(url) {
    return DYNAMIC_ASSET_URLS.some(asset => url.includes(asset) || url === asset);
}

// A. Tarea 1: Estrategia Cache Only (Evento install y fetch)

// 1. Evento install: Abre el caché estático (app-shell-v2) y precachea todos los archivos de APP_SHELL_ASSETS
self.addEventListener('install', event => {
    console.log('Service Worker: Install');
    
    event.waitUntil(
        caches.open(APP_SHELL_CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(APP_SHELL_ASSETS);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activate');
    event.waitUntil(self.clients.claim());
});

// 2. Evento fetch: Filtro para que cualquier petición que coincida con APP_SHELL_ASSETS se responda con caches.match(request)
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = request.url;

    // Solo interceptar GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Tarea 1: Estrategia Cache Only (App Shell)
    if (isAppShellAsset(url)) {
        event.respondWith(
            caches.match(request)
        );
        return;
    }

    // B. Tarea 2: Estrategia Cache First, Network Fallback (Recursos Dinámicos)
    if (isDynamicAsset(url)) {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    // Si está en caché, devolverlo
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // Si no está en caché, ir a la red y guardarlo
                    return fetch(request)
                        .then(networkResponse => {
                            return caches.open(DYNAMIC_CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, networkResponse.clone());
                                    return networkResponse;
                                });
                        });
                })
        );
        return;
    }
});