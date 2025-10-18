import { createApp } from 'vue'
import MainApplication from './App.vue'
import applicationRouter from './router'

// Initialize Materialize CSS framework
import 'materialize-css/dist/js/materialize.min.js'

const vueApplication = createApp(MainApplication)

vueApplication.use(applicationRouter)

vueApplication.mount('#app')
