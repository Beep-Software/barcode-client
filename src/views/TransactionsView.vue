<template>
  <section class="page-stack">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">History</p>
        <h1>Inventory Transactions</h1>
      </div>
    </div>

    <section class="panel filter-panel">
      <label>Search<input v-model="query" type="search" placeholder="Part, employee, job, notes" /></label>
      <label>Type<select v-model="type"><option>All</option><option>RECEIVE</option><option>ISSUE</option><option>TRANSFER</option><option>ADJUSTMENT</option></select></label>
      <label>Employee<select v-model="employeeId"><option value="">All employees</option><option v-for="employee in store.state.data?.employees" :key="employee.id" :value="employee.id">{{ employee.name }}</option></select></label>
      <label>Job<select v-model="jobId"><option value="">All jobs</option><option v-for="job in store.state.data?.jobs" :key="job.id" :value="job.id">{{ job.jobNumber }}</option></select></label>
      <label>From<input v-model="startDate" type="date" /></label>
      <label>To<input v-model="endDate" type="date" /></label>
    </section>

    <section class="panel table-panel">
      <div class="section-header"><h2>{{ filteredTransactions.length }} records</h2></div>
      <table class="data-table">
        <thead><tr><th>Date</th><th>Type</th><th>Part</th><th>Quantity</th><th>Employee</th><th>Job / Reference</th><th>Notes</th></tr></thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id">
            <td>{{ formatDateTime(transaction.timestamp) }}</td>
            <td><span class="status-pill" :class="transactionTone(transaction)">{{ transaction.type }}</span></td>
            <td><RouterLink :to="`/inventory/${transaction.itemId}`">{{ store.findItem(transaction.itemId)?.partNumber }}</RouterLink><span>{{ store.findItem(transaction.itemId)?.description }}</span></td>
            <td>{{ formatQuantity(transaction.quantity, transaction.unit) }}</td>
            <td>{{ store.findEmployee(transaction.employeeId)?.name }}</td>
            <td>{{ store.findJob(transaction.jobId)?.jobNumber || transaction.referenceNumber || 'Demo record' }}</td>
            <td>{{ transaction.notes }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filteredTransactions.length" class="empty-state"><History :size="40" /><h3>No transactions found</h3><p>Adjust filters or search for a different part, employee, or job.</p></div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { History } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { formatDateTime, formatQuantity, transactionTone } from '@/utils/format';

const store = useInventoryStore();
const route = useRoute();
const query = ref(String(route.query.q ?? ''));
const type = ref('All');
const employeeId = ref('');
const jobId = ref('');
const startDate = ref('');
const endDate = ref('');

onMounted(store.load);

const filteredTransactions = computed(() => {
  const search = query.value.trim().toLowerCase();
  return (store.state.data?.transactions ?? []).filter((transaction) => {
    const item = store.findItem(transaction.itemId);
    const employee = store.findEmployee(transaction.employeeId);
    const job = store.findJob(transaction.jobId);
    const matchesSearch = !search || [transaction.id, transaction.referenceNumber, transaction.notes, item?.partNumber, item?.description, employee?.name, job?.jobNumber]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
    const matchesType = type.value === 'All' || transaction.type === type.value;
    const matchesEmployee = !employeeId.value || transaction.employeeId === employeeId.value;
    const matchesJob = !jobId.value || transaction.jobId === jobId.value;
    const day = transaction.timestamp.slice(0, 10);
    const matchesStart = !startDate.value || day >= startDate.value;
    const matchesEnd = !endDate.value || day <= endDate.value;
    return matchesSearch && matchesType && matchesEmployee && matchesJob && matchesStart && matchesEnd;
  });
});
</script>
