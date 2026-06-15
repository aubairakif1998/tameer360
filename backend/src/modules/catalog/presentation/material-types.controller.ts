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
  CreateMaterialTypeDto,
  ListMaterialTypesQueryDto,
  SuggestMaterialCodeQueryDto,
  UpdateMaterialTypeDto,
} from '../application/dto/material-type.dto';
import {
  CreateMaterialTypeUseCase,
  DeleteMaterialTypeUseCase,
  GetMaterialTypeUseCase,
  ListMaterialTypesUseCase,
  SuggestMaterialCodeUseCase,
  UpdateMaterialTypeUseCase,
} from '../application/material-type.use-cases';

@Controller('material-types')
export class MaterialTypesController {
  constructor(
    private readonly listMaterialTypes: ListMaterialTypesUseCase,
    private readonly getMaterialType: GetMaterialTypeUseCase,
    private readonly suggestMaterialCode: SuggestMaterialCodeUseCase,
    private readonly createMaterialType: CreateMaterialTypeUseCase,
    private readonly updateMaterialType: UpdateMaterialTypeUseCase,
    private readonly deleteMaterialType: DeleteMaterialTypeUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListMaterialTypesQueryDto) {
    const { items, meta } = await this.listMaterialTypes.execute(query);
    return successResponse(items, meta);
  }

  @Get('suggest-code')
  async suggestCode(@Query() query: SuggestMaterialCodeQueryDto) {
    const data = await this.suggestMaterialCode.execute(query);
    return successResponse(data);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.getMaterialType.execute(id);
    return successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreateMaterialTypeDto) {
    const data = await this.createMaterialType.execute(dto);
    return successResponse(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMaterialTypeDto) {
    const data = await this.updateMaterialType.execute(id, dto);
    return successResponse(data);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string) {
    await this.deleteMaterialType.execute(id);
    return successResponse({ deleted: true });
  }
}
