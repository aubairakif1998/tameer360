import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import {
  CreateCustomerDto,
  ListCustomersQueryDto,
  UpdateCustomerDto,
} from '../application/dto/customer.dto';
import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  GetCustomerUseCase,
  ListCustomersUseCase,
  UpdateCustomerUseCase,
} from '../application/customer.use-cases';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly listCustomers: ListCustomersUseCase,
    private readonly getCustomer: GetCustomerUseCase,
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly updateCustomer: UpdateCustomerUseCase,
    private readonly deleteCustomer: DeleteCustomerUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListCustomersQueryDto) {
    const { items, meta } = await this.listCustomers.execute(query);
    return successResponse(items, meta);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.getCustomer.execute(id);
    return successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    const data = await this.createCustomer.execute(dto);
    return successResponse(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const data = await this.updateCustomer.execute(id, dto);
    return successResponse(data);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string) {
    await this.deleteCustomer.execute(id);
    return successResponse({ deleted: true });
  }
}
