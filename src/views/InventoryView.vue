<template>
  <section class="page-stack">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">Inventory</p>
        <h1>Parts Catalog</h1>
      </div>
      <RouterLink class="button primary" to="/scan"><ScanLine :size="18" /> Scan</RouterLink>
    </div>

    <section class="panel filter-panel">
      <label>
        Search
        <input v-model="query" type="search" placeholder="Barcode, part number, manufacturer, description" />
      </label>
      <label>
        Category
        <select v-model="category">
          <option value="">All categories</option>
          <option v-for="option in categories" :key="option">{{ option }}</option>
        </select>
      </label>
      <label>
        Location
        <select v-model="locationId">
          <option value="">All locations</option>
          <option v-for="location in store.state.data?.locations" :key="location.id" :value="location.id">{{ location.name }} {{ location.bin }}</option>
        </select>
      </label>
      <label>
        Stock Status
        <select v-model="stock">
          <option>All</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
      </label>
    </section>

    <section class="panel table-panel">
      <div class="section-header">
        <h2>{{ filteredItems.length }} items</h2>
        <span>{{ lowStockCount }} low-stock records need attention</span>
      </div>

      <div v-if="!filteredItems.length" class="empty-state">
        <PackageSearch :size="40" />
        <h3>No matching inventory</h3>
        <p>Try a barcode, part number, manufacturer, location, or broader category.</p>
      </div>

      <table v-else class="data-table inventory-table">
        <thead>
          <tr>
            <th>Part #</th>
            <th>Description</th>
            <th>Category</th>
            <th>Location</th>
            <th>On Hand</th>
            <th>Reorder</th>
            <th>Status</th>
            <th>Barcode</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" @click="router.push(`/inventory/${item.id}`)">
            <td><RouterLink :to="`/inventory/${item.id}`">{{ item.partNumber }}</RouterLink></td>
            <td>{{ item.description }}</td>
            <td>{{ item.category }}</td>
            <td>{{ locationLabel(store.findLocation(item.locationId)) }}</td>
            <td>{{ formatQuantity(item.quantity, item.unit) }}</td>
            <td>{{ formatQuantity(item.minimumQuantity, item.unit) }}</td>
            <td><span class="status-pill" :class="statusClass(item)">{{ stockStatus(item) }}</span></td>
            <td>{{ item.barcode || 'No Barcode Assigned' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mobile-card-list">
        <RouterLink v-for="item in filteredItems" :key="item.id" class="inventory-card" :to="`/inventory/${item.id}`">
          <div>
            <strong>{{ item.partNumber }}</strong>
            <p>{{ item.description }}</p>
          </div>
          <span class="status-pill" :class="statusClass(item)">{{ stockStatus(item) }}</span>
          <dl>
            <div><dt>On hand</dt><dd>{{ formatQuantity(item.quantity, item.unit) }}</dd></div>
            <div><dt>Location</dt><dd>{{ locationLabel(store.findLocation(item.locationId)) }}</dd></div>
            <div><dt>Barcode</dt><dd>{{ item.barcode || 'No Barcode Assigned' }}</dd></div>
          </dl>
        </RouterLink>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PackageSearch, ScanLine } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { InventoryItem } from '@/types/inventory';
import { formatQuantity, locationLabel, stockStatus } from '@/utils/format';

const store = useInventoryStore();
const route = useRoute();
const router = useRouter();
const query = ref(String(route.query.q ?? ''));
const category = ref('');
const locationId = ref('');
const stock = ref(String(route.query.stock ?? 'All'));

onMounted(store.load);

const categories = computed(() => [...new Set(store.state.data?.inventory.map((item) => item.category) ?? [])].sort());

const filteredItems = computed(() => {
  const search = query.value.trim().toLowerCase();
  return (store.state.data?.inventory ?? []).filter((item) => {
    const matchesSearch = !search || [item.partNumber, item.description, item.manufacturer, item.manufacturerPartNumber, item.category, item.subcategory, item.barcode]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
    const matchesCategory = !category.value || item.category === category.value;
    const matchesLocation = !locationId.value || item.locationId === locationId.value;
    const itemStatus = stockStatus(item);
    const matchesStock = stock.value === 'All' || itemStatus === stock.value;
    return matchesSearch && matchesCategory && matchesLocation && matchesStock;
  }).sort((a, b) => a.partNumber.localeCompare(b.partNumber));
});

const lowStockCount = computed(() => filteredItems.value.filter((item) => item.quantity <= item.minimumQuantity).length);
const statusClass = (item: InventoryItem) => stockStatus(item) === 'Out of Stock' ? 'danger' : stockStatus(item) === 'Low Stock' ? 'warning' : 'success';
</script>
