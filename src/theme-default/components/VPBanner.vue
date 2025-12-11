<template>
  <div class="vp-banner" :class="[`vp-banner--${effect}`]">
    <canvas ref="canvasRef" class="vp-banner-canvas"></canvas>
    <div class="vp-banner-content">
      <slot>
        <h2 v-if="title" class="vp-banner-title">{{ title }}</h2>
        <p v-if="description" class="vp-banner-description">{{ description }}</p>
        <div v-if="actions && actions.length" class="vp-banner-actions">
          <a v-for="action in actions" :key="action.text" :href="action.link"
            class="vp-banner-action" :class="action.theme || 'primary'"
            :target="isExternal(action.link) ? '_blank' : undefined"
            :rel="isExternal(action.link) ? 'noopener noreferrer' : undefined">
            {{ action.text }}
          </a>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

interface Action {
  text: string
  link: string
  theme?: 'primary' | 'secondary'
}

interface Props {
  title?: string
  description?: string
  actions?: Action[]
  effect?: 'particles' | 'waves' | 'geometric' | 'gradient' | 'stars' | 'network'
  color?: string
  speed?: number
  density?: number
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  effect: 'particles',
  speed: 1,
  density: 1,
  height: '280px'
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let particles: any[] = []
let time = 0

const isExternal = (link: string) => /^https?:\/\//.test(link)

// 获取主题色
const getThemeColor = () => {
  if (props.color) return props.color
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue('--ldoc-c-brand').trim() || '#6366f1'
}

// 粒子效果
const initParticles = (width: number, height: number) => {
  const count = Math.floor((width * height) / 15000 * props.density)
  particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * props.speed,
      vy: (Math.random() - 0.5) * props.speed,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    })
  }
}

const drawParticles = (width: number, height: number) => {
  if (!ctx) return
  const color = getThemeColor()

  ctx.clearRect(0, 0, width, height)

  particles.forEach((p, i) => {
    p.x += p.vx
    p.y += p.vy

    if (p.x < 0 || p.x > width) p.vx *= -1
    if (p.y < 0 || p.y > height) p.vy *= -1

    ctx!.beginPath()
    ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx!.fillStyle = `${color}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`
    ctx!.fill()

    // 连线
    particles.slice(i + 1).forEach(p2 => {
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 120) {
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(p2.x, p2.y)
        ctx!.strokeStyle = `${color}${Math.floor((1 - dist / 120) * 0.3 * 255).toString(16).padStart(2, '0')}`
        ctx!.stroke()
      }
    })
  })
}

// 波浪效果
const drawWaves = (width: number, height: number) => {
  if (!ctx) return
  const color = getThemeColor()

  ctx.clearRect(0, 0, width, height)
  time += 0.02 * props.speed

  for (let wave = 0; wave < 3; wave++) {
    ctx.beginPath()
    ctx.moveTo(0, height)

    for (let x = 0; x <= width; x += 5) {
      const y = height * 0.6 +
        Math.sin(x * 0.01 + time + wave) * 20 +
        Math.sin(x * 0.02 + time * 1.5 + wave) * 15 +
        wave * 20
      ctx.lineTo(x, y)
    }

    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = `${color}${Math.floor((0.1 - wave * 0.03) * 255).toString(16).padStart(2, '0')}`
    ctx.fill()
  }
}

// 几何图形效果
const initGeometric = (width: number, height: number) => {
  const count = Math.floor(20 * props.density)
  particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 60 + 20,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02 * props.speed,
      vx: (Math.random() - 0.5) * 0.5 * props.speed,
      vy: (Math.random() - 0.5) * 0.5 * props.speed,
      shape: Math.floor(Math.random() * 3), // 0: triangle, 1: square, 2: hexagon
      opacity: Math.random() * 0.15 + 0.05
    })
  }
}

const drawGeometric = (width: number, height: number) => {
  if (!ctx) return
  const color = getThemeColor()

  ctx.clearRect(0, 0, width, height)

  particles.forEach(p => {
    p.x += p.vx
    p.y += p.vy
    p.rotation += p.rotationSpeed

    if (p.x < -p.size) p.x = width + p.size
    if (p.x > width + p.size) p.x = -p.size
    if (p.y < -p.size) p.y = height + p.size
    if (p.y > height + p.size) p.y = -p.size

    ctx!.save()
    ctx!.translate(p.x, p.y)
    ctx!.rotate(p.rotation)
    ctx!.beginPath()

    const sides = p.shape === 0 ? 3 : p.shape === 1 ? 4 : 6
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
      const x = Math.cos(angle) * p.size / 2
      const y = Math.sin(angle) * p.size / 2
      if (i === 0) ctx!.moveTo(x, y)
      else ctx!.lineTo(x, y)
    }
    ctx!.closePath()
    ctx!.strokeStyle = `${color}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`
    ctx!.lineWidth = 2
    ctx!.stroke()
    ctx!.restore()
  })
}

// 渐变效果
const drawGradient = (width: number, height: number) => {
  if (!ctx) return
  const color = getThemeColor()
  time += 0.01 * props.speed

  const gradient = ctx.createLinearGradient(
    width * (0.3 + Math.sin(time) * 0.2),
    0,
    width * (0.7 + Math.cos(time) * 0.2),
    height
  )
  gradient.addColorStop(0, `${color}20`)
  gradient.addColorStop(0.5, `${color}10`)
  gradient.addColorStop(1, `${color}05`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 光晕
  for (let i = 0; i < 3; i++) {
    const x = width * (0.3 + i * 0.2 + Math.sin(time + i) * 0.1)
    const y = height * (0.4 + Math.cos(time + i) * 0.2)
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 150)
    glow.addColorStop(0, `${color}15`)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)
  }
}

// 星空效果
const initStars = (width: number, height: number) => {
  const count = Math.floor((width * height) / 8000 * props.density)
  particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.01
    })
  }
}

const drawStars = (width: number, height: number) => {
  if (!ctx) return
  const color = getThemeColor()
  time += 0.016 * props.speed

  ctx.clearRect(0, 0, width, height)

  particles.forEach(p => {
    p.opacity = 0.3 + Math.sin(time * p.twinkleSpeed * 100) * 0.5 + 0.2
    ctx!.beginPath()
    ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx!.fillStyle = `${color}${Math.floor(Math.max(0, Math.min(1, p.opacity)) * 255).toString(16).padStart(2, '0')}`
    ctx!.fill()
  })

  // 流星
  if (Math.random() < 0.005 * props.speed) {
    const meteor = {
      x: Math.random() * width,
      y: 0,
      length: Math.random() * 80 + 40
    }
    ctx.beginPath()
    const gradient = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x + meteor.length, meteor.y + meteor.length)
    gradient.addColorStop(0, `${color}00`)
    gradient.addColorStop(1, `${color}60`)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.moveTo(meteor.x, meteor.y)
    ctx.lineTo(meteor.x + meteor.length, meteor.y + meteor.length)
    ctx.stroke()
  }
}

// 网络效果
const initNetwork = (width: number, height: number) => {
  const cols = Math.ceil(width / 80)
  const rows = Math.ceil(height / 80)
  particles = []
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      particles.push({
        x: i * 80 + 40 + (Math.random() - 0.5) * 20,
        y: j * 80 + 40 + (Math.random() - 0.5) * 20,
        baseX: i * 80 + 40,
        baseY: j * 80 + 40,
        radius: 3
      })
    }
  }
}

const drawNetwork = (width: number, height: number) => {
  if (!ctx) return
  const color = getThemeColor()
  time += 0.02 * props.speed

  ctx.clearRect(0, 0, width, height)

  particles.forEach((p, i) => {
    p.x = p.baseX + Math.sin(time + i * 0.1) * 10
    p.y = p.baseY + Math.cos(time + i * 0.1) * 10

    ctx!.beginPath()
    ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx!.fillStyle = `${color}40`
    ctx!.fill()

    particles.slice(i + 1).forEach(p2 => {
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 100) {
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(p2.x, p2.y)
        ctx!.strokeStyle = `${color}${Math.floor((1 - dist / 100) * 0.3 * 255).toString(16).padStart(2, '0')}`
        ctx!.stroke()
      }
    })
  })
}

// 动画循环
const animate = () => {
  if (!canvasRef.value || !ctx) return
  const { width, height } = canvasRef.value

  switch (props.effect) {
    case 'particles':
      drawParticles(width, height)
      break
    case 'waves':
      drawWaves(width, height)
      break
    case 'geometric':
      drawGeometric(width, height)
      break
    case 'gradient':
      drawGradient(width, height)
      break
    case 'stars':
      drawStars(width, height)
      break
    case 'network':
      drawNetwork(width, height)
      break
  }

  animationId = requestAnimationFrame(animate)
}

// 初始化
const init = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height

  switch (props.effect) {
    case 'particles':
      initParticles(width, height)
      break
    case 'geometric':
      initGeometric(width, height)
      break
    case 'stars':
      initStars(width, height)
      break
    case 'network':
      initNetwork(width, height)
      break
  }

  if (animationId) cancelAnimationFrame(animationId)
  animate()
}

// 响应窗口大小变化
let resizeTimeout: any = null
const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(init, 200)
}

onMounted(() => {
  init()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
})

watch(() => props.effect, init)
</script>

<style scoped>
.vp-banner {
  position: relative;
  width: 100%;
  height: v-bind(height);
  overflow: hidden;
  background: var(--ldoc-c-bg-soft);
}

.vp-banner-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.vp-banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
}

.vp-banner-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: var(--ldoc-c-text-1);
}

.vp-banner-description {
  margin: 0 0 24px;
  font-size: 16px;
  color: var(--ldoc-c-text-2);
  max-width: 600px;
  line-height: 1.6;
}

.vp-banner-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.vp-banner-action {
  display: inline-flex;
  align-items: center;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
}

.vp-banner-action.primary {
  background: var(--ldoc-c-brand);
  color: #fff;
}

.vp-banner-action.primary:hover {
  background: var(--ldoc-c-brand-dark);
  transform: translateY(-2px);
}

.vp-banner-action.secondary {
  background: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-1);
  border: 1px solid var(--ldoc-c-divider);
}

.vp-banner-action.secondary:hover {
  border-color: var(--ldoc-c-brand);
  color: var(--ldoc-c-brand);
}

@media (max-width: 768px) {
  .vp-banner {
    height: auto;
    min-height: 200px;
  }

  .vp-banner-title {
    font-size: 22px;
  }

  .vp-banner-description {
    font-size: 14px;
  }
}
</style>
