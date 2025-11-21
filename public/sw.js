const CACHE_NAME = 'mowa-cache-v2'
const ASSETS = ['/', '/manifest.json']
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  // Do not cache API requests
  if (new URL(request.url).pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        // Only cache successful responses
        if (networkResponse && networkResponse.ok) {
          const copy = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return networkResponse
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})
