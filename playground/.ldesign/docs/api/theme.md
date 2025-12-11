# 主题 API

主题 API 用于创建自定义主题。

## Theme 接口

```ts
interface Theme {
  // 主题布局组件
  Layout: Component
  
  // 404 页面组件
  NotFound?: Component
  
  // 增强 App 实例
  enhanceApp?: (ctx: EnhanceAppContext) => void | Promise<void>
  
  // 主题扩展
  extends?: Theme
  
  // 自定义样式
  styles?: string[]
}
```

## EnhanceAppContext

```ts
interface EnhanceAppContext {
  app: App        // Vue 应用实例
  router: Router  // 路由实例
  siteData: SiteData
}
```

## 默认主题组件

默认主题提供以下可复用组件：

- `VPNav` - 导航栏
- `VPSidebar` - 侧边栏
- `VPHome` - 首页布局
- `VPDoc` - 文档布局
- `VPFooter` - 页脚
- `VPOutline` - 大纲
- `VPBackToTop` - 回到顶部

导入方式：

```ts
import { VPNav, VPSidebar } from '@ldesign/doc/theme-default'
```
