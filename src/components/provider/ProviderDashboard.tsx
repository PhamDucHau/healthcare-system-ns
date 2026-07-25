import {
  Calendar,
  ClipboardList,
  Clock,
  FlaskConical,
  Loader2,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  UI_ACTION,
  UI_BADGE,
  UI_PAGE,
  translatePatientStatus,
} from "@/config/ui-labels";
import { greetingNow } from "@/lib/greeting";
import { useProviderDashboardData, useProviderDashboardRecentPatients } from "@/hooks/useProviderDashboardData";
import { formatWeekdayDate } from "@/lib/provider-dashboard-utils";
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

const MOCK_LABS_STAT = {
  icon: FlaskConical,
  label: "Kết quả xét nghiệm",
  value: "3",
  sub: "Chờ duyệt",
  badge: "Ưu tiên",
  badgeClass: "bg-warning/10 text-warning",
};

const MOCK_MESSAGES_STAT = {
  icon: MessageSquare,
  label: "Tin nhắn",
  value: "5",
  sub: "Chưa đọc",
  badge: UI_BADGE.inbox,
  badgeClass: "bg-accent text-accent-foreground",
};

function statusPill(status: string) {
  if (status === "Active" || status === "Stable") return "bg-emerald-100 text-emerald-700";
  if (status === "Review") return "bg-amber-100 text-amber-700";
  if (status === "Draft") return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-700";
}

function SectionLoading() {
  return (
    <div className="flex items-center justify-center py-10 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

const ProviderDashboard = ({ onOpenPatients: _onOpenPatients }: ProviderDashboardProps) => {
  const now = new Date();
  const greeting = greetingNow(now);
  const { data, isLoading, isError, refetch, isFetching } = useProviderDashboardData(now);
  const {
    data: patientData,
    isLoading: patientsLoading,
    isError: patientsError,
    refetch: refetchPatients,
    isFetching: patientsFetching,
  } = useProviderDashboardRecentPatients();

  const monitoringStats = patientData?.monitoringStats ?? data?.monitoringStats;
  const recentPatients = patientData?.recentPatients ?? [];

  const stats = [
    {
      icon: Calendar,
      label: "Lịch hôm nay",
      value: data ? String(data.todayStats.total) : "—",
      sub: data ? `${data.todayStats.remaining} còn lại` : "—",
      badge: "Hôm nay",
      badgeClass: "bg-primary/10 text-primary",
      loading: isLoading,
    },
    { ...MOCK_LABS_STAT, loading: false },
    { ...MOCK_MESSAGES_STAT, loading: false },
    {
      icon: Users,
      label: "Bệnh nhân đang theo dõi",
      value: monitoringStats ? String(monitoringStats.total) : "—",
      sub: monitoringStats
        ? monitoringStats.newThisWeek > 0
          ? `+${monitoringStats.newThisWeek} tuần này`
          : "Không có bệnh nhân mới tuần này"
        : "—",
      badge: UI_BADGE.active,
      badgeClass: "bg-success/10 text-success",
      loading: patientsLoading,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{UI_PAGE.dashboard}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {greeting},{" "}
            <span className="font-semibold text-foreground">
              {isLoading ? "…" : data?.doctorName ?? "Bác sĩ"}
            </span>{" "}
            — tổng quan lịch khám và công việc lâm sàng hôm nay.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(isError || patientsError) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void refetch();
                void refetchPatients();
              }}
              disabled={isFetching || patientsFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching || patientsFetching ? "animate-spin" : ""}`}
              />
              Thử lại
            </Button>
          )}
          {/* <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Xuất báo cáo
          </button> */}
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
              <p className="text-2xl font-bold">{card.loading ? "…" : card.value}</p>
              <p className="text-xs font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">
                {card.loading ? "Đang tải…" : card.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Lịch khám hôm nay</h2>
              <p className="text-xs text-muted-foreground">{formatWeekdayDate(now)}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              {isLoading ? "…" : `${data?.todaySchedule.length ?? 0} cuộc hẹn`}
            </span>
          </div>
          {isLoading ? (
            <SectionLoading />
          ) : data?.todaySchedule.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Không có lịch hôm nay.</p>
          ) : (
            <ul className="space-y-3">
              {data?.todaySchedule.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className="flex flex-wrap items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="w-14 text-sm font-semibold tabular-nums text-primary">{item.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.patient}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                      <Users className="h-3 w-3" />
                      {item.mode}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Tư vấn tuần này</h2>
          </div>
          {isLoading ? (
            <SectionLoading />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.weeklyChart ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={28} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bệnh nhân gần đây</h2>
            <Link
              to="/provider-portal/patient-records"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          {patientsLoading ? (
            <SectionLoading />
          ) : patientsError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Không tải được danh sách bệnh nhân.</p>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => void refetchPatients()}
              >
                Thử lại
              </Button>
            </div>
          ) : recentPatients.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chưa có bệnh nhân.</p>
          ) : (
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
                    <tr key={row.id} className="border-b last:border-0">
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
          )}
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Việc lâm sàng</h2>
            </div>
            <Link
              to="/provider-portal/tasks"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          {isLoading ? (
            <SectionLoading />
          ) : data?.clinicalTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chưa có việc lâm sàng.</p>
          ) : (
            <ul className="space-y-4">
              {data?.clinicalTasks.map((task) => (
                <li key={task.id}>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{task.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{task.due}</span>
                  </div>
                  <Progress value={task.done} className="h-1.5" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">Gợi ý nhanh</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Lịch hẹn, bệnh nhân và việc lâm sàng đã lấy từ hệ thống. Card xét nghiệm và tin nhắn vẫn
          dùng dữ liệu demo cho đến khi có API tương ứng.
        </p>
      </div>
    </div>
  );
};

export default ProviderDashboard;
