export type ExamActivityAction = 'UPDATED';

export type SoapChangedField = 's_text' | 'o_text' | 'a_text' | 'p_text';

const SOAP_FIELDS: SoapChangedField[] = ['s_text', 'o_text', 'a_text', 'p_text'];

export type ExamActivityLogEntry = {
  id: string;
  exam_id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: ExamActivityAction;
  created_at: string;
  message: string;
  changed_fields: SoapChangedField[];
};

export type DoctorExamActivityLogEntry = ExamActivityLogEntry & {
  patient_name: string | null;
  appointment_id: string | null;
};

export function formatExamUpdateActivityMessage(doctorName: string): string {
  const name = doctorName.trim();
  return name
    ? `Bác sĩ ${name} đã cập nhật nội dung hồ sơ`
    : 'Bác sĩ đã cập nhật nội dung hồ sơ';
}

export function diffSoapFormFields(
  previous: Record<SoapChangedField, string>,
  next: Record<SoapChangedField, string>,
): SoapChangedField[] {
  return SOAP_FIELDS.filter(
    (field) => (previous[field] ?? '').trim() !== (next[field] ?? '').trim(),
  );
}

export function normalizeChangedFields(values: unknown): SoapChangedField[] {
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is SoapChangedField =>
    SOAP_FIELDS.includes(value as SoapChangedField),
  );
}

export function toExamActivityLogEntry(row: {
  id: string;
  exam_id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: ExamActivityAction;
  created_at: string;
  changed_fields?: unknown;
}): ExamActivityLogEntry {
  return {
    id: row.id,
    exam_id: row.exam_id,
    actor_id: row.actor_id,
    actor_name: row.actor_name,
    action: row.action,
    created_at: row.created_at,
    message: formatExamUpdateActivityMessage(row.actor_name ?? ''),
    changed_fields: normalizeChangedFields(row.changed_fields),
  };
}
