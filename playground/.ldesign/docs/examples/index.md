---
title: 功能示例
---

# 功能示例

本节通过实际示例展示 LDoc 支持的各种功能，并给出每个功能在 Playground 中对应的入口与说明。

如果你只是想快速确认“这个功能是否可用”，优先从本页开始点击链接即可。

## 示例分类

### Markdown 增强

- [代码块](/examples/markdown/code) - 语法高亮、行号、代码组

### 容器与提示

- [容器与提示](/examples/markdown/containers) - info、tip、warning、danger、自定义标题

### Frontmatter 与页面能力

- [Frontmatter](/guide/frontmatter) - 控制标题、侧边栏、面包屑、相关页面、子页面目录等
- [静态资源](/guide/assets) - 图片/文件等静态资源组织方式

### 媒体资源

- [图片展示](/examples/media/images) - 图片引用、尺寸控制
- [视频嵌入](/examples/media/videos) - 本地视频、iframe 嵌入
- [图标使用](/examples/media/icons) - SVG 图标、图标库

### Vue 组件

- [基础组件](/examples/vue/basic) - 按钮、徽章、卡片
- [交互组件](/examples/vue/interactive) - 计数器、表单、切换

### 组件演示 / Playground

- [组件演示插件](/plugins/demo) - ` ```vue demo ``` ` / ` ```tsx demo ``` `：代码与效果并排展示
- [组件 Playground](/plugins/component-playground) - `::: playground`：交互式控制 Props/事件/插槽

### 高级功能

- [数学公式](/examples/advanced/math) - LaTeX 公式
- [流程图](/examples/advanced/diagrams) - Mermaid 图表

### 站点能力（主题/搜索/评论/统计等）

- [搜索插件](/plugins/search) - 全文索引 + 快捷键唤起 + 搜索弹窗
- [阅读进度条](/plugins/progress) - 顶部阅读进度提示
- [代码复制](/plugins/copy-code) - 代码块一键复制 + 语言标签
- [图片预览](/plugins/image-viewer) - 图片点击放大/缩放
- [阅读时间](/plugins/reading-time) - 基于内容估算阅读时间
- [最后更新时间](/plugins/last-updated) - 显示最后更新时间
- [评论系统](/plugins/comment) - 仅在生产环境启用（Playground 配置中为演示默认关闭）
- [权限/登录](/plugins/auth) - 登录弹窗与用户态示例

### 主题与布局（Layout/Sidebar/TOC）

- [主题定制](/guide/theme) - 主题结构、Layout/NotFound、自定义样式
- [站点结构](/guide/structure) - 路由、目录、约定与生成逻辑

## 快速预览

下面的内容用于快速验证：

- 你的 Markdown 扩展是否已生效（容器语法）
- 页面渲染是否正常（样式、标题、布局）

::: tip 提示
点击上方链接查看详细示例。
:::

::: info 信息
这是一条信息提示。
:::

::: warning 注意
这是一条警告提示。
:::

::: danger 危险
这是一条危险提示，用于展示更强烈的告警信息。
:::
