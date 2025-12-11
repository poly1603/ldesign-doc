# LDoc 插件和主题测试项目

此目录包含用于测试 LDoc 插件和主题系统的示例项目。

## 项目结构

```
test/
├── reading-time/     # 阅读时间插件
│   ├── src/
│   │   ├── index.ts  # 插件主入口（Node 端）
│   │   └── client.ts # 客户端代码（浏览器端）
│   ├── dist/         # 构建产物
│   └── package.json
│
└── minimal/          # 极简主题
    ├── src/
    │   ├── index.ts  # 主题入口
    │   ├── Layout.vue
    │   ├── NotFound.vue
    │   └── styles/
    ├── dist/         # 构建产物
    └── package.json
```

## 开发流程

### 1. 插件开发

```bash
# 进入插件目录
cd test/reading-time

# 安装依赖（在 monorepo 根目录执行）
pnpm install

# 开发模式（监听文件变化自动构建）
pnpm dev

# 构建
pnpm build
```

### 2. 主题开发

```bash
# 进入主题目录
cd test/minimal

# 开发模式
pnpm dev

# 构建
pnpm build
```

### 3. 在 Playground 中测试

playground 已配置引用这两个本地包：

```typescript
// playground/.ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'
import readingTimePlugin from 'ldoc-plugin-reading-time'

export default defineConfig({
  plugins: [
    readingTimePlugin({
      wordsPerMinute: 300,
      includeCode: true
    })
  ],
  // ... 其他配置
})
```

启动 playground：

```bash
cd playground
pnpm dev
```

## 发布到 NPM

### 插件发布

```bash
cd test/reading-time

# 1. 确保构建成功
pnpm build

# 2. 登录 NPM
npm login

# 3. 发布
npm publish
```

### 主题发布

```bash
cd test/minimal

# 1. 构建
pnpm build

# 2. 发布
npm publish
```

## 功能说明

### reading-time 插件

- **功能**: 计算文章阅读时间并注入到页面 frontmatter
- **配置选项**:
  - `wordsPerMinute`: 每分钟阅读字数（默认 300）
  - `includeCode`: 是否包含代码块（默认 true）
  - `enabled`: 是否启用插件（默认 true）

- **使用方式**:
  ```typescript
  import readingTimePlugin from 'ldoc-plugin-reading-time'
  
  export default defineConfig({
    plugins: [
      readingTimePlugin({ wordsPerMinute: 300 })
    ]
  })
  ```

- **获取阅读时间**:
  ```vue
  <script setup>
  import { useData } from '@ldesign/doc/client'
  const { frontmatter } = useData()
  // frontmatter.readingTime = { minutes: 5, words: 1500, text: '约 5 分钟' }
  </script>
  ```

### minimal 主题

- **功能**: 极简风格的文档主题
- **特性**:
  - 响应式布局
  - 暗色模式支持
  - 可自定义主色调

- **使用方式**:
  ```typescript
  // 方式1: 使用默认主题
  import theme from 'ldoc-theme-minimal'
  
  // 方式2: 自定义配置
  import { createMinimalTheme } from 'ldoc-theme-minimal'
  
  export default createMinimalTheme({
    primaryColor: '#3b82f6'
  })
  ```

## CLI 命令

使用 ldoc CLI 创建新的插件/主题项目：

```bash
# 创建插件项目
npx ldoc create plugin <name>

# 创建主题项目
npx ldoc create theme <name>

# 带描述和作者信息
npx ldoc create plugin my-plugin -d "我的插件" -a "作者名"
```
