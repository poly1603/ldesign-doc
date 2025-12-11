import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['@ldesign/doc', 'vue', 'vite']
})
