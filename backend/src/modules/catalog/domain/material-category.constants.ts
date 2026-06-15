import type { MaterialTypeRecord } from '../../../shared/database/schema/material-types';
import type { MaterialUnit } from './material-unit';

export type MaterialCategory = MaterialTypeRecord['category'];

export const MATERIAL_CATEGORIES = [
  'brick',
  'sand',
  'crush',
  'cement',
  'steel',
  'other',
] as const satisfies readonly MaterialCategory[];

export const MATERIAL_CATEGORY_UNITS: Record<
  MaterialCategory,
  readonly MaterialUnit[]
> = {
  brick: ['piece'],
  sand: ['ton', 'cft'],
  crush: ['ton', 'cft'],
  cement: ['bag', 'ton'],
  steel: ['ton'],
  other: ['piece', 'ton', 'cft', 'bag'],
};

export const MATERIAL_CATEGORY_DEFAULT_UNIT: Record<
  MaterialCategory,
  MaterialUnit
> = {
  brick: 'piece',
  sand: 'ton',
  crush: 'ton',
  cement: 'bag',
  steel: 'ton',
  other: 'piece',
};

export function isInventoryTrackedCategory(
  category: MaterialCategory,
): boolean {
  return category === 'brick';
}

export function resolveMaterialUnit(
  category: MaterialCategory,
  unit?: MaterialUnit,
): MaterialUnit {
  const allowed = MATERIAL_CATEGORY_UNITS[category];
  if (unit && allowed.includes(unit)) {
    return unit;
  }
  return MATERIAL_CATEGORY_DEFAULT_UNIT[category];
}

export function isUnitAllowedForCategory(
  category: MaterialCategory,
  unit: MaterialUnit,
): boolean {
  return MATERIAL_CATEGORY_UNITS[category].includes(unit);
}
