import { useState } from "react";
import { ScrollText } from "lucide-react";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorMedicalHistoryTab from "@/components/provider/medical-history/DoctorMedicalHistoryTab";
import DoctorExamActivityLogTab from "@/components/provider/medical-history/DoctorExamActivityLogTab";
import {
  listPatientAppointmentsAuditLog,
  listPatientExaminationActivityLog,
} from "@/lib/delta-log-api";

const TABS = [
  { value: "visits", label: "Lịch sử khám bệnh" },
  { value: "system", label: "Nhật ký hệ thống" },
];

const UNSIGNED_SOAP_MESSAGE = "Hồ sơ chưa được bác sĩ ký xác nhận";

export default function PatientExamHistoryPage() {
  const [activeTab, setActiveTab] = useState("visits");

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-muted/30 p-4 md:p-8">
          <div className="max-w-7xl mx-auto px-0">
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-accent flex items-center justify-center text-primary shrink-0">
                  <ScrollText className="h-5 w-5 md:h-7 md:w-7" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">Lịch sử khám bệnh</h1>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
                    Theo dõi lịch sử khám và nhật ký chỉnh sửa hồ sơ của bạn
                  </p>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
              <div className="bg-card rounded-xl md:rounded-2xl p-1.5 md:p-2 shadow-sm border border-border/30 mb-4 md:mb-6 overflow-x-auto">
                <TabsList className="flex gap-0.5 md:gap-1 min-w-max bg-transparent h-auto p-0">
                  {TABS.map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="rounded-lg md:rounded-xl px-3 md:px-6 py-1.5 md:py-2 text-[11px] md:text-xs font-semibold text-muted-foreground hover:bg-muted transition-all data-[state=active]:bg-accent/30 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none whitespace-nowrap"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="visits" className="mt-0">
                <DoctorMedicalHistoryTab
                  listLogs={listPatientAppointmentsAuditLog}
                  showPatientColumn={false}
                  showDoctorColumn
                  searchPlaceholder="Tìm chuyên khoa, bác sĩ..."
                />
              </TabsContent>
              <TabsContent value="system" className="mt-0">
                <DoctorExamActivityLogTab
                  listLogs={listPatientExaminationActivityLog}
                  showDoctorColumn
                  showPatientColumn={false}
                  searchPlaceholder="Tìm bác sĩ hoặc chuyên khoa..."
                  soapEmptyMessage={UNSIGNED_SOAP_MESSAGE}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
