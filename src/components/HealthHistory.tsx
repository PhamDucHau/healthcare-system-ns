import { useState } from "react";
import { AlertTriangle, Pill, FileText, Scissors, Shield, CheckCircle2, FileUser } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HealthSection from "./HealthSection";
import ProfileSummary from "./ProfileSummary";
import PatientProfileDialog from "@/components/patient/PatientProfileDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

const HealthHistory = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: hasProfile } = useQuery({
    queryKey: ["patient", "has-profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("patient")
        .select("submitted_at")
        .eq("user_id", userId as string)
        .maybeSingle();
      return Boolean(data?.submitted_at);
    },
    enabled: Boolean(userId),
  });

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Lịch sử sức khỏe</h1>
        <p className="text-muted-foreground mb-8 text-sm md:text-base">
          Duy trì hồ sơ đầy đủ về lịch sử lâm sàng của bạn. Thông tin này giúp đội ngũ chăm sóc cung cấp hỗ trợ y tế chính xác và toàn diện nhất.
        </p>
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
          <p className="text-sm text-primary">
            Bệnh nhân mới? Hoàn thành thông tin cá nhân, giấy tờ và bảo hiểm để đẩy nhanh quá trình khám.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {/* <Link
              to="/provider-portal/patients"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Mở menu bác sĩ
            </Link> */}
            {hasProfile ? (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-card px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                <FileUser className="h-4 w-4" aria-hidden="true" />
                Xem hồ sơ bệnh nhân
              </button>
            ) : (
              <Link
                to="/onboarding/personal"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Tạo hồ sơ bệnh án
              </Link>
            )}
          </div>
        </div>

        <PatientProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Allergies */}
            <HealthSection icon={AlertTriangle} iconColor="text-warning" title="Dị ứng" action="Thêm dị ứng mới">
              <p className="text-sm text-muted-foreground mb-3">Quản lý các dị ứng thuốc và môi trường của bạn.</p>
              <div className="rounded-lg border-l-4 border-primary bg-muted/50 p-4 mb-3">
                <p className="text-sm font-semibold text-foreground">Penicillin</p>
                <p className="text-xs text-muted-foreground">Phản ứng nặng • Nổi mề đay/Phù</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
                <Checkbox id="no-allergies" />
                <label htmlFor="no-allergies" className="text-sm text-muted-foreground cursor-pointer">Không có dị ứng nào khác</label>
              </div>
            </HealthSection>

            {/* Medications & Conditions row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HealthSection icon={Pill} iconColor="text-primary" title="Thuốc đang dùng" action="Thêm mới">
                <div className="rounded-lg bg-muted/50 p-4 mb-3">
                  <p className="text-sm font-semibold text-foreground">PrEP (Truvada)</p>
                  <p className="text-xs text-muted-foreground mb-2">200mg-300mg • Hàng ngày</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1" style={{ background: "hsl(200 70% 92%)", color: "hsl(200 60% 35%)" }}>Nhà thuốc: CVS Health</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1" style={{ background: "hsl(280 60% 92%)", color: "hsl(280 50% 40%)" }}>Còn lại: 2 lần</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
                  <Checkbox id="no-meds" />
                  <label htmlFor="no-meds" className="text-sm text-muted-foreground cursor-pointer">Xác nhận: Không dùng thuốc hiện tại</label>
                </div>
              </HealthSection>

              <HealthSection icon={FileText} iconColor="text-primary" title="Bệnh lý" action="Thêm mới">
                <div className="rounded-lg bg-muted/50 p-4 mb-3">
                  <p className="text-sm font-semibold text-foreground">Hen suyễn theo mùa</p>
                  <p className="text-xs text-muted-foreground">Chẩn đoán: 2018 • Đang kiểm soát</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
                  <Checkbox id="no-conditions" />
                  <label htmlFor="no-conditions" className="text-sm text-muted-foreground cursor-pointer">Không có bệnh mãn tính khác</label>
                </div>
              </HealthSection>
            </div>

            {/* Surgeries & Immunizations row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HealthSection icon={Scissors} iconColor="text-primary" title="Phẫu thuật" action="Thêm mới...">
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Chưa có lịch sử phẫu thuật.</p>
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox id="no-surgery" />
                    <label htmlFor="no-surgery" className="text-sm text-muted-foreground cursor-pointer">Xác nhận: Tôi chưa từng phẫu thuật</label>
                  </div>
                </div>
              </HealthSection>

              <HealthSection icon={Shield} iconColor="text-success" title="Tiêm chủng">
                <div className="space-y-3 mb-3">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Vaccine COVID-19 (mũi nhắc)</p>
                      <p className="text-xs text-muted-foreground">Tháng 10/2023</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Vaccine Cúm</p>
                      <p className="text-xs text-muted-foreground">Tháng 9/2023</p>
                    </div>
                  </div>
                </div>
                <button className="w-full rounded-lg border border-primary/20 py-2 text-sm font-medium text-primary hover:bg-accent transition-colors">
                  Thêm vaccine
                </button>
                <div className="flex items-center gap-2 mt-3">
                  <Checkbox id="history-uptodate" />
                  <label htmlFor="history-uptodate" className="text-sm text-muted-foreground cursor-pointer">Xác nhận lịch sử đã cập nhật</label>
                </div>
              </HealthSection>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProfileSummary />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HealthHistory;
