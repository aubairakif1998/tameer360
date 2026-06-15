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
  CreateDispatchDto,
  ListDispatchesQueryDto,
  UpdateDispatchDto,
} from '../application/dto/dispatch.dto';
import {
  CreateDispatchUseCase,
  GetDispatchUseCase,
  ListDispatchesUseCase,
  UpdateDispatchUseCase,
} from '../application/dispatch.use-cases';

@Controller('dispatches')
export class DispatchesController {
  constructor(
    private readonly listDispatches: ListDispatchesUseCase,
    private readonly getDispatch: GetDispatchUseCase,
    private readonly createDispatch: CreateDispatchUseCase,
    private readonly updateDispatch: UpdateDispatchUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListDispatchesQueryDto) {
    const { items, meta } = await this.listDispatches.execute(query);
    return successResponse(items, meta);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return successResponse(await this.getDispatch.execute(id));
  }

  @Post()
  async create(@Body() dto: CreateDispatchDto) {
    return successResponse(await this.createDispatch.execute(dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDispatchDto) {
    return successResponse(await this.updateDispatch.execute(id, dto));
  }
}
