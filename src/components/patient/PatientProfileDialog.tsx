import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, FileUser, Loader2, Pencil, UploadCloud, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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

type EditData = {
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  pronouns: string;
  idNumber: string;
  idIssuer: string;
  idIssuedDate: string;
  idExpirationDate: string;
  residentialAddress: string;
  insuranceProvider: string;
  memberId: string;
  groupNumber: string;
};

type EditFiles = {
  idFile: File | null;
  idBackFile: File | null;
  cardFile: File | null;
};

const emptyEditFiles: EditFiles = { idFile: null, idBackFile: null, cardFile: null };

function sanitizeStorageSegment(fileName: string): string {
  const ascii = fileName.trim().replace(/[^\w.\-]+/g, "_");
  return ascii.slice(0, 120) || "file";
}

function profileToEditData(p: PatientPortalDetail): EditData {
  return {
    legalFirstName: p.legal_first_name ?? "",
    legalLastName: p.legal_last_name ?? "",
    dateOfBirth: p.date_of_birth ?? "",
    phoneNumber: p.phone_number ?? "",
    email: p.email_address ?? "",
    pronouns: p.preferred_pronouns ?? "",
    idNumber: p.id_number ?? "",
    idIssuer: p.id_issuer ?? "",
    idIssuedDate: p.id_issued_date ?? "",
    idExpirationDate: p.id_expiration_date ?? "",
    residentialAddress: p.residential_address ?? "",
    insuranceProvider: p.insurance_provider ?? "",
    memberId: p.member_id ?? "",
    groupNumber: p.group_number ?? "",
  };
}

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

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full bg-transparent text-sm font-medium text-foreground outline-none"
      />
    </div>
  );
}

function DocPreview({ url, label, storagePath }: { url: string; label: string; storagePath: string | null }) {
  const isPdf = (storagePath ?? "").toLowerCase().endsWith(".pdf");
  return (
    <div className="overflow-hidden rounded-lg border">
      <p className="bg-muted/30 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-32 items-center justify-center gap-2 bg-muted/20 text-sm font-medium text-primary hover:underline"
        >
          <FileText className="h-5 w-5" />
          Xem PDF
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={label} className="h-32 w-full object-cover transition-opacity hover:opacity-90" />
        </a>
      )}
    </div>
  );
}

function EditableDocPreview({
  inputId,
  label,
  existingUrl,
  existingPath,
  newFile,
  onFileSelect,
}: {
  inputId: string;
  label: string;
  existingUrl: string | null;
  existingPath: string | null;
  newFile: File | null;
  onFileSelect: (f: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!newFile || !newFile.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(newFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newFile]);

  const showExistingPdf =
    !newFile && existingUrl && (existingPath ?? "").toLowerCase().endsWith(".pdf");
  const showNewPdf = newFile && !newFile.type.startsWith("image/");
  const displayImageUrl = previewUrl || (!newFile ? existingUrl : null);

  return (
    <div className="overflow-hidden rounded-lg border border-primary/30">
      <p className="bg-primary/5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <div className="relative">
        {showExistingPdf || showNewPdf ? (
          <div className="flex h-32 items-center justify-center gap-2 bg-muted/20 text-sm text-muted-foreground">
            <FileText className="h-6 w-6" />
            {newFile ? newFile.name : "PDF"}
          </div>
        ) : displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={label}
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="flex h-32 flex-col items-center justify-center gap-1 bg-muted/20 text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
            <span className="text-xs">Chưa có ảnh</span>
          </div>
        )}

        {/* Hover overlay to trigger upload */}
        <label
          htmlFor={inputId}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/30"
        >
          <span className="rounded-lg bg-white/0 px-3 py-1.5 text-xs font-semibold text-transparent transition-all hover:bg-white/90 hover:text-foreground group-hover:text-foreground">
            Thay ảnh
          </span>
        </label>
        <label
          htmlFor={inputId}
          className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-foreground shadow hover:bg-white"
        >
          <UploadCloud className="h-3 w-3" />
          Thay ảnh
        </label>
        <input
          id={inputId}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="sr-only"
          onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
        />
      </div>

      {newFile ? (
        <p className="truncate bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
          ✓ {newFile.name}
        </p>
      ) : null}
    </div>
  );
}

const PatientProfileDialog = ({ open, onOpenChange }: PatientProfileDialogProps) => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const sessionEmail = session?.user?.email ?? "";
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [editFiles, setEditFiles] = useState<EditFiles>(emptyEditFiles);

  const { data: queryResult, isLoading, isError } = useQuery({
    queryKey: ["patient", "my-profile", userId],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("patient")
        .select("*")
        .eq("user_id", userId as string)
        .maybeSingle();
      if (error) throw error;
      if (!row) return null;

      const profile = mapPatientPortalRow(row as Record<string, unknown>);
      const idPath = profile.id_document_storage_path;
      const idBackPath = profile.id_document_back_storage_path;
      const cardPath = profile.card_front_storage_path;

      const [idResult, idBackResult, cardResult] = await Promise.all([
        idPath ? supabase.storage.from("identity-documents").createSignedUrl(idPath, 3600) : null,
        idBackPath ? supabase.storage.from("identity-documents").createSignedUrl(idBackPath, 3600) : null,
        cardPath ? supabase.storage.from("insurance-cards").createSignedUrl(cardPath, 3600) : null,
      ]);

      return {
        profile,
        idImageUrl: idResult?.data?.signedUrl ?? null,
        idBackImageUrl: idBackResult?.data?.signedUrl ?? null,
        cardImageUrl: cardResult?.data?.signedUrl ?? null,
      };
    },
    enabled: open && Boolean(userId),
  });

  const data = queryResult?.profile ?? null;
  const idImageUrl = queryResult?.idImageUrl ?? null;
  const idBackImageUrl = queryResult?.idBackImageUrl ?? null;
  const cardImageUrl = queryResult?.cardImageUrl ?? null;

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

  const displayId =
    profile?.id_number?.trim() ||
    (profile?.id ? `QC-${profile.id.slice(0, 8).toUpperCase()}` : "—");

  const set = (field: keyof EditData) => (value: string) =>
    setEditData((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handleStartEdit = () => {
    if (!data) return;
    setEditData(profileToEditData(data));
    setEditFiles(emptyEditFiles);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setEditFiles(emptyEditFiles);
  };

  const handleSave = async () => {
    if (!userId || !editData) return;
    setIsSaving(true);

    // Upload any new images first
    const ts = Date.now();
    const newPaths: {
      id_document_storage_path?: string;
      id_document_back_storage_path?: string;
      card_front_storage_path?: string;
    } = {};

    const fileUploads: { file: File; bucket: string; path: string; key: keyof typeof newPaths }[] = [];
    if (editFiles.idFile) {
      fileUploads.push({
        file: editFiles.idFile,
        bucket: "identity-documents",
        path: `${userId}/id_front_${ts}_${sanitizeStorageSegment(editFiles.idFile.name)}`,
        key: "id_document_storage_path",
      });
    }
    if (editFiles.idBackFile) {
      fileUploads.push({
        file: editFiles.idBackFile,
        bucket: "identity-documents",
        path: `${userId}/id_back_${ts}_${sanitizeStorageSegment(editFiles.idBackFile.name)}`,
        key: "id_document_back_storage_path",
      });
    }
    if (editFiles.cardFile) {
      fileUploads.push({
        file: editFiles.cardFile,
        bucket: "insurance-cards",
        path: `${userId}/card_front_${ts}_${sanitizeStorageSegment(editFiles.cardFile.name)}`,
        key: "card_front_storage_path",
      });
    }

    if (fileUploads.length > 0) {
      const results = await Promise.all(
        fileUploads.map(({ file, bucket, path }) =>
          supabase.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: "3600" }),
        ),
      );
      const uploadErr = results.find((r) => r.error)?.error;
      if (uploadErr) {
        toast.error("Upload ảnh thất bại", { description: uploadErr.message });
        setIsSaving(false);
        return;
      }
      fileUploads.forEach(({ key, path }) => {
        newPaths[key] = path;
      });
    }

    const { error } = await supabase.from("patient").upsert(
      {
        user_id: userId,
        legal_first_name: editData.legalFirstName || null,
        legal_last_name: editData.legalLastName || null,
        date_of_birth: editData.dateOfBirth || null,
        phone_number: editData.phoneNumber || null,
        email_address: editData.email || null,
        preferred_pronouns: editData.pronouns || null,
        id_number: editData.idNumber || null,
        id_issuer: editData.idIssuer || null,
        id_issued_date: editData.idIssuedDate || null,
        id_expiration_date: editData.idExpirationDate || null,
        residential_address: editData.residentialAddress || null,
        insurance_provider: editData.insuranceProvider || null,
        member_id: editData.memberId || null,
        group_number: editData.groupNumber || null,
        ...newPaths,
      },
      { onConflict: "user_id" },
    );

    setIsSaving(false);
    if (error) {
      toast.error("Lưu thất bại", { description: error.message });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["patient", "my-profile", userId] });
    await queryClient.invalidateQueries({ queryKey: ["patient", "has-profile", userId] });
    setIsEditing(false);
    setEditData(null);
    setEditFiles(emptyEditFiles);
    toast.success("Đã lưu hồ sơ");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isSaving) {
          handleCancelEdit();
          onOpenChange(v);
        }
      }}
    >
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
            {/* Header banner */}
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {isEditing && editData
                    ? [editData.legalFirstName, editData.legalLastName].filter(Boolean).join(" ") ||
                      "Bệnh nhân"
                    : profile.full_name}
                </p>
                <p className="text-sm opacity-90">
                  ID: {displayId} · DOB:{" "}
                  {isEditing && editData
                    ? formatDob(editData.dateOfBirth)
                    : formatDob(profile.date_of_birth)}
                </p>
                {(isEditing ? editData?.pronouns : profile.preferred_pronouns) ? (
                  <p className="text-xs opacity-80">
                    {isEditing ? editData?.pronouns : profile.preferred_pronouns}
                  </p>
                ) : null}
              </div>
            </div>

            {!data && draftFallback ? (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                Đang hiển thị bản nháp onboarding (chưa lưu lên hệ thống).
              </p>
            ) : null}

            {/* Thông tin cá nhân */}
            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Thông tin cá nhân</h3>
              {isEditing && editData ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <EditField label="Họ" value={editData.legalLastName} onChange={set("legalLastName")} />
                  <EditField label="Tên" value={editData.legalFirstName} onChange={set("legalFirstName")} />
                  <EditField label="Ngày sinh" value={editData.dateOfBirth} onChange={set("dateOfBirth")} type="date" />
                  <EditField label="Số điện thoại" value={editData.phoneNumber} onChange={set("phoneNumber")} type="tel" />
                  <EditField label="Email" value={editData.email} onChange={set("email")} type="email" />
                  <EditField label="Đại từ" value={editData.pronouns} onChange={set("pronouns")} />
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Họ tên" value={profile.full_name} />
                  <Field label="Ngày sinh" value={formatDob(profile.date_of_birth)} />
                  <Field label="Email" value={profile.email_address ?? ""} />
                  <Field label="Số điện thoại" value={profile.phone_number ?? ""} />
                  <Field label="Đại từ" value={profile.preferred_pronouns ?? ""} />
                  <Field label="Trạng thái hồ sơ" value={profile.submitted_at ? "Đã nộp" : "Bản nháp"} />
                </div>
              )}
            </section>

            {/* Giấy tờ tùy thân */}
            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Giấy tờ tùy thân</h3>
              {isEditing && editData ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <EditField label="Số CCCD/ID" value={editData.idNumber} onChange={set("idNumber")} />
                  <EditField label="Nơi cấp" value={editData.idIssuer} onChange={set("idIssuer")} />
                  <EditField label="Ngày cấp" value={editData.idIssuedDate} onChange={set("idIssuedDate")} type="date" />
                  <EditField label="Ngày hết hạn" value={editData.idExpirationDate} onChange={set("idExpirationDate")} type="date" />
                  <div className="sm:col-span-2">
                    <EditField label="Địa chỉ" value={editData.residentialAddress} onChange={set("residentialAddress")} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Số CCCD/ID" value={profile.id_number ?? ""} />
                  <Field label="Nơi cấp" value={profile.id_issuer ?? ""} />
                  <Field label="Ngày cấp" value={formatDob(profile.id_issued_date)} />
                  <Field label="Ngày hết hạn" value={formatDob(profile.id_expiration_date)} />
                  <Field label="Địa chỉ" value={profile.residential_address ?? ""} />
                </div>
              )}
            </section>

            {/* Ảnh giấy tờ */}
            {isEditing ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Ảnh giấy tờ đã tải lên</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Hover vào ảnh và nhấn <strong>Thay ảnh</strong> để cập nhật.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <EditableDocPreview
                    inputId="edit-id-front"
                    label="CCCD mặt trước"
                    existingUrl={idImageUrl}
                    existingPath={profile.id_document_storage_path}
                    newFile={editFiles.idFile}
                    onFileSelect={(f) => setEditFiles((prev) => ({ ...prev, idFile: f }))}
                  />
                  <EditableDocPreview
                    inputId="edit-id-back"
                    label="CCCD mặt sau"
                    existingUrl={idBackImageUrl}
                    existingPath={profile.id_document_back_storage_path}
                    newFile={editFiles.idBackFile}
                    onFileSelect={(f) => setEditFiles((prev) => ({ ...prev, idBackFile: f }))}
                  />
                  <EditableDocPreview
                    inputId="edit-card-front"
                    label="Thẻ BHYT"
                    existingUrl={cardImageUrl}
                    existingPath={profile.card_front_storage_path}
                    newFile={editFiles.cardFile}
                    onFileSelect={(f) => setEditFiles((prev) => ({ ...prev, cardFile: f }))}
                  />
                </div>
              </section>
            ) : (idImageUrl || idBackImageUrl || cardImageUrl) ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Ảnh giấy tờ đã tải lên</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {idImageUrl ? (
                    <DocPreview url={idImageUrl} label="CCCD mặt trước" storagePath={profile.id_document_storage_path} />
                  ) : null}
                  {idBackImageUrl ? (
                    <DocPreview url={idBackImageUrl} label="CCCD mặt sau" storagePath={profile.id_document_back_storage_path} />
                  ) : null}
                  {cardImageUrl ? (
                    <DocPreview url={cardImageUrl} label="Thẻ BHYT" storagePath={profile.card_front_storage_path} />
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Bảo hiểm */}
            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Bảo hiểm (BHYT)</h3>
              {isEditing && editData ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <EditField label="Nhà cung cấp" value={editData.insuranceProvider} onChange={set("insuranceProvider")} />
                  </div>
                  <EditField label="Mã thành viên" value={editData.memberId} onChange={set("memberId")} />
                  <EditField label="Mã nhóm" value={editData.groupNumber} onChange={set("groupNumber")} />
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Nhà cung cấp" value={profile.insurance_provider ?? ""} />
                  <Field label="Mã thành viên" value={profile.member_id ?? ""} />
                  <Field label="Mã nhóm" value={profile.group_number ?? ""} />
                </div>
              )}
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleCancelEdit();
              onOpenChange(false);
            }}
            disabled={isSaving}
          >
            Đóng
          </Button>
          <div className="flex gap-2">
            {data && !isEditing ? (
              <Button type="button" onClick={handleStartEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            ) : null}
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileDialog;
