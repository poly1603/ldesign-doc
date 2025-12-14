# Info Containers

Showcase of all available container types in LDoc.

## Standard Containers

::: info Information
Use info containers to provide additional context or background information.
:::

::: tip Helpful Tip
Tips help users accomplish tasks more efficiently.
:::

::: warning Warning
Warnings alert users to potential issues or important considerations.
:::

::: danger Danger Zone
Danger alerts indicate critical information that could cause problems.
:::

## Collapsible Details

::: details What is LDoc?
LDoc is a modern documentation framework built on Vite. It provides:

- Fast development with HMR
- Markdown with extensions
- Vue/React component support
- Plugin system
- Multi-language support
:::

::: details Installation Steps
1. Create a new project
2. Install dependencies
3. Configure your site
4. Start writing documentation
:::

## Custom Styled Containers

::: info 📚 Documentation
This container has a custom emoji icon.
:::

::: tip 💡 Pro Tip
Combine emojis with your container titles for visual impact.
:::

::: warning ⚠️ Breaking Change
This feature has changed in the latest version.
:::

## Containers with Code

::: tip Using Environment Variables
Set your API key in the environment:

```bash
export API_KEY=your-secret-key
```

Then access it in your code:

```js
const apiKey = process.env.API_KEY
```
:::

## Nested Lists in Containers

::: info Feature Checklist
- [x] Markdown support
- [x] Syntax highlighting
- [x] Custom containers
- [x] Dark mode
- [ ] PDF export (coming soon)
:::
