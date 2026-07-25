import { useCallback, useEffect, useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminApiError, listPermissions, type PermissionRow } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { getPermissionCategoryLabel, getPermissionDisplayName, groupPermissionsByCategory } from "@/config/rbac-permissions";

const AdminPermissionsContent = () => {
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPermissions();
      setPermissions(res.permissions);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Không tải được danh sách quyền");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byCategory = groupPermissionsByCategory(permissions);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2">
        <span className="text-muted-foreground">Bảo mật</span>
        <span className="text-muted-foreground">›</span>
        <span className="text-primary">Danh sách quyền</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Danh sách quyền hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chỉ xem — quyền hệ thống không thể chỉnh sửa tại đây. Gán quyền qua Quản lý Vai trò.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải...
        </div>
      ) : (
        <div className="space-y-6">
          {byCategory.map(([category, perms]) => (
            <div key={category} className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/30">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {getPermissionCategoryLabel(category)}
                </h2>
              </div>
              <ul className="divide-y">
                {perms.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Shield className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{getPermissionDisplayName(p)}</p>
                        {/* <p className="text-xs font-mono text-muted-foreground truncate">{p.slug}</p> */}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">Không chỉnh sửa</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPermissionsContent;
