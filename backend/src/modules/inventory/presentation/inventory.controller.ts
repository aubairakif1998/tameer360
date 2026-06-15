import { Controller, Get, Query } from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import { ListStockLedgerQueryDto } from '../application/dto/inventory.dto';
import {
  GetStockAvailabilityUseCase,
  GetStockSummaryUseCase,
  ListStockLedgerUseCase,
} from '../application/inventory.use-cases';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly getSummary: GetStockSummaryUseCase,
    private readonly getAvailability: GetStockAvailabilityUseCase,
    private readonly listLedger: ListStockLedgerUseCase,
  ) {}

  @Get('summary')
  async summary() {
    return successResponse(await this.getSummary.execute());
  }

  @Get('availability')
  async availability() {
    return successResponse(await this.getAvailability.execute());
  }

  @Get('ledger')
  async ledger(@Query() query: ListStockLedgerQueryDto) {
    return successResponse(await this.listLedger.execute(query));
  }
}
