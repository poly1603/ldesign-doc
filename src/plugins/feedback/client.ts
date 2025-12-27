/**
 * 反馈插件客户端配置
 */

import type { Component } from 'vue'
import HelpfulWidget from './HelpfulWidget.vue'
import Contributors from './Contributors.vue'

/**
 * 全局组件注册
 */
export const globalComponents: Record<string, Component> = {
  LDocHelpfulWidget: HelpfulWidget,
  LDocFeedbackWidget: HelpfulWidget, // 别名，未来可以扩展为通用反馈组件
  LDocContributors: Contributors
}

export default {
  globalComponents
}
