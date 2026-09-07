<template>
  <section class="page-stack">
    <RouterLink class="text-link" to="/inventory">Back to inventory</RouterLink>

    <div v-if="!item" class="panel empty-state">
      <PackageX :size="44" />
      <h1>Inventory item not found</h1>
      <p>The selected part may have been removed or the route is invalid.</p>
    </div>

    <template v-else>
      <div class="detail-hero">
        <div>
          <p class="eyebrow">{{ item.partNumber }}</p>
          <h1>{{ item.description }}</h1>
          <div class="hero-meta">
            <span class="status-pill" :class="statusClass">{{ stockStatus(item) }}</span>
            <span>{{ item.barcode || 'No Barcode Assigned' }}</span>
          </div>
        </div>
        <div class="detail-actions">
          <button class="button primary" type="button" @click="openDialog('issue')"><Send :size="18" /> Issue</button>
          <button class="button" type="button" @click="openDialog('receive')"><PackagePlus :size="18" /> Receive</button>
          <button class="button" type="button" @click="openDialog('transfer')"><ArrowRightLeft :size="18" /> Transfer</button>
          <button class="button" type="button" @click="openDialog('adjust')"><SlidersHorizontal :size="18" /> Adjust</button>
        </div>
      </div>

      <div class="content-grid two-one">
        <section class="panel">
          <h2>Part Details</h2>
          <dl class="detail-list">
            <div><dt>Manufacturer</dt><dd>{{ item.manufacturer }}</dd></div>
            <div><dt>Manufacturer Part #</dt><dd>{{ item.manufacturerPartNumber }}</dd></div>
            <div><dt>Category</dt><dd>{{ item.category }} / {{ item.subcategory }}</dd></div>
            <div><dt>Location</dt><dd>{{ locationLabel(store.findLocation(item.locationId)) }}</dd></div>
            <div><dt>Vendor</dt><dd>{{ store.findVendor(item.vendorId)?.name }}</dd></div>
            <div><dt>Status</dt><dd>{{ item.status }}</dd></div>
            <div><dt>Notes</dt><dd>{{ item.notes }}</dd></div>
          </dl>
        </section>

        <section class="panel stock-panel">
          <h2>Stock Position</h2>
          <strong>{{ formatQuantity(item.quantity, item.unit) }}</strong>
          <span>on hand</span>
          <dl class="detail-list compact">
            <div><dt>Reorder Point</dt><dd>{{ formatQuantity(item.minimumQuantity, item.unit) }}</dd></div>
            <div><dt>Reorder Qty</dt><dd>{{ formatQuantity(item.reorderQuantity, item.unit) }}</dd></div>
            <div><dt>Unit Cost</dt><dd>{{ currency.format(item.cost) }}</dd></div>
            <div><dt>Inventory Value</dt><dd>{{ currency.format(item.cost * item.quantity) }}</dd></div>
          </dl>
        </section>
      </div>

      <section class="panel">
        <div class="section-header">
          <h2>Transaction History</h2>
          <RouterLink :to="`/transactions?q=${item.partNumber}`">Filter history</RouterLink>
        </div>
        <div class="activity-list">
          <div v-for="transaction in itemTransactions" :key="transaction.id" class="activity-row">
            <span class="status-pill" :class="transactionTone(transaction)">{{ transaction.type }}</span>
            <div>
              <strong>{{ formatDateTime(transaction.timestamp) }}</strong>
              <p>{{ transaction.notes }}</p>
            </div>
            <span>{{ formatQuantity(transaction.quantity, transaction.unit) }}</span>
          </div>
        </div>
      </section>

      <InventoryActionDialog v-if="dialogMode" :item="item" :initial-mode="dialogMode" @close="dialogMode = null" @completed="dialogMode = null" />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRightLeft, PackagePlus, PackageX, Send, SlidersHorizontal } from '@lucide/vue';
import InventoryActionDialog from '@/components/InventoryActionDialog.vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { InventoryItem } from '@/types/inventory';
import { currency, formatDateTime, formatQuantity, locationLabel, stockStatus, transactionTone } from '@/utils/format';

const store = useInventoryStore();
const route = useRoute();
const dialogMode = ref<'issue' | 'receive' | 'transfer' | 'adjust' | null>(null);

onMounted(store.load);

const item = computed(() => store.findItem(String(route.params.id)));
const itemTransactions = computed(() => store.state.data?.transactions.filter((transaction) => transaction.itemId === item.value?.id).slice(0, 12) ?? []);
const statusClass = computed(() => {
  if (!item.value) return '';
  const status = stockStatus(item.value);
  return status === 'Out of Stock' ? 'danger' : status === 'Low Stock' ? 'warning' : 'success';
});

const openDialog = (mode: 'issue' | 'receive' | 'transfer' | 'adjust') => {
  dialogMode.value = mode;
};
</script>
