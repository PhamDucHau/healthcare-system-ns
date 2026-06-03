import { Link } from "react-router-dom";
import { Globe, Shield, Heart, Users, Video, FlaskConical, Pill, Award, ShieldCheck, BadgeCheck, Quote, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Our Care", href: "#our-care" },
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "#cta" },
];

const steps = [
  {
    icon: Video,
    title: "Online Consultation",
    description: "Connect with our expert LGBTQ+ care providers through a secure, non-judgmental video call.",
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
  {
    icon: FlaskConical,
    title: "Home Lab Testing",
    description: "We send a discreet testing kit to your door. Complete it at home and mail it back for free.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Pill,
    title: "Fast Rx Delivery",
    description: "Once approved, your PrEP is shipped discreetly to your home. Refills handled automatically.",
    iconBg: "bg-accent",
    iconColor: "text-primary",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "100% Secure & HIPAA Compliant",
    description: "Your health data is encrypted and protected with industry-leading security standards.",
  },
  {
    icon: Users,
    title: "Expert LGBTQ+ Care Providers",
    description: "Care from clinicians who understand our community's unique needs and history.",
  },
  {
    icon: Heart,
    title: "Inclusive, No-Judgment Support",
    description: "A sanctuary of support where you are seen, heard, and respected for who you are.",
  },
];

const testimonials = [
  {
    quote: "Qcare Plus changed how I view healthcare. I finally feel like my doctor actually understands my life.",
    name: "Alex R.",
    since: "Patient since 2022",
  },
  {
    quote: "The home testing was so easy. No awkward lab visits or explaining myself to strangers.",
    name: "Jordan M.",
    since: "Patient since 2023",
  },
  {
    quote: "Fast delivery and amazing customer support. They truly care about the LGBTQ+ community.",
    name: "Sam T.",
    since: "Patient since 2021",
  },
];

const badges = [
  { icon: Award, title: "EQUALITY 100", subtitle: "LEADER IN LGBTQ+ INCLUSION" },
  { icon: Shield, title: "HIPAA COMPLIANT", subtitle: "SECURE DATA STANDARDS" },
  { icon: BadgeCheck, title: "CLIA CERTIFIED", subtitle: "LABORATORY EXCELLENCE" },
];

const Landing = () => {
  const { session } = useAuth();
  const user = session?.user;
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
    ?? user?.user_metadata?.picture as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string | undefined)
    ?? user?.email
    ?? "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-8 max-w-7xl mx-auto w-full">
        <span className="text-lg font-bold text-primary">Qcare Plus</span>
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link key={item.label} to={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </a>
            )
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/40">
                  <Avatar className="h-9 w-9 cursor-pointer border border-border hover:ring-2 hover:ring-primary/30 transition-shadow">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b">
                  <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                  {user.email && displayName !== user.email && (
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                  <Link to="/account">
                    <LayoutDashboard className="h-4 w-4" />
                    Khu vực của bạn
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
          )}
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
              Empowering LGBTQ+ Health
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Care That Sees You.{" "}
              <span className="text-primary">PrEP That Empowers You.</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mb-8">
              Skip the waiting room. Access expert, inclusive sexual health care from the comfort of your sanctuary. Secure, discreet, and designed for our community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                Get Started Now
              </Link>
              <a href="#how-it-works" className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                View Our Plans
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-accent to-muted aspect-[4/3] flex items-center justify-center overflow-hidden">
              <div className="text-center p-8">
                <Users className="h-20 w-20 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Expert Care Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">How it Works</h2>
            <div className="h-1 w-12 bg-primary rounded-full mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="rounded-xl border bg-background p-8 text-center hover:shadow-md transition-shadow">
                  <div className={`h-14 w-14 rounded-2xl ${step.iconBg} flex items-center justify-center mx-auto mb-5`}>
                    <Icon className={`h-7 w-7 ${step.iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expert Care */}
      <section id="our-care" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted aspect-square flex items-center justify-center">
                <Users className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-primary p-4 text-primary-foreground">
                  <p className="text-lg font-bold">LGBTQ+</p>
                  <p className="text-xs opacity-80">Provider Expertise</p>
                </div>
                <div className="rounded-2xl bg-muted aspect-[4/3] flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground/30" />
                </div>
              </div>
              <div className="col-span-2">
                <div className="inline-block rounded-xl bg-primary p-4 text-primary-foreground">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs opacity-80">Secure & Private</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Expert Care Without the Hurdles.</h2>
            <div className="space-y-6">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1">{feat.title}</h3>
                      <p className="text-sm text-muted-foreground">{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Patient Experiences</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-xl border bg-background p-6">
                <Quote className="h-6 w-6 text-primary mb-4" />
                <p className="text-sm text-muted-foreground mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.since}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-wrap justify-center gap-10">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-xs font-bold">{b.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{b.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-10 md:p-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">Your Health, Your Way.</h2>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-md mx-auto mb-8">
            Join thousands who have already taken control of their health with Qcare Plus. Start your journey today.
          </p>
          <Link to="/signup" className="inline-block rounded-lg bg-card px-8 py-3 text-sm font-semibold text-primary hover:opacity-90 transition-opacity">
            Join Qcare Plus
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-base font-bold text-foreground">Qcare Plus</span>
            <p className="text-xs text-muted-foreground">Empowering the LGBTQ+ community with expert care.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 Qcare Plus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
