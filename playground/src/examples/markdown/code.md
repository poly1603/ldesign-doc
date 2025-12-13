---
title: 代码块
---

# 代码块

LDoc 使用 Shiki 提供语法高亮，支持多种编程语言。

## 基础语法高亮

### JavaScript

```js
function greet(name) {
  console.log('Hello, ' + name + '!')
  return 'Hello, ' + name + '!'
}

greet('World')
```

### TypeScript

```ts
interface User {
  id: number
  name: string
  email: string
}

function getUser(id: number): User {
  return {
    id,
    name: 'John',
    email: 'john@example.com'
  }
}
```

### Vue

```vue
<template>
  <button @click="count++">
    Count: {{ count }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

## 行高亮

使用 `{行号}` 语法高亮特定行：

```js{2,4}
function example() {
  const highlighted = true  // 这行高亮
  const normal = false
  return highlighted        // 这行也高亮
}
```

## 多语言示例

### Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

### Go

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

### Rust

```rust
fn main() {
    println!("Hello, World!");
}
```
