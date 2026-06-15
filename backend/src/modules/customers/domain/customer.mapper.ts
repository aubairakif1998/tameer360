import type { CustomerRecord } from '../../../shared/database/schema/customers';
import type {
  Customer,
  CustomerDetail,
  CustomerLedger,
  CustomerWithLedger,
} from './customer.entity';

export function emptyLedger(): CustomerLedger {
  return {
    totalPurchase: '0.00',
    totalReceived: '0.00',
    remainingBalance: '0.00',
    lastOrderDate: null,
  };
}

export function toCustomer(record: CustomerRecord): Customer {
  return {
    id: record.id,
    tenantId: record.tenantId,
    name: record.name,
    phone: record.phone,
    cnic: record.cnic,
    address: record.address,
    type: record.type,
    notes: record.notes,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toCustomerWithLedger(
  record: CustomerRecord,
): CustomerWithLedger {
  return {
    ...toCustomer(record),
    ledger: emptyLedger(),
  };
}

export function toCustomerDetail(record: CustomerRecord): CustomerDetail {
  return toCustomerWithLedger(record);
}
