import { useCallback, useEffect, useMemo, useState } from "react";
import { Shield, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdminApiError,
  type AdminRoleRow,
  type PermissionRow,
  createAdminRole,
  deleteAdminRole,
  listAdminRoles,
  listPermissions,
  updateAdminRole,
} from "@/lib/admin-api";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import RolePermissionsSummary from "@/components/admin/RolePermissionsSummary";
import { getPermissionCategoryLabel, getPermissionDisplayName, groupPermissionsByCategory } from "@/config/rbac-permissions";

type RoleForm = {
  name: string;
  slug: string;
  description: string;
  permissionIds: Set<string>;
};

const emptyRoleForm = (): RoleForm => ({
  name: "",
  slug: "",
  description: "",
  permissionIds: new Set(),
});

const AdminRolesContent = () => {
  const [roles, setRoles] = useState<AdminRoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRoleRow | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyRoleForm());
  const [deleteTarget, setDeleteTarget] = useState<AdminRoleRow | null>(null);

  const permissionsByCategory = useMemo(
    () => groupPermissionsByCategory(permissions),
    [permissions],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([listAdminRoles(), listPermissions()]);
      setRoles(rolesRes.roles);
      setPermissions(permsRes.permissions);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Không tải được vai trò");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyRoleForm());
    setFormOpen(true);
  };

  const openEdit = (role: AdminRoleRow) => {
    if (role.is_system) {
      toast.info("Vai trò hệ thống không thể sửa quyền hạn");
      return;
    }
    setEditing(role);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description ?? "",
      permissionIds: new Set(role.permissions.map((p) => p.id)),
    });
    setFormOpen(true);
  };

  const togglePermission = (id: string) => {
    setForm((prev) => {
      const next = new Set(prev.permissionIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, permissionIds: next };
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên role");
      return;
    }
    setSaving(true);
    try {
      const permissionIds = [...form.permissionIds];
      if (editing) {
        await updateAdminRole({
          roleId: editing.id,
          name: form.name,
          description: form.description,
          permissionIds,
        });
        toast.success("Đã cập nhật vai trò");
      } else {
        if (!form.slug.trim()) {
          toast.error("Vui lòng nhập slug");
          return;
        }
        await createAdminRole({
          name: form.name,
          slug: form.slug,
          description: form.description,
          permissionIds,
        });
        toast.success("Tạo Role thành công");
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminRole(deleteTarget.id);
      toast.success("Đã xóa vai trò");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      if (err instanceof AdminApiError && err.code === "ROLE_IN_USE") {
        toast.error(err.message);
      } else {
        toast.error(err instanceof AdminApiError ? err.message : "Xóa thất bại");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2">
        <span className="text-muted-foreground">Bảo mật</span>
        <span className="text-muted-foreground">›</span>
        <span className="text-primary">Phân quyền động</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý Vai trò</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo vai trò tùy chỉnh với quyền hạn tự chọn. Vai trò hệ thống (Bệnh nhân, Bác sĩ, Admin) không thể xóa.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Vai trò mới
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải...
        </div>
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      {role.is_system ? (
                        <Badge variant="secondary">Hệ thống</Badge>
                      ) : (
                        <Badge variant="outline">Vai trò tùy chỉnh</Badge>
                      )}
                      <Badge variant="outline">{role.userCount} người dùng</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{role.slug}</p>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    )}
                    <div className="mt-3">
                      <RolePermissionsSummary permissions={role.permissions} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!role.is_system && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(role)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa vai trò" : "Vai trò tùy chỉnh mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="roleName">Tên role</Label>
              <Input id="roleName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            {!editing && (
              <div>
                <Label htmlFor="roleSlug">Mã định danh</Label>
                <Input id="roleSlug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="le-tan" />
              </div>
            )}
            <div>
              <Label htmlFor="roleDesc">Mô tả</Label>
              <Input id="roleDesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label className="mb-2 block">Quyền hạn</Label>
              {[...permissionsByCategory].map(([category, perms]) => (
                <div key={category} className="mb-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                    {getPermissionCategoryLabel(category)}
                  </p>
                  <div className="space-y-2">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={form.permissionIds.has(p.id)}
                          onCheckedChange={() => togglePermission(p.id)}
                        />
                        <span>{getPermissionDisplayName(p)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa vai trò &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.userCount > 0
                ? `Vai trò đang có ${deleteTarget.userCount} người dùng. Chuyển vai trò trước khi xóa.`
                : "Hành động không thể hoàn tác."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={(deleteTarget?.userCount ?? 0) > 0}
              className="bg-destructive text-destructive-foreground"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRolesContent;
