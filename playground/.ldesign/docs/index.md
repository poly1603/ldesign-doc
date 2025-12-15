---
layout: home
title: LDoc 现代化文档框架

hero:
  name: LDesign Doc
  text: 现代化文档生成框架
  tagline: 基于 Vite，支持 Vue/React，开箱即用
  canvas:
    type: particles
    speed: 1
    density: 1
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/polyester-design/ldesign

features:
  - icon: zap
    title: Vite 驱动
    details: 享受 Vite 带来的极速开发体验，毫秒级热更新，开发效率提升 10 倍
  - icon: file-text
    title: Markdown 增强
    details: 代码高亮、容器语法、数学公式、Mermaid 图表等丰富扩展
  - icon: palette
    title: 高度可定制
    details: 灵活的主题系统，支持 Vue/React 组件，自定义布局和样式
  - icon: plug
    title: 插件生态
    details: 评论系统、搜索、阅读时间、图片预览等 10+ 内置插件
  - icon: search
    title: 全文搜索
    details: 内置搜索插件，支持快捷键唤起，毫秒级响应
  - icon: code
    title: 代码演示
    details: 支持 Vue/React 组件实时预览，代码与效果并排展示
  - icon: globe
    title: 多语言支持
    details: 内置国际化支持，轻松构建多语言文档站点
  - icon: smartphone
    title: 响应式设计
    details: 移动端友好，任何设备上都有出色的阅读体验
  - icon: terminal
    title: CLI 工具
    details: 一键创建项目，快速启动开发，支持模板定制
  - icon: sparkles
    title: 主题切换动画
    details: 多种主题切换动画效果，圆形扩散、淡入淡出、翻转等
  - icon: cpu
    title: TypeScript 优先
    details: 完整的类型定义，智能代码补全，开发体验极佳
  - icon: box
    title: 组件库文档
    details: 专为组件库设计，支持 Props 表格、Slots、Events 文档生成

stats:
  - value: "10+"
    title: 内置插件
  - value: "< 1s"
    title: 热更新速度
  - value: "100%"
    title: TypeScript
  - value: MIT
    title: 开源协议

quickStart:
  title: 快速上手
  description: 只需三步，即可创建你的第一个文档站点
  steps:
    - icon: folder-plus
      title: 创建项目
      description: 运行脚手架并选择合适的模板
    - icon: package
      title: 安装依赖
      description: 进入目录，一键安装依赖包
    - icon: play
      title: 启动开发
      description: 热更新开发服务器立即可用
  commands:
    - name: pnpm
      recommended: true
      code: |
        pnpm create ldoc my-docs
        cd my-docs && pnpm install
        pnpm dev
    - name: npm
      code: |
        npm create ldoc my-docs
        cd my-docs && npm install
        npm run dev
    - name: yarn
      code: |
        yarn create ldoc my-docs
        cd my-docs && yarn
        yarn dev

roadmap:
  title: 开发路线图
  items:
    - version: v1.0
      title: 核心功能
      status: done
      icon: check-circle
    - version: v1.1
      title: 插件系统
      status: done
      icon: puzzle
    - version: v1.2
      title: 多语言支持
      status: active
      icon: languages
    - version: v1.3
      title: SSR 优化
      status: planned
      icon: server
    - version: v2.0
      title: AI 文档助手
      status: planned
      icon: sparkles

community:
  title: 社区与支持
  cards:
    - icon: message-circle
      title: GitHub Discussions
      description: 提问、分享想法、参与讨论
      link: https://github.com
      linkText: 加入讨论
    - icon: bug
      title: 问题反馈
      description: 发现 Bug？提交 Issue
      link: https://github.com
      linkText: 报告问题
    - icon: git-pull-request
      title: 贡献代码
      description: 欢迎提交 PR 参与开发
      link: https://github.com
      linkText: 开始贡献
---