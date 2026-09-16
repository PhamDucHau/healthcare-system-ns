/**
 * FR-010 / FR-011: EMR — SOAP Note types and Doctor Approval
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ExamStatus = 'DRAFT' | 'LOCKED';

export type IcdConfirmStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

// ─── ICD Code on SOAP Note ───────────────────────────────────────────────────

export type SoapIcdCode = {
  id: string;
  exam_id: string;
  icd_code: string;
  icd_name: string;
  is_ai_suggested: boolean;
  ai_confidence: number | null;
  ai_reason: string | null;
  confirm_status: IcdConfirmStatus;
  confirmed_at: string | null;
  display_order: number;
  created_at: string;
};

// ─── Medical Examination (SOAP Note) ─────────────────────────────────────────

export type MedicalExamination = {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  s_text: string | null;
  o_text: string | null;
  a_text: string | null;
  p_text: string | null;
  status: ExamStatus;
  is_addendum: boolean;
  parent_exam_id: string | null;
  auto_saved_at: string | null;
  created_at: string;
  updated_at: string;
  ai_baseline?: {
    s_text: string | null;
    o_text: string | null;
    a_text: string | null;
    p_text: string | null;
  } | null;
  // Joined
  icd_codes: SoapIcdCode[];
};

// ─── Form Data ────────────────────────────────────────────────────────────────

export type SoapFormData = {
  s_text: string;
  o_text: string;
  a_text: string;
  p_text: string;
};

export const DEFAULT_SOAP_FORM: SoapFormData = {
  s_text: '',
  o_text: '',
  a_text: '',
  p_text: '',
};

// ─── AI ICD Suggestion ────────────────────────────────────────────────────────

export type AiIcdSuggestion = {
  icd_code: string;
  icd_name: string;
  confidence: number;
  reason: string;
};

// ─── Sign Examination Input ────────────────────────────────────────────────────

export type SignExaminationInput = {
  exam_id: string;
  pin_plain: string;
  responsibility_ack: boolean;
};

export type SignExaminationResult = {
  exam_id: string;
  sig_id: string;
  data_hash: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

export type SoapValidationErrors = Partial<{
  s_text: string;
  a_text: string;
  icd_codes: string;
  pin: string;
}>;

export const SOAP_ASSESSMENT_REQUIRED_MESSAGE =
  'Vui lòng điền phần Đánh giá (A) trước khi ký xác nhận';

export const PIN_SIGN_LOCK_MESSAGE = 'Vui lòng thử lại sau 10 phút';

export function isDoctorPinLocked(pinLockedUntil: string | null, now = Date.now()): boolean {
  if (!pinLockedUntil) return false;
  const until = new Date(pinLockedUntil).getTime();
  return Number.isFinite(until) && until > now;
}

export function isPinSignLockMessage(message: string): boolean {
  return (
    message.includes('PIN_FAILED_LOCKED') ||
    message.includes('PIN_LOCKED') ||
    message.includes(PIN_SIGN_LOCK_MESSAGE)
  );
}

export function validateSoapForSave(data: SoapFormData): SoapValidationErrors {
  const errors: SoapValidationErrors = {};
  if (!data.s_text || data.s_text.trim() === '') {
    errors.s_text = 'Phần Subjective (S) là bắt buộc';
  }
  return errors;
}

export function validateSoapForSign(
  data: SoapFormData,
  icdCodes: SoapIcdCode[]
): SoapValidationErrors {
  const errors = validateSoapForSave(data);
  if (!data.a_text || data.a_text.trim() === '') {
    errors.a_text = SOAP_ASSESSMENT_REQUIRED_MESSAGE;
  }
  const confirmed = icdCodes.filter((c) => c.confirm_status === 'CONFIRMED');
  if (confirmed.length === 0) {
    errors.icd_codes = 'Cần ít nhất 1 chẩn đoán ICD-10 được xác nhận';
  }
  return errors;
}

// ─── Status Labels ────────────────────────────────────────────────────────────

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  DRAFT: 'Đang soạn',
  LOCKED: 'Đã ký',
};

export const EXAM_STATUS_COLORS: Record<ExamStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700',
  LOCKED: 'bg-green-100 text-green-700',
};

export const ICD_CONFIRM_LABELS: Record<IcdConfirmStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Đã bỏ qua',
};
