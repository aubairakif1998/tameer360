import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { customers } from '../../../shared/database/schema/customers';
import { parsePagination } from '../../../shared/common/pagination';
import type {
  CreateCustomerInput,
  CustomerDetail,
  CustomerRepository,
  CustomerWithLedger,
  ListCustomersQuery,
  UpdateCustomerInput,
} from '../domain/customer.entity';
import { CUSTOMER_REPOSITORY } from '../domain/customer.entity';
import {
  toCustomerDetail,
  toCustomerWithLedger,
} from '../domain/customer.mapper';

@Injectable()
export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  private buildWhere(tenantId: string, query: ListCustomersQuery) {
    const conditions = [eq(customers.tenantId, tenantId)];

    if (query.isActive !== undefined) {
      conditions.push(eq(customers.isActive, query.isActive));
    } else {
      conditions.push(eq(customers.isActive, true));
    }

    if (query.type) {
      conditions.push(eq(customers.type, query.type));
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(customers.name, term),
          ilike(customers.phone, term),
          ilike(customers.cnic, term),
        )!,
      );
    }

    return and(...conditions);
  }

  async findMany(
    tenantId: string,
    query: ListCustomersQuery,
  ): Promise<{ items: CustomerWithLedger[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const where = this.buildWhere(tenantId, query);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(customers)
        .where(where)
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: count() }).from(customers).where(where),
    ]);

    return {
      items: rows.map(toCustomerWithLedger),
      total: Number(totalResult[0]?.count ?? 0),
    };
  }

  async findById(tenantId: string, id: string): Promise<CustomerDetail | null> {
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.id, id)))
      .limit(1);

    return customer ? toCustomerDetail(customer) : null;
  }

  async create(
    tenantId: string,
    input: CreateCustomerInput,
  ): Promise<CustomerDetail> {
    const [customer] = await this.db
      .insert(customers)
      .values({
        tenantId,
        name: input.name.trim(),
        phone: input.phone,
        cnic: input.cnic,
        type: input.type ?? 'builder',
        notes: input.notes,
      })
      .returning();

    return toCustomerDetail(customer);
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateCustomerInput,
  ): Promise<CustomerDetail | null> {
    const updateData: Partial<typeof customers.$inferInsert> = {};

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.cnic !== undefined) updateData.cnic = input.cnic;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    if (Object.keys(updateData).length === 0) {
      return this.findById(tenantId, id);
    }

    const [customer] = await this.db
      .update(customers)
      .set(updateData)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.id, id)))
      .returning();

    return customer ? toCustomerDetail(customer) : null;
  }

  async softDelete(tenantId: string, id: string): Promise<boolean> {
    const result = await this.db
      .update(customers)
      .set({ isActive: false })
      .where(and(eq(customers.tenantId, tenantId), eq(customers.id, id)))
      .returning({ id: customers.id });

    return result.length > 0;
  }
}

export const customerRepositoryProvider = {
  provide: CUSTOMER_REPOSITORY,
  useClass: DrizzleCustomerRepository,
};
