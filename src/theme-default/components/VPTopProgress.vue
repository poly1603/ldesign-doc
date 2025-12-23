<template>
  <div v-show="visible" class="ldoc-top-progress" :style="barStyle"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter, useSiteData } from '@ldesign/doc/client'

interface Task {
  id: number
  loaded: number
  total: number // -1 表示未知总量
  done: boolean
}

const state = reactive({
  tasks: new Map<number, Task>(),
  nextId: 1
})

const totalBytes = computed(() => {
  let sum = 0
  state.tasks.forEach(t => { if (t.total > 0) sum += t.total })
  return sum
})

const loadedBytes = computed(() => {
  let sum = 0
  state.tasks.forEach(t => {
    if (t.total > 0) sum += Math.min(t.loaded, t.total)
    else if (t.done) sum += 0 // 未知总量，完成时不计入增量以避免虚假进度
  })
  return sum
})

const progress = computed(() => {
  const total = totalBytes.value
  if (total <= 0) return 0
  return Math.min(1, loadedBytes.value / total)
})

const visible = ref(false)
const siteData = useSiteData()
const barStyle = computed(() => {
  const width = `${Math.max(2, Math.floor(progress.value * 100))}%`
  const ui = (siteData?.value?.themeConfig as any)?.ui?.progressBar || {}
  const height = (ui.height ?? 2) + 'px'
  const color = ui.color || 'var(--ldoc-c-brand, #3b82f6)'
  return {
    width,
    height,
    background: color
  }
})

let installed = false
let originalFetch: typeof fetch | null = null
let originalXHRSend: XMLHttpRequest['send'] | null = null

function addTask(total: number): number {
  const id = state.nextId++
  state.tasks.set(id, { id, loaded: 0, total, done: false })
  // 显示进度条，即使总量未知（仅作存在提示，不伪造进度）
  showBar()
  return id
}

function updateTask(id: number, loaded: number, total?: number) {
  const t = state.tasks.get(id)
  if (!t) return
  t.loaded = loaded
  if (typeof total === 'number') {
    const prev = t.total
    t.total = total
    if (prev <= 0 && total > 0) showBar()
  }
}

function finishTask(id: number) {
  const t = state.tasks.get(id)
  if (!t) return
  t.done = true
}

function resetTasks() {
  state.tasks.clear()
}

function installNetworkHooks(options: { trackFetch: boolean; trackXHR: boolean }) {
  if (installed) return
  installed = true

  if (options.trackFetch && typeof window.fetch === 'function') {
    originalFetch = window.fetch.bind(window)
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const res = await originalFetch!(input, init)
      try {
        const lenHeader = res.headers.get('content-length')
        const total = lenHeader ? parseInt(lenHeader, 10) : -1
        if (!res.body || !(res.body as any).getReader) return res
        const id = addTask(total)
        const reader = (res.body as any).getReader()
        const stream = new ReadableStream({
          async pull(controller) {
            const { done, value } = await reader.read()
            if (done) {
              finishTask(id)
              controller.close()
              return
            }
            if (value) {
              updateTask(id, (state.tasks.get(id)?.loaded || 0) + value.byteLength, total)
              controller.enqueue(value)
            }
          },
          cancel(reason) {
            finishTask(id)
            if (reader.cancel) reader.cancel(reason)
          }
        })
        return new Response(stream, {
          headers: res.headers,
          status: res.status,
          statusText: res.statusText
        })
      } catch {
        return res
      }
    }
  }

  if (options.trackXHR && typeof XMLHttpRequest !== 'undefined') {
    const XHRProto = XMLHttpRequest.prototype as any
    originalXHRSend = XHRProto.send
    XHRProto.send = function (...args: any[]) {
      const xhr: XMLHttpRequest = this
      let id = -1
      const onProgress = (e: ProgressEvent<EventTarget>) => {
        if (id === -1) id = addTask(e.total || -1)
        updateTask(id, e.loaded, e.total || -1)
      }
      const onLoadEnd = () => { if (id !== -1) finishTask(id) }
      xhr.addEventListener('progress', onProgress)
      xhr.addEventListener('loadend', onLoadEnd)
      return (originalXHRSend as any).apply(xhr, args as any)
    }
  }
}

const router = useRouter()
let minShowTimer: any = null
let hideTimer: any = null

function showBar() {
  if (!visible.value) {
    visible.value = true
  }
}

function hideBarSoon() {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { visible.value = false }, 200)
}

onMounted(() => {
  const ui = (siteData?.value?.themeConfig as any)?.ui?.progressBar || {}
  if (ui.enabled === false) {
    visible.value = false
    return
  }
  installNetworkHooks({ trackFetch: ui.trackFetch !== false, trackXHR: ui.trackXHR !== false })

  router.beforeResolve(() => {
    resetTasks()
    clearTimeout(minShowTimer)
    clearTimeout(hideTimer)
    // 轻微延迟后显示，若无网络请求则 afterEach 会立即隐藏
    minShowTimer = setTimeout(() => showBar(), 80)
  })

  router.afterEach(() => {
    // 如果没有任何可跟踪请求，直接隐藏
    if (state.tasks.size === 0) {
      clearTimeout(minShowTimer)
      hideBarSoon()
      return
    }
    // 等待任务完成
    const watcher = setInterval(() => {
      const allDone = Array.from(state.tasks.values()).every(t => t.done)
      if (allDone) {
        clearInterval(watcher)
        hideBarSoon()
      }
    }, 50)
  })
})

onUnmounted(() => {
  clearTimeout(minShowTimer)
  clearTimeout(hideTimer)
})
</script>

<style scoped>
.ldoc-top-progress {
  position: fixed;
  left: 0;
  top: 0;
  height: var(--ldoc-progress-height, 2px);
  width: 0%;
  background: var(--ldoc-progress-color, var(--ldoc-c-brand, #3b82f6));
  z-index: 99999;
  transition: width 0.1s linear;
}
</style>
