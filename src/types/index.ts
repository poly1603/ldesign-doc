/**
 * @ldesign/doc - 类型定义入口
 * 
 * 统一导出所有类型定义
 * 
 * @example
 * ```ts
 * import type { 
 *   UserConfig, 
 *   LDocPlugin, 
 *   Theme, 
 *   PageData 
 * } from '@ldesign/doc'
 * ```
 */

// ============== 工具类型 ==============
export type {
  DeepPartial,
  Awaitable,
  MaybeRef,
  MaybeReadonly,
  ArrayElement,
  PromiseType,
  AsyncReturnType,
  RequiredKeys,
  OptionalKeys,
  NonUndefined,
  StringLiteral
} from './utils'

// ============== 页面类型 ==============
export type {
  PageData,
  Header,
  SiteData,
  HeadConfig,
  Route,
  RouteMeta
} from './page'

// ============== 主题类型 ==============
export type {
  Theme,
  EnhanceAppContext,
  ThemeConfig,
  LayoutConfig,
  ThemeTransitionType,
  DarkModeUIOptions,
  ModalAnimationOptions,
  ProgressBarOptions,
  UIConfig,
  ThemeLogo,
  NavItem,
  Sidebar,
  SidebarMulti,
  SidebarItem,
  SocialLink,
  FooterConfig,
  EditLinkConfig,
  LastUpdatedConfig,
  SearchConfig,
  OutlineConfig,
  DocFooterConfig,
  ReadingOrderItem,
  LocaleConfig
} from './theme'

// ============== 插件类型 ==============
export type {
  PluginSlotName,
  PluginSlotComponent,
  PluginSlots,
  PluginGlobalComponent,
  PluginGlobalDirective,
  PluginDependency,
  PluginConflict,
  PluginValidationError,
  PluginMeta,
  PluginPageContext,
  PageRenderContext,
  HotUpdateContext,
  ClientPluginContext,
  ClientRouteUtils,
  ClientDataUtils,
  ClientUIUtils,
  ToastOptions,
  ModalOptions,
  ClientStorageUtils,
  ClientEventBus,
  LDocPlugin,
  PluginContext
} from './plugin'

// ============== 配置类型 ==============
export type {
  Framework,
  ExtraDocsSource,
  UserConfig,
  SiteConfig,
  BuildConfig,
  BuildHooks,
  BuildHookFunction,
  DeployPlatform,
  DeployConfig,
  TransformContext,
  ConfigEnv
} from './config'

// ============== Markdown 类型 ==============
export type {
  MarkdownOptions,
  CodeCollapseOptions,
  PlaygroundOptions,
  AnchorOptions,
  TocOptions,
  ContainerOptions,
  CodeTransformer,
  DemoOptions,
  DemoContainer,
  MarkdownRenderer
} from './markdown'

// ============== 认证类型 ==============
export type {
  AuthConfig,
  AuthProvider,
  AuthCredentials,
  AuthResult,
  AuthUser,
  CustomAuthHandler,
  AuthContext
} from './auth'
