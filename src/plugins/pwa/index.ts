/**
 * PWA 插件 - 支持离线访问和渐进式 Web 应用功能
 * 
 * 功能：
 * - Service Worker 生成和管理
 * - Web App Manifest 生成
 * - 离线缓存策略配置
 * - 更新提示组件
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, SiteConfig } from '../../shared/types'

// ============== 类型定义 ==============

/**
 * 运行时缓存规则
 */
export interface RuntimeCacheRule {
  /** URL 匹配模式 */
  urlPattern: RegExp | string
  /** 缓存策略 */
  handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate'
  /** 缓存选项 */
  options?: {
    /** 缓存名称 */
    cacheName?: string
    /** 过期配置 */
    expiration?: {
      /** 最大缓存条目数 */
      maxEntries?: number
      /** 最大缓存时间（秒） */
      maxAgeSeconds?: number
    }
  }
}

/**
 * Service Worker 配置
 */
export interface ServiceWorkerConfig {
  /** 缓存策略 */
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate'
  /** 预缓存资源列表 */
  precache?: string[]
  /** 运行时缓存规则 */
  runtimeCaching?: RuntimeCacheRule[]
  /** Service Worker 文件名 */
  filename?: string
  /** 是否跳过等待 */
  skipWaiting?: boolean
  /** 是否立即接管客户端 */
  clientsClaim?: boolean
}

/**
 * Manifest 图标配置
 */
export interface ManifestIcon {
  /** 图标路径 */
  src: string
  /** 图标尺寸 */
  sizes: string
  /** 图标类型 */
  type?: string
  /** 图标用途 */
  purpose?: 'any' | 'maskable' | 'monochrome'
}

/**
 * Web App Manifest 配置
 */
export interface ManifestConfig {
  /** 应用名称 */
  name: string
  /** 应用短名称 */
  shortName?: string
  /** 应用描述 */
  description?: string
  /** 主题色 */
  themeColor?: string
  /** 背景色 */
  backgroundColor?: string
  /** 显示模式 */
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
  /** 应用方向 */
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait'
  /** 应用图标 */
  icons?: ManifestIcon[]
  /** 启动 URL */
  startUrl?: string
  /** 应用范围 */
  scope?: string
}

/**
 * 更新提示配置
 */
export interface UpdatePromptConfig {
  /** 是否启用 */
  enabled: boolean
  /** 提示消息 */
  message?: string
  /** 按钮文本 */
  buttonText?: string
  /** 自动检查更新间隔（毫秒） */
  checkInterval?: number
}

/**
 * PWA 插件选项
 */
export interface PWAOptions {
  /** 是否启用 PWA */
  enabled?: boolean
  /** Service Worker 配置 */
  serviceWorker?: ServiceWorkerConfig
  /** Web App Manifest 配置 */
  manifest?: ManifestConfig
  /** 更新提示配置 */
  updatePrompt?: UpdatePromptConfig
  /** 是否在开发模式下启用 */
  devOptions?: {
    enabled?: boolean
    type?: 'classic' | 'module'
  }
}

// ============== 辅助函数 ==============

// 导入 Service Worker 生成函数
export { generateServiceWorker, mergeRuntimeCaching, getDefaultRuntimeCaching } from './serviceWorker'

// 导入 Manifest 生成函数
export {
  generateManifest,
  validateManifestConfig,
  generateDefaultIcons,
  serializeManifest
} from './manifest'
export type { WebAppManifest } from './manifest'

/**
 * 验证 PWA 配置
 * @param options PWA 选项
 * @returns 验证结果
 */
export function validatePWAConfig(options: PWAOptions): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (options.manifest) {
    const manifestValidation = validateManifestConfig(options.manifest)
    errors.push(...manifestValidation.errors)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// ============== 插件实现 ==============

/**
 * PWA 插件
 * 
 * @example
 * ```ts
 * import { pwaPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     pwaPlugin({
 *       enabled: true,
 *       serviceWorker: {
 *         strategy: 'cache-first',
 *         precache: ['/'],
 *         runtimeCaching: [
 *           {
 *             urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
 *             handler: 'CacheFirst',
 *             options: {
 *               cacheName: 'images',
 *               expiration: {
 *                 maxEntries: 50,
 *                 maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
 *               }
 *             }
 *           }
 *         ]
 *       },
 *       manifest: {
 *         name: 'My Documentation',
 *         shortName: 'Docs',
 *         description: 'My awesome documentation',
 *         themeColor: '#3eaf7c',
 *         icons: [
 *           {
 *             src: '/icon-192.png',
 *             sizes: '192x192',
 *             type: 'image/png'
 *           },
 *           {
 *             src: '/icon-512.png',
 *             sizes: '512x512',
 *             type: 'image/png'
 *           }
 *         ]
 *       },
 *       updatePrompt: {
 *         enabled: true,
 *         message: 'New content available, click to refresh.',
 *         buttonText: 'Refresh'
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function pwaPlugin(options: PWAOptions = {}): LDocPlugin {
  const {
    enabled = true,
    serviceWorker = {},
    manifest,
    updatePrompt = { enabled: true },
    devOptions = { enabled: false }
  } = options

  if (!enabled) {
    return definePlugin({
      name: 'ldoc:pwa',
      enforce: 'post'
    })
  }

  // 验证配置
  const validation = validatePWAConfig(options)
  if (!validation.valid) {
    console.warn('[PWA Plugin] Configuration warnings:', validation.errors)
  }

  let siteConfig: SiteConfig

  return definePlugin({
    name: 'ldoc:pwa',
    enforce: 'post',

    configResolved(config) {
      siteConfig = config
    },

    // 注入 PWA 相关的 head 标签
    headScripts: [
      // Service Worker 注册脚本
      `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('${siteConfig?.base || '/'}sw.js')
            .then((registration) => {
              console.log('[PWA] Service Worker registered:', registration.scope);
              
              // 检查更新
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      // 新版本可用
                      window.dispatchEvent(new CustomEvent('ldoc:pwa-update-available', {
                        detail: { registration }
                      }));
                    }
                  });
                }
              });
            })
            .catch((error) => {
              console.error('[PWA] Service Worker registration failed:', error);
            });
        });
      }
      `
    ],

    // 注入 manifest 链接和主题色
    async buildEnd(config) {
      const fs = await import('fs/promises')
      const path = await import('path')

      // 生成 Service Worker
      const swCode = generateServiceWorker({
        ...serviceWorker,
        filename: serviceWorker.filename || 'sw.js'
      })
      const swPath = path.join(config.outDir, 'sw.js')
      await fs.writeFile(swPath, swCode, 'utf-8')
      console.log('✓ Service Worker generated: sw.js')

      // 生成 Manifest
      if (manifest) {
        const manifestData = generateManifest(manifest, config)
        const manifestPath = path.join(config.outDir, 'manifest.json')
        await fs.writeFile(
          manifestPath,
          serializeManifest(manifestData),
          'utf-8'
        )
        console.log('✓ Web App Manifest generated: manifest.json')
      }
    },

    // 注入更新提示组件
    slots: updatePrompt.enabled
      ? {
        'layout-bottom': {
          component: 'LDocPWAUpdatePrompt',
          props: {
            message: updatePrompt.message || 'New content available, click to refresh.',
            buttonText: updatePrompt.buttonText || 'Refresh',
            checkInterval: updatePrompt.checkInterval || 60000
          },
          order: 100
        }
      }
      : undefined,

    // 在客户端注册 PWA 组件
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/pwa/client'

export { globalComponents }
export default { globalComponents }
`
  })
}

/**
 * 创建 PWA 配置辅助函数
 */
export function definePWAConfig(config: PWAOptions): PWAOptions {
  return config
}

export default pwaPlugin
