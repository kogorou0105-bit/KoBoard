import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@koboard/editor': path.resolve(__dirname, '../../packages/editor/src'),
      '@koboard/common': path.resolve(__dirname, '../../packages/common/src')
    }
  }
})
