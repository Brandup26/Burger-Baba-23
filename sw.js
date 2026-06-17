// ملف sw-v2.js
const CACHE_NAME = 'baba-burger-v3';

self.addEventListener('install', e => {
    self.skipWaiting(); // يجبر السيرفس ووركر الجديد إنه يشتغل فوراً
});

self.addEventListener('activate', e => {
    // بيمسح أي كاش قديم لأي نسخة تانية عشان يضمن مفيش تعارض
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => caches.delete(key)));
        })
    );
});

self.addEventListener('fetch', e => {
    // بيحاول يجيب الجديد من النت، لو النت فاصل بيفتح الكاش
    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request);
        })
    );
});
