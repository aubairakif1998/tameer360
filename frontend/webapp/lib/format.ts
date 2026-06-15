export function formatPkr(amount: string | number | null | undefined) {
  const num = Number(amount ?? 0);
  return `Rs. ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

export const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  vendor: 'Vendor',
  contractor: 'Contractor',
  builder: 'Builder',
  individual: 'Individual',
};

export const MATERIAL_UNIT_LABELS: Record<string, string> = {
  piece: 'Piece',
  ton: 'Ton',
  cft: 'Cubic Ft',
  bag: 'Bag',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  partial: 'Partial',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export function formatQty(qty: string | number) {
  return Number(qty).toLocaleString('en-PK', { maximumFractionDigits: 0 });
}

export const DISPATCH_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  loaded: 'Loaded',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  cheque: 'Cheque',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  truck: 'Truck',
  loader: 'Loader',
  tractor: 'Tractor',
  dumper: 'Dumper',
};

export const STOCK_TRANSACTION_LABELS: Record<string, string> = {
  opening: 'Opening',
  production: 'Production',
  dispatch: 'Dispatch',
  adjustment: 'Adjustment',
};
