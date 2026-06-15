import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import {
  CreatePaymentDto,
  ListPaymentsQueryDto,
} from '../application/dto/payment.dto';
import {
  CreatePaymentUseCase,
  DeletePaymentUseCase,
  GetOutstandingUseCase,
  GetPaymentUseCase,
  ListPaymentsUseCase,
} from '../application/payment.use-cases';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly listPayments: ListPaymentsUseCase,
    private readonly getPayment: GetPaymentUseCase,
    private readonly createPayment: CreatePaymentUseCase,
    private readonly deletePayment: DeletePaymentUseCase,
    private readonly getOutstanding: GetOutstandingUseCase,
  ) {}

  @Get('outstanding')
  async outstanding() {
    return successResponse(await this.getOutstanding.execute());
  }

  @Get()
  async list(@Query() query: ListPaymentsQueryDto) {
    const { items, meta } = await this.listPayments.execute(query);
    return successResponse(items, meta);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return successResponse(await this.getPayment.execute(id));
  }

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    return successResponse(await this.createPayment.execute(dto));
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string) {
    await this.deletePayment.execute(id);
    return successResponse({ deleted: true });
  }
}
