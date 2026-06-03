import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileUser, Loader2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { mapPatientPortalRow, type PatientPortalDetail } from "@/types/patient-portal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PatientProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDob(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}

function readOnboardingDraft(): Partial<PatientPortalDetail> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("qcare_onboarding_draft");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      personal?: {
        legalFirstName?: string;
        legalLastName?: string;
        dateOfBirth?: string;
        phoneNumber?: string;
        email?: string;
        pronouns?: string;
      };
      identity?: {
        idNumber?: string;
        expirationDate?: string;
        residentialAddress?: string;
        issuedDate?: string;
        issuer?: string;
      };
      insurance?: {
        provider?: string;
        memberId?: string;
        groupNumber?: string;
      };
    };
    const p = parsed.personal;
    const i = parsed.identity;
    const ins = parsed.insurance;
    const first = p?.legalFirstName ?? "";
    const last = p?.legalLastName ?? "";
    return {
      id: "",
      user_id: "",
      legal_first_name: first || null,
      legal_last_name: last || null,
      full_name: [first, last].filter(Boolean).join(" ") || "Bệnh nhân",
      date_of_birth: p?.dateOfBirth ?? null,
      preferred_pronouns: p?.pronouns ?? null,
      email_address: p?.email ?? null,
      phone_number: p?.phoneNumber ?? null,
      id_number: i?.idNumber ?? null,
      residential_address: i?.residentialAddress ?? null,
      id_expiration_date: i?.expirationDate ?? null,
      id_issued_date: i?.issuedDate ?? null,
      id_issuer: i?.issuer ?? null,
      insurance_provider: ins?.provider ?? null,
      member_id: ins?.memberId ?? null,
      group_number: ins?.groupNumber ?? null,
      submitted_at: null,
      consent_accepted: false,
    };
  } catch {
    return null;
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

const PatientProfileDialog = ({ open, onOpenChange }: PatientProfileDialogProps) => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const sessionEmail = session?.user?.email ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["patient", "my-profile", userId],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("patient")
        .select("*")
        .eq("user_id", userId as string)
        .maybeSingle();
      if (error) throw error;
      if (!row) return null;
      return mapPatientPortalRow(row as Record<string, unknown>);
    },
    enabled: open && Boolean(userId),
  });

  const draftFallback = useMemo(() => readOnboardingDraft(), [open]);

  const profile: PatientPortalDetail | null = useMemo(() => {
    if (data) return data;
    if (draftFallback) {
      return {
        ...draftFallback,
        email_address: draftFallback.email_address || sessionEmail,
      } as PatientPortalDetail;
    }
    if (sessionEmail) {
      return {
        id: "",
        user_id: userId ?? "",
        legal_first_name: null,
        legal_last_name: null,
        full_name: sessionEmail.split("@")[0] ?? "Bệnh nhân",
        date_of_birth: null,
        preferred_pronouns: null,
        email_address: sessionEmail,
        phone_number: null,
        id_number: null,
        residential_address: null,
        id_expiration_date: null,
        id_issued_date: null,
        id_issuer: null,
        insurance_provider: null,
        member_id: null,
        group_number: null,
        submitted_at: null,
        consent_accepted: false,
      };
    }
    return null;
  }, [data, draftFallback, sessionEmail, userId]);

  const displayId = profile?.id_number?.trim() ||
    (profile?.id ? `QC-${profile.id.slice(0, 8).toUpperCase()}` : "—");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUser className="h-5 w-5 text-primary" />
            Hồ sơ bệnh nhân
          </DialogTitle>
          <DialogDescription>
            Thông tin cá nhân, giấy tờ và bảo hiểm từ onboarding.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải hồ sơ…
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive" role="alert">
            Không tải được hồ sơ. Hoàn tất onboarding hoặc thử lại sau.
          </p>
        ) : !profile ? (
          <p className="text-sm text-muted-foreground">
            Chưa có hồ sơ. Vui lòng hoàn tất{" "}
            <Link to="/onboarding" className="font-semibold text-primary hover:underline">
              onboarding
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-bold">{profile.full_name}</p>
                <p className="text-sm opacity-90">
                  ID: {displayId} · DOB: {formatDob(profile.date_of_birth)}
                </p>
                {profile.preferred_pronouns ? (
                  <p className="text-xs opacity-80">{profile.preferred_pronouns}</p>
                ) : null}
              </div>
            </div>

            {!data && draftFallback ? (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                Đang hiển thị bản nháp onboarding (chưa lưu lên hệ thống).
              </p>
            ) : null}

            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Thông tin cá nhân</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Họ tên" value={profile.full_name} />
                <Field label="Ngày sinh" value={formatDob(profile.date_of_birth)} />
                <Field label="Email" value={profile.email_address ?? ""} />
                <Field label="Số điện thoại" value={profile.phone_number ?? ""} />
                <Field label="Đại từ" value={profile.preferred_pronouns ?? ""} />
                <Field
                  label="Trạng thái hồ sơ"
                  value={profile.submitted_at ? "Đã nộp" : "Bản nháp"}
                />
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Giấy tờ tùy thân</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Số CCCD/ID" value={profile.id_number ?? ""} />
                <Field label="Nơi cấp" value={profile.id_issuer ?? ""} />
                <Field label="Ngày cấp" value={formatDob(profile.id_issued_date)} />
                <Field label="Ngày hết hạn" value={formatDob(profile.id_expiration_date)} />
                <Field label="Địa chỉ" value={profile.residential_address ?? ""} />
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Bảo hiểm (BHYT)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Nhà cung cấp" value={profile.insurance_provider ?? ""} />
                <Field label="Mã thành viên" value={profile.member_id ?? ""} />
                <Field label="Mã nhóm" value={profile.group_number ?? ""} />
              </div>
            </section>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileDialog;
