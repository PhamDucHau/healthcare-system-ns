/**
 * FR-022: Medications Step (Nhom 3: Thuoc dang dung)
 */

import { Plus, X, Pill } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type {
  PreConsultationFormData,
  MedicationItem,
} from '@/types/pre-consultation';

type Props = {
  formData: PreConsultationFormData;
  updateField: <K extends keyof PreConsultationFormData>(
    field: K,
    value: PreConsultationFormData[K]
  ) => void;
  updateFields: (updates: Partial<PreConsultationFormData>) => void;
};

export default function MedicationsStep({
  formData,
  updateField,
  updateFields,
}: Props) {
  // ─── Current Medications ─────────────────────────────────────────────────────

  const addMedication = () => {
    updateField('current_medications', [
      ...formData.current_medications,
      { name: '', dose: '', frequency: '' },
    ]);
  };

  const updateMedication = (
    index: number,
    field: keyof MedicationItem,
    value: string
  ) => {
    const updated = formData.current_medications.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateField('current_medications', updated);
  };

  const removeMedication = (index: number) => {
    updateField(
      'current_medications',
      formData.current_medications.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-8">
      {/* Current Medications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Thuoc ban dang su dung
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Liet ke tat ca cac loai thuoc ban dang dung, bao gom thuoc ke don
              va khong ke don
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addMedication}>
            <Plus className="h-4 w-4 mr-1" />
            Them thuoc
          </Button>
        </div>

        {formData.current_medications.length === 0 && (
          <div className="py-8 text-center border border-dashed rounded-lg">
            <Pill className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Chua co thuoc nao duoc them.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nhan "Them thuoc" de bat dau liet ke.
            </p>
          </div>
        )}

        {formData.current_medications.map((med, index) => (
          <Card key={index} className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Ten thuoc (vd: Amlodipine)"
                    value={med.name}
                    onChange={(e) =>
                      updateMedication(index, 'name', e.target.value)
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Lieu luong (vd: 5mg)"
                      value={med.dose}
                      onChange={(e) =>
                        updateMedication(index, 'dose', e.target.value)
                      }
                    />
                    <Input
                      placeholder="Tan suat (vd: 1 vien/ngay)"
                      value={med.frequency}
                      onChange={(e) =>
                        updateMedication(index, 'frequency', e.target.value)
                      }
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedication(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Common medications quick add */}
        {formData.current_medications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addMedication}
            className="w-full border border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Them thuoc khac
          </Button>
        )}
      </div>

      {/* OTC Supplements */}
      <div className="space-y-2">
        <Label htmlFor="otc_supplements">
          Thuc pham chuc nang va vitamin
        </Label>
        <p className="text-sm text-muted-foreground">
          Liet ke cac loai vitamin, thuc pham bo sung, thao duoc ma ban dang su
          dung
        </p>
        <Textarea
          id="otc_supplements"
          placeholder="Vd: Vitamin D 1000IU/ngay, Omega-3, Canxi..."
          value={formData.otc_supplements}
          onChange={(e) => updateField('otc_supplements', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
