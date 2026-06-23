// في كل مرة تعدل فيها الكود أو الصور، غير رقم الـ v هنا (مثلاً لـ v4 أو v5) ليتم تدمير الكاش القديم فوراً
const CACHE_NAME = 'burger-baba-v3'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'
];

// التثبيت وإجبار السيرفس ووركر الجديد على النشاط فوراً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// تفعيل السيرفس ووركر الجديد وتطهير الكاشات القديمة تماماً من جهاز الزبون
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية جلب البيانات الذكية (تحديث فوري + دعم الأوفلاين)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. استثناء جوجل شيت والواتساب تماماً من الكاش لضمان تحديث الأسعار لحظياً من الشيت
  if (url.includes('google.com') || url.includes('wa.me')) {
    return; // اترك المتصفح يتعامل معها بشكل طبيعي خارج السيرفس ووركر
  }

  // 2. استراتيجية (الشبكة أولاً) لملف الـ HTML والصور لضمان ظهور أي تعديل جديد فوراً
  if (event.request.mode === 'navigate' || url.endsWith('index.html') || url.includes('/images/') || url === self.location.origin + '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // التعديل هنا: السماح بكاش الـ status 200 أو الـ opaque responses (status 0) لضمان كاش الصور الخارجية
          if (response.status === 200 || response.status === 0) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // لو الزبون أوفلاين، ابحث عن الملف في الكاش
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // لو الملف مش في الكاش والأوفلاين تام، ممكن ترجع صفحة أوفلاين مخصصة هنا لو أحببت
          });
        })
    );
    return;
  }

  // 3. باقي الملفات الثابتة كـ الخطوط تفتح كاش سريع لتوفير الباقة وسرعة التحميل
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((response) => {
        if ((response.status === 200 || response.status === 0) && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      });
    }).catch(() => {
      // تفادي الـ Unhandled Rejection في حالة انقطاع الشبكة تماماً للملفات الثابتة
    })
  );
});
