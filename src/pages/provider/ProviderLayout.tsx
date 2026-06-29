import { useMemo, useState } from "react";
import {
  Calendar,
  FileUser,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useMatch, Link } from "react-router-dom";
import { toast } from "sonner";
import { logoutAndRedirectTo } from "@/lib/auth-session";
import { useDoctorNotifications } from "@/hooks/DoctorNotificationsContext";
import NotificationPanel from "@/components/admin/NotificationPanel";
import type { AppointmentNotification } from "@/hooks/useAdminNotifications";

const NAV_ITEMS = [
  { path: "/provider-portal/dashboard", icon: LayoutDashboard, label: "Bảng tổng quan" },
  { path: "/provider-portal/patient-records", icon: FileUser, label: "Hồ sơ bệnh nhân" },
  { path: "/provider-portal/patients", icon: Users, label: "Bệnh nhân" },
  { path: "/provider-portal/appointments", icon: Calendar, label: "Lịch hẹn" },
  { path: "/provider-portal/profile", icon: UserCircle, label: "Hồ sơ bác sĩ" },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;

const ProviderLayout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isExamination = Boolean(useMatch("/provider-portal/examination/:appointmentId"));
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useDoctorNotifications();

  const mappedNotifications = useMemo<AppointmentNotification[]>(
    () =>
      notifications.map((n) => ({
        id: n.id,
        appointmentId: n.appointmentId ?? "",
        patientName: n.patientName,
        specialtyName: n.specialtyName,
        slotDate: n.slotDate,
        startTime: n.slotTime,
        walkIn: n.walkIn,
        createdAt: n.createdAt,
        read: n.read,
      })),
    [notifications],
  );

  const handleLogout = () => {
    setIsLoggingOut(true);
    void logoutAndRedirectTo("/").catch(() => {
      setIsLoggingOut(false);
      toast.error("Không đăng xuất được");
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#provider-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[250px_1fr]">
        <aside className="border-r bg-card p-4">
          <div className="mb-4 flex flex-col items-center">
            <img
              src="/bac-si-nam-chibi.png"
              alt="Bác sĩ"
              className="h-40 w-auto object-contain"
            />
            {/* <h1 className="text-base font-semibold text-foreground mt-1">Bác sĩ</h1> */}
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={navLinkClass}
                end={path === "/provider-portal/dashboard"}
                isActive={(_, { pathname }) =>
                  path === "/provider-portal/appointments"
                    ? pathname.startsWith("/provider-portal/appointments") ||
                      pathname.startsWith("/provider-portal/examination")
                    : pathname === path || pathname.startsWith(`${path}/`)
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 space-y-2 border-t pt-4">
            <button
              type="button"
              disabled={isLoggingOut}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </button>
          </div>
        </aside>

        <main
          id="provider-main-content"
          className={
            isExamination
              ? "flex h-screen flex-col overflow-hidden"
              : "p-4 md:p-6"
          }
        >
          {!isExamination && (
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
              <input
                type="search"
                aria-label="Tìm kiếm bệnh nhân, hồ sơ hoặc xét nghiệm"
                placeholder="Tìm kiếm bệnh nhân, hồ sơ hoặc xét nghiệm..."
                className="h-11 min-w-[250px] flex-1 rounded-lg border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <div className="flex items-center gap-2">
                <NotificationPanel
                  notifications={mappedNotifications}
                  unreadCount={unreadCount}
                  onMarkAllAsRead={() => { void markAllAsRead(); }}
                  onMarkAsRead={(id) => { void markAsRead(id); }}
                  onClearAll={clearAll}
                  appointmentsPath="/provider-portal/appointments"
                />
                <Link
                  to="/provider-portal/profile"
                  className="rounded-lg border px-3 py-2 hover:bg-muted transition-colors"
                >
                  <p className="text-sm font-semibold">Hồ sơ bác sĩ</p>
                  <p className="text-xs text-muted-foreground">PIN ký duyệt</p>
                </Link>
              </div>
            </header>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;
