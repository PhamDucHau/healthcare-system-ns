/** Display labels and sort order for permission categories in admin RBAC UI */

export const PERMISSION_CATEGORY_LABELS: Record<string, string> = {
  admin: "Admin portal",
  clinical: "Lâm sàng / Hồ sơ (Admin)",
  provider: "Bệnh nhân (module BS)",
  appointments: "Lịch hẹn",
  master_data: "Danh mục",
  users: "Người dùng",
  roles: "Vai trò",
  facilities: "Cơ sở",
  audit: "Audit",
};

/** Categories shown first in role editor (unknown categories sort alphabetically after). */
export const PERMISSION_CATEGORY_ORDER = [
  "admin",
  "clinical",
  "provider",
  "appointments",
  "master_data",
  "users",
  "roles",
  "facilities",
  "audit",
] as const;

export function getPermissionCategoryLabel(category: string): string {
  return PERMISSION_CATEGORY_LABELS[category] ?? category;
}

export function getPermissionDisplayName(p: { name: string; slug: string }): string {
  return p.name?.trim() || p.slug;
}

export function comparePermissionCategories(a: string, b: string): number {
  const ia = PERMISSION_CATEGORY_ORDER.indexOf(a as (typeof PERMISSION_CATEGORY_ORDER)[number]);
  const ib = PERMISSION_CATEGORY_ORDER.indexOf(b as (typeof PERMISSION_CATEGORY_ORDER)[number]);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

export function groupPermissionsByCategory<T extends { category: string }>(
  permissions: T[],
): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const p of permissions) {
    const list = map.get(p.category) ?? [];
    list.push(p);
    map.set(p.category, list);
  }
  return [...map.entries()].sort(([a], [b]) => comparePermissionCategories(a, b));
}
