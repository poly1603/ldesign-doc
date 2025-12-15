/**
 * 社交分享插件
 */
import { definePlugin } from '../../plugin/definePlugin'
import { defineComponent, h, computed } from 'vue'
import type { LDocPlugin } from '../../shared/types'

export interface SocialSharePluginOptions {
  /** 启用的分享平台 */
  platforms?: Array<'twitter' | 'facebook' | 'linkedin' | 'weibo' | 'wechat' | 'qq' | 'telegram' | 'reddit' | 'email'>
  /** 分享标题模板，{title} 会被替换为页面标题 */
  titleTemplate?: string
  /** 是否显示在文章底部 */
  showAtBottom?: boolean
  /** 是否显示在侧边栏 */
  showInSidebar?: boolean
}

const platformConfig = {
  twitter: {
    name: 'Twitter',
    icon: '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>',
    getUrl: (url: string, title: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  facebook: {
    name: 'Facebook',
    icon: '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>',
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    getUrl: (url: string, title: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  weibo: {
    name: '微博',
    icon: '<path d="M10.098 20c-4.612 0-8.598-2.075-8.598-5.603 0-1.848 1.071-3.98 2.916-6.004 2.458-2.693 5.317-4.135 6.381-3.223.478.41.506 1.173.16 2.14-.143.402.224.479.548.33 1.636-.752 3.079-.814 3.797-.088.386.39.474.956.307 1.63-.09.366.088.452.348.452.268 0 .612-.07 1.016-.185 2.075-.593 3.63.058 4.116 1.538.547 1.667-.605 4.063-3.019 5.907C14.938 18.71 12.195 20 10.098 20z"/>',
    getUrl: (url: string, title: string) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  wechat: {
    name: '微信',
    icon: '<path d="M8.5 11a1 1 0 100-2 1 1 0 000 2zm5 0a1 1 0 100-2 1 1 0 000 2z"/><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.844 1.353 5.386 3.5 7.085V22l3.5-2c.96.268 1.973.414 3 .414 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2z"/>',
    getUrl: () => '' // 微信需要二维码
  },
  qq: {
    name: 'QQ',
    icon: '<path d="M12 2C6.48 2 2 5.92 2 10.8c0 2.8 1.43 5.28 3.67 6.9l-.58 2.3L8 18.45c1.27.4 2.6.6 4 .6 5.52 0 10-3.92 10-8.8S17.52 2 12 2z"/>',
    getUrl: (url: string, title: string) => `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  telegram: {
    name: 'Telegram',
    icon: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
    getUrl: (url: string, title: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  reddit: {
    name: 'Reddit',
    icon: '<circle cx="12" cy="12" r="10"/><path d="M14.5 17c-.83.5-1.83.75-2.5.75s-1.67-.25-2.5-.75M8.5 13a.5.5 0 100-1 .5.5 0 000 1zm7 0a.5.5 0 100-1 .5.5 0 000 1z"/>',
    getUrl: (url: string, title: string) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  email: {
    name: '邮件',
    icon: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
    getUrl: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
  }
}

/**
 * 社交分享组件
 */
const SocialShareBar = defineComponent({
  name: 'LDocSocialShare',
  props: {
    platforms: { type: Array, default: () => ['twitter', 'facebook', 'linkedin', 'weibo'] },
    titleTemplate: { type: String, default: '{title}' }
  },
  setup(props) {
    const pageUrl = computed(() => typeof window !== 'undefined' ? window.location.href : '')
    const pageTitle = computed(() => {
      if (typeof document !== 'undefined') {
        const title = document.title
        return props.titleTemplate.replace('{title}', title)
      }
      return ''
    })

    const share = (platform: string) => {
      const config = platformConfig[platform as keyof typeof platformConfig]
      if (!config) return

      const url = config.getUrl(pageUrl.value, pageTitle.value)
      if (url) {
        window.open(url, '_blank', 'width=600,height=400')
      }
    }

    return () => h('div', {
      class: 'ldoc-social-share',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 0',
        borderTop: '1px solid var(--ldoc-c-divider, #e5e7eb)'
      }
    }, [
      h('span', {
        style: {
          fontSize: '14px',
          color: 'var(--ldoc-c-text-2, #6b7280)',
          marginRight: '8px'
        }
      }, '分享到：'),
      ...(props.platforms as string[]).map(platform => {
        const config = platformConfig[platform as keyof typeof platformConfig]
        if (!config) return null

        return h('button', {
          key: platform,
          title: config.name,
          onClick: () => share(platform),
          style: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--ldoc-c-divider, #e5e7eb)',
            background: 'var(--ldoc-c-bg, #fff)',
            color: 'var(--ldoc-c-text-2, #6b7280)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          },
          onMouseenter: (e: MouseEvent) => {
            const el = e.target as HTMLElement
            el.style.borderColor = 'var(--ldoc-c-brand, #3b82f6)'
            el.style.color = 'var(--ldoc-c-brand, #3b82f6)'
          },
          onMouseleave: (e: MouseEvent) => {
            const el = e.target as HTMLElement
            el.style.borderColor = 'var(--ldoc-c-divider, #e5e7eb)'
            el.style.color = 'var(--ldoc-c-text-2, #6b7280)'
          }
        }, [
          h('svg', {
            width: 16,
            height: 16,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': 2,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            innerHTML: config.icon
          })
        ])
      })
    ])
  }
})

export function socialSharePlugin(options: SocialSharePluginOptions = {}): LDocPlugin {
  const {
    platforms = ['twitter', 'facebook', 'linkedin', 'weibo'],
    titleTemplate = '{title}',
    showAtBottom = true
  } = options

  return definePlugin({
    name: 'ldoc-plugin-social-share',

    slots: showAtBottom ? {
      'doc-after': {
        component: SocialShareBar,
        props: { platforms, titleTemplate } as Record<string, unknown>,
        order: 50
      }
    } : {},

    globalComponents: [
      { name: 'LDocSocialShare', component: SocialShareBar }
    ]
  })
}

export default socialSharePlugin
