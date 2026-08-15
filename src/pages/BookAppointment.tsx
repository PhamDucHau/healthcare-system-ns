import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import BookingStep1 from '@/components/patient/booking/BookingStep1';
import BookingStep2 from '@/components/patient/booking/BookingStep2';
import BookingStep3 from '@/components/patient/booking/BookingStep3';
import type { Specialty, AppointmentSlot } from '@/types/appointment';
import { useAuth } from '@/hooks/use-auth';
import {
  bookingBlockedMessage,
  canPatientSelfBook,
  fetchPatientProfile,
} from '@/lib/appointment-api';

type BookingState = {
  specialty: Specialty | null;
  date: Date | null;
  slot: AppointmentSlot | null;
};

const STEPS = ['Chuyên khoa', 'Ngày & Giờ', 'Xác nhận'];

const BookAppointment = () => {
  const navigate = useNavigate();
  const { session, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [booking, setBooking] = useState<BookingState>({
    specialty: null,
    date: null,
    slot: null,
  });
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.user.id) {
      setProfileStatus(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetchPatientProfile(session.user.id)
      .then((profile) => setProfileStatus(profile?.status ?? null))
      .finally(() => setProfileLoading(false));
  }, [session?.user.id, authLoading]);

  const canBook = canPatientSelfBook(profileStatus);

  function handleSpecialtySelected(specialty: Specialty) {
    setBooking((b) => ({ ...b, specialty }));
    setStep(2);
  }

  function handleDateSlotSelected(date: Date, slot: AppointmentSlot) {
    setBooking((b) => ({ ...b, date, slot }));
    setStep(3);
  }

  function handleBack() {
    if (step === 1) navigate('/appointments');
    else setStep((s) => (s - 1) as 1 | 2 | 3);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">

            {/* Back + Step indicator */}
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
              <div className="flex-1" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bước {step}/{STEPS.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">
                QUY TRÌNH ĐẶT LỊCH KHÁM
              </p>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                {step === 1 && 'Chọn chuyên khoa'}
                {step === 2 && 'Chọn ngày & giờ'}
                {step === 3 && 'Xác nhận đặt lịch'}
              </h1>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                {STEPS.map((label, i) => (
                  <span
                    key={label}
                    className={`text-[10px] font-semibold ${
                      i + 1 <= step ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {profileLoading || authLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !canBook ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {bookingBlockedMessage()}
                  </p>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <BookingStep1 onSelect={handleSpecialtySelected} />
                  )}
                  {step === 2 && booking.specialty && (
                    <BookingStep2
                      specialty={booking.specialty}
                      onSelect={handleDateSlotSelected}
                    />
                  )}
                  {step === 3 &&
                    booking.specialty &&
                    booking.date &&
                    booking.slot && (
                      <BookingStep3
                        specialty={booking.specialty}
                        date={booking.date}
                        slot={booking.slot}
                      />
                    )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookAppointment;
