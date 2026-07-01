import { Link } from "react-router-dom";
import { Heart, BadgeCheck, Shield, Globe, Users, Quote, Stethoscope, Microscope, UserCheck, ShieldCheck } from "lucide-react";

const missionValues = [
  { icon: Heart, title: "Empathy First", description: "We listen before we treat. Every patient's story is the foundation of their care plan.", color: "text-primary" },
  { icon: BadgeCheck, title: "Clinical Excellence", description: "Evidence-based medicine delivered by specialists who understand LGBTQ+ health needs.", color: "text-blue-600" },
];

const coreValues = [
  {
    title: "Inclusivity",
    description: "Beyond acceptance. We celebrate diversity in all its prismatic forms.",
    large: true,
  },
  {
    icon: Shield,
    title: "Privacy",
    description: "Your health data is sacred. We employ military-grade security to ensure your journey stays yours.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Removing barriers—be they financial, geographical, or digital—to ensure care is a right, not a privilege.",
  },
];

const advisors = [
  { name: "Dr. Elena Rodriguez", role: "CHIEF MEDICAL OFFICER", color: "from-primary/80 to-primary/40" },
  { name: "Dr. Marcus Chen", role: "INFECTIOUS DISEASE", color: "from-blue-600/80 to-blue-400/40" },
  { name: "Jordan Smith, NP", role: "GENDER CARE LEAD", color: "from-primary/80 to-primary/40" },
  { name: "Dr. David Miller", role: "HIV PREVENTION SPECIALIST", color: "from-blue-600/80 to-blue-400/40" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Link to="/" className="text-lg font-bold text-primary">Rcare Plus</Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Our Care</Link>
          <Link to="/about" className="text-sm font-medium text-foreground underline underline-offset-4">About Us</Link>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Patients</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Providers</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/signup" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-6">
              Our Identity
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Redefining Care for the{" "}
              <span className="text-primary">Community.</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md">
              At Rcare Plus, we believe healthcare isn't just about medicine—it's about belonging. We curate inclusive clinical experiences where empathy meets excellence.
            </p>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-accent to-muted aspect-[4/3] flex items-center justify-center overflow-hidden">
              <div className="text-center p-8">
                <Users className="h-20 w-20 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Our Care Team</p>
              </div>
              <div className="absolute bottom-4 left-4 rounded-xl bg-primary p-3 text-primary-foreground">
                <p className="text-xs font-bold">100% LGBTQ+ Owned</p>
                <p className="text-[10px] opacity-80">Built by the community, for the community, with zero judgment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-start mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            To bridge the gap in healthcare equity by providing{" "}
            <strong className="text-foreground">radically inclusive</strong>, specialty care that honors every individual's unique journey and identity.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {missionValues.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div key={idx} className="rounded-xl border bg-card p-6">
                <Icon className={`h-8 w-8 ${v.color} mb-4`} />
                <h3 className="text-base font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Inclusivity - large card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/80 to-primary/40 p-8 flex flex-col justify-end min-h-[240px]">
              <h3 className="text-xl font-bold text-primary-foreground mb-2">Inclusivity</h3>
              <p className="text-sm text-primary-foreground/80">Beyond acceptance. We celebrate diversity in all its prismatic forms.</p>
            </div>
            {/* Privacy */}
            <div className="rounded-xl border bg-background p-8">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-base font-bold mb-2">Privacy</h3>
              <p className="text-sm text-muted-foreground">Your health data is sacred. We employ military-grade security to ensure your journey stays yours.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Accessibility */}
            <div className="rounded-xl border bg-background p-8">
              <Globe className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-base font-bold mb-2">Accessibility</h3>
              <p className="text-sm text-muted-foreground">Removing barriers—be they financial, geographical, or digital—to ensure care is a right, not a privilege.</p>
            </div>
            {/* Quote */}
            <div className="flex items-center p-8">
              <div>
                <span className="text-6xl font-bold text-muted/60">03</span>
                <p className="text-base italic text-muted-foreground mt-2">
                  "We're not just building a platform; we're building a sanctuary where clinical data meets human dignity."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Advisory Board */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Clinical Advisory Board</h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Led by world-class clinicians who are pioneers in LGBTQ+ healthcare, HIV prevention, and gender-affirming care.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {advisors.map((a, idx) => (
            <div key={idx}>
              <div className={`rounded-2xl bg-gradient-to-b ${a.color} aspect-[3/4] flex items-end justify-center overflow-hidden mb-3`}>
                <div className="p-3 w-full">
                  <div className="rounded-lg bg-foreground/60 backdrop-blur-sm px-3 py-1.5 inline-block">
                    <span className="text-[10px] font-bold text-card uppercase tracking-wider">Clinical</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-bold">{a.name}</p>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">{a.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-10 md:p-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Join the Journey toward Healthcare Equity.
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-md mx-auto mb-8">
            Whether you're looking for care or looking to change the world with us, there's a seat at our table.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="rounded-lg bg-card px-6 py-3 text-sm font-semibold text-primary hover:opacity-90 transition-opacity">
              Get Care Now
            </Link>
            <a href="#" className="rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
              View Careers
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="text-base font-bold text-foreground">Rcare Plus</span>
            <p className="text-xs text-muted-foreground mt-1">© 2024 Rcare Plus. Healthcare for the modern world.</p>
          </div>
          <div>
            <p className="text-xs font-bold mb-2">Company</p>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Mission</a>
              <a href="#" className="hover:text-foreground transition-colors">Clinical Team</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2">Legal</p>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2">Contact</p>
            <p className="text-xs text-muted-foreground">support@rcareplus.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
