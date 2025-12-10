<template>
  <div class="vp-home">
    <!-- Hero 区域 -->
    <section v-if="hero" class="vp-home-hero">
      <div class="vp-home-hero-content">
        <h1 class="vp-home-hero-name">
          <span class="vp-home-hero-name-text">{{ hero.name }}</span>
        </h1>
        <p v-if="hero.text" class="vp-home-hero-text">{{ hero.text }}</p>
        <p v-if="hero.tagline" class="vp-home-hero-tagline">{{ hero.tagline }}</p>
        
        <div v-if="hero.actions" class="vp-home-hero-actions">
          <template v-for="action in hero.actions" :key="action.text">
            <a
              v-if="isExternalLink(action.link)"
              :href="action.link"
              target="_blank"
              rel="noopener noreferrer"
              class="vp-home-hero-action"
              :class="action.theme || 'brand'"
            >
              {{ action.text }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <router-link
              v-else
              :to="action.link"
              class="vp-home-hero-action"
              :class="action.theme || 'brand'"
            >
              {{ action.text }}
            </router-link>
          </template>
        </div>
      </div>
      
      <div v-if="hero.image" class="vp-home-hero-image">
        <img :src="hero.image.src || hero.image" :alt="hero.image.alt || ''" />
      </div>
    </section>
    
    <!-- 特性区域 -->
    <section v-if="features && features.length" class="vp-home-features">
      <div class="vp-home-features-container">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="vp-home-feature"
        >
          <div v-if="feature.icon" class="vp-home-feature-icon">
            {{ feature.icon }}
          </div>
          <h3 class="vp-home-feature-title">{{ feature.title }}</h3>
          <p class="vp-home-feature-details">{{ feature.details }}</p>
          <router-link
            v-if="feature.link && !isExternalLink(feature.link)"
            :to="feature.link"
            class="vp-home-feature-link"
          >
            {{ feature.linkText || '了解更多' }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </router-link>
          <a
            v-else-if="feature.link"
            :href="feature.link"
            target="_blank"
            rel="noopener noreferrer"
            class="vp-home-feature-link"
          >
            {{ feature.linkText || '了解更多' }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
    
    <!-- 自定义内容 -->
    <div class="vp-home-content">
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

const { frontmatter } = useData()

const hero = computed<Hero | undefined>(() => {
  return frontmatter.value.hero as Hero
})

const features = computed<Feature[] | undefined>(() => {
  return frontmatter.value.features as Feature[]
})

// 判断是否为外部链接
const isExternalLink = (link: string) => {
  return /^https?:\/\//.test(link)
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
  
  .vp-home-hero-name {
    font-size: 32px;
  }
  
  .vp-home-hero-text {
    font-size: 18px;
  }
  
  .vp-home-hero-image img {
    max-width: 280px;
  }
}
</style>
