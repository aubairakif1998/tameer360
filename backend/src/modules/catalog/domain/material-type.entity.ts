import type { MaterialCategory } from './material-category.constants';
import type { MaterialUnit } from './material-unit';

export type { MaterialUnit } from './material-unit';

export interface MaterialType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  defaultRate: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialTypeReferences {
  orders: number;
  dispatches: number;
  productionBatches: number;
  stockLedger: number;
  total: number;
}

export interface CreateMaterialTypeInput {
  name: string;
  code: string;
  category: MaterialCategory;
  unit?: MaterialUnit;
  defaultRate?: number;
}

export interface UpdateMaterialTypeInput {
  name?: string;
  code?: string;
  category?: MaterialCategory;
  unit?: MaterialUnit;
  defaultRate?: number | null;
  isActive?: boolean;
}

export interface ListMaterialTypesQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: MaterialCategory;
  isActive?: boolean;
}

export const MATERIAL_TYPE_REPOSITORY = Symbol('MATERIAL_TYPE_REPOSITORY');

export interface MaterialTypeRepository {
  findMany(
    tenantId: string,
    query: ListMaterialTypesQuery,
  ): Promise<{ items: MaterialType[]; total: number }>;
  findById(tenantId: string, id: string): Promise<MaterialType | null>;
  findByCode(tenantId: string, code: string): Promise<MaterialType | null>;
  generateUniqueCode(tenantId: string, name: string): Promise<string>;
  countReferences(
    tenantId: string,
    materialTypeId: string,
  ): Promise<MaterialTypeReferences>;
  create(
    tenantId: string,
    input: CreateMaterialTypeInput,
  ): Promise<MaterialType>;
  update(
    tenantId: string,
    id: string,
    input: UpdateMaterialTypeInput,
  ): Promise<MaterialType | null>;
  hardDelete(tenantId: string, id: string): Promise<boolean>;
}
