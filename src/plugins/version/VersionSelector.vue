<template>
  <div class="ldoc-version-selector" :class="{ 'is-open': isOpen }">
    <button
      class="version-selector-button"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
      @keydown.escape="closeDropdown"
    >
      <span class="version-label">{{ currentVersionLabel }}</span>
      <svg
        class="version-icon"
        :class="{ 'is-rotated': isOpen }"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <transition name="version-dropdown">
      <div v-if="isOpen" class="version-dropdown" role="menu">
        <div class="version-dropdown-inner">
          <div
            v-for="version in versions"
            :key="version.version"
            class="version-item"
            :class="{
              'is-current': version.version === currentVersion,
              'is-deprecated': version.deprecated,
              'is-prerelease': version.prerelease
            }"
            role="menuitem"
            :tabindex="version.version === currentVersion ? -1 : 0"
            @click="selectVersion(version)"
            @keydown.enter="selectVersion(version)"
            @keydown.space.prevent="selectVersion(version)"
          >
            <div class="version-item-content">
              <span class="version-item-label">{{ version.label }}</span>
              <span v-if="version.deprecated" class="version-badge deprecated">
                Deprecated
              </span>
              <span v-else-if="version.prerelease" class="version-badge prerelease">
                Beta
              </span>
              <span v-if="version.version === currentVersion" class="version-badge current">
                Current
              </span>
            </div>
            <span v-if="version.releaseDate" class="version-date">
              {{ formatDate(version.releaseDate) }}
            </span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Backdrop to close dropdown when clicking outside -->
    <div
      v-if="isOpen"
      class="version-backdrop"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface VersionItem {
  version: string
  label: string
  path: string
  prerelease?: boolean
  releaseDate?: string
  deprecated?: boolean
}

interface VersionConfig {
  versions: VersionItem[]
  current: string
  aliases: Record<string, string>
  selectorPosition: 'nav' | 'sidebar'
  deprecation?: {
    versions: string[]
    message?: string
    recommendedVersion?: string
  }
  hasOnVersionChange: boolean
}

const props = defineProps<{
  __versionConfig: string
}>()

// Parse configuration
const config = computed<VersionConfig>(() => {
  try {
    return JSON.parse(props.__versionConfig)
  } catch (e) {
    console.error('Failed to parse version config:', e)
    return {
      versions: [],
      current: '',
      aliases: {},
      selectorPosition: 'nav',
      hasOnVersionChange: false
    }
  }
})

const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const versions = computed(() => config.value.versions)
const currentVersion = computed(() => config.value.current)

const currentVersionLabel = computed(() => {
  const version = versions.value.find(v => v.version === currentVersion.value)
  return version?.label || currentVersion.value
})

const ariaLabel = computed(() => {
  return `Select version (current: ${currentVersionLabel.value})`
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function selectVersion(version: VersionItem) {
  if (version.version === currentVersion.value) {
    closeDropdown()
    return
  }

  // Trigger version change callback if exists
  if (config.value.hasOnVersionChange) {
    window.dispatchEvent(
      new CustomEvent('ldoc:version-change', {
        detail: {
          from: currentVersion.value,
          to: version.version
        }
      })
    )
  }

  // Navigate to the new version
  navigateToVersion(version)
  closeDropdown()
}

function navigateToVersion(version: VersionItem) {
  // Get current path relative to version prefix
  const currentPath = route.path
  let relativePath = currentPath

  // Remove current version prefix if exists
  const currentVersionItem = versions.value.find(v => v.version === currentVersion.value)
  if (currentVersionItem && currentPath.startsWith(currentVersionItem.path)) {
    relativePath = currentPath.slice(currentVersionItem.path.length)
  }

  // Construct new path with target version prefix
  const newPath = version.path + relativePath

  // Navigate
  router.push(newPath)
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const selector = target.closest('.ldoc-version-selector')
  if (!selector && isOpen.value) {
    closeDropdown()
  }
}

// Close dropdown on escape key
function handleEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<style scoped>
.ldoc-version-selector {
  position: relative;
  display: inline-block;
}

.version-selector-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
  background-color: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.version-selector-button:hover {
  background-color: var(--ldoc-c-bg-mute);
  border-color: var(--ldoc-c-brand-1);
}

.version-selector-button:focus {
  outline: 2px solid var(--ldoc-c-brand-1);
  outline-offset: 2px;
}

.version-label {
  line-height: 1;
}

.version-icon {
  transition: transform 0.2s ease;
}

.version-icon.is-rotated {
  transform: rotate(180deg);
}

.version-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background-color: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.version-dropdown-inner {
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.version-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.version-item:hover {
  background-color: var(--ldoc-c-bg-soft);
}

.version-item:focus {
  outline: 2px solid var(--ldoc-c-brand-1);
  outline-offset: -2px;
}

.version-item.is-current {
  background-color: var(--ldoc-c-brand-soft);
}

.version-item.is-current:hover {
  background-color: var(--ldoc-c-brand-soft);
}

.version-item.is-deprecated {
  opacity: 0.6;
}

.version-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.version-item-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
}

.version-badge {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  line-height: 1;
}

.version-badge.current {
  color: var(--ldoc-c-brand-1);
  background-color: var(--ldoc-c-brand-soft);
}

.version-badge.deprecated {
  color: var(--ldoc-c-warning-1);
  background-color: var(--ldoc-c-warning-soft);
}

.version-badge.prerelease {
  color: var(--ldoc-c-tip-1);
  background-color: var(--ldoc-c-tip-soft);
}

.version-date {
  font-size: 12px;
  color: var(--ldoc-c-text-2);
}

.version-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* Dropdown transition */
.version-dropdown-enter-active,
.version-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.version-dropdown-enter-from,
.version-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Scrollbar styling */
.version-dropdown-inner::-webkit-scrollbar {
  width: 6px;
}

.version-dropdown-inner::-webkit-scrollbar-track {
  background: transparent;
}

.version-dropdown-inner::-webkit-scrollbar-thumb {
  background-color: var(--ldoc-c-divider);
  border-radius: 3px;
}

.version-dropdown-inner::-webkit-scrollbar-thumb:hover {
  background-color: var(--ldoc-c-text-3);
}
</style>
