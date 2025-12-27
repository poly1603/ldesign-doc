/**
 * PWA 插件客户端配置
 * 注册 PWA 相关的全局组件
 */

import type { PluginGlobalComponent } from '../../shared/types'
import PWAUpdatePrompt from './PWAUpdatePrompt.vue'

/**
 * 全局组件列表
 */
export const globalComponents: PluginGlobalComponent[] = [
  {
    name: 'LDocPWAUpdatePrompt',
    component: PWAUpdatePrompt
  }
]

export default {
  globalComponents
}
