import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Calendar, Plus, Loader2, QrCode, XCircle, ChevronRight, Stethoscope, ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { fetchMyAppointments, cancelAppointment, mapBookingError } from '@/lib/appointment-api';
import {
  STATUS_LABELS, STATUS_COLORS, formatSlotTime,
  type Appointment, type AppointmentStatus,
} from '@/types/appointment';

const ACTIVE_STATUSES: AppointmentStatus[] = ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'];
const PAST_STATUSES:   AppointmentStatus[] = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function AppointmentsContent() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAppointments()
      .then(setAppointments)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a)),
      );
      toast.success('Đã hủy lịch hẹn.');
    } catch (e) {
      toast.error(mapBookingError((e as Error).message));
    } finally {
      setCancelling(null);
    }
  }

  const upcoming = appointments.filter((a) => ACTIVE_STATUSES.includes(a.status));
  const past     = appointments.filter((a) => PAST_STATUSES.includes(a.status));

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Lịch hẹn của tôi</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý lịch khám sắp tới và xem lịch sử khám.
            </p>
          </div>
          <button
            onClick={() => navigate('/appointments/book')}
            className="mt-4 sm:mt-0 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Đặt lịch khám
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Upcoming */}
            <Section title="Lịch hẹn sắp tới" count={upcoming.length}>
              {upcoming.length === 0 ? (
                <EmptyState
                  message="Bạn chưa có lịch hẹn nào."
                  action={{ label: 'Đặt lịch ngay', onClick: () => navigate('/appointments/book') }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map((apt) => (
                    <UpcomingCard
                      key={apt.id}
                      apt={apt}
                      cancelling={cancelling === apt.id}
                      onCancel={() => handleCancel(apt.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Past */}
            {past.length > 0 && (
              <Section title="Lịch sử khám">
                <div className="rounded-xl border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <Th>Ngày khám</Th>
                          <Th>Chuyên khoa</Th>
                          <Th>Ghi chú</Th>
                          <Th>Trạng thái</Th>
                          <Th right>Chi tiết</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {past.map((apt) => (
                          <PastRow key={apt.id} apt={apt} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {count}
          </span>
        )}
        <div className="flex-1 border-t border-dashed" />
      </div>
      {children}
    </div>
  );
}

function UpcomingCard({
  apt, cancelling, onCancel,
}: {
  apt: Appointment;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const dateLabel = apt.slot_date
    ? format(parseISO(apt.slot_date), 'EEEE, dd/MM/yyyy', { locale: vi })
    : '—';

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{apt.specialty_name}</p>
            <p className="text-xs font-semibold text-primary">
              {formatSlotTime(apt.start_time)} — {dateLabel}
            </p>
          </div>
        </div>
        <StatusBadge status={apt.status} />
      </div>

      {apt.note && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-3 line-clamp-2">
          {apt.note}
        </p>
      )}

      {/* QR Token */}
      {apt.status === 'CONFIRMED' && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 mb-3">
          <QrCode className="h-4 w-4 text-foreground flex-shrink-0" />
          <span className="text-[11px] font-mono text-muted-foreground truncate flex-1">
            {apt.qr_token}
          </span>
        </div>
      )}

      {/* Actions */}
      {apt.status === 'CONFIRMED' && (
        <div className="flex items-center gap-4">
          {/* Pre-consultation button */}
          <button
            onClick={() => navigate(`/appointments/${apt.id}/pre-consultation`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Khai báo trước khám
          </button>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
          >
            {cancelling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Hủy lịch
          </button>
        </div>
      )}
    </div>
  );
}

function PastRow({ apt }: { apt: Appointment }) {
  const dateLabel = apt.slot_date
    ? format(parseISO(apt.slot_date), 'dd/MM/yyyy')
    : '—';

  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
        <p className="text-xs text-muted-foreground">{formatSlotTime(apt.start_time)}</p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm text-foreground">{apt.specialty_name}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-xs text-muted-foreground line-clamp-1">{apt.note ?? '—'}</p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={apt.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <button className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Xem
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge className={`text-[10px] font-bold border-0 ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function EmptyState({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-10 flex flex-col items-center gap-4 text-center">
      <Calendar className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
