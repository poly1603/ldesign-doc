# ldoc-plugin-word-count 开发指南

本文档介绍如何开发、调试、打包和发布此插件。

## 项目结构

```
src/
├── index.ts      # 插件入口（Node 端）
└── client.ts     # 客户端代码（可选）
```

## 开发流程

### 1. 安装依赖

```bash
pnpm install
```

### 2. 开发模式

```bash
pnpm dev
```

### 3. 在其他项目测试

```bash
# 在插件目录
pnpm link --global

# 在测试项目
pnpm link --global ldoc-plugin-word-count
```

## 插件开发要点

### 插件入口 (index.ts)

```ts
import type { LDocPlugin, PageData } from '@ldesign/doc'

export interface PluginOptions {
  enabled?: boolean
}

export function wordCount(options: PluginOptions = {}): LDocPlugin {
  return {
    name: 'ldoc-plugin-word-count',
    
    // 客户端配置文件（如果有）
    clientConfigFile: 'ldoc-plugin-word-count/client',
    
    // 扩展页面数据
    async extendPageData(pageData: PageData) {
      // 修改 pageData.frontmatter
    },
    
    // 构建开始
    buildStart() {
      console.log('[plugin] 插件已启用')
    }
  }
}

export default wordCount
```

### 客户端代码 (client.ts)

```ts
import { defineComponent, h } from 'vue'
import type { PluginSlots } from '@ldesign/doc'

// 自定义组件
export const MyComponent = defineComponent({
  setup() {
    return () => h('div', 'Hello from plugin')
  }
})

// 导出 slots（注入到主题的指定位置）
export const slots: PluginSlots = {
  'doc-top': MyComponent
}

// 导出全局组件
export const globalComponents = {
  MyComponent
}
```

### 可用的生命周期钩子

```ts
{
  // Node 端
  config(config, env)           // 修改配置
  configResolved(config)        // 配置解析完成
  extendMarkdown(md)            // 扩展 Markdown
  extendPageData(pageData)      // 扩展页面数据
  buildStart(config)            // 构建开始
  buildEnd(config)              // 构建结束
  
  // 客户端
  slots                         // 注入 UI 到主题
  globalComponents              // 注册全局组件
  enhanceApp(ctx)               // 增强 Vue 应用
}
```

## 调试技巧

1. 使用 `console.log` 在 Node 端调试
2. 使用 Vue DevTools 调试客户端组件
3. 检查浏览器控制台查看错误

## 打包构建

```bash
pnpm build
```

## 发布到 npm

```bash
npm login
pnpm publish
```

### 版本管理

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## 注意事项

1. **exports 配置** - package.json 需要正确配置 exports
2. **客户端代码** - 如有客户端代码需要单独导出
3. **类型导出** - 导出 TypeScript 类型供用户使用

## 许可证

MIT
