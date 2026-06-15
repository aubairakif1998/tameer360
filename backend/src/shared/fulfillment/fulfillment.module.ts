import { Global, Module } from '@nestjs/common';
import { OrderFulfillmentService } from './order-fulfillment.service';

@Global()
@Module({
  providers: [OrderFulfillmentService],
  exports: [OrderFulfillmentService],
})
export class FulfillmentModule {}
