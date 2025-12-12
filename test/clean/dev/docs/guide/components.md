# 组件预览

本页展示主题的各种组件效果。

## 标题

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 文本样式

这是普通文本。**这是加粗文本**。*这是斜体文本*。~~这是删除线文本~~。

## 链接

这是一个 [内部链接](/guide/)。

这是一个 [外部链接](https://github.com)。

## 列表

### 无序列表

- 项目一
- 项目二
  - 子项目
  - 子项目
- 项目三

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 代码

行内代码：`const foo = 'bar'`

代码块：

```ts
interface Theme {
  Layout: Component
  NotFound?: Component
  enhanceApp?: (ctx: EnhanceAppContext) => void
}

export function defineTheme(theme: Theme): Theme {
  return theme
}
```

## 提示块

::: tip 提示
这是一个提示信息。
:::

::: warning 警告
这是一个警告信息。
:::

::: danger 危险
这是一个危险提示。
:::

::: info 信息
这是一个普通信息。
:::

## 表格

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `Layout` | `Component` | - | 布局组件 |
| `NotFound` | `Component` | - | 404 页面 |
| `enhanceApp` | `Function` | - | 增强函数 |

## 图片

![占位图片](https://via.placeholder.com/600x300/3b82f6/ffffff?text=Theme+Preview)

## 分割线

---

## 引用

> 好的设计是让产品变得有用。
> 
> — Dieter Rams
