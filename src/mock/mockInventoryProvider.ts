import seedData from '@/mock/data/seed.json';
import type {
  AdjustInventoryRequest,
  CreatePurchaseOrderRequest,
  DemoDataSet,
  Employee,
  InventoryItem,
  InventorySearchFilters,
  InventoryTransaction,
  IssueInventoryRequest,
  PurchaseOrder,
  ReceiveInventoryRequest,
  TransactionFilters,
  TransferInventoryRequest,
} from '@/types/inventory';
import type { InventoryDataProvider } from '@/services/inventoryProvider';

const STORAGE_KEY = 'caldwell-inventory-demo-data-v1';
const NETWORK_DELAY = 120;

class InventoryServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryServiceError';
  }
}

const clone = <T>(value: T): T => structuredClone(value);

const wait = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, NETWORK_DELAY));
};

const normalize = (value: string) => value.trim().toLowerCase();

const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export class MockInventoryProvider implements InventoryDataProvider {
  async getSnapshot(): Promise<DemoDataSet> {
    await wait();
    return clone(this.readData());
  }

  async resetDemoData(): Promise<DemoDataSet> {
    await wait();
    const data = clone(seedData) as DemoDataSet;
    this.writeData(data);
    return clone(data);
  }

  async getInventory(filters: InventorySearchFilters = {}): Promise<InventoryItem[]> {
    await wait();
    const data = this.readData();
    return this.applyInventoryFilters(data.inventory, filters);
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    await wait();
    return clone(this.readData().inventory.find((item) => item.id === id));
  }

  async getInventoryByBarcode(barcode: string): Promise<InventoryItem | undefined> {
    await wait();
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) {
      throw new InventoryServiceError('Enter or scan a barcode before searching.');
    }
    return clone(this.readData().inventory.find((item) => item.barcode === trimmedBarcode));
  }

  async issueInventory(request: IssueInventoryRequest): Promise<InventoryTransaction> {
    await wait();
    const data = this.readData();
    const item = this.findItemOrThrow(data, request.itemId);
    this.requirePositiveQuantity(request.quantity);
    if (!request.jobId) {
      throw new InventoryServiceError('Select a job before issuing inventory.');
    }
    if (item.quantity < request.quantity) {
      throw new InventoryServiceError(`Only ${this.formatQuantity(item.quantity)} ${item.unit} is available.`);
    }
    item.quantity = this.roundQuantity(item.quantity - request.quantity);
    item.updatedAt = new Date().toISOString();
    const transaction = this.createTransaction(data, {
      type: 'ISSUE',
      itemId: item.id,
      quantity: request.quantity,
      unit: item.unit,
      sourceLocationId: item.locationId,
      jobId: request.jobId,
      employeeId: request.employeeId,
      notes: request.notes?.trim() || 'Issued to job.',
      referenceNumber: data.jobs.find((job) => job.id === request.jobId)?.jobNumber,
    });
    this.writeData(data);
    return clone(transaction);
  }

  async receiveInventory(request: ReceiveInventoryRequest): Promise<InventoryTransaction> {
    await wait();
    const data = this.readData();
    const item = this.findItemOrThrow(data, request.itemId);
    this.requirePositiveQuantity(request.quantity);
    this.requireLocation(data, request.locationId);
    item.quantity = this.roundQuantity(item.quantity + request.quantity);
    item.locationId = request.locationId;
    item.vendorId = request.vendorId || item.vendorId;
    item.updatedAt = new Date().toISOString();
    const transaction = this.createTransaction(data, {
      type: 'RECEIVE',
      itemId: item.id,
      quantity: request.quantity,
      unit: item.unit,
      destinationLocationId: request.locationId,
      employeeId: request.employeeId,
      notes: request.notes?.trim() || 'Received inventory.',
      referenceNumber: request.purchaseOrderId ? data.purchaseOrders.find((po) => po.id === request.purchaseOrderId)?.poNumber : undefined,
    });
    this.writeData(data);
    return clone(transaction);
  }

  async transferInventory(request: TransferInventoryRequest): Promise<InventoryTransaction> {
    await wait();
    const data = this.readData();
    const item = this.findItemOrThrow(data, request.itemId);
    this.requirePositiveQuantity(request.quantity);
    this.requireLocation(data, request.sourceLocationId);
    this.requireLocation(data, request.destinationLocationId);
    if (request.sourceLocationId === request.destinationLocationId) {
      throw new InventoryServiceError('Choose a different destination location.');
    }
    if (item.locationId !== request.sourceLocationId) {
      throw new InventoryServiceError('Source location does not match the current item location.');
    }
    if (item.quantity < request.quantity) {
      throw new InventoryServiceError(`Only ${this.formatQuantity(item.quantity)} ${item.unit} is available to transfer.`);
    }
    item.locationId = request.destinationLocationId;
    item.updatedAt = new Date().toISOString();
    const transaction = this.createTransaction(data, {
      type: 'TRANSFER',
      itemId: item.id,
      quantity: request.quantity,
      unit: item.unit,
      sourceLocationId: request.sourceLocationId,
      destinationLocationId: request.destinationLocationId,
      employeeId: request.employeeId,
      notes: request.notes?.trim() || 'Transferred inventory between locations.',
      referenceNumber: nextId('XFER').toUpperCase(),
    });
    this.writeData(data);
    return clone(transaction);
  }

  async adjustInventory(request: AdjustInventoryRequest): Promise<InventoryTransaction> {
    await wait();
    const data = this.readData();
    const item = this.findItemOrThrow(data, request.itemId);
    if (request.quantityChange === 0) {
      throw new InventoryServiceError('Adjustment quantity cannot be zero.');
    }
    if (!request.notes.trim()) {
      throw new InventoryServiceError('Enter a reason note for the adjustment.');
    }
    const nextQuantity = this.roundQuantity(item.quantity + request.quantityChange);
    if (nextQuantity < 0) {
      throw new InventoryServiceError('Adjustment would make inventory negative.');
    }
    item.quantity = nextQuantity;
    item.updatedAt = new Date().toISOString();
    const transaction = this.createTransaction(data, {
      type: 'ADJUSTMENT',
      itemId: item.id,
      quantity: request.quantityChange,
      unit: item.unit,
      sourceLocationId: item.locationId,
      employeeId: request.employeeId,
      notes: request.notes.trim(),
      referenceNumber: nextId('ADJ').toUpperCase(),
      reason: request.reason,
    });
    this.writeData(data);
    return clone(transaction);
  }

  async getTransactions(filters: TransactionFilters = {}): Promise<InventoryTransaction[]> {
    await wait();
    const data = this.readData();
    let transactions = [...data.transactions].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (filters.type && filters.type !== 'All') {
      transactions = transactions.filter((transaction) => transaction.type === filters.type);
    }
    if (filters.employeeId) {
      transactions = transactions.filter((transaction) => transaction.employeeId === filters.employeeId);
    }
    if (filters.jobId) {
      transactions = transactions.filter((transaction) => transaction.jobId === filters.jobId);
    }
    if (filters.startDate) {
      transactions = transactions.filter((transaction) => transaction.timestamp.slice(0, 10) >= filters.startDate!);
    }
    if (filters.endDate) {
      transactions = transactions.filter((transaction) => transaction.timestamp.slice(0, 10) <= filters.endDate!);
    }
    if (filters.query?.trim()) {
      const query = normalize(filters.query);
      transactions = transactions.filter((transaction) => {
        const item = data.inventory.find((inventoryItem) => inventoryItem.id === transaction.itemId);
        const employee = data.employees.find((person) => person.id === transaction.employeeId);
        const job = data.jobs.find((project) => project.id === transaction.jobId);
        return [transaction.id, transaction.referenceNumber, transaction.notes, item?.partNumber, item?.description, employee?.name, job?.jobNumber]
          .filter(Boolean)
          .some((value) => normalize(String(value)).includes(query));
      });
    }
    return clone(transactions);
  }

  async getJobs() {
    await wait();
    return clone(this.readData().jobs);
  }

  async getJob(id: string) {
    await wait();
    return clone(this.readData().jobs.find((job) => job.id === id));
  }

  async getEmployees() {
    await wait();
    return clone(this.readData().employees);
  }

  async getLocations() {
    await wait();
    return clone(this.readData().locations);
  }

  async getVendors() {
    await wait();
    return clone(this.readData().vendors);
  }

  async getPurchaseOrders() {
    await wait();
    return clone(this.readData().purchaseOrders);
  }

  async getPurchaseOrder(id: string) {
    await wait();
    return clone(this.readData().purchaseOrders.find((po) => po.id === id));
  }

  async createPurchaseOrder(request: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    await wait();
    const data = this.readData();
    if (!request.lineItems.length) {
      throw new InventoryServiceError('Add at least one line item before creating a purchase order.');
    }
    const poNumber = `PO-${new Date().getFullYear()}-${String(data.purchaseOrders.length + 427).padStart(3, '0')}`;
    const purchaseOrder: PurchaseOrder = {
      id: nextId('po'),
      poNumber,
      vendorId: request.vendorId,
      date: new Date().toISOString().slice(0, 10),
      status: 'Draft',
      lineItems: request.lineItems.map((line, index) => ({
        id: `${poNumber}-line-${index + 1}`,
        itemId: line.itemId,
        quantity: line.quantity,
        unitCost: line.unitCost,
      })),
      notes: request.notes?.trim() || 'Created from low-stock inventory.',
    };
    data.purchaseOrders.unshift(purchaseOrder);
    this.writeData(data);
    return clone(purchaseOrder);
  }

  async setCurrentUser(employeeId: string): Promise<Employee> {
    await wait();
    const data = this.readData();
    const employee = data.employees.find((person) => person.id === employeeId);
    if (!employee) {
      throw new InventoryServiceError('Selected employee was not found.');
    }
    data.currentUserId = employee.id;
    this.writeData(data);
    return clone(employee);
  }

  private readData(): DemoDataSet {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      const data = clone(seedData) as DemoDataSet;
      this.writeData(data);
      return data;
    }
    try {
      return JSON.parse(rawData) as DemoDataSet;
    } catch {
      throw new InventoryServiceError('Demo inventory data could not be loaded. Reset demo data from Settings.');
    }
  }

  private writeData(data: DemoDataSet) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private findItemOrThrow(data: DemoDataSet, itemId: string) {
    const item = data.inventory.find((inventoryItem) => inventoryItem.id === itemId);
    if (!item) {
      throw new InventoryServiceError('Inventory item was not found.');
    }
    return item;
  }

  private requireLocation(data: DemoDataSet, locationId: string) {
    if (!data.locations.some((location) => location.id === locationId)) {
      throw new InventoryServiceError('Selected location was not found.');
    }
  }

  private requirePositiveQuantity(quantity: number) {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new InventoryServiceError('Enter a quantity greater than zero.');
    }
  }

  private applyInventoryFilters(items: InventoryItem[], filters: InventorySearchFilters) {
    let results = [...items];
    if (filters.query?.trim()) {
      const query = normalize(filters.query);
      results = results.filter((item) => [
        item.partNumber,
        item.description,
        item.manufacturer,
        item.manufacturerPartNumber,
        item.category,
        item.subcategory,
        item.barcode,
      ].filter(Boolean).some((value) => normalize(String(value)).includes(query)));
    }
    if (filters.category) {
      results = results.filter((item) => item.category === filters.category);
    }
    if (filters.locationId) {
      results = results.filter((item) => item.locationId === filters.locationId);
    }
    if (filters.stockStatus && filters.stockStatus !== 'All') {
      results = results.filter((item) => {
        if (filters.stockStatus === 'Out of Stock') return item.quantity <= 0;
        if (filters.stockStatus === 'Low Stock') return item.quantity > 0 && item.quantity <= item.minimumQuantity;
        return item.quantity > item.minimumQuantity;
      });
    }
    return results.sort((a, b) => a.partNumber.localeCompare(b.partNumber));
  }

  private createTransaction(data: DemoDataSet, transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) {
    const completeTransaction: InventoryTransaction = {
      id: nextId('txn'),
      timestamp: new Date().toISOString(),
      ...transaction,
    };
    data.transactions.unshift(completeTransaction);
    return completeTransaction;
  }

  private roundQuantity(quantity: number) {
    return Number(quantity.toFixed(2));
  }

  private formatQuantity(quantity: number) {
    return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2);
  }
}

export const mockInventoryProvider = new MockInventoryProvider();
