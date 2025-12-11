<script setup lang="ts">
/**
 * PluginSlot - 插件 UI 注入点组件
 * 
 * 用法：
 * <PluginSlot name="doc-top" />
 * <PluginSlot name="nav-bar-logo-after" :slot-props="{ theme }" />
 * 
 * 插件通过 slots 配置注入组件到此位置
 */
import { computed, h } from 'vue'
import { usePluginSlots } from '../composables/usePluginSlots'
import type { PluginSlotName, PluginSlotComponent } from '../../shared/types'

const props = withDefaults(defineProps<{
  /** Slot 名称 */
  name: PluginSlotName
  /** 传递给插件组件的额外 props */
  slotProps?: Record<string, unknown>
  /** 容器标签，默认不包裹 */
  tag?: string
  /** 容器 class */
  class?: string
}>(), {
  slotProps: () => ({}),
  tag: '',
  class: ''
})

const { getSlotComponents, slots } = usePluginSlots()

// 调试日志
console.log(`[PluginSlot] Rendering slot: ${props.name}`)
console.log(`[PluginSlot] All slots:`, slots.value)

// 获取并排序该 slot 的所有组件
const components = computed(() => {
  const slotComponents = getSlotComponents(props.name)
  console.log(`[PluginSlot] Components for ${props.name}:`, slotComponents)
  // 按 order 排序
  return [...slotComponents].sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
})

// 是否有内容
const hasContent = computed(() => components.value.length > 0)

// 渲染单个组件
const renderComponent = (item: PluginSlotComponent, index: number) => {
  const comp = item.component as any
  const mergedProps = {
    ...item.props,
    ...props.slotProps
  }
  return h(comp, { key: `plugin-slot-${props.name}-${index}`, ...mergedProps })
}

// 渲染所有组件
const renderAll = () => {
  return components.value.map((item, index) => renderComponent(item, index))
}
</script>

<template>
  <component 
    v-if="hasContent && tag" 
    :is="tag" 
    :class="props.class"
  >
    <component 
      v-for="(item, index) in components" 
      :key="`plugin-slot-${name}-${index}`"
      :is="() => renderComponent(item, index)" 
    />
  </component>
  <template v-else-if="hasContent">
    <component 
      v-for="(item, index) in components" 
      :key="`plugin-slot-${name}-${index}`"
      :is="() => renderComponent(item, index)" 
    />
  </template>
</template>
