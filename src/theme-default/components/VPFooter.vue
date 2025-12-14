<template>
  <footer v-if="footer || socialLinks.length" class="vp-footer">
    <div class="vp-footer-container">
      <!-- 链接区域 -->
      <div v-if="footerLinks && footerLinks.length" class="vp-footer-links">
        <div v-for="group in footerLinks" :key="group.title" class="vp-footer-link-group">
          <h4 class="vp-footer-link-title">{{ group.title }}</h4>
          <ul class="vp-footer-link-list">
            <li v-for="link in group.items" :key="link.text">
              <a v-if="isExternalLink(link.link)" :href="link.link" target="_blank" rel="noopener noreferrer">
                {{ link.text }}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <router-link v-else :to="link.link">{{ link.text }}</router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- 分隔线 -->
      <div v-if="footerLinks && footerLinks.length" class="vp-footer-divider"></div>

      <!-- 底部区域 -->
      <div class="vp-footer-bottom">
        <!-- 社交链接 -->
        <div v-if="socialLinks.length" class="vp-footer-social">
          <a v-for="social in socialLinks" :key="social.link" :href="social.link" target="_blank"
            rel="noopener noreferrer" class="vp-footer-social-link" :title="social.icon">
            <svg v-if="social.icon === 'github'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <svg v-else-if="social.icon === 'twitter'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </a>
        </div>

        <!-- 信息 -->
        <div class="vp-footer-info">
          <p v-if="footer?.message" class="vp-footer-message" v-html="footer.message"></p>
          <p v-if="footer?.copyright" class="vp-footer-copyright" v-html="footer.copyright"></p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from '../composables'

const { site, theme } = useData()
const route = useRoute()

// 获取当前语言环境
const currentLocale = computed(() => {
  const locales = site.value.locales as Record<string, { link?: string }> | undefined
  if (!locales) return 'root'
  for (const key of Object.keys(locales)) {
    if (key === 'root') continue
    const locale = locales[key]
    if (locale.link && route.path.startsWith(locale.link)) {
      return key
    }
  }
  return 'root'
})

// 获取语言环境感知的主题配置
const localeTheme = computed(() => {
  const baseTheme = theme.value as Record<string, unknown>
  const locales = site.value.locales as Record<string, { themeConfig?: Record<string, unknown> }> | undefined
  const localeConfig = locales?.[currentLocale.value]?.themeConfig

  if (!localeConfig) return baseTheme
  return { ...baseTheme, ...localeConfig }
})

interface FooterLink {
  text: string
  link: string
}

interface FooterLinkGroup {
  title: string
  items: FooterLink[]
}

interface Footer {
  message?: string
  copyright?: string
  links?: FooterLinkGroup[]
}

interface SocialLink {
  icon: string
  link: string
}

const footer = computed<Footer | undefined>(() => {
  const config = localeTheme.value as { footer?: Footer }
  return config.footer
})

const footerLinks = computed<FooterLinkGroup[]>(() => {
  return footer.value?.links || []
})

const socialLinks = computed<SocialLink[]>(() => {
  const config = localeTheme.value as { socialLinks?: SocialLink[] }
  return config.socialLinks || []
})

const isExternalLink = (link: string) => {
  return /^https?:\/\//.test(link)
}
</script>

<style scoped>
.vp-footer {
  border-top: 1px solid var(--ldoc-c-divider);
  background: var(--ldoc-c-bg-soft);
}

.vp-footer-container {
  max-width: var(--ldoc-layout-max-width, 1400px);
  margin: 0 auto;
  padding: 48px 24px 24px;
}

/* Footer Links */
.vp-footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.vp-footer-link-group {
  display: flex;
  flex-direction: column;
}

.vp-footer-link-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vp-footer-link-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.vp-footer-link-list li {
  margin: 8px 0;
}

.vp-footer-link-list a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ldoc-c-text-2);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.vp-footer-link-list a:hover {
  color: var(--ldoc-c-brand);
}

.vp-footer-link-list a svg {
  opacity: 0.5;
}

/* Divider */
.vp-footer-divider {
  height: 1px;
  background: var(--ldoc-c-divider);
  margin-bottom: 24px;
}

/* Footer Bottom */
.vp-footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

/* Social Links */
.vp-footer-social {
  display: flex;
  gap: 16px;
}

.vp-footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-2);
  transition: all 0.2s;
}

.vp-footer-social-link:hover {
  background: var(--ldoc-c-brand);
  color: white;
}

/* Info */
.vp-footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vp-footer-message,
.vp-footer-copyright {
  margin: 0;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
}

.vp-footer-message :deep(a),
.vp-footer-copyright :deep(a) {
  color: var(--ldoc-c-brand);
  text-decoration: none;
}

.vp-footer-message :deep(a):hover,
.vp-footer-copyright :deep(a):hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .vp-footer-container {
    padding: 32px 16px 16px;
  }

  .vp-footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .vp-footer-bottom {
    gap: 12px;
  }
}
</style>
