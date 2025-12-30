/**
 * 主题定义辅助函数
 */

import type { Theme, EnhanceAppContext } from '../shared/types'

/**
 * 主题定义选项
 * 扩展 Theme，添加组件覆盖支持
 */
export interface ThemeDefinition extends Theme {
  /**
   * 要覆盖的组件映射
   * 用于在继承主题时替换特定组件
   * 
   * @example
   * ```ts
   * components: {
   *   'VPNav': MyCustomNav,
   *   'VPFooter': MyCustomFooter
   * }
   * ```
   */
  components?: Record<string, unknown>
}

/**
 * 合并两个主题
 * 子主题的配置会覆盖父主题
 */
function mergeThemes(base: Theme, child: ThemeDefinition): Theme {
  const merged: Theme = {
    // 继承布局组件，子主题可覆盖
    Layout: child.Layout || base.Layout,
    NotFound: child.NotFound || base.NotFound,

    // 合并样式
    styles: [...(base.styles || []), ...(child.styles || [])],

    // 合并 enhanceApp
    enhanceApp: async (ctx: EnhanceAppContext) => {
      // 先调用父主题的 enhanceApp
      if (base.enhanceApp) {
        await base.enhanceApp(ctx)
      }

      // 注册覆盖的组件
      if (child.components) {
        const app = ctx.app as { component: (name: string, comp: unknown) => void }
        for (const [name, component] of Object.entries(child.components)) {
          app.component(name, component)
        }
      }

      // 再调用子主题的 enhanceApp
      if (child.enhanceApp) {
        await child.enhanceApp(ctx)
      }
    }
  }

  return merged
}

/**
 * 定义主题
 * 
 * @example
 * ```ts
 * // 基础主题
 * import { defineTheme } from '@ldesign/doc'
 * import Layout from './Layout.vue'
 * import NotFound from './NotFound.vue'
 * 
 * export default defineTheme({
 *   Layout,
 *   NotFound,
 *   enhanceApp({ app, router, siteData }) {
 *     app.component('MyComponent', MyComponent)
 *   }
 * })
 * ```
 * 
 * @example
 * ```ts
 * // 继承默认主题并覆盖组件
 * import { defineTheme } from '@ldesign/doc'
 * import defaultTheme from '@ldesign/doc/theme-default'
 * import CustomNav from './components/CustomNav.vue'
 * import CustomFooter from './components/CustomFooter.vue'
 * 
 * export default defineTheme({
 *   extends: defaultTheme,
 *   
 *   // 覆盖特定组件
 *   components: {
 *     'VPNav': CustomNav,
 *     'VPFooter': CustomFooter
 *   },
 *   
 *   // 添加额外样式
 *   styles: [
 *     './styles/custom.css'
 *   ],
 *   
 *   // 增强应用
 *   enhanceApp({ app }) {
 *     // 自定义逻辑
 *   }
 * })
 * ```
 * 
 * @param theme - 主题定义对象
 * @returns 处理后的主题对象
 */
export function defineTheme(theme: ThemeDefinition): Theme {
  // 如果有继承，合并父主题
  if (theme.extends) {
    return mergeThemes(theme.extends, theme)
  }

  // 如果有 components 但没有 extends，自动在 enhanceApp 中注册
  if (theme.components && Object.keys(theme.components).length > 0) {
    const originalEnhanceApp = theme.enhanceApp
    const components = theme.components

    theme.enhanceApp = async (ctx: EnhanceAppContext) => {
      const app = ctx.app as { component: (name: string, comp: unknown) => void }

      // 注册组件
      for (const [name, component] of Object.entries(components)) {
        app.component(name, component)
      }

      // 调用原始 enhanceApp
      if (originalEnhanceApp) {
        await originalEnhanceApp(ctx)
      }
    }
  }

  return theme
}

/**
 * 定义主题工厂函数
 * 用于创建可配置的主题
 * 
 * @example
 * ```ts
 * import { defineThemeFactory } from '@ldesign/doc'
 * 
 * interface MyThemeOptions {
 *   primaryColor?: string
 *   darkMode?: boolean
 * }
 * 
 * export default defineThemeFactory<MyThemeOptions>((options = {}) => ({
 *   Layout,
 *   NotFound,
 *   
 *   enhanceApp({ app }) {
 *     // 使用 options.primaryColor
 *     if (options.primaryColor) {
 *       document.documentElement.style.setProperty(
 *         '--primary-color',
 *         options.primaryColor
 *       )
 *     }
 *   }
 * }))
 * 
 * // 使用
 * // doc.config.ts
 * import myTheme from './theme'
 * 
 * export default defineConfig({
 *   theme: myTheme({ primaryColor: '#3b82f6' })
 * })
 * ```
 * 
 * @param factory - 主题工厂函数
 * @returns 包装后的工厂函数
 */
export function defineThemeFactory<T extends Record<string, unknown> = Record<string, unknown>>(
  factory: (options: T) => ThemeDefinition
): (options?: T) => Theme {
  return (options?: T) => {
    const theme = factory(options || {} as T)
    return defineTheme(theme)
  }
}

/**
 * 主题预设类型
 */
export type ThemePreset = 'default' | 'minimal' | 'blog' | 'docs'

/**
 * 主题预设配置
 */
export interface ThemePresetConfig {
  /** 预设名称 */
  preset: ThemePreset
  /** 自定义设置 */
  options?: Record<string, unknown>
}
