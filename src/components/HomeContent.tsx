import { User, Calendar, FlaskConical, MessageSquare, Pill, ClipboardCheck, Heart, Activity, Moon, Brain } from "lucide-react";
import { Link } from "react-router-dom";

const dashboardItems = [
  { icon: User, title: "Account", subtitle: "Profile & Security", path: "/account", iconBg: "bg-accent", iconColor: "text-primary" },
  { icon: Calendar, title: "Appointments", subtitle: "View your schedule", path: "/appointments", iconBg: "bg-accent", iconColor: "text-primary" },
  { icon: ClipboardCheck, title: "Assessments", subtitle: "Health check-ins", path: "/", iconBg: "bg-muted", iconColor: "text-muted-foreground" },
  { icon: FlaskConical, title: "Labs", subtitle: "Test results & data", path: "/labs", iconBg: "bg-accent", iconColor: "text-primary" },
  { icon: Pill, title: "Rx", subtitle: "Prescriptions & refills", path: "/", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { icon: MessageSquare, title: "Messages", subtitle: "Direct care team chat", path: "/messages", iconBg: "bg-muted", iconColor: "text-muted-foreground" },
];

const wellnessStats = [
  { label: "Activity", value: "12.4k", sub: "Steps today", icon: Activity },
  { label: "Sleep", value: "7h 42m", sub: "Deep recovery", icon: Moon },
  { label: "Focus", value: "Optimal", sub: "Vitals baseline", icon: Brain },
];

const HomeContent = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-accent to-accent/40 p-6 md:p-10 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Good morning, <span className="text-primary">Timmy!</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Your health sanctuary is updated and ready. Explore your personalized modules or schedule a consultation with our empathetic team.
          </p>
        </div>

        {/* Health Dashboard */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Health Dashboard</h2>
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              All systems active
              <span className="h-2 w-2 rounded-full bg-success" />
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dashboardItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <div className={`h-10 w-10 rounded-xl ${item.iconBg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Journey Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Your Journey Progress</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We track your daily health goals and clinical tasks to ensure you stay on the path to peak wellness.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center mb-3">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">All caught up!</p>
            <p className="text-xs text-muted-foreground mb-4">You don't have any tasks at the moment</p>
            <button className="rounded-lg border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Review History
            </button>
          </div>
        </div>

        {/* Wellness Stats Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-foreground/80 to-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 to-foreground/40" />
          <div className="relative p-6 md:p-8">
            <div className="grid grid-cols-3 gap-4">
              {wellnessStats.map((stat, idx) => (
                <div key={idx} className="rounded-xl bg-card/10 backdrop-blur-sm p-4 border border-card/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-card/70 mb-1">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-card">{stat.value}</p>
                  <p className="text-xs text-card/60">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeContent;
