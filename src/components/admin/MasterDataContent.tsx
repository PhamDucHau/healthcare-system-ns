import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Tags } from 'lucide-react';
import SpecialtiesTab   from './master-data/SpecialtiesTab';
import ServicesTab      from './master-data/ServicesTab';
import FacilitiesTab    from './master-data/FacilitiesTab';
import RoomsTab         from './master-data/RoomsTab';
import DoctorSchedulesTab from './master-data/DoctorSchedulesTab';
import CategoriesTab    from './master-data/CategoriesTab';
import AuditLogTab      from './master-data/AuditLogTab';
import {
  MasterDataActionsProvider,
  useMasterDataActions,
} from './master-data/MasterDataActionsContext';

const TABS = [
  { value: 'specialties',  label: 'Chuyên khoa' },
  { value: 'services',     label: 'Dịch vụ' },
  { value: 'facilities',   label: 'Cơ sở' },
  { value: 'rooms',        label: 'Phòng khám' },
  { value: 'schedules',    label: 'Lịch BS' },
  { value: 'categories',   label: 'Danh mục câu hỏi' },
  { value: 'audit',        label: 'Nhật ký thay đổi' },
];

function MasterDataInner() {
  const { currentAddAction, setActiveTab } = useMasterDataActions();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-primary shrink-0">
            <Tags className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Danh mục hệ thống</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý danh mục hệ thống — Chuyên khoa, Dịch vụ, Cơ sở, Phòng khám, Lịch bác sĩ
            </p>
          </div>
        </div>
        {currentAddAction && (
          <button
            type="button"
            onClick={currentAddAction.onAdd}
            className="bg-primary text-primary-foreground text-xs font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            {currentAddAction.label}
          </button>
        )}
      </div>

      <Tabs
        defaultValue="specialties"
        onValueChange={setActiveTab}
        className="space-y-0"
      >
        {/* Tab navigation card */}
        <div className="bg-card rounded-2xl p-2 shadow-sm border border-border/30 mb-6 overflow-x-auto">
          <TabsList className="flex gap-1 min-w-max bg-transparent h-auto p-0">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-xl px-6 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-all data-[state=active]:bg-accent/30 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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

export default function MasterDataContent() {
  return (
    <MasterDataActionsProvider defaultTab="specialties">
      <MasterDataInner />
    </MasterDataActionsProvider>
  );
}
