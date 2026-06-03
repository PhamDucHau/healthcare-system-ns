import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import HealthHistory from "@/components/HealthHistory";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <HealthHistory />
      </div>
    </div>
  );
};

export default Index;
