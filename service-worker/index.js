/* eslint-env worker */
/* eslint-disable max-nested-callbacks, no-console, ember/named-functions-in-promises */

/* Warning:
    this file is compiled with Babel but doesn’t have any polyfills or
    runtime dependencies like `regeneratorRuntime` included. We should stick
    with basic JavaScript.
*/

const STATIC_CACHE_NAME = `ember-boilerplate-static-${self.CACHE_BUSTER}`;
const RUNTIME_ASSET_CACHE_NAME = `ember-boilerplate-${self.CACHE_BUSTER}`;
const ALL_CACHES = [STATIC_CACHE_NAME, RUNTIME_ASSET_CACHE_NAME];

const CACHEABLE_STATIC_ASSET_EXTENSIONS = [
  'html',
  'js',
  'css',
  'map',
  'png',
  'jpg',
  'gif',
  'svg',
  'eot',
  'ttf',
  'woff',
  'woff2'
];

// Network-first requests will fallback to cache after this timeout
const DEFAULT_REQUEST_TIMEOUT = 5000;

self.addEventListener('install', event => {
  event.waitUntil(cacheStaticAssets());
});

self.addEventListener('activate', event => {
  event.waitUntil(clearUnusedCaches());
});

// eslint-disable-next-line complexity
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // App shell - it’s pre-installed but we still fallback on network because
  // Safari seems to empty our cache when we add the app to the homescreen
  if (requestUrl.origin === location.origin) {
    if (event.request.destination === 'document') {
      event.respondWith(
        cacheFirst(`/assets/index-${self.CACHE_BUSTER}.html`, STATIC_CACHE_NAME)
      );
      return;
    }
  }

  // Pre-installed assets
  if (
    requestUrl.pathname.startsWith('/assets/') &&
    CACHEABLE_STATIC_ASSET_EXTENSIONS.includes(
      requestUrl.pathname.split('.').pop()
    )
  ) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE_NAME));
    return;
  }

  // Assets cached after first encounter
  if (requestUrl.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(event.request, RUNTIME_ASSET_CACHE_NAME));
    return;
  }
});

self.addEventListener('message', event => {
  switch (event.data.action) {
    case 'skipWaiting':
      self.skipWaiting();
      break;

    case 'checkForUpdates':
      self.registration.update();
      break;
  }
});

const cacheStaticAssets = () => {
  return caches.open(STATIC_CACHE_NAME).then(cache => {
    return fetch('/asset-cache-manifest.json').then(assetMapResponse => {
      return assetMapResponse.json().then(assetMap => {
        const cacheableAssets = assetMap.filter(asset => {
          const extension = asset.split('.').pop();
          return CACHEABLE_STATIC_ASSET_EXTENSIONS.includes(extension);
        });

        console.log('Pre-cached assets:', cacheableAssets);

        return cache.addAll(cacheableAssets);
      });
    });
  });
};

const clearUnusedCaches = () => {
  return caches.keys().then(cacheNames => {
    const deleteableCaches = cacheNames
      .filter(cacheName => {
        return (
          cacheName.startsWith('ember-boilerplate') &&
          !ALL_CACHES.includes(cacheName)
        );
      })
      .map(cacheName => caches.delete(cacheName));

    return Promise.all(deleteableCaches);
  });
};

const cacheFirst = (request, cacheName) => {
  return caches
    .open(cacheName)
    .then(cache => {
      return cache.match(request).then(response => {
        if (response) return response;

        return fetch(request).then(networkResponse => {
          cache.put(request, networkResponse.clone());

          return networkResponse;
        });
      });
    })
    .catch(error => console.error(error));
};

// eslint-disable-next-line no-unused-vars
const networkFirst = (
  request,
  cacheName,
  timeout = DEFAULT_REQUEST_TIMEOUT
) => {
  return caches
    .open(cacheName)
    .then(cache => {
      const networkPromise = fetch(request).then(response => {
        cache.put(request, response.clone());

        return response;
      });

      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => resolve(), timeout);
      });

      return Promise.race([networkPromise, timeoutPromise]).then(response => {
        if (response) return response;

        return cache.match(request);
      });
    })
    .catch(error => {
      console.error(error);
    });
};
