// Service Worker para Bienestar Montessori PWA
const CACHE_NAME = "bienestar-montessori-v1"

// Recursos para cachear inicialmente
const INITIAL_CACHE_URLS = ["/", "/login", "/offline", "/manifest.json", "/placeholder.svg"]

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache abierto")
        return cache.addAll(INITIAL_CACHE_URLS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activación y limpieza de caches antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Eliminando cache antiguo:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Estrategia de cache: Network First, fallback to cache
self.addEventListener("fetch", (event) => {
  // Solo cachear solicitudes GET
  if (event.request.method !== "GET") return

  // No cachear solicitudes a APIs externas
  if (event.request.url.includes("supabase.co")) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar la respuesta para guardarla en cache
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          // Solo cachear respuestas exitosas
          if (response.status === 200) {
            cache.put(event.request, responseToCache)
          }
        })

        return response
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(event.request).then((cachedResponse) => {
          // Si está en cache, devolver respuesta cacheada
          if (cachedResponse) {
            return cachedResponse
          }

          // Si es una solicitud de página, mostrar página offline
          if (event.request.mode === "navigate") {
            return caches.match("/offline")
          }

          // Para otros recursos, devolver error 404
          return new Response("Not Found", {
            status: 404,
            statusText: "Not Found",
          })
        })
      }),
  )
})

// Sincronización en segundo plano
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData())
  }
})

// Manejo de notificaciones push
self.addEventListener("push", (event) => {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: "/placeholder.svg",
    badge: "/placeholder.svg",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification("Bienestar Montessori", options))
})

// Clic en notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url))
})

// Función para sincronizar datos pendientes
async function syncData() {
  // Implementar lógica de sincronización
  console.log("Sincronizando datos en segundo plano")
}
