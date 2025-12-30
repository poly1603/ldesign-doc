/**
 * 客户端运行时
 */

// 基础 composables
export {
  useData,
  useRoute,
  useRouter,
  useSiteData,
  usePageData,
  useDark,
  useSidebar,
  useScrollToAnchor,
  usePageLoading,
  useThemeColor,
  setThemeTransition
} from './composables'

// 插件 Slot 系统
export {
  usePluginSlots,
  createPluginSlotsContext,
  providePluginSlots,
  collectPluginSlots,
  cachePlugins,
  getCachedPlugins,
  recollectPluginSlots
} from './composables/usePluginSlots'

// 插件上下文系统
export {
  usePluginContext,
  usePluginRoute,
  usePluginData,
  usePluginUI,
  usePluginStorage,
  usePluginEvents,
  createPluginContext,
  providePluginContext,
  PluginEvents,
  type PluginEventName
} from './composables/usePluginContext'

// 应用和组件
export { createApp } from './app'
export { Content, PluginSlot, PluginUI, LDocModal, ErrorBoundary, DevErrorOverlay } from './components'

// Re-export types
export type {
  PageData,
  SiteData,
  ThemeConfig,
  Header,
  // 插件上下文类型
  ClientPluginContext,
  ClientRouteUtils,
  ClientDataUtils,
  ClientUIUtils,
  ClientStorageUtils,
  ClientEventBus,
  ToastOptions,
  ModalOptions
} from '../shared/types'
