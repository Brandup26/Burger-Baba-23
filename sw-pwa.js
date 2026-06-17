const CACHE_NAME = 'burger-baba-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './images/logggo.jpg?v=3',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'
];

// تثبيت السيرفس ووركر وكاش الملفات الأساسية فوراً لسرعة التحميل
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// تنظيف الكاش القديم تلقائياً عند تغيير رقم الـ v1 لـ v2 في المستقبل
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
    }).then(() => self.clients.claim())
  );
});

// استراتيجية ذكية: جلب البيانات الحية أولاً، وإذا لم تتوفر أو كان التطبيق أوفلاين يتم التحميل من الكاش السريع
self.addEventListener('fetch', (event) => {
  // تجنب كاش طلبات الـ Excel أو الواتساب لضمان دقة البيانات الحية دائماً
  if (event.request.url.includes('google.com') || event.request.url.includes('wa.me')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // لو النت شغال تمام، خذ نسخة من الملفات في الكاش للاستخدام القادم ورجع الإجابة فوراً
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // لو مفيش نت (Offline)، حمل الملف فوراً من الكاش الداخلي بدون أي تأخير أو رسائل خطأ
        return caches.match(event.request);
      })
  );
});
