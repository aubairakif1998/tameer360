export interface ProductionBatchListItem {
  id: string;
  batchNumber: string;
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  producedQty: string;
  damagedQty: string;
  netQty: string;
  productionDate: string;
  notes: string | null;
  createdAt: string;
}

export interface ProductionBatchDetail extends ProductionBatchListItem {
  updatedAt: string;
}

export interface CreateProductionBatchInput {
  materialTypeId: string;
  producedQty: number;
  damagedQty?: number;
  productionDate: string;
  notes?: string;
}

export interface ListProductionBatchesQuery {
  page?: number;
  limit?: number;
  materialTypeId?: string;
  fromDate?: string;
  toDate?: string;
}

export const PRODUCTION_REPOSITORY = Symbol('PRODUCTION_REPOSITORY');

export interface ProductionRepository {
  findMany(
    tenantId: string,
    query: ListProductionBatchesQuery,
  ): Promise<{ items: ProductionBatchListItem[]; total: number }>;
  findById(tenantId: string, id: string): Promise<ProductionBatchDetail | null>;
  create(
    tenantId: string,
    input: CreateProductionBatchInput,
  ): Promise<ProductionBatchDetail>;
}
