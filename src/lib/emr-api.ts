/**
 * FR-010 / FR-011: EMR API — SOAP Note CRUD and Doctor Sign-off
 */

import { supabase } from '@/lib/supabase';
import { analyzeTranscript, suggestIcd10 } from '@/lib/stt-nlp-api';
import type {
  MedicalExamination,
  SoapIcdCode,
  IcdConfirmStatus,
  SignExaminationResult,
  AiIcdSuggestion,
} from '@/types/emr';

// ─── Row Mappers ──────────────────────────────────────────────────────────────

function mapIcdRow(row: Record<string, unknown>): SoapIcdCode {
  return {
    id: String(row.id),
    exam_id: String(row.exam_id),
    icd_code: String(row.icd_code),
    icd_name: String(row.icd_name),
    is_ai_suggested: Boolean(row.is_ai_suggested),
    ai_confidence: row.ai_confidence != null ? Number(row.ai_confidence) : null,
    ai_reason: row.ai_reason != null ? String(row.ai_reason) : null,
    confirm_status: row.confirm_status as IcdConfirmStatus,
    confirmed_at: row.confirmed_at != null ? String(row.confirmed_at) : null,
    display_order: Number(row.display_order ?? 0),
    created_at: String(row.created_at),
  };
}

function mapExamRow(row: Record<string, unknown>): MedicalExamination {
  const rawIcds = row.icd_codes;
  let icdCodes: SoapIcdCode[] = [];
  if (Array.isArray(rawIcds)) {
    icdCodes = rawIcds.map((i) => mapIcdRow(i as Record<string, unknown>));
  } else if (typeof rawIcds === 'string') {
    try {
      const parsed = JSON.parse(rawIcds);
      if (Array.isArray(parsed)) {
        icdCodes = parsed.map((i) => mapIcdRow(i as Record<string, unknown>));
      }
    } catch {
      // ignore
    }
  }

  return {
    id: String(row.id),
    appointment_id: String(row.appointment_id),
    patient_id: String(row.patient_id),
    doctor_id: String(row.doctor_id),
    s_text: row.s_text != null ? String(row.s_text) : null,
    o_text: row.o_text != null ? String(row.o_text) : null,
    a_text: row.a_text != null ? String(row.a_text) : null,
    p_text: row.p_text != null ? String(row.p_text) : null,
    status: row.status as MedicalExamination['status'],
    is_addendum: Boolean(row.is_addendum),
    parent_exam_id: row.parent_exam_id != null ? String(row.parent_exam_id) : null,
    auto_saved_at: row.auto_saved_at != null ? String(row.auto_saved_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    icd_codes: icdCodes,
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Creates or retrieves an existing DRAFT examination for an appointment
 * Idempotent — safe to call multiple times
 */
export async function createOrGetExamination(appointmentId: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_or_get_examination', {
    p_appointment_id: appointmentId,
  });
  if (error) throw new Error(mapEmrError(error.message));
  return data as string;
}

/**
 * Loads a full SOAP note (with ICD codes) by appointment ID
 */
export async function getExaminationByAppointment(
  appointmentId: string
): Promise<MedicalExamination | null> {
  const { data, error } = await supabase.rpc('get_examination_for_doctor', {
    p_appointment_id: appointmentId,
  });
  if (error) throw new Error(mapEmrError(error.message));
  const rows = data as Record<string, unknown>[] | null;
  if (!rows || rows.length === 0) return null;
  return mapExamRow(rows[0]);
}

/**
 * Auto-saves or manually saves SOAP draft fields
 * RULE-010c: s_text must not be empty if provided
 */
export async function saveSoapDraft(
  examId: string,
  fields: {
    s_text?: string;
    o_text?: string;
    a_text?: string;
    p_text?: string;
  }
): Promise<string> {
  const { data, error } = await supabase.rpc('save_soap_draft', {
    p_exam_id: examId,
    p_s_text: fields.s_text ?? null,
    p_o_text: fields.o_text ?? null,
    p_a_text: fields.a_text ?? null,
    p_p_text: fields.p_text ?? null,
  });
  if (error) throw new Error(mapEmrError(error.message));
  return data as string;
}

/**
 * Add or update an ICD code on the SOAP note
 */
export async function upsertIcdCode(params: {
  examId: string;
  icdCode: string;
  icdName: string;
  isAiSuggested?: boolean;
  aiConfidence?: number | null;
  aiReason?: string | null;
  confirmStatus?: IcdConfirmStatus;
}): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_icd_code', {
    p_exam_id: params.examId,
    p_icd_code: params.icdCode,
    p_icd_name: params.icdName,
    p_is_ai_suggested: params.isAiSuggested ?? false,
    p_ai_confidence: params.aiConfidence ?? null,
    p_ai_reason: params.aiReason ?? null,
    p_confirm_status: params.confirmStatus ?? 'PENDING',
  });
  if (error) throw new Error(mapEmrError(error.message));
  return data as string;
}

/**
 * Confirm an ICD code (doctor manual confirmation)
 */
export async function confirmIcdCode(examId: string, icdCode: string, icdName: string): Promise<void> {
  await upsertIcdCode({
    examId,
    icdCode,
    icdName,
    confirmStatus: 'CONFIRMED',
  });
}

/**
 * Reject an AI-suggested ICD code
 */
export async function rejectIcdCode(examId: string, icdCode: string, icdName: string): Promise<void> {
  await upsertIcdCode({
    examId,
    icdCode,
    icdName,
    confirmStatus: 'REJECTED',
  });
}

/**
 * Remove an ICD code from a SOAP note
 */
export async function removeIcdCode(icdId: string): Promise<void> {
  const { error } = await supabase
    .from('soap_icd_codes')
    .delete()
    .eq('id', icdId);
  if (error) throw new Error(error.message);
}

/**
 * Set/update doctor's sign-off PIN
 * RULE-011e: must be set before signing
 */
export async function setDoctorPin(pinPlain: string): Promise<void> {
  const { error } = await supabase.rpc('set_doctor_pin', {
    p_pin_plain: pinPlain,
  });
  if (error) throw new Error(mapEmrError(error.message));
}

/**
 * Check if the current doctor has set a PIN
 */
export async function checkDoctorPinSet(): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_doctor_pin_set');
  if (error) return false;
  return Boolean(data);
}

/**
 * Sign (lock) an examination — PIN param kept for UI compatibility but not verified server-side (dev bypass).
 */
export async function signExamination(params: {
  examId: string;
  pinPlain?: string;
  responsibilityAck: boolean;
}): Promise<SignExaminationResult> {
  const { data, error } = await supabase.rpc('sign_examination', {
    p_exam_id: params.examId,
    p_pin_plain: params.pinPlain ?? '',
    p_responsibility_ack: params.responsibilityAck,
    p_ip_address: null,
    p_user_agent: navigator.userAgent,
  });

  if (error) throw new Error(mapEmrError(error.message));

  const rows = data as { exam_id: string; sig_id: string; data_hash: string }[] | null;
  if (!rows || rows.length === 0) throw new Error('Không nhận được kết quả ký');

  return {
    exam_id: String(rows[0].exam_id),
    sig_id: String(rows[0].sig_id),
    data_hash: String(rows[0].data_hash),
  };
}

/**
 * Search ICD-10 codes from master data
 */
export async function searchIcd10(query: string): Promise<{ code: string; name: string }[]> {
  if (!query || query.trim().length < 2) return [];

  const { data, error } = await supabase
    .from('icd10_codes')
    .select('code, name')
    .or(`code.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(20);

  if (error) {
    // Fallback: search from a static demo set if table doesn't exist
    return searchIcd10Fallback(query);
  }

  return (data ?? []).map((row) => ({
    code: String((row as Record<string, unknown>).code),
    name: String((row as Record<string, unknown>).name),
  }));
}

/**
 * AI ICD-10 suggestions via Module 5/6 backend (/icd10/suggest)
 */
export async function getAiIcdSuggestions(
  sText: string,
  oText: string
): Promise<AiIcdSuggestion[]> {
  const combinedText = `${sText} ${oText}`.trim();
  const totalLength = combinedText.length;

  // Minimum content threshold
  if (totalLength < 30) return [];

  try {
    const analysis = await analyzeTranscript(combinedText);
    const complaints = analysis.complaints.map((c) => c.text);
    const symptomsPresent = analysis.symptoms_present.map((s) => s.text);
    const symptomsDenied = analysis.symptoms_denied.map((s) => s.text);

    const result = await suggestIcd10({
      complaints,
      symptomsPresent,
      symptomsDenied,
      recentTranscript: combinedText,
    });

    const fromApi = (result.icd10 ?? []).map((item) => ({
      icd_code: item.code,
      icd_name: item.name_vi || item.name_en || item.code,
      confidence: item.confidence,
      reason: item.evidence ?? result.summary ?? 'Gợi ý từ AI ICD-10',
    }));

    if (fromApi.length > 0) {
      return fromApi.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    }
  } catch {
    // Fall back to keyword matching when STT API is unavailable
  }

  const combined = combinedText.toLowerCase();
  const suggestions: AiIcdSuggestion[] = [];

  if (/ho|cough|sốt|fever|đau họng|throat|hô hấp|respiratory|viêm mũi|mũi/i.test(combined)) {
    suggestions.push({
      icd_code: 'J06.9',
      icd_name: 'Nhiễm khuẩn hô hấp trên cấp tính, không đặc hiệu',
      confidence: 85,
      reason: 'Triệu chứng đường hô hấp trên được phát hiện',
    });
    if (/sốt|fever|38|39/i.test(combined)) {
      suggestions.push({
        icd_code: 'J00',
        icd_name: 'Viêm mũi họng cấp (Cảm lạnh thông thường)',
        confidence: 72,
        reason: 'Sốt kèm triệu chứng hô hấp',
      });
    }
  }

  if (/đau đầu|headache|chóng mặt|dizziness|đau nửa đầu|migraine/i.test(combined)) {
    suggestions.push({
      icd_code: 'G43.9',
      icd_name: 'Đau nửa đầu (migraine), không đặc hiệu',
      confidence: 78,
      reason: 'Mô tả đau đầu, chóng mặt',
    });
  }

  if (/tiểu đường|diabetes|đường huyết|blood sugar|insulin/i.test(combined)) {
    suggestions.push({
      icd_code: 'E11.9',
      icd_name: 'Đái tháo đường týp 2, không biến chứng',
      confidence: 88,
      reason: 'Từ khóa liên quan đái tháo đường được phát hiện',
    });
  }

  if (/huyết áp|hypertension|cao áp|blood pressure|140|150|160/i.test(combined)) {
    suggestions.push({
      icd_code: 'I10',
      icd_name: 'Tăng huyết áp nguyên phát',
      confidence: 82,
      reason: 'Đề cập đến huyết áp cao',
    });
  }

  if (/đau bụng|abdominal|dạ dày|stomach|tiêu hóa|gastric|buồn nôn|nausea|nôn|vomit/i.test(combined)) {
    suggestions.push({
      icd_code: 'K30',
      icd_name: 'Khó tiêu chức năng',
      confidence: 70,
      reason: 'Triệu chứng tiêu hóa được phát hiện',
    });
  }

  if (/đau ngực|chest pain|tim|cardiac|nhịp tim|palpitation|hồi hộp/i.test(combined)) {
    suggestions.push({
      icd_code: 'R07.9',
      icd_name: 'Đau ngực, không đặc hiệu',
      confidence: 75,
      reason: 'Mô tả đau ngực hoặc triệu chứng tim mạch',
    });
  }

  if (/khớp|joint|xương|bone|viêm khớp|arthritis|đau lưng|back pain/i.test(combined)) {
    suggestions.push({
      icd_code: 'M54.5',
      icd_name: 'Đau thắt lưng',
      confidence: 74,
      reason: 'Triệu chứng cơ xương khớp',
    });
  }

  if (/da|skin|ngứa|itching|nổi mẩn|rash|dị ứng/i.test(combined)) {
    suggestions.push({
      icd_code: 'L29.9',
      icd_name: 'Ngứa da, không đặc hiệu',
      confidence: 65,
      reason: 'Triệu chứng da liễu',
    });
  }

  // Sort by confidence descending, limit to top 5 (FR-015)
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// ─── Fallback ICD-10 search (if no icd10_codes table) ────────────────────────

function searchIcd10Fallback(query: string): { code: string; name: string }[] {
  const ICD10_COMMON = [
    { code: 'J06.9', name: 'Nhiễm khuẩn hô hấp trên cấp tính, không đặc hiệu' },
    { code: 'J00', name: 'Viêm mũi họng cấp (Cảm lạnh thông thường)' },
    { code: 'J18.9', name: 'Viêm phổi, không đặc hiệu' },
    { code: 'J45.9', name: 'Hen phế quản, không đặc hiệu' },
    { code: 'I10', name: 'Tăng huyết áp nguyên phát' },
    { code: 'I25.9', name: 'Bệnh tim do thiếu máu cục bộ mạn tính, không đặc hiệu' },
    { code: 'E11.9', name: 'Đái tháo đường týp 2, không biến chứng' },
    { code: 'E10.9', name: 'Đái tháo đường týp 1, không biến chứng' },
    { code: 'K30', name: 'Khó tiêu chức năng' },
    { code: 'K21.0', name: 'Bệnh trào ngược dạ dày thực quản với viêm thực quản' },
    { code: 'K59.0', name: 'Táo bón' },
    { code: 'K58.9', name: 'Hội chứng ruột kích thích, không có tiêu chảy' },
    { code: 'G43.9', name: 'Đau nửa đầu (migraine), không đặc hiệu' },
    { code: 'G44.2', name: 'Đau đầu do căng thẳng, không đặc hiệu' },
    { code: 'M54.5', name: 'Đau thắt lưng' },
    { code: 'M79.3', name: 'Viêm gân, không đặc hiệu' },
    { code: 'F32.9', name: 'Giai đoạn trầm cảm, không đặc hiệu' },
    { code: 'F41.1', name: 'Rối loạn lo âu lan tỏa' },
    { code: 'L29.9', name: 'Ngứa da, không đặc hiệu' },
    { code: 'R07.9', name: 'Đau ngực, không đặc hiệu' },
    { code: 'R51', name: 'Đau đầu' },
    { code: 'R05', name: 'Ho' },
    { code: 'R50.9', name: 'Sốt, không đặc hiệu' },
    { code: 'Z00.0', name: 'Khám sức khỏe tổng quát định kỳ' },
  ];

  const q = query.toLowerCase();
  return ICD10_COMMON.filter(
    (item) => item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
  ).slice(0, 10);
}

// ─── Error Mapping ────────────────────────────────────────────────────────────

function mapEmrError(message: string): string {
  if (message.includes('UNAUTHORIZED')) return 'Bạn không có quyền thực hiện thao tác này.';
  if (message.includes('APPOINTMENT_NOT_FOUND')) return 'Không tìm thấy lịch hẹn.';
  if (message.includes('INVALID_APPOINTMENT_STATUS'))
    return 'Chỉ có thể mở hồ sơ khám cho BN đã check-in hoặc đang khám.';
  if (message.includes('NOT_FOUND')) return 'Không tìm thấy hồ sơ khám.';
  if (message.includes('EXAM_LOCKED')) return 'Hồ sơ đã được ký, không thể chỉnh sửa.';
  if (message.includes('ALREADY_SIGNED')) return 'Hồ sơ này đã được ký trước đó.';
  if (message.includes('NO_CONFIRMED_ICD'))
    return 'Cần ít nhất 1 chẩn đoán ICD-10 được xác nhận trước khi ký.';
  if (message.includes('PIN_NOT_SET'))
    return 'Bạn chưa thiết lập mã PIN. Vui lòng vào Cài đặt để thiết lập PIN ký duyệt.';
  if (message.includes('PIN_LOCKED')) return 'Mã PIN bị khóa do nhập sai nhiều lần. Thử lại sau 10 phút.';
  if (message.includes('PIN_FAILED_LOCKED'))
    return 'Sai PIN 3 lần. Mã PIN bị khóa 10 phút.';
  if (message.includes('PIN_INVALID')) {
    const match = message.match(/(\d+) attempts remaining/);
    const remaining = match ? match[1] : '';
    return `Mã PIN không đúng.${remaining ? ` Còn ${remaining} lần thử.` : ''}`;
  }
  if (message.includes('RESPONSIBILITY_NOT_ACKNOWLEDGED'))
    return 'Bạn phải xác nhận trách nhiệm trước khi ký.';
  if (message.includes('VALIDATION_ERROR: s_text'))
    return 'Phần Subjective (S) là bắt buộc.';
  if (message.includes('VALIDATION_ERROR: PIN must be'))
    return 'Mã PIN phải gồm đúng 6 chữ số.';
  return message;
}
