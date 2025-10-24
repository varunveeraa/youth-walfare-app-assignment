import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Determine base URL based on deployment target
  const getBaseUrl = () => {
    if (mode === 'github') {
      return '/youth-walfare-app-assignment/'
    }
    if (command === 'build') {
      return './'
    }
    return '/'
  }

  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            mapbox: ['mapbox-gl'],
            ui: ['materialize-css']
          },
          // Optimize asset naming for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.names?.[0]?.split('.') || assetInfo.name?.split('.') || ['asset']
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`
            }
            if (/css/i.test(ext)) {
              return `css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js'
        }
      },
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      reportCompressedSize: false,
      // Enable compression
      cssCodeSplit: true,
      sourcemap: false,
      // Optimize chunk size
      chunkSizeWarningLimit: 1000
    },
    base: getBaseUrl(),
    optimizeDeps: {
      include: ['vue', 'vue-router', 'firebase/app', 'firebase/auth', 'firebase/firestore']
    },
    server: {
      fs: {
        strict: false
      }
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false
    }
  }
})
