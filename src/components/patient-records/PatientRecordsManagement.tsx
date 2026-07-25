import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileUser,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { toast } from "sonner";
import AdminEditPatientDialog from "@/components/admin/patients/AdminEditPatientDialog";
import AdminNewPatientDialog from "@/components/admin/patients/AdminNewPatientDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  searchPatientRecords,
  type PatientRecordSortField,
  type PatientRecordsListParams,
} from "@/lib/patient-records";
import { supabase } from "@/lib/supabase";
import {
  formatCreatedByRole,
  type PatientCreatedByRole,
  type PatientRecordListRow,
} from "@/types/patient-portal";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type PatientRecordsFilters = {
  status: "all" | "submitted" | "draft";
  createdByRole: PatientCreatedByRole | "all";
  dateFrom: string;
  dateTo: string;
};

type PatientRecordsSort = {
  field: PatientRecordSortField;
  dir: "asc" | "desc";
};

const DEFAULT_FILTERS: PatientRecordsFilters = {
  status: "all",
  createdByRole: "all",
  dateFrom: "",
  dateTo: "",
};

const DEFAULT_SORT: PatientRecordsSort = {
  field: "updated_at",
  dir: "desc",
};

function listQueryKey(params: PatientRecordsListParams) {
  return ["patient-records", "list", params] as const;
}

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

function createdByRoleClass(role: PatientCreatedByRole | null) {
  switch (role) {
    case "patient":
      return "bg-sky-100 text-sky-800";
    case "doctor":
      return "bg-violet-100 text-violet-800";
    case "nurse":
      return "bg-teal-100 text-teal-800";
    case "admin":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

function hasActiveFilters(filters: PatientRecordsFilters, search: string): boolean {
  return Boolean(
    search ||
      filters.status !== "all" ||
      filters.createdByRole !== "all" ||
      filters.dateFrom ||
      filters.dateTo,
  );
}

type SortableHeadProps = {
  label: string;
  field: PatientRecordSortField;
  sort: PatientRecordsSort;
  onSort: (field: PatientRecordSortField) => void;
  className?: string;
};

function SortableHead({ label, field, sort, onSort, className }: SortableHeadProps) {
  const active = sort.field === field;
  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 font-semibold text-foreground transition-colors hover:text-foreground"
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/70"}`} />
      </button>
    </TableHead>
  );
}

type PatientRecordsManagementProps = {
  portal: "admin" | "doctor";
};

const PatientRecordsManagement = ({ portal }: PatientRecordsManagementProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<PatientRecordsFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<PatientRecordsSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PatientRecordListRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, sort, pageSize]);

  const queryParams = useMemo<PatientRecordsListParams>(
    () => ({
      search: debouncedSearch || undefined,
      page,
      limit: pageSize,
      status: filters.status,
      createdByRole: filters.createdByRole,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      sortBy: sort.field,
      sortDir: sort.dir,
    }),
    [debouncedSearch, page, pageSize, filters, sort],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: listQueryKey(queryParams),
    queryFn: async () => {
      const { rows, total, error: listError } = await searchPatientRecords(supabase, queryParams);
      if (listError) throw listError;
      return { rows, total };
    },
    placeholderData: (previous) => previous,
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visiblePages = getVisiblePages(page, totalPages);
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = total === 0 ? 0 : Math.min(page * pageSize, total);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setEditOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error: deleteError } = await supabase.from("patient").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (deleteError) {
      toast.error("Xóa thất bại", { description: deleteError.message });
    } else {
      toast.success(`Đã xóa hồ sơ ${deleteTarget.full_name}`);
      setDeleteTarget(null);
      void refetch();
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
    setPage(1);
  };

  const toggleSort = (field: PatientRecordSortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const title = portal === "admin" ? "Quản lý hồ sơ bệnh nhân" : "Hồ sơ bệnh nhân";
  const stickyActionClass =
    "sticky right-0 z-10 min-w-[4.5rem] border-l bg-white group-even:bg-[#FCFCFC] group-hover:bg-[#F9FAFB] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]";
  const stickyHeadClass =
    "sticky right-0 z-30 min-w-[4.5rem] border-l border-b-2 border-border bg-[#F8FAFC] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              <FileUser className="h-7 w-7 text-primary" aria-hidden="true" />
              {title}
            </h1>
            {/* {total > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Tổng <span className="font-semibold text-foreground">{total}</span> hồ sơ
              </p>
            ) : null} */}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" className="min-h-10 shrink-0" onClick={() => setNewPatientOpen(true)}>
              <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
              Tạo hồ sơ
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={isFetching}
                  aria-label="Làm mới danh sách"
                  onClick={() => {
                    void refetch().then(() => toast.success("Đã làm mới danh sách"));
                  }}
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Làm mới</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="relative w-full max-w-[560px] shrink-0">
            <Search
              className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Tìm theo tên, email, SĐT, CCCD, mã BHYT…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11 border-2 border-neutral-300 bg-white pl-10 focus-visible:border-neutral-400"
              aria-label="Tìm hồ sơ bệnh nhân"
            />
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">Trạng thái</Label>
              <Select
                value={filters.status}
                onValueChange={(value: PatientRecordsFilters["status"]) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-10 w-[140px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="submitted">Đã nộp</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">Nguồn tạo</Label>
              <Select
                value={filters.createdByRole}
                onValueChange={(value: PatientRecordsFilters["createdByRole"]) =>
                  setFilters((prev) => ({ ...prev, createdByRole: value }))
                }
              >
                <SelectTrigger className="h-10 w-[160px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="patient">Bệnh nhân</SelectItem>
                  <SelectItem value="doctor">Bác sĩ</SelectItem>
                  <SelectItem value="nurse">Điều dưỡng</SelectItem>
                  <SelectItem value="admin">Quản trị</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="date-from" className="text-xs font-semibold text-foreground">
                Từ ngày
              </Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="h-10 w-[140px] border-neutral-300 bg-white"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="date-to" className="text-xs font-semibold text-foreground">
                Đến ngày
              </Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="h-10 w-[140px] border-neutral-300 bg-white"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0 border-neutral-300 bg-white px-4"
              disabled={!hasActiveFilters(filters, debouncedSearch)}
              onClick={resetFilters}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          {isLoading && !data ? (
            <div className="space-y-0 p-0">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="flex gap-3 border-b px-4 py-3 last:border-0">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <p className="text-sm text-destructive" role="alert">
                {(error as Error)?.message ?? "Không tải được danh sách hồ sơ."}
              </p>
              <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FileUser className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters(filters, debouncedSearch)
                  ? "Không có kết quả phù hợp với bộ lọc hiện tại."
                  : "Chưa có hồ sơ bệnh nhân nào trong hệ thống."}
              </p>
              {hasActiveFilters(filters, debouncedSearch) ? (
                <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <Table className="min-w-[1000px] text-sm [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3 [&_th]:py-2.5">
                <TableHeader className="sticky top-0 z-20 bg-[#F8FAFC] [&_th]:font-semibold [&_th]:text-foreground [&_tr]:border-b-2 [&_tr]:border-border">
                  <TableRow className="hover:bg-transparent">
                    <SortableHead
                      label="Họ tên"
                      field="full_name"
                      sort={sort}
                      onSort={toggleSort}
                      className="min-w-[140px] max-w-[220px] bg-[#F8FAFC]"
                    />
                    <SortableHead
                      label="Ngày sinh"
                      field="date_of_birth"
                      sort={sort}
                      onSort={toggleSort}
                      className="whitespace-nowrap bg-[#F8FAFC]"
                    />
                    <TableHead className="whitespace-nowrap bg-[#F8FAFC]">
                      SĐT
                    </TableHead>
                    <TableHead className="hidden max-w-[200px] bg-[#F8FAFC] xl:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden whitespace-nowrap bg-[#F8FAFC] lg:table-cell">
                      Số CCCD
                    </TableHead>
                    <TableHead className="hidden whitespace-nowrap bg-[#F8FAFC] lg:table-cell">
                      Mã BHYT
                    </TableHead>
                    <TableHead className="whitespace-nowrap bg-[#F8FAFC] lg:hidden">
                      Giấy tờ
                    </TableHead>
                    <TableHead className="whitespace-nowrap bg-[#F8FAFC]">
                      Trạng thái
                    </TableHead>
                    <TableHead className="whitespace-nowrap bg-[#F8FAFC]">
                      Nguồn tạo
                    </TableHead>
                    <SortableHead
                      label="Cập nhật"
                      field="updated_at"
                      sort={sort}
                      onSort={toggleSort}
                      className="whitespace-nowrap bg-[#F8FAFC]"
                    />
                    <TableHead className={`${stickyHeadClass} text-right`}>
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="group cursor-pointer border-b border-border/50 even:bg-[#FCFCFC] hover:bg-[#F9FAFB]"
                      onClick={() => openDetail(row.id)}
                    >
                      <TableCell
                        className="min-w-[140px] max-w-[220px] truncate font-medium"
                        title={row.full_name}
                      >
                        {row.full_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {formatDob(row.date_of_birth)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {row.phone_number ?? "—"}
                      </TableCell>
                      <TableCell
                        className="hidden max-w-[200px] truncate xl:table-cell"
                        title={row.email_address ?? undefined}
                      >
                        {row.email_address ?? "—"}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap tabular-nums lg:table-cell">
                        {row.id_number ?? "—"}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap tabular-nums lg:table-cell">
                        {row.member_id ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums lg:hidden">
                        <div>{row.id_number ?? "—"}</div>
                        <div className="text-muted-foreground">{row.member_id ?? "—"}</div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${createdByRoleClass(row.created_by_role)}`}
                        >
                          {formatCreatedByRole(row.created_by_role)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                        {formatDateTime(row.updated_at)}
                      </TableCell>
                      <TableCell
                        className={`${stickyActionClass} text-right`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => openDetail(row.id)}
                                className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10"
                                aria-label="Sửa hồ sơ"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Sửa</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(row)}
                                className="rounded-md p-1.5 text-destructive transition-colors hover:bg-destructive/10"
                                aria-label="Xóa hồ sơ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span>
                    Hiển thị{" "}
                    <span className="font-semibold text-foreground">
                      {showingFrom}–{showingTo}
                    </span>{" "}
                    / {total} hồ sơ
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Số dòng</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) =>
                        setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])
                      }
                    >
                      <SelectTrigger className="h-8 w-[72px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {isFetching && !isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : null}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1 || isFetching}
                    aria-label="Trang trước"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {visiblePages.map((pageNumber, index) => {
                    const prev = visiblePages[index - 1];
                    const showEllipsis = prev != null && pageNumber - prev > 1;
                    return (
                      <span key={pageNumber} className="flex items-center gap-1">
                        {showEllipsis ? (
                          <span className="px-1 text-muted-foreground">…</span>
                        ) : null}
                        <Button
                          type="button"
                          variant={pageNumber === page ? "default" : "outline"}
                          size="sm"
                          className="h-8 min-w-8 px-2"
                          disabled={isFetching}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      </span>
                    );
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages || isFetching}
                    aria-label="Trang sau"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <AdminEditPatientDialog
          profileId={selectedId}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={() => void refetch()}
        />

        <AdminNewPatientDialog
          open={newPatientOpen}
          onClose={() => setNewPatientOpen(false)}
          onSuccess={() => void refetch()}
          portal={portal === "doctor" ? "provider" : "admin"}
        />

        <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa hồ sơ</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn sắp xóa hồ sơ của <strong>{deleteTarget?.full_name}</strong>.
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default PatientRecordsManagement;
