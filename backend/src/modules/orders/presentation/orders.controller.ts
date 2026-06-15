import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import {
  CreateOrderDto,
  ListOrdersQueryDto,
  UpdateOrderDto,
} from '../application/dto/order.dto';
import {
  CreateOrderUseCase,
  GetFulfillmentSummaryUseCase,
  GetOrderUseCase,
  ListOrdersUseCase,
  UpdateOrderUseCase,
} from '../application/order.use-cases';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly listOrders: ListOrdersUseCase,
    private readonly getOrder: GetOrderUseCase,
    private readonly createOrder: CreateOrderUseCase,
    private readonly updateOrder: UpdateOrderUseCase,
    private readonly fulfillmentSummary: GetFulfillmentSummaryUseCase,
  ) {}

  @Get('fulfillment-summary')
  async summary() {
    const data = await this.fulfillmentSummary.execute();
    return successResponse(data);
  }

  @Get()
  async list(@Query() query: ListOrdersQueryDto) {
    const { items, meta } = await this.listOrders.execute(query);
    return successResponse(items, meta);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.getOrder.execute(id);
    return successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const data = await this.createOrder.execute(dto);
    return successResponse(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    const data = await this.updateOrder.execute(id, dto);
    return successResponse(data);
  }
}
