import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, ChevronDown, Filter, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, type AppointmentStatus } from '@/types/appointment';
import type { Doctor } from '@/types/master-data';

export type PatientFilters = {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  doctorId?: string;
};

type PatientListFiltersProps = {
  doctors: Doctor[];
  currentDoctorId?: string | null;
  isAdmin?: boolean;
  isLoading?: boolean;
  onFilter: (filters: PatientFilters) => void;
  onReset: () => void;
};

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'CONFIRMED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

function formatDateDisplay(date: Date | undefined): string {
  if (!date) return '';
  return format(date, 'dd/MM/yyyy', { locale: vi });
}

function formatDateIso(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  return format(date, 'yyyy-MM-dd');
}

export function PatientListFilters({
  doctors,
  currentDoctorId,
  isAdmin = false,
  isLoading = false,
  onFilter,
  onReset,
}: PatientListFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>('__all__');
  const [doctorId, setDoctorId] = useState<string>(
    isAdmin ? '__all__' : (currentDoctorId ?? '__all__')
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return Boolean(dateFrom || dateTo || (status && status !== '__all__') || (doctorId && doctorId !== '__all__'));
  }, [dateFrom, dateTo, status, doctorId]);

  const handleFilter = () => {
    onFilter({
      dateFrom: formatDateIso(dateFrom),
      dateTo: formatDateIso(dateTo),
      status: status !== '__all__' ? status : undefined,
      doctorId: doctorId !== '__all__' ? doctorId : undefined,
    });
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setStatus('__all__');
    setDoctorId(isAdmin ? '__all__' : (currentDoctorId ?? '__all__'));
    onReset();
  };

  const doctorOptions = useMemo(() => {
    if (!isAdmin && currentDoctorId) {
      const currentDoctor = doctors.find((d) => d.user_id === currentDoctorId);
      if (currentDoctor) {
        return [currentDoctor];
      }
    }
    return doctors;
  }, [doctors, isAdmin, currentDoctorId]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Bộ lọc
        </span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3 rounded-lg border bg-card p-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Ngày khám
            </label>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-9 w-full justify-start text-left font-normal',
                      !dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? formatDateDisplay(dateFrom) : 'Từ ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={vi}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-9 w-full justify-start text-left font-normal',
                      !dateTo && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? formatDateDisplay(dateTo) : 'Đến ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    disabled={(date) => dateFrom ? date < dateFrom : false}
                    locale={vi}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Trạng thái lịch hẹn
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tất cả</SelectItem>
                {APPOINTMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && doctors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Bác sĩ phụ trách
              </label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  {doctorOptions.map((d) => (
                    <SelectItem key={d.user_id} value={d.user_id}>
                      {d.full_name ?? d.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isAdmin && currentDoctorId && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Bác sĩ phụ trách
              </label>
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                {doctorOptions[0]?.full_name ?? doctorOptions[0]?.email ?? 'Bạn'}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleReset}
              disabled={isLoading}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={handleFilter}
              disabled={isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
