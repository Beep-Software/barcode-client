export type UnitOfMeasure =
  | 'EA'
  | 'BOX'
  | 'LB'
  | 'FT'
  | 'GAL'
  | 'SPOOL'
  | 'ROLL'
  | 'SHEET'
  | 'PAIR'
  | 'SET';

export type InventoryStatus = 'Active' | 'Inactive';
export type JobStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
export type TransactionType = 'RECEIVE' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
export type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
export type AdjustmentReason = 'Damaged' | 'Lost' | 'Counting error' | 'Found inventory' | 'Correction' | 'Other';

export interface InventoryItem {
  id: string;
  partNumber: string;
  manufacturer: string;
  manufacturerPartNumber: string;
  description: string;
  category: string;
  subcategory: string;
  barcode?: string;
  unit: UnitOfMeasure;
  quantity: number;
  minimumQuantity: number;
  reorderQuantity: number;
  locationId: string;
  vendorId: string;
  cost: number;
  status: InventoryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  bin: string;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  projectName: string;
  customer: string;
  location: string;
  description: string;
  status: JobStatus;
  startDate: string;
  expectedCompletionDate: string;
  projectManagerId: string;
  notes: string;
}

export interface InventoryTransaction {
  id: string;
  type: TransactionType;
  itemId: string;
  quantity: number;
  unit: UnitOfMeasure;
  sourceLocationId?: string;
  destinationLocationId?: string;
  jobId?: string;
  employeeId: string;
  timestamp: string;
  notes: string;
  referenceNumber?: string;
  reason?: AdjustmentReason;
}

export interface PurchaseOrderLine {
  id: string;
  itemId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  date: string;
  status: PurchaseOrderStatus;
  lineItems: PurchaseOrderLine[];
  notes: string;
}

export interface InventorySearchFilters {
  query?: string;
  category?: string;
  locationId?: string;
  stockStatus?: 'All' | 'Low Stock' | 'Out of Stock' | 'In Stock';
}

export interface TransactionFilters {
  query?: string;
  type?: TransactionType | 'All';
  employeeId?: string;
  jobId?: string;
  startDate?: string;
  endDate?: string;
}

export interface IssueInventoryRequest {
  itemId: string;
  quantity: number;
  jobId: string;
  employeeId: string;
  notes?: string;
}

export interface ReceiveInventoryRequest {
  itemId: string;
  quantity: number;
  locationId: string;
  employeeId: string;
  vendorId?: string;
  purchaseOrderId?: string;
  notes?: string;
}

export interface TransferInventoryRequest {
  itemId: string;
  quantity: number;
  sourceLocationId: string;
  destinationLocationId: string;
  employeeId: string;
  notes?: string;
}

export interface AdjustInventoryRequest {
  itemId: string;
  quantityChange: number;
  employeeId: string;
  reason: AdjustmentReason;
  notes: string;
}

export interface CreatePurchaseOrderRequest {
  vendorId: string;
  employeeId: string;
  lineItems: Array<Pick<PurchaseOrderLine, 'itemId' | 'quantity' | 'unitCost'>>;
  notes?: string;
}

export interface DemoDataSet {
  inventory: InventoryItem[];
  locations: Location[];
  vendors: Vendor[];
  employees: Employee[];
  jobs: Job[];
  transactions: InventoryTransaction[];
  purchaseOrders: PurchaseOrder[];
  currentUserId: string;
}