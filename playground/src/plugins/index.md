---
title: 插件概述
---

# 插件系统

@ldesign/doc 拥有完善的插件系统，让你可以轻松扩展文档站点的功能。

## 什么是插件？

插件是一个包含生命周期钩子和配置的对象，可以：

- **扩展 Markdown** - 添加自定义语法和转换
- **修改配置** - 动态调整站点配置
- **注入组件** - 在页面特定位置注入 UI 组件
- **处理数据** - 扩展页面和站点数据
- **添加路由** - 创建动态路由
- **注入脚本** - 添加客户端功能

## 使用插件

在 `doc.config.ts` 中配置插件：

```ts
import { defineConfig } from '@ldesign/doc'
import { 
  searchPlugin, 
  commentPlugin,
  progressPlugin 
} from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    // 搜索插件
    searchPlugin({
      hotkeys: ['/', 'Ctrl+K']
    }),
    
    // 评论插件
    commentPlugin({
      provider: 'giscus',
      giscus: {
        repo: 'owner/repo',
        repoId: 'xxx',
        category: 'Announcements',
        categoryId: 'xxx'
      }
    }),
    
    // 阅读进度条
    progressPlugin()
  ]
})
```

## 插件执行顺序

插件按照以下规则排序执行：

1. `enforce: 'pre'` - 最先执行
2. 普通插件 - 按配置顺序执行
3. `enforce: 'post'` - 最后执行

也可以使用数字指定顺序：

```ts
definePlugin({
  name: 'my-plugin',
  enforce: 50  // 数字越小越先执行，默认 100
})
```

## 内置插件

@ldesign/doc 提供了丰富的内置插件：

| 插件 | 描述 |
|------|------|
| [`searchPlugin`](/plugins/built-in#searchplugin) | 本地全文搜索 |
| [`commentPlugin`](/plugins/built-in#commentplugin) | 评论系统 |
| [`progressPlugin`](/plugins/built-in#progressplugin) | 阅读进度条 |
| [`imageViewerPlugin`](/plugins/built-in#imageviewerplugin) | 图片预览 |
| [`copyCodePlugin`](/plugins/built-in#copycodeplugin) | 代码复制 |
| [`lastUpdatedPlugin`](/plugins/built-in#lastupdatedplugin) | 最后更新时间 |
| [`readingTimePlugin`](/plugins/built-in#readingtimeplugin) | 阅读时间 |

详见 [内置插件](/plugins/built-in)。

## 插件生命周期

插件可以使用以下生命周期钩子：

### 配置阶段

```ts
{
  // 修改用户配置
  config(config, env) {
    return { ...config, title: 'Modified' }
  },
  
  // 配置解析完成
  configResolved(config) {
    console.log('Config:', config)
  }
}
```

### 构建阶段

```ts
{
  // 构建开始
  buildStart(config) {},
  
  // 页面渲染前
  onBeforePageRender(page) {},
  
  // 页面渲染后
  onAfterPageRender(page) {},
  
  // 所有页面生成后
  generateBundle(config) {},
  
  // 构建完成
  buildEnd(config) {}
}
```

### 客户端阶段

```ts
{
  // 客户端初始化
  onClientInit(ctx) {},
  
  // 客户端挂载完成
  onClientMounted(ctx) {},
  
  // 页面切换后
  onClientUpdated(ctx) {}
}
```

### 路由钩子

```ts
{
  // 路由切换前
  onBeforeRouteChange(to, from) {
    // 返回 false 可以阻止导航
  },
  
  // 路由切换后
  onAfterRouteChange(to) {}
}
```

## 插件上下文

客户端钩子会收到 `ClientPluginContext`，提供丰富的 API：

```ts
onClientMounted(ctx) {
  // 路由
  ctx.route.go('/guide/')
  ctx.route.scrollToAnchor('#section')
  
  // 数据
  const page = ctx.data.getPageData()
  const isDark = ctx.data.isDark()
  
  // UI
  ctx.ui.showToast('操作成功', { type: 'success' })
  ctx.ui.copyToClipboard(text)
  
  // 存储
  ctx.storage.set('key', value)
  ctx.storage.get('key')
  
  // 事件
  ctx.events.on('custom-event', handler)
  ctx.events.emit('custom-event', data)
}
```

## UI 注入

插件可以在预定义的位置注入 UI 组件：

```ts
{
  slots: {
    'nav-bar-content-before': {
      component: MyComponent,
      props: { /* ... */ },
      order: 0
    },
    'doc-after': {
      component: CommentBox,
      order: 100
    }
  }
}
```

### 可用的注入位置

| 位置 | 描述 |
|------|------|
| `nav-bar-logo-after` | Logo 之后 |
| `nav-bar-content-before` | 导航内容之前 |
| `nav-bar-content-after` | 导航内容之后 |
| `sidebar-top` | 侧边栏顶部 |
| `sidebar-bottom` | 侧边栏底部 |
| `aside-top` | 右侧栏顶部 |
| `aside-bottom` | 右侧栏底部 |
| `doc-before` | 文档内容之前 |
| `doc-after` | 文档内容之后 |
| `doc-top` | 文档顶部 |
| `doc-bottom` | 文档底部 |
| `doc-footer-before` | 页脚之前 |
| `doc-footer-after` | 页脚之后 |
| `layout-top` | 布局顶部 |
| `layout-bottom` | 布局底部 |
| `home-hero-before` | 首页 Hero 之前 |
| `home-hero-after` | 首页 Hero 之后 |
| `home-features-before` | 首页特性之前 |
| `home-features-after` | 首页特性之后 |

## 全局组件

插件可以注册全局组件，在任何 Markdown 中使用：

```ts
{
  globalComponents: [
    {
      name: 'MyBadge',
      component: BadgeComponent
    }
  ]
}
```

使用：

```md
<MyBadge text="新功能" type="tip" />
```

## 下一步

- 查看 [内置插件](/plugins/built-in) 了解各插件的详细配置
- 学习 [插件开发](/plugins/development) 创建自己的插件
