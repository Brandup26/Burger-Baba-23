// اسم الكاش الحالي (قم بتغيير الرقم عند عمل تحديثات كبيرة جداً في التصميم)
const CACHE_NAME = 'burger-baba-v1';

// الملفات التي سيتم تخزينها لتعمل بدون إنترنت
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'
];

// 1. التثبيت (Installation)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // تفعيل التحديث فوراً دون انتظار إغلاق المتصفح
  self.skipWaiting();
});

// 2. التفعيل (Activation) - تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. الاستجابة للطلبات (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إرجاع الملف من الكاش إذا وجد، أو تحميله من الشبكة
      return response || fetch(event.request);
    })
  );
});
