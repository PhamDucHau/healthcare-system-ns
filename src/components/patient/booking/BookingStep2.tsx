import { useEffect, useState } from 'react';
import { format, isBefore, startOfToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { fetchSlots } from '@/lib/appointment-api';
import type { Specialty, AppointmentSlot } from '@/types/appointment';
import { formatSlotTime } from '@/types/appointment';

type Props = {
  specialty: Specialty;
  onSelect: (date: Date, slot: AppointmentSlot) => void;
};

export default function BookingStep2({ specialty, onSelect }: Props) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSlotError(null);
    setSelectedSlot(null);
    fetchSlots(specialty.id, date)
      .then(setSlots)
      .catch((e: Error) => setSlotError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [date, specialty.id]);

  const morningSlots = slots.filter((s) => {
    const h = parseInt(s.start_time.split(':')[0] ?? '0', 10);
    return h < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const h = parseInt(s.start_time.split(':')[0] ?? '0', 10);
    return h >= 12;
  });

  function handleContinue() {
    if (!date || !selectedSlot) return;
    onSelect(date, selectedSlot);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="rounded-xl border bg-card p-4 flex-shrink-0 self-start">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Chọn ngày khám
          </p>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => isBefore(d, startOfToday()) || d.getDay() === 0}
            locale={vi}
            className="p-0"
          />
        </div>

        {/* Slots */}
        <div className="flex-1">
          {!date ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              Chọn một ngày để xem khung giờ trống
            </div>
          ) : loadingSlots ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : slotError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {slotError}
            </div>
          ) : (
            <div>
              <div className="rounded-xl border bg-primary/5 px-4 py-2.5 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {format(date, "EEEE, d MMMM yyyy", { locale: vi })}
                </span>
              </div>

              <SlotGroup label="Buổi sáng" slots={morningSlots} selected={selectedSlot} onSelect={setSelectedSlot} />
              <SlotGroup label="Buổi chiều" slots={afternoonSlots} selected={selectedSlot} onSelect={setSelectedSlot} />

              {slots.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Không có khung giờ nào trong ngày này.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        disabled={!selectedSlot}
        onClick={handleContinue}
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Tiếp tục đặt lịch
      </button>
    </div>
  );
}

type SlotGroupProps = {
  label: string;
  slots: AppointmentSlot[];
  selected: AppointmentSlot | null;
  onSelect: (slot: AppointmentSlot) => void;
};

function SlotGroup({ label, slots, selected, onSelect }: SlotGroupProps) {
  if (slots.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected = selected?.id === slot.id;
          return (
            <button
              key={slot.id}
              disabled={!slot.is_available}
              onClick={() => onSelect(slot)}
              className={`rounded-xl border py-3 text-center transition-all ${
                !slot.is_available
                  ? 'cursor-not-allowed opacity-40 bg-muted border-muted'
                  : isSelected
                  ? 'border-primary bg-primary text-primary-foreground font-bold shadow'
                  : 'bg-card hover:border-primary hover:shadow-sm'
              }`}
            >
              <p className={`text-sm font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {formatSlotTime(slot.start_time)}
              </p>
              <p className={`text-[10px] mt-0.5 font-semibold ${
                !slot.is_available
                  ? 'text-muted-foreground'
                  : isSelected
                  ? 'text-primary-foreground/80'
                  : 'text-emerald-600'
              }`}>
                {slot.is_available ? 'Có sẵn' : '✕'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
