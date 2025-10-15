import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Materialize CSS JavaScript
import 'materialize-css/dist/js/materialize.min.js'

const app = createApp(App)

app.use(router)

app.mount('#app')
