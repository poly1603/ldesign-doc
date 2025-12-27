# API 文档生成插件

自动从 TypeScript 源代码生成 API 文档。

## 功能特性

- ✅ TypeScript 类型提取（类型、函数、类、接口）
- ✅ JSDoc/TSDoc 注释解析
- ✅ 模块层级导航生成
- ✅ 类型引用链接
- ✅ 分组配置
- ✅ 开发模式热更新

## 使用方法

```typescript
import { defineConfig } from '@ldesign/doc'
import { apiDocPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    apiDocPlugin({
      // TypeScript 源文件路径
      include: ['src/**/*.ts'],
      
      // 排除文件
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      
      // 输出目录
      outDir: 'api',
      
      // TSDoc 配置
      tsdoc: {
        parseExamples: true,
        customTags: ['internal', 'beta']
      },
      
      // 文档模板
      template: 'detailed',
      
      // 分组配置
      groups: [
        {
          name: 'core',
          pattern: 'src/core/**/*.ts',
          title: 'Core API',
          description: 'Core functionality'
        },
        {
          name: 'utils',
          pattern: 'src/utils/**/*.ts',
          title: 'Utilities'
        }
      ],
      
      // 启用类型链接
      typeLinks: true,
      
      // 开发模式监听
      watch: true
    })
  ]
})
```

## 配置选项

### `include`

- 类型: `string[]`
- 必需: 是

TypeScript 源文件路径，支持 glob 模式。

### `exclude`

- 类型: `string[]`
- 默认: `[]`

排除的文件路径，支持 glob 模式。

### `outDir`

- 类型: `string`
- 默认: `'api'`

API 文档输出目录，相对于 docs 目录。

### `tsdoc`

- 类型: `object`
- 默认: `{}`

TSDoc 解析配置：

- `parseExamples`: 是否解析 `@example` 标签
- `customTags`: 自定义标签列表

### `template`

- 类型: `'default' | 'minimal' | 'detailed'`
- 默认: `'default'`

文档模板类型：

- `default`: 标准模板
- `minimal`: 简化模板
- `detailed`: 详细模板

### `groups`

- 类型: `ApiGroup[]`
- 默认: `[]`

API 分组配置，用于组织导航结构。

### `typeLinks`

- 类型: `boolean`
- 默认: `true`

是否生成类型引用链接。

### `watch`

- 类型: `boolean`
- 默认: `true`

开发模式下是否监听源文件变化。

## 示例

### 基础用法

```typescript
apiDocPlugin({
  include: ['src/**/*.ts'],
  exclude: ['**/*.test.ts']
})
```

### 分组配置

```typescript
apiDocPlugin({
  include: ['src/**/*.ts'],
  groups: [
    {
      name: 'components',
      pattern: 'src/components/**/*.ts',
      title: 'Components',
      description: 'UI Components'
    },
    {
      name: 'hooks',
      pattern: 'src/hooks/**/*.ts',
      title: 'Hooks',
      description: 'React Hooks'
    }
  ]
})
```

### 详细模板

```typescript
apiDocPlugin({
  include: ['src/**/*.ts'],
  template: 'detailed',
  tsdoc: {
    parseExamples: true,
    customTags: ['internal', 'beta', 'deprecated']
  },
  typeLinks: true
})
```

## 支持的 JSDoc 标签

- `@param` - 参数描述
- `@returns` / `@return` - 返回值描述
- `@example` - 示例代码
- `@deprecated` - 废弃标记
- `@see` - 相关链接
- `@since` - 版本信息
- `@internal` - 内部 API
- `@beta` - Beta 功能
- 自定义标签（通过 `tsdoc.customTags` 配置）

## 生成的文档结构

```
docs/
  api/
    index.md              # API 首页
    modules/
      core/
        index.md          # 模块首页
        function-name.md  # 函数文档
        class-name.md     # 类文档
      utils/
        index.md
        ...
```

## 类型链接

当启用 `typeLinks` 时，文档中的类型引用会自动生成链接：

```typescript
/**
 * 创建用户
 * @param user - 用户信息
 * @returns 创建的用户
 */
function createUser(user: UserInput): User {
  // ...
}
```

生成的文档中，`UserInput` 和 `User` 会自动链接到对应的类型文档。

## 注意事项

1. 确保 TypeScript 源文件有正确的类型定义
2. 使用 JSDoc 注释提供详细的文档说明
3. 导出的 API 才会被提取到文档中
4. 建议使用 `@example` 标签提供使用示例

