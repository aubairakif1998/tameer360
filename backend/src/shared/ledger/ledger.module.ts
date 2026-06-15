import { Global, Module } from '@nestjs/common';
import { CustomerLedgerService } from './customer-ledger.service';
import { PaymentSyncService } from './payment-sync.service';
import { OUTSTANDING_LEDGER } from './ledger.types';

@Global()
@Module({
  providers: [
    CustomerLedgerService,
    PaymentSyncService,
    {
      provide: OUTSTANDING_LEDGER,
      useExisting: CustomerLedgerService,
    },
  ],
  exports: [CustomerLedgerService, PaymentSyncService, OUTSTANDING_LEDGER],
})
export class LedgerModule {}
