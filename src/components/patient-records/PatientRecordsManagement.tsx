import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FileUser, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import PatientRecordDetailPanel from "@/components/patient-records/PatientRecordDetailPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPatientRecordById, listPatientRecords } from "@/lib/patient-records";
import { supabase } from "@/lib/supabase";
import type { PatientRecordListRow } from "@/types/patient-portal";

const PATIENT_RECORDS_LIST_KEY = ["patient-records", "list"] as const;

function formatDob(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return iso.slice(0, 16);
  }
}

function statusClass(status: PatientRecordListRow["status"]) {
  return status === "Đã nộp"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-amber-100 text-amber-800";
}

function matchesSearch(row: PatientRecordListRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [
    row.full_name,
    row.email_address,
    row.phone_number,
    row.id_number,
    row.member_id,
    row.insurance_provider,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

type PatientRecordsManagementProps = {
  /** admin | doctor — chỉ khác tiêu đề / mô tả */
  portal: "admin" | "doctor";
};

const PatientRecordsManagement = ({ portal }: PatientRecordsManagementProps) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: PATIENT_RECORDS_LIST_KEY,
    queryFn: async () => {
      const { rows: list, error: listError } = await listPatientRecords(supabase);
      if (listError) throw listError;
      return list;
    },
  });

  const filtered = useMemo(
    () => rows.filter((row) => matchesSearch(row, search)),
    [rows, search],
  );

  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ["patient-records", "detail", selectedId],
    queryFn: async () => {
      const { record, error: detailErr } = await getPatientRecordById(
        supabase,
        selectedId as string,
      );
      if (detailErr) throw detailErr;
      return record;
    },
    enabled: Boolean(selectedId) && sheetOpen,
  });

  const openDetail = (id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  const title =
    portal === "admin" ? "Quản lý hồ sơ bệnh nhân" : "Hồ sơ bệnh nhân";
  const subtitle =
    portal === "admin"
      ? "Dữ liệu từ bảng public.patient trên Supabase (onboarding bệnh nhân)."
      : "Dữ liệu từ bảng public.patient — tra cứu phục vụ khám và điều trị.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            <FileUser className="h-7 w-7 text-primary" aria-hidden="true" />
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-10 shrink-0"
          disabled={isFetching}
          onClick={() => {
            void refetch().then(() => toast.success("Đã làm mới danh sách"));
          }}
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          Làm mới
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Tìm theo tên, email, SĐT, CCCD, mã BHYT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 pl-10"
            aria-label="Tìm hồ sơ bệnh nhân"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} / {rows.length} hồ sơ
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Đang tải danh sách…
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-sm text-destructive" role="alert">
              {(error as Error)?.message ?? "Không tải được danh sách hồ sơ."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Chạy migration <code className="rounded bg-muted px-1">20260225200000_patient_staff_read_fix</code>{" "}
              trên Supabase và đăng xuất/đăng nhập lại tài khoản bác sĩ hoặc admin.
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {rows.length === 0
              ? "Chưa có hồ sơ bệnh nhân nào trong hệ thống."
              : "Không có kết quả phù hợp từ khóa tìm kiếm."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số CCCD</TableHead>
                  <TableHead>Mã BHYT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetail(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDetail(row.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Xem hồ sơ ${row.full_name}`}
                  >
                    <TableCell className="font-medium">{row.full_name}</TableCell>
                    <TableCell>{formatDob(row.date_of_birth)}</TableCell>
                    <TableCell>{row.phone_number ?? "—"}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {row.email_address ?? "—"}
                    </TableCell>
                    <TableCell>{row.id_number ?? "—"}</TableCell>
                    <TableCell>{row.member_id ?? "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDateTime(row.updated_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Chi tiết hồ sơ</SheetTitle>
            <SheetDescription>
              Thông tin cá nhân, giấy tờ và bảo hiểm từ onboarding.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PatientRecordDetailPanel
              profile={detail ?? null}
              isLoading={detailLoading}
              isError={detailError}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PatientRecordsManagement;
