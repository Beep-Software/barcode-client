<template>
  <div class="title">
    <h3>Inventory</h3>
  </div>
<div class="inventory_container">
    <h3>Search</h3>
    <form>
        <label for="id">Item ID:</label>
        <input item="id"></input>
    </form>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { ScannedItem } from '@/types/scanner';

const scannedItem = ref<ScannedItem | null>(null);
</script>