const CACHE_NAME = 'baba-burger-v2'; // غيرنا الاسم هنا من v1 لـ v2 عشان نكسر الكاش
const assets = [
  './',
  './index.html?v=2',
  './manifest.json?v=2',
  './images/logggo.jpg?v=2'
];

// التثبيت
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    }).then(() => self.skipWaiting()) // إجبار الـ Service Worker الجديد إنه يشتغل فوراً
  );
});

// التفعيل ومسح الكاش القديم تلقائياً
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('جاري حذف الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // تفعيل التحكم في الصفحات المفتوحة فوراً
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
