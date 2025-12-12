# 插件系统

LDoc 拥有强大的插件系统，可以轻松扩展功能。

## 什么是插件？

插件是一个包含生命周期钩子的对象，可以：

- 扩展 Markdown 语法
- 修改站点配置
- 注入 UI 组件
- 处理页面数据
- 添加客户端功能

## 内置插件

LDoc 提供了丰富的内置插件：

| 插件 | 功能 |
|------|------|
| [searchPlugin](/plugins/search) | 本地全文搜索 |
| [commentPlugin](/plugins/comment) | 评论系统（Giscus/Gitalk/Waline 等） |
| [progressPlugin](/plugins/progress) | 阅读进度条 |
| [copyCodePlugin](/plugins/copy-code) | 代码块复制按钮 |
| [imageViewerPlugin](/plugins/image-viewer) | 图片预览放大 |
| [readingTimePlugin](/plugins/reading-time) | 阅读时间估算 |
| [lastUpdatedPlugin](/plugins/last-updated) | 最后更新时间 |

## 快速使用

```ts
import { defineConfig } from '@ldesign/doc'
import { 
  searchPlugin,
  progressPlugin,
  copyCodePlugin 
} from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin(),
    progressPlugin({ color: '#3b82f6' }),
    copyCodePlugin()
  ]
})
```

## 插件执行顺序

插件按以下规则排序：

1. `enforce: 'pre'` - 最先执行
2. 普通插件 - 按配置顺序
3. `enforce: 'post'` - 最后执行

```ts
definePlugin({
  name: 'my-plugin',
  enforce: 'pre'  // 'pre' | 'post' | number
})
```

## 下一步

- [使用插件](/plugins/using) - 了解如何配置插件
- [内置插件详解](/plugins/search) - 各插件的详细配置
- [开发插件](/plugins/development) - 创建自己的插件
