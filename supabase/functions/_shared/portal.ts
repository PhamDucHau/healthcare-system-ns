export type PortalType = "patient" | "doctor" | "admin";

export const PORTALS: PortalType[] = ["patient", "doctor", "admin"];

export function isPortalType(value: string): value is PortalType {
  return PORTALS.includes(value as PortalType);
}

/** AC2: access token TTL (seconds) per role */
export const ACCESS_TTL_BY_ROLE: Record<PortalType, number> = {
  patient: 3600,
  doctor: 1800,
  admin: 900,
};

export const REFRESH_TTL_SECONDS = 604800; // 7 days

export const PORTAL_LABELS: Record<PortalType, string> = {
  patient: "Bệnh nhân",
  doctor: "Bác sĩ",
  admin: "Quản trị",
};

export function portalLoginMessage(portal: PortalType): string {
  return `Tài khoản không có quyền truy cập Portal ${PORTAL_LABELS[portal]}. Vui lòng đăng nhập đúng cổng.`;
}
