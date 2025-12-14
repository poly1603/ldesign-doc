<template>
  <div class="vp-home">
    <!-- Hero 前插槽 -->
    <PluginSlot name="home-hero-before" />

    <!-- Hero 区域 -->
    <section v-if="hero" class="vp-home-hero">
      <div class="vp-home-hero-bg">
        <canvas ref="canvasRef" class="vp-home-hero-canvas"></canvas>
        <div class="vp-home-hero-bg-glow"></div>
      </div>
      <div class="vp-home-hero-container">
        <div class="vp-home-hero-content">
          <p v-if="hero.tagline" class="vp-home-hero-tagline">{{ hero.tagline }}</p>
          <h1 class="vp-home-hero-name">
            <span class="vp-home-hero-name-text">{{ hero.name }}</span>
          </h1>
          <p v-if="hero.text" class="vp-home-hero-text">{{ hero.text }}</p>

          <!-- Hero 信息区插槽 -->
          <PluginSlot name="home-hero-info" />

          <div v-if="hero.actions" class="vp-home-hero-actions">
            <template v-for="action in hero.actions" :key="action.text">
              <a v-if="isExternalLink(action.link)" :href="action.link" target="_blank" rel="noopener noreferrer"
                class="vp-home-hero-action" :class="action.theme || 'brand'">
                {{ action.text }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <router-link v-else :to="action.link" class="vp-home-hero-action" :class="action.theme || 'brand'">
                {{ action.text }}
              </router-link>
            </template>
          </div>

          <!-- Hero 按钮后插槽 -->
          <PluginSlot name="home-hero-actions-after" />
        </div>

        <div v-if="hero.image" class="vp-home-hero-image">
          <div class="vp-home-hero-image-container">
            <img :src="typeof hero.image === 'string' ? hero.image : hero.image.src"
              :alt="typeof hero.image === 'string' ? '' : (hero.image.alt || '')" />
          </div>
        </div>
      </div>
    </section>

    <!-- Hero 后插槽 -->
    <PluginSlot name="home-hero-after" />

    <!-- 内容区域 -->
    <div class="vp-home-inner">
      <!-- 特性前插槽 -->
      <PluginSlot name="home-features-before" />

      <!-- 特性区域 -->
      <section v-if="features && features.length" class="vp-home-features">
        <div class="vp-home-section-header" v-if="frontmatter.featuresTitle">
          <h2>{{ frontmatter.featuresTitle }}</h2>
          <p v-if="frontmatter.featuresDescription">{{ frontmatter.featuresDescription }}</p>
        </div>
        <div class="vp-home-features-container">
          <div v-for="feature in features" :key="feature.title" class="vp-home-feature"
            @mouseenter="onFeatureHover($event)" @mouseleave="onFeatureLeave($event)">
            <div class="vp-home-feature-icon-wrapper">
              <div class="vp-home-feature-icon" v-html="getFeatureIcon(feature.icon)"></div>
            </div>
            <h3 class="vp-home-feature-title">{{ feature.title }}</h3>
            <p class="vp-home-feature-details">{{ feature.details }}</p>
            <router-link v-if="feature.link && !isExternalLink(feature.link)" :to="feature.link"
              class="vp-home-feature-link">
              {{ feature.linkText || '了解更多' }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </router-link>
            <a v-else-if="feature.link" :href="feature.link" target="_blank" rel="noopener noreferrer"
              class="vp-home-feature-link">
              {{ feature.linkText || '了解更多' }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <!-- 特性后插槽 -->
      <PluginSlot name="home-features-after" />

      <!-- 统计数据区域 -->
      <section v-if="stats && stats.length" class="vp-home-stats">
        <div class="vp-home-stats-container">
          <div v-for="stat in stats" :key="stat.title" class="vp-home-stat">
            <span class="vp-home-stat-value">{{ stat.value }}</span>
            <span class="vp-home-stat-title">{{ stat.title }}</span>
          </div>
        </div>
      </section>

      <!-- 代码示例展示区域 -->
      <section v-if="codeExample" class="vp-home-code-example">
        <div class="vp-home-section-header">
          <h2>{{ codeExample.title || '快速开始' }}</h2>
          <p v-if="codeExample.description">{{ codeExample.description }}</p>
        </div>
        <div class="vp-home-code-example-content">
          <div class="vp-home-code-steps" v-if="codeExample.steps">
            <div v-for="(step, index) in codeExample.steps" :key="index" class="vp-home-code-step">
              <span class="vp-home-code-step-number">{{ index + 1 }}</span>
              <div class="vp-home-code-step-content">
                <h4>{{ step.title }}</h4>
                <div class="vp-home-code-step-code" v-if="step.code">
                  <code>{{ step.code }}</code>
                  <button class="vp-home-code-copy" @click="copyCode(step.code)" title="复制">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 赞助商/合作伙伴 -->
      <section v-if="sponsors && sponsors.length" class="vp-home-sponsors">
        <div class="vp-home-section-header">
          <h2>{{ frontmatter.sponsorsTitle || '赞助商' }}</h2>
        </div>
        <div class="vp-home-sponsors-container">
          <a v-for="sponsor in sponsors" :key="sponsor.name" :href="sponsor.link" target="_blank"
            class="vp-home-sponsor">
            <img :src="sponsor.logo" :alt="sponsor.name" />
          </a>
        </div>
      </section>

      <!-- 通用 Banner -->
      <section v-if="banner" class="vp-home-banner">
        <div class="vp-home-banner-content">
          <div class="vp-home-banner-icon" v-if="banner.icon">{{ banner.icon }}</div>
          <div class="vp-home-banner-text">
            <h3 v-if="banner.title">{{ banner.title }}</h3>
            <p v-if="banner.description">{{ banner.description }}</p>
          </div>
          <router-link v-if="banner.link && !isExternalLink(banner.link)" :to="banner.link"
            class="vp-home-banner-action">
            {{ banner.linkText || '了解更多' }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </router-link>
          <a v-else-if="banner.link" :href="banner.link" target="_blank" rel="noopener noreferrer"
            class="vp-home-banner-action">
            {{ banner.linkText || '了解更多' }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </section>

      <!-- 自定义内容（slot 或 markdown 内容） -->
      <div v-if="$slots.default" class="vp-home-content">
        <slot />
      </div>

      <!-- Markdown 内容区域 -->
      <div class="vp-home-content vp-home-markdown">
        <Content />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from '../composables'
import { PluginSlot, Content } from '@ldesign/doc/client'

// 必须在任何引用之前先获取 frontmatter
const { frontmatter } = useData()

// Canvas 动画背景 - 支持多种动画效果
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

// 动画类型: particles(粒子网络), waves(波浪), gradient(渐变), bubbles(气泡), constellation(星座), none(无)
type CanvasAnimationType = 'particles' | 'waves' | 'gradient' | 'bubbles' | 'constellation' | 'none'

interface CanvasConfig {
  type?: CanvasAnimationType
  color?: string  // 自定义颜色
  speed?: number  // 动画速度 0.5-2
  density?: number // 密度 0.5-2
}

const getCanvasConfig = (): CanvasConfig => {
  const config = frontmatter.value.hero as { canvas?: CanvasConfig } | undefined
  return config?.canvas || { type: 'particles' }
}

const getThemeColor = () => {
  const style = getComputedStyle(document.documentElement)
  const hue = style.getPropertyValue('--ldoc-c-brand-hue').trim() || '231'
  return { hue: parseInt(hue) || 231, s: 70, l: 50 }
}

// ========== 粒子网络动画 ==========
const initParticlesAnimation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, config: CanvasConfig) => {
  interface Particle { x: number; y: number; vx: number; vy: number; radius: number; opacity: number }
  const particles: Particle[] = []
  const speed = config.speed || 1
  const density = config.density || 1
  const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 18000 * density))

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6 * speed,
      vy: (Math.random() - 0.5) * 0.6 * speed,
      radius: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.3 + 0.15
    })
  }

  let gradientOffset = 0
  return () => {
    const themeColor = getThemeColor()
    gradientOffset += 0.002 * speed

    const gradient = ctx.createLinearGradient(
      canvas.width * (0.3 + Math.sin(gradientOffset) * 0.2), 0,
      canvas.width * (0.7 + Math.cos(gradientOffset) * 0.2), canvas.height
    )
    gradient.addColorStop(0, `hsla(${themeColor.hue}, 60%, 85%, 0.9)`)
    gradient.addColorStop(0.5, `hsla(${themeColor.hue + 10}, 55%, 88%, 0.85)`)
    gradient.addColorStop(1, `hsla(${themeColor.hue - 10}, 50%, 90%, 0.9)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const color = `hsla(${themeColor.hue}, ${themeColor.s}%, ${themeColor.l}%`
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `${color}, ${p.opacity})`
      ctx.fill()
      particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x, dy = p.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `${color}, ${0.08 * (1 - dist / 120)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      })
    })
  }
}

// ========== 波浪动画 ==========
const initWavesAnimation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, config: CanvasConfig) => {
  let time = 0
  const speed = config.speed || 1

  return () => {
    const themeColor = getThemeColor()
    time += 0.015 * speed

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, `hsla(${themeColor.hue}, 60%, 88%, 0.95)`)
    gradient.addColorStop(1, `hsla(${themeColor.hue + 20}, 50%, 92%, 0.95)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制多层波浪
    const waves = [
      { amp: 30, freq: 0.008, phase: 0, opacity: 0.15, y: 0.7 },
      { amp: 25, freq: 0.012, phase: 2, opacity: 0.12, y: 0.75 },
      { amp: 20, freq: 0.015, phase: 4, opacity: 0.08, y: 0.8 },
    ]

    waves.forEach(wave => {
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)
      for (let x = 0; x <= canvas.width; x += 5) {
        const y = canvas.height * wave.y + Math.sin(x * wave.freq + time + wave.phase) * wave.amp
        ctx.lineTo(x, y)
      }
      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()
      ctx.fillStyle = `hsla(${themeColor.hue}, 70%, 60%, ${wave.opacity})`
      ctx.fill()
    })
  }
}

// ========== 渐变流动动画 ==========
const initGradientAnimation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, config: CanvasConfig) => {
  let time = 0
  const speed = config.speed || 1

  return () => {
    const themeColor = getThemeColor()
    time += 0.005 * speed

    // 动态多点渐变
    const gradient = ctx.createRadialGradient(
      canvas.width * (0.3 + Math.sin(time) * 0.2),
      canvas.height * (0.3 + Math.cos(time * 0.7) * 0.2),
      0,
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width * 0.8
    )
    gradient.addColorStop(0, `hsla(${themeColor.hue + Math.sin(time) * 20}, 70%, 80%, 0.9)`)
    gradient.addColorStop(0.5, `hsla(${themeColor.hue}, 60%, 85%, 0.85)`)
    gradient.addColorStop(1, `hsla(${themeColor.hue - 20}, 50%, 90%, 0.9)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 添加光斑
    for (let i = 0; i < 3; i++) {
      const x = canvas.width * (0.2 + i * 0.3 + Math.sin(time + i) * 0.1)
      const y = canvas.height * (0.3 + Math.cos(time * 0.5 + i * 2) * 0.2)
      const r = 100 + Math.sin(time + i) * 30
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r)
      glow.addColorStop(0, `hsla(${themeColor.hue + i * 30}, 80%, 70%, 0.15)`)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }
}

// ========== 气泡动画 ==========
const initBubblesAnimation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, config: CanvasConfig) => {
  interface Bubble { x: number; y: number; r: number; speed: number; wobble: number; opacity: number }
  const bubbles: Bubble[] = []
  const speed = config.speed || 1
  const density = config.density || 1
  const count = Math.floor(25 * density)

  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      r: Math.random() * 20 + 10,
      speed: (Math.random() * 1 + 0.5) * speed,
      wobble: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.3 + 0.1
    })
  }

  let time = 0
  return () => {
    const themeColor = getThemeColor()
    time += 0.02 * speed

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, `hsla(${themeColor.hue}, 55%, 90%, 0.95)`)
    gradient.addColorStop(1, `hsla(${themeColor.hue + 15}, 60%, 85%, 0.95)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    bubbles.forEach(b => {
      b.y -= b.speed
      b.wobble += 0.02
      const wobbleX = Math.sin(b.wobble) * 2

      if (b.y + b.r < 0) {
        b.y = canvas.height + b.r
        b.x = Math.random() * canvas.width
      }

      // 气泡
      ctx.beginPath()
      ctx.arc(b.x + wobbleX, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${themeColor.hue}, 70%, 70%, ${b.opacity})`
      ctx.fill()

      // 高光
      ctx.beginPath()
      ctx.arc(b.x + wobbleX - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(0, 0%, 100%, ${b.opacity * 0.8})`
      ctx.fill()
    })
  }
}

// ========== 星座动画 ==========
const initConstellationAnimation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, config: CanvasConfig) => {
  interface Star { x: number; y: number; r: number; twinkle: number; speed: number }
  const stars: Star[] = []
  const speed = config.speed || 1
  const density = config.density || 1
  const count = Math.floor(80 * density)

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01
    })
  }

  let time = 0
  return () => {
    const themeColor = getThemeColor()
    time += 0.01 * speed

    // 深色背景
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    )
    gradient.addColorStop(0, `hsla(${themeColor.hue}, 40%, 25%, 0.98)`)
    gradient.addColorStop(1, `hsla(${themeColor.hue + 20}, 50%, 15%, 0.98)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 星星和连线
    stars.forEach((s, i) => {
      s.twinkle += s.speed * speed
      const opacity = 0.4 + Math.sin(s.twinkle) * 0.3

      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r * (1 + Math.sin(s.twinkle) * 0.3), 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${themeColor.hue + 40}, 80%, 80%, ${opacity})`
      ctx.fill()

      // 连接附近星星
      stars.slice(i + 1, i + 10).forEach(s2 => {
        const dx = s.x - s2.x, dy = s.y - s2.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s2.x, s2.y)
          ctx.strokeStyle = `hsla(${themeColor.hue + 40}, 60%, 70%, ${0.1 * (1 - dist / 100)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      })
    })
  }
}

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const config = getCanvasConfig()
  if (config.type === 'none') return

  const resize = () => {
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width;
      canvas.height = rect.height
    }
  }
  resize()
  // Ensure resize happens after a frame to catch layout updates
  requestAnimationFrame(resize)
  window.addEventListener('resize', resize)

  // 监听主题颜色变化
  const observer = new MutationObserver(() => {
    // 强制触发重绘
    resize()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })

  // 根据配置选择动画类型
  let animateFn: (() => void) | null = null
  switch (config.type) {
    case 'waves': animateFn = initWavesAnimation(ctx, canvas, config); break
    case 'gradient': animateFn = initGradientAnimation(ctx, canvas, config); break
    case 'bubbles': animateFn = initBubblesAnimation(ctx, canvas, config); break
    case 'constellation': animateFn = initConstellationAnimation(ctx, canvas, config); break
    case 'particles': default: animateFn = initParticlesAnimation(ctx, canvas, config); break
  }

  const animate = () => {
    animateFn?.()
    animationId = requestAnimationFrame(animate)
  }
  animate()

  return () => {
    window.removeEventListener('resize', resize)
    if (animationId) cancelAnimationFrame(animationId)
  }
}

let cleanup: (() => void) | undefined

onMounted(() => {
  // 使用 nextTick + requestAnimationFrame 确保 DOM 完全渲染后立即初始化
  nextTick(() => {
    requestAnimationFrame(() => {
      cleanup = initCanvas()
    })
  })
})

// 监听 frontmatter 变化，重新初始化 canvas
watch(() => frontmatter.value.hero, () => {
  cleanup?.()
  nextTick(() => {
    requestAnimationFrame(() => {
      cleanup = initCanvas()
    })
  })
}, { deep: true })

onUnmounted(() => {
  cleanup?.()
})

interface HeroAction {
  text: string
  link: string
  theme?: 'brand' | 'alt'
}

interface Hero {
  name?: string
  text?: string
  tagline?: string
  image?: string | { src: string; alt?: string }
  actions?: HeroAction[]
}

interface Feature {
  icon?: string
  title: string
  details: string
  link?: string
  linkText?: string
}

interface Stat {
  value: string
  title: string
}

interface CodeStep {
  title: string
  code: string
}

interface CodeExample {
  title?: string
  description?: string
  steps: CodeStep[]
}

interface Sponsor {
  name: string
  logo: string
  link: string
}

interface Banner {
  icon?: string
  title: string
  description?: string
  link?: string
  linkText?: string
}

// HMR 更新计数器 - 强制重新计算 computed
const hmrUpdateKey = ref(0)

// 监听服务器发送的 WebSocket HMR 消息
if (typeof window !== 'undefined' && (import.meta as any).hot) {
  const hot = (import.meta as any).hot
  hot.on('ldoc:frontmatter-update', (data: { file: string; frontmatter: Record<string, unknown> }) => {
    console.log('[VPHome] Received WS frontmatter update:', data.file)
    // 更新全局 pageData
    if ((window as any).__LDOC_PAGE_DATA__) {
      (window as any).__LDOC_PAGE_DATA__.value = {
        ...(window as any).__LDOC_PAGE_DATA__.value,
        frontmatter: data.frontmatter
      }
    }
    // 强制重新计算
    hmrUpdateKey.value++
  })
}

const hero = computed<Hero | undefined>(() => {
  // 依赖 hmrUpdateKey 确保 HMR 时重新计算
  void hmrUpdateKey.value
  return frontmatter.value.hero as Hero
})

const features = computed<Feature[] | undefined>(() => {
  return frontmatter.value.features as Feature[]
})

const stats = computed<Stat[] | undefined>(() => {
  return frontmatter.value.stats as Stat[]
})

const codeExample = computed<CodeExample | undefined>(() => {
  return frontmatter.value.codeExample as CodeExample
})

const sponsors = computed<Sponsor[] | undefined>(() => {
  return frontmatter.value.sponsors as Sponsor[]
})

const banner = computed<Banner | undefined>(() => {
  return frontmatter.value.banner as Banner
})

// 判断是否为外部链接
const isExternalLink = (link: string) => {
  return /^https?:\/\//.test(link)
}

// 复制代码
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    // 可以添加一个简单的提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// Lucide 图标映射
const iconMap: Record<string, string> = {
  'zap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  'code': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  'palette': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
  'puzzle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/></svg>',
  'layout': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>',
  'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  'rocket': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  'book': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  'plug': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>',
  'globe': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  'smartphone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
  'languages': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>',
  'blocks': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="14" y="3" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/></svg>',
  'component': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/></svg>',
  'box': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  'sparkles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  'terminal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>',
  'cpu': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
}

// 获取图标HTML
const getFeatureIcon = (icon?: string): string => {
  if (!icon) return ''
  // 如果是已知的图标名称，返回SVG
  if (iconMap[icon.toLowerCase()]) {
    return iconMap[icon.toLowerCase()]
  }
  // 否则当作emoji或文本返回
  return `<span class="emoji-icon">${icon}</span>`
}

// 功能卡片鼠标悬停效果
const onFeatureHover = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'translateY(-8px)'
  target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'
}

const onFeatureLeave = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = ''
  target.style.boxShadow = ''
}
</script>

<style scoped>
.vp-home {
  width: 100%;
}

.vp-home-inner {
  max-width: var(--ldoc-layout-max-width, 1400px);
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero - 无左右上边距 */
.vp-home-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  min-height: 55vh;
  padding: 48px 0;
  padding-top: 0;
  text-align: center;
  overflow: hidden;
  margin: 0;
  width: 100%;
  /* 创建堆叠上下文，确保 canvas 背景可见 */
  isolation: isolate;
}

.vp-home-hero-content {
  max-width: 600px;
}

.vp-home-hero-name {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.vp-home-hero-name-text {
  background: linear-gradient(120deg, var(--ldoc-c-brand) 30%, var(--ldoc-c-brand-light));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.vp-home-hero-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin: 24px 0 0;
}

.vp-home-hero-tagline {
  font-size: 18px;
  color: var(--ldoc-c-text-2);
  margin: 16px 0 0;
  line-height: 1.6;
}

.vp-home-hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.vp-home-hero-action {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.vp-home-hero-action.brand {
  background: var(--ldoc-c-brand);
  color: white;
}

.vp-home-hero-action.brand:hover {
  background: var(--ldoc-c-brand-dark);
}

.vp-home-hero-action.alt {
  background: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-1);
  border: 1px solid var(--ldoc-c-divider);
}

.vp-home-hero-action.alt:hover {
  border-color: var(--ldoc-c-brand);
  color: var(--ldoc-c-brand);
}

.vp-home-hero-image img {
  max-width: 400px;
  max-height: 400px;
}

/* Features */
.vp-home-features {
  padding: 64px 0;
}

.vp-home-features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.vp-home-feature {
  padding: 28px;
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.vp-home-feature:hover {
  border-color: var(--ldoc-c-brand);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.dark .vp-home-feature:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.vp-home-feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--ldoc-c-brand-soft), var(--ldoc-c-brand-soft));
  border-radius: 12px;
  transition: all 0.3s ease;
}

.vp-home-feature:hover .vp-home-feature-icon-wrapper {
  background: var(--ldoc-c-brand);
  transform: scale(1.1);
}

.vp-home-feature-icon {
  width: 24px;
  height: 24px;
  color: var(--ldoc-c-brand);
  transition: color 0.3s ease;
}

.vp-home-feature-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.vp-home-feature:hover .vp-home-feature-icon {
  color: white;
}

.vp-home-feature-icon .emoji-icon {
  font-size: 24px;
}

.vp-home-feature-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin: 0 0 8px;
}

.vp-home-feature-details {
  font-size: 14px;
  color: var(--ldoc-c-text-2);
  margin: 0;
  line-height: 1.6;
}

.vp-home-feature-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  color: var(--ldoc-c-brand);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: gap 0.2s ease;
}

.vp-home-feature-link:hover {
  gap: 10px;
}

.vp-home-feature-link svg {
  transition: transform 0.2s ease;
}

.vp-home-feature-link:hover svg {
  transform: translateX(2px);
}

/* Hero Background */
.vp-home-hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: -1;
}

.vp-home-hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  pointer-events: none;
}

.dark .vp-home-hero-canvas {
  opacity: 0.8;
}

.vp-home-hero-bg-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(ellipse at center, var(--ldoc-c-brand-soft) 0%, transparent 70%);
  opacity: 0.5;
}

.vp-home-hero-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  position: relative;
  z-index: 1;
}

.vp-home-hero-image-container {
  position: relative;
}

.vp-home-hero-image-container::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: linear-gradient(135deg, var(--ldoc-c-brand-soft), transparent);
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.5;
  }
}

/* Section Header */
.vp-home-section-header {
  text-align: center;
  margin-bottom: 48px;
}

.vp-home-section-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--ldoc-c-text-1);
  margin: 0;
}

.vp-home-section-header p {
  font-size: 18px;
  color: var(--ldoc-c-text-2);
  margin: 12px 0 0;
}

/* Stats Section */
.vp-home-stats {
  padding: 48px 0;
  background: var(--ldoc-c-bg-soft);
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
}

.vp-home-stats-container {
  display: flex;
  justify-content: center;
  gap: 64px;
  flex-wrap: wrap;
}

.vp-home-stat {
  text-align: center;
}

.vp-home-stat-value {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: var(--ldoc-c-brand);
  line-height: 1;
}

.vp-home-stat-title {
  display: block;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Code Example Section */
.vp-home-code-example {
  padding: 64px 0;
}

.vp-home-code-example-content {
  max-width: 700px;
  margin: 0 auto;
}

.vp-home-code-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vp-home-code-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.vp-home-code-step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldoc-c-brand);
  color: white;
  font-weight: 600;
  font-size: 14px;
  border-radius: 50%;
}

.vp-home-code-step-content {
  flex: 1;
}

.vp-home-code-step-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin: 0 0 8px;
}

.vp-home-code-step-code {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
}

.vp-home-code-step-code code {
  flex: 1;
  font-family: var(--ldoc-font-mono);
  font-size: 14px;
  color: var(--ldoc-c-text-1);
}

.vp-home-code-copy {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--ldoc-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.vp-home-code-copy:hover {
  background: var(--ldoc-c-bg-mute);
  color: var(--ldoc-c-text-1);
}

/* Sponsors Section */
.vp-home-sponsors {
  padding: 64px 0;
  border-top: 1px solid var(--ldoc-c-divider);
}

.vp-home-sponsors-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
}

.vp-home-sponsor {
  display: block;
  padding: 16px 24px;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 12px;
  transition: all 0.2s;
}

.vp-home-sponsor:hover {
  border-color: var(--ldoc-c-brand);
  box-shadow: var(--ldoc-shadow-2);
}

.vp-home-sponsor img {
  height: 40px;
  max-width: 120px;
  object-fit: contain;
  filter: grayscale(1) opacity(0.6);
  transition: filter 0.2s;
}

.vp-home-sponsor:hover img {
  filter: grayscale(0) opacity(1);
}

/* Content */
.vp-home-content {
  padding: 32px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .vp-home-hero {
    flex-direction: column;
    text-align: center;
    padding: 32px 0;
  }

  .vp-home-hero-container {
    flex-direction: column;
  }

  .vp-home-hero-name {
    font-size: 32px;
  }

  .vp-home-hero-text {
    font-size: 18px;
  }

  .vp-home-hero-image img {
    max-width: 280px;
  }

  .vp-home-section-header h2 {
    font-size: 24px;
  }

  .vp-home-stats-container {
    gap: 32px;
  }

  .vp-home-stat-value {
    font-size: 36px;
  }

  .vp-home-code-step {
    flex-direction: column;
    align-items: stretch;
  }

  .vp-home-code-step-number {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .vp-home-sponsors-container {
    gap: 16px;
  }

  .vp-home-sponsor {
    padding: 12px 16px;
  }

  .vp-home-banner-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .vp-home-banner-action {
    margin-top: 8px;
  }
}

/* Banner */
.vp-home-banner {
  padding: 48px 32px;
  background: linear-gradient(135deg, var(--ldoc-c-brand-soft) 0%, var(--ldoc-c-bg) 100%);
  border-top: 1px solid var(--ldoc-c-divider);
}

.vp-home-banner-content {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.vp-home-banner-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.vp-home-banner-text {
  flex: 1;
}

.vp-home-banner-text h3 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--ldoc-c-text-1);
}

.vp-home-banner-text p {
  margin: 0;
  font-size: 16px;
  color: var(--ldoc-c-text-2);
  line-height: 1.6;
}

.vp-home-banner-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--ldoc-c-brand);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  flex-shrink: 0;
}

.vp-home-banner-action:hover {
  background: var(--ldoc-c-brand-dark);
  transform: translateY(-2px);
}
</style>
