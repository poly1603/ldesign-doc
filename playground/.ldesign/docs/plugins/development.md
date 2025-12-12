# 插件开发指南

本章介绍如何开发自己的 LDoc 插件。

## 快速开始

### 基础结构

```ts
import { definePlugin } from '@ldesign/doc'

export const myPlugin = definePlugin({
  name: 'my-plugin',
  
  // 生命周期钩子
  configResolved(config) {
    console.log('配置已解析:', config.site.title)
  }
})
```

### 带配置的插件

```ts
import { definePluginFactory } from '@ldesign/doc'

interface MyPluginOptions {
  message?: string
  enabled?: boolean
}

export const myPlugin = definePluginFactory<MyPluginOptions>((options = {}) => {
  const { message = 'Hello', enabled = true } = options
  
  return {
    name: 'my-plugin',
    
    configResolved() {
      if (enabled) {
        console.log(message)
      }
    }
  }
})
```

使用：

```ts
plugins: [
  myPlugin({ message: 'Hello LDoc!', enabled: true })
]
```

## 生命周期钩子

### 配置阶段

```ts
{
  // 修改用户配置
  config(config, env) {
    // env: { mode: 'development' | 'production', command: 'serve' | 'build' }
    return {
      ...config,
      title: config.title + ' - Modified'
    }
  },
  
  // 配置解析完成
  configResolved(config) {
    // config 是完整的解析后配置
    this.siteTitle = config.site.title
  }
}
```

### 构建阶段

```ts
{
  // 构建开始
  async buildStart(config) {
    await initResources()
  },
  
  // 页面渲染前
  onBeforePageRender(ctx) {
    console.log('渲染:', ctx.pageData.relativePath)
  },
  
  // 页面渲染后
  onAfterPageRender(ctx) {
    // ctx.html 可用
  },
  
  // 所有页面生成后
  async generateBundle(config) {
    await writeFile('dist/sitemap.xml', sitemap)
  },
  
  // 构建完成
  async buildEnd(config) {
    console.log('构建完成!')
  }
}
```

### 客户端阶段

```ts
{
  // 客户端初始化
  onClientInit(ctx) {
    // ctx.app: Vue 应用实例
    ctx.app.config.globalProperties.$myPlugin = {}
  },
  
  // 客户端挂载完成
  onClientMounted(ctx) {
    // DOM 已就绪
    initThirdPartyLib()
  },
  
  // 页面切换后
  onClientUpdated(ctx) {
    trackPageView()
  },
  
  // 路由切换前
  onBeforeRouteChange(to, from) {
    // 返回 false 阻止导航
  },
  
  // 路由切换后
  onAfterRouteChange(to) {
    analytics.track(to)
  }
}
```

## 扩展功能

### 扩展 Markdown

```ts
{
  extendMarkdown(md) {
    // md 是 markdown-it 实例
    
    // 使用插件
    md.use(markdownItPlugin)
    
    // 自定义渲染规则
    md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx]
      return `<h${token.tag.slice(1)} class="custom-heading">`
    }
  }
}
```

### 扩展页面数据

```ts
{
  async extendPageData(pageData, ctx) {
    // 添加阅读时间
    const content = ctx.content
    const words = content.length
    pageData.frontmatter.readingTime = Math.ceil(words / 200)
    
    // 添加自定义数据
    pageData.frontmatter.customData = await fetchData()
  }
}
```

### 扩展路由

```ts
{
  extendRoutes(routes) {
    // 添加路由
    routes.push({
      path: '/api-docs',
      component: '/path/to/ApiDocs.vue'
    })
    
    // 修改现有路由
    const homeRoute = routes.find(r => r.path === '/')
    if (homeRoute) {
      homeRoute.meta = { ...homeRoute.meta, custom: true }
    }
    
    return routes
  }
}
```

## UI 注入

### 注入组件到预定义位置

```ts
import { defineComponent, h } from 'vue'

const ProgressBar = defineComponent({
  setup() {
    const progress = ref(0)
    
    onMounted(() => {
      window.addEventListener('scroll', () => {
        const height = document.body.scrollHeight - window.innerHeight
        progress.value = (window.scrollY / height) * 100
      })
    })
    
    return () => h('div', {
      class: 'progress-bar',
      style: { width: `${progress.value}%` }
    })
  }
})

export const progressPlugin = definePlugin({
  name: 'progress',
  
  slots: {
    'layout-top': {
      component: ProgressBar,
      order: 0
    }
  }
})
```

### 动态 Slots

```ts
{
  slots: (ctx) => {
    const showComments = ctx.data.getFrontmatter().comments !== false
    
    if (!showComments) return {}
    
    return {
      'doc-after': {
        component: CommentSection,
        props: { pageId: ctx.route.path }
      }
    }
  }
}
```

### 全局组件

```ts
{
  globalComponents: [
    { name: 'Badge', component: BadgeComponent },
    { name: 'Demo', component: DemoComponent }
  ]
}
```

在 Markdown 中直接使用：

```md
<Badge text="新功能" type="tip" />
```

## 注入代码

### 注入脚本

```ts
{
  headScripts: [
    // 内联脚本
    `console.log('Hello from plugin')`,
    
    // 外部脚本
    `<script src="https://example.com/lib.js" async></script>`
  ]
}
```

### 注入样式

```ts
{
  headStyles: [
    `.my-plugin { color: red; }`,
    `@import url('https://fonts.googleapis.com/css2?family=...');`
  ]
}
```

### 客户端配置文件

```ts
{
  clientConfigFile: `
    export default {
      enhance({ app, router }) {
        // 全局增强
        app.config.globalProperties.$myPlugin = {}
        
        // 路由守卫
        router.beforeEach((to, from) => {
          // ...
        })
      }
    }
  `
}
```

## 完整示例

```ts
import { definePluginFactory, PluginSlotName } from '@ldesign/doc'
import { defineComponent, h, ref, onMounted } from 'vue'

interface ToastPluginOptions {
  duration?: number
  position?: 'top' | 'bottom'
}

const ToastContainer = defineComponent({
  props: ['duration', 'position'],
  setup(props) {
    const toasts = ref<string[]>([])
    
    const show = (message: string) => {
      toasts.value.push(message)
      setTimeout(() => {
        toasts.value.shift()
      }, props.duration)
    }
    
    // 暴露给全局
    if (typeof window !== 'undefined') {
      (window as any).$toast = show
    }
    
    return () => h('div', {
      class: ['toast-container', props.position]
    }, toasts.value.map(msg => 
      h('div', { class: 'toast' }, msg)
    ))
  }
})

export const toastPlugin = definePluginFactory<ToastPluginOptions>((options = {}) => {
  const { duration = 3000, position = 'top' } = options
  
  return {
    name: 'toast',
    
    slots: {
      'layout-bottom': {
        component: ToastContainer,
        props: { duration, position }
      }
    },
    
    headStyles: [`
      .toast-container {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
      }
      .toast-container.top { top: 20px; }
      .toast-container.bottom { bottom: 20px; }
      .toast {
        padding: 12px 24px;
        background: #333;
        color: white;
        border-radius: 8px;
        margin: 8px 0;
      }
    `]
  }
})
```
