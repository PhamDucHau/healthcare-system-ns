import type { AdminAppointment } from "@/types/admin-appointment";

export type AppointmentReadiness = {
  hasPreConsult: boolean;
  hasVitalSigns: boolean;
  isReady: boolean;
};

export function getAppointmentReadiness(appt: AdminAppointment): AppointmentReadiness {
  const hasPreConsult = appt.pre_consult_status === "submitted";
  const hasVitalSigns = appt.has_vital_signs;
  return { hasPreConsult, hasVitalSigns, isReady: hasPreConsult && hasVitalSigns };
}

export function getAppointmentReadinessMessage(readiness: AppointmentReadiness): string {
  if (!readiness.hasPreConsult && !readiness.hasVitalSigns) {
    return "Chưa hoàn thành khai báo trước khám và chưa nhập sinh hiệu. Vui lòng hoàn tất cả trước khi check-in hoặc khám.";
  }
  if (!readiness.hasPreConsult) {
    return "Chưa hoàn thành khai báo trước khám. Bệnh nhân cần hoàn thành khai báo y tế trước khi check-in hoặc khám.";
  }
  return "Chưa nhập sinh hiệu. Vui lòng nhập sinh hiệu trước khi check-in hoặc khám.";
}

export function isAppointmentReadyForExam(appt: AdminAppointment): boolean {
  return getAppointmentReadiness(appt).isReady;
}
