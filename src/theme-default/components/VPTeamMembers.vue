<template>
  <div class="vp-team-members" :class="[size]">
    <div 
      v-for="member in members" 
      :key="member.name" 
      class="vp-team-member"
    >
      <div class="vp-team-member-avatar">
        <img 
          :src="member.avatar" 
          :alt="member.name"
          loading="lazy"
        />
      </div>
      <div class="vp-team-member-info">
        <h3 class="vp-team-member-name">{{ member.name }}</h3>
        <p v-if="member.title" class="vp-team-member-title">{{ member.title }}</p>
        <p v-if="member.org" class="vp-team-member-org">
          <a 
            v-if="member.orgLink" 
            :href="member.orgLink" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {{ member.org }}
          </a>
          <span v-else>{{ member.org }}</span>
        </p>
        <p v-if="member.desc" class="vp-team-member-desc">{{ member.desc }}</p>
        <div v-if="member.links?.length" class="vp-team-member-links">
          <a 
            v-for="link in member.links" 
            :key="link.link"
            :href="link.link"
            :aria-label="link.ariaLabel || getIconLabel(link.icon)"
            target="_blank"
            rel="noopener noreferrer"
            class="vp-team-member-link"
          >
            <span v-if="typeof link.icon === 'string'" class="vp-team-member-link-icon">
              <component :is="getIconComponent(link.icon)" />
            </span>
            <span v-else v-html="link.icon.svg" class="vp-team-member-link-icon"></span>
          </a>
        </div>
        <a 
          v-if="member.sponsor" 
          :href="member.sponsor" 
          target="_blank" 
          rel="noopener noreferrer"
          class="vp-team-member-sponsor"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          {{ member.actionText || 'Sponsor' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { TeamMember } from '../../types/team'
import type { SocialLink } from '../../types/theme'

interface Props {
  members: TeamMember[]
  size?: 'small' | 'medium'
}

withDefaults(defineProps<Props>(), {
  size: 'medium'
})

// 获取图标标签
const getIconLabel = (icon: string | { svg: string }): string => {
  if (typeof icon === 'string') {
    return icon.charAt(0).toUpperCase() + icon.slice(1)
  }
  return 'Link'
}

// 社交图标映射
const socialIcons: Record<string, string> = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>'
}

// 获取图标组件
const getIconComponent = (icon: string) => {
  const svg = socialIcons[icon.toLowerCase()]
  if (svg) {
    return h('span', { innerHTML: svg })
  }
  return h('span', icon)
}
</script>

<style scoped>
.vp-team-members {
  display: grid;
  gap: 24px;
}

.vp-team-members.small {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.vp-team-members.medium {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.vp-team-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 12px;
  transition: all 0.25s ease;
}

.vp-team-member:hover {
  border-color: var(--ldoc-c-brand);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.dark .vp-team-member:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.vp-team-member-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
  border: 3px solid var(--ldoc-c-brand-soft);
}

.vp-team-members.small .vp-team-member-avatar {
  width: 64px;
  height: 64px;
}

.vp-team-member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vp-team-member-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vp-team-member-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
}

.vp-team-members.small .vp-team-member-name {
  font-size: 16px;
}

.vp-team-member-title {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--ldoc-c-brand);
  font-weight: 500;
}

.vp-team-member-org {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ldoc-c-text-2);
}

.vp-team-member-org a {
  color: inherit;
  text-decoration: none;
}

.vp-team-member-org a:hover {
  color: var(--ldoc-c-brand);
}

.vp-team-member-desc {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--ldoc-c-text-2);
  line-height: 1.5;
}

.vp-team-member-links {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.vp-team-member-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--ldoc-c-text-2);
  transition: color 0.2s ease;
}

.vp-team-member-link:hover {
  color: var(--ldoc-c-brand);
}

.vp-team-member-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.vp-team-member-link-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.vp-team-member-sponsor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #ea4aaa;
  background: rgba(234, 74, 170, 0.1);
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.vp-team-member-sponsor:hover {
  background: rgba(234, 74, 170, 0.2);
}

@media (max-width: 640px) {
  .vp-team-members.small,
  .vp-team-members.medium {
    grid-template-columns: 1fr;
  }
}
</style>
