const CACHE_NAME = 'burger-baba-cache-v2'; // غيرنا v1 لخلاها v2
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './images/logggo.jpg',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'
];

// تثبيت ملف الـ Service Worker وحفظ الملفات الثابتة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل وتحديث الكاش وحذف القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية جلب البيانات (Cache First for speed)
self.addEventListener('fetch', (event) => {
  // عدم عمل كاش لطلبات الـ Google Sheets لضمان تحديث الأسعار والمنيو باستمرار
  if (event.request.url.includes('docs.google.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
