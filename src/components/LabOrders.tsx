import { FlaskConical, Upload, Info, ShieldCheck, MessageSquare, Package, Eye, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const labOrders = [
  {
    vendor: "Quest Diagnostics",
    name: "Comprehensive Metabolic Panel",
    date: "Ordered on Oct 12, 2023",
    status: "Ready",
    statusColor: "text-success",
    action: "View Results",
    actionVariant: "primary" as const,
    icon: FlaskConical,
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
  {
    vendor: "Ash Wellness",
    name: "PrEP Baseline Screening Kit",
    date: "Status: Sample at laboratory",
    status: "Lab Processing",
    statusColor: "text-warning",
    action: "Track Kit",
    actionVariant: "outline" as const,
    icon: Package,
    iconBg: "bg-secondary",
    iconColor: "text-primary",
    tracking: "USPS: 9400 1000 0000 0000 0000 00",
  },
  {
    vendor: "Quest Diagnostics",
    name: "STI 10-Panel Screening",
    date: "Ordered on Oct 24, 2023",
    status: "Lab Processing",
    statusColor: "text-warning",
    action: "Track Order",
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
        {/* Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-accent to-accent/40 p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Your Lab Results & <span className="text-primary">Tracking</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg">
            Stay updated on your health journey. Monitor active orders and securely upload external records.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Lab Orders */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Recent Lab Orders</h2>
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success font-semibold text-xs">
                3 Active Records
              </Badge>
            </div>

            {labOrders.map((order, idx) => {
              const Icon = order.icon;
              return (
                <div key={idx} className="rounded-xl border bg-card p-4 md:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${order.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${order.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Vendor</p>
                      <p className="text-sm font-semibold text-foreground">{order.vendor}</p>
                      <p className="text-base font-bold text-foreground">{order.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                      {order.tracking && (
                        <p className="text-[10px] text-muted-foreground mt-1">{order.tracking}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${order.status === "Ready" ? "bg-success" : "bg-warning"}`} />
                        <span className={`text-xs font-medium ${order.status === "Ready" ? "text-success" : "text-warning"}`}>
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
                        {order.actionVariant === "outline" && order.action === "Track Kit" && (
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

          {/* Right column - Upload & Notes */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Upload Card */}
              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-accent flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">Upload Lab Results</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Have records from an external provider? Drag and drop them here or click to browse.
                </p>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-4 cursor-pointer hover:border-primary/30 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Accepts PDF, JPG, PNG
                  </p>
                </div>
              </div>

              {/* Laboratory Notes */}
              <div className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">Laboratory Notes</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Results typically arrive 3-5 business days after the lab receives your sample.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All clinical data is encrypted and HIPAA compliant for your privacy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="rounded-xl border-2 border-primary/20 bg-card p-5 text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Need help understanding your labs?</p>
                <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 mx-auto">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat with a Care Specialist
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
