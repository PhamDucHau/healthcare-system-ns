import { useEffect, useState } from "react";
import { Brain, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiAccuracyStats, type AiAccuracyStats } from "@/lib/emr-api";

export default function AdminAiAccuracyPage() {
  const [stats, setStats] = useState<AiAccuracyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getAiAccuracyStats()
      .then(setStats)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  const retention = stats?.avg_ai_retention_pct ?? 0;
  const editRate = stats?.edit_rate_pct ?? 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Báo cáo độ chính xác AI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thống kê tỷ lệ nội dung bệnh án do AI sinh ra được bác sĩ giữ nguyên hoặc chỉnh sửa.
        </p>
      </div>

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
