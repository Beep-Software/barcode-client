import { computed, reactive } from 'vue';
import { mockInventoryProvider } from '@/mock/mockInventoryProvider';
import type {
  AdjustInventoryRequest,
  CreatePurchaseOrderRequest,
  DemoDataSet,
  InventoryItem,
  IssueInventoryRequest,
  ReceiveInventoryRequest,
  TransferInventoryRequest,
} from '@/types/inventory';

interface InventoryState {
  data: DemoDataSet | null;
  loading: boolean;
  actionLoading: boolean;
  error: string;
  notice: string;
}

const state = reactive<InventoryState>({
  data: null,
  loading: false,
  actionLoading: false,
  error: '',
  notice: '',
});

const provider = mockInventoryProvider;

const setError = (error: unknown) => {
  state.error = error instanceof Error ? error.message : 'Something went wrong while updating inventory.';
};

const refresh = async () => {
  state.data = await provider.getSnapshot();
};

const withAction = async <T>(message: string, action: () => Promise<T>) => {
  state.actionLoading = true;
  state.error = '';
  state.notice = '';
  try {
    const result = await action();
    await refresh();
    state.notice = message;
    return result;
  } catch (error) {
    setError(error);
    throw error;
  } finally {
    state.actionLoading = false;
  }
};

export function useInventoryStore() {
  const load = async () => {
    if (state.data || state.loading) return;
    state.loading = true;
    state.error = '';
    try {
      await refresh();
    } catch (error) {
      setError(error);
    } finally {
      state.loading = false;
    }
  };

  const currentUser = computed(() => state.data?.employees.find((employee) => employee.id === state.data?.currentUserId));
  const activeJobs = computed(() => state.data?.jobs.filter((job) => job.status === 'Active' || job.status === 'Planning') ?? []);
  const lowStockItems = computed(() => state.data?.inventory.filter((item) => item.status === 'Active' && item.quantity <= item.minimumQuantity) ?? []);
  const outOfStockItems = computed(() => state.data?.inventory.filter((item) => item.status === 'Active' && item.quantity <= 0) ?? []);
  const inventoryValue = computed(() => state.data?.inventory.reduce((sum, item) => sum + item.quantity * item.cost, 0) ?? 0);
  const todayTransactions = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return state.data?.transactions.filter((transaction) => transaction.timestamp.slice(0, 10) === today) ?? [];
  });

  const findItem = (id: string) => state.data?.inventory.find((item) => item.id === id);
  const findLocation = (id?: string) => state.data?.locations.find((location) => location.id === id);
  const findVendor = (id?: string) => state.data?.vendors.find((vendor) => vendor.id === id);
  const findEmployee = (id?: string) => state.data?.employees.find((employee) => employee.id === id);
  const findJob = (id?: string) => state.data?.jobs.find((job) => job.id === id);
  const findPurchaseOrder = (id?: string) => state.data?.purchaseOrders.find((purchaseOrder) => purchaseOrder.id === id);

  const resolveBarcode = async (barcode: string) => {
    const item = await provider.getInventoryByBarcode(barcode);
    if (!item) {
      throw new Error('No inventory item is assigned to that barcode.');
    }
    return item;
  };

  const issueInventory = (request: IssueInventoryRequest) => withAction('Inventory issued and transaction recorded.', () => provider.issueInventory(request));
  const receiveInventory = (request: ReceiveInventoryRequest) => withAction('Inventory received and transaction recorded.', () => provider.receiveInventory(request));
  const transferInventory = (request: TransferInventoryRequest) => withAction('Inventory transferred and transaction recorded.', () => provider.transferInventory(request));
  const adjustInventory = (request: AdjustInventoryRequest) => withAction('Inventory adjusted and transaction recorded.', () => provider.adjustInventory(request));
  const createPurchaseOrder = (request: CreatePurchaseOrderRequest) => withAction('Purchase order created.', () => provider.createPurchaseOrder(request));
  const setCurrentUser = (employeeId: string) => withAction('Current employee updated.', () => provider.setCurrentUser(employeeId));
  const resetDemoData = () => withAction('Demo data reset to the original seed state.', () => provider.resetDemoData());

  const clearMessages = () => {
    state.error = '';
    state.notice = '';
  };

  const itemStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return 'Out of Stock';
    if (item.quantity <= item.minimumQuantity) return 'Low Stock';
    return 'In Stock';
  };

  return {
    state,
    load,
    refresh,
    currentUser,
    activeJobs,
    lowStockItems,
    outOfStockItems,
    inventoryValue,
    todayTransactions,
    findItem,
    findLocation,
    findVendor,
    findEmployee,
    findJob,
    findPurchaseOrder,
    resolveBarcode,
    issueInventory,
    receiveInventory,
    transferInventory,
    adjustInventory,
    createPurchaseOrder,
    setCurrentUser,
    resetDemoData,
    clearMessages,
    itemStockStatus,
  };
}
