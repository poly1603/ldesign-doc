/**
 * 插件 Slot 管理系统
 * 
 * 提供插件 UI 注入功能，让插件可以独立于主题向页面注入组件
 */
import { inject, provide, ref, type Ref, type InjectionKey } from 'vue'
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
      console.log(`[ldoc] Plugin "${pluginName}" has no slots`)
      return
    }

    console.log(`[ldoc] Plugin "${pluginName}" registering slots:`, pluginSlots)

    for (const [slotName, components] of Object.entries(pluginSlots)) {
      const name = slotName as PluginSlotName
      const componentArray = Array.isArray(components) ? components : [components]

      console.log(`[ldoc] Registering slot "${name}" with ${componentArray.length} component(s)`)

      const existing = slots.value.get(name) || []
      slots.value.set(name, [...existing, ...componentArray])
    }

    console.log(`[ldoc] Plugin "${pluginName}" registered slots:`, Object.keys(pluginSlots))
    console.log(`[ldoc] Total slots after registration:`, Array.from(slots.value.keys()))
  }

  const registerGlobalComponents = (components: PluginGlobalComponent[]) => {
    if (!components?.length) return
    globalComponents.value.push(...components)
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
 */
export function collectPluginSlots(
  plugins: LDocPlugin[],
  context: PluginSlotsContext
) {
  for (const plugin of plugins) {
    // 注册 slots
    if (plugin.slots) {
      context.registerPluginSlots(plugin.name, plugin.slots)
    }

    // 注册全局组件
    if (plugin.globalComponents) {
      context.registerGlobalComponents(plugin.globalComponents)
    }
  }
}
