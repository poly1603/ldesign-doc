<template>
  <div class="ldoc-cpg">
    <div class="ldoc-cpg__header" v-if="title || showToolbar">
      <div class="ldoc-cpg__title" v-if="title">{{ title }}</div>
      <div class="ldoc-cpg__tools" v-if="showToolbar">
        <button class="cpg-btn" @click="copyCode" title="复制代码">
          <svg class="cpg-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button class="cpg-btn" @click="toggleCode" title="查看代码">
          <svg class="cpg-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
          <span class="cpg-btn__label">{{ showCode ? '隐藏代码' : '查看代码' }}</span>
        </button>
        <button class="cpg-btn" @click="clearEvents" title="清空事件">
          <svg class="cpg-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </div>

    <div class="ldoc-cpg__body">
      <div class="ldoc-cpg__preview" :style="{ minHeight: playgroundHeight }">
        <component
          v-if="resolvedComponent"
          :is="resolvedComponent"
          v-bind="currentProps"
          v-on="listeners"
        >
          <template #default>
            <slot v-if="$slots.default" />
            <div v-else v-html="slotText('default')" />
          </template>
          <template v-for="(content, name) in slotDefs" :key="name" v-slot:[name]>
            <div v-html="typeof content === 'string' ? content : ''" />
          </template>
        </component>
        <div v-else class="ldoc-cpg__preview-empty">
          未找到组件
          <code v-if="props.componentName">{{ props.componentName }}</code>
        </div>
      </div>

      <div class="ldoc-cpg__panel" :style="{ width: panelWidth }">
        <div class="ldoc-cpg__panel-title">
          <svg class="ldoc-cpg__panel-icon" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="21" y1="4" x2="14" y2="4" />
            <line x1="10" y1="4" x2="3" y2="4" />
            <line x1="21" y1="12" x2="12" y2="12" />
            <line x1="8" y1="12" x2="3" y2="12" />
            <line x1="21" y1="20" x2="16" y2="20" />
            <line x1="12" y1="20" x2="3" y2="20" />
            <circle cx="12" cy="4" r="2" />
            <circle cx="8" cy="12" r="2" />
            <circle cx="16" cy="20" r="2" />
          </svg>
          <span>配置</span>
        </div>
        <div class="ldoc-cpg__controls">
          <div v-for="field in controlList" :key="field.name" class="cpg-field">
            <div class="cpg-field__label">{{ field.name }}</div>
            <div class="cpg-field__control">
              <!-- boolean -->
              <label v-if="field.type === 'boolean'" class="cpg-switch">
                <input type="checkbox" v-model="currentProps[field.name]" />
                <span />
              </label>

              <!-- number / slider -->
              <div v-else-if="field.type === 'number' && field.slider" class="cpg-slider">
                <input type="range" :min="field.min ?? 0" :max="field.max ?? 100" :step="field.step ?? 1"
                  v-model.number="currentProps[field.name]" />
                <input class="cpg-input cpg-input--sm" type="number" v-model.number="currentProps[field.name]" />
              </div>
              <input v-else-if="field.type === 'number'" class="cpg-input" type="number"
                v-model.number="currentProps[field.name]" />

              <!-- text -->
              <input v-else-if="field.type === 'text'" class="cpg-input" type="text"
                v-model="currentProps[field.name]" />

              <!-- color -->
              <input v-else-if="field.type === 'color'" class="cpg-input" type="color"
                v-model="currentProps[field.name]" />

              <!-- select/radio -->
              <select v-else-if="field.type === 'select'" class="cpg-input" v-model="currentProps[field.name]">
                <option v-for="opt in field.options || []" :key="String(opt)" :value="opt">{{ opt }}</option>
              </select>
              <div v-else-if="field.type === 'radio'" class="cpg-radio">
                <label v-for="opt in field.options || []" :key="String(opt)">
                  <input type="radio" :value="opt" v-model="currentProps[field.name]" /> {{ opt }}
                </label>
              </div>

              <!-- json -->
              <textarea v-else-if="field.type === 'json'" class="cpg-textarea"
                :value="stringifyJSON(currentProps[field.name])" @change="onJsonChange($event, field.name)" />

              <!-- fallback -->
              <input v-else class="cpg-input" type="text" v-model="currentProps[field.name]" />
            </div>
          </div>
        </div>

        <div v-if="eventNames.length" class="ldoc-cpg__events">
          <div class="ldoc-cpg__panel-title">
            <svg class="ldoc-cpg__panel-icon" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>事件</span>
          </div>
          <div class="cpg-events">
            <div v-if="!eventLogs.length" class="cpg-events__empty">无事件</div>
            <div v-for="(e, i) in eventLogs" :key="i" class="cpg-event">
              <div class="cpg-event__name">{{ e.name }}</div>
              <pre class="cpg-event__payload">{{ e.payload }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCode" class="ldoc-cpg__code">
      <pre><code class="language-vue">{{ generatedCode }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref, watch, toRaw, getCurrentInstance } from 'vue'

interface ControlField {
  name: string
  type: 'boolean' | 'number' | 'text' | 'select' | 'radio' | 'color' | 'json'
  options?: Array<string | number>
  min?: number
  max?: number
  step?: number
  slider?: boolean
}

const props = withDefaults(defineProps<{
  component?: any
  componentName?: string
  src?: string
  title?: string
  autoControls?: boolean
  controls?: Record<string, Partial<ControlField>>
  initialProps?: Record<string, any>
  events?: string[]
  slots?: Record<string, string>
  /** stringified JSON inputs for markdown container */
  propsStr?: string
  controlsStr?: string
  eventsStr?: string
  slotsStr?: string
  showToolbar?: boolean
  showCode?: boolean
  panelWidth?: string
  playgroundHeight?: string
}>(), {
  title: '',
  autoControls: true,
  controls: () => ({}),
  initialProps: () => ({}),
  events: () => [],
  slots: () => ({}),
  showToolbar: true,
  showCode: false,
  panelWidth: '360px',
  playgroundHeight: '220px'
})

const title = props.title
const slotDefs = computed<Record<string, string>>(() => {
  if (props.slotsStr) {
    try { return JSON.parse(props.slotsStr) } catch { /* ignore */ }
  }
  return props.slots || {}
})
const panelWidth = props.panelWidth
const playgroundHeight = props.playgroundHeight

const instance = getCurrentInstance()
const resolvedComponent = computed(() => {
  if (props.component) return props.component
  if (props.componentName && instance?.appContext?.components) {
    const comp = (instance.appContext.components as any)[props.componentName]
    if (comp) return comp
  }
  return null
})

function inferFromPropsDef(comp: any) {
  const def = comp && comp.props
  const fields: ControlField[] = []
  const init: Record<string, any> = {}
  if (!def) return { fields, init }

  const entries = Array.isArray(def) ? def.map((k: any) => [k, {}]) : Object.entries(def)
  for (const [name, conf] of entries as any[]) {
    let type: ControlField['type'] = 'text'
    let options: any[] | undefined
    let defVal: any

    const t = Array.isArray(conf?.type) ? conf.type[0] : conf?.type
    switch (t) {
      case Boolean: type = 'boolean'; break
      case Number: type = 'number'; break
      case String: type = 'text'; break
      case Array: type = 'json'; break
      case Object: type = 'json'; break
      default: type = 'text'
    }
    if (Array.isArray(conf) && conf.every((v: any) => typeof v === 'string')) {
      type = 'select'; options = conf as any
    }
    if (Array.isArray(conf?.values)) {
      type = 'select'; options = conf.values
    }
    if (typeof conf?.default !== 'undefined') {
      defVal = typeof conf.default === 'function' ? conf.default() : conf.default
    }
    fields.push({ name, type, options })
    if (typeof defVal !== 'undefined') init[name] = defVal
  }
  return { fields, init }
}

const inferred = computed(() => props.autoControls ? inferFromPropsDef(resolvedComponent.value) : { fields: [], init: {} })
const parsedControls = computed<Record<string, Partial<ControlField>>>(() => {
  if (props.controlsStr) {
    try { return JSON.parse(props.controlsStr) } catch { return props.controls || {} }
  }
  return props.controls || {}
})
const controlList = computed<ControlField[]>(() => {
  const list: ControlField[] = [...(inferred.value.fields || [])]
  for (const [name, extra] of Object.entries(parsedControls.value || {})) {
    const idx = list.findIndex(i => i.name === name)
    const merged = { name, type: 'text', ...(idx >= 0 ? list[idx] : {}), ...(extra as any) } as ControlField
    if (idx >= 0) list[idx] = merged; else list.push(merged)
  }
  return list
})

const initialFromStr = computed<Record<string, any>>(() => {
  if (props.propsStr) {
    try { return JSON.parse(props.propsStr) } catch { return props.initialProps || {} }
  }
  return props.initialProps || {}
})
const currentProps = reactive<Record<string, any>>({ ...inferred.value.init, ...initialFromStr.value })
watch(inferred, v => { Object.assign(currentProps, v.init) })

// events
const parsedEvents = computed<string[]>(() => {
  if (props.eventsStr) {
    try { return JSON.parse(props.eventsStr) } catch { return props.events || [] }
  }
  return props.events || []
})
const eventNames = computed<string[]>(() => {
  if (parsedEvents.value && parsedEvents.value.length) return parsedEvents.value
  const emits = (resolvedComponent.value && (resolvedComponent.value as any).emits) || []
  return Array.isArray(emits) ? emits : Object.keys(emits || {})
})

interface EventLog { name: string; payload: string }
const eventLogs = ref<EventLog[]>([])
const listeners = computed(() => {
  const map: Record<string, Function> = {}
  for (const n of eventNames.value) {
    map[n] = (...args: any[]) => {
      try {
        const payload = JSON.stringify(args.length === 1 ? args[0] : args, null, 2)
        eventLogs.value.unshift({ name: n, payload })
        if (eventLogs.value.length > 50) eventLogs.value.pop()
      } catch {
        eventLogs.value.unshift({ name: n, payload: String(args) })
      }
    }
  }
  return map
})

function clearEvents() { eventLogs.value = [] }
function slotText(name: string) { return (slotDefs.value && (slotDefs.value as any)[name]) || '' }

function stringifyJSON(v: any) { try { return JSON.stringify(v, null, 2) } catch { return '' } }
function onJsonChange(e: Event, key: string) {
  const v = (e.target as HTMLTextAreaElement).value
  try { currentProps[key] = JSON.parse(v) } catch { /* ignore */ }
}

const showCode = ref(!!props.showCode)
function toggleCode() { showCode.value = !showCode.value }

const generatedCode = computed(() => {
  const name = props.componentName || (resolvedComponent.value?.name) || 'MyComponent'
  const attrs: string[] = []
  for (const [k, v] of Object.entries(toRaw(currentProps))) {
    if (typeof v === 'string') attrs.push(`${k}="${v}"`)
    else attrs.push(`:${k}="${stringifyBind(v)}"`)
  }
  let slotStr = ''
  if (slotText('default')) slotStr = `\n  ${slotText('default')}\n`
  return `<template>\n  <${name} ${attrs.join(' ')}>${slotStr}</${name}>\n</template>`
})

function stringifyBind(v: any) {
  if (typeof v === 'string') return v
  try { return JSON.stringify(v) } catch { return String(v) }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
  } catch {
    // ignore
  }
}
</script>

<style scoped>
.ldoc-cpg {
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
  border-radius: 12px;
  background: var(--ldoc-c-bg, #fff);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  max-width: 960px;
  margin: 20px auto;
}

.ldoc-cpg__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--ldoc-c-divider, #e5e7eb);
  background: var(--ldoc-c-bg-soft, #f9fafb);
}

.ldoc-cpg__title {
  font-weight: 600;
  color: var(--ldoc-c-text-1, #111827);
  font-size: 14px;
}

.ldoc-cpg__tools {
  display: flex;
  gap: 8px;
}

.cpg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--ldoc-c-border, var(--ldoc-c-divider, #e5e7eb));
  background: var(--ldoc-c-bg, #fff);
  border-radius: 999px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
  color: var(--ldoc-c-text-2, #6b7280);
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.cpg-btn:hover {
  border-color: var(--ldoc-c-brand, #3b82f6);
  color: var(--ldoc-c-brand, #3b82f6);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.cpg-btn__icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.cpg-btn__label {
  white-space: nowrap;
}

.ldoc-cpg__body {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 1fr);
}

.ldoc-cpg__preview {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 20px 24px;
  background: var(--ldoc-c-bg-soft, #f9fafb);
}

.ldoc-cpg__preview-empty {
  font-size: 13px;
  color: var(--ldoc-c-text-3);
}

.ldoc-cpg__preview-empty code {
  font-family: var(--ldoc-font-family-mono);
  font-size: 12px;
  padding: 0 4px;
}

.ldoc-cpg__panel {
  border-left: 1px solid var(--ldoc-c-divider, #e5e7eb);
  padding: 12px 14px 14px;
  min-width: 260px;
  background: var(--ldoc-c-bg, #fff);
}

.ldoc-cpg__panel-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ldoc-c-text-1);
  font-size: 13px;
}

.ldoc-cpg__panel-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.cpg-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.cpg-field__label {
  color: var(--ldoc-c-text-2, #6b7280);
  font-size: 13px;
}

.cpg-field__control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cpg-input {
  padding: 6px 8px;
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
  border-radius: 6px;
  background: var(--ldoc-c-bg, #fff);
  color: var(--ldoc-c-text-1, #111827);
}

.cpg-input--sm {
  width: 72px;
}

.cpg-slider {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cpg-radio {
  display: flex;
  gap: 8px;
}

.cpg-textarea {
  width: 180px;
  height: 80px;
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
  border-radius: 6px;
  background: var(--ldoc-c-bg, #fff);
  color: var(--ldoc-c-text-1, #111827);
  padding: 6px 8px;
  font-family: var(--ldoc-font-family-mono);
}

.cpg-switch {
  position: relative;
  display: inline-flex;
  width: 36px;
  height: 20px;
  align-items: center;
}

.cpg-switch input {
  display: none;
}

.cpg-switch span {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
  background: var(--ldoc-c-bg-mute, #e5e7eb);
  border-radius: 999px;
}

.cpg-switch span::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--ldoc-shadow-1, 0 1px 2px rgba(15, 23, 42, 0.15));
  transition: transform .2s;
}

.cpg-switch input:checked+span::after {
  transform: translateX(16px);
}

.ldoc-cpg__events {
  margin-top: 8px;
}

.cpg-events__empty {
  color: var(--ldoc-c-text-3, #9ca3af);
  font-size: 12px;
}

.cpg-event {
  border-top: 1px dashed var(--ldoc-c-divider, #e5e7eb);
  padding: 8px 0;
}

.cpg-event__name {
  font-weight: 600;
  font-size: 12px;
  color: var(--ldoc-c-text-2, #6b7280);
}

.cpg-event__payload {
  margin: 4px 0 0;
  font-size: 12px;
  background: var(--ldoc-c-bg-soft, #f9fafb);
  padding: 6px;
  border-radius: 6px;
}

.ldoc-cpg__code {
  border-top: 1px solid var(--ldoc-c-divider, #e5e7eb);
  background: var(--ldoc-c-bg-soft, #f9fafb);
  padding: 12px;
  overflow: auto;
}
</style>
