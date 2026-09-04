import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'
import Scanner from '@/components/Scanner.vue'
import Inventory from '@/components/ui/Inventory.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/scanner',
      name: 'scanner',
      component: Scanner
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: Inventory
    }
  ]
})

export default router
