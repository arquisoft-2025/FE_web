import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    ssr: command === 'build' ? 'src/entry-server.jsx' : undefined,
  },
  ssr: {
    noExternal: ['react-router-dom']
  }
}))
