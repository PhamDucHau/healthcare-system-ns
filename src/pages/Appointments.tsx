import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import AppointmentsContent from "@/components/AppointmentsContent";

const Appointments = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <AppointmentsContent />
      </div>
    </div>
  );
};

export default Appointments;
