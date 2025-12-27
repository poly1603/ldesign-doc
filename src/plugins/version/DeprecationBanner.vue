<template>
  <div v-if="isDeprecated" class="ldoc-deprecation-banner" role="alert">
    <div class="deprecation-banner-content">
      <div class="deprecation-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div class="deprecation-message">
        <strong class="deprecation-title">{{ title }}</strong>
        <p class="deprecation-text">{{ message }}</p>
        <a
          v-if="recommendedVersionLink"
          :href="recommendedVersionLink"
          class="deprecation-link"
        >
          {{ linkText }}
          <svg
            class="deprecation-link-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
      <button
        v-if="dismissible"
        class="deprecation-close"
        :aria-label="closeLabel"
        @click="dismiss"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface DeprecationConfig {
  versions: string[]
  message?: string
  recommendedVersion?: string
}

const props = defineProps<{
  currentVersion: string
  deprecation?: DeprecationConfig
  versions?: Array<{
    version: string
    path: string
    label?: string
  }>
  dismissible?: boolean
}>()

const route = useRoute()
const isDismissed = ref(false)

const isDeprecated = computed(() => {
  if (!props.deprecation || isDismissed.value) return false
  return props.deprecation.versions.includes(props.currentVersion)
})

const title = computed(() => {
  return 'Deprecated Version'
})

const message = computed(() => {
  if (props.deprecation?.message) {
    return props.deprecation.message
  }
  return `This version (${props.currentVersion}) is deprecated and no longer maintained. Please upgrade to a newer version.`
})

const recommendedVersionLink = computed(() => {
  if (!props.deprecation?.recommendedVersion || !props.versions) {
    return null
  }
  
  const recommendedVersion = props.versions.find(
    v => v.version === props.deprecation?.recommendedVersion
  )
  
  if (!recommendedVersion) return null
  
  // Get current path relative to version prefix
  const currentPath = route.path
  let relativePath = currentPath
  
  // Remove current version prefix if exists
  const currentVersionItem = props.versions.find(v => v.version === props.currentVersion)
  if (currentVersionItem && currentPath.startsWith(currentVersionItem.path)) {
    relativePath = currentPath.slice(currentVersionItem.path.length)
  }
  
  // Construct new path with recommended version prefix
  return recommendedVersion.path + relativePath
})

const linkText = computed(() => {
  if (!props.deprecation?.recommendedVersion) {
    return 'View latest version'
  }
  const version = props.versions?.find(v => v.version === props.deprecation?.recommendedVersion)
  return `Upgrade to ${version?.label || props.deprecation.recommendedVersion}`
})

const closeLabel = computed(() => {
  return 'Dismiss deprecation warning'
})

const storageKey = computed(() => {
  return `ldoc-deprecation-dismissed-${props.currentVersion}`
})

function dismiss() {
  isDismissed.value = true
  if (props.dismissible) {
    try {
      localStorage.setItem(storageKey.value, 'true')
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}

onMounted(() => {
  if (props.dismissible) {
    try {
      const dismissed = localStorage.getItem(storageKey.value)
      if (dismissed === 'true') {
        isDismissed.value = true
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }
})
</script>

<style scoped>
.ldoc-deprecation-banner {
  position: relative;
  padding: 16px 20px;
  background-color: var(--ldoc-c-warning-soft);
  border-left: 4px solid var(--ldoc-c-warning-1);
  margin-bottom: 24px;
  border-radius: 4px;
}

.deprecation-banner-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.deprecation-icon {
  flex-shrink: 0;
  color: var(--ldoc-c-warning-1);
  margin-top: 2px;
}

.deprecation-message {
  flex: 1;
  min-width: 0;
}

.deprecation-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--ldoc-c-warning-1);
  margin-bottom: 6px;
}

.deprecation-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--ldoc-c-text-1);
  margin: 0 0 10px 0;
}

.deprecation-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-brand-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.deprecation-link:hover {
  color: var(--ldoc-c-brand-2);
  text-decoration: underline;
}

.deprecation-link-icon {
  flex-shrink: 0;
}

.deprecation-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--ldoc-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.deprecation-close:hover {
  background-color: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-1);
}

.deprecation-close:focus {
  outline: 2px solid var(--ldoc-c-brand-1);
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ldoc-deprecation-banner {
    padding: 14px 16px;
  }
  
  .deprecation-banner-content {
    gap: 10px;
  }
  
  .deprecation-title {
    font-size: 14px;
  }
  
  .deprecation-text {
    font-size: 13px;
  }
  
  .deprecation-link {
    font-size: 13px;
  }
}
</style>
