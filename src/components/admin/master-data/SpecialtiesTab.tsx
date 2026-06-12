import { useEffect, useState } from 'react';
import { Plus, Pencil, PowerOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchSpecialtiesAdmin, upsertSpecialty, deactivateSpecialty } from '@/lib/master-data-api';
import type { Specialty } from '@/types/master-data';
import { EntityTable, ActiveBadge, ActionBtn, useEntityDialog } from './shared';

const EMPTY: Omit<Specialty, 'id' | 'created_at'> = {
  name: '', description: '', icon: '', is_active: true,
};

export default function SpecialtiesTab() {
  const [rows, setRows] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const { open, editing, openAdd, openEdit, close } = useEntityDialog<Specialty>();

  const reload = () => {
    setLoading(true);
    fetchSpecialtiesAdmin()
      .then(setRows)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  async function handleDeactivate(id: string) {
    try {
      await deactivateSpecialty(id);
      toast.success('Đã vô hiệu hóa chuyên khoa.');
      reload();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <>
      <EntityTable
        loading={loading}
        title="Chuyên khoa"
        onAdd={openAdd}
        headers={['Tên', 'Mô tả', 'Icon', 'Trạng thái', '']}
        rows={rows}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3 font-semibold text-sm">{r.name}</td>
            <td className="px-4 py-3 text-sm text-muted-foreground">{r.description ?? '—'}</td>
            <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.icon ?? '—'}</td>
            <td className="px-4 py-3"><ActiveBadge active={r.is_active} /></td>
            <td className="px-4 py-3 text-right">
              <div className="flex justify-end gap-2">
                <ActionBtn icon={Pencil} label="Sửa" onClick={() => openEdit(r)} />
                {r.is_active && (
                  <ActionBtn icon={PowerOff} label="Vô hiệu" variant="destructive" onClick={() => handleDeactivate(r.id)} />
                )}
              </div>
            </td>
          </>
        )}
      />

      <SpecialtyDialog
        open={open}
        initial={editing ?? EMPTY}
        onClose={close}
        onSaved={reload}
      />
    </>
  );
}

function SpecialtyDialog({
  open, initial, onClose, onSaved,
}: {
  open: boolean;
  initial: Partial<Specialty>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Specialty>>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial); }, [initial]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error('Tên không được để trống.'); return; }
    setSaving(true);
    try {
      await upsertSpecialty(form as Specialty & { name: string });
      toast.success(form.id ? 'Đã cập nhật chuyên khoa.' : 'Đã thêm chuyên khoa.');
      onSaved();
      onClose();
    } catch (err) { toast.error((err as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Sửa chuyên khoa' : 'Thêm chuyên khoa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Tên *">
            <input value={form.name ?? ''} onChange={set('name')} className={inputCls} placeholder="Tim mạch" />
          </Field>
          <Field label="Mô tả">
            <textarea value={form.description ?? ''} onChange={set('description')} className={`${inputCls} resize-none`} rows={2} />
          </Field>
          <Field label="Icon slug">
            <input value={form.icon ?? ''} onChange={set('icon')} className={inputCls} placeholder="heart-pulse" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">Hủy</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {form.id ? 'Lưu' : 'Thêm'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputCls = 'w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
