'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "e8966c0a244c96a9c4dad0ba06d4d895",
"index.html": "54649137ca6045c0626c5905a81fd6de",
"/": "54649137ca6045c0626c5905a81fd6de",
"main.dart.js": "579bd4e906d3ed37371a543c4934bfdb",
"flutter.js": "1cfe996e845b3a8a33f57607e8b09ee4",
"favicon.png": "02f0dad34c32ddcc852fce81d7f3defe",
"icons/Icon-192.png": "f6388f431375707a7b4dd6f92b9359a9",
"icons/Icon-maskable-192.png": "7a3950d1bd8677a93c0fa67ab930ba57",
"icons/Icon-maskable-512.png": "1ba15bf1b1b126f611a4216f9d217397",
"icons/Icon-512.png": "2502151d76771e5f4fc65ae203af64aa",
"manifest.json": "d98c67cd0704dd3299d273db60ecd4f8",
"assets/AssetManifest.json": "cb5ff337dfd200f435b471162ca3e620",
"assets/NOTICES": "13699fd5e58d8272888b900b63511f96",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/assets/chatGTP/openai_logo_white.png": "98775d1e10352c93957d560c4e6bc19d",
"assets/assets/chatGTP/chat_logo_black.png": "ac4acf1a1aa9b867c585881760f2208c",
"assets/assets/chatGTP/person.png": "ed2b7fcea831c8228a71a4a9d36e7ae7",
"assets/assets/chatGTP/openai_logo_black.png": "41778d257bc5b0ec1240f32fa0a4ca2b",
"assets/assets/chatGTP/openai_logo.jpg": "6dfdfbfa502ec22ebf5b1e7e7b9109d5",
"assets/assets/chatGTP/chat_logo_white.png": "d562a76bab66fd92041bc9fb6b1f923b",
"assets/assets/chatGTP/chat_logo.png": "8c46b0e77a62d3d6e097b0f9ede355f1",
"assets/assets/images/social/discord_white.png": "96d671c31175b6bb8028725c57926f57",
"assets/assets/images/social/facebook_black.png": "dd57eaef2ca72c03df6ac8ce7ac64735",
"assets/assets/images/social/twitter_black.png": "19dcb822e92309c7e8f0ac6c850b2a68",
"assets/assets/images/social/github_white.png": "69091d304083b0feb81ad7914977f0f7",
"assets/assets/images/social/discord_black.png": "d7d3e70174bd29f7b7bea15dc2eaa03d",
"assets/assets/images/social/facebook_white.png": "ac626b82cd49921a2b22a9844cb733c1",
"assets/assets/images/social/twitter_white.png": "f6b29b850af4cb635ca2f348de8d096a",
"assets/assets/images/social/github_black.png": "c4456494b13f72afb08f3ef8f78a55aa",
"assets/assets/images/logo.png": "8c589b0ea4d0ba3dcbc60fc73ab3afa8",
"assets/assets/coffee_black.png": "4bc8827ee2179aa04ae26f2be9202469",
"assets/assets/provision_devs_logo.png": "48eaca2488f227b7691b3cf3cb8bdecf",
"assets/assets/coffee_white.png": "1a1593b5169c2e88cc57978d2025c320",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
