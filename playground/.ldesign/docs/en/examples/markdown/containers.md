# Containers & Extensions

Custom containers and markdown extensions for better documentation.

## Info Containers

### Info

::: info
This is an informational message providing additional context.
:::

### Tip

::: tip
Here's a helpful tip to improve your workflow!
:::

### Warning

::: warning
Be careful! This action may have unintended consequences.
:::

### Danger

::: danger
This is a critical warning. Proceed with caution!
:::

### Details (Collapsible)

::: details Click to see more
This content is hidden by default and can be expanded by clicking.

You can include any content here:
- Lists
- Code blocks
- Images
:::

## Custom Title

::: info Custom Title
You can customize the title of any container.
:::

::: tip Pro Tip
Advanced users might find this useful.
:::

::: warning Deprecation Notice
This feature will be removed in the next major version.
:::

## Nested Content

::: tip Complex Example
You can include various content types:

```js
const example = 'code blocks work too'
```

| Tables | Also | Work |
|--------|------|------|
| A      | B    | C    |

- Bullet points
- Work as expected

1. Numbered lists
2. Are supported too
:::

## GitHub-style Alerts

> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for better results.

> [!IMPORTANT]
> Key information users need to know.

> [!WARNING]
> Urgent info requiring immediate attention.

> [!CAUTION]
> Potential negative outcomes to be aware of.

## Badge

Documentation <Badge type="tip" text="v1.0" />

Features <Badge type="warning" text="Beta" />

Deprecated <Badge type="danger" text="Removed" />
