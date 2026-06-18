/**
 * FR-022: Current Symptoms Step (Nhom 1: Trieu chung hien tai)
 */

import { AlertCircle, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

import type { PreConsultationFormData } from '@/types/pre-consultation';
import {
  SYMPTOM_TAG_OPTIONS,
  DURATION_UNIT_LABELS,
  type SymptomDurationUnit,
} from '@/types/pre-consultation';

type Props = {
  formData: PreConsultationFormData;
  updateField: <K extends keyof PreConsultationFormData>(
    field: K,
    value: PreConsultationFormData[K]
  ) => void;
  validationErrors: Partial<Record<keyof PreConsultationFormData, string>>;
};

export default function SymptomsStep({
  formData,
  updateField,
  validationErrors,
}: Props) {
  const toggleSymptomTag = (tag: string) => {
    const current = formData.symptom_tags;
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateField('symptom_tags', updated);
  };

  const painScaleLabel = (value: number) => {
    if (value === 0) return 'Khong dau';
    if (value <= 3) return 'Dau nhe';
    if (value <= 6) return 'Dau vua';
    return 'Du doi';
  };

  const painScaleColor = (value: number) => {
    if (value === 0) return 'text-green-600';
    if (value <= 3) return 'text-yellow-600';
    if (value <= 6) return 'text-orange-500';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Important Notice */}
      <Alert className="bg-amber-50 border-amber-200">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Ghi chu quan trong:</strong> Neu ban cam thay kho tho du doi
          hoac dau that nguc lan ra canh tay trai, vui long goi cap cuu ngay lap
          tuc.
        </AlertDescription>
      </Alert>

      {/* Chief Complaint */}
      <div className="space-y-2">
        <Label htmlFor="chief_complaint" className="flex items-center gap-1">
          Ly do ban den kham lan nay? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="chief_complaint"
          placeholder="Vi du: Dau nguc trai, hoi hop 3 ngay"
          value={formData.chief_complaint}
          onChange={(e) => updateField('chief_complaint', e.target.value)}
          rows={3}
          className={validationErrors.chief_complaint ? 'border-red-500' : ''}
        />
        {validationErrors.chief_complaint && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {validationErrors.chief_complaint}
          </p>
        )}
      </div>

      {/* Symptom Duration */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Trieu chung keo dai bao lau? <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="So luong"
            value={formData.symptom_duration ?? ''}
            onChange={(e) =>
              updateField(
                'symptom_duration',
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            min={1}
            className={`w-24 ${validationErrors.symptom_duration ? 'border-red-500' : ''}`}
          />
          <Select
            value={formData.symptom_duration_unit}
            onValueChange={(v) =>
              updateField('symptom_duration_unit', v as SymptomDurationUnit)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(DURATION_UNIT_LABELS) as [
                  SymptomDurationUnit,
                  string,
                ][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {validationErrors.symptom_duration && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {validationErrors.symptom_duration}
          </p>
        )}
      </div>

      {/* Pain Scale */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Muc do dau (0-10):</Label>
          <span className={`text-2xl font-bold ${painScaleColor(formData.pain_scale)}`}>
            {formData.pain_scale}/10
          </span>
        </div>
        <Slider
          value={[formData.pain_scale]}
          onValueChange={([value]) => updateField('pain_scale', value)}
          min={0}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Khong dau</span>
          <span>Dau vua</span>
          <span>Du doi</span>
        </div>
        {formData.pain_scale >= 7 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Muc do dau cao. Thong tin nay se duoc bao cao cho doi ngu y te de
              ho tro ban som hon.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Symptom Tags */}
      <div className="space-y-3">
        <Label>Trieu chung di kem (chon nhieu):</Label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_TAG_OPTIONS.map(({ value, label }) => {
            const isSelected = formData.symptom_tags.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleSymptomTag(value)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                {isSelected && (
                  <span className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
