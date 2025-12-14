# Code Blocks

LDoc provides powerful code block features for technical documentation.

## Basic Syntax Highlighting

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet('World')
```

```python
def greet(name):
    print(f"Hello, {name}!")

greet("World")
```

```rust
fn main() {
    println!("Hello, World!");
}
```

## Line Numbers

```js:line-numbers
const a = 1
const b = 2
const c = 3
const d = 4
const e = 5
```

## Line Highlighting

Highlight specific lines:

```js{1,3-4}
const highlighted = true  // Line 1 highlighted
const normal = false
const alsoHighlighted = true  // Lines 3-4 highlighted
const stillHighlighted = true
```

## Code Focus

Focus on specific lines (dim others):

```js
const important = 'focus here' // [!code focus]
const lessImportant = 'dimmed'
const alsoImportant = 'focus' // [!code focus]
```

## Diff Highlighting

Show additions and removals:

```js
const oldValue = 'before' // [!code --]
const newValue = 'after'  // [!code ++]
```

## Error/Warning Highlighting

```js
const error = 'this is wrong' // [!code error]
const warning = 'be careful'  // [!code warning]
```

## Code Groups

::: code-group
```npm
npm install @ldesign/doc
```
```pnpm
pnpm add @ldesign/doc
```
```yarn
yarn add @ldesign/doc
```
:::

## File Names

```ts [doc.config.ts]
export default defineConfig({
  title: 'My Docs'
})
```

## Long Code with Scroll

```javascript
// This is a long line of code that demonstrates horizontal scrolling in code blocks when the content exceeds the available width

function processData(input) {
  const result = input
    .filter(item => item.active)
    .map(item => ({ ...item, processed: true }))
    .reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {})
  
  return result
}
```
