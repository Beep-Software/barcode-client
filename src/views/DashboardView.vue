<template>
  <section class="page-stack">
    <div class="page-heading">
      <div>
        <p class="eyebrow">Parts Department</p>
        <h1>Caldwell Inventory Management System</h1>
        <p>Live demo dashboard for water-tower fabrication stock, jobs, and purchasing activity.</p>
      </div>
      <div class="quick-actions">
        <RouterLink class="button primary" to="/scan"><ScanLine :size="18" /> Scan Barcode</RouterLink>
        <RouterLink class="button" to="/inventory"><PackageSearch :size="18" /> View Inventory</RouterLink>
      </div>
    </div>

    <div v-if="store.state.loading" class="panel loading-panel">Loading dashboard...</div>

    <template v-else-if="store.state.data">
      <div class="metric-grid">
        <article class="metric-card">
          <Package :size="22" />
          <span>Total Items</span>
          <strong>{{ store.state.data.inventory.length }}</strong>
        </article>
        <article class="metric-card">
          <BadgeDollarSign :size="22" />
          <span>Inventory Value</span>
          <strong>{{ currency.format(store.inventoryValue.value) }}</strong>
        </article>
        <article class="metric-card danger">
          <TriangleAlert :size="22" />
          <span>Low Stock</span>
          <strong>{{ store.lowStockItems.value.length }}</strong>
        </article>
        <article class="metric-card danger">
          <CircleOff :size="22" />
          <span>Out of Stock</span>
          <strong>{{ store.outOfStockItems.value.length }}</strong>
        </article>
        <article class="metric-card">
          <BriefcaseBusiness :size="22" />
          <span>Active Jobs</span>
          <strong>{{ activeJobCount }}</strong>
        </article>
        <article class="metric-card">
          <ClipboardList :size="22" />
          <span>Open POs</span>
          <strong>{{ openPurchaseOrderCount }}</strong>
        </article>
      </div>

      <div class="content-grid two-one">
        <section class="panel">
          <div class="section-header">
            <h2>Recent Transactions</h2>
            <RouterLink to="/transactions">View all</RouterLink>
          </div>
          <div class="activity-list">
            <RouterLink v-for="transaction in recentTransactions" :key="transaction.id" class="activity-row" :to="`/inventory/${transaction.itemId}`">
              <span class="status-pill" :class="transactionTone(transaction)">{{ transaction.type }}</span>
              <div>
                <strong>{{ store.findItem(transaction.itemId)?.partNumber }}</strong>
                <p>{{ store.findItem(transaction.itemId)?.description }}</p>
              </div>
              <span>{{ formatQuantity(transaction.quantity, transaction.unit) }}</span>
            </RouterLink>
          </div>
        </section>

        <section class="panel action-panel">
          <h2>Fast Workflows</h2>
          <RouterLink class="action-tile" to="/scan"><ScanLine :size="20" /> Scan and issue part</RouterLink>
          <RouterLink class="action-tile" to="/inventory?stock=Low%20Stock"><TriangleAlert :size="20" /> Reorder low stock</RouterLink>
          <RouterLink class="action-tile" to="/purchase-orders"><FilePlus2 :size="20" /> Purchase orders</RouterLink>
          <RouterLink class="action-tile" to="/jobs"><HardHat :size="20" /> Job material usage</RouterLink>
        </section>
      </div>

      <div class="content-grid halves">
        <section class="panel">
          <div class="section-header">
            <h2>Low-Stock Inventory</h2>
            <RouterLink to="/inventory?stock=Low%20Stock">Review</RouterLink>
          </div>
          <div class="compact-table">
            <RouterLink v-for="item in store.lowStockItems.value.slice(0, 8)" :key="item.id" class="compact-row" :to="`/inventory/${item.id}`">
              <div>
                <strong>{{ item.partNumber }}</strong>
                <span>{{ item.description }}</span>
              </div>
              <span>{{ formatQuantity(item.quantity, item.unit) }}</span>
            </RouterLink>
          </div>
        </section>

        <section class="panel">
          <div class="section-header">
            <h2>Active Jobs</h2>
            <RouterLink to="/jobs">View jobs</RouterLink>
          </div>
          <div class="compact-table">
            <RouterLink v-for="job in store.activeJobs.value.slice(0, 6)" :key="job.id" class="compact-row" :to="`/jobs/${job.id}`">
              <div>
                <strong>{{ job.jobNumber }}</strong>
                <span>{{ job.projectName }}</span>
              </div>
              <span class="status-pill info">{{ job.status }}</span>
            </RouterLink>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { BadgeDollarSign, BriefcaseBusiness, CircleOff, ClipboardList, FilePlus2, HardHat, Package, PackageSearch, ScanLine, TriangleAlert } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { currency, formatQuantity, transactionTone } from '@/utils/format';

const store = useInventoryStore();
onMounted(store.load);

const recentTransactions = computed(() => store.state.data?.transactions.slice(0, 7) ?? []);
const activeJobCount = computed(() => store.state.data?.jobs.filter((job) => job.status === 'Active').length ?? 0);
const openPurchaseOrderCount = computed(() => store.state.data?.purchaseOrders.filter((po) => !['Received', 'Cancelled'].includes(po.status)).length ?? 0);
</script>
