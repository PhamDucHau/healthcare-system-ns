import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users, UserPlus, Search, Pencil, RotateCcw, Trash2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminApiError,
  type AdminRoleRow,
  type AdminUserRow,
  type AdminUserStatus,
  type FacilityRow,
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  listFacilities,
  listAdminRoles,
  resetAdminUserPassword,
  updateAdminUser,
} from "@/lib/admin-api";
import { fetchSpecialties } from "@/lib/appointment-api";
import type { Specialty } from "@/types/appointment";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const statusLabel: Record<AdminUserStatus, string> = {
  active: "Hoạt động",
  inactive: "Ngưng",
  locked: "Khóa",
};

const statusStyle: Record<AdminUserStatus, string> = {
  active: "text-success",
  inactive: "text-muted-foreground",
  locked: "text-destructive",
};

type UserForm = {
  fullName: string;
  email: string;
  phone: string;
  roleId: string;
  facilityId: string;
  specialty: string;
  status: AdminUserStatus;
};

const emptyForm = (): UserForm => ({
  fullName: "",
  email: "",
  phone: "",
  roleId: "",
  facilityId: "",
  specialty: "",
  status: "active",
});

const AdminUsersContent = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<AdminRoleRow[]>([]);
  const [facilities, setFacilities] = useState<FacilityRow[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm());

  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdSignPin, setCreatedSignPin] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === form.roleId),
    [roles, form.roleId],
  );
  const isDoctor = selectedRole?.portal_role === "doctor" || selectedRole?.slug === "doctor";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, facRes, specsRes] = await Promise.all([
        listAdminUsers({ search: search || undefined, page, limit: 20 }),
        listAdminRoles(),
        listFacilities(),
        fetchSpecialties(),
      ]);
      setUsers(usersRes.users);
      setTotal(usersRes.total);
      setRoles(rolesRes.roles);
      setFacilities(facRes.facilities);
      setSpecialties(specsRes);
    } catch (err) {
      const msg = err instanceof AdminApiError ? err.message : "Không tải được dữ liệu";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (user: AdminUserRow) => {
    setEditing(user);
    setForm({
      fullName: user.full_name ?? "",
      email: user.email,
      phone: user.phone ?? "",
      roleId: user.role_id ?? "",
      facilityId: user.facility_id ?? "",
      specialty: user.specialty ?? "",
      status: user.status,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.roleId) {
      toast.error("Vui lòng nhập tên và chọn vai trò");
      return;
    }
    if (!editing && !form.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateAdminUser({
          userId: editing.user_id,
          fullName: form.fullName,
          phone: form.phone,
          roleId: form.roleId,
          facilityId: form.facilityId || null,
          specialty: isDoctor ? form.specialty : null,
          status: form.status,
        });
        toast.success("Đã cập nhật người dùng");
      } else {
        const res = await createAdminUser({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          roleId: form.roleId,
          facilityId: form.facilityId || null,
          specialty: isDoctor ? form.specialty : null,
          status: form.status,
        });
        setTempPassword(res.tempPassword);
        if (res.signPin) setCreatedSignPin(res.signPin);
        toast.success(res.message);
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (user: AdminUserRow) => {
    try {
      const res = await resetAdminUserPassword(user.user_id);
      setTempPassword(res.tempPassword);
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Reset thất bại");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminUser(deleteTarget.user_id);
      toast.success("Đã xóa người dùng");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Xóa thất bại");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2">
        <span className="text-muted-foreground">Tổ chức</span>
        <span className="text-muted-foreground">›</span>
        <span className="text-primary">Quản lý người dùng</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý Người dùng</h1>
          {/* <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Thêm, sửa, xóa người dùng, gán vai trò &amp; cơ sở. Đặt lại mật khẩu tạm gửi qua email.
          </p> */}
        </div>
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, email, SĐT..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mb-2 opacity-40" />
            <p>Chưa có người dùng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Người dùng</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vai trò</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cơ sở</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold">{user.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                      {user.specialty && (
                        <p className="text-xs text-primary mt-0.5">Chuyên khoa: {user.specialty}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">{user.roles?.name ?? user.role}</td>
                    <td className="px-4 py-4 text-sm">{user.facilities?.name ?? "—"}</td>
                    <td className={`px-4 py-4 text-sm font-medium ${statusStyle[user.status]}`}>
                      {statusLabel[user.status]}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)} title="Sửa">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleResetPassword(user)} title="Reset mật khẩu">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(user)} title="Xóa">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Tổng <span className="font-semibold text-foreground">{total}</span> người dùng
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </Button>
            <span className="text-sm self-center">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Sau
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="fullName">Họ tên</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            {!editing && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            )}
            <div>
              <Label htmlFor="phone">SĐT</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Vai trò</Label>
              <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}{r.is_system ? " (hệ thống)" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cơ sở</Label>
              <Select value={form.facilityId || "__none__"} onValueChange={(v) => setForm({ ...form, facilityId: v === "__none__" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Không —</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isDoctor && (
              <div>
                <Label>Chuyên khoa (Doctor)</Label>
                <Select
                  value={form.specialty || "__none__"}
                  onValueChange={(v) => setForm({ ...form, specialty: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Không —</SelectItem>
                    {specialties.map((s) => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AdminUserStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngưng</SelectItem>
                  <SelectItem value="locked">Khóa</SelectItem>
                </SelectContent>
              </Select>
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

      <Dialog open={!!tempPassword} onOpenChange={() => { setTempPassword(null); setCreatedSignPin(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin tài khoản mới</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            Sao chép thông tin bên dưới — email thiết lập mật khẩu cũng đã được gửi tới user (link dẫn về trang đặt mật khẩu lần đầu).
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Mật khẩu đăng nhập (12 ký tự)</p>
              <code className="block rounded-lg bg-muted p-3 text-sm font-mono break-all">{tempPassword}</code>
            </div>
            {createdSignPin && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Mã PIN ký duyệt (6 số — bác sĩ)</p>
                <code className="block rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm font-mono tracking-widest">{createdSignPin}</code>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Bác sĩ xem lại PIN tại Provider Portal → Hồ sơ bác sĩ.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const text = createdSignPin
                ? `Mật khẩu: ${tempPassword}\nPIN ký duyệt: ${createdSignPin}`
                : (tempPassword ?? '');
              void navigator.clipboard.writeText(text);
              toast.success('Đã copy');
            }}>
              Copy tất cả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa vĩnh viễn {deleteTarget?.email}. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersContent;
