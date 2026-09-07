<template>
  <section class="page-stack">
    <div class="page-heading compact">
      <div><p class="eyebrow">Purchasing</p><h1>Purchase Orders</h1></div>
      <button class="button primary" type="button" :disabled="!store.lowStockItems.value.length || store.state.actionLoading" @click="createLowStockPo"><FilePlus2 :size="18" /> Create Low-Stock PO</button>
    </div>
    <section class="panel table-panel">
      <table class="data-table">
        <thead><tr><th>PO #</th><th>Vendor</th><th>Status</th><th>Date</th><th>Lines</th><th>Total</th><th>Notes</th></tr></thead>
        <tbody>
          <tr v-for="po in store.state.data?.purchaseOrders" :key="po.id" @click="router.push(`/purchase-orders/${po.id}`)">
            <td><RouterLink :to="`/purchase-orders/${po.id}`">{{ po.poNumber }}</RouterLink></td>
            <td>{{ store.findVendor(po.vendorId)?.name }}</td>
            <td><span class="status-pill info">{{ po.status }}</span></td>
            <td>{{ formatDate(po.date) }}</td>
            <td>{{ po.lineItems.length }}</td>
            <td>{{ currency.format(po.lineItems.reduce((sum, line) => sum + line.quantity * line.unitCost, 0)) }}</td>
            <td>{{ po.notes }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FilePlus2 } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { currency, formatDate } from '@/utils/format';

const store = useInventoryStore();
const router = useRouter();
onMounted(store.load);

const createLowStockPo = async () => {
  const employeeId = store.currentUser.value?.id;
  const item = store.lowStockItems.value[0];
  if (!employeeId || !item) return;
  const vendorId = item.vendorId;
  const lineItems = store.lowStockItems.value
    .filter((lowStockItem) => lowStockItem.vendorId === vendorId)
    .slice(0, 8)
    .map((lowStockItem) => ({ itemId: lowStockItem.id, quantity: lowStockItem.reorderQuantity, unitCost: lowStockItem.cost }));
  const po = await store.createPurchaseOrder({ vendorId, employeeId, lineItems, notes: 'Generated from current low-stock inventory.' });
  await router.push(`/purchase-orders/${po.id}`);
};
</script>
