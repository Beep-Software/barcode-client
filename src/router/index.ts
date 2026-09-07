import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/scan',
      name: 'scan',
      component: () => import('@/views/ScannerView.vue')
    },
    {
      path: '/scanner',
      redirect: '/scan'
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/views/InventoryView.vue')
    },
    {
      path: '/inventory/:id',
      name: 'part-detail',
      component: () => import('@/views/PartDetailView.vue')
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/TransactionsView.vue')
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('@/views/JobsView.vue')
    },
    {
      path: '/jobs/:id',
      name: 'job-detail',
      component: () => import('@/views/JobDetailView.vue')
    },
    {
      path: '/purchase-orders',
      name: 'purchase-orders',
      component: () => import('@/views/PurchaseOrdersView.vue')
    },
    {
      path: '/purchase-orders/:id',
      name: 'purchase-order-detail',
      component: () => import('@/views/PurchaseOrderDetailView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    }
  ]
})

export default router
