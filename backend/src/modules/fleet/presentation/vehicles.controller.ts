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
  CreateVehicleDto,
  ListVehiclesQueryDto,
  UpdateVehicleDto,
} from '../application/dto/vehicle.dto';
import {
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  GetVehicleUseCase,
  ListVehiclesUseCase,
  UpdateVehicleUseCase,
} from '../application/vehicle.use-cases';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly listVehicles: ListVehiclesUseCase,
    private readonly getVehicle: GetVehicleUseCase,
    private readonly createVehicle: CreateVehicleUseCase,
    private readonly updateVehicle: UpdateVehicleUseCase,
    private readonly deleteVehicle: DeleteVehicleUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListVehiclesQueryDto) {
    const { items, meta } = await this.listVehicles.execute(query);
    return successResponse(items, meta);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return successResponse(await this.getVehicle.execute(id));
  }

  @Post()
  async create(@Body() dto: CreateVehicleDto) {
    return successResponse(await this.createVehicle.execute(dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return successResponse(await this.updateVehicle.execute(id, dto));
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string) {
    await this.deleteVehicle.execute(id);
    return successResponse({ deleted: true });
  }
}
