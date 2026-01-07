/**
 * Carbon Ads 广告插件
 * 
 * 在文档站点中集成 Carbon Ads 广告
 * 
 * @example
 * ```ts
 * import { carbonAdsPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     carbonAdsPlugin({
 *       code: 'your-carbon-code',
 *       placement: 'your-carbon-placement'
 *     })
 *   ]
 * })
 * ```
 */

import type { LDocPlugin } from '../../types/plugin'

/**
 * Carbon Ads 插件选项
 */
export interface CarbonAdsOptions {
  /** Carbon Ads 代码 */
  code: string
  /** Carbon Ads 放置位置标识 */
  placement: string
}

/**
 * 创建 Carbon Ads 插件
 */
export function carbonAdsPlugin(options: CarbonAdsOptions): LDocPlugin {
  const { code, placement } = options

  if (!code || !placement) {
    console.warn('[carbonAdsPlugin] Missing required options: code and placement')
  }

  return {
    name: 'ldoc-plugin-carbon-ads',

    // 通过 extendPageData 向页面注入配置
    extendPageData(pageData) {
      ;(pageData as unknown as Record<string, unknown>).carbonAds = { code, placement }
    },

    // 注册全局组件
    globalComponents: [
      {
        name: 'CarbonAds',
        component: '@ldesign/doc/plugins/carbon-ads/client'
      }
    ],

    // 注册到侧边栏底部插槽
    slots: {
      'aside-bottom': {
        component: 'CarbonAds',
        props: { code, placement }
      }
    }
  }
}
