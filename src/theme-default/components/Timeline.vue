<template>
  <div class="timeline-container">
    <div v-for="(event, index) in events" :key="index" class="timeline-item">
      <div class="timeline-marker">
        <div class="timeline-dot" :class="event.type || 'default'"></div>
        <div v-if="index < events.length - 1" class="timeline-line"></div>
      </div>
      <div class="timeline-content">
        <div class="timeline-date" v-if="event.date">{{ formatDate(event.date) }}</div>
        <div class="timeline-title" v-if="event.title">{{ event.title }}</div>
        <div class="timeline-description" v-if="event.description">
          <div v-html="event.description"></div>
        </div>
        <slot :name="`event-${index}`" :event="event" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TimelineEvent {
  /** 事件日期 */
  date: string | Date
  /** 事件标题 */
  title?: string
  /** 事件描述 */
  description?: string
  /** 事件类型（影响样式） */
  type?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const props = defineProps<{
  /** 时间线事件列表 */
  events: TimelineEvent[]
  /** 日期格式化函数 */
  dateFormat?: (date: string | Date) => string
}>()

const formatDate = (date: string | Date): string => {
  if (props.dateFormat) {
    return props.dateFormat(date)
  }
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  // 默认格式: YYYY-MM-DD
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.timeline-container {
  margin: 24px 0;
  padding: 0;
}

.timeline-item {
  display: flex;
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--ldoc-c-brand);
  background: var(--ldoc-c-bg);
  position: relative;
  z-index: 1;
}

.timeline-dot.success {
  border-color: var(--ldoc-c-success, #10b981);
}

.timeline-dot.warning {
  border-color: var(--ldoc-c-warning, #f59e0b);
}

.timeline-dot.danger {
  border-color: var(--ldoc-c-danger, #ef4444);
}

.timeline-dot.info {
  border-color: var(--ldoc-c-info, #3b82f6);
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: var(--ldoc-c-divider);
  margin-top: 4px;
  min-height: 20px;
}

.timeline-content {
  flex: 1;
  padding-top: 0;
}

.timeline-date {
  font-size: 13px;
  color: var(--ldoc-c-text-2);
  margin-bottom: 4px;
  font-weight: 500;
}

.timeline-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin-bottom: 8px;
}

.timeline-description {
  font-size: 14px;
  color: var(--ldoc-c-text-2);
  line-height: 1.6;
}

.timeline-description :deep(p) {
  margin: 0 0 8px 0;
}

.timeline-description :deep(p:last-child) {
  margin-bottom: 0;
}

.timeline-description :deep(ul),
.timeline-description :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.timeline-description :deep(code) {
  padding: 2px 6px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
