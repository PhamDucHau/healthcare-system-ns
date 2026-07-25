import {
  Calendar,
  ClipboardList,
  Clock,
  FlaskConical,
  MessageSquare,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  UI_ACTION,
  UI_BADGE,
  UI_PAGE,
  translatePatientStatus,
} from "@/config/ui-labels";
import { greetingNow } from "@/lib/greeting";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProviderDashboardProps = {
  /** @deprecated dùng Link nội bộ */
  onOpenPatients?: () => void;
};

const stats = [
  {
    icon: Calendar,
    label: "Lịch hôm nay",
    value: "8",
    sub: "3 còn lại",
    badge: "Hôm nay",
    badgeClass: "bg-primary/10 text-primary",
  },
  {
    icon: FlaskConical,
    label: "Kết quả xét nghiệm",
    value: "3",
    sub: "Chờ duyệt",
    badge: "Ưu tiên",
    badgeClass: "bg-warning/10 text-warning",
  },
  {
    icon: MessageSquare,
    label: "Tin nhắn",
    value: "5",
    sub: "Chưa đọc",
    badge: UI_BADGE.inbox,
    badgeClass: "bg-accent text-accent-foreground",
  },
  {
    icon: Users,
    label: "Bệnh nhân đang theo dõi",
    value: "24",
    sub: "+2 tuần này",
    badge: UI_BADGE.active,
    badgeClass: "bg-success/10 text-success",
  },
];

const todaySchedule = [
  { time: "09:00", patient: "Nguyễn Văn An", type: "Tái khám", mode: "Trực tuyến", isVideo: true },
  { time: "10:30", patient: "Trần Thị Bình", type: "Xem xét xét nghiệm", mode: "Trực tiếp", isVideo: false },
  { time: "13:00", patient: "Lê Minh Cường", type: "Khám mới", mode: "Trực tuyến", isVideo: true },
  { time: "15:30", patient: "Phạm Thu Dung", type: "Cấp lại PrEP", mode: "Trực tuyến", isVideo: true },
];

const recentPatients = [
  { name: "Nguyễn Văn An", last: "2 ngày trước", status: "Stable" },
  { name: "Trần Thị Bình", last: "1 tuần trước", status: "Review" },
  { name: "Lê Minh Cường", last: "3 tuần trước", status: "Routine" },
  { name: "Phạm Thu Dung", last: "Hôm qua", status: "Stable" },
];

const clinicalTasks = [
  { title: "Xem xét kết quả máu — Nguyễn Văn An", due: "Hôm nay", done: 0 },
  { title: "Ký đơn PrEP — Trần Thị Bình", due: "Hôm nay", done: 35 },
  { title: "Hoàn thiện ghi chú bệnh án — Lê Minh Cường", due: "Ngày mai", done: 0 },
  { title: "Trả lời tin nhắn bệnh nhân — Phạm Thu Dung", due: "Hôm nay", done: 70 },
];

const weeklyConsults = [
  { day: "T2", count: 6 },
  { day: "T3", count: 9 },
  { day: "T4", count: 8 },
  { day: "T5", count: 11 },
  { day: "T6", count: 7 },
  { day: "T7", count: 4 },
  { day: "CN", count: 2 },
];

function statusPill(status: string) {
  if (status === "Stable") return "bg-emerald-100 text-emerald-700";
  if (status === "Review") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

const ProviderDashboard = ({ onOpenPatients }: ProviderDashboardProps) => {
  const now = new Date();
  const greeting = greetingNow(now);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{UI_PAGE.dashboard}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {greeting}, <span className="font-semibold text-foreground">BS. Nguyễn Thị Lan</span> — tổng
            quan lịch khám và công việc lâm sàng hôm nay.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Xuất báo cáo
          </button>
          <Link
            to="/provider-portal/patients"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {UI_ACTION.openPatients}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${card.badgeClass}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Lịch khám hôm nay</h2>
              <p className="text-xs text-muted-foreground">Thứ Hai, {now.toLocaleDateString("vi-VN")}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              4 cuộc hẹn
            </span>
          </div>
          <ul className="space-y-3">
            {todaySchedule.map((item) => (
              <li
                key={`${item.time}-${item.patient}`}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
              >
                <span className="w-14 text-sm font-semibold tabular-nums text-primary">{item.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.patient}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                  {item.isVideo ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <Users className="h-3 w-3" />
                  )}
                  {item.mode}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Tư vấn tuần này</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyConsults}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={28} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bệnh nhân gần đây</h2>
            <Link
              to="/provider-portal/patients"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 font-semibold">Bệnh nhân</th>
                  <th className="pb-2 font-semibold">Lần khám</th>
                  <th className="pb-2 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((row) => (
                  <tr key={row.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{row.name}</td>
                    <td className="py-3 text-muted-foreground">{row.last}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusPill(row.status)}`}
                      >
                        {translatePatientStatus(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Việc lâm sàng</h2>
          </div>
          <ul className="space-y-4">
            {clinicalTasks.map((task) => (
              <li key={task.title}>
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{task.due}</span>
                </div>
                <Progress value={task.done} className="h-1.5" />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">Gợi ý nhanh</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Dữ liệu mẫu cho demo UI. Kết nối API lịch hẹn, labs và messaging để hiển thị số liệu thật.
        </p>
      </div>
    </div>
  );
};

export default ProviderDashboard;
