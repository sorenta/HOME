const CACHE_NAME = "majapps-shell-v4";
const APP_SHELL = ["/", "/manifest.json", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // PWA neaiztiek neko, kas nav GET pieprasījumi (POST/PUT netiek "kešoti")
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // 1. API izsaukumi - vienmēr izmantojam dzīvo tīklu (Network Only)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 2. Next.js Static faili (JS, CSS chunks, fonts) - CACHE FIRST stratēģija
  // Next.js failu nosaukumi satur "hash" atslēgu, tāpēc varam tos droši saglabāt "uz visiem laikiem".
  // Šis uzlabo lapas ielādes ātrumu par 50%+ uz mobilajiem datiem.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached; // Ja ir atmiņā, iedodam uzreiz bez tīkla
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }).catch(() => new Response("", { status: 408 })); // Timeout
      })
    );
    return;
  }

  // Next.js dinamiski ielādētie dati (piem., RSC payloads formātā /_next/data)
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // 3. Lapas navigācija (lietotājs apmeklē jaunu URL)
  // NETWORK FIRST, fallback to Cache, fallback to Root
  const isDocument = event.request.mode === "navigate";
  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          // Ja offline apmeklē nezināmu lapu, rādām saknes ("/") ekrānu, 
          // lai varētu darboties React router lokāli.
          return cached || caches.match("/");
        }),
    );
    return;
  }

  // 4. Viss pārējais (piemēram, SVG ikonas, publiskie attēli) 
  // NETWORK FIRST, tad CACHE
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return new Response("", { status: 408, statusText: "Offline" });
        }),
      ),
  );
});