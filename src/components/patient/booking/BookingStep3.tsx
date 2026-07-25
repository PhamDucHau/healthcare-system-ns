import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Building2, Stethoscope, CheckCircle2, QrCode, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { bookAppointment, fetchPatientProfile, mapBookingError } from '@/lib/appointment-api';
import { formatSlotTime } from '@/types/appointment';
import type { Specialty, AppointmentSlot } from '@/types/appointment';
import { useAuth } from '@/hooks/use-auth';

type Props = {
  specialty: Specialty;
  date: Date;
  slot: AppointmentSlot;
};

type Profile = {
  id: string;
  legal_first_name: string | null;
  legal_last_name: string | null;
  submitted_at: string | null;
};

export default function BookingStep3({ specialty, date, slot }: Props) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ appointmentId: string; qrToken?: string } | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;
    fetchPatientProfile(session.user.id).then(setProfile);
  }, [session?.user.id]);

  const profileName =
    profile
      ? [profile.legal_first_name, profile.legal_last_name].filter(Boolean).join(' ') || 'Hồ sơ của tôi'
      : '—';

  async function handleConfirm() {
    if (!profile) return;

    if (!profile.submitted_at) {
      toast.error('Hồ sơ chưa được xác minh. Vui lòng hoàn tất onboarding trước.');
      return;
    }

    setSubmitting(true);
    try {
      const appointmentId = await bookAppointment({
        profile_id:   profile.id,
        specialty_id: specialty.id,
        slot_id:      slot.id,
        note:         note.trim() || undefined,
      });
      setSuccess({ appointmentId });
      toast.success('Đặt lịch thành công! Email xác nhận đã được gửi.');
    } catch (e) {
      toast.error(mapBookingError((e as Error).message));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-10 gap-5">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Đặt lịch thành công!</h2>
          <p className="text-sm text-muted-foreground">
            Email xác nhận và mã QR tiếp nhận đã được gửi đến email của bạn.
          </p>
        </div>

        {/* QR placeholder */}
        <div className="rounded-xl border bg-card p-6 flex flex-col items-center gap-3 w-full max-w-xs">
          <QrCode className="h-14 w-14 text-foreground" />
          <p className="text-xs text-muted-foreground font-mono break-all">{success.appointmentId}</p>
          <p className="text-[10px] text-muted-foreground">
            Mã QR hợp lệ đến 23:59 ngày {format(date, 'dd/MM/yyyy')}
          </p>
        </div>

        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/appointments')}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Xem lịch của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Appointment summary card */}
      <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
        <SummaryRow
          icon={<Calendar className="h-5 w-5 text-rose-500" />}
          iconBg="bg-rose-100"
          label="Thời gian"
          value={`${formatSlotTime(slot.start_time)} – ${format(date, 'dd/MM/yyyy', { locale: vi })}`}
        />
        <SummaryRow
          icon={<Building2 className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-100"
          label="Cơ sở y tế"
          value="Phòng khám Đa khoa ABC"
        />
        <SummaryRow
          icon={<Stethoscope className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-100"
          label="Chuyên khoa"
          value={specialty.name}
        />
      </div>

      {/* Profile selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Người khám
        </label>
        <div className="rounded-xl border bg-card px-4 py-3 text-sm font-medium text-foreground flex items-center justify-between">
          <span>{profileName} (cá nhân)</span>
          {!profile?.submitted_at && (
            <span className="text-[10px] font-bold text-destructive uppercase">Chưa xác minh</span>
          )}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Lý do khám <span className="text-muted-foreground font-normal">(tùy chọn)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Hồi hộp, đau tức ngực 3 ngày..."
          rows={3}
          className="w-full rounded-xl border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Info notice */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Sau khi xác nhận, thông tin lịch hẹn sẽ được gửi đến email của bạn và mã QR sẽ
          hiển thị trong mục "Lịch hẹn của tôi" để tiếp nhận tại phòng khám.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={handleConfirm}
          disabled={submitting || !profile?.submitted_at}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</>
          ) : (
            <><CheckCircle2 className="h-4 w-4" /> Xác nhận đặt lịch</>
          )}
        </button>
        <button
          onClick={() => navigate('/appointments')}
          disabled={submitting}
          className="w-full rounded-xl border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

type SummaryRowProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
};

function SummaryRow({ icon, iconBg, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
