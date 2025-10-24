import { createApp } from 'vue'
import MainApplication from './App.vue'
import applicationRouter from './router'

// Initialize Materialize CSS framework
import 'materialize-css/dist/js/materialize.min.js'

// Initialize performance optimizations
import { initPerformanceOptimizations } from './utils/performanceOptimization'

const vueApplication = createApp(MainApplication)

vueApplication.use(applicationRouter)

vueApplication.mount('#app')

// Initialize performance optimizations after app mount
initPerformanceOptimizations()
