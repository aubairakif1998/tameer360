import { Body, Controller, Get, Patch } from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import { UpdateDocumentTemplatesDto } from '../application/dto/document-templates.dto';
import {
  GetDocumentTemplatesUseCase,
  UpdateDocumentTemplatesUseCase,
} from '../application/settings.use-cases';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly getDocumentTemplates: GetDocumentTemplatesUseCase,
    private readonly updateDocumentTemplatesUseCase: UpdateDocumentTemplatesUseCase,
  ) {}

  @Get('document-templates')
  async documentTemplates() {
    return successResponse(await this.getDocumentTemplates.execute());
  }

  @Patch('document-templates')
  async patchDocumentTemplates(@Body() dto: UpdateDocumentTemplatesDto) {
    return successResponse(await this.updateDocumentTemplatesUseCase.execute(dto));
  }
}
