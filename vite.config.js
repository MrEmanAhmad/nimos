import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core + react-dom (including react-dom/client)
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) {
            return 'react-vendor'
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'router'
          }
          // React Helmet
          if (id.includes('node_modules/react-helmet-async')) {
            return 'helmet'
          }
          // Lucide icons library
          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }
        },
      },
    },
    // Enable source maps for production debugging (optional, can disable for smaller output)
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
    // CSS minified by esbuild (default) — lightningcss tested but produces larger output with Tailwind v4
  },
})
