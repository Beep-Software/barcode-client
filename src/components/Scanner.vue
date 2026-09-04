<template>
  <div class="title">
    <h3>Scanner</h3>
  </div>

  <div class="scanner_container">

    <form class="barcode">
      <label for="scan">Item ID:</label>
      <input id="scan" type="text" />
    </form>
    
    <div class="scanner_display">
      <h3>Scanned Item Details</h3>
      <div v-show="!testImg"
        class="scanner_icon" 
        v-html="svg.scannerIcon"
      ></div>
      <img v-show="testImg" class="scanner_icon" :src="testImg!" />
      <span>Item ID: {{ scannedItem?.id ?? '' }}</span>
      <span>Item Name: {{ scannedItem?.name ?? '' }}</span>
      <span>Quantity: {{ scannedItem?.quantity ?? '' }}</span>
      <span>Last Scanned: {{ scannedItem?.lastScanned ?? '' }}</span>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import svg from '@/assets/svg';
import type { ScannedItem } from '@/types/scanner';

const testImg = ref<string | null>(null);
const scannedItem = ref<ScannedItem | null>(null);
</script>

<style scoped>
.scanner_container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.barcode {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.barcode label {
  font-weight: bold;
}

.barcode input {
  width: 300px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.scanner_display {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}

.scanner_icon {
  width: 100px;
  height: 100px;
}
</style>