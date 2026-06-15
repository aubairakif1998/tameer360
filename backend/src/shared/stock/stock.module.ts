import { Global, Module } from '@nestjs/common';
import { StockLedgerService } from './stock-ledger.service';

@Global()
@Module({
  providers: [StockLedgerService],
  exports: [StockLedgerService],
})
export class StockModule {}
