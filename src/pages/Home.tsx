import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import HomeContent from "@/components/HomeContent";

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <HomeContent />
      </div>
    </div>
  );
};

export default Home;
