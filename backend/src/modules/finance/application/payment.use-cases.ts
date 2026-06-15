import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomerLedgerService } from '../../../shared/ledger/customer-ledger.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  PAYMENT_REPOSITORY,
  type PaymentRepository,
} from '../domain/payment.entity';
import type { CreatePaymentDto, ListPaymentsQueryDto } from './dto/payment.dto';

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly repo: PaymentRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(query: ListPaymentsQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { items, total } = await this.repo.findMany(tenantId, query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { items, meta: { page, limit, total } };
  }
}

@Injectable()
export class GetPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly repo: PaymentRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const item = await this.repo.findById(this.tenantContext.getTenantId(), id);
    if (!item) {
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found',
      });
    }
    return item;
  }
}

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly repo: PaymentRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(dto: CreatePaymentDto) {
    return this.repo.create(this.tenantContext.getTenantId(), dto);
  }
}

@Injectable()
export class DeletePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly repo: PaymentRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const deleted = await this.repo.delete(
      this.tenantContext.getTenantId(),
      id,
    );
    if (!deleted) {
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found',
      });
    }
  }
}

@Injectable()
export class GetOutstandingUseCase {
  constructor(
    private readonly ledger: CustomerLedgerService,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute() {
    return this.ledger.getOutstandingSummary(this.tenantContext.getTenantId());
  }
}
