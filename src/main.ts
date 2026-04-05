import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './app/app.vue'

import './app/style.css'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./app/app-layout.vue'),
      children: [
        {
          path: 'tables',
          component: () => import('./pages/tables/tables.vue'),
          meta: {
            breadcrumb: 'Tables',
          },
        },
      ],
    },
  ],
})

const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(PiniaColada)

app.mount('#app')
