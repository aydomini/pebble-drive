// PebbleDrive Service Worker
// 版本号：用于缓存更新控制
const CACHE_VERSION = 'pebbledrive-v1.3.1';
const CACHE_NAME = `${CACHE_VERSION}`;

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/logo.svg',
    '/apple-touch-icon.png',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json',
    '/js/app.js',
];

// CDN 资源（不缓存，始终从网络获取最新版本）
const CDN_PATTERNS = [
    /cdn\.tailwindcss\.com/,
    /cdnjs\.cloudflare\.com/,
    /cdn\.jsdelivr\.net/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
];

// 安装事件：缓存静态资源
self.addEventListener('install', (event) => {
    console.log('[SW] 安装中...', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] 缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] 安装完成');
                return self.skipWaiting(); // 立即激活新的 Service Worker
            })
            .catch((error) => {
                console.error('[SW] 安装失败:', error);
            })
    );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('[SW] 激活中...', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] 删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] 激活完成');
                return self.clients.claim(); // 立即接管所有页面
            })
    );
});

// 拦截请求：缓存策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过 API 请求（始终从网络获取）
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // CDN 资源：Network First（始终尝试从网络获取最新）
    if (CDN_PATTERNS.some(pattern => pattern.test(url.href))) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // 成功获取，可选缓存（但不强制）
                    return response;
                })
                .catch(() => {
                    // 网络失败，尝试从缓存获取
                    return caches.match(request);
                })
        );
        return;
    }

    // 静态资源：Cache First（优先使用缓存）
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[SW] 从缓存返回:', url.pathname);
                    return cachedResponse;
                }

                // 缓存未命中，从网络获取
                return fetch(request)
                    .then((response) => {
                        // 只缓存成功的响应
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应（响应只能使用一次）
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] 网络请求失败:', url.pathname, error);

                        // 如果是 HTML 请求，返回离线页面
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }

                        throw error;
                    });
            })
    );
});

// 消息事件：支持手动更新缓存
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME)
                .then(() => {
                    console.log('[SW] 缓存已清理');
                    event.ports[0].postMessage({ success: true });
                })
        );
    }
});

console.log('[SW] Service Worker 已加载', CACHE_VERSION);
