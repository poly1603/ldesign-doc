---
title: 组件 Playground 示例
---

# 组件 Playground 示例

用于在文档中交互式演示 Vue 3 组件，支持属性控制、事件查看、代码导出。

- 支持 `::: playground` 容器
- 通过 `componentName` 指定全局组件名称
- 通过字符串化 JSON 传参：`propsStr`、`controlsStr`、`eventsStr`、`slotsStr`

## 基础示例

::: playground componentName="LDocAuthButton" title="基础示例" showCode panelWidth="340px" playgroundHeight="140px" 
propsStr='{"__authConfig":"{\"loginText\":\"立即登录\"}"}'
controlsStr='{"__authConfig":{"type":"json"}}'
默认插槽：这里可写说明或补充文案。
:::

## 可配置登录文案

::: playground componentName="LDocAuthButton" title="自定义登录文案" showCode panelWidth="340px" playgroundHeight="140px"
propsStr='{"__authConfig":"{\"loginText\":\"马上登录\"}"}'
controlsStr='{"__authConfig":{"type":"json"}}'
:::

## 自定义面板宽度与高度

::: playground componentName="LDocAuthButton" title="自定义尺寸" panelWidth="380px" playgroundHeight="180px" showCode
propsStr='{"__authConfig":"{\"loginText\":\"登录 Play\"}"}'
controlsStr='{"__authConfig":{"type":"json"}}'
:::
