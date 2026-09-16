import { User, Menu } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useMyPatientProfile } from "@/hooks/useMyPatientProfile";
import { createAvatarSignedUrl } from "@/lib/patient-avatar-api";
import { portalLogout } from "@/lib/portal-auth-api";
import { loginPathForRole } from "@/lib/portal-auth";
import { isPatientMenuActive, PATIENT_MENU_ITEMS } from "@/config/patient-menu";

function UserAvatarBubble({
  avatarUrl,
  className,
  iconClassName,
}: {
  avatarUrl: string | null | undefined;
  className: string;
  iconClassName: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <User className={iconClassName} />
      )}
    </div>
  );
}

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { session, role } = useAuth();
  const userId = session?.user?.id;
  const { data: profile } = useMyPatientProfile();
  const avatarPath = profile?.avatar_storage_path ?? null;

  const { data: avatarUrl } = useQuery({
    queryKey: ["patient", "my-avatar-url", userId, avatarPath],
    queryFn: () => createAvatarSignedUrl(avatarPath),
    enabled: Boolean(userId && avatarPath),
    staleTime: 30 * 60 * 1000,
  });

  const handleSignOut = async () => {
    try {
      await portalLogout();
      toast.success("Đã đăng xuất");
      navigate(loginPathForRole(role), { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể đăng xuất";
      toast.error("Không thể đăng xuất", { description: message });
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
              <span className="text-lg font-bold text-primary">Rcare Plus</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 p-3 mb-2">
                <UserAvatarBubble
                  avatarUrl={avatarUrl}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted"
                  iconClassName="h-5 w-5 text-muted-foreground"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Chào mừng trở lại</p>
                  <p className="text-xs text-muted-foreground truncate max-w-44">
                    {session?.user.email ?? "Secure Health Portal"}
                  </p>
                </div>
              </div>

              <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity mb-4">
                Đặt lịch ngay
              </button>

              <nav className="flex flex-col gap-1">
                {PATIENT_MENU_ITEMS.map(({ icon: Icon, label, path }) => {
                  const active = isPatientMenuActive(location.pathname, path);
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
                Đăng xuất
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="text-lg font-bold text-primary">Rcare Plus</Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-xs text-muted-foreground max-w-40 truncate">
          {session?.user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="hidden md:inline-flex rounded-lg border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Đăng xuất
        </button>
        <Link
          to="/account/personal"
          aria-label="Thông tin cá nhân"
          className="block"
        >
          <UserAvatarBubble
            avatarUrl={avatarUrl}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary"
            iconClassName="h-4 w-4 text-primary-foreground"
          />
        </Link>
      </div>
    </header>
  );
};

export default TopNav;
