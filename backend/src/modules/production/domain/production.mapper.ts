import type { ProductionBatchRecord } from '../../../shared/database/schema/production-batches';

export function calcNetQty(producedQty: string, damagedQty: string): string {
  return Math.max(0, Number(producedQty) - Number(damagedQty)).toFixed(0);
}

export function toProductionListItem(
  batch: ProductionBatchRecord,
  materialName: string,
  materialCode: string,
) {
  return {
    id: batch.id,
    batchNumber: batch.batchNumber,
    materialTypeId: batch.materialTypeId,
    materialName,
    materialCode,
    producedQty: batch.producedQty,
    damagedQty: batch.damagedQty,
    netQty: calcNetQty(batch.producedQty, batch.damagedQty),
    productionDate: batch.productionDate,
    notes: batch.notes,
    createdAt: batch.createdAt.toISOString(),
  };
}
