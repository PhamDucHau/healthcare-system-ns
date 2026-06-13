import { useState } from "react";
import {
  Bell,
  Calendar,
  ClipboardList,
  FileUser,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  SquareChartGantt,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logoutAndRedirectTo } from "@/lib/auth-session";
import { useDoctorNotifications } from "@/hooks/DoctorNotificationsContext";

const NAV_ITEMS = [
  { path: "/provider-portal/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/provider-portal/patient-records", icon: FileUser, label: "Hồ sơ BN" },
  { path: "/provider-portal/patients", icon: Users, label: "Patients" },
  { path: "/provider-portal/appointments", icon: Calendar, label: "Appointments" },
  { path: "/provider-portal/tasks", icon: ClipboardList, label: "Clinical Tasks" },
  { path: "/provider-portal/analytics", icon: SquareChartGantt, label: "Analytics" },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;

const ProviderLayout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { unreadCount, markAllAsRead } = useDoctorNotifications();

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
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Provider Portal</h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Clinical Excellence</p>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={navLinkClass}
                end={path === "/provider-portal/dashboard"}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="mt-8 min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            onClick={() => toast.warning("Emergency alert — tích hợp sau")}
          >
            Emergency Alert
          </button>

          <div className="mt-10 space-y-2 border-t pt-4">
            <button
              type="button"
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => toast.info("Support — liên hệ IT")}
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Support
            </button>
            <button
              type="button"
              disabled={isLoggingOut}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </aside>

        <main id="provider-main-content" className="p-4 md:p-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
            <input
              type="search"
              aria-label="Search patients, records, or labs"
              placeholder="Search patients, records, or labs..."
              className="h-11 min-w-[250px] flex-1 rounded-lg border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
                className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border hover:bg-muted"
                onClick={() => { void markAllAsRead(); void navigate("/provider-portal/appointments"); }}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label="Settings"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border hover:bg-muted"
                onClick={() => toast.info("Settings — đang phát triển")}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                onClick={() => toast.info("New Consultation — đang phát triển")}
              >
                New Consultation
              </button>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-sm font-semibold">Dr. Sarah Chen</p>
                <p className="text-xs text-muted-foreground">Internal Medicine</p>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;
