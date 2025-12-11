/**
 * 客户端运行时
 */

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
  useThemeColor
} from './composables'
export {
  usePluginSlots,
  createPluginSlotsContext,
  providePluginSlots,
  collectPluginSlots
} from './composables/usePluginSlots'
export { createApp } from './app'
export { Content, PluginSlot } from './components'

// Re-export types
export type {
  PageData,
  SiteData,
  ThemeConfig,
  Header
} from '../shared/types'
