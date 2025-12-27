# Feedback Plugin

反馈插件 - 支持文档反馈收集和贡献者信息显示

## 功能特性

- ✅ "是否有帮助" 反馈组件
- ✅ 评分系统
- ✅ 反馈表单
- ✅ 内联建议
- ✅ 贡献者信息显示
- ✅ 多种存储方式（本地、API、GitHub Issues）

## 安装使用

```ts
import { feedbackPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    feedbackPlugin({
      type: 'helpful',
      helpful: {
        question: 'Was this page helpful?',
        yesText: 'Yes',
        noText: 'No',
        followUp: {
          enabled: true,
          placeholder: 'Tell us more...'
        }
      },
      storage: {
        type: 'github',
        githubRepo: 'owner/repo'
      },
      position: 'doc-bottom',
      contributors: {
        enabled: true,
        mode: 'avatars',
        maxCount: 5
      }
    })
  ]
})
```

## 配置选项

### 基础配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'helpful' \| 'rating' \| 'form' \| 'inline'` | - | 反馈类型 |
| `storage` | `FeedbackStorageConfig` | - | 存储配置（必需） |
| `position` | `'doc-bottom' \| 'doc-footer' \| 'floating'` | `'doc-bottom'` | 显示位置 |
| `enableInDev` | `boolean` | `false` | 是否在开发模式下启用 |

### "是否有帮助" 配置

```ts
helpful: {
  question: string          // 问题文本
  yesText: string          // "是" 按钮文本
  noText: string           // "否" 按钮文本
  followUp: {
    enabled: boolean       // 是否启用后续反馈
    placeholder: string    // 输入框占位符
  }
}
```

### 存储配置

#### 本地存储

```ts
storage: {
  type: 'local'
}
```

#### API 存储

```ts
storage: {
  type: 'api',
  endpoint: 'https://api.example.com/feedback'
}
```

#### GitHub Issues

```ts
storage: {
  type: 'github',
  githubRepo: 'owner/repo',
  githubToken: 'ghp_xxx' // 可选，用于私有仓库
}
```

### 贡献者配置

```ts
contributors: {
  enabled: boolean,           // 是否启用
  mode: 'avatars' | 'list' | 'detailed',  // 显示模式
  maxCount: number,          // 最大显示数量
  showStats: boolean,        // 是否显示统计信息
  repoPath: string          // Git 仓库路径（默认为当前目录）
}
```

## 显示模式

### Avatars 模式

显示贡献者头像网格：

```ts
contributors: {
  enabled: true,
  mode: 'avatars',
  maxCount: 10
}
```

### List 模式

显示贡献者列表（带名称和统计）：

```ts
contributors: {
  enabled: true,
  mode: 'list',
  showStats: true
}
```

### Detailed 模式

显示详细的贡献者卡片：

```ts
contributors: {
  enabled: true,
  mode: 'detailed',
  showStats: true
}
```

## 组件使用

### HelpfulWidget

```vue
<template>
  <LDocHelpfulWidget
    question="Was this helpful?"
    yes-text="Yes"
    no-text="No"
    :follow-up-enabled="true"
    follow-up-placeholder="Tell us more..."
  />
</template>
```

### Contributors

```vue
<template>
  <LDocContributors
    mode="avatars"
    :show-stats="true"
  />
</template>
```

## API

### storeFeedback

存储反馈数据：

```ts
import { storeFeedback } from '@ldesign/doc/plugins/feedback'

await storeFeedback(
  {
    page: '/guide/getting-started',
    type: 'helpful',
    isHelpful: true,
    timestamp: new Date().toISOString()
  },
  {
    type: 'github',
    githubRepo: 'owner/repo'
  }
)
```

### extractContributors

从 Git 历史提取贡献者：

```ts
import { extractContributors } from '@ldesign/doc/plugins/feedback'

const contributors = await extractContributors(
  'docs/guide.md',
  {
    enabled: true,
    maxCount: 5
  }
)
```

## 样式定制

插件使用 CSS 变量，可以通过覆盖变量来定制样式：

```css
:root {
  --ldoc-c-brand-1: #3eaf7c;
  --ldoc-c-brand-2: #42b983;
  --ldoc-c-brand-soft: rgba(62, 175, 124, 0.14);
  --ldoc-c-bg: #ffffff;
  --ldoc-c-bg-soft: #f6f6f7;
  --ldoc-c-divider: #e2e2e3;
  --ldoc-c-text-1: #213547;
  --ldoc-c-text-2: #476582;
  --ldoc-c-text-3: #90a4b7;
}
```

## 注意事项

1. **GitHub Issues 存储**：需要配置 `githubToken` 才能创建 Issues，建议使用环境变量
2. **贡献者提取**：需要在 Git 仓库中运行，且文件需要有提交历史
3. **性能考虑**：贡献者提取会执行 Git 命令，建议在构建时而非运行时执行
4. **隐私保护**：贡献者邮箱会用于生成 Gravatar 头像，确保符合隐私政策

## 示例

完整示例请参考：[examples/feedback-demo](../../examples/feedback-demo)

## 许可证

MIT
