import { FlaskConical, Upload, Info, ShieldCheck, MessageSquare, Package, Eye, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const labOrders = [
  {
    vendor: "MedLab Việt Nam",
    name: "Xét nghiệm chuyển hóa toàn diện",
    date: "Đặt ngày 12/10/2023",
    status: "Sẵn sàng",
    statusKey: "ready" as const,
    action: "Xem kết quả",
    actionVariant: "primary" as const,
    icon: FlaskConical,
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
  {
    vendor: "Ash Wellness",
    name: "Bộ sàng lọc PrEP ban đầu",
    date: "Trạng thái: Mẫu đã đến phòng xét nghiệm",
    status: "Đang xử lý",
    statusKey: "processing" as const,
    action: "Theo dõi bộ kit",
    actionVariant: "outline" as const,
    icon: Package,
    iconBg: "bg-secondary",
    iconColor: "text-primary",
    tracking: "Viettel Post: 9400 1000 0000 0000 0000 00",
  },
  {
    vendor: "MedLab Việt Nam",
    name: "Sàng lọc STI 10 chỉ số",
    date: "Đặt ngày 24/10/2023",
    status: "Đang xử lý",
    statusKey: "processing" as const,
    action: "Theo dõi đơn hàng",
    actionVariant: "outline" as const,
    icon: FlaskConical,
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
];

const LabOrders = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-r from-accent to-accent/40 p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Kết quả xét nghiệm & <span className="text-primary">theo dõi</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg">
            Cập nhật hành trình sức khỏe của bạn. Theo dõi đơn hàng đang xử lý và tải lên hồ sơ từ cơ sở y tế khác một cách an toàn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Đơn xét nghiệm gần đây</h2>
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success font-semibold text-xs">
                3 hồ sơ đang hoạt động
              </Badge>
            </div>

            {labOrders.map((order, idx) => {
              const Icon = order.icon;
              const isReady = order.statusKey === "ready";
              return (
                <div key={idx} className="rounded-xl border bg-card p-4 md:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${order.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${order.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Đơn vị thực hiện</p>
                      <p className="text-sm font-semibold text-foreground">{order.vendor}</p>
                      <p className="text-base font-bold text-foreground">{order.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                      {order.tracking && (
                        <p className="text-[10px] text-muted-foreground mt-1">{order.tracking}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${isReady ? "bg-success" : "bg-warning"}`} />
                        <span className={`text-xs font-medium ${isReady ? "text-success" : "text-warning"}`}>
                          {order.status}
                        </span>
                      </div>
                      <button
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                          order.actionVariant === "primary"
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "border border-primary/20 text-primary hover:bg-accent"
                        }`}
                      >
                        {order.actionVariant === "outline" && order.action.includes("kit") && (
                          <MapPin className="h-3.5 w-3.5 inline mr-1.5" />
                        )}
                        {order.actionVariant === "primary" && (
                          <Eye className="h-3.5 w-3.5 inline mr-1.5" />
                        )}
                        {order.action}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-accent flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">Tải lên kết quả xét nghiệm</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Có hồ sơ từ cơ sở y tế khác? Kéo thả vào đây hoặc nhấn để chọn tệp.
                </p>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-4 cursor-pointer hover:border-primary/30 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Hỗ trợ PDF, JPG, PNG
                  </p>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">Ghi chú phòng xét nghiệm</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Kết quả thường có sau 3–5 ngày làm việc kể từ khi phòng xét nghiệm nhận mẫu.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mọi dữ liệu lâm sàng được mã hóa và tuân thủ quy định bảo mật y tế.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border-2 border-primary/20 bg-card p-5 text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Cần hỗ trợ hiểu kết quả xét nghiệm?</p>
                <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 mx-auto">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Trò chuyện với chuyên viên chăm sóc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LabOrders;
