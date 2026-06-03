import { useState } from "react";
import {
  LayoutGrid, Users, ClipboardList, FileText, Settings, Search, Bell, HelpCircle,
  User, Shield, LogOut, FileBarChart, Menu, Loader2, FileUser,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { logoutAndRedirectTo } from "@/lib/auth-session";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarItems = [
  { icon: LayoutGrid, label: "Overview", path: "/admin/overview" },
  { icon: FileUser, label: "Hồ sơ BN", path: "/admin/patient-records" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Shield, label: "Roles", path: "/admin/roles" },
  { icon: ClipboardList, label: "Clinical Tasks", path: "/admin/tasks" },
  { icon: FileText, label: "System Logs", path: "/admin/logs" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
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
          <p className="text-sm font-bold text-primary">Qcare Plus</p>
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
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity mb-2"
        >
          Support Ticket
        </button>
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg w-full"
        >
          <FileBarChart className="h-4 w-4" /> DOCS
        </button>
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
          {isLoggingOut ? "Đang đăng xuất…" : "LOGOUT"}
        </button>
      </div>
    </>
);

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

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
            <button type="button" className="relative p-2 rounded-lg hover:bg-muted">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button type="button" className="p-2 rounded-lg hover:bg-muted">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">Security Lead</p>
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
