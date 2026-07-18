import { Outlet } from "react-router-dom";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import AccountSubNav from "@/components/account/AccountSubNav";

const AccountLayout = () => (
  <div className="flex min-h-screen flex-col">
    <TopNav />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Quản lý <span className="text-primary">Tài khoản</span>
            </h1>
            <p className="mt-1 text-sm md:text-base text-muted-foreground">
              Cập nhật thông tin cá nhân, hồ sơ sức khỏe và cài đặt của bạn.
            </p>
          </header>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <AccountSubNav />
            <div className="min-w-0 flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default AccountLayout;
