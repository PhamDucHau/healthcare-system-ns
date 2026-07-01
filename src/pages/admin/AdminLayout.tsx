import { useState } from "react";
import {
  LayoutGrid, Users, Search,
  User, Shield, LogOut, Menu, Loader2, FileUser, Database, CalendarDays, ClipboardList, Brain, KeyRound, UserRound,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { logoutAndRedirectTo } from "@/lib/auth-session";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationPanel from "@/components/admin/NotificationPanel";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const sidebarItems = [
  { icon: LayoutGrid,    label: "Bảng tổng quan",      path: "/admin/overview" },
  { icon: FileUser,      label: "Hồ sơ bệnh nhân",     path: "/admin/patient-records" },
  { icon: UserRound,     label: "Bệnh nhân",           path: "/admin/patients" },
  { icon: CalendarDays,  label: "Lịch hẹn",            path: "/admin/appointments" },
  { icon: Database,      label: "Danh mục",            path: "/admin/master-data" },
  { icon: ClipboardList, label: "Bộ câu hỏi lâm sàng", path: "/admin/question-library" },
  { icon: Users,         label: "Người dùng",          path: "/admin/users" },
  { icon: KeyRound,      label: "Danh sách quyền",     path: "/admin/permissions" },
  { icon: Shield,        label: "Quản lý vai trò",     path: "/admin/roles" },
  { icon: Brain,         label: "Độ chính xác AI",     path: "/admin/ai-accuracy" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "text-primary bg-accent" : "text-muted-foreground hover:bg-muted"
  }`;

const AdminSidebarContent = ({
  onNavigate,
  onLogout,
  isLoggingOut,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) => (
    <>
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-primary">Rcare Plus</p>
          <p className="text-xs text-muted-foreground">IT Operations</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {sidebarItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={navLinkClass}
            onClick={onNavigate}
            end={path === "/admin/overview"}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 mt-auto border-t space-y-1">
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg w-full disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="h-4 w-4" aria-hidden="true" />
          )}
          {isLoggingOut ? "Đang đăng xuất…" : "Đăng Xuất"}
        </button>
      </div>
    </>
);

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearAll } = useAdminNotifications();

  const handleLogout = () => {
    setIsLoggingOut(true);
    void logoutAndRedirectTo("/").catch(() => {
      setIsLoggingOut(false);
      toast.error("Không đăng xuất được");
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:flex w-60 flex-col border-r bg-card h-screen sticky top-0">
        <AdminSidebarContent onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button type="button" className="lg:hidden p-2 rounded-lg hover:bg-muted">
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <AdminSidebarContent
                  onNavigate={() => setMobileOpen(false)}
                  onLogout={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  isLoggingOut={isLoggingOut}
                />
              </SheetContent>
            </Sheet>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search operational metrics..."
                className="h-10 w-64 md:w-80 rounded-lg border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllAsRead={markAllAsRead}
              onMarkAsRead={markAsRead}
              onClearAll={clearAll}
            />
            {/* <button type="button" className="p-2 rounded-lg hover:bg-muted">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </button> */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">Quản trị viên</p>
                {/* <p className="text-xs text-muted-foreground">Security Lead</p> */}
              </div>
              <div className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center">
                <User className="h-4 w-4 text-background" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
