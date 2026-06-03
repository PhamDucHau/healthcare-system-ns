import { Globe, User, Menu, Home, MessageSquare, FlaskConical, Calendar, HelpCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { portalLogout } from "@/lib/portal-auth-api";
import { loginPathForRole } from "@/lib/portal-auth";

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Labs", path: "/labs" },
  { label: "Appointments", path: "/appointments" },
];

const menuItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: User, label: "Account", path: "/account" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: FlaskConical, label: "Labs", path: "/labs" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: HelpCircle, label: "Support", path: "/support" },
];

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { session, role } = useAuth();

  const handleSignOut = async () => {
    try {
      await portalLogout();
      toast.success("Signed out");
      navigate(loginPathForRole(role), { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign out";
      toast.error("Unable to sign out", { description: message });
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="p-4 border-b">
              <span className="text-lg font-bold text-primary">Qcare Plus</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 p-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Welcome back</p>
                  <p className="text-xs text-muted-foreground truncate max-w-44">
                    {session?.user.email ?? "Secure Health Portal"}
                  </p>
                </div>
              </div>

              <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity mb-4">
                Get Care Now
              </button>

              <nav className="flex flex-col gap-1">
                {menuItems.map(({ icon: Icon, label, path }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={label}
                      to={path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "text-accent-foreground bg-accent"
                          : "text-sidebar-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-4 w-full rounded-lg border px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Sign out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="text-lg font-bold text-primary">Qcare Plus</Link>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-xs text-muted-foreground max-w-40 truncate">
          {session?.user.email}
        </span>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Globe className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="hidden md:inline-flex rounded-lg border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Sign out
        </button>
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
