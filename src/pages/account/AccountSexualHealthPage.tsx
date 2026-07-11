import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { fetchSexualHealth, formatStdTestDisplay, upsertSexualHealth } from "@/lib/patient-sexual-health-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AccountSexualHealthPage = () => {
  const queryClient = useQueryClient();
  const queryKey = ["patient", "sexual-health"];

  const { data, isLoading } = useQuery({ queryKey, queryFn: fetchSexualHealth });

  const [orientation, setOrientation] = useState("");
  const [sexAtBirth, setSexAtBirth] = useState("");
  const [prepStatus, setPrepStatus] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testResult, setTestResult] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!data) return;
    setOrientation(data.sexual_orientation ?? "");
    setSexAtBirth(data.sex_at_birth ?? "");
    setPrepStatus(data.prep_pep_status ?? "");
    setTestDate(data.last_std_test_date ?? "");
    setTestResult(data.last_std_test_result ?? "");
    setNotes(data.notes_for_doctor ?? "");
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => upsertSexualHealth({
      sexual_orientation: orientation || null,
      sex_at_birth: sexAtBirth || null,
      prep_pep_status: prepStatus || null,
      last_std_test_date: testDate || null,
      last_std_test_result: testResult || null,
      notes_for_doctor: notes || null,
    }),
    onSuccess: () => {
      toast.success("Đã lưu thông tin");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hasData = Boolean(data?.sexual_orientation || data?.prep_pep_status || data?.notes_for_doctor);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Sức khỏe Tình dục & Sinh sản</h2>
        <div className="flex items-center gap-2 text-sm text-primary">
          <Lock className="h-4 w-4" />
          Thông tin được bảo mật
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/10 p-4 md:p-6 space-y-4">
          {!hasData && !orientation && !prepStatus ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu. Bạn có thể cập nhật thông tin bên dưới.</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <Label htmlFor="orientation">Khuynh hướng tình dục</Label>
              <Input id="orientation" className="mt-2" value={orientation} onChange={(e) => setOrientation(e.target.value)} placeholder="—" />
            </div>
            <div className="rounded-lg border bg-card p-4">
              <Label htmlFor="sex-at-birth">Giới tính khi sinh</Label>
              <Input id="sex-at-birth" className="mt-2" value={sexAtBirth} onChange={(e) => setSexAtBirth(e.target.value)} />
            </div>
            <div className="rounded-lg border bg-card p-4">
              <Label htmlFor="prep">Sử dụng PrEP/PEP</Label>
              <Input id="prep" className="mt-2" value={prepStatus} onChange={(e) => setPrepStatus(e.target.value)} placeholder="Đang sử dụng PrEP (Hàng ngày)" />
            </div>
            <div className="rounded-lg border bg-card p-4">
              <Label>Lần xét nghiệm STDs gần nhất</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
                <Input value={testResult} onChange={(e) => setTestResult(e.target.value)} placeholder="Âm tính" />
              </div>
              {data ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Hiện tại: {formatStdTestDisplay(data.last_std_test_date, data.last_std_test_result)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <Label htmlFor="doctor-notes">Ghi chú cho bác sĩ</Label>
            <textarea
              id="doctor-notes"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Đang lưu…" : "Lưu thông tin"}
          </Button>
        </div>
      )}
    </section>
  );
};

export default AccountSexualHealthPage;
