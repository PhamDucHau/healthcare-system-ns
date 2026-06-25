import { useState, useMemo, useEffect } from "react";
import { Loader2, UserPlus, CheckCircle2, ChevronRight, Search, User } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchSpecialties } from "@/lib/appointment-api";
import {
  fetchAllPatients, adminCreateWalkin, adminInsertPatientProfile,
} from "@/lib/admin-appointment-api";
import { createAdminUser, createWalkinPatientUser, listAdminRoles } from "@/lib/admin-api";
import type { PatientSearchResult } from "@/types/admin-appointment";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (appointmentId: string) => void;
  /** When set, pre-selects specialty and optionally locks the dropdown. */
  defaultSpecialtyId?: string;
  lockSpecialty?: boolean;
  /** Provider portal uses staff walk-in patient creation (no admin roles permission). */
  portal?: "admin" | "provider";
}

type Step = "search" | "quick-create" | "book";

export default function WalkInDialog({
  open, onClose, onSuccess,
  defaultSpecialtyId, lockSpecialty = false, portal = "admin",
}: Props) {
  const [step, setStep]                     = useState<Step>("search");
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  // Quick-create form
  const [qcFirstName, setQcFirstName] = useState("");
  const [qcLastName,  setQcLastName]  = useState("");
  const [qcPhone,     setQcPhone]     = useState("");
  const [qcDob,       setQcDob]       = useState("");
  const [qcId,        setQcId]        = useState("");
  const [qcCreating,  setQcCreating]  = useState(false);

  // Book form
  const [specialtyId, setSpecialtyId] = useState("");
  const [note,        setNote]        = useState("");
  const [booking,     setBooking]     = useState(false);

  const { data: allPatients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["all-patients"],
    queryFn:  fetchAllPatients,
    enabled:  open,
    staleTime: 30_000,
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn:  fetchSpecialties,
    enabled:  open,
  });

  useEffect(() => {
    if (open && defaultSpecialtyId) {
      setSpecialtyId(defaultSpecialtyId);
    }
  }, [open, defaultSpecialtyId]);

  // Client-side filter
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allPatients;
    return allPatients.filter((p) =>
      p.patient_name?.toLowerCase().includes(q) ||
      p.phone_number?.toLowerCase().includes(q) ||
      p.id_number?.toLowerCase().includes(q)
    );
  }, [allPatients, searchQuery]);

  const handleSelectPatient = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    if (defaultSpecialtyId) setSpecialtyId(defaultSpecialtyId);
    setStep("book");
  };

  const handleQuickCreate = async () => {
    if (!qcLastName.trim() || !qcFirstName.trim()) {
      toast.error("Vui lòng nhập họ và tên.");
      return;
    }
    setQcCreating(true);
    try {
      const fullName = `${qcLastName.trim()} ${qcFirstName.trim()}`;
      let userId: string;

      if (portal === "provider") {
        const created = await createWalkinPatientUser({
          fullName,
          phone: qcPhone.trim() || undefined,
        });
        userId = created.userId;
      } else {
        const { roles } = await listAdminRoles();
        const patientRole = roles.find((r) => r.slug === "patient");
        if (!patientRole) throw new Error("Không tìm thấy role bệnh nhân.");

        const tempEmail = qcPhone.trim()
          ? `patient_${qcPhone.trim().replace(/\D/g, "")}@walkin.internal`
          : `walkin_${Date.now()}@walkin.internal`;

        const created = await createAdminUser({
          fullName,
          email: tempEmail,
          phone: qcPhone.trim() || undefined,
          roleId: patientRole.id,
        });
        userId = created.userId;
      }

      const profileId = await adminInsertPatientProfile(
        userId,
        qcFirstName.trim(),
        qcLastName.trim(),
        qcPhone.trim()  || null,
        qcDob           || null,
        qcId.trim()     || null
      );

      setSelectedPatient({
        profile_id:    profileId,
        patient_id:    userId,
        patient_name:  fullName,
        phone_number:  qcPhone.trim() || null,
        id_number:     qcId.trim()    || null,
        date_of_birth: qcDob          || null,
        submitted_at:  new Date().toISOString(),
      });
      if (defaultSpecialtyId) setSpecialtyId(defaultSpecialtyId);
      setStep("book");
      toast.success("Đã tạo hồ sơ bệnh nhân.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạo hồ sơ thất bại.");
    } finally {
      setQcCreating(false);
    }
  };

  const handleBook = async () => {
    if (!selectedPatient || !specialtyId) {
      toast.error("Vui lòng chọn chuyên khoa.");
      return;
    }
    setBooking(true);
    try {
      const apptId = await adminCreateWalkin(selectedPatient.profile_id, specialtyId, note.trim() || null);
      toast.success("Đã tạo lịch Walk-in thành công.");
      onSuccess(apptId);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạo Walk-in thất bại.");
    } finally {
      setBooking(false);
    }
  };

  const handleClose = () => {
    if (qcCreating || booking) return;
    setStep("search");
    setSearchQuery("");
    setSelectedPatient(null);
    setQcFirstName(""); setQcLastName(""); setQcPhone(""); setQcDob(""); setQcId("");
    setSpecialtyId(defaultSpecialtyId ?? ""); setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo lịch Walk-in</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("font-medium", step !== "book" ? "text-primary" : "")}>
            1. Tra cứu bệnh nhân
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className={cn("font-medium", step === "book" ? "text-primary" : "")}>
            2. Đặt lịch
          </span>
        </div>

        {/* ── Step: Search / Patient list ── */}
        {(step === "search") && (
          <div className="space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Nhập SĐT, CCCD hoặc tên bệnh nhân…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Patient list */}
            <div className="border rounded-lg overflow-hidden">
              {loadingPatients ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải danh sách bệnh nhân…
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <User className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Không tìm thấy bệnh nhân." : "Chưa có bệnh nhân nào."}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setStep("quick-create")}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Tạo hồ sơ nhanh
                  </Button>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y">
                  {filtered.map((p) => (
                    <button
                      key={p.profile_id}
                      type="button"
                      onClick={() => handleSelectPatient(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {p.patient_name?.trim().split(" ").pop()?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.patient_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {[p.phone_number, p.id_number].filter(Boolean).join(" · ") || "Không có thông tin liên hệ"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create new patient link */}
            {filtered.length > 0 && (
              <button
                type="button"
                onClick={() => setStep("quick-create")}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Bệnh nhân chưa có hồ sơ? Tạo nhanh
              </button>
            )}
          </div>
        )}

        {/* ── Step: Quick-create ── */}
        {step === "quick-create" && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep("search")} className="-ml-1">
              ← Quay lại danh sách
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Họ <span className="text-destructive">*</span></Label>
                <Input placeholder="Nguyễn" value={qcLastName} onChange={(e) => setQcLastName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tên <span className="text-destructive">*</span></Label>
                <Input placeholder="Văn A" value={qcFirstName} onChange={(e) => setQcFirstName(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Số điện thoại</Label>
                <Input placeholder="09xxxxxxxx" value={qcPhone} onChange={(e) => setQcPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Ngày sinh</Label>
                <Input type="date" value={qcDob} onChange={(e) => setQcDob(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>CCCD / CMND</Label>
              <Input placeholder="Số CCCD (tùy chọn)" value={qcId} onChange={(e) => setQcId(e.target.value)} />
            </div>
          </div>
        )}

        {/* ── Step: Book ── */}
        {step === "book" && selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">{selectedPatient.patient_name}</p>
                <p className="text-xs text-green-700">
                  {[selectedPatient.phone_number, selectedPatient.id_number].filter(Boolean).join(" · ") || "Hồ sơ mới"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-green-700 h-7 text-xs"
                onClick={() => { setSelectedPatient(null); setStep("search"); }}
              >
                Đổi
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label>Chuyên khoa <span className="text-destructive">*</span></Label>
              {lockSpecialty && defaultSpecialtyId ? (
                <p className="text-sm font-medium py-2">
                  {specialties.find((s) => s.id === defaultSpecialtyId)?.name ?? "—"}
                </p>
              ) : (
                <Select value={specialtyId} onValueChange={setSpecialtyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Lý do khám (tùy chọn)</Label>
              <Textarea
                placeholder="Nhập triệu chứng hoặc lý do đến khám…"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={qcCreating || booking}>
            Đóng
          </Button>

          {step === "quick-create" && (
            <Button
              onClick={handleQuickCreate}
              disabled={qcCreating || !qcLastName.trim() || !qcFirstName.trim()}
            >
              {qcCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo hồ sơ
            </Button>
          )}

          {step === "book" && (
            <Button onClick={handleBook} disabled={booking || !specialtyId}>
              {booking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo Walk-in
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
