/**
 * Shared form mappers for patient and doctor pre-consultation forms
 */

import type {
  PreConsultation,
  DoctorPreConsultation,
  PreConsultationFormData,
  UpdatePreConsultationInput,
  MedicalHistoryItem,
  DrugAllergyItem,
} from '@/types/pre-consultation';
import {
  DURATION_UNIT_LABELS,
  MEDICAL_CONDITION_OPTIONS,
  SMOKING_LABELS,
  ALCOHOL_LABELS,
  EXERCISE_LABELS,
  type SymptomDurationUnit,
} from '@/types/pre-consultation';

type ClinicalRecord = PreConsultation | DoctorPreConsultation;

export function clinicalRecordToFormData(record: ClinicalRecord): PreConsultationFormData {
  return {
    chief_complaint: record.chief_complaint ?? '',
    symptom_duration: record.symptom_duration,
    symptom_duration_unit: record.symptom_duration_unit ?? 'days',
    pain_scale: record.pain_scale ?? 0,
    symptom_tags: record.symptom_tags,
    medical_history: record.medical_history,
    surgical_history: record.surgical_history ?? '',
    family_history: record.family_history,
    current_medications: record.current_medications,
    otc_supplements: record.otc_supplements ?? '',
    drug_allergies: record.drug_allergies,
    food_allergies: record.food_allergies,
    smoking: record.smoking ?? 'never',
    smoking_frequency: record.smoking_frequency ?? '',
    alcohol: record.alcohol ?? 'never',
    alcohol_frequency: record.alcohol_frequency ?? '',
    exercise: record.exercise ?? 'never',
    exercise_frequency: record.exercise_frequency ?? '',
  };
}

export function formDataToUpdateInput(data: PreConsultationFormData): UpdatePreConsultationInput {
  return {
    chief_complaint: data.chief_complaint || undefined,
    symptom_duration: data.symptom_duration ?? undefined,
    symptom_duration_unit: data.symptom_duration_unit,
    pain_scale: data.pain_scale,
    symptom_tags: data.symptom_tags,
    medical_history: data.medical_history,
    surgical_history: data.surgical_history || undefined,
    family_history: data.family_history,
    current_medications: data.current_medications,
    otc_supplements: data.otc_supplements || undefined,
    drug_allergies: data.drug_allergies,
    food_allergies: data.food_allergies,
    smoking: data.smoking,
    smoking_frequency: data.smoking_frequency || undefined,
    alcohol: data.alcohol,
    alcohol_frequency: data.alcohol_frequency || undefined,
    exercise: data.exercise,
    exercise_frequency: data.exercise_frequency || undefined,
  };
}

export function hasClinicalContent(record: ClinicalRecord | null): boolean {
  if (!record) return false;
  return Boolean(
    record.chief_complaint?.trim() ||
      record.symptom_duration ||
      record.medical_history.length > 0 ||
      record.surgical_history?.trim() ||
      record.family_history.length > 0 ||
      record.current_medications.length > 0 ||
      record.otc_supplements?.trim() ||
      record.drug_allergies.length > 0 ||
      record.food_allergies.length > 0 ||
      record.smoking ||
      record.alcohol ||
      record.exercise,
  );
}

export function formatDurationText(
  duration: number | null,
  unit: SymptomDurationUnit | null,
): string {
  if (duration == null) return 'Không rõ';
  const unitLabel = unit ? DURATION_UNIT_LABELS[unit].toLowerCase() : '';
  return `${duration} ${unitLabel}`.trim();
}

export function formatMedicalHistoryText(record: ClinicalRecord): string {
  const parts = record.medical_history.map((item) => {
    const label =
      MEDICAL_CONDITION_OPTIONS.find((o) => o.value === item.condition)?.label ??
      item.condition;
    return item.details ? `${label} (${item.details})` : label;
  });
  if (record.surgical_history?.trim()) {
    parts.push(record.surgical_history.trim());
  }
  return parts.join(', ');
}

export function parseMedicalHistoryText(text: string): MedicalHistoryItem[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return [{ condition: 'other', details: trimmed }];
}

export function formatAllergiesText(record: ClinicalRecord): string {
  const parts: string[] = [];
  for (const a of record.drug_allergies) {
    if (a.drug?.trim()) {
      parts.push(a.reaction?.trim() ? `${a.drug} → ${a.reaction}` : `Dị ứng ${a.drug}`);
    }
  }
  for (const a of record.food_allergies) {
    if (a.food?.trim()) {
      parts.push(a.reaction?.trim() ? `${a.food} → ${a.reaction}` : a.food);
    }
  }
  return parts.join(', ');
}

export function parseAllergiesText(text: string): DrugAllergyItem[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const drug = trimmed.replace(/^Dị ứng\s*/i, '').trim();
  return [{ drug, reaction: '—' }];
}

export function formatLifestyleText(record: ClinicalRecord): string {
  const parts: string[] = [];
  if (record.smoking && record.smoking !== 'never') {
    const base = SMOKING_LABELS[record.smoking];
    parts.push(record.smoking_frequency ? `${base} (${record.smoking_frequency})` : base);
  }
  if (record.alcohol && record.alcohol !== 'never') {
    const base = ALCOHOL_LABELS[record.alcohol];
    parts.push(record.alcohol_frequency ? `${base} (${record.alcohol_frequency})` : base);
  }
  if (record.exercise && record.exercise !== 'never') {
    const base = EXERCISE_LABELS[record.exercise];
    parts.push(record.exercise_frequency ? `${base} (${record.exercise_frequency})` : base);
  }
  return parts.join(', ');
}

export function parseLifestyleText(text: string): Pick<
  PreConsultationFormData,
  'smoking' | 'smoking_frequency' | 'alcohol' | 'alcohol_frequency' | 'exercise' | 'exercise_frequency'
> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      smoking: 'never',
      smoking_frequency: '',
      alcohol: 'never',
      alcohol_frequency: '',
      exercise: 'never',
      exercise_frequency: '',
    };
  }
  return {
    smoking: 'current',
    smoking_frequency: trimmed,
    alcohol: 'never',
    alcohol_frequency: '',
    exercise: 'never',
    exercise_frequency: '',
  };
}

export function compactFormToFullData(compact: {
  chief_complaint: string;
  durationText: string;
  medicalHistoryText: string;
  allergiesText: string;
  lifestyleText: string;
}, base: PreConsultationFormData): PreConsultationFormData {
  const durationMatch = compact.durationText.trim().match(/^(\d+)\s*(ngày|tuần|tháng|days|weeks|months)?/i);
  let symptom_duration: number | null = base.symptom_duration;
  let symptom_duration_unit: SymptomDurationUnit = base.symptom_duration_unit;
  if (durationMatch) {
    symptom_duration = Number(durationMatch[1]);
    const unitRaw = (durationMatch[2] ?? 'ngày').toLowerCase();
    if (unitRaw.startsWith('tuần') || unitRaw === 'weeks') symptom_duration_unit = 'weeks';
    else if (unitRaw.startsWith('tháng') || unitRaw === 'months') symptom_duration_unit = 'months';
    else symptom_duration_unit = 'days';
  }

  return {
    ...base,
    chief_complaint: compact.chief_complaint,
    symptom_duration,
    symptom_duration_unit,
    medical_history: parseMedicalHistoryText(compact.medicalHistoryText),
    surgical_history: '',
    drug_allergies: parseAllergiesText(compact.allergiesText),
    food_allergies: [],
    ...parseLifestyleText(compact.lifestyleText),
  };
}

export function fullDataToCompactForm(data: PreConsultationFormData): {
  chief_complaint: string;
  durationText: string;
  medicalHistoryText: string;
  allergiesText: string;
  lifestyleText: string;
} {
  return {
    chief_complaint: data.chief_complaint,
    durationText: formatDurationText(data.symptom_duration, data.symptom_duration_unit),
    medicalHistoryText: formatMedicalHistoryText(data as ClinicalRecord),
    allergiesText: formatAllergiesText(data as ClinicalRecord),
    lifestyleText: formatLifestyleText(data as ClinicalRecord),
  };
}
