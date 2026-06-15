import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import {
  CreateProductionBatchDto,
  ListProductionBatchesQueryDto,
} from '../application/dto/production.dto';
import {
  CreateProductionBatchUseCase,
  GetProductionBatchUseCase,
  ListProductionBatchesUseCase,
} from '../application/production.use-cases';

@Controller('production')
export class ProductionController {
  constructor(
    private readonly listBatches: ListProductionBatchesUseCase,
    private readonly getBatch: GetProductionBatchUseCase,
    private readonly createBatch: CreateProductionBatchUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListProductionBatchesQueryDto) {
    const { items, meta } = await this.listBatches.execute(query);
    return successResponse(items, meta);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return successResponse(await this.getBatch.execute(id));
  }

  @Post()
  async create(@Body() dto: CreateProductionBatchDto) {
    return successResponse(await this.createBatch.execute(dto));
  }
}
