import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '**/*.d.ts']
    }
  },
  resolve: {
    alias: {
      '@ldesign/doc': resolve(__dirname, './src'),
      '@ldesign/doc/client': resolve(__dirname, './src/client'),
      '@ldesign/doc/theme': resolve(__dirname, './src/theme'),
      '@ldesign/doc/theme-default': resolve(__dirname, './src/theme-default')
    }
  }
})
