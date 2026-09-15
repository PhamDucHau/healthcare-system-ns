import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMyPatientProfile } from "@/hooks/useMyPatientProfile";
import { supabase } from "@/lib/supabase";
import { ProfileDetailField } from "@/components/account/ProfileDetailField";
import { Button } from "@/components/ui/button";
import { sanitizeSensitiveDisplay } from "@/lib/crypto";

const AccountInsurancePage = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: profile, isLoading: profileLoading } = useMyPatientProfile();
  const cardPath = profile?.card_front_storage_path ?? null;

  const { data: cardImageUrl, isLoading: cardLoading } = useQuery({
    queryKey: ["patient", "my-insurance-card", userId, cardPath],
    queryFn: async () => {
      const { data: signed } = await supabase.storage
        .from("insurance-cards")
        .createSignedUrl(cardPath as string, 3600);
      return signed?.signedUrl ?? null;
    },
    enabled: Boolean(userId && cardPath),
  });

  const isLoading = profileLoading || (Boolean(cardPath) && cardLoading);

  const hasInsurance = Boolean(
    profile
    && (
      profile.insurance_provider?.trim()
      || sanitizeSensitiveDisplay(profile.member_id) !== "—"
      || profile.card_front_storage_path
    ),
  );

  const providerDisplay =
    profile?.insurance_provider?.trim()
    || profile?.bhyt_kcb?.trim()
    || "—";

  return (
    <section>
      <h2 className="mb-5 text-lg font-bold text-foreground">Bảo hiểm (BHYT)</h2>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : hasInsurance ? (
        <div className="rounded-xl border border-border/80 bg-card p-5 md:p-6">
          <div className="space-y-3">
            <ProfileDetailField label="Nhà cung cấp" value={providerDisplay} />
            <ProfileDetailField label="Mã thành viên" value={profile?.member_id ?? "—"} />
            <ProfileDetailField label="Mã nhóm" value={profile?.group_number ?? "—"} />
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Ảnh thẻ BHYT
            </p>
            <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/20">
              {cardImageUrl ? (
                <a href={cardImageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={cardImageUrl}
                    alt="Thẻ BHYT"
                    className="aspect-[4/3] w-full max-w-xs object-cover transition-opacity hover:opacity-90"
                  />
                </a>
              ) : (
                <div className="flex aspect-[4/3] w-full max-w-xs flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 opacity-40" strokeWidth={1.25} />
                  <span className="text-xs">Chưa có ảnh thẻ</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Shield className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">Chưa có dữ liệu BHYT</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Bạn có thể khai báo bảo hiểm cùng với CCCD thông qua hệ thống AI.
          </p>
          <Button asChild className="mt-6">
            <Link to="/onboarding">Khai báo BHYT</Link>
          </Button>
        </div>
      )}
    </section>
  );
};

export default AccountInsurancePage;
