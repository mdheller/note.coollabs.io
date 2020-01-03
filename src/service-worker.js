/* eslint-disable */
const DEBUG = false
const { assets } = global.serviceWorkerOption
const CACHE_NAME = new Date().toISOString()
let assetsToCache = [...assets, './']
assetsToCache = assetsToCache.map(path => {
  return new URL(path, location).toString()
})

addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache))
));

addEventListener('fetch', event => {
  const request = event.request
  const requestUrl = new URL(request.url)
  if (request.method !== 'GET') { return }
  if (requestUrl.origin !== location.origin) { return }
  const resource = caches.match(request).then(response => { 
    if (response) { return response }
    return fetch(request)
    .then(responseNetwork => {
      if (!responseNetwork || !responseNetwork.ok) {
        return responseNetwork
      }
      const responseCache = responseNetwork.clone()
      caches.open(CACHE_NAME).then(cache => { return cache.put(request, responseCache)})
      return responseNetwork
    })
  })
  event.respondWith(resource)
});

addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(cacheName => {
      if (cacheName.indexOf(CACHE_NAME) === 0) { return null } 
      return caches.delete(cacheName);
    }));
  }));
});

addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    skipWaiting();
  }
});
