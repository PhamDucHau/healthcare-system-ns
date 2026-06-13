import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from 'lucide-react';
import SpecialtiesTab   from './master-data/SpecialtiesTab';
import ServicesTab      from './master-data/ServicesTab';
import FacilitiesTab    from './master-data/FacilitiesTab';
import RoomsTab         from './master-data/RoomsTab';
import DoctorSchedulesTab from './master-data/DoctorSchedulesTab';
import CategoriesTab    from './master-data/CategoriesTab';
import AuditLogTab      from './master-data/AuditLogTab';

const TABS = [
  { value: 'specialties',  label: 'Chuyên khoa' },
  { value: 'services',     label: 'Dịch vụ' },
  { value: 'facilities',   label: 'Cơ sở' },
  { value: 'rooms',        label: 'Phòng khám' },
  { value: 'schedules',    label: 'Lịch BS' },
  { value: 'categories',   label: 'Danh mục câu hỏi' },
  { value: 'audit',        label: 'Audit Log' },
];

export default function MasterDataContent() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh mục hệ thống</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh mục hệ thống — Chuyên khoa, Dịch vụ, Cơ sở, Phòng khám, Lịch bác sĩ
          </p>
        </div>
      </div>

      <Tabs defaultValue="specialties" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="specialties"  className="mt-0"><SpecialtiesTab /></TabsContent>
        <TabsContent value="services"     className="mt-0"><ServicesTab /></TabsContent>
        <TabsContent value="facilities"   className="mt-0"><FacilitiesTab /></TabsContent>
        <TabsContent value="rooms"        className="mt-0"><RoomsTab /></TabsContent>
        <TabsContent value="schedules"    className="mt-0"><DoctorSchedulesTab /></TabsContent>
        <TabsContent value="categories"   className="mt-0"><CategoriesTab /></TabsContent>
        <TabsContent value="audit"        className="mt-0"><AuditLogTab /></TabsContent>
      </Tabs>
    </div>
  );
}
