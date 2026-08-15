import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Brain, CalendarIcon, Filter, Loader2, RotateCcw, TrendingDown, TrendingUp,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fetchSpecialties } from "@/lib/appointment-api";
import {
  resolveAiAccuracyDateRange,
  toDoctorChartRows,
  toSoapChartRows,
  type AiAccuracyDatePreset,
} from "@/lib/ai-accuracy-stats";
import { getAiAccuracyStats, type AiAccuracyStatsFilters } from "@/lib/emr-api";
import { cn } from "@/lib/utils";

const PRESETS: { value: AiAccuracyDatePreset; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "custom", label: "Tùy chọn" },
];

function formatDateDisplay(date: Date | undefined): string {
  if (!date) return "";
  return format(date, "dd/MM/yyyy", { locale: vi });
}

function formatDateIso(date: Date | undefined): string | null {
  if (!date) return null;
  return format(date, "yyyy-MM-dd");
}

export default function AdminAiAccuracyPage() {
  const [preset, setPreset] = useState<AiAccuracyDatePreset>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [specialtyId, setSpecialtyId] = useState("__all__");

  const filters = useMemo<AiAccuracyStatsFilters>(() => {
    const range = resolveAiAccuracyDateRange(preset, formatDateIso(dateFrom), formatDateIso(dateTo));
    return {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      specialtyId: specialtyId === "__all__" ? null : specialtyId,
    };
  }, [preset, dateFrom, dateTo, specialtyId]);

  const { data: specialties = [] } = useQuery({
    queryKey: ["ai-accuracy-specialties"],
    queryFn: fetchSpecialties,
  });

  const {
    data: stats,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["ai-accuracy-stats", filters],
    queryFn: () => getAiAccuracyStats(filters),
  });

  const soapRows = useMemo(() => toSoapChartRows(stats?.by_soap), [stats?.by_soap]);
  const doctorRows = useMemo(() => toDoctorChartRows(stats?.by_doctor), [stats?.by_doctor]);
  const hasData = (stats?.total_signed_with_ai ?? 0) > 0;
  const hasActiveFilters = Boolean(filters.dateFrom || filters.dateTo || filters.specialtyId);

  function handlePresetChange(next: AiAccuracyDatePreset) {
    setPreset(next);
    if (next !== "custom") {
      setDateFrom(undefined);
      setDateTo(undefined);
    }
  }

  function handleReset() {
    setPreset("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSpecialtyId("__all__");
  }

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !stats) {
    return <p className="text-destructive text-sm">{(error as Error).message}</p>;
  }

  const retention = stats?.avg_ai_retention_pct ?? 0;
  const editRate = stats?.edit_rate_pct ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Báo cáo độ chính xác AI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thống kê tỷ lệ nội dung bệnh án do AI sinh ra được bác sĩ giữ nguyên hoặc chỉnh sửa.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Khoảng thời gian</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={preset === item.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handlePresetChange(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {preset === "custom" && (
            <div className="grid gap-3 sm:grid-cols-2 max-w-md">
              <DatePickerField
                label="Từ ngày"
                value={dateFrom}
                onChange={setDateFrom}
              />
              <DatePickerField
                label="Đến ngày"
                value={dateTo}
                onChange={setDateTo}
                disabledDate={(date) => (dateFrom ? date < dateFrom : false)}
              />
            </div>
          )}

          <div className="space-y-2 max-w-xs">
            <label htmlFor="ai-accuracy-specialty" className="text-xs font-medium text-muted-foreground">
              Chuyên khoa
            </label>
            <Select value={specialtyId} onValueChange={setSpecialtyId}>
              <SelectTrigger id="ai-accuracy-specialty" className="cursor-pointer">
                <SelectValue placeholder="Tất cả chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tất cả chuyên khoa</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleReset}
              disabled={!hasActiveFilters && preset === "all" && specialtyId === "__all__"}
            >
              <RotateCcw className="h-4 w-4" />
              Xóa lọc
            </Button>
            {isFetching && stats && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng hồ sơ có AI baseline"
          value={String(stats?.total_signed_with_ai ?? 0)}
          subtitle="Hồ sơ đã ký có dữ liệu AI"
        />
        <StatCard
          title="Bác sĩ đã chỉnh sửa"
          value={String(stats?.doctor_edited_count ?? 0)}
          subtitle="Có thay đổi so với AI"
          icon={<TrendingDown className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="Tỷ lệ giữ nguyên AI"
          value={`${retention}%`}
          subtitle="Nội dung AI được giữ"
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Tỷ lệ chỉnh sửa"
          value={`${editRate}%`}
          subtitle="Bác sĩ thay đổi nội dung"
        />
      </div>

      {hasData ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chỉ số theo thành phần SOAP</CardTitle>
              <p className="text-xs text-muted-foreground">
                Tỷ lệ giữ nguyên AI so với chỉnh sửa của bác sĩ trên từng phần S/O/A/P.
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={soapRows} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    unit="%"
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload;
                      if (!row) return "";
                      return `${row.label} · ${row.editedCount} hồ sơ đã sửa`;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="retentionPct"
                    name="Giữ nguyên AI"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="editPct"
                    name="Chỉnh sửa"
                    fill="hsl(var(--primary) / 0.35)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hiệu suất theo bác sĩ</CardTitle>
              <p className="text-xs text-muted-foreground">
                Tỷ lệ giữ nguyên nội dung AI trên hồ sơ đã ký của từng bác sĩ.
              </p>
            </CardHeader>
            <CardContent>
              {doctorRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu bác sĩ.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(280, doctorRows.length * 44)}>
                  <BarChart data={doctorRows} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      unit="%"
                    />
                    <YAxis
                      type="category"
                      dataKey="doctorName"
                      width={120}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Giữ nguyên AI"]}
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload;
                        if (!row) return "";
                        return `${row.doctorName} · ${row.total} hồ sơ · sửa ${row.editRatePct}%`;
                      }}
                    />
                    <Bar
                      dataKey="retentionPct"
                      name="Giữ nguyên AI"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Chưa có dữ liệu trong bộ lọc đã chọn
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Giải thích chỉ số</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Hệ thống so sánh bản SOAP do AI đề xuất với bản cuối cùng bác sĩ ký duyệt,
            tính tỷ lệ chênh lệch văn bản (Delta Log Service).
          </p>
          <p>
            Chỉ tài khoản Quản trị viên mới truy cập được màn hình này.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
  disabledDate,
}: {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabledDate?: (date: Date) => boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 w-full justify-start text-left font-normal cursor-pointer",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatDateDisplay(value) : label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={disabledDate}
            locale={vi}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function StatCard({
  title, value, subtitle, icon,
}: {
  title: string; value: string; subtitle: string; icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          {icon}
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
