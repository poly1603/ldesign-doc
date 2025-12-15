# 插件系统修复文档

## 问题描述

评论插件和其他动态插件(如进度条、阅读时间等)在文档站点中不显示。

### 根本原因

1. **插件 slots 收集时缺少上下文**: 
   - 评论插件的 `slots` 是一个函数,需要 `ClientPluginContext` 来访问路由信息 (`ctx.route.path`)
   - 在 `collectPluginSlots` 中传入的是空对象 `{} as never`,导致插件无法获取路由信息来判断是否应该显示

2. **插件被调用时机过早**:
   - 插件在应用创建时就被静态收集,但此时路由还没有初始化
   - 即使传入路由信息也可能是空的,无法正确判断

3. **缺少响应式更新**:
   - 即使路由改变,slots 也不会重新计算
   - 导致依赖路由路径的插件永远无法显示

## 解决方案

### 1. 支持动态 slots 收集

修改 `usePluginSlots.ts`:
- 添加 `pluginContext` 参数到 `collectPluginSlots`
- 添加 `cachePlugins` 函数来缓存插件定义
- 添加 `recollectPluginSlots` 函数来在路由变化时重新收集 slots

### 2. 路由变化时重新收集

在应用初始化代码中:
- 使用 `router.afterEach` 监听路由变化
- 创建包含当前路由信息的插件上下文
- 调用 `recollectPluginSlots` 重新收集 slots

### 3. 初始加载时触发

在应用挂载前:
- 等待路由就绪 (`router.isReady()`)
- 获取当前路由信息
- 执行一次 slots 收集

## 修改的文件

1. `src/client/composables/usePluginSlots.ts`
   - 添加了插件缓存机制
   - 支持动态重新收集 slots
   
2. `src/client/app.ts`
   - 添加路由监听器
   - 初始加载时触发 slots 收集
   
3. `src/client/index.ts`
   - 导出新的工具函数
   
4. `src/node/core/siteData.ts`
   - 更新生成的主应用代码
   - 添加路由监听和 slots 重新收集

## 影响的插件

以下插件现在可以正常工作:

1. **commentPlugin** - 评论系统
   - 根据路由路径判断是否显示
   - 支持 include/exclude 配置
   
2. **progressPlugin** - 阅读进度条
   - 可以在特定页面隐藏
   
3. **lastUpdatedPlugin** - 最后更新时间
   - 可以根据路由配置显示位置
   
4. **其他动态插件** - 所有依赖路由信息的插件

## 测试方法

1. 启动开发服务器:
   ```bash
   cd libraries/doc/playground
   ldoc dev
   ```

2. 访问不同页面,检查:
   - 评论组件是否在正确的位置显示
   - 进度条是否在非首页显示
   - 其他插件是否按配置工作

3. 检查控制台:
   - 不应该有插件相关的错误
   - `[PluginSlot]` 日志应该显示正确的组件数量

## 后续优化建议

1. **性能优化**: 
   - 考虑使用 computed 来缓存 slots 结果
   - 避免不必要的重新渲染

2. **类型改进**:
   - 完善 `ClientPluginContext` 类型定义
   - 为插件上下文添加更多工具方法

3. **插件开发者体验**:
   - 添加插件开发指南
   - 提供更多插件示例
