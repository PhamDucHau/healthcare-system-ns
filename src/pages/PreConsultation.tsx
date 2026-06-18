/**
 * FR-022: Pre-Consultation Page
 * Patient-facing page for filling health declaration form
 */

import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import PreConsultationForm from '@/components/pre-consultation/PreConsultationForm';

export default function PreConsultation() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <PreConsultationForm />
        </main>
      </div>
    </div>
  );
}
