import type { MaterialCategory } from '../../modules/catalog/domain/material-category.constants';

/** Brick kiln ERP — yard inventory is tracked in pieces (eent) for brick category only. */
export const BRICK_INVENTORY_UNIT = 'piece' as const;

export type BrickMaterialRow = {
  id: string;
  name: string;
  code: string;
  category: MaterialCategory;
  unit: string;
  isActive: boolean;
};

export function isBrickInventoryMaterial(
  material: Pick<BrickMaterialRow, 'category' | 'unit' | 'isActive'>,
): boolean {
  return (
    material.isActive &&
    material.category === 'brick' &&
    material.unit === BRICK_INVENTORY_UNIT
  );
}

export const BRICK_ONLY_MESSAGE =
  'Only active brick grades (category: brick, unit: piece) can be used for inventory, production, and orders';
