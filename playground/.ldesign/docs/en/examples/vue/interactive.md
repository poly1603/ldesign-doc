# Interactive Components

Advanced interactive Vue components in documentation.

## Tabs Component

<script setup>
import { ref } from 'vue'

const activeTab = ref('tab1')
</script>

<div style="border: 1px solid var(--ldoc-c-divider); border-radius: 8px; overflow: hidden;">
  <div style="display: flex; background: var(--ldoc-c-bg-soft); border-bottom: 1px solid var(--ldoc-c-divider);">
    <button 
      v-for="tab in ['tab1', 'tab2', 'tab3']" 
      :key="tab"
      @click="activeTab = tab"
      :style="{
        padding: '12px 24px',
        border: 'none',
        background: activeTab === tab ? 'var(--ldoc-c-bg)' : 'transparent',
        color: activeTab === tab ? 'var(--ldoc-c-brand)' : 'var(--ldoc-c-text-2)',
        cursor: 'pointer',
        borderBottom: activeTab === tab ? '2px solid var(--ldoc-c-brand)' : '2px solid transparent'
      }">
      Tab {{ tab.slice(-1) }}
    </button>
  </div>
  <div style="padding: 20px;">
    <div v-show="activeTab === 'tab1'">Content for Tab 1</div>
    <div v-show="activeTab === 'tab2'">Content for Tab 2</div>
    <div v-show="activeTab === 'tab3'">Content for Tab 3</div>
  </div>
</div>

## Accordion

<script setup>
import { ref } from 'vue'

const openItems = ref([])

const toggleItem = (id) => {
  const index = openItems.value.indexOf(id)
  if (index > -1) {
    openItems.value.splice(index, 1)
  } else {
    openItems.value.push(id)
  }
}
</script>

<div style="border: 1px solid var(--ldoc-c-divider); border-radius: 8px; overflow: hidden;">
  <div v-for="i in 3" :key="i">
    <button 
      @click="toggleItem(i)"
      style="width: 100%; padding: 16px; text-align: left; background: var(--ldoc-c-bg-soft); border: none; border-bottom: 1px solid var(--ldoc-c-divider); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
      <span>Section {{ i }}</span>
      <span>{{ openItems.includes(i) ? '−' : '+' }}</span>
    </button>
    <div v-show="openItems.includes(i)" style="padding: 16px; border-bottom: 1px solid var(--ldoc-c-divider);">
      Content for section {{ i }}. Click the header to collapse.
    </div>
  </div>
</div>

## Progress Bar

<script setup>
import { ref } from 'vue'

const progress = ref(60)
</script>

<div style="margin: 20px 0;">
  <input type="range" v-model="progress" min="0" max="100" style="width: 100%;">
  <div style="height: 20px; background: var(--ldoc-c-bg-soft); border-radius: 10px; overflow: hidden; margin-top: 8px;">
    <div :style="{ width: progress + '%', height: '100%', background: 'var(--ldoc-c-brand)', transition: 'width 0.3s' }"></div>
  </div>
  <p style="text-align: center; margin-top: 8px;">{{ progress }}%</p>
</div>

## Theme Toggle Demo

<script setup>
import { ref } from 'vue'

const isDark = ref(false)
</script>

<div :style="{ 
  padding: '20px', 
  background: isDark ? '#1a1a1a' : '#ffffff', 
  color: isDark ? '#ffffff' : '#1a1a1a',
  borderRadius: '8px',
  border: '1px solid var(--ldoc-c-divider)',
  transition: 'all 0.3s'
}">
  <button 
    @click="isDark = !isDark"
    style="padding: 8px 16px; background: var(--ldoc-c-brand); color: white; border: none; border-radius: 4px; cursor: pointer;">
    Toggle: {{ isDark ? 'Dark' : 'Light' }}
  </button>
  <p style="margin-top: 12px;">This is a mini theme toggle demo!</p>
</div>

## Form Example

<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  name: '',
  email: '',
  message: ''
})
const submitted = ref(false)

const handleSubmit = () => {
  submitted.value = true
  setTimeout(() => submitted.value = false, 2000)
}
</script>

<div style="padding: 20px; background: var(--ldoc-c-bg-soft); border-radius: 8px;">
  <div style="margin-bottom: 16px;">
    <label style="display: block; margin-bottom: 4px; font-weight: 500;">Name</label>
    <input v-model="form.name" style="width: 100%; padding: 8px; border: 1px solid var(--ldoc-c-divider); border-radius: 4px; box-sizing: border-box;">
  </div>
  <div style="margin-bottom: 16px;">
    <label style="display: block; margin-bottom: 4px; font-weight: 500;">Email</label>
    <input v-model="form.email" type="email" style="width: 100%; padding: 8px; border: 1px solid var(--ldoc-c-divider); border-radius: 4px; box-sizing: border-box;">
  </div>
  <button 
    @click="handleSubmit"
    style="padding: 10px 20px; background: var(--ldoc-c-brand); color: white; border: none; border-radius: 4px; cursor: pointer;">
    Submit
  </button>
  <div v-if="submitted" style="margin-top: 12px; padding: 12px; background: var(--ldoc-c-green-soft, #dcfce7); color: var(--ldoc-c-green, #16a34a); border-radius: 4px;">
    ✓ Form submitted successfully!
  </div>
</div>
