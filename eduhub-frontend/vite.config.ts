import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@emotion/styled': '@emotion/styled/base'
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8089'
    }
  }
})
