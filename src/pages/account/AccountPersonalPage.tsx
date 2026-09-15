import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  FileClock,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import PatientProfileSheet from "@/components/patient/PatientProfileDialog";
import {
  formatDob,
  ProfileDetailField,
  profileInitials,
} from "@/components/account/ProfileDetailField";
import { useAuth } from "@/hooks/use-auth";
import { hasPatientRecord, useMyPatientProfile } from "@/hooks/useMyPatientProfile";
import {
  createAvatarSignedUrl,
  uploadPatientAvatar,
  validateAvatarFile,
} from "@/lib/patient-avatar-api";
import { Button } from "@/components/ui/button";
import { sanitizeSensitiveDisplay } from "@/lib/crypto";

const AccountPersonalPage = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: profile, isLoading, isError, error } = useMyPatientProfile();

  const avatarPath = profile?.avatar_storage_path ?? null;
  const { data: avatarUrl } = useQuery({
    queryKey: ["patient", "my-avatar-url", userId, avatarPath],
    queryFn: () => createAvatarSignedUrl(avatarPath),
    enabled: Boolean(userId && avatarPath),
    staleTime: 30 * 60 * 1000,
  });

  const recordExists = hasPatientRecord(profile);
  const waitingForProfile = isLoading && profile === undefined;
  const phoneDisplay = recordExists
    ? sanitizeSensitiveDisplay(profile.phone_number)
    : "—";

  const handleAvatarPick = () => {
    if (isUploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file || !userId) return;
    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadPatientAvatar(userId, file);
      await queryClient.invalidateQueries({ queryKey: ["patient", "my-profile", userId] });
      await queryClient.invalidateQueries({ queryKey: ["patient", "my-avatar-url", userId] });
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (e) {
      toast.error("Không tải được ảnh đại diện", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Thông tin cá nhân</h2>
        {recordExists ? (
          <Button
            type="button"
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/5"
            onClick={() => setProfileOpen(true)}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Tải lên CCCD/ID (AI Nhận diện)
          </Button>
        ) : null}
      </div>

      {waitingForProfile ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4">
          <p className="text-sm font-semibold text-destructive">Không tải được hồ sơ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Lỗi không xác định"}
          </p>
        </div>
      ) : recordExists ? (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-6 text-primary-foreground shadow-sm md:px-8 md:py-7">
            <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={isUploadingAvatar}
                  aria-label="Cập nhật ảnh đại diện"
                  className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/30 backdrop-blur transition hover:ring-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profileInitials(profile.full_name)
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white opacity-100" />
                    ) : (
                      <Camera className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                    )}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    void handleAvatarChange(e.target.files?.[0] ?? null);
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xl font-bold uppercase tracking-wide">
                    {profile.full_name || "Bệnh nhân"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-primary-foreground/80">
                    {profile.email_address ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {profile.email_address}
                      </span>
                    ) : null}
                    {phoneDisplay !== "—" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {phoneDisplay}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] text-primary-foreground/70">
                    Nhấn ảnh để đổi ảnh đại diện
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 backdrop-blur ${
                  profile.submitted_at
                    ? "bg-white/20 text-white ring-white/30"
                    : "bg-amber-400/20 text-amber-50 ring-amber-200/40"
                }`}
              >
                {profile.submitted_at ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <FileClock className="h-3.5 w-3.5" />
                )}
                {profile.submitted_at ? "Đã nộp" : "Bản nháp"}
              </span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <IdCard className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Chi tiết hồ sơ</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileDetailField
                icon={CalendarDays}
                label="Ngày sinh"
                value={formatDob(profile.date_of_birth)}
              />
              <ProfileDetailField
                icon={Phone}
                label="Số điện thoại"
                value={phoneDisplay}
              />
              <ProfileDetailField
                icon={UserRound}
                label="Đại từ / Giới tính"
                value={profile.preferred_pronouns ?? "—"}
              />
              <ProfileDetailField
                icon={IdCard}
                label="Số CCCD/ID"
                value={profile.id_number ?? "—"}
              />
              <ProfileDetailField
                icon={MapPin}
                label="Địa chỉ"
                value={profile.residential_address ?? "—"}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-muted/30 px-6 py-14 text-center md:py-16">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80">
            <IdCard className="h-8 w-8 text-muted-foreground/70" strokeWidth={1.5} />
          </div>
          <p className="text-base font-semibold text-foreground">Chưa có dữ liệu</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Vui lòng tải lên CCCD để AI tự động điền thông tin của bạn.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="min-w-[160px]">
              <Link to="/onboarding">Tạo hồ sơ bằng AI</Link>
            </Button>
          </div>
        </div>
      )}

      <PatientProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </section>
  );
};

export default AccountPersonalPage;
