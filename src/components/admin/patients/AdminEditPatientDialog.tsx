import { useEffect, useState } from "react";
import { FileText, Loader2, Pencil, ScanLine, UploadCloud, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getPatientRecordById } from "@/lib/patient-records";
import {
  fetchOcrSingle,
  applyBhytParsedFillEmpty,
  applyCccdParsedFillEmpty,
} from "@/lib/cccd-ocr";
import type { PatientPortalDetail } from "@/types/patient-portal";

const MAX_SIZE = 10 * 1024 * 1024;

function sanitize(name: string) {
  return name.trim().replace(/[^\w.\-]+/g, "_").slice(0, 120) || "file";
}

type FormData = {
  legalLastName: string; legalFirstName: string; dateOfBirth: string;
  gender: string; phoneNumber: string; email: string;
  idNumber: string; expirationDate: string; issuedDate: string;
  issuer: string; residentialAddress: string;
  provider: string; memberId: string; groupNumber: string;
  bhytName: string; bhytDob: string; bhytGender: string;
  bhytAddress: string; bhytKcb: string; bhytKcbCode: string;
  bhytValidFrom: string; bhytFiveYear: string;
};

function toForm(p: PatientPortalDetail): FormData {
  return {
    legalLastName: p.legal_last_name ?? "",
    legalFirstName: p.legal_first_name ?? "",
    dateOfBirth: p.date_of_birth ?? "",
    gender: p.preferred_pronouns ?? "",
    phoneNumber: p.phone_number ?? "",
    email: p.email_address ?? "",
    idNumber: p.id_number ?? "",
    expirationDate: p.id_expiration_date ?? "",
    issuedDate: p.id_issued_date ?? "",
    issuer: p.id_issuer ?? "",
    residentialAddress: p.residential_address ?? "",
    provider: p.insurance_provider ?? "",
    memberId: p.member_id ?? "",
    groupNumber: p.group_number ?? "",
    bhytName: p.bhyt_name ?? "",
    bhytDob: p.bhyt_dob ?? "",
    bhytGender: p.bhyt_gender ?? "",
    bhytAddress: p.bhyt_address ?? "",
    bhytKcb: p.bhyt_kcb ?? "",
    bhytKcbCode: p.bhyt_kcb_code ?? "",
    bhytValidFrom: p.bhyt_valid_from ?? "",
    bhytFiveYear: p.bhyt_five_year ?? "",
  };
}

interface Props {
  profileId: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const lc = "mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const fc = "min-h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30";

function F({ label, value, onChange, type = "text", placeholder, col2 }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; col2?: boolean;
}) {
  return (
    <div className={col2 ? "sm:col-span-2" : ""}>
      <label className={lc}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={fc} />
    </div>
  );
}

function ImageSlot({
  inputId, label, existingUrl, storagePath, newFile, onFileSelect, onOcr, ocrRunning,
}: {
  inputId: string; label: string;
  existingUrl: string | null; storagePath: string | null;
  newFile: File | null; onFileSelect: (f: File | null) => void;
  onOcr?: () => void; ocrRunning?: boolean;
}) {
  const isPdf = (storagePath ?? "").toLowerCase().endsWith(".pdf");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!newFile?.type.startsWith("image/")) { setPreview(""); return; }
    const url = URL.createObjectURL(newFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newFile]);

  const displayUrl = preview || (!newFile ? existingUrl : null);

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        {onOcr && (newFile || existingUrl) && (
          <button type="button" onClick={onOcr} disabled={ocrRunning}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/10 disabled:opacity-50">
            <ScanLine className="h-3 w-3" />
            {ocrRunning ? "OCR…" : "OCR"}
          </button>
        )}
      </div>

      <div className="relative">
        {displayUrl ? (
          isPdf && !newFile ? (
            <a href={displayUrl} target="_blank" rel="noopener noreferrer"
              className="flex h-36 items-center justify-center gap-2 bg-muted/20 text-sm text-primary hover:underline">
              <FileText className="h-5 w-5" />PDF
            </a>
          ) : (
            <img src={displayUrl} alt={label} className="h-36 w-full object-cover" />
          )
        ) : (
          <div className="flex h-36 flex-col items-center justify-center gap-1 bg-muted/20 text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
            <span className="text-xs">Chưa có ảnh</span>
          </div>
        )}

        <label htmlFor={inputId}
          className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-foreground shadow hover:bg-white">
          <UploadCloud className="h-3 w-3" />
          {displayUrl ? "Thay ảnh" : "Tải lên"}
        </label>
        <input id={inputId} type="file" accept=".png,.jpg,.jpeg,.pdf"
          className="sr-only"
          onChange={e => onFileSelect(e.target.files?.[0] ?? null)} />
      </div>

      {newFile && (
        <p className="truncate bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
          ✓ {newFile.name}
        </p>
      )}
    </div>
  );
}

export default function AdminEditPatientDialog({ profileId, open, onClose, onSuccess }: Props) {
  const [profile, setProfile] = useState<PatientPortalDetail | null>(null);
  const [idUrl, setIdUrl] = useState<string | null>(null);
  const [idBackUrl, setIdBackUrl] = useState<string | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [ocrFront, setOcrFront] = useState(false);
  const [ocrBack, setOcrBack] = useState(false);
  const [ocrBhyt, setOcrBhyt] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile + signed URLs when opened
  useEffect(() => {
    if (!open || !profileId) return;
    setLoading(true);
    setIdFile(null); setIdBackFile(null); setCardFile(null);

    getPatientRecordById(supabase, profileId).then(async ({ record, error }) => {
      if (error || !record) { setLoading(false); return; }
      setProfile(record);
      setForm(toForm(record));

      const [a, b, c] = await Promise.all([
        record.id_document_storage_path
          ? supabase.storage.from("identity-documents").createSignedUrl(record.id_document_storage_path, 3600)
          : null,
        record.id_document_back_storage_path
          ? supabase.storage.from("identity-documents").createSignedUrl(record.id_document_back_storage_path, 3600)
          : null,
        record.card_front_storage_path
          ? supabase.storage.from("insurance-cards").createSignedUrl(record.card_front_storage_path, 3600)
          : null,
      ]);
      setIdUrl(a?.data?.signedUrl ?? null);
      setIdBackUrl(b?.data?.signedUrl ?? null);
      setCardUrl(c?.data?.signedUrl ?? null);
      setLoading(false);
    });
  }, [open, profileId]);

  const set = (k: keyof FormData) => (v: string) =>
    setForm(p => p ? { ...p, [k]: v } : p);

  const runOcr = async (type: "front" | "back" | "bhyt") => {
    const file = type === "front" ? idFile : type === "back" ? idBackFile : cardFile;
    // For existing images fall back to the stored URL (can't re-OCR from URL; require new file)
    if (!file) { toast.info("Tải ảnh mới lên để chạy OCR"); return; }
    const setter = type === "front" ? setOcrFront : type === "back" ? setOcrBack : setOcrBhyt;
    setter(true);
    try {
      if (type === "bhyt") {
        const json = await fetchOcrSingle(file, "bhyt", "front");
        if (!json.parsed || typeof json.parsed !== "object") throw new Error("OCR không trả về dữ liệu.");
        setForm(p => p ? applyBhytParsedFillEmpty(p, json.parsed) : p);
        toast.success("OCR BHYT hoàn tất");
      } else {
        const json = await fetchOcrSingle(file, "cccd", "front");
        if (!json.parsed || typeof json.parsed !== "object") throw new Error("OCR không trả về dữ liệu.");
        setForm(p => p ? applyCccdParsedFillEmpty(p, json.parsed) : p);
        toast.success(`OCR CCCD ${type === "front" ? "mặt trước" : "mặt sau"} hoàn tất`);
      }
    } catch (e) {
      toast.error("OCR thất bại", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    if (!form || !profile) return;
    setSaving(true);
    try {
      const userId = profile.user_id;
      const ts = Date.now();
      const paths: {
        id_document_storage_path?: string;
        id_document_back_storage_path?: string;
        card_front_storage_path?: string;
      } = {};

      const upload = async (file: File, bucket: string, key: string) => {
        const path = `${userId}/${key}_${ts}_${sanitize(file.name)}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: "3600" });
        if (error) throw new Error(error.message);
        return path;
      };

      if (idFile) paths.id_document_storage_path = await upload(idFile, "identity-documents", "id_front");
      if (idBackFile) paths.id_document_back_storage_path = await upload(idBackFile, "identity-documents", "id_back");
      if (cardFile) paths.card_front_storage_path = await upload(cardFile, "insurance-cards", "card_front");

      const e2n = (v: string) => v.trim() || null;
      const { error } = await supabase.from("patient").upsert({
        id: profile.id,
        user_id: userId,
        legal_first_name: e2n(form.legalFirstName),
        legal_last_name: e2n(form.legalLastName),
        date_of_birth: e2n(form.dateOfBirth),
        phone_number: e2n(form.phoneNumber),
        email_address: e2n(form.email),
        preferred_pronouns: e2n(form.gender),
        id_number: e2n(form.idNumber),
        id_expiration_date: e2n(form.expirationDate),
        id_issued_date: e2n(form.issuedDate),
        id_issuer: e2n(form.issuer),
        residential_address: e2n(form.residentialAddress),
        insurance_provider: e2n(form.provider),
        member_id: e2n(form.memberId),
        group_number: e2n(form.groupNumber),
        bhyt_name: e2n(form.bhytName),
        bhyt_dob: e2n(form.bhytDob),
        bhyt_gender: e2n(form.bhytGender),
        bhyt_address: e2n(form.bhytAddress),
        bhyt_kcb: e2n(form.bhytKcb),
        bhyt_kcb_code: e2n(form.bhytKcbCode),
        bhyt_valid_from: e2n(form.bhytValidFrom),
        bhyt_five_year: e2n(form.bhytFiveYear),
        submitted_at: new Date().toISOString(),
        consent_accepted: true,
        ...paths,
      }, { onConflict: "id" });

      if (error) throw new Error(error.message);
      toast.success("Đã cập nhật hồ sơ bệnh nhân");
      onSuccess();
    } catch (e) {
      toast.error("Lưu thất bại", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !saving) onClose(); }}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Chỉnh sửa hồ sơ bệnh nhân
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải hồ sơ…
          </div>
        ) : !form ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy hồ sơ.</p>
        ) : (
          <div className="space-y-5 pb-2">
            {/* Patient header */}
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-bold">{profile?.full_name}</p>
                <p className="text-sm opacity-90">
                  ID: {profile?.id_number || `QC-${profile?.id.slice(0, 8).toUpperCase()}`} · DOB: {profile?.date_of_birth ?? "—"}
                </p>
              </div>
            </div>

            {/* Document images */}
            <section className="rounded-2xl border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold">Ảnh giấy tờ</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <ImageSlot inputId="edit-id-front" label="CCCD mặt trước"
                  existingUrl={idUrl} storagePath={profile?.id_document_storage_path ?? null}
                  newFile={idFile} onFileSelect={f => f && f.size <= MAX_SIZE ? setIdFile(f) : toast.error("File quá lớn")}
                  onOcr={() => runOcr("front")} ocrRunning={ocrFront} />
                <ImageSlot inputId="edit-id-back" label="CCCD mặt sau"
                  existingUrl={idBackUrl} storagePath={profile?.id_document_back_storage_path ?? null}
                  newFile={idBackFile} onFileSelect={f => f && f.size <= MAX_SIZE ? setIdBackFile(f) : toast.error("File quá lớn")}
                  onOcr={() => runOcr("back")} ocrRunning={ocrBack} />
                <ImageSlot inputId="edit-card" label="Thẻ BHYT"
                  existingUrl={cardUrl} storagePath={profile?.card_front_storage_path ?? null}
                  newFile={cardFile} onFileSelect={f => f && f.size <= MAX_SIZE ? setCardFile(f) : toast.error("File quá lớn")}
                  onOcr={() => runOcr("bhyt")} ocrRunning={ocrBhyt} />
              </div>
            </section>

            {/* Personal */}
            <section className="rounded-2xl border bg-muted/30 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thông tin cá nhân</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Họ" value={form.legalLastName} onChange={set("legalLastName")} />
                <F label="Tên" value={form.legalFirstName} onChange={set("legalFirstName")} />
                <F label="Ngày sinh" value={form.dateOfBirth} onChange={set("dateOfBirth")} type="date" />
                <F label="Giới tính" value={form.gender} onChange={set("gender")} placeholder="Nam / Nữ / Khác" />
                <F label="Số điện thoại" value={form.phoneNumber} onChange={set("phoneNumber")} type="tel" />
                <F label="Email" value={form.email} onChange={set("email")} type="email" />
              </div>
            </section>

            {/* Identity */}
            <section className="rounded-2xl border bg-muted/30 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giấy tờ tùy thân (CCCD)</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Số CCCD" value={form.idNumber} onChange={set("idNumber")} placeholder="G-123-5678-9012" />
                <F label="Ngày hết hạn" value={form.expirationDate} onChange={set("expirationDate")} type="date" />
                <F label="Ngày cấp" value={form.issuedDate} onChange={set("issuedDate")} type="date" />
                <F label="Nơi cấp" value={form.issuer} onChange={set("issuer")} />
                <F label="Địa chỉ thường trú" value={form.residentialAddress} onChange={set("residentialAddress")} col2 />
              </div>
            </section>

            {/* Insurance */}
            <section className="rounded-2xl border bg-muted/30 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bảo hiểm (BHYT)</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Nhà cung cấp" value={form.provider} onChange={set("provider")} col2 />
                <F label="Mã thành viên / BHYT" value={form.memberId} onChange={set("memberId")} />
                <F label="Mã nhóm" value={form.groupNumber} onChange={set("groupNumber")} />
                <F label="Họ tên trên BHYT" value={form.bhytName} onChange={set("bhytName")} />
                <F label="Ngày sinh (BHYT)" value={form.bhytDob} onChange={set("bhytDob")} type="date" />
                <F label="Giới tính" value={form.bhytGender} onChange={set("bhytGender")} placeholder="Nam / Nữ" />
                <F label="Mã KCB" value={form.bhytKcbCode} onChange={set("bhytKcbCode")} />
                <F label="Nơi đăng ký KCB" value={form.bhytKcb} onChange={set("bhytKcb")} />
                <F label="Địa chỉ / đơn vị" value={form.bhytAddress} onChange={set("bhytAddress")} col2 />
                <F label="Hiệu lực từ" value={form.bhytValidFrom} onChange={set("bhytValidFrom")} type="date" />
                <F label="Ngày 5 năm liên tục" value={form.bhytFiveYear} onChange={set("bhytFiveYear")} type="date" />
              </div>
            </section>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Đóng</Button>
          {form && (
            <Button onClick={() => void handleSave()} disabled={saving || loading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
