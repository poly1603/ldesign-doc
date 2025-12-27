<template>
  <div class="ldoc-helpful-widget" v-if="!dismissed">
    <div class="ldoc-helpful-container">
      <!-- 初始问题 -->
      <div v-if="!answered" class="ldoc-helpful-question">
        <div class="ldoc-helpful-text">
          {{ question }}
        </div>
        <div class="ldoc-helpful-buttons">
          <button
            class="ldoc-helpful-button ldoc-helpful-button-yes"
            @click="handleAnswer(true)"
            :aria-label="yesText"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {{ yesText }}
          </button>
          <button
            class="ldoc-helpful-button ldoc-helpful-button-no"
            @click="handleAnswer(false)"
            :aria-label="noText"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
            </svg>
            {{ noText }}
          </button>
        </div>
      </div>

      <!-- 后续反馈 -->
      <div v-else-if="showFollowUp && followUpEnabled" class="ldoc-helpful-followup">
        <div class="ldoc-helpful-text">
          {{ isHelpful ? 'Great! What did you like?' : 'Sorry to hear that. How can we improve?' }}
        </div>
        <textarea
          v-model="followUpText"
          class="ldoc-helpful-textarea"
          :placeholder="followUpPlaceholder"
          rows="3"
          @keydown.enter.meta="handleSubmitFollowUp"
          @keydown.enter.ctrl="handleSubmitFollowUp"
        ></textarea>
        <div class="ldoc-helpful-followup-actions">
          <button
            class="ldoc-helpful-button ldoc-helpful-button-submit"
            @click="handleSubmitFollowUp"
            :disabled="!followUpText.trim()"
          >
            Submit
          </button>
          <button
            class="ldoc-helpful-button ldoc-helpful-button-skip"
            @click="handleSkipFollowUp"
          >
            Skip
          </button>
        </div>
      </div>

      <!-- 感谢消息 -->
      <div v-else class="ldoc-helpful-thanks">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="ldoc-helpful-check"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Thank you for your feedback!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// ============== Props ==============

interface Props {
  /** 问题文本 */
  question?: string
  /** "是" 按钮文本 */
  yesText?: string
  /** "否" 按钮文本 */
  noText?: string
  /** 是否启用后续反馈 */
  followUpEnabled?: boolean
  /** 后续反馈占位符 */
  followUpPlaceholder?: string
  /** 存储配置 */
  storage?: {
    type: 'api' | 'github' | 'local'
    endpoint?: string
    githubRepo?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  question: 'Was this page helpful?',
  yesText: 'Yes',
  noText: 'No',
  followUpEnabled: true,
  followUpPlaceholder: 'Tell us more...',
  storage: () => ({ type: 'local' })
})

// ============== State ==============

const route = useRoute()
const answered = ref(false)
const isHelpful = ref(false)
const showFollowUp = ref(false)
const followUpText = ref('')
const dismissed = ref(false)

// ============== Computed ==============

const currentPage = computed(() => route.path)

// ============== Methods ==============

/**
 * 处理是/否回答
 */
async function handleAnswer(helpful: boolean) {
  answered.value = true
  isHelpful.value = helpful

  // 如果启用后续反馈，显示后续反馈表单
  if (props.followUpEnabled) {
    showFollowUp.value = true
  } else {
    // 否则直接提交反馈
    await submitFeedback({
      page: currentPage.value,
      type: 'helpful',
      isHelpful: helpful
    })

    // 3秒后自动隐藏
    setTimeout(() => {
      dismissed.value = true
    }, 3000)
  }
}

/**
 * 处理提交后续反馈
 */
async function handleSubmitFollowUp() {
  if (!followUpText.value.trim()) {
    return
  }

  await submitFeedback({
    page: currentPage.value,
    type: 'helpful',
    isHelpful: isHelpful.value,
    suggestion: followUpText.value.trim()
  })

  showFollowUp.value = false

  // 3秒后自动隐藏
  setTimeout(() => {
    dismissed.value = true
  }, 3000)
}

/**
 * 处理跳过后续反馈
 */
async function handleSkipFollowUp() {
  await submitFeedback({
    page: currentPage.value,
    type: 'helpful',
    isHelpful: isHelpful.value
  })

  showFollowUp.value = false

  // 3秒后自动隐藏
  setTimeout(() => {
    dismissed.value = true
  }, 3000)
}

/**
 * 提交反馈数据
 */
async function submitFeedback(data: Record<string, unknown>) {
  try {
    // 使用全局反馈处理器
    if (typeof window !== 'undefined' && (window as any).__LDOC_FEEDBACK__) {
      await (window as any).__LDOC_FEEDBACK__.submit(data)
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error)
  }
}
</script>

<style scoped>
.ldoc-helpful-widget {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--ldoc-c-divider);
}

.ldoc-helpful-container {
  max-width: 600px;
  margin: 0 auto;
}

.ldoc-helpful-question,
.ldoc-helpful-followup,
.ldoc-helpful-thanks {
  text-align: center;
}

.ldoc-helpful-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
  margin-bottom: 16px;
}

.ldoc-helpful-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.ldoc-helpful-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 6px;
  background: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
}

.ldoc-helpful-button:hover:not(:disabled) {
  border-color: var(--ldoc-c-brand-1);
  color: var(--ldoc-c-brand-1);
}

.ldoc-helpful-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ldoc-helpful-button svg {
  flex-shrink: 0;
}

.ldoc-helpful-button-yes:hover:not(:disabled) {
  background: var(--ldoc-c-brand-soft);
}

.ldoc-helpful-button-no:hover:not(:disabled) {
  background: var(--ldoc-c-bg-soft);
}

.ldoc-helpful-textarea {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 6px;
  background: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-1);
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.ldoc-helpful-textarea:focus {
  outline: none;
  border-color: var(--ldoc-c-brand-1);
}

.ldoc-helpful-textarea::placeholder {
  color: var(--ldoc-c-text-3);
}

.ldoc-helpful-followup-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.ldoc-helpful-button-submit {
  background: var(--ldoc-c-brand-1);
  color: var(--ldoc-c-white);
  border-color: var(--ldoc-c-brand-1);
}

.ldoc-helpful-button-submit:hover:not(:disabled) {
  background: var(--ldoc-c-brand-2);
  border-color: var(--ldoc-c-brand-2);
}

.ldoc-helpful-button-skip {
  background: transparent;
  color: var(--ldoc-c-text-2);
}

.ldoc-helpful-thanks {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--ldoc-c-brand-soft);
  border-radius: 6px;
  color: var(--ldoc-c-brand-1);
  font-weight: 500;
}

.ldoc-helpful-check {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ldoc-helpful-widget {
    margin-top: 32px;
    padding-top: 24px;
  }

  .ldoc-helpful-buttons {
    flex-direction: column;
  }

  .ldoc-helpful-button {
    width: 100%;
    justify-content: center;
  }
}

/* 暗色模式 */
.dark .ldoc-helpful-textarea {
  background: var(--ldoc-c-bg-soft);
}
</style>
