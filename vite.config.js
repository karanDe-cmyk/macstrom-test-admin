import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Optional but recommended
    },
  },
  optimizeDeps: {
    include: [
      'react-chartjs-2',
      'chart.js',
      'react-big-calendar',
      'moment'
    ]
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
