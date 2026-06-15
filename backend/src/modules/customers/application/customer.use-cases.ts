import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import { CustomerLedgerService } from '../../../shared/ledger/customer-ledger.service';
import { emptyLedger } from '../domain/customer.mapper';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../domain/customer.entity';
import type {
  CreateCustomerDto,
  ListCustomersQueryDto,
  UpdateCustomerDto,
} from './dto/customer.dto';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly repo: CustomerRepository,
    private readonly tenantContext: TenantContext,
    private readonly ledgerService: CustomerLedgerService,
  ) {}

  async execute(query: ListCustomersQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { items, total } = await this.repo.findMany(tenantId, query);
    const ledgers = await this.ledgerService.getLedgersForCustomers(
      tenantId,
      items.map((c) => c.id),
    );
    const enriched = items.map((c) => ({
      ...c,
      ledger: ledgers.get(c.id) ?? emptyLedger(),
    }));
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { items: enriched, meta: { page, limit, total } };
  }
}

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly repo: CustomerRepository,
    private readonly tenantContext: TenantContext,
    private readonly ledgerService: CustomerLedgerService,
  ) {}

  async execute(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const customer = await this.repo.findById(tenantId, id);
    if (!customer) {
      throw new NotFoundException({
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
      });
    }
    const ledger = await this.ledgerService.getLedgerForCustomer(tenantId, id);
    return { ...customer, ledger };
  }
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly repo: CustomerRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(dto: CreateCustomerDto) {
    const tenantId = this.tenantContext.getTenantId();
    return this.repo.create(tenantId, dto);
  }
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly repo: CustomerRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string, dto: UpdateCustomerDto) {
    const tenantId = this.tenantContext.getTenantId();
    const customer = await this.repo.update(tenantId, id, dto);
    if (!customer) {
      throw new NotFoundException({
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
      });
    }
    return customer;
  }
}

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly repo: CustomerRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const deleted = await this.repo.softDelete(tenantId, id);
    if (!deleted) {
      throw new NotFoundException({
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
      });
    }
  }
}
