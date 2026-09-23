import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  preview: {
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
    },
  },
})