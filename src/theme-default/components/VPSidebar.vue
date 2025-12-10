<template>
  <aside class="vp-sidebar" :class="{ open: isOpen }">
    <div class="vp-sidebar-container">
      <nav class="vp-sidebar-nav">
        <template v-for="group in sidebarItems" :key="group.text">
          <div class="vp-sidebar-group">
            <p class="vp-sidebar-group-title">{{ group.text }}</p>
            <ul class="vp-sidebar-items">
              <li v-for="item in group.items" :key="item.text" class="vp-sidebar-item">
                <router-link
                  v-if="item.link"
                  :to="item.link"
                  class="vp-sidebar-link"
                  :class="{ active: isActive(item.link) }"
                  @click="close"
                >
                  {{ item.text }}
                </router-link>
                <span v-else class="vp-sidebar-link">{{ item.text }}</span>
                <!-- 嵌套项 -->
                <ul v-if="item.items && item.items.length" class="vp-sidebar-subitems">
                  <li v-for="subItem in item.items" :key="subItem.text">
                    <router-link
                      :to="subItem.link"
                      class="vp-sidebar-link vp-sidebar-sublink"
                      :class="{ active: isActive(subItem.link) }"
                      @click="close"
                    >
                      {{ subItem.text }}
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </template>
      </nav>
    </div>
    
    <!-- 遮罩 -->
    <div class="vp-sidebar-mask" @click="close"></div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute, useSidebar } from '../composables'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

const { theme } = useData()
const route = useRoute()
const { isOpen, close } = useSidebar()

// 获取侧边栏配置
const sidebarItems = computed(() => {
  const config = theme.value as { sidebar?: Record<string, SidebarItem[]> | SidebarItem[] }
  const sidebar = config.sidebar
  
  if (!sidebar) return []
  
  // 数组形式
  if (Array.isArray(sidebar)) {
    return sidebar
  }
  
  // 对象形式 - 根据路径匹配
  const path = route.path
  for (const [prefix, items] of Object.entries(sidebar)) {
    if (path.startsWith(prefix)) {
      return items
    }
  }
  
  return []
})

// 检查链接是否激活
const isActive = (link?: string) => {
  if (!link) return false
  return route.path === link || route.path === link + '.html'
}
</script>

<style scoped>
.vp-sidebar {
  position: fixed;
  top: var(--ldoc-nav-height, 64px);
  left: 0;
  bottom: 0;
  width: var(--ldoc-sidebar-width, 260px);
  background: var(--ldoc-c-bg);
  border-right: 1px solid var(--ldoc-c-divider);
  overflow-y: auto;
  z-index: 50;
  transition: transform 0.3s;
}

.vp-sidebar-container {
  padding: 24px;
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
  margin: 2px 0;
}

.vp-sidebar-link {
  display: block;
  padding: 8px 12px;
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

@media (max-width: 768px) {
  .vp-sidebar {
    transform: translateX(-100%);
  }
  
  .vp-sidebar.open {
    transform: translateX(0);
  }
  
  .vp-sidebar.open .vp-sidebar-mask {
    display: block;
    position: fixed;
    top: 0;
    left: var(--ldoc-sidebar-width, 260px);
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
