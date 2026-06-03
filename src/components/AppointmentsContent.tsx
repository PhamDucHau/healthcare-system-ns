import { Calendar, Video, MapPin, CheckCircle2, ChevronRight, Plus, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingAppointments = [
  {
    title: "PrEP Quarterly Follow-Up",
    date: "Oct 24, 2024, 10:30 AM EST",
    type: "Telemedicine",
    provider: "April Jewell, APRN, AAHIVS",
    specialty: "Primary Care Provider",
    initials: "AJ",
    action: "Join Video Call",
    actionIcon: Video,
    actionVariant: "primary" as const,
  },
  {
    title: "Annual Health Screening",
    date: "Nov 12, 2024, 09:15 AM EST",
    type: "In-Clinic",
    provider: "Marcus Chen, MD",
    specialty: "Internal Medicine Specialist",
    initials: "MC",
    action: "Get Directions",
    actionIcon: MapPin,
    actionVariant: "outline" as const,
  },
];

const pastAppointments = [
  {
    date: "Aug 12, 2024",
    time: "10:00 AM EST",
    type: "Routine Bloodwork",
    visitMode: "In-person",
    provider: "April Jewell, APRN",
    initials: "AJ",
  },
  {
    date: "May 15, 2024",
    time: "02:30 PM EST",
    type: "Initial Consultation",
    visitMode: "Video Call",
    provider: "Marcus Chen, MD",
    initials: "MC",
  },
  {
    date: "Feb 02, 2024",
    time: "11:15 AM EST",
    type: "STI Testing",
    visitMode: "Lab Visit",
    provider: "Lab Corp Facility",
    initials: "LC",
  },
];

const AppointmentsContent = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Your Appointments</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your upcoming health consultations and review past visits.
            </p>
          </div>
          <button className="mt-4 sm:mt-0 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            Book New Appointment
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-foreground">Upcoming Appointments</h2>
            <div className="flex-1 border-t border-dashed" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingAppointments.map((apt, idx) => {
              const ActionIcon = apt.actionIcon;
              return (
                <div key={idx} className="rounded-xl border bg-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        {apt.type === "Telemedicine" ? (
                          <Calendar className="h-5 w-5 text-primary" />
                        ) : (
                          <Stethoscope className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{apt.title}</p>
                        <p className="text-xs font-semibold text-primary">{apt.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        apt.type === "Telemedicine"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-muted-foreground/30 bg-muted text-foreground"
                      }`}
                    >
                      {apt.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 mb-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {apt.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{apt.provider}</p>
                      <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                        apt.actionVariant === "primary"
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      <ActionIcon className="h-4 w-4" />
                      {apt.action}
                    </button>
                    <button className="text-sm font-semibold text-primary hover:underline">
                      Reschedule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Past Appointments */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-foreground">Past Appointments</h2>
            <div className="flex-1 border-t border-dashed" />
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type of Visit</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAppointments.map((apt, idx) => (
                    <tr key={idx} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-foreground">{apt.date}</p>
                        <p className="text-xs text-muted-foreground">{apt.time}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground">{apt.type}</p>
                        <p className="text-xs text-primary">{apt.visitMode}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                            {apt.initials}
                          </div>
                          <p className="text-sm text-foreground">{apt.provider}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                          <span className="h-1.5 w-1.5 rounded-full bg-success" />
                          Completed
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                          View Summary
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* All caught up banner */}
        <div className="rounded-xl bg-gradient-to-r from-accent to-accent/30 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-card flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-foreground">You're all caught up!</p>
            <p className="text-xs text-muted-foreground">
              There are no urgent tasks or health forms requiring your attention today. Take a moment for yourself.
            </p>
          </div>
          <button className="rounded-lg border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors flex-shrink-0">
            Review Health Goal
          </button>
        </div>
      </div>
    </main>
  );
};

export default AppointmentsContent;
