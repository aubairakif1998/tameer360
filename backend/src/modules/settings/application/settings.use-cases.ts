import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { tenants } from '../../../shared/database/schema/tenants';
import {
  DEFAULT_DOCUMENT_TEMPLATES,
  mergeDocumentTemplates,
  type DocumentTemplatesConfig,
} from '../../../shared/document-templates/document-templates.types';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import type { UpdateDocumentTemplatesDto } from './dto/document-templates.dto';

@Injectable()
export class GetDocumentTemplatesUseCase {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(): Promise<DocumentTemplatesConfig> {
    const tenantId = this.tenantContext.getTenantId();
    const [row] = await this.db
      .select({ documentTemplates: tenants.documentTemplates })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    return mergeDocumentTemplates(row?.documentTemplates);
  }
}

@Injectable()
export class UpdateDocumentTemplatesUseCase {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(
    dto: UpdateDocumentTemplatesDto,
  ): Promise<DocumentTemplatesConfig> {
    const tenantId = this.tenantContext.getTenantId();
    const current = await this.getCurrent(tenantId);

    const next: DocumentTemplatesConfig = {
      invoice: {
        ...current.invoice,
        ...dto.invoice,
        fields: {
          ...current.invoice.fields,
          ...(dto.invoice?.fields ?? {}),
        },
      },
      receipt: {
        ...current.receipt,
        ...dto.receipt,
        fields: {
          ...current.receipt.fields,
          ...(dto.receipt?.fields ?? {}),
        },
      },
    };

    await this.db
      .update(tenants)
      .set({ documentTemplates: next, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    return next;
  }

  private async getCurrent(tenantId: string): Promise<DocumentTemplatesConfig> {
    const [row] = await this.db
      .select({ documentTemplates: tenants.documentTemplates })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    return mergeDocumentTemplates(row?.documentTemplates ?? DEFAULT_DOCUMENT_TEMPLATES);
  }
}
