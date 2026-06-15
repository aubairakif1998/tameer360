export type MaterialCategory =
  | "brick"
  | "sand"
  | "crush"
  | "cement"
  | "steel"
  | "other";

export type MaterialUnit = "piece" | "ton" | "cft" | "bag";

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  "brick",
  "sand",
  "crush",
  "cement",
  "steel",
  "other",
];

export const MATERIAL_CATEGORY_UNITS: Record<
  MaterialCategory,
  readonly MaterialUnit[]
> = {
  brick: ["piece"],
  sand: ["ton", "cft"],
  crush: ["ton", "cft"],
  cement: ["bag", "ton"],
  steel: ["ton"],
  other: ["piece", "ton", "cft", "bag"],
};

export const MATERIAL_CATEGORY_DEFAULT_UNIT: Record<
  MaterialCategory,
  MaterialUnit
> = {
  brick: "piece",
  sand: "ton",
  crush: "ton",
  cement: "bag",
  steel: "ton",
  other: "piece",
};

export function isInventoryTrackedCategory(
  category: MaterialCategory,
): boolean {
  return category === "brick";
}

export function getUnitsForCategory(
  category: MaterialCategory,
): readonly MaterialUnit[] {
  return MATERIAL_CATEGORY_UNITS[category];
}

export function getDefaultUnitForCategory(
  category: MaterialCategory,
): MaterialUnit {
  return MATERIAL_CATEGORY_DEFAULT_UNIT[category];
}

export function slugifyMaterialCode(name: string): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (slug || "MATERIAL").slice(0, 45);
}
