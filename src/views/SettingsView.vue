<template>
  <section class="page-stack">
    <div class="page-heading compact"><div><p class="eyebrow">Demo Settings</p><h1>Settings</h1></div></div>
    <div class="content-grid halves">
      <section class="panel">
        <h2>Current Employee</h2>
        <p class="muted">Inventory transactions are attributed to this demo user.</p>
        <label>Employee<select :value="store.state.data?.currentUserId" @change="changeUser"><option v-for="employee in store.state.data?.employees" :key="employee.id" :value="employee.id">{{ employee.name }} - {{ employee.role }}</option></select></label>
      </section>
      <section class="panel">
        <h2>Appearance</h2>
        <p class="muted">Theme selection persists across reloads.</p>
        <div class="button-row"><button class="button" :class="{ primary: theme === 'light' }" type="button" @click="setTheme('light')"><Sun :size="18" /> Light</button><button class="button" :class="{ primary: theme === 'dark' }" type="button" @click="setTheme('dark')"><Moon :size="18" /> Dark</button></div>
      </section>
      <section class="panel danger-zone">
        <h2>Reset Demo Data</h2>
        <p>Clears localStorage changes and restores the original JSON seed data.</p>
        <button class="button danger-button" type="button" @click="confirmReset = true"><RotateCcw :size="18" /> Reset Demo Data</button>
      </section>
    </div>
    <div v-if="confirmReset" class="dialog-backdrop" role="presentation" @click.self="confirmReset = false"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">Reset all demo data?</h2><p>This restores inventory quantities, transactions, purchase orders, jobs, and the selected employee to the seed state.</p><footer class="dialog-actions"><button class="button ghost" type="button" @click="confirmReset = false">Cancel</button><button class="button danger-button" type="button" @click="reset">Reset</button></footer></section></div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Moon, RotateCcw, Sun } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useThemeStore } from '@/stores/themeStore';

const store = useInventoryStore();
const { theme, setTheme } = useThemeStore();
const confirmReset = ref(false);
onMounted(store.load);

const changeUser = async (event: Event) => {
  await store.setCurrentUser((event.target as HTMLSelectElement).value);
};

const reset = async () => {
  await store.resetDemoData();
  confirmReset.value = false;
};
</script>
