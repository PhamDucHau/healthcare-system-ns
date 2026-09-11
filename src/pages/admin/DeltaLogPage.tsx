import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentsAuditTab from '@/components/admin/delta-log/AppointmentsAuditTab';
import SystemAuditTab from '@/components/admin/delta-log/SystemAuditTab';
import MasterDataAuditTab from '@/components/admin/delta-log/MasterDataAuditTab';
import SignatureLogTab from '@/components/admin/delta-log/SignatureLogTab';

const TABS = [
  { value: 'appointments', label: 'Lịch sử khám bệnh' },
  { value: 'system', label: 'Hệ thống' },
  { value: 'master-data', label: 'Danh mục' },
  { value: 'signatures', label: 'Chữ ký số' },
];

export default function DeltaLogPage() {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
      {/* Page header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-accent flex items-center justify-center text-primary shrink-0">
            <ScrollText className="h-5 w-5 md:h-7 md:w-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Nhật ký hệ thống</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
              Theo dõi các hoạt động và thay đổi trong hệ thống — Lịch hẹn, Người dùng, Danh mục, Chữ ký số
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-0"
      >
        {/* Tab navigation card */}
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

        <TabsContent value="appointments" className="mt-0">
          <AppointmentsAuditTab />
        </TabsContent>
        <TabsContent value="system" className="mt-0">
          <SystemAuditTab />
        </TabsContent>
        <TabsContent value="master-data" className="mt-0">
          <MasterDataAuditTab />
        </TabsContent>
        <TabsContent value="signatures" className="mt-0">
          <SignatureLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
