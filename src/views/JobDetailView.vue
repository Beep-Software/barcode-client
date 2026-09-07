<template>
  <section class="page-stack">
    <RouterLink class="text-link" to="/jobs">Back to jobs</RouterLink>
    <div v-if="!job" class="panel empty-state"><BriefcaseBusiness :size="44" /><h1>Job not found</h1></div>
    <template v-else>
      <div class="detail-hero">
        <div>
          <p class="eyebrow">{{ job.jobNumber }}</p>
          <h1>{{ job.projectName }}</h1>
          <div class="hero-meta"><span class="status-pill info">{{ job.status }}</span><span>{{ job.customer }} - {{ job.location }}</span></div>
        </div>
      </div>
      <div class="content-grid two-one">
        <section class="panel"><h2>Project Details</h2><p>{{ job.description }}</p><dl class="detail-list"><div><dt>Project Manager</dt><dd>{{ store.findEmployee(job.projectManagerId)?.name }}</dd></div><div><dt>Start</dt><dd>{{ formatDate(job.startDate) }}</dd></div><div><dt>Expected Completion</dt><dd>{{ formatDate(job.expectedCompletionDate) }}</dd></div><div><dt>Notes</dt><dd>{{ job.notes }}</dd></div></dl></section>
        <section class="panel stock-panel"><h2>Issued Value</h2><strong>{{ currency.format(issuedValue) }}</strong><span>{{ issuedTransactions.length }} issue transactions</span></section>
      </div>
      <section class="panel"><div class="section-header"><h2>Issued Materials</h2><RouterLink :to="`/transactions?jobId=${job.id}`">View history</RouterLink></div><div class="activity-list"><RouterLink v-for="transaction in issuedTransactions" :key="transaction.id" class="activity-row" :to="`/inventory/${transaction.itemId}`"><span class="status-pill warning">ISSUE</span><div><strong>{{ store.findItem(transaction.itemId)?.partNumber }}</strong><p>{{ store.findItem(transaction.itemId)?.description }}</p></div><span>{{ formatQuantity(transaction.quantity, transaction.unit) }}</span></RouterLink></div></section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { BriefcaseBusiness } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { currency, formatDate, formatQuantity } from '@/utils/format';

const store = useInventoryStore();
const route = useRoute();
onMounted(store.load);

const job = computed(() => store.findJob(String(route.params.id)));
const issuedTransactions = computed(() => store.state.data?.transactions.filter((transaction) => transaction.jobId === job.value?.id && transaction.type === 'ISSUE') ?? []);
const issuedValue = computed(() => issuedTransactions.value.reduce((sum, transaction) => {
  const item = store.findItem(transaction.itemId);
  return sum + transaction.quantity * (item?.cost ?? 0);
}, 0));
</script>
