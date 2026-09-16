import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import { ScrollText } from "lucide-react";
import DoctorMedicalHistoryTab from "@/components/provider/medical-history/DoctorMedicalHistoryTab";
import { listPatientAppointmentsAuditLog } from "@/lib/delta-log-api";

export default function PatientExamHistoryPage() {
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
                    Theo dõi lịch sử khám của bạn
                  </p>
                </div>
              </div>
            </div>

            <DoctorMedicalHistoryTab
              listLogs={listPatientAppointmentsAuditLog}
              showPatientColumn={false}
              showDoctorColumn
              searchPlaceholder="Tìm chuyên khoa, bác sĩ..."
            />
          </div>
        </main>
      </div>
    </div>
  );
}
