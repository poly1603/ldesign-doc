<template>
  <div v-if="contributors && contributors.length > 0" class="ldoc-contributors">
    <div class="ldoc-contributors-header">
      <h3 class="ldoc-contributors-title">Contributors</h3>
      <span v-if="showStats" class="ldoc-contributors-count">
        {{ contributors.length }} {{ contributors.length === 1 ? 'contributor' : 'contributors' }}
      </span>
    </div>

    <!-- Avatars Mode -->
    <div v-if="mode === 'avatars'" class="ldoc-contributors-avatars">
      <a
        v-for="contributor in contributors"
        :key="contributor.email"
        :href="`mailto:${contributor.email}`"
        :title="`${contributor.name}${showStats && contributor.commits ? ` (${contributor.commits} commits)` : ''}`"
        class="ldoc-contributor-avatar"
      >
        <img
          :src="contributor.avatar"
          :alt="contributor.name"
          class="ldoc-contributor-avatar-img"
        />
      </a>
    </div>

    <!-- List Mode -->
    <ul v-else-if="mode === 'list'" class="ldoc-contributors-list">
      <li
        v-for="contributor in contributors"
        :key="contributor.email"
        class="ldoc-contributor-list-item"
      >
        <img
          :src="contributor.avatar"
          :alt="contributor.name"
          class="ldoc-contributor-list-avatar"
        />
        <div class="ldoc-contributor-list-info">
          <span class="ldoc-contributor-list-name">{{ contributor.name }}</span>
          <span v-if="showStats && contributor.commits" class="ldoc-contributor-list-stats">
            {{ contributor.commits }} {{ contributor.commits === 1 ? 'commit' : 'commits' }}
          </span>
        </div>
      </li>
    </ul>

    <!-- Detailed Mode -->
    <div v-else-if="mode === 'detailed'" class="ldoc-contributors-detailed">
      <div
        v-for="contributor in contributors"
        :key="contributor.email"
        class="ldoc-contributor-detailed-card"
      >
        <img
          :src="contributor.avatar"
          :alt="contributor.name"
          class="ldoc-contributor-detailed-avatar"
        />
        <div class="ldoc-contributor-detailed-info">
          <h4 class="ldoc-contributor-detailed-name">{{ contributor.name }}</h4>
          <a
            :href="`mailto:${contributor.email}`"
            class="ldoc-contributor-detailed-email"
          >
            {{ contributor.email }}
          </a>
          <div v-if="showStats" class="ldoc-contributor-detailed-stats">
            <span v-if="contributor.commits" class="ldoc-contributor-stat">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ contributor.commits }} {{ contributor.commits === 1 ? 'commit' : 'commits' }}
            </span>
            <span v-if="contributor.lastCommit" class="ldoc-contributor-stat">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Last: {{ formatDate(contributor.lastCommit) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

// ============== Props ==============

interface Contributor {
  name: string
  email: string
  avatar?: string
  commits?: number
  lastCommit?: string
}

interface Props {
  /** 显示模式 */
  mode?: 'avatars' | 'list' | 'detailed'
  /** 是否显示统计信息 */
  showStats?: boolean
  /** 自定义贡献者列表（可选，默认从页面数据获取） */
  contributors?: Contributor[]
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'avatars',
  showStats: false
})

// ============== Data ==============

const { page } = useData()

// 从页面 frontmatter 获取贡献者信息
const pageContributors = computed<Contributor[]>(() => {
  return page.value?.frontmatter?.contributors || []
})

// 使用自定义贡献者或页面贡献者
const contributors = computed(() => {
  return props.contributors || pageContributors.value
})

// ============== Methods ==============

/**
 * 格式化日期
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  }
}
</script>

<style scoped>
.ldoc-contributors {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--ldoc-c-divider);
}

.ldoc-contributors-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.ldoc-contributors-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin: 0;
}

.ldoc-contributors-count {
  font-size: 14px;
  color: var(--ldoc-c-text-2);
}

/* Avatars Mode */
.ldoc-contributors-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ldoc-contributor-avatar {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--ldoc-c-bg);
  transition: all 0.2s;
}

.ldoc-contributor-avatar:hover {
  transform: scale(1.1);
  border-color: var(--ldoc-c-brand-1);
  z-index: 1;
}

.ldoc-contributor-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* List Mode */
.ldoc-contributors-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ldoc-contributor-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.ldoc-contributor-list-item:hover {
  background-color: var(--ldoc-c-bg-soft);
}

.ldoc-contributor-list-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.ldoc-contributor-list-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.ldoc-contributor-list-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
}

.ldoc-contributor-list-stats {
  font-size: 12px;
  color: var(--ldoc-c-text-2);
}

/* Detailed Mode */
.ldoc-contributors-detailed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.ldoc-contributor-detailed-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  transition: all 0.2s;
}

.ldoc-contributor-detailed-card:hover {
  border-color: var(--ldoc-c-brand-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ldoc-contributor-detailed-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.ldoc-contributor-detailed-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.ldoc-contributor-detailed-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ldoc-contributor-detailed-email {
  font-size: 13px;
  color: var(--ldoc-c-text-2);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.ldoc-contributor-detailed-email:hover {
  color: var(--ldoc-c-brand-1);
}

.ldoc-contributor-detailed-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.ldoc-contributor-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ldoc-c-text-3);
}

.ldoc-contributor-stat svg {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ldoc-contributors {
    margin-top: 32px;
    padding-top: 24px;
  }

  .ldoc-contributors-detailed {
    grid-template-columns: 1fr;
  }

  .ldoc-contributor-avatar {
    width: 36px;
    height: 36px;
  }
}

/* 暗色模式 */
.dark .ldoc-contributor-detailed-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
