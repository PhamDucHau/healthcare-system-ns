import { Search, User, Calendar, FlaskConical, CreditCard, Lock, MessageSquare, ChevronRight, AlertTriangle, ExternalLink, FileText } from "lucide-react";

const categories = [
  {
    icon: User,
    title: "Account & Login",
    description: "Password resets, account settings, and data privacy.",
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
  {
    icon: Calendar,
    title: "Appointments",
    description: "Scheduling, rescheduling, and video call setup.",
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
  {
    icon: FlaskConical,
    title: "Labs & Kits",
    description: "At-home test kits, lab orders, and result timelines.",
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
  {
    icon: CreditCard,
    title: "Insurance & Billing",
    description: "Coverage questions, claims, and payment methods.",
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
];

const popularSearches = ["Lab results", "PrEP delivery", "Insurance update"];

const resources = [
  { label: "Privacy Policy", icon: ExternalLink },
  { label: "Patient Bill of Rights", icon: ExternalLink },
  { label: "Lab Preparation Guide", icon: FileText },
];

const SupportContent = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-accent to-accent/40 p-6 md:p-10 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            How can we <span className="italic text-primary">help you</span> today?
          </h1>
          <div className="mt-5 max-w-xl">
            <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for answers, guides, and resources..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {popularSearches.map((term) => (
                <button key={term} className="text-xs font-medium text-primary hover:underline">
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Browse by Category */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-1">Browse by Category</h2>
          <p className="text-sm text-muted-foreground mb-5">Find quick answers to common questions.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
                  <div className={`h-10 w-10 rounded-xl ${cat.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${cat.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cat.description}</p>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    View Topics
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Still need support */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground mb-1">Still need support?</h2>
            <p className="text-sm text-muted-foreground mb-5">Our care team is available Mon-Fri, 9am - 6pm EST.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Secure Messaging */}
              <div className="rounded-xl border bg-card p-5 flex flex-col">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">Secure Messaging</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
                  Direct and private communication with your dedicated clinical care team.
                </p>
                <button className="w-full rounded-lg border border-primary/20 py-2.5 text-sm font-semibold text-primary hover:bg-accent transition-colors">
                  Start Message
                </button>
              </div>

              {/* Customer Support Chat */}
              <div className="rounded-xl bg-muted/50 p-5 flex flex-col">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">Customer Support Chat</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
                  Quick help for account, billing, or shipping inquiries from our support agents.
                </p>
                <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                  Chat Now
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Emergency Contact */}
            <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">Emergency Contact</span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">In an Emergency</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                If you are experiencing a medical emergency, please call <span className="font-bold text-foreground">911</span> or visit the nearest emergency room immediately.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For crisis support, call or text <span className="font-bold text-foreground">988</span>.
              </p>
            </div>

            {/* Frequent Resources */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Frequent Resources</h3>
              <div className="space-y-2">
                {resources.map((res, idx) => {
                  const ResIcon = res.icon;
                  return (
                    <button key={idx} className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      {res.label}
                      <ResIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SupportContent;
