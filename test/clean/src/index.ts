/**
 * ldoc-theme-clean
 * LDoc theme - clean
 * 
 * 基于 LDoc 默认主题，添加自定义样式和功能
 */

import type { Theme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

// 导入自定义样式（覆盖默认主题样式）
import './styles/index.css'

// 导出默认主题
export const theme: Theme = {
  Layout,
  NotFound
}

// 导出组件供自定义使用
export { Layout, NotFound }

export default theme
