import type {
  AdjustInventoryRequest,
  CreatePurchaseOrderRequest,
  DemoDataSet,
  Employee,
  InventoryItem,
  InventorySearchFilters,
  InventoryTransaction,
  IssueInventoryRequest,
  Job,
  Location,
  PurchaseOrder,
  ReceiveInventoryRequest,
  TransactionFilters,
  TransferInventoryRequest,
  Vendor,
} from '@/types/inventory';

export interface InventoryDataProvider {
  getSnapshot(): Promise<DemoDataSet>;
  resetDemoData(): Promise<DemoDataSet>;
  getInventory(filters?: InventorySearchFilters): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  getInventoryByBarcode(barcode: string): Promise<InventoryItem | undefined>;
  issueInventory(request: IssueInventoryRequest): Promise<InventoryTransaction>;
  receiveInventory(request: ReceiveInventoryRequest): Promise<InventoryTransaction>;
  transferInventory(request: TransferInventoryRequest): Promise<InventoryTransaction>;
  adjustInventory(request: AdjustInventoryRequest): Promise<InventoryTransaction>;
  getTransactions(filters?: TransactionFilters): Promise<InventoryTransaction[]>;
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  getEmployees(): Promise<Employee[]>;
  getLocations(): Promise<Location[]>;
  getVendors(): Promise<Vendor[]>;
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(request: CreatePurchaseOrderRequest): Promise<PurchaseOrder>;
  setCurrentUser(employeeId: string): Promise<Employee>;
}