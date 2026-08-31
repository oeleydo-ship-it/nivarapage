import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // The dashboard is served by Laravel from public/dashboard, and its assets
  // are requested from that prefix while the app itself runs at the site root.
  // The dev server has no Laravel in front of it, so it serves the app from the
  // root too - otherwise the router sees /dashboard/ and matches no route.
  base: command === 'build' ? '/dashboard/' : '/',
  build: {
    outDir: path.resolve(dir, '../../public/dashboard'),
    emptyOutDir: true,
  },
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(dir, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        // Prefer IPv4. On Windows, `localhost` often resolves to ::1 and can
        // hit a different process already bound on port 8000.
        target: process.env.VITE_API_PROXY || 'http://127.0.0.1:8000',
        changeOrigin: true,
        timeout: 180_000,
        proxyTimeout: 180_000,
      },
      '/storage': {
        target: process.env.VITE_API_PROXY || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // The block-library suites render every registered block, so the 5s default
    // trips as the catalogue grows rather than because anything is wrong.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
}))
