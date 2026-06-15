export type CustomerType = 'vendor' | 'contractor' | 'builder' | 'individual';

export interface CustomerLedger {
  totalPurchase: string;
  totalReceived: string;
  remainingBalance: string;
  lastOrderDate: string | null;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  cnic: string | null;
  address: string | null;
  type: CustomerType;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerWithLedger extends Customer {
  ledger: CustomerLedger;
}

export type CustomerDetail = CustomerWithLedger;

export interface CreateCustomerInput {
  name: string;
  phone: string;
  type?: CustomerType;
  cnic?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  type?: CustomerType;
  cnic?: string | null;
  notes?: string;
  isActive?: boolean;
}

export interface ListCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: CustomerType;
  isActive?: boolean;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepository {
  findMany(
    tenantId: string,
    query: ListCustomersQuery,
  ): Promise<{ items: CustomerWithLedger[]; total: number }>;
  findById(tenantId: string, id: string): Promise<CustomerDetail | null>;
  create(tenantId: string, input: CreateCustomerInput): Promise<CustomerDetail>;
  update(
    tenantId: string,
    id: string,
    input: UpdateCustomerInput,
  ): Promise<CustomerDetail | null>;
  softDelete(tenantId: string, id: string): Promise<boolean>;
}
