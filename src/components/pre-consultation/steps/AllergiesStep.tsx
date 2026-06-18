/**
 * FR-022: Allergies Step (Nhom 4: Di ung)
 */

import { Plus, X, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import type {
  PreConsultationFormData,
  DrugAllergyItem,
  FoodAllergyItem,
} from '@/types/pre-consultation';

type Props = {
  formData: PreConsultationFormData;
  updateField: <K extends keyof PreConsultationFormData>(
    field: K,
    value: PreConsultationFormData[K]
  ) => void;
  updateFields: (updates: Partial<PreConsultationFormData>) => void;
};

export default function AllergiesStep({
  formData,
  updateField,
  updateFields,
}: Props) {
  // ─── Drug Allergies ──────────────────────────────────────────────────────────

  const addDrugAllergy = () => {
    updateField('drug_allergies', [
      ...formData.drug_allergies,
      { drug: '', reaction: '' },
    ]);
  };

  const updateDrugAllergy = (
    index: number,
    field: keyof DrugAllergyItem,
    value: string
  ) => {
    const updated = formData.drug_allergies.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateField('drug_allergies', updated);
  };

  const removeDrugAllergy = (index: number) => {
    updateField(
      'drug_allergies',
      formData.drug_allergies.filter((_, i) => i !== index)
    );
  };

  // ─── Food Allergies ──────────────────────────────────────────────────────────

  const addFoodAllergy = () => {
    updateField('food_allergies', [
      ...formData.food_allergies,
      { food: '', reaction: '' },
    ]);
  };

  const updateFoodAllergy = (
    index: number,
    field: keyof FoodAllergyItem,
    value: string
  ) => {
    const updated = formData.food_allergies.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateField('food_allergies', updated);
  };

  const removeFoodAllergy = (index: number) => {
    updateField(
      'food_allergies',
      formData.food_allergies.filter((_, i) => i !== index)
    );
  };

  const hasDrugAllergies = formData.drug_allergies.length > 0;

  return (
    <div className="space-y-8">
      {/* Important Notice */}
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Luu y quan trong:</strong> Thong tin di ung thuoc rat quan
          trong de dam bao an toan khi ke don. Vui long khai bao day du.
        </AlertDescription>
      </Alert>

      {/* Drug Allergies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              Di ung thuoc
              {hasDrugAllergies && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                  Co di ung
                </span>
              )}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Liet ke cac loai thuoc ma ban bi di ung va phan ung da xay ra
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addDrugAllergy}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Them
          </Button>
        </div>

        {formData.drug_allergies.length === 0 && (
          <div className="py-6 text-center border border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Khong co di ung thuoc da biet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nhan "Them" neu ban co di ung voi bat ky loai thuoc nao.
            </p>
          </div>
        )}

        {formData.drug_allergies.map((allergy, index) => (
          <Card
            key={index}
            className="bg-red-50/50 border-red-200"
          >
            <CardContent className="py-4">
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Ten thuoc (vd: Penicillin, Aspirin)"
                    value={allergy.drug}
                    onChange={(e) =>
                      updateDrugAllergy(index, 'drug', e.target.value)
                    }
                    className="border-red-200 focus:border-red-400"
                  />
                  <Input
                    placeholder="Phan ung (vd: Phat ban, Soc phan ve, Kho tho)"
                    value={allergy.reaction}
                    onChange={(e) =>
                      updateDrugAllergy(index, 'reaction', e.target.value)
                    }
                    className="border-red-200 focus:border-red-400"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDrugAllergy(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Food Allergies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Di ung thuc an</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Liet ke cac loai thuc an ma ban bi di ung
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addFoodAllergy}>
            <Plus className="h-4 w-4 mr-1" />
            Them
          </Button>
        </div>

        {formData.food_allergies.length === 0 && (
          <div className="py-6 text-center border border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Khong co di ung thuc an da biet.
            </p>
          </div>
        )}

        {formData.food_allergies.map((allergy, index) => (
          <Card key={index} className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Loai thuc an (vd: Hai san, Dau phong, Sua)"
                    value={allergy.food}
                    onChange={(e) =>
                      updateFoodAllergy(index, 'food', e.target.value)
                    }
                  />
                  <Input
                    placeholder="Phan ung (vd: Noi me day, Kho tho, Ngua)"
                    value={allergy.reaction}
                    onChange={(e) =>
                      updateFoodAllergy(index, 'reaction', e.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFoodAllergy(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
