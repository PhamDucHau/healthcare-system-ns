/**
 * FR-022: Lifestyle Step (Nhom 5: Loi song)
 */

import { Cigarette, Wine, Dumbbell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { PreConsultationFormData } from '@/types/pre-consultation';
import {
  SMOKING_LABELS,
  ALCOHOL_LABELS,
  EXERCISE_LABELS,
  type SmokingStatus,
  type AlcoholStatus,
  type ExerciseStatus,
} from '@/types/pre-consultation';

type Props = {
  formData: PreConsultationFormData;
  updateField: <K extends keyof PreConsultationFormData>(
    field: K,
    value: PreConsultationFormData[K]
  ) => void;
};

export default function LifestyleStep({ formData, updateField }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Thong tin ve loi song giup bac si danh gia tong quan suc khoe cua ban
          va dua ra loi khuyen phu hop.
        </p>
      </div>

      {/* Smoking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cigarette className="h-5 w-5 text-muted-foreground" />
            Hut thuoc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.smoking}
            onValueChange={(v) => updateField('smoking', v as SmokingStatus)}
            className="flex flex-wrap gap-4"
          >
            {(Object.entries(SMOKING_LABELS) as [SmokingStatus, string][]).map(
              ([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`smoking-${value}`} />
                  <Label
                    htmlFor={`smoking-${value}`}
                    className="cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              )
            )}
          </RadioGroup>

          {formData.smoking === 'current' && (
            <Input
              placeholder="Tan suat (vd: 10 dieu/ngay)"
              value={formData.smoking_frequency}
              onChange={(e) =>
                updateField('smoking_frequency', e.target.value)
              }
              className="mt-2"
            />
          )}

          {formData.smoking === 'former' && (
            <Input
              placeholder="Da bo khi nao? (vd: 2 nam truoc)"
              value={formData.smoking_frequency}
              onChange={(e) =>
                updateField('smoking_frequency', e.target.value)
              }
              className="mt-2"
            />
          )}
        </CardContent>
      </Card>

      {/* Alcohol */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wine className="h-5 w-5 text-muted-foreground" />
            Ruou bia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.alcohol}
            onValueChange={(v) => updateField('alcohol', v as AlcoholStatus)}
            className="flex flex-wrap gap-4"
          >
            {(Object.entries(ALCOHOL_LABELS) as [AlcoholStatus, string][]).map(
              ([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`alcohol-${value}`} />
                  <Label
                    htmlFor={`alcohol-${value}`}
                    className="cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              )
            )}
          </RadioGroup>

          {(formData.alcohol === 'occasionally' ||
            formData.alcohol === 'regularly') && (
            <Input
              placeholder="Tan suat (vd: 2-3 lan/tuan, 1 chai bia/ngay)"
              value={formData.alcohol_frequency}
              onChange={(e) =>
                updateField('alcohol_frequency', e.target.value)
              }
              className="mt-2"
            />
          )}
        </CardContent>
      </Card>

      {/* Exercise */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            Van dong/Tap the duc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.exercise}
            onValueChange={(v) => updateField('exercise', v as ExerciseStatus)}
            className="flex flex-wrap gap-4"
          >
            {(Object.entries(EXERCISE_LABELS) as [ExerciseStatus, string][]).map(
              ([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`exercise-${value}`} />
                  <Label
                    htmlFor={`exercise-${value}`}
                    className="cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              )
            )}
          </RadioGroup>

          {(formData.exercise === 'occasionally' ||
            formData.exercise === 'regularly') && (
            <Input
              placeholder="Chi tiet (vd: 30 phut/ngay, 3 lan/tuan)"
              value={formData.exercise_frequency}
              onChange={(e) =>
                updateField('exercise_frequency', e.target.value)
              }
              className="mt-2"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
