/**
 * Service Worker 生成模块
 * 提供类似 Workbox 的缓存策略实现
 */

import type { ServiceWorkerConfig, RuntimeCacheRule } from './index'

/**
 * 转义 JavaScript 字符串中的特殊字符
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeJavaScriptString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')  // 反斜杠
    .replace(/'/g, "\\'")     // 单引号
    .replace(/"/g, '\\"')     // 双引号
    .replace(/\n/g, '\\n')    // 换行符
    .replace(/\r/g, '\\r')    // 回车符
    .replace(/\t/g, '\\t')    // 制表符
}

/**
 * 生成 Service Worker 代码
 * 使用 Workbox 风格的缓存策略
 */
export function generateServiceWorker(config: ServiceWorkerConfig): string {
  const {
    strategy = 'cache-first',
    precache = [],
    runtimeCaching = [],
    skipWaiting = true,
    clientsClaim = true,
    filename = 'sw.js'
  } = config

  const cacheName = 'ldoc-cache-v1'
  const precacheList = JSON.stringify(precache)

  // 生成运行时缓存规则代码
  const runtimeCachingCode = generateRuntimeCachingCode(runtimeCaching)

  return `
// LDoc PWA Service Worker
// Generated with Workbox-style caching strategies

const CACHE_NAME = '${cacheName}';
const PRECACHE_URLS = ${precacheList};

// ============== 安装事件 ==============
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching', PRECACHE_URLS.length, 'resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Precache complete');
        ${skipWaiting ? 'return self.skipWaiting();' : ''}
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// ============== 激活事件 ==============
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        ${clientsClaim ? 'return self.clients.claim();' : ''}
      })
  );
});

// ============== Fetch 事件 ==============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过跨域请求（除非在运行时缓存规则中）
  if (url.origin !== self.location.origin) {
    ${runtimeCachingCode ? 'return handleRuntimeCaching(event, request, url);' : 'return;'}
  }

  // 应用默认缓存策略
  ${generateFetchStrategy(strategy)}
});

${runtimeCachingCode}

// ============== 消息事件 ==============
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    console.log('[SW] Received CLIENTS_CLAIM message');
    self.clients.claim();
  }
});

// ============== 辅助函数 ==============

/**
 * Cache First 策略
 * 优先使用缓存，缓存未命中时请求网络
 */
function cacheFirst(request, cacheName = CACHE_NAME) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return fetch(request).then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    });
  });
}

/**
 * Network First 策略
 * 优先请求网络，网络失败时使用缓存
 */
function networkFirst(request, cacheName = CACHE_NAME) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

/**
 * Stale While Revalidate 策略
 * 立即返回缓存，同时在后台更新缓存
 */
function staleWhileRevalidate(request, cacheName = CACHE_NAME) {
  return caches.match(request).then((cachedResponse) => {
    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    });
    
    return cachedResponse || fetchPromise;
  });
}

/**
 * 清理过期缓存
 */
function cleanupExpiredCache(cacheName, maxEntries, maxAgeSeconds) {
  return caches.open(cacheName).then((cache) => {
    return cache.keys().then((requests) => {
      const now = Date.now();
      const promises = [];
      
      // 按时间排序
      const sortedRequests = requests.sort((a, b) => {
        return cache.match(b).then(rb => rb.headers.get('date')) - 
               cache.match(a).then(ra => ra.headers.get('date'));
      });
      
      // 删除超过最大条目数的缓存
      if (maxEntries && sortedRequests.length > maxEntries) {
        for (let i = maxEntries; i < sortedRequests.length; i++) {
          promises.push(cache.delete(sortedRequests[i]));
        }
      }
      
      // 删除过期缓存
      if (maxAgeSeconds) {
        sortedRequests.forEach((request) => {
          cache.match(request).then((response) => {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
              const date = new Date(dateHeader).getTime();
              if (now - date > maxAgeSeconds * 1000) {
                promises.push(cache.delete(request));
              }
            }
          });
        });
      }
      
      return Promise.all(promises);
    });
  });
}
`.trim()
}

/**
 * 生成默认 Fetch 策略代码
 */
function generateFetchStrategy(strategy: string): string {
  const strategyMap = {
    'cache-first': `
  event.respondWith(cacheFirst(request));`,
    'network-first': `
  event.respondWith(networkFirst(request));`,
    'stale-while-revalidate': `
  event.respondWith(staleWhileRevalidate(request));`
  }

  return strategyMap[strategy] || strategyMap['cache-first']
}

/**
 * 生成运行时缓存规则代码
 */
function generateRuntimeCachingCode(rules: RuntimeCacheRule[]): string {
  if (!rules || rules.length === 0) {
    return ''
  }

  const rulesCode = rules
    .map((rule, index) => {
      const pattern =
        rule.urlPattern instanceof RegExp
          ? rule.urlPattern.toString()
          : `new RegExp('${rule.urlPattern}')`

      const cacheName = rule.options?.cacheName
        ? `'${escapeJavaScriptString(rule.options.cacheName)}'`
        : 'CACHE_NAME'

      const handler = rule.handler.toLowerCase().replace(/([A-Z])/g, (m) =>
        m.toLowerCase()
      )

      const expirationCode = rule.options?.expiration
        ? `
      // 清理过期缓存
      cleanupExpiredCache(
        ${cacheName},
        ${rule.options.expiration.maxEntries || 'null'},
        ${rule.options.expiration.maxAgeSeconds || 'null'}
      );`
        : ''

      return `
  // Rule ${index + 1}: ${rule.handler} for ${rule.urlPattern}
  if (${pattern}.test(url.href)) {
    event.respondWith(
      ${handler}(request, ${cacheName})${expirationCode ? `.then((response) => {${expirationCode}\n        return response;\n      })` : ''}
    );
    return;
  }`
    })
    .join('\n')

  return `
/**
 * 处理运行时缓存规则
 */
function handleRuntimeCaching(event, request, url) {
  ${rulesCode}
}`
}

/**
 * 生成默认的运行时缓存规则
 * 为常见资源类型提供合理的缓存策略
 */
export function getDefaultRuntimeCaching(): RuntimeCacheRule[] {
  return [
    // 图片资源 - Cache First
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'ldoc-images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
        }
      }
    },
    // 字体资源 - Cache First
    {
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'ldoc-fonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 年
        }
      }
    },
    // JS/CSS 资源 - Stale While Revalidate
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'ldoc-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 天
        }
      }
    },
    // HTML 页面 - Network First
    {
      urlPattern: /\.html$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'ldoc-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 1 天
        }
      }
    }
  ]
}

/**
 * 合并用户配置和默认配置
 */
export function mergeRuntimeCaching(
  userRules: RuntimeCacheRule[] = [],
  useDefaults = true
): RuntimeCacheRule[] {
  if (!useDefaults) {
    return userRules
  }

  const defaultRules = getDefaultRuntimeCaching()
  return [...defaultRules, ...userRules]
}
