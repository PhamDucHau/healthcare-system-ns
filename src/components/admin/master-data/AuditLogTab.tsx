import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAuditLog } from '@/lib/master-data-api';
import type { AuditLogEntry } from '@/types/master-data';

const TABLE_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'specialties', label: 'Chuyên khoa' },
  { value: 'services', label: 'Dịch vụ' },
  { value: 'facilities', label: 'Cơ sở' },
  { value: 'rooms', label: 'Phòng khám' },
  { value: 'doctor_schedules', label: 'Lịch làm việc' },
  { value: 'question_categories', label: 'Danh mục' },
];

const ACTION_COLORS: Record<string, string> = {
  INSERT:     'bg-blue-100 text-blue-700',
  UPDATE:     'bg-yellow-100 text-yellow-700',
  DEACTIVATE: 'bg-red-100 text-red-700',
};

export default function AuditLogTab() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTable, setFilterTable] = useState('');

  const reload = (tbl: string) => {
    setLoading(true);
    fetchAuditLog(tbl || undefined, 100)
      .then(setEntries)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(filterTable); }, [filterTable]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Lọc theo bảng:</label>
        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {TABLE_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{entries.length} bản ghi gần nhất</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          Chưa có log.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {['Thời gian', 'Bảng', 'Hành động', 'Record ID', 'Thay đổi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {format(parseISO(e.changed_at), 'dd/MM/yy HH:mm', { locale: vi })}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{e.table_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${ACTION_COLORS[e.action] ?? 'bg-gray-100 text-gray-600'}`}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground max-w-[140px] truncate">
                      {e.record_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[240px]">
                      {e.action === 'INSERT' ? (
                        <span className="text-blue-600 font-medium">Thêm mới: {(e.new_data as Record<string, unknown>)?.name as string ?? '—'}</span>
                      ) : e.action === 'DEACTIVATE' ? (
                        <span className="text-red-600 font-medium">Vô hiệu: {(e.old_data as Record<string, unknown>)?.name as string ?? '—'}</span>
                      ) : (
                        <span className="text-yellow-700">Cập nhật: {(e.new_data as Record<string, unknown>)?.name as string ?? '—'}</span>
                      )}
                    </td>
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
