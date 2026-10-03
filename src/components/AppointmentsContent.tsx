import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Calendar,
  CheckCircle2,
  FileText,
  Hospital,
  Loader2,
  MapPin,
  Plus,
  RotateCw,
  Stethoscope,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  fetchMyAppointments,
  cancelAppointment,
  mapBookingError,
  fetchPatientProfile,
  canPatientSelfBook,
  bookingBlockedMessage,
} from '@/lib/appointment-api';
import { useAuth } from '@/hooks/use-auth';
import {
  STATUS_LABELS,
  formatSlotTime,
  type Appointment,
  type AppointmentStatus,
} from '@/types/appointment';

type TabType = 'upcoming' | 'past' | 'cancelled';

const ACTIVE_STATUSES: AppointmentStatus[] = ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'];
const COMPLETED_STATUSES: AppointmentStatus[] = ['COMPLETED'];
const CANCELLED_STATUSES: AppointmentStatus[] = ['CANCELLED', 'NO_SHOW'];

export default function AppointmentsContent() {
  const navigate = useNavigate();
  const { session, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  useEffect(() => {
    fetchMyAppointments()
      .then(setAppointments)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleBookClick() {
    if (authLoading) return;
    const userId = session?.user.id;
    if (!userId) {
      toast.error(bookingBlockedMessage());
      return;
    }
    const profile = await fetchPatientProfile(userId);
    if (!canPatientSelfBook(profile?.status)) {
      toast.error(bookingBlockedMessage());
      return;
    }
    navigate('/appointments/book');
  }

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a)),
      );
      toast.success('Đã hủy lịch hẹn.');
      setPendingCancelId(null);
    } catch (e) {
      toast.error(mapBookingError((e as Error).message));
    } finally {
      setCancelling(null);
    }
  }

  const upcoming = appointments.filter((a) => ACTIVE_STATUSES.includes(a.status));
  const past = appointments.filter((a) => COMPLETED_STATUSES.includes(a.status));
  const cancelled = appointments.filter((a) => CANCELLED_STATUSES.includes(a.status));

  const getTabContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcoming;
      case 'past':
        return past;
      case 'cancelled':
        return cancelled;
      default:
        return [];
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 lg:p-9 bg-[#F8FAFC]">
      <div className="max-w-[1240px] mx-auto">
        {/* Card Container */}
        <div className="bg-white border border-slate-200 rounded-[18px] p-7 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">
                Danh sách lịch hẹn khám trực tiếp
              </h2>
              <p className="text-slate-500 text-[14.5px] mt-1">
                Quản lý và theo dõi các buổi khám trực tiếp tại Phòng khám & Bệnh viện RCARE.
              </p>
            </div>
            <button
              onClick={() => void handleBookClick()}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              Đặt lịch hẹn mới
            </button>
          </div>

          {/* Tab Filter */}
          <div className="flex gap-2 border-b-[1.5px] border-slate-200 mb-6">
            <TabButton
              active={activeTab === 'upcoming'}
              onClick={() => setActiveTab('upcoming')}
            >
              Sắp diễn ra
            </TabButton>
            <TabButton
              active={activeTab === 'past'}
              onClick={() => setActiveTab('past')}
              count={past.length}
            >
              Lịch sử khám đã qua
            </TabButton>
            <TabButton
              active={activeTab === 'cancelled'}
              onClick={() => setActiveTab('cancelled')}
              count={cancelled.length}
            >
              Đã hủy
            </TabButton>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {getTabContent().length === 0 ? (
                <EmptyState
                  tab={activeTab}
                  onBook={() => void handleBookClick()}
                />
              ) : (
                getTabContent().map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    apt={apt}
                    tab={activeTab}
                    cancelling={cancelling === apt.id}
                    onCancel={() => setPendingCancelId(apt.id)}
                    onRebook={() => void handleBookClick()}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog
        open={pendingCancelId !== null}
        onOpenChange={(open) => {
          if (!open && !cancelling) setPendingCancelId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc muốn hủy lịch hẹn này?</AlertDialogTitle>
            <AlertDialogDescription>
              Lịch hẹn sẽ chuyển sang trạng thái Đã hủy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!cancelling}>Đóng</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={!!cancelling || !pendingCancelId}
              onClick={() => {
                if (pendingCancelId) void handleCancel(pendingCancelId);
              }}
            >
              {cancelling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Xác nhận hủy
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-[15px] font-bold border-b-[2.5px] transition-colors ${
        active
          ? 'border-teal-600 text-teal-600'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 text-slate-400">({count})</span>
      )}
    </button>
  );
}

function AppointmentCard({
  apt,
  tab,
  cancelling,
  onCancel,
  onRebook,
}: {
  apt: Appointment;
  tab: TabType;
  cancelling: boolean;
  onCancel: () => void;
  onRebook: () => void;
}) {
  const dateLabel = apt.slot_date
    ? format(parseISO(apt.slot_date), 'EEEE, dd/MM/yyyy', { locale: vi })
    : '—';
  const timeLabel = formatSlotTime(apt.start_time);

  const borderColor = tab === 'cancelled' ? 'border-l-red-500' : tab === 'past' ? 'border-l-slate-400' : 'border-l-teal-600';

  return (
    <div
      className={`border border-slate-200 ${borderColor} border-l-[5px] rounded-[14px] p-5 lg:p-6 bg-white hover:shadow-md transition-shadow`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left content */}
        <div className="flex-1">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {tab === 'upcoming' && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13.5px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  <Hospital className="h-3.5 w-3.5" />
                  Khám trực tiếp
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13.5px] font-bold bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {STATUS_LABELS[apt.status]}
                </span>
              </>
            )}
            {tab === 'past' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13.5px] font-bold bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã hoàn thành
              </span>
            )}
            {tab === 'cancelled' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                Đã hủy
              </span>
            )}
            <span className="text-slate-500 text-[13px] font-bold">
              Mã hẹn: #{apt.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`text-[19px] font-bold mb-1.5 ${
              tab === 'cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            Khám {apt.specialty_name}
          </h3>

          {/* Info rows */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[14px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              <strong className="text-slate-700">{apt.specialty_name}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-600" />
              <strong className="text-slate-700">{dateLabel}</strong>
              <span>({timeLabel})</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[14px] text-slate-500 mt-1.5">
            <MapPin className="h-4 w-4 text-teal-600" />
            Phòng khám RCARE Quận 3, TP.HCM
          </div>

          {/* Cancelled reason only */}
          {tab === 'cancelled' && apt.note && (
            <p className="text-[13px] text-slate-500 mt-2">
              Lý do hủy: {apt.note}
            </p>
          )}

        </div>

        {/* Right actions */}
        <div className="flex flex-col gap-2 lg:min-w-[160px]">
          {tab === 'upcoming' && apt.status === 'CONFIRMED' && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Hủy lịch khám
            </button>
          )}
          {tab === 'past' && (
            <button
              onClick={() => toast.info('Đang tải Tóm tắt bệnh án PDF...')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-red-500" />
              Tải Tóm tắt bệnh án
            </button>
          )}
          {tab === 'cancelled' && (
            <button
              onClick={onRebook}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              Đặt lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab, onBook }: { tab: TabType; onBook: () => void }) {
  const messages: Record<TabType, string> = {
    upcoming: 'Bạn chưa có lịch hẹn nào sắp tới.',
    past: 'Bạn chưa có lịch khám đã hoàn thành.',
    cancelled: 'Không có lịch hẹn nào bị hủy.',
  };

  return (
    <div className="rounded-[14px] border-2 border-dashed border-slate-200 bg-slate-50 p-10 flex flex-col items-center gap-4 text-center">
      <Calendar className="h-12 w-12 text-slate-300" />
      <p className="text-sm text-slate-500">{messages[tab]}</p>
      {tab === 'upcoming' && (
        <button
          onClick={onBook}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Đặt lịch ngay
        </button>
      )}
    </div>
  );
}
