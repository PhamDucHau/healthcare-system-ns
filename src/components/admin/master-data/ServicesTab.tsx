import { useEffect, useState } from 'react';
import { Pencil, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchServices, upsertService, deactivateService, fetchSpecialtiesAdmin } from '@/lib/master-data-api';
import type { Service, Specialty } from '@/types/master-data';
import { formatVND } from '@/types/master-data';
import { EntityTable, ActiveBadge, ActionBtn, Field, FormActions, inputCls, useEntityDialog } from './shared';

export default function ServicesTab() {
  const [rows, setRows] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const { open, editing, openAdd, openEdit, close } = useEntityDialog<Service>();

  const reload = () => {
    setLoading(true);
    Promise.all([fetchServices(), fetchSpecialtiesAdmin()])
      .then(([s, sp]) => { setRows(s); setSpecialties(sp); })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  async function handleDeactivate(id: string) {
    try {
      await deactivateService(id);
      toast.success('Đã vô hiệu hóa dịch vụ.');
      reload();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <>
      <EntityTable
        loading={loading}
        title="Dịch vụ"
        onAdd={openAdd}
        headers={['Tên dịch vụ', 'Chuyên khoa', 'Giá (VND)', 'Thời gian', 'Trạng thái', '']}
        rows={rows}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3">
              <p className="font-semibold text-sm">{r.name}</p>
              {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
            </td>
            <td className="px-4 py-3 text-sm text-muted-foreground">{r.specialty_name}</td>
            <td className="px-4 py-3 text-sm">{formatVND(r.price_vnd)}</td>
            <td className="px-4 py-3 text-sm text-muted-foreground">{r.duration_minutes} phút</td>
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

      <ServiceDialog open={open} initial={editing} specialties={specialties} onClose={close} onSaved={reload} />
    </>
  );
}

function ServiceDialog({ open, initial, specialties, onClose, onSaved }: {
  open: boolean;
  initial: Service | null;
  specialties: Specialty[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const blank: Partial<Service> = { name: '', description: '', specialty_id: '', price_vnd: null, duration_minutes: 30 };
  const [form, setForm] = useState<Partial<Service>>(initial ?? blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial ?? blank); }, [initial]);

  const setText  = (k: keyof Service) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNum   = (k: keyof Service) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value === '' ? null : Number(e.target.value) }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error('Tên không được để trống.'); return; }
    setSaving(true);
    try {
      await upsertService({ ...form, specialty_id: form.specialty_id || null } as Service & { name: string });
      toast.success(form.id ? 'Đã cập nhật.' : 'Đã thêm dịch vụ.');
      onSaved(); onClose();
    } catch (err) { toast.error((err as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{form.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Tên *">
            <input value={form.name ?? ''} onChange={setText('name')} className={inputCls} placeholder="Khám tổng quát" />
          </Field>
          <Field label="Mô tả">
            <textarea value={form.description ?? ''} onChange={setText('description')} className={`${inputCls} resize-none`} rows={2} />
          </Field>
          <Field label="Chuyên khoa">
            <select value={form.specialty_id ?? ''} onChange={setText('specialty_id')} className={inputCls}>
              <option value="">-- Không thuộc chuyên khoa --</option>
              {specialties.filter((s) => s.is_active).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá (VND)">
              <input type="number" min={0} value={form.price_vnd ?? ''} onChange={setNum('price_vnd')} className={inputCls} placeholder="150000" />
            </Field>
            <Field label="Thời gian (phút)">
              <input type="number" min={5} max={480} value={form.duration_minutes ?? 30} onChange={setNum('duration_minutes')} className={inputCls} />
            </Field>
          </div>
          <FormActions saving={saving} onCancel={onClose} editMode={!!form.id} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
