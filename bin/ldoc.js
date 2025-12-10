#!/usr/bin/env node

import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = resolve(__dirname, '../dist/es/node/cli.js')

// 使用构建产物
const cliUrl = pathToFileURL(distPath).href
await import(cliUrl)
