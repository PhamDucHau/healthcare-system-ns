import { Link, useLocation } from "react-router-dom";
import { isPatientMenuActive, PATIENT_MENU_ITEMS } from "@/config/patient-menu";

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r bg-card p-4 gap-2">
      <nav className="flex flex-col gap-1">
        {PATIENT_MENU_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = isPatientMenuActive(location.pathname, path);
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
