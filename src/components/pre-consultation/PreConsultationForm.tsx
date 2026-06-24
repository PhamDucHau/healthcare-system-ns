/**
 * FR-022: Pre-Consultation Form Component
 * Multi-step form for health declaration before appointment
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarDays,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { usePreConsultationForm } from '@/hooks/usePreConsultationForm';
import { fetchMyAppointments } from '@/lib/appointment-api';
import type { Appointment } from '@/types/appointment';
import { STEP_LABELS, STEP_NUMBERS } from '@/types/pre-consultation';

import SymptomsStep from './steps/SymptomsStep';
import MedicalHistoryStep from './steps/MedicalHistoryStep';
import MedicationsStep from './steps/MedicationsStep';
import AllergiesStep from './steps/AllergiesStep';
import LifestyleStep from './steps/LifestyleStep';

export default function PreConsultationForm() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);

  // Load appointment info
  useEffect(() => {
    async function loadAppointment() {
      if (!appointmentId) return;

      try {
        const appointments = await fetchMyAppointments();
        const apt = appointments.find((a) => a.id === appointmentId);
        if (apt) {
          setAppointment(apt);
        } else {
          toast.error('Không tìm thấy lịch hẹn');
          navigate('/appointments');
        }
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoadingAppointment(false);
      }
    }

    loadAppointment();
  }, [appointmentId, navigate]);

  // Pre-consultation form hook
  const form = usePreConsultationForm(appointmentId ?? '');

  // Loading state
  if (loadingAppointment || form.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (form.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{form.error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/appointments')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quay lại lịch hẹn
        </Button>
      </div>
    );
  }

  // Already submitted state
  if (form.isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card className="text-center py-12">
          <CardContent>
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Phiếu khai báo đã được gửi
            </h2>
            <p className="text-muted-foreground mb-6">
              Cảm ơn bạn đã hoàn thành khai báo y tế trước khám. Bác sĩ sẽ xem
              thông tin này trước khi tiến hành khám.
            </p>
            <Button onClick={() => navigate('/appointments')}>
              Quay lại lịch hẹn
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dateLabel = appointment?.slot_date
    ? format(parseISO(appointment.slot_date), "EEEE, dd/MM/yyyy 'lúc' HH:mm", {
        locale: vi,
      })
    : '';

  // Render current step
  function renderStep() {
    switch (form.currentStep) {
      case 'symptoms':
        return (
          <SymptomsStep
            formData={form.formData}
            updateField={form.updateField}
            validationErrors={form.validationErrors}
          />
        );
      case 'medical_history':
        return (
          <MedicalHistoryStep
            formData={form.formData}
            updateField={form.updateField}
            updateFields={form.updateFields}
          />
        );
      case 'medications':
        return (
          <MedicationsStep
            formData={form.formData}
            updateField={form.updateField}
            updateFields={form.updateFields}
            validationErrors={form.validationErrors}
          />
        );
      case 'allergies':
        return (
          <AllergiesStep
            formData={form.formData}
            updateField={form.updateField}
            updateFields={form.updateFields}
            validationErrors={form.validationErrors}
          />
        );
      case 'lifestyle':
        return (
          <LifestyleStep
            formData={form.formData}
            updateField={form.updateField}
            validationErrors={form.validationErrors}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          KHAI BÁO Y TẾ TRƯỚC KHÁM
        </h1>

        {/* Appointment Info Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Lịch: {appointment?.slot_date
                      ? format(parseISO(appointment.slot_date), 'dd/MM/yyyy', { locale: vi })
                      : ''}{' '}
                    {appointment?.start_time?.slice(0, 5)} - {appointment?.specialty_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vui lòng hoàn thành tờ khai để bác sĩ nắm rõ tình trạng của bạn
                    trước khi bắt đầu buổi khám.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  Hồ sơ y tế
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-primary uppercase tracking-wider">
            Phần {STEP_NUMBERS[form.currentStep]}/5:{' '}
            {STEP_LABELS[form.currentStep]}
          </p>
          <p className="text-sm text-muted-foreground">
            {Math.round(form.progress)}% Hoàn thành
          </p>
        </div>
        <Progress value={form.progress} className="h-2" />
      </div>

      {/* Auto-save indicator */}
      <div className="flex items-center gap-2 text-xs mb-4 min-h-[1.25rem]">
        {form.draftSaveStatus === 'saving' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Đang lưu...</span>
          </>
        )}
        {form.draftSaveStatus === 'saved' && form.lastSavedAt && (
          <>
            <Check className="h-3 w-3 text-green-600" />
            <span className="text-green-700 font-medium">Đã lưu thành công</span>
            <span className="text-muted-foreground">
              ({formatDistanceToNow(form.lastSavedAt, { locale: vi, addSuffix: true })})
            </span>
          </>
        )}
        {form.draftSaveStatus === 'error' && (
          <>
            <AlertCircle className="h-3 w-3 text-amber-600" />
            <span className="text-amber-700">Không thể lưu tự động. Vui lòng thử lại.</span>
          </>
        )}
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation Buttons - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => void form.saveDraft()}
              disabled={form.saving || form.submitting}
            >
              {form.saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu nháp
            </Button>
            {form.draftSaveStatus === 'saved' && form.lastSavedAt && !form.saving && (
              <span className="text-[10px] text-green-600 pl-1">Đã lưu tự động</span>
            )}
          </div>

          <div className="flex-1" />

          {form.canGoPrev && (
            <Button
              variant="outline"
              onClick={() => void form.goToPrevStep()}
              disabled={form.submitting || form.saving}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
          )}

          {form.canGoNext ? (
            <Button
              onClick={() => void form.goToNextStep()}
              disabled={form.submitting || form.saving || !form.isCurrentStepValid}
            >
              Tiếp tục
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={async () => {
                const result = await form.submit();
                if (result) {
                  // Successfully submitted, will show success state
                }
              }}
              disabled={form.submitting || !form.isCurrentStepValid}
              className="bg-primary hover:bg-primary/90"
            >
              {form.submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Hoàn tất
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
