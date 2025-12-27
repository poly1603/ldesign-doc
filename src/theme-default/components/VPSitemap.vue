<template>
  <div class="vp-sitemap">
    <div class="sitemap-header">
      <h1 class="sitemap-title">
        <span class="sitemap-icon">🗺️</span>
        Site Map
      </h1>
      <p class="sitemap-description">
        Browse all {{ totalPages }} pages in this documentation
      </p>
    </div>

    <!-- Search Bar -->
    <div class="sitemap-search">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search pages by title, description, or tags..."
        @input="handleSearch"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- Category Filter -->
    <div v-if="allCategories.length > 1" class="sitemap-filters">
      <button
        :class="['filter-btn', { active: selectedCategory === null }]"
        @click="selectCategory(null)"
      >
        All ({{ totalPages }})
      </button>
      <button
        v-for="category in allCategories"
        :key="category.name"
        :class="['filter-btn', { active: selectedCategory === category.name }]"
        @click="selectCategory(category.name)"
      >
        {{ category.name }} ({{ category.count }})
      </button>
    </div>

    <!-- Results Count -->
    <div v-if="searchQuery" class="sitemap-results-info">
      Found {{ filteredPages.length }} page{{ filteredPages.length !== 1 ? 's' : '' }}
    </div>

    <!-- Pages List -->
    <div v-if="displayMode === 'list'" class="sitemap-pages">
      <article
        v-for="page in filteredPages"
        :key="page.relativePath"
        class="sitemap-page-item"
      >
        <h3 class="page-title">
          <a :href="page.path">{{ page.title }}</a>
        </h3>
        <p v-if="page.description" class="page-description">
          {{ page.description }}
        </p>
        <div class="page-meta">
          <span v-if="page.category" class="page-category">
            📁 {{ page.category }}
          </span>
          <span v-if="page.tags && page.tags.length > 0" class="page-tags">
            <span v-for="tag in page.tags" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </span>
          <time v-if="page.lastUpdated" class="page-date">
            {{ formatDate(page.lastUpdated) }}
          </time>
        </div>
      </article>
    </div>

    <!-- Grouped by Category -->
    <div v-else class="sitemap-grouped">
      <section
        v-for="(pages, category) in groupedPages"
        :key="category"
        class="category-section"
      >
        <h2 class="category-title">
          <span class="category-icon">📁</span>
          {{ category }}
          <span class="category-count">({{ pages.length }})</span>
        </h2>
        <ul class="category-pages">
          <li v-for="page in pages" :key="page.relativePath" class="category-page-item">
            <a :href="page.path" class="page-link">
              {{ page.title }}
            </a>
            <p v-if="page.description" class="page-description">
              {{ page.description }}
            </p>
          </li>
        </ul>
      </section>
    </div>

    <!-- View Toggle -->
    <div class="sitemap-view-toggle">
      <button
        :class="['view-btn', { active: displayMode === 'list' }]"
        @click="displayMode = 'list'"
        title="List view"
      >
        📋 List
      </button>
      <button
        :class="['view-btn', { active: displayMode === 'grouped' }]"
        @click="displayMode = 'grouped'"
        title="Grouped by category"
      >
        📂 Grouped
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="filteredPages.length === 0" class="sitemap-empty">
      <p class="empty-message">No pages found matching your search.</p>
      <button class="clear-search-btn" @click="clearSearch">
        Clear search
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSitemap } from '../composables/sitemap'

const { allPages, allCategories, searchPages, groupPagesByCategory } = useSitemap()

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const displayMode = ref<'list' | 'grouped'>('list')

const totalPages = computed(() => allPages.value.length)

const filteredPages = computed(() => {
  let pages = searchQuery.value ? searchPages(searchQuery.value) : allPages.value

  if (selectedCategory.value) {
    pages = pages.filter(page => page.category === selectedCategory.value)
  }

  return pages.sort((a, b) => {
    // Sort by title alphabetically
    return a.title.localeCompare(b.title)
  })
})

const groupedPages = computed(() => {
  const grouped: Record<string, typeof filteredPages.value> = {}

  for (const page of filteredPages.value) {
    const category = page.category || 'Uncategorized'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(page)
  }

  // Sort categories alphabetically
  return Object.keys(grouped)
    .sort()
    .reduce((acc, key) => {
      acc[key] = grouped[key]
      return acc
    }, {} as Record<string, typeof filteredPages.value>)
})

const handleSearch = () => {
  // Search is reactive, no need for explicit handling
}

const selectCategory = (category: string | null) => {
  selectedCategory.value = category
}

const clearSearch = () => {
  searchQuery.value = ''
  selectedCategory.value = null
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.vp-sitemap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.sitemap-header {
  margin-bottom: 32px;
  text-align: center;
}

.sitemap-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 12px;
  font-size: 48px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.sitemap-icon {
  font-size: 48px;
}

.sitemap-description {
  margin: 0;
  font-size: 18px;
  color: var(--vp-c-text-2);
}

/* Search Bar */
.sitemap-search {
  position: relative;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 12px 48px 12px 16px;
  font-size: 16px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  pointer-events: none;
}

/* Filters */
.sitemap-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.filter-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.filter-btn.active {
  color: var(--vp-c-white);
  background-color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

/* Results Info */
.sitemap-results-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

/* List View */
.sitemap-pages {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sitemap-page-item {
  padding: 20px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sitemap-page-item:hover {
  background-color: var(--vp-c-bg-mute);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.page-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.page-title a:hover {
  color: var(--vp-c-brand);
}

.page-description {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.page-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13px;
}

.page-category {
  padding: 4px 8px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 4px;
  font-weight: 500;
}

.page-tags {
  display: flex;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  border-radius: 4px;
  font-size: 12px;
}

.page-date {
  color: var(--vp-c-text-3);
}

/* Grouped View */
.sitemap-grouped {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-section {
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.category-icon {
  font-size: 24px;
}

.category-count {
  font-size: 16px;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.category-pages {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-page-item {
  padding: 12px;
  background-color: var(--vp-c-bg);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.category-page-item:hover {
  background-color: var(--vp-c-bg-mute);
}

.page-link {
  display: block;
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.page-link:hover {
  color: var(--vp-c-brand);
}

.category-page-item .page-description {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* View Toggle */
.sitemap-view-toggle {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.view-btn {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  background-color: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover {
  color: var(--vp-c-brand);
  background-color: var(--vp-c-brand-soft);
}

.view-btn.active {
  color: var(--vp-c-white);
  background-color: var(--vp-c-brand);
}

/* Empty State */
.sitemap-empty {
  padding: 48px 24px;
  text-align: center;
}

.empty-message {
  margin: 0 0 16px;
  font-size: 18px;
  color: var(--vp-c-text-2);
}

.clear-search-btn {
  padding: 10px 20px;
  font-size: 14px;
  color: var(--vp-c-white);
  background-color: var(--vp-c-brand);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background-color: var(--vp-c-brand-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .sitemap-title {
    font-size: 36px;
  }

  .sitemap-icon {
    font-size: 36px;
  }

  .sitemap-description {
    font-size: 16px;
  }

  .sitemap-view-toggle {
    bottom: 16px;
    right: 16px;
  }

  .filter-btn {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>
