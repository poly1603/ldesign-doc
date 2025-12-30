/**
 * 插件 Slot 管理系统
 * 
 * 提供插件 UI 注入功能，让插件可以独立于主题向页面注入组件
 */
import { inject, provide, ref, markRaw, type Ref, type InjectionKey } from 'vue'
import type {
  PluginSlotName,
  PluginSlotComponent,
  PluginSlots,
  PluginGlobalComponent,
  LDocPlugin
} from '../../shared/types'

/**
 * 插件 Slots 上下文
 */
interface PluginSlotsContext {
  /** 所有 slot 的组件映射 */
  slots: Ref<Map<PluginSlotName, PluginSlotComponent[]>>
  /** 全局组件列表 */
  globalComponents: Ref<PluginGlobalComponent[]>
  /** 注册插件的 slots */
  registerPluginSlots: (pluginName: string, slots: PluginSlots) => void
  /** 注册全局组件 */
  registerGlobalComponents: (components: PluginGlobalComponent[]) => void
  /** 获取指定 slot 的所有组件 */
  getSlotComponents: (name: PluginSlotName) => PluginSlotComponent[]
}

const PLUGIN_SLOTS_KEY: InjectionKey<PluginSlotsContext> = Symbol('ldoc-plugin-slots')

/**
 * 创建插件 Slots 上下文
 */
export function createPluginSlotsContext(): PluginSlotsContext {
  const slots = ref(new Map<PluginSlotName, PluginSlotComponent[]>())
  const globalComponents = ref<PluginGlobalComponent[]>([])

  const registerPluginSlots = (pluginName: string, pluginSlots: PluginSlots) => {
    if (!pluginSlots) {
      return
    }

    for (const [slotName, components] of Object.entries(pluginSlots)) {
      const name = slotName as PluginSlotName
      const componentArray = Array.isArray(components) ? components : [components]

      // 使用 markRaw 包裹组件，避免被转换为响应式对象
      const rawComponents = componentArray.map(comp => {
        if (typeof comp === 'object' && comp !== null) {
          return markRaw(comp) as PluginSlotComponent
        }
        return comp
      })

      const existing = slots.value.get(name) || []
      slots.value.set(name, [...existing, ...rawComponents])
    }
  }

  const registerGlobalComponents = (components: PluginGlobalComponent[]) => {
    if (!components?.length) return
    // 使用 markRaw 包裹组件
    const rawComponents = components.map(comp => {
      if (comp.component && typeof comp.component === 'object') {
        return { ...comp, component: markRaw(comp.component) }
      }
      return comp
    })
    globalComponents.value.push(...rawComponents)
  }

  const getSlotComponents = (name: PluginSlotName): PluginSlotComponent[] => {
    return slots.value.get(name) || []
  }

  return {
    slots,
    globalComponents,
    registerPluginSlots,
    registerGlobalComponents,
    getSlotComponents
  }
}

/**
 * 提供插件 Slots 上下文
 */
export function providePluginSlots(context: PluginSlotsContext) {
  provide(PLUGIN_SLOTS_KEY, context)
}

/**
 * 使用插件 Slots
 */
export function usePluginSlots(): PluginSlotsContext {
  const context = inject(PLUGIN_SLOTS_KEY)

  if (!context) {
    // 返回空上下文，避免在没有 provider 时崩溃
    return {
      slots: ref(new Map()),
      globalComponents: ref([]),
      registerPluginSlots: () => { },
      registerGlobalComponents: () => { },
      getSlotComponents: () => []
    }
  }

  return context
}

/**
 * 从插件列表中收集所有 slots 和全局组件
 * 注意:此函数会在应用初始化时调用,对于需要路由信息的插件,slots 应该返回空对象或占位符
 */
export function collectPluginSlots(
  plugins: LDocPlugin[],
  context: PluginSlotsContext,
  pluginContext?: any
) {
  console.log('[collectPluginSlots] Processing plugins:', plugins.map(p => ({
    name: p.name,
    hasSlots: !!p.slots,
    hasGlobalComponents: !!p.globalComponents,
    globalComponentsCount: p.globalComponents?.length
  })))

  for (const plugin of plugins) {
    // 注册 slots（支持对象或工厂函数）
    if (plugin.slots) {
      const slots = typeof plugin.slots === 'function'
        ? plugin.slots(pluginContext || {} as never)
        : plugin.slots
      context.registerPluginSlots(plugin.name, slots)
    }

    // 注册全局组件
    if (plugin.globalComponents) {
      const globalComponents = Array.isArray(plugin.globalComponents) ? plugin.globalComponents : []
      console.log(`[collectPluginSlots] Registering ${globalComponents.length} global components from ${plugin.name}:`, globalComponents.map(c => c.name))
      context.registerGlobalComponents(globalComponents)
    }
  }
}

/**
 * 存储插件定义,用于动态重新收集 slots
 */
let cachedPlugins: LDocPlugin[] = []

/**
 * 缓存插件定义
 */
export function cachePlugins(plugins: LDocPlugin[]) {
  cachedPlugins = plugins
}

/**
 * 获取缓存的插件
 */
export function getCachedPlugins(): LDocPlugin[] {
  return cachedPlugins
}

/**
 * 重新收集插件 slots(用于路由变化时)
 */
export function recollectPluginSlots(
  context: PluginSlotsContext,
  pluginContext: any
) {
  // 清空现有 slots
  context.slots.value.clear()

  // 重新收集
  collectPluginSlots(cachedPlugins, context, pluginContext)
}
