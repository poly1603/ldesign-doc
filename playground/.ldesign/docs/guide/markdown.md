# Markdown 语法指南

LDoc 支持完整的 Markdown 语法，并提供了丰富的扩展功能。本文档列出所有支持的语法特性。

## 基础语法

### 标题

使用 `#` 创建标题，支持 h1 到 h6：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

### 段落与换行

普通段落之间用空行分隔。行尾两个空格或 `<br>` 实现换行。

### 文本样式

```markdown
**粗体文本**
*斜体文本*
***粗斜体***
~~删除线~~
<u>下划线</u>
<mark>高亮标记</mark>
`行内代码`
```

**粗体文本**、*斜体文本*、***粗斜体***、~~删除线~~、<u>下划线</u>、<mark>高亮标记</mark>、`行内代码`

### 列表

**无序列表**
```markdown
- 项目一
- 项目二
  - 嵌套项目
  - 嵌套项目
- 项目三
```

- 项目一
- 项目二
  - 嵌套项目
  - 嵌套项目
- 项目三

**有序列表**
```markdown
1. 第一步
2. 第二步
3. 第三步
```

1. 第一步
2. 第二步
3. 第三步

**任务列表**
```markdown
- [x] 已完成任务
- [ ] 未完成任务
```

- [x] 已完成任务
- [ ] 未完成任务

### 引用

```markdown
> 这是一段引用文本。
> 
> 可以包含多个段落。
```

> 这是一段引用文本。
> 
> 可以包含多个段落。

### 链接

```markdown
[链接文本](https://example.com)
[链接文本](https://example.com "链接标题")
<https://example.com>
```

### 图片

```markdown
![图片描述](/logo.svg)
![图片描述](/logo.svg "图片标题")
```

图片支持**点击放大预览**功能。

### 分隔线

```markdown
---
***
___
```

---

## 代码相关

### 行内代码

```markdown
使用 `npm install` 安装依赖
```

使用 `npm install` 安装依赖

### 代码块

使用三个反引号创建代码块，并指定语言：

````markdown
```javascript
function hello() {
  console.log('Hello, World!')
}
```
````

```javascript
function hello() {
  console.log('Hello, World!')
}
```

### 支持的语言

LDoc 支持以下语言的语法高亮：

| 语言 | 标识符 |
|------|--------|
| JavaScript | `js`, `javascript` |
| TypeScript | `ts`, `typescript` |
| Vue | `vue` |
| JSX | `jsx` |
| TSX | `tsx` |
| HTML | `html` |
| CSS | `css` |
| SCSS | `scss` |
| Less | `less` |
| JSON | `json` |
| YAML | `yaml` |
| Markdown | `md`, `markdown` |
| Python | `python`, `py` |
| Java | `java` |
| Go | `go` |
| Rust | `rust` |
| C | `c` |
| C++ | `cpp` |
| SQL | `sql` |
| Shell | `bash`, `sh` |
| Diff | `diff` |

### 代码行高亮

```typescript{2,4-5}
interface User {
  id: number      // 这行高亮
  name: string
  email: string   // 这行高亮
  age: number     // 这行高亮
}
```

### 行号显示

代码块默认显示行号，可通过配置关闭。

## 表格

```markdown
| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 内容1  | 内容2 | 内容3  |
| 内容4  | 内容5 | 内容6  |
```

| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 内容1  | 内容2 | 内容3  |
| 内容4  | 内容5 | 内容6  |

## 自定义容器

LDoc 提供多种自定义容器用于突出显示内容。

### 提示容器

```markdown
::: tip 提示
这是一个提示信息。
:::
```

::: tip 提示
这是一个提示信息，用于提供有用的建议和最佳实践。
:::

### 警告容器

```markdown
::: warning 注意
这是一个警告信息。
:::
```

::: warning 注意
这是一个警告信息，提醒用户需要注意的事项。
:::

### 危险容器

```markdown
::: danger 危险
这是一个危险警告。
:::
```

::: danger 危险
这是一个危险警告，标记可能导致问题的操作。
:::

### 信息容器

```markdown
::: info 信息
这是一条说明信息。
:::
```

::: info 信息
这是一条说明信息，提供额外的背景知识。
:::

### 详情容器

可折叠的详情容器：

```markdown
::: details 点击展开查看详情
这里是被折叠的详细内容。
支持任意 Markdown 语法。
:::
```

::: details 点击展开查看详情
这里是被折叠的详细内容。

- 支持列表
- 支持代码
- 支持其他 Markdown

```js
console.log('Hello')
```
:::

## 组件演示

`Demo` 组件用于展示代码示例和运行效果：

```markdown
<Demo info="按钮组件示例">
  <button style="padding: 8px 16px; background: #3451b2; color: white; border: none; border-radius: 6px;">
    点击我
  </button>
  
  <template #code>
    ```html
    <button class="btn">点击我</button>
    ```
  </template>
</Demo>
```

## 代码组

在多个代码块之间切换：

```markdown
<CodeGroup>
  <template #tab-0>
    ```npm
    npm install @ldesign/doc
    ```
  </template>
  <template #tab-1>
    ```yarn
    yarn add @ldesign/doc
    ```
  </template>
  <template #tab-2>
    ```pnpm
    pnpm add @ldesign/doc
    ```
  </template>
</CodeGroup>
```

## 键盘按键

使用 `<kbd>` 标签显示键盘按键：

```html
<kbd>Ctrl</kbd> + <kbd>C</kbd>
```

常用快捷键：<kbd>Ctrl</kbd> + <kbd>C</kbd> 复制，<kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴

macOS：<kbd>⌘</kbd> + <kbd>C</kbd> 复制，<kbd>⌘</kbd> + <kbd>V</kbd> 粘贴

## 徽章

使用徽章标记状态：

```html
<span class="badge tip">稳定</span>
<span class="badge warning">实验性</span>
<span class="badge danger">废弃</span>
<span class="badge info">新功能</span>
```

状态标记：<span class="badge tip">稳定</span> <span class="badge warning">实验性</span> <span class="badge danger">废弃</span> <span class="badge info">新功能</span>

## 步骤列表

使用 `::: steps` 容器创建带序号的步骤列表（纯 Markdown 语法）：

```markdown
::: steps

1. **安装依赖**
   
   运行 `npm install @ldesign/doc`

2. **初始化配置**
   
   运行 `npx ldoc init`

3. **启动开发**
   
   运行 `npm run docs:dev`

:::
```

::: steps

1. **安装依赖**
   
   运行 `npm install @ldesign/doc`

2. **初始化配置**
   
   运行 `npx ldoc init`

3. **启动开发**
   
   运行 `npm run docs:dev`

:::

## 卡片容器

使用 `::: card` 创建卡片容器：

```markdown
::: card 卡片标题
这是卡片内容，支持 **Markdown** 语法。
:::
```

::: card 功能特性
- 🚀 快速启动
- 📦 开箱即用
- 🎨 主题定制
:::

## 卡片网格

使用 `::: card-grid` 创建卡片网格布局：

```markdown
::: card-grid 3

::: card 特性一
描述内容...
:::

::: card 特性二
描述内容...
:::

:::
```

## 文件树

使用 `::: file-tree` 展示项目结构：

```markdown
::: file-tree
- 📁 src
  - 📁 components
    - 📄 Button.vue
    - 📄 Input.vue
  - 📁 styles
    - 🎨 index.css
  - 📄 main.ts
- 📄 package.json
- 📝 README.md
:::
```

::: file-tree
- 📁 src
  - 📁 components
    - 💚 Button.vue
    - 💚 Input.vue
  - 📁 styles
    - 🎨 index.css
  - 🔷 main.ts
- 📋 package.json
- 📝 README.md
:::

## 媒体支持

### 图片

标准图片语法：

```markdown
![Alt 文本](/path/to/image.png)
```

图片支持**点击放大预览**功能，鼠标悬停有阴影效果。

### 视频容器

使用 `::: video` 嵌入视频：

```markdown
::: video /path/to/video.mp4
:::
```

或传统 HTML 方式：

```html
<video controls width="100%">
  <source src="/video/demo.mp4" type="video/mp4">
</video>
```

### 音频容器

使用 `::: audio` 嵌入音频：

```markdown
::: audio /path/to/audio.mp3
:::
```

或传统 HTML 方式：

```html
<audio controls>
  <source src="/audio/demo.mp3" type="audio/mpeg">
</audio>
```

## Frontmatter

在文档顶部使用 YAML 格式的 frontmatter：

```yaml
---
title: 页面标题
description: 页面描述
sidebar: true
outline: [2, 3]
---
```

### 支持的字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 页面标题 |
| `description` | string | 页面描述（用于 SEO） |
| `sidebar` | boolean | 是否显示侧边栏 |
| `outline` | number \| [number, number] | 目录显示级别 |
| `layout` | 'home' \| 'doc' | 页面布局类型 |
| `footer` | boolean | 是否显示页脚 |

## 目录生成

文档右侧会自动生成目录（TOC），基于页面中的标题。

可以在 frontmatter 中配置目录级别：

```yaml
---
outline: [2, 3]  # 只显示 h2 和 h3
---
```

或使用 `deep` 显示所有级别：

```yaml
---
outline: deep  # 显示 h2-h6
---
```

## 锚点链接

所有标题都会自动生成锚点链接，可以直接链接到某个标题：

```markdown
[跳转到代码相关](#代码相关)
```

[跳转到代码相关](#代码相关)

## 外部链接

外部链接会自动添加外部链接图标和 `target="_blank"`：

[Vue.js 官网](https://vuejs.org)

## HTML 支持

可以在 Markdown 中直接使用 HTML：

```html
<div style="padding: 16px; background: #f5f5f5; border-radius: 8px;">
  自定义 HTML 内容
</div>
```

<div style="padding: 16px; background: var(--ldoc-c-bg-soft); border-radius: 8px; margin: 16px 0;">
  自定义 HTML 内容
</div>

## 数学公式

支持 LaTeX 数学公式（需要启用插件）：

行内公式：`$E = mc^2$`

块级公式：
```latex
$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$
```

## 脚注

添加脚注引用[^1]和另一个脚注[^2]。

[^1]: 这是第一个脚注的内容。
[^2]: 这是第二个脚注的内容。

## 定义列表

```markdown
术语
: 术语的定义内容
```

## 缩写

```markdown
*[HTML]: Hyper Text Markup Language
*[CSS]: Cascading Style Sheets

HTML 和 CSS 是前端基础技术。
```

---

以上是 LDoc 支持的所有 Markdown 语法特性。更多详细信息请参考 [配置文档](/guide/config)
