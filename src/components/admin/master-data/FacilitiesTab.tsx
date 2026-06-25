import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchFacilities, upsertFacility, deleteFacility } from '@/lib/master-data-api';
import type { Facility } from '@/types/master-data';
import {
  EntityTable, ActiveBadge, ActionBtn, ActiveStatusField, DeleteConfirmDialog,
  Field, FormActions, inputCls, useEntityDialog,
} from './shared';

export default function FacilitiesTab() {
  const [rows, setRows] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { open, editing, openAdd, openEdit, close } = useEntityDialog<Facility>();

  const reload = () => {
    setLoading(true);
    fetchFacilities()
      .then(setRows)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFacility(deleteTarget.id);
      toast.success('Đã xóa cơ sở.');
      setDeleteTarget(null);
      reload();
    } catch (e) { toast.error((e as Error).message); }
    finally { setDeleting(false); }
  }

  return (
    <>
      <EntityTable
        loading={loading}
        title="Cơ sở"
        onAdd={openAdd}
        headers={['Tên cơ sở', 'Mã', 'Địa chỉ', 'SĐT', 'Trạng thái', '']}
        rows={rows}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3 font-semibold text-sm">{r.name}</td>
            <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.code ?? '—'}</td>
            <td className="px-4 py-3 text-sm text-muted-foreground">{r.address ?? '—'}</td>
            <td className="px-4 py-3 text-sm text-muted-foreground">{r.phone ?? '—'}</td>
            <td className="px-4 py-3"><ActiveBadge active={r.is_active} /></td>
            <td className="px-4 py-3 text-right">
              <div className="flex justify-end gap-2">
                <ActionBtn icon={Pencil} label="Sửa" onClick={() => openEdit(r)} />
                <ActionBtn icon={Trash2} label="Xoá" variant="destructive" onClick={() => setDeleteTarget(r)} />
              </div>
            </td>
          </>
        )}
      />

      <FacilityDialog open={open} initial={editing} onClose={close} onSaved={reload} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        name={deleteTarget?.name}
        entityLabel="cơ sở"
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

function FacilityDialog({ open, initial, onClose, onSaved }: {
  open: boolean; initial: Facility | null; onClose: () => void; onSaved: () => void;
}) {
  const blank: Partial<Facility> = { name: '', code: '', address: '', phone: '', is_active: true };
  const [form, setForm] = useState<Partial<Facility>>(initial ?? blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial ?? blank); }, [initial]);

  const set = (k: keyof Facility) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error('Tên không được để trống.'); return; }
    setSaving(true);
    try {
      await upsertFacility(form as Facility & { name: string });
      toast.success(form.id ? 'Đã cập nhật.' : 'Đã thêm cơ sở.');
      onSaved(); onClose();
    } catch (err) { toast.error((err as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{form.id ? 'Sửa cơ sở' : 'Thêm cơ sở'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Tên cơ sở *">
            <input value={form.name ?? ''} onChange={set('name')} className={inputCls} placeholder="Phòng khám Đa khoa ABC" />
          </Field>
          <Field label="Mã cơ sở">
            <input value={form.code ?? ''} onChange={set('code')} className={inputCls} placeholder="QC-MAIN" />
          </Field>
          <Field label="Địa chỉ">
            <input value={form.address ?? ''} onChange={set('address')} className={inputCls} placeholder="123 Nguyễn Huệ, Q.1, TP.HCM" />
          </Field>
          <Field label="Số điện thoại">
            <input value={form.phone ?? ''} onChange={set('phone')} className={inputCls} placeholder="028 1234 5678" />
          </Field>
          <ActiveStatusField
            value={form.is_active ?? true}
            onChange={(is_active) => setForm((f) => ({ ...f, is_active }))}
          />
          <FormActions saving={saving} onCancel={onClose} editMode={!!form.id} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
