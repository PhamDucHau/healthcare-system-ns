import { ScrollText } from 'lucide-react';
import DoctorMedicalHistoryTab from '@/components/provider/medical-history/DoctorMedicalHistoryTab';

export default function DoctorMedicalHistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
      {/* Page header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-accent flex items-center justify-center text-primary shrink-0">
            <ScrollText className="h-5 w-5 md:h-7 md:w-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Lịch sử khám bệnh</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
              Theo dõi lịch sử khám bệnh của các bệnh nhân bạn đã điều trị
            </p>
          </div>
        </div>
      </div>

      <DoctorMedicalHistoryTab />
    </div>
  );
}
