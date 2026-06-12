import { useEffect, useState } from 'react';
import { Pencil, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchRooms, upsertRoom, deactivateRoom, fetchFacilities } from '@/lib/master-data-api';
import type { Room, Facility } from '@/types/master-data';
import { EntityTable, ActiveBadge, ActionBtn, Field, FormActions, inputCls, useEntityDialog } from './shared';

export default function RoomsTab() {
  const [rows, setRows] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const { open, editing, openAdd, openEdit, close } = useEntityDialog<Room>();

  const reload = () => {
    setLoading(true);
    Promise.all([fetchRooms(), fetchFacilities()])
      .then(([r, f]) => { setRows(r); setFacilities(f); })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  async function handleDeactivate(id: string) {
    try {
      await deactivateRoom(id);
      toast.success('Đã vô hiệu hóa phòng.');
      reload();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <>
      <EntityTable
        loading={loading}
        title="Phòng khám"
        onAdd={openAdd}
        headers={['Phòng', 'Số phòng', 'Cơ sở', 'Capacity', 'Thiết bị', 'Trạng thái', '']}
        rows={rows}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3 font-semibold text-sm">{r.name}</td>
            <td className="px-4 py-3 text-sm text-muted-foreground">{r.room_number ?? '—'}</td>
            <td className="px-4 py-3 text-sm text-muted-foreground">{r.facility_name}</td>
            <td className="px-4 py-3 text-sm">{r.capacity}</td>
            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{r.equipment ?? '—'}</td>
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

      <RoomDialog open={open} initial={editing} facilities={facilities} onClose={close} onSaved={reload} />
    </>
  );
}

function RoomDialog({ open, initial, facilities, onClose, onSaved }: {
  open: boolean; initial: Room | null; facilities: Facility[]; onClose: () => void; onSaved: () => void;
}) {
  const blank: Partial<Room> = { name: '', room_number: '', facility_id: '', capacity: 1, equipment: '' };
  const [form, setForm] = useState<Partial<Room>>(initial ?? blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial ?? blank); }, [initial]);

  const setStr = (k: keyof Room) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNum = (k: keyof Room) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: Number(e.target.value) }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error('Tên phòng không được để trống.'); return; }
    if (!form.facility_id) { toast.error('Vui lòng chọn cơ sở.'); return; }
    setSaving(true);
    try {
      await upsertRoom(form as Room & { name: string; facility_id: string });
      toast.success(form.id ? 'Đã cập nhật phòng.' : 'Đã thêm phòng.');
      onSaved(); onClose();
    } catch (err) { toast.error((err as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{form.id ? 'Sửa phòng khám' : 'Thêm phòng khám'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Cơ sở *">
            <select value={form.facility_id ?? ''} onChange={setStr('facility_id')} className={inputCls}>
              <option value="">-- Chọn cơ sở --</option>
              {facilities.filter((f) => f.is_active).map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tên phòng *">
            <input value={form.name ?? ''} onChange={setStr('name')} className={inputCls} placeholder="Phòng khám Tim mạch 1" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số phòng">
              <input value={form.room_number ?? ''} onChange={setStr('room_number')} className={inputCls} placeholder="101" />
            </Field>
            <Field label="Capacity">
              <input type="number" min={1} value={form.capacity ?? 1} onChange={setNum('capacity')} className={inputCls} />
            </Field>
          </div>
          <Field label="Thiết bị">
            <input value={form.equipment ?? ''} onChange={setStr('equipment')} className={inputCls} placeholder="ECG, máy đo huyết áp" />
          </Field>
          <FormActions saving={saving} onCancel={onClose} editMode={!!form.id} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
