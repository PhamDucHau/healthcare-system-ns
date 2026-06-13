import { Home, User, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Trang chủ", path: "/home" },
  { icon: User, label: "Tài khoản", path: "/account" },
  { icon: Calendar, label: "Lịch hẹn", path: "/appointments" },
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
          <p className="text-sm font-semibold text-foreground">Chào mừng trở lại</p>
          <p className="text-xs text-muted-foreground">Cổng thông tin sức khỏe</p>
        </div>
      </div>

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
