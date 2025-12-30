<template>
  <div class="faq-container">
    <div v-if="searchable" class="faq-search">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder || 'Search FAQ...'"
        class="faq-search-input"
        @input="onSearchInput"
      />
      <span v-if="searchQuery" class="faq-search-clear" @click="clearSearch">✕</span>
    </div>

    <div v-if="searchQuery && filteredItems.length > 0" class="faq-results-count">
      Found {{ filteredItems.length }} result{{ filteredItems.length !== 1 ? 's' : '' }}
    </div>

    <div v-if="searchQuery && filteredItems.length === 0" class="faq-no-results">
      No results found for "{{ searchQuery }}"
    </div>

    <div class="faq-list">
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        class="faq-item"
        :class="{ 'faq-item-expanded': expandedItems.has(index) }"
      >
        <div class="faq-question" @click="toggleItem(index)">
          <div class="faq-question-text" v-html="highlightMatch(item.question)"></div>
          <div class="faq-question-icon">
            <svg
              class="faq-icon"
              :class="{ 'faq-icon-expanded': expandedItems.has(index) }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <transition name="faq-answer">
          <div v-show="expandedItems.has(index)" class="faq-answer">
            <div class="faq-answer-content" v-html="item.answer"></div>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="items.length > 1 && !searchQuery" class="faq-actions">
      <button class="faq-action-button" @click="toggleAll">
        {{ allExpanded ? 'Collapse All' : 'Expand All' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface FAQItem {
  question: string
  answer: string
  tags?: string[]
}

const props = withDefaults(
  defineProps<{
    items: FAQItem[]
    searchable?: boolean
    searchPlaceholder?: string
    defaultExpanded?: boolean
    defaultExpandedItems?: number[]
  }>(),
  {
    searchable: true,
    defaultExpanded: false,
    defaultExpandedItems: () => []
  }
)

const searchQuery = ref('')
const expandedItems = ref<Set<number>>(new Set())

if (props.defaultExpanded) {
  expandedItems.value = new Set(props.items.map((_, index) => index))
} else if (props.defaultExpandedItems.length > 0) {
  expandedItems.value = new Set(props.defaultExpandedItems)
}

const allExpanded = computed(() => {
  return expandedItems.value.size === filteredItems.value.length && filteredItems.value.length > 0
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.items
  }

  const query = searchQuery.value.toLowerCase().trim()
  
  return props.items.filter((item) => {
    if (item.question.toLowerCase().includes(query)) {
      return true
    }
    
    const answerText = item.answer.replace(/<[^>]*>/g, '')
    if (answerText.toLowerCase().includes(query)) {
      return true
    }
    
    if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) {
      return true
    }
    
    return false
  })
})

watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    expandedItems.value = new Set(
      filteredItems.value.map((_, index) => 
        props.items.indexOf(filteredItems.value[index])
      )
    )
  }
})

const toggleItem = (index: number) => {
  const actualIndex = props.items.indexOf(filteredItems.value[index])
  
  if (expandedItems.value.has(actualIndex)) {
    expandedItems.value.delete(actualIndex)
  } else {
    expandedItems.value.add(actualIndex)
  }
  
  expandedItems.value = new Set(expandedItems.value)
}

const toggleAll = () => {
  if (allExpanded.value) {
    expandedItems.value.clear()
  } else {
    expandedItems.value = new Set(props.items.map((_, index) => index))
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const onSearchInput = () => {
}

const highlightMatch = (text: string): string => {
  if (!searchQuery.value.trim()) {
    return text
  }
  
  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  
  return text.replace(regex, '<mark class="faq-highlight">$1</mark>')
}
</script>

<style scoped>
.faq-container {
  margin: 24px 0;
  padding: 0;
}

.faq-search {
  position: relative;
  margin-bottom: 20px;
}

.faq-search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 14px;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  background: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-1);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.faq-search-input:focus {
  outline: none;
  border-color: var(--ldoc-c-brand);
  box-shadow: 0 0 0 3px var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.1));
}

.faq-search-input::placeholder {
  color: var(--ldoc-c-text-3);
}

.faq-search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--ldoc-c-text-3);
  font-size: 18px;
  line-height: 1;
  padding: 4px;
  transition: color 0.2s;
}

.faq-search-clear:hover {
  color: var(--ldoc-c-text-1);
}

.faq-results-count {
  font-size: 13px;
  color: var(--ldoc-c-text-2);
  margin-bottom: 16px;
  font-weight: 500;
}

.faq-no-results {
  padding: 32px 16px;
  text-align: center;
  color: var(--ldoc-c-text-2);
  font-size: 14px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 8px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  background: var(--ldoc-c-bg);
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.faq-item:hover {
  border-color: var(--ldoc-c-brand-light, var(--ldoc-c-brand));
}

.faq-item-expanded {
  border-color: var(--ldoc-c-brand);
  box-shadow: 0 2px 8px var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.1));
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.faq-question:hover {
  background: var(--ldoc-c-bg-soft);
}

.faq-question-text {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  line-height: 1.5;
  padding-right: 16px;
}

.faq-question-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.faq-icon {
  width: 20px;
  height: 20px;
  color: var(--ldoc-c-text-2);
  transition: transform 0.3s ease, color 0.2s;
}

.faq-icon-expanded {
  transform: rotate(180deg);
  color: var(--ldoc-c-brand);
}

.faq-answer {
  overflow: hidden;
}

.faq-answer-content {
  padding: 0 20px 20px 20px;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
  line-height: 1.7;
}

.faq-answer-content :deep(p) {
  margin: 0 0 12px 0;
}

.faq-answer-content :deep(p:last-child) {
  margin-bottom: 0;
}

.faq-answer-content :deep(ul),
.faq-answer-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.faq-answer-content :deep(li) {
  margin: 6px 0;
}

.faq-answer-content :deep(code) {
  padding: 2px 6px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 4px;
  font-size: 0.9em;
  font-family: var(--ldoc-font-family-mono);
}

.faq-answer-content :deep(pre) {
  margin: 12px 0;
  padding: 12px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 6px;
  overflow-x: auto;
}

.faq-answer-content :deep(a) {
  color: var(--ldoc-c-brand);
  text-decoration: none;
  transition: color 0.2s;
}

.faq-answer-content :deep(a:hover) {
  color: var(--ldoc-c-brand-dark, var(--ldoc-c-brand));
  text-decoration: underline;
}

.faq-answer-content :deep(.faq-highlight),
.faq-question-text :deep(.faq-highlight) {
  background: var(--ldoc-c-warning-soft, #fef3c7);
  color: var(--ldoc-c-text-1);
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
}

.faq-answer-enter-active,
.faq-answer-leave-active {
  transition: all 0.3s ease;
}

.faq-answer-enter-from,
.faq-answer-leave-to {
  max-height: 0;
  opacity: 0;
}

.faq-answer-enter-to,
.faq-answer-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.faq-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.faq-action-button {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ldoc-c-brand);
  background: transparent;
  border: 1px solid var(--ldoc-c-brand);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.faq-action-button:hover {
  background: var(--ldoc-c-brand);
  color: white;
}

.faq-action-button:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .faq-question {
    padding: 14px 16px;
  }

  .faq-question-text {
    font-size: 14px;
    padding-right: 12px;
  }

  .faq-answer-content {
    padding: 0 16px 16px 16px;
    font-size: 13px;
  }

  .faq-search-input {
    padding: 10px 36px 10px 14px;
    font-size: 13px;
  }
}
</style>
