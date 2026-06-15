import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  StockLedgerService,
  type StockAvailabilityItem,
  type StockLedgerItem,
  type StockSummaryItem,
} from '../../../shared/stock/stock-ledger.service';
import type { ListStockLedgerQueryDto } from './dto/inventory.dto';

@Injectable()
export class GetStockSummaryUseCase {
  constructor(
    private readonly stock: StockLedgerService,
    private readonly tenantContext: TenantContext,
  ) {}

  execute(): Promise<StockSummaryItem[]> {
    return this.stock.getSummary(this.tenantContext.getTenantId());
  }
}

@Injectable()
export class GetStockAvailabilityUseCase {
  constructor(
    private readonly stock: StockLedgerService,
    private readonly tenantContext: TenantContext,
  ) {}

  execute(): Promise<StockAvailabilityItem[]> {
    return this.stock.getAvailability(this.tenantContext.getTenantId());
  }
}

@Injectable()
export class ListStockLedgerUseCase {
  constructor(
    private readonly stock: StockLedgerService,
    private readonly tenantContext: TenantContext,
  ) {}

  execute(query: ListStockLedgerQueryDto): Promise<StockLedgerItem[]> {
    return this.stock.listTransactions(this.tenantContext.getTenantId(), {
      materialTypeId: query.materialTypeId,
      limit: Math.min(100, Math.max(1, Number(query.limit) || 50)),
    });
  }
}
