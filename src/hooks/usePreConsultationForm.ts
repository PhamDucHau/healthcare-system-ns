/**
 * FR-022: Pre-Consultation Form Hook
 * Manages form state with auto-save functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  createPreConsultation,
  getPreConsultationByAppointment,
  updatePreConsultation,
  submitPreConsultation,
} from '@/lib/pre-consultation-api';
import type {
  PreConsultation,
  PreConsultationFormData,
  PreConsultationStep,
  UpdatePreConsultationInput,
  SubmitPreConsultationResult,
} from '@/types/pre-consultation';
import {
  DEFAULT_FORM_DATA,
  PRE_CONSULTATION_STEPS,
  validatePreConsultation,
  isFormValid,
} from '@/types/pre-consultation';

// Auto-save debounce delay (2 seconds as per spec)
const AUTO_SAVE_DELAY = 2000;

export type UsePreConsultationFormReturn = {
  // Data
  formData: PreConsultationFormData;
  preConsultationId: string | null;
  isSubmitted: boolean;
  appointmentInfo: {
    date: string;
    time: string;
    specialty: string;
    doctor: string;
  } | null;

  // Step navigation
  currentStep: PreConsultationStep;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  setCurrentStep: (step: PreConsultationStep) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;

  // Form operations
  updateField: <K extends keyof PreConsultationFormData>(
    field: K,
    value: PreConsultationFormData[K]
  ) => void;
  updateFields: (updates: Partial<PreConsultationFormData>) => void;

  // Actions
  saveDraft: () => Promise<void>;
  submit: () => Promise<SubmitPreConsultationResult | null>;

  // Status
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  error: string | null;
  validationErrors: Partial<Record<keyof PreConsultationFormData, string>>;
};

export function usePreConsultationForm(
  appointmentId: string
): UsePreConsultationFormReturn {
  // ─── State ───────────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<PreConsultationFormData>(DEFAULT_FORM_DATA);
  const [preConsultationId, setPreConsultationId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState<PreConsultationStep>('symptoms');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof PreConsultationFormData, string>>
  >({});

  // For auto-save debouncing
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChanges = useRef<UpdatePreConsultationInput>({});
  const isInitialized = useRef(false);

  // ─── Initialize ──────────────────────────────────────────────────────────────

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setError(null);

      try {
        // Try to get existing pre-consultation
        let existing = await getPreConsultationByAppointment(appointmentId);

        if (!existing) {
          // Create a new draft
          const newId = await createPreConsultation(appointmentId);
          existing = await getPreConsultationByAppointment(appointmentId);
          setPreConsultationId(newId);
        } else {
          setPreConsultationId(existing.id);
        }

        if (existing) {
          // Populate form data from existing record
          setFormData(preConsultationToFormData(existing));
          setIsSubmitted(existing.status === 'SUBMITTED');
        }

        isInitialized.current = true;
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    initialize();

    // Cleanup auto-save timer on unmount
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [appointmentId]);

  // ─── Auto-Save Logic ─────────────────────────────────────────────────────────

  const triggerAutoSave = useCallback(() => {
    if (!preConsultationId || isSubmitted || !isInitialized.current) return;

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timer
    autoSaveTimer.current = setTimeout(async () => {
      if (Object.keys(pendingChanges.current).length === 0) return;

      setSaving(true);
      try {
        await updatePreConsultation(preConsultationId, pendingChanges.current);
        pendingChanges.current = {};
      } catch (e) {
        console.error('Auto-save failed:', e);
        // Don't show error toast for auto-save failures
      } finally {
        setSaving(false);
      }
    }, AUTO_SAVE_DELAY);
  }, [preConsultationId, isSubmitted]);

  // ─── Update Field ────────────────────────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof PreConsultationFormData>(
      field: K,
      value: PreConsultationFormData[K]
    ) => {
      if (isSubmitted) return;

      setFormData((prev) => ({ ...prev, [field]: value }));

      // Queue for auto-save
      pendingChanges.current = {
        ...pendingChanges.current,
        [field]: value,
      } as UpdatePreConsultationInput;

      triggerAutoSave();

      // Clear validation error for this field
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    },
    [isSubmitted, triggerAutoSave]
  );

  const updateFields = useCallback(
    (updates: Partial<PreConsultationFormData>) => {
      if (isSubmitted) return;

      setFormData((prev) => ({ ...prev, ...updates }));

      // Queue for auto-save
      pendingChanges.current = {
        ...pendingChanges.current,
        ...updates,
      } as UpdatePreConsultationInput;

      triggerAutoSave();
    },
    [isSubmitted, triggerAutoSave]
  );

  // ─── Manual Save Draft ───────────────────────────────────────────────────────

  const saveDraft = useCallback(async () => {
    if (!preConsultationId || isSubmitted) return;

    // Clear auto-save timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    setSaving(true);
    try {
      // Save all current form data
      await updatePreConsultation(preConsultationId, formDataToInput(formData));
      pendingChanges.current = {};
      toast.success('Đã lưu nháp');
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [preConsultationId, isSubmitted, formData]);

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const submit = useCallback(async (): Promise<SubmitPreConsultationResult | null> => {
    if (!preConsultationId || isSubmitted) return null;

    // Validate
    const errors = validatePreConsultation(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return null;
    }

    setSubmitting(true);
    try {
      // First save any pending changes
      if (Object.keys(pendingChanges.current).length > 0) {
        await updatePreConsultation(preConsultationId, pendingChanges.current);
        pendingChanges.current = {};
      }

      // Then submit
      const result = await submitPreConsultation(preConsultationId);
      setIsSubmitted(true);
      toast.success('Đã gửi phiếu khai báo thành công!');

      // Show warning if flags were set
      if (result.flags.drug_allergy) {
        toast.info('Thông tin dị ứng thuốc đã được ghi nhận để bác sĩ lưu ý.');
      }
      if (result.flags.severe_pain) {
        toast.info('Mức độ đau của bạn sẽ được thông báo cho đội ngũ y tế.');
      }

      return result;
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [preConsultationId, isSubmitted, formData]);

  // ─── Step Navigation ─────────────────────────────────────────────────────────

  const currentStepIndex = PRE_CONSULTATION_STEPS.indexOf(currentStep);
  const totalSteps = PRE_CONSULTATION_STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const canGoNext = currentStepIndex < totalSteps - 1;
  const canGoPrev = currentStepIndex > 0;

  const goToNextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStep(PRE_CONSULTATION_STEPS[currentStepIndex + 1]);
    }
  }, [canGoNext, currentStepIndex]);

  const goToPrevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStep(PRE_CONSULTATION_STEPS[currentStepIndex - 1]);
    }
  }, [canGoPrev, currentStepIndex]);

  // ─── Return ──────────────────────────────────────────────────────────────────

  return {
    formData,
    preConsultationId,
    isSubmitted,
    appointmentInfo: null, // Will be populated from parent component

    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    setCurrentStep,
    goToNextStep,
    goToPrevStep,
    canGoNext,
    canGoPrev,

    updateField,
    updateFields,

    saveDraft,
    submit,

    loading,
    saving,
    submitting,
    error,
    validationErrors,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function preConsultationToFormData(pc: PreConsultation): PreConsultationFormData {
  return {
    chief_complaint: pc.chief_complaint ?? '',
    symptom_duration: pc.symptom_duration,
    symptom_duration_unit: pc.symptom_duration_unit ?? 'days',
    pain_scale: pc.pain_scale ?? 0,
    symptom_tags: pc.symptom_tags,
    medical_history: pc.medical_history,
    surgical_history: pc.surgical_history ?? '',
    family_history: pc.family_history,
    current_medications: pc.current_medications,
    otc_supplements: pc.otc_supplements ?? '',
    drug_allergies: pc.drug_allergies,
    food_allergies: pc.food_allergies,
    smoking: pc.smoking ?? 'never',
    smoking_frequency: pc.smoking_frequency ?? '',
    alcohol: pc.alcohol ?? 'never',
    alcohol_frequency: pc.alcohol_frequency ?? '',
    exercise: pc.exercise ?? 'never',
    exercise_frequency: pc.exercise_frequency ?? '',
  };
}

function formDataToInput(data: PreConsultationFormData): UpdatePreConsultationInput {
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

export { isFormValid, validatePreConsultation };
