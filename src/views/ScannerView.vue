<template>
  <section class="page-stack scan-page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">Barcode Scan</p>
        <h1>Scan, Find, Issue</h1>
        <p>Use a USB scanner, manual entry, or mobile camera to resolve stocked parts.</p>
      </div>
    </div>

    <div class="content-grid halves">
      <section class="panel scan-panel">
        <h2>USB Scanner or Manual Entry</h2>
        <form class="scan-form" @submit.prevent="processBarcode(manualBarcode)">
          <label for="barcode-input">Barcode</label>
          <input id="barcode-input" ref="barcodeInput" v-model="manualBarcode" inputmode="numeric" autocomplete="off" placeholder="Scan or type barcode" @keydown.enter.prevent="processBarcode(manualBarcode)" />
          <button class="button primary" type="submit"><Search :size="18" /> Find Part</button>
        </form>
        <p class="muted">Physical scanners work as keyboards. Keep this field focused and scan.</p>

        <div class="camera-box">
          <div class="section-header">
            <h3>Camera Scanner</h3>
            <button v-if="!cameraActive" class="button" type="button" @click="startCamera"><Camera :size="18" /> Start Camera</button>
            <button v-else class="button ghost" type="button" @click="stopCamera"><CircleStop :size="18" /> Stop</button>
          </div>
          <video ref="videoElement" class="scanner-video" muted playsinline></video>
          <p v-if="cameraMessage" class="form-error" role="alert">{{ cameraMessage }}</p>
        </div>
      </section>

      <section class="panel result-panel">
        <h2>Scan Result</h2>
        <div v-if="scanError" class="empty-state error-state">
          <CircleAlert :size="40" />
          <h3>{{ scanError }}</h3>
          <p>Non-barcoded parts are still searchable from Inventory by part number, category, vendor, or description.</p>
        </div>
        <div v-else-if="resolvedItem" class="resolved-card">
          <span class="status-pill success">Known Barcode</span>
          <h3>{{ resolvedItem.partNumber }}</h3>
          <p>{{ resolvedItem.description }}</p>
          <dl>
            <div><dt>On Hand</dt><dd>{{ formatQuantity(resolvedItem.quantity, resolvedItem.unit) }}</dd></div>
            <div><dt>Location</dt><dd>{{ locationLabel(store.findLocation(resolvedItem.locationId)) }}</dd></div>
            <div><dt>Barcode</dt><dd>{{ resolvedItem.barcode }}</dd></div>
          </dl>
          <div class="button-row">
            <RouterLink class="button" :to="`/inventory/${resolvedItem.id}`">View Details</RouterLink>
            <button class="button primary" type="button" @click="dialogOpen = true"><Send :size="18" /> Issue to Job</button>
          </div>
        </div>
        <div v-else class="empty-state">
          <ScanLine :size="44" />
          <h3>Ready to scan</h3>
          <p>Successful scans resolve directly to a part and keep the issue workflow one click away.</p>
        </div>
      </section>
    </div>

    <InventoryActionDialog v-if="dialogOpen && resolvedItem" :item="resolvedItem" initial-mode="issue" @close="dialogOpen = false" @completed="dialogOpen = false" />
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { Camera, CircleAlert, CircleStop, ScanLine, Search, Send } from '@lucide/vue';
import InventoryActionDialog from '@/components/InventoryActionDialog.vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { InventoryItem } from '@/types/inventory';
import { formatQuantity, locationLabel } from '@/utils/format';

const store = useInventoryStore();
const manualBarcode = ref('');
const resolvedItem = ref<InventoryItem | null>(null);
const scanError = ref('');
const cameraMessage = ref('');
const cameraActive = ref(false);
const dialogOpen = ref(false);
const barcodeInput = ref<HTMLInputElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
let reader: BrowserMultiFormatReader | null = null;
let scannerControls: IScannerControls | null = null;
let lastBarcode = '';

onMounted(async () => {
  await store.load();
  await nextTick();
  barcodeInput.value?.focus();
});

onBeforeUnmount(() => stopCamera());

const processBarcode = async (barcode: string) => {
  const trimmedBarcode = barcode.trim();
  scanError.value = '';
  if (!trimmedBarcode) {
    scanError.value = 'Scan or enter a barcode first.';
    return;
  }
  if (trimmedBarcode === lastBarcode && resolvedItem.value) {
    scanError.value = 'Duplicate scan ignored. Scan a different barcode or issue the resolved part.';
    return;
  }
  resolvedItem.value = null;
  try {
    const item = await store.resolveBarcode(trimmedBarcode);
    resolvedItem.value = item;
    lastBarcode = trimmedBarcode;
    manualBarcode.value = '';
  } catch (error) {
    scanError.value = error instanceof Error ? error.message : 'Barcode could not be resolved.';
  } finally {
    barcodeInput.value?.focus();
  }
};

const startCamera = async () => {
  cameraMessage.value = '';
  scanError.value = '';
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraMessage.value = 'Camera scanning is not available in this browser.';
      return;
    }
    reader = new BrowserMultiFormatReader();
    cameraActive.value = true;
    scannerControls = await reader.decodeFromVideoDevice(undefined, videoElement.value ?? undefined, (result, error) => {
      if (result) {
        void processBarcode(result.getText());
        stopCamera();
      }
      if (error && error.name !== 'NotFoundException') {
        cameraMessage.value = 'Camera scanner could not read the barcode. Try better lighting or manual entry.';
      }
    });
  } catch (error) {
    cameraActive.value = false;
    cameraMessage.value = error instanceof DOMException && error.name === 'NotAllowedError'
      ? 'Camera permission was denied.'
      : 'Camera scanner could not be started.';
  }
};

const stopCamera = () => {
  scannerControls?.stop();
  scannerControls = null;
  reader = null;
  cameraActive.value = false;
};
</script>
