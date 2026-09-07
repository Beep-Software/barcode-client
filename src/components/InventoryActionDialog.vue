<template>
  <div class="dialog-backdrop" role="presentation" @click.self="emit('close')">
    <section class="dialog" role="dialog" aria-modal="true" :aria-labelledby="`${mode}-dialog-title`">
      <header class="dialog-header">
        <div>
          <p class="eyebrow">{{ item.partNumber }}</p>
          <h2 :id="`${mode}-dialog-title`">{{ title }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="Close dialog" @click="emit('close')">
          <X :size="20" />
        </button>
      </header>

      <div class="dialog-summary">
        <span>{{ item.description }}</span>
        <strong>{{ formatQuantity(item.quantity, item.unit) }} available</strong>
      </div>

      <form class="form-grid" @submit.prevent="submit">
        <label>
          Action
          <select v-model="mode">
            <option value="issue">Issue to Job</option>
            <option value="receive">Receive</option>
            <option value="transfer">Transfer</option>
            <option value="adjust">Adjust</option>
          </select>
        </label>

        <label>
          Quantity <span v-if="mode === 'adjust'">Change</span>
          <input v-model.number="quantity" type="number" :step="quantityStep" :min="mode === 'adjust' ? undefined : 0" required />
        </label>

        <label v-if="mode === 'issue'">
          Job
          <select v-model="jobId" required>
            <option value="" disabled>Select job</option>
            <option v-for="job in store.activeJobs.value" :key="job.id" :value="job.id">
              {{ job.jobNumber }} - {{ job.projectName }}
            </option>
          </select>
        </label>

        <label v-if="mode === 'receive'">
          Destination Location
          <select v-model="destinationLocationId" required>
            <option v-for="location in store.state.data?.locations" :key="location.id" :value="location.id">
              {{ location.name }} {{ location.bin }}
            </option>
          </select>
        </label>

        <label v-if="mode === 'receive'">
          Purchase Order
          <select v-model="purchaseOrderId">
            <option value="">No PO reference</option>
            <option v-for="po in store.state.data?.purchaseOrders" :key="po.id" :value="po.id">
              {{ po.poNumber }} - {{ store.findVendor(po.vendorId)?.name }}
            </option>
          </select>
        </label>

        <label v-if="mode === 'transfer'">
          Source Location
          <select v-model="sourceLocationId" required>
            <option v-for="location in store.state.data?.locations" :key="location.id" :value="location.id">
              {{ location.name }} {{ location.bin }}
            </option>
          </select>
        </label>

        <label v-if="mode === 'transfer'">
          Destination Location
          <select v-model="destinationLocationId" required>
            <option v-for="location in store.state.data?.locations" :key="location.id" :value="location.id">
              {{ location.name }} {{ location.bin }}
            </option>
          </select>
        </label>

        <label v-if="mode === 'adjust'">
          Reason
          <select v-model="reason" required>
            <option>Damaged</option>
            <option>Lost</option>
            <option>Counting error</option>
            <option>Found inventory</option>
            <option>Correction</option>
            <option>Other</option>
          </select>
        </label>

        <label class="span-all">
          Notes
          <textarea v-model="notes" rows="3" :required="mode === 'adjust'" placeholder="Optional transaction note"></textarea>
        </label>

        <p v-if="localError" class="form-error" role="alert">{{ localError }}</p>

        <footer class="dialog-actions span-all">
          <button class="button ghost" type="button" @click="emit('close')">Cancel</button>
          <button class="button primary" type="submit" :disabled="store.state.actionLoading">
            <LoaderCircle v-if="store.state.actionLoading" class="spin" :size="18" />
            Confirm {{ actionLabel }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { LoaderCircle, X } from '@lucide/vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { AdjustmentReason, InventoryItem } from '@/types/inventory';
import { formatQuantity } from '@/utils/format';

const props = defineProps<{
  item: InventoryItem;
  initialMode: 'issue' | 'receive' | 'transfer' | 'adjust';
}>();

const emit = defineEmits<{
  close: [];
  completed: [];
}>();

const store = useInventoryStore();
const mode = ref(props.initialMode);
const quantity = ref(1);
const jobId = ref('');
const sourceLocationId = ref(props.item.locationId);
const destinationLocationId = ref(props.item.locationId);
const purchaseOrderId = ref('');
const reason = ref<AdjustmentReason>('Correction');
const notes = ref('');
const localError = ref('');

const title = computed(() => {
  if (mode.value === 'issue') return 'Issue Inventory';
  if (mode.value === 'receive') return 'Receive Inventory';
  if (mode.value === 'transfer') return 'Transfer Inventory';
  return 'Adjust Inventory';
});

const actionLabel = computed(() => ({ issue: 'Issue', receive: 'Receive', transfer: 'Transfer', adjust: 'Adjust' })[mode.value]);
const quantityStep = computed(() => ['LB', 'FT', 'GAL'].includes(props.item.unit) ? '0.1' : '1');

watch(() => props.initialMode, (nextMode) => {
  mode.value = nextMode;
});

watch(mode, () => {
  localError.value = '';
  quantity.value = mode.value === 'adjust' ? 0 : 1;
  sourceLocationId.value = props.item.locationId;
  destinationLocationId.value = props.item.locationId;
});

const submit = async () => {
  localError.value = '';
  const employeeId = store.currentUser.value?.id;
  if (!employeeId) {
    localError.value = 'Select a current employee before recording inventory activity.';
    return;
  }

  try {
    if (mode.value === 'issue') {
      await store.issueInventory({ itemId: props.item.id, quantity: quantity.value, jobId: jobId.value, employeeId, notes: notes.value });
    } else if (mode.value === 'receive') {
      await store.receiveInventory({ itemId: props.item.id, quantity: quantity.value, locationId: destinationLocationId.value, employeeId, purchaseOrderId: purchaseOrderId.value || undefined, notes: notes.value });
    } else if (mode.value === 'transfer') {
      await store.transferInventory({ itemId: props.item.id, quantity: quantity.value, sourceLocationId: sourceLocationId.value, destinationLocationId: destinationLocationId.value, employeeId, notes: notes.value });
    } else {
      await store.adjustInventory({ itemId: props.item.id, quantityChange: quantity.value, employeeId, reason: reason.value, notes: notes.value });
    }
    emit('completed');
  } catch (error) {
    localError.value = error instanceof Error ? error.message : 'Inventory action failed.';
  }
};
</script>
