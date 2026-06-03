import { Home, User, MessageSquare, FlaskConical, Calendar, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: User, label: "Account", path: "/account" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: FlaskConical, label: "Labs", path: "/labs" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: HelpCircle, label: "Support", path: "/support" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r bg-card p-4 gap-2">
      <div className="flex items-center gap-3 p-3 mb-2">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Welcome back</p>
          <p className="text-xs text-muted-foreground">Secure Health Portal</p>
        </div>
      </div>

      <Link
        to="/onboarding/personal"
        className="mb-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Complete Onboarding
      </Link>

      <nav className="flex flex-col gap-1">
        {menuItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={label}
              to={path}
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
    </aside>
  );
};

export default Sidebar;
