---
title: 组件 Playground
---

# 组件 Playground

用于在文档中交互式演示 Vue 3 组件，支持属性控制、事件查看、代码导出。

- 支持 `::: playground` 容器
- 通过 `componentName` 指定全局组件名称，或直接在 Vue 中使用 `<LDocPlayground :component="..." />`
- 通过字符串化 JSON 传参：`propsStr`、`controlsStr`、`eventsStr`、`slotsStr`

## 基础示例

::: playground componentName="LDocAuthButton" title="登录按钮" showCode propsStr='{"loginText":"登录"}'
默认插槽：可以放置一些辅助说明内容。
:::

## 指定事件监听

::: playground componentName="LDocAuthButton" title="事件查看" showCode eventsStr='["login","logout"]'
点击按钮并进行一些交互，事件会显示在右侧事件面板中。
:::

## 自定义面板宽度与高度

::: playground componentName="LDocAuthButton" title="自定义尺寸" panelWidth="320px" playgroundHeight="180px" showCode propsStr='{"loginText":"立即登录"}'
:::
