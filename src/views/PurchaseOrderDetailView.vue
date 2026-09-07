<template>
  <section class="page-stack">
    <RouterLink class="text-link" to="/purchase-orders">Back to purchase orders</RouterLink>
    <div v-if="!po" class="panel empty-state"><FileText :size="44" /><h1>Purchase order not found</h1></div>
    <template v-else>
      <div class="detail-hero"><div><p class="eyebrow">{{ po.poNumber }}</p><h1>{{ store.findVendor(po.vendorId)?.name }}</h1><div class="hero-meta"><span class="status-pill info">{{ po.status }}</span><span>{{ formatDate(po.date) }}</span></div></div><strong>{{ currency.format(total) }}</strong></div>
      <section class="panel table-panel"><div class="section-header"><h2>Line Items</h2><span>{{ po.notes }}</span></div><table class="data-table"><thead><tr><th>Part #</th><th>Description</th><th>Qty</th><th>Unit Cost</th><th>Total</th></tr></thead><tbody><tr v-for="line in po.lineItems" :key="line.id"><td><RouterLink :to="`/inventory/${line.itemId}`">{{ store.findItem(line.itemId)?.partNumber }}</RouterLink></td><td>{{ store.findItem(line.itemId)?.description }}</td><td>{{ formatQuantity(line.quantity, store.findItem(line.itemId)?.unit) }}</td><td>{{ currency.format(line.unitCost) }}</td><td>{{ currency.format(line.quantity * line.unitCost) }}</td></tr></tbody></table></section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { FileText } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { currency, formatDate, formatQuantity } from '@/utils/format';

const store = useInventoryStore();
const route = useRoute();
onMounted(store.load);
const po = computed(() => store.findPurchaseOrder(String(route.params.id)));
const total = computed(() => po.value?.lineItems.reduce((sum, line) => sum + line.quantity * line.unitCost, 0) ?? 0);
</script>
