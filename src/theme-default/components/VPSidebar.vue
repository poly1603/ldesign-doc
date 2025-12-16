<template>
  <Transition name="sidebar-content" mode="out-in">
    <aside class="vp-sidebar" :class="{ open: isOpen }" :key="sidebarKey">
      <div class="vp-sidebar-container">
        <!-- 侧边栏顶部插槽 -->
        <PluginSlot name="sidebar-top" />

        <!-- 侧边栏导航前插槽 -->
        <PluginSlot name="sidebar-nav-before" />

        <nav class="vp-sidebar-nav">
          <TransitionGroup name="sidebar-item" tag="div">
            <template v-for="group in sidebarItems" :key="group.text">
              <div class="vp-sidebar-group">
                <p class="vp-sidebar-group-title">{{ group.text }}</p>
                <ul class="vp-sidebar-items">
                  <li v-for="item in group.items" :key="item.text" class="vp-sidebar-item">
                    <router-link v-if="item.link" :to="item.link" class="vp-sidebar-link"
                      :class="{ active: isActive(item.link) }" @click="close">
                      {{ item.text }}
                    </router-link>
                    <span v-else class="vp-sidebar-link">{{ item.text }}</span>
                    <!-- 嵌套项 -->
                    <ul v-if="item.items && item.items.length" class="vp-sidebar-subitems">
                      <li v-for="subItem in item.items" :key="subItem.text">
                        <router-link v-if="subItem.link" :to="subItem.link" class="vp-sidebar-link vp-sidebar-sublink"
                          :class="{ active: isActive(subItem.link) }" @click="close">
                          {{ subItem.text }}
                        </router-link>
                        <span v-else class="vp-sidebar-link vp-sidebar-sublink">{{ subItem.text }}</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </template>
          </TransitionGroup>
        </nav>

        <!-- 侧边栏导航后插槽 -->
        <PluginSlot name="sidebar-nav-after" />

        <!-- 侧边栏底部插槽 -->
        <PluginSlot name="sidebar-bottom" />
      </div>

      <!-- 遮罩 -->
      <div class="vp-sidebar-mask" @click="close"></div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useData, useRoute, useSidebar, useSidebarItems, type SidebarItem } from '../composables'
import { PluginSlot } from '@ldesign/doc/client'

const { site, theme } = useData()
const route = useRoute()
const { isOpen, close } = useSidebar()
const sidebarItems = useSidebarItems()

// 获取当前语言环境
const currentLocale = computed(() => {
  const locales = site.value.locales as Record<string, { link?: string }> | undefined
  if (!locales) return 'root'
  for (const key of Object.keys(locales)) {
    if (key === 'root') continue
    const locale = locales[key]
    if (locale.link && route.path.startsWith(locale.link)) {
      return key
    }
  }
  return 'root'
})

// 用于触发侧边栏动画的key
const sidebarKey = ref(0)

// 监听侧边栏内容变化，触发动画
watch(sidebarItems, () => {
  sidebarKey.value++
}, { deep: true })

// 检查链接是否激活
const isActive = (link?: string) => {
  if (!link) return false
  return route.path === link || route.path === link + '.html'
}
</script>

<style scoped>
.vp-sidebar {
  position: sticky;
  top: var(--ldoc-nav-height, 64px);
  width: var(--ldoc-sidebar-width, 260px);
  height: calc(100vh - var(--ldoc-nav-height, 64px));
  background: var(--ldoc-c-bg);
  border-right: 1px solid var(--ldoc-c-divider);
  overflow-y: auto;
  z-index: 50;
  transition: transform 0.3s ease;
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.vp-sidebar:hover {
  scrollbar-color: var(--ldoc-c-divider) transparent;
}

.vp-sidebar::-webkit-scrollbar {
  width: 4px;
}

.vp-sidebar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 2px;
}

.vp-sidebar:hover::-webkit-scrollbar-thumb {
  background: var(--ldoc-c-divider);
}

.vp-sidebar-container {
  /* 左侧边距与导航栏 logo 对齐 (24px) */
  padding: 24px 16px 32px 0;
}

.vp-sidebar-group {
  margin-bottom: 24px;
}

.vp-sidebar-group-title {
  margin: 0 0 8px;
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
}

.vp-sidebar-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.vp-sidebar-item {
  margin: 4px 0;
}

.vp-sidebar-link {
  display: block;
  /* 减少左边距以与 logo 文字对齐 */
  padding: 8px 12px 8px 8px;
  border-radius: 6px;
  color: var(--ldoc-c-text-2);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.vp-sidebar-link:hover {
  background: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-1);
}

.vp-sidebar-link.active {
  background: var(--ldoc-c-brand-soft);
  color: var(--ldoc-c-brand);
  font-weight: 500;
}

.vp-sidebar-subitems {
  list-style: none;
  margin: 0;
  padding-left: 16px;
}

.vp-sidebar-sublink {
  font-size: 13px;
}

.vp-sidebar-mask {
  display: none;
}

/* ==================== 移动端侧边栏 (< 768px) ==================== */
@media (max-width: 767px) {
  .vp-sidebar {
    position: fixed !important;
    top: var(--ldoc-nav-height, 56px);
    left: 0;
    width: var(--ldoc-sidebar-width, min(280px, 85vw));
    height: calc(100vh - var(--ldoc-nav-height, 56px));
    transform: translateX(-100%);
    z-index: 200;
    background: var(--ldoc-c-bg);
    border-right: 1px solid var(--ldoc-c-divider);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-overflow-scrolling: touch;
  }

  .vp-sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }

  .vp-sidebar-container {
    padding: 16px 16px 24px;
  }

  .vp-sidebar-link {
    padding: 12px 14px;
    font-size: 15px;
    min-height: var(--ldoc-touch-target, 44px);
    display: flex;
    align-items: center;
  }

  .vp-sidebar-group-title {
    font-size: 13px;
    padding: 8px 0;
    margin-bottom: 4px;
  }

  .vp-sidebar-mask {
    display: none;
    position: fixed;
    top: var(--ldoc-nav-height, 56px);
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    transition: opacity 0.3s ease;
  }

  .vp-sidebar.open .vp-sidebar-mask {
    display: block;
    animation: fadeIn 0.3s ease;
  }
}

/* 平板设备 (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .vp-sidebar {
    width: var(--ldoc-sidebar-width, 260px);
  }

  .vp-sidebar-container {
    padding: 20px 20px 28px;
  }
}

/* 大屏幕 (>= 1920px) */
@media (min-width: 1920px) {
  .vp-sidebar {
    width: var(--ldoc-sidebar-width, 320px);
  }

  .vp-sidebar-container {
    padding: 28px 28px 36px;
  }

  .vp-sidebar-group-title {
    font-size: 15px;
    margin-bottom: 10px;
  }

  .vp-sidebar-link {
    padding: 10px 14px;
    font-size: 15px;
  }

  .vp-sidebar-sublink {
    font-size: 14px;
  }
}

/* 4K 显示器 (>= 2560px) */
@media (min-width: 2560px) {
  .vp-sidebar {
    width: var(--ldoc-sidebar-width, 340px);
  }

  .vp-sidebar-container {
    padding: 32px 32px 40px;
  }

  .vp-sidebar-group-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .vp-sidebar-link {
    padding: 12px 16px;
    font-size: 16px;
    border-radius: 8px;
  }

  .vp-sidebar-sublink {
    font-size: 15px;
  }

  .vp-sidebar-subitems {
    padding-left: 20px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .vp-sidebar-link {
    min-height: var(--ldoc-touch-target, 44px);
    display: flex;
    align-items: center;
  }

  .vp-sidebar-link:active {
    background: var(--ldoc-c-bg-mute);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 侧边栏内容切换动画 */
.sidebar-content-enter-active,
.sidebar-content-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.sidebar-content-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-content-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 侧边栏项目动画 */
.sidebar-item-enter-active,
.sidebar-item-leave-active {
  transition: all 0.3s ease;
}

.sidebar-item-enter-from,
.sidebar-item-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-item-move {
  transition: transform 0.3s ease;
}
</style>
