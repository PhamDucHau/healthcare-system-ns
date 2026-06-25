import { useState, type LucideIcon } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Reusable table shell ─────────────────────────────────────────────────────

type EntityTableProps<T> = {
  title: string;
  loading: boolean;
  onAdd: () => void;
  headers: string[];
  rows: T[];
  renderRow: (row: T, idx: number) => React.ReactNode;
};

export function EntityTable<T>({
  title, loading, onAdd, headers, rows, renderRow,
}: EntityTableProps<T>) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{rows.length} bản ghi</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm {title}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    {renderRow(row, idx)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active / Inactive badge ──────────────────────────────────────────────────

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
      active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
      {active ? 'Hoạt động' : 'Vô hiệu'}
    </span>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

type ActionBtnProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
};

export function ActionBtn({ icon: Icon, label, onClick, variant = 'default', disabled }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-40 ${
        variant === 'destructive'
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

// ─── Shared input / field classes ─────────────────────────────────────────────

export const inputCls = 'w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ActiveStatusField({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (active: boolean) => void;
}) {
  return (
    <Field label="Trạng thái">
      <select
        value={value ? 'active' : 'inactive'}
        onChange={(e) => onChange(e.target.value === 'active')}
        className={inputCls}
      >
        <option value="active">Hoạt động</option>
        <option value="inactive">Vô hiệu</option>
      </select>
    </Field>
  );
}

export function DeleteConfirmDialog({
  open,
  name,
  entityLabel,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  name?: string;
  entityLabel: string;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa {entityLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            {name
              ? `Bạn có chắc muốn xóa "${name}"? Hành động này không thể hoàn tác.`
              : `Bạn có chắc muốn xóa ${entityLabel} này? Hành động này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? 'Đang xóa…' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function FormActions({
  saving, onCancel, editMode,
}: { saving: boolean; onCancel: () => void; editMode: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">
        Hủy
      </button>
      <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {editMode ? 'Lưu' : 'Thêm'}
      </button>
    </div>
  );
}

// ─── Dialog entity hook ───────────────────────────────────────────────────────

export function useEntityDialog<T extends { id?: string }>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  return {
    open,
    editing,
    openAdd:  () => { setEditing(null); setOpen(true); },
    openEdit: (row: T) => { setEditing(row); setOpen(true); },
    close:    () => { setOpen(false); setEditing(null); },
  };
}
