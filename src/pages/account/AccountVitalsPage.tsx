import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Plus, Ruler, Scale, Thermometer } from "lucide-react";
import { toast } from "sonner";
import { addSelfVital, formatVitalDate, getMyVitalsSummary } from "@/lib/patient-vitals-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VitalCard({
  icon: Icon,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: typeof Heart;
  iconColor: string;
  label: string;
  value: string;
  sub?: string | null;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

const AccountVitalsPage = () => {
  const queryClient = useQueryClient();
  const vitalsKey = ["patient", "vitals-summary"];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [temp, setTemp] = useState("");

  const { data: summary, isLoading } = useQuery({
    queryKey: vitalsKey,
    queryFn: getMyVitalsSummary,
  });

  const addMutation = useMutation({
    mutationFn: () => addSelfVital({
      bp_systolic: bpSys ? Number(bpSys) : null,
      bp_diastolic: bpDia ? Number(bpDia) : null,
      weight_kg: weight ? Number(weight) : null,
      height_cm: height ? Number(height) : null,
      temperature_c: temp ? Number(temp) : null,
    }),
    onSuccess: () => {
      toast.success("Đã thêm chỉ số");
      setDialogOpen(false);
      setBpSys("");
      setBpDia("");
      setWeight("");
      setHeight("");
      setTemp("");
      void queryClient.invalidateQueries({ queryKey: vitalsKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bpValue = summary?.blood_pressure.systolic != null
    ? `${summary.blood_pressure.systolic}/${summary.blood_pressure.diastolic} mmHg`
    : "—";

  const bpSub = summary?.blood_pressure.status
    ? `${summary.blood_pressure.status}${summary.blood_pressure.recorded_at ? ` (${formatVitalDate(summary.blood_pressure.recorded_at)})` : ""}`
    : null;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Chỉ số sinh tồn</h2>
        <Button type="button" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm chỉ số
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <VitalCard icon={Heart} iconColor="text-primary" label="Huyết áp" value={bpValue} sub={bpSub} />
          <VitalCard
            icon={Scale}
            iconColor="text-sky-600"
            label="Cân nặng"
            value={summary?.weight.kg != null ? `${summary.weight.kg} kg` : "—"}
            sub={summary?.weight.recorded_at ? `Đo lúc: ${formatVitalDate(summary.weight.recorded_at)}` : null}
          />
          <VitalCard
            icon={Ruler}
            iconColor="text-amber-600"
            label="Chiều cao"
            value={summary?.height.cm != null ? `${summary.height.cm} cm` : "—"}
            sub={summary?.height.bmi != null ? `BMI: ${summary.height.bmi} (${summary.height.bmi_status ?? "—"})` : null}
          />
          <VitalCard
            icon={Thermometer}
            iconColor="text-emerald-600"
            label="Nhiệt độ"
            value={summary?.temperature.celsius != null ? `${summary.temperature.celsius} °C` : "—"}
            sub={summary?.temperature.recorded_at ? `Đo lúc: ${formatVitalDate(summary.temperature.recorded_at)}` : null}
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm chỉ số sinh tồn</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="bp-sys">Huyết áp tâm thu</Label>
              <Input id="bp-sys" type="number" value={bpSys} onChange={(e) => setBpSys(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-dia">Huyết áp tâm trương</Label>
              <Input id="bp-dia" type="number" value={bpDia} onChange={(e) => setBpDia(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weight">Cân nặng (kg)</Label>
              <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="height">Chiều cao (cm)</Label>
              <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="temp">Nhiệt độ (°C)</Label>
              <Input id="temp" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button type="button" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
              {addMutation.isPending ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AccountVitalsPage;
