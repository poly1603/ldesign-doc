# 客户端 API

客户端 API 用于在主题和组件中访问文档数据。

## useData

获取页面和站点数据：

```ts
import { useData } from '@ldesign/doc/client'

const { 
  page,        // 当前页面数据
  site,        // 站点数据
  theme,       // 主题配置
  frontmatter, // 当前页面 frontmatter
  headers      // 当前页面标题
} = useData()
```

## useRoute / useRouter

路由相关：

```ts
import { useRoute, useRouter } from '@ldesign/doc/client'

const route = useRoute()   // 当前路由
const router = useRouter() // 路由实例
```

## useDark

暗色模式：

```ts
import { useDark } from '@ldesign/doc/client'

const { isDark, toggle } = useDark()
```

## useSidebar

侧边栏状态：

```ts
import { useSidebar } from '@ldesign/doc/client'

const { isOpen, toggle, close } = useSidebar()
```

## 内置组件

| 组件 | 描述 |
|------|------|
| `<Content />` | 渲染 Markdown 内容 |
| `<ClientOnly />` | 仅在客户端渲染 |
| `<OutboundLink />` | 外部链接 |
| `<CodeGroup />` | 代码组 |
| `<Demo />` | Vue 组件演示 |
| `<ReactDemo />` | React 组件演示 |
