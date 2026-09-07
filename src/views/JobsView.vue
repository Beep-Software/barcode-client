<template>
  <section class="page-stack">
    <div class="page-heading compact"><div><p class="eyebrow">Projects</p><h1>Jobs</h1></div></div>
    <section class="panel filter-panel">
      <label>Search<input v-model="query" type="search" placeholder="Job number, customer, location" /></label>
      <label>Status<select v-model="status"><option>All</option><option>Planning</option><option>Active</option><option>On Hold</option><option>Completed</option><option>Cancelled</option></select></label>
    </section>
    <div class="card-grid">
      <RouterLink v-for="job in filteredJobs" :key="job.id" class="job-card" :to="`/jobs/${job.id}`">
        <span class="status-pill info">{{ job.status }}</span>
        <h2>{{ job.jobNumber }}</h2>
        <strong>{{ job.projectName }}</strong>
        <p>{{ job.customer }} - {{ job.location }}</p>
        <dl>
          <div><dt>Manager</dt><dd>{{ store.findEmployee(job.projectManagerId)?.name }}</dd></div>
          <div><dt>Expected</dt><dd>{{ formatDate(job.expectedCompletionDate) }}</dd></div>
        </dl>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { formatDate } from '@/utils/format';

const store = useInventoryStore();
const query = ref('');
const status = ref('All');
onMounted(store.load);

const filteredJobs = computed(() => {
  const search = query.value.trim().toLowerCase();
  return (store.state.data?.jobs ?? []).filter((job) => {
    const matchesSearch = !search || [job.jobNumber, job.projectName, job.customer, job.location, job.description].some((value) => value.toLowerCase().includes(search));
    const matchesStatus = status.value === 'All' || job.status === status.value;
    return matchesSearch && matchesStatus;
  });
});
</script>
