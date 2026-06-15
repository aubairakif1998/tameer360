export function slugifyMaterialCode(name: string): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return (slug || 'MATERIAL').slice(0, 45);
}
