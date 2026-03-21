import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './app.vue'
import './styles.scss'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./pages/table.vue'),
    },
  ],
})

const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(PiniaColada)

app.mount('#app')
