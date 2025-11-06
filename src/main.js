import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAuthStore } from '@/stores/auth'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.provide('bootstrap', bootstrap)

const auth = useAuthStore(pinia)
await auth.initFromStorage()

app.use(router)

app.mount('#app')
