import { Calendar, Home, ScrollText, User, type LucideIcon } from "lucide-react";

export type PatientMenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

export const PATIENT_MENU_ITEMS: PatientMenuItem[] = [
  { icon: Home, label: "Trang chủ", path: "/home" },
  { icon: User, label: "Tài khoản", path: "/account" },
  { icon: Calendar, label: "Lịch hẹn", path: "/appointments" },
  { icon: ScrollText, label: "Lịch sử khám bệnh", path: "/exam-history" },
];

export function isPatientMenuActive(pathname: string, path: string): boolean {
  if (path === "/account") {
    return pathname === path || pathname.startsWith("/account/");
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
