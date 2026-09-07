import type { InventoryItem, InventoryTransaction, Location, UnitOfMeasure } from '@/types/inventory';

export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const compactNumber = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

export const formatQuantity = (quantity: number, unit?: UnitOfMeasure) => `${compactNumber.format(quantity)}${unit ? ` ${unit}` : ''}`;

export const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(value));

export const formatDateTime = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(value));

export const locationLabel = (location?: Location) => location ? `${location.name} ${location.bin}` : 'Unknown location';

export const stockStatus = (item: InventoryItem) => {
  if (item.quantity <= 0) return 'Out of Stock';
  if (item.quantity <= item.minimumQuantity) return 'Low Stock';
  return 'In Stock';
};

export const transactionTone = (transaction: InventoryTransaction) => {
  if (transaction.type === 'ISSUE') return 'warning';
  if (transaction.type === 'RECEIVE') return 'success';
  if (transaction.type === 'TRANSFER') return 'info';
  return 'neutral';
};
