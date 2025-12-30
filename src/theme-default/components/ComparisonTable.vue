<template>
  <div class="comparison-table-container">
    <div class="comparison-table-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="feature-column">{{ featureColumnLabel }}</th>
            <th v-for="(item, index) in items" :key="index" class="item-column">
              <div class="item-header">
                <div v-if="item.icon" class="item-icon" v-html="item.icon"></div>
                <div class="item-name">{{ item.name }}</div>
                <div v-if="item.badge" class="item-badge" :class="item.badge.type || 'default'">
                  {{ item.badge.text }}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(feature, featureIndex) in features" :key="featureIndex" class="feature-row">
            <td class="feature-name">
              <div class="feature-label">
                {{ feature.name }}
                <span v-if="feature.description" class="feature-description" :title="feature.description">
                  ℹ️
                </span>
              </div>
            </td>
            <td v-for="(item, itemIndex) in items" :key="itemIndex" class="feature-value">
              <div class="value-content" :class="getValueClass(feature.values[itemIndex])">
                <component
                  :is="getValueComponent(feature.values[itemIndex])"
                  :value="feature.values[itemIndex]"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, VNode } from 'vue'

export interface ComparisonItem {
  /** 项目名称 */
  name: string
  /** 项目图标（HTML 或 emoji） */
  icon?: string
  /** 徽章 */
  badge?: {
    text: string
    type?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  }
}

export interface ComparisonFeature {
  /** 特性名称 */
  name: string
  /** 特性描述（鼠标悬停显示） */
  description?: string
  /** 各项目的特性值 */
  values: ComparisonValue[]
}

export type ComparisonValue = 
  | boolean
  | string
  | number
  | { text: string; type?: 'success' | 'warning' | 'danger' | 'info' }
  | null
  | undefined

const props = defineProps<{
  /** 对比项目列表 */
  items: ComparisonItem[]
  /** 特性列表 */
  features: ComparisonFeature[]
  /** 特性列标签 */
  featureColumnLabel?: string
}>()

const getValueClass = (value: ComparisonValue): string => {
  if (typeof value === 'boolean') {
    return value ? 'value-yes' : 'value-no'
  }
  if (typeof value === 'object' && value !== null && 'type' in value) {
    return `value-${value.type || 'default'}`
  }
  if (value === null || value === undefined) {
    return 'value-empty'
  }
  return 'value-text'
}

const getValueComponent = (value: ComparisonValue) => {
  return {
    props: ['value'],
    render() {
      const val = this.value

      // Boolean values
      if (typeof val === 'boolean') {
        return h('span', { class: 'value-icon' }, val ? '✓' : '✗')
      }

      // Null/undefined
      if (val === null || val === undefined) {
        return h('span', { class: 'value-empty-text' }, '—')
      }

      // Object with text and type
      if (typeof val === 'object' && 'text' in val) {
        return h('span', { class: 'value-text-content' }, val.text)
      }

      // String or number
      return h('span', { class: 'value-text-content' }, String(val))
    }
  }
}
</script>

<style scoped>
.comparison-table-container {
  margin: 24px 0;
  overflow-x: auto;
}

.comparison-table-wrapper {
  min-width: 100%;
  display: inline-block;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--ldoc-c-bg);
}

.comparison-table thead {
  background: var(--ldoc-c-bg-soft);
}

.comparison-table th {
  padding: 16px 12px;
  text-align: center;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  border-bottom: 2px solid var(--ldoc-c-divider);
  font-size: 14px;
}

.comparison-table th.feature-column {
  text-align: left;
  min-width: 200px;
  position: sticky;
  left: 0;
  background: var(--ldoc-c-bg-soft);
  z-index: 2;
}

.comparison-table th.item-column {
  min-width: 150px;
}

.item-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.item-icon {
  font-size: 24px;
  line-height: 1;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
}

.item-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-badge.default {
  background: var(--ldoc-c-default-soft, #e5e7eb);
  color: var(--ldoc-c-text-2);
}

.item-badge.success {
  background: var(--ldoc-c-success-soft, #d1fae5);
  color: var(--ldoc-c-success, #10b981);
}

.item-badge.warning {
  background: var(--ldoc-c-warning-soft, #fef3c7);
  color: var(--ldoc-c-warning, #f59e0b);
}

.item-badge.danger {
  background: var(--ldoc-c-danger-soft, #fee2e2);
  color: var(--ldoc-c-danger, #ef4444);
}

.item-badge.info {
  background: var(--ldoc-c-info-soft, #dbeafe);
  color: var(--ldoc-c-info, #3b82f6);
}

.comparison-table tbody tr {
  border-bottom: 1px solid var(--ldoc-c-divider-light);
}

.comparison-table tbody tr:last-child {
  border-bottom: none;
}

.comparison-table tbody tr:hover {
  background: var(--ldoc-c-bg-soft);
}

.comparison-table td {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
}

.comparison-table td.feature-name {
  text-align: left;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
  position: sticky;
  left: 0;
  background: var(--ldoc-c-bg);
  z-index: 1;
}

.comparison-table tbody tr:hover td.feature-name {
  background: var(--ldoc-c-bg-soft);
}

.feature-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.feature-description {
  cursor: help;
  opacity: 0.6;
  font-size: 12px;
}

.value-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.value-icon {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.value-yes .value-icon {
  color: var(--ldoc-c-success, #10b981);
}

.value-no .value-icon {
  color: var(--ldoc-c-text-3);
  opacity: 0.4;
}

.value-empty-text {
  color: var(--ldoc-c-text-3);
  opacity: 0.5;
}

.value-text-content {
  color: var(--ldoc-c-text-2);
}

.value-success .value-text-content {
  color: var(--ldoc-c-success, #10b981);
  font-weight: 500;
}

.value-warning .value-text-content {
  color: var(--ldoc-c-warning, #f59e0b);
  font-weight: 500;
}

.value-danger .value-text-content {
  color: var(--ldoc-c-danger, #ef4444);
  font-weight: 500;
}

.value-info .value-text-content {
  color: var(--ldoc-c-info, #3b82f6);
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
  .comparison-table th.feature-column,
  .comparison-table td.feature-name {
    min-width: 150px;
  }

  .comparison-table th.item-column {
    min-width: 120px;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 10px 8px;
    font-size: 13px;
  }

  .item-icon {
    font-size: 20px;
  }

  .item-name {
    font-size: 13px;
  }
}
</style>
