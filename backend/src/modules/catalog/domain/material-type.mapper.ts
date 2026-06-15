import type { MaterialTypeRecord } from '../../../shared/database/schema/material-types';
import type { MaterialType } from './material-type.entity';

export function toMaterialType(record: MaterialTypeRecord): MaterialType {
  return {
    id: record.id,
    tenantId: record.tenantId,
    name: record.name,
    code: record.code,
    category: record.category,
    unit: record.unit,
    defaultRate: record.defaultRate,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
