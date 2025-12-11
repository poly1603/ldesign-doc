<template>
  <div class="vp-home">
    <!-- Hero 区域 -->
    <section v-if="hero" class="vp-home-hero">
      <div class="vp-home-hero-bg">
        <div class="vp-home-hero-bg-glow"></div>
      </div>
      <div class="vp-home-hero-container">
        <div class="vp-home-hero-content">
          <p v-if="hero.tagline" class="vp-home-hero-tagline">{{ hero.tagline }}</p>
          <h1 class="vp-home-hero-name">
            <span class="vp-home-hero-name-text">{{ hero.name }}</span>
          </h1>
          <p v-if="hero.text" class="vp-home-hero-text">{{ hero.text }}</p>

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
        </div>

        <div v-if="hero.image" class="vp-home-hero-image">
          <div class="vp-home-hero-image-container">
            <img :src="typeof hero.image === 'string' ? hero.image : hero.image.src"
              :alt="typeof hero.image === 'string' ? '' : (hero.image.alt || '')" />
          </div>
        </div>
      </div>
    </section>

    <!-- 特性区域 -->
    <section v-if="features && features.length" class="vp-home-features">
      <div class="vp-home-section-header" v-if="frontmatter.featuresTitle">
        <h2>{{ frontmatter.featuresTitle }}</h2>
        <p v-if="frontmatter.featuresDescription">{{ frontmatter.featuresDescription }}</p>
      </div>
      <div class="vp-home-features-container">
        <div v-for="feature in features" :key="feature.title" class="vp-home-feature">
          <div v-if="feature.icon" class="vp-home-feature-icon">
            {{ feature.icon }}
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
        <a v-for="sponsor in sponsors" :key="sponsor.name" :href="sponsor.link" target="_blank" class="vp-home-sponsor">
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
        <router-link v-if="banner.link && !isExternalLink(banner.link)" :to="banner.link" class="vp-home-banner-action">
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

    <!-- 自定义内容 -->
    <div v-if="$slots.default" class="vp-home-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '../composables'

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

const { frontmatter } = useData()

const hero = computed<Hero | undefined>(() => {
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
</script>

<style scoped>
.vp-home {
  max-width: var(--ldoc-layout-max-width, 1400px);
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero */
.vp-home-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  min-height: 60vh;
  padding: 64px 0;
  text-align: center;
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
  padding: 24px;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 12px;
  transition: all 0.2s;
}

.vp-home-feature:hover {
  border-color: var(--ldoc-c-brand);
  box-shadow: var(--ldoc-shadow-2);
}

.vp-home-feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
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
  display: inline-block;
  margin-top: 12px;
  color: var(--ldoc-c-brand);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.vp-home-feature-link:hover {
  text-decoration: underline;
}

/* Hero Background */
.vp-home-hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: -1;
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
