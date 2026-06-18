import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Users,
  Bell,
  BookOpen,
  Brain,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import heroBg from "@/assets/cover.png";

/* ─── role cards for the portal section ─── */
const portals = [
  {
    role: "Admin",
    icon: Shield,
    color: "from-violet-500 to-indigo-600",
    desc: "Full control over the entire school ecosystem.",
    features: ["User Management", "School Analytics", "System Config"],
  },
  {
    role: "Teacher",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    desc: "Manage classes, grades, and student progress.",
    features: ["Attendance", "Assignments", "Gradebook"],
  },
  {
    role: "Student",
    icon: GraduationCap,
    color: "from-amber-500 to-orange-600",
    desc: "Track your grades, assignments, and growth.",
    features: ["Dashboard", "Report Cards", "Timetable"],
  },
  {
    role: "Parent",
    icon: Users,
    color: "from-sky-500 to-blue-600",
    desc: "Stay connected with your child's school life.",
    features: ["Progress Reports", "Notifications", "Attendance"],
  },
];

/* ─── capabilities ─── */
const capabilities = [
  {
    icon: Brain,
    title: "Smart Analytics",
    desc: "AI-powered insights that predict student performance and flag those who need support before it's too late.",
  },
  {
    icon: BarChart3,
    title: "Live Dashboards",
    desc: "Real-time data visualizations for attendance, grades, and school-wide metrics — always up to date.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    desc: "Push notifications that keep parents, teachers, and admins in the loop the moment something matters.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Built for speed. Every page loads instantly, every action responds immediately. No waiting.",
  },
];

const Landing = () => {
  const [mobileNav, setMobileNav] = useState(false);
  const [activePortal, setActivePortal] = useState(0);

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden relative">
      {/* Floating moon-orbs in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="moon-orb moon-orb-lg top-[8%] left-[-5%] opacity-20 dark:opacity-30" />
        <div className="moon-orb moon-orb-md top-[35%] right-[-3%] opacity-15 dark:opacity-20" />
        <div className="moon-orb moon-orb-sm top-[60%] left-[4%] opacity-25 dark:opacity-35" />
        <div className="moon-orb moon-orb-md top-[80%] right-[2%] opacity-15 dark:opacity-25" />
      </div>

      {/* ╔═══════════════════════════════════════╗
          ║           NAVIGATION                  ║
          ╚═══════════════════════════════════════╝ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoImg} alt="ACADEX" className="h-8 sm:h-9 w-auto" />
            <div className="hidden sm:block">
              <span className="font-bold text-base tracking-tight text-foreground">
                ACADEX
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#portals" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Portals
            </a>
            <a href="#capabilities" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <a href="#cta" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Get Started
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-sm font-medium hover:bg-secondary/80"
              >
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="rounded-full px-5 text-sm font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md shadow-primary/10 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-5 py-4 space-y-1">
                <a href="#portals" onClick={() => setMobileNav(false)} className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Portals
                </a>
                <a href="#capabilities" onClick={() => setMobileNav(false)} className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Features
                </a>
                <Link to="/login" onClick={() => setMobileNav(false)} className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Log in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ╔═══════════════════════════════════════╗
          ║           HERO SECTION                ║
          ╚═══════════════════════════════════════╝ */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-5 sm:px-8">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full mb-6 border border-primary/20 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Now Available
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
            >
              Your school,{" "}
              <span className="text-gradient">one platform.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10"
            >
              ACADEX connects admins, teachers, students and parents in one smart
              hub — with real-time analytics, AI predictions, and everything your
              school needs to thrive.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/login">
                <Button
                  size="lg"
                  className="h-12 px-7 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#portals">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-7 text-sm font-semibold rounded-xl bg-white/40 dark:bg-card/40 backdrop-blur-sm border-border hover:bg-white/60 hover:dark:bg-card/60 transition-all"
                >
                  Explore Portals
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Quick trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-16 flex flex-wrap gap-x-8 gap-y-3"
          >
            {["Role-based access", "AI-powered insights", "Real-time data", "Parent-teacher bridge"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground bg-white/30 dark:bg-card/30 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║         PORTAL CARDS SECTION          ║
          ╚═══════════════════════════════════════╝ */}
      <section id="portals" className="py-20 sm:py-28 px-5 sm:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Four Portals
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              One app for everyone
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              Each role gets a tailored experience — designed for exactly what they need.
            </p>
          </div>

          {/* Portal selector (desktop: interactive tabs, mobile: grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {portals.map((portal, i) => (
              <button
                key={portal.role}
                onClick={() => setActivePortal(i)}
                className={`relative text-left p-5 sm:p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
                  activePortal === i
                    ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/5 backdrop-blur-md"
                    : "border-border/60 bg-white/40 dark:bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-white/60 hover:dark:bg-card/60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <portal.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-1">{portal.role}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {portal.desc}
                </p>
                {activePortal === i && (
                  <motion.div
                    layoutId="portal-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Expanded detail for active portal */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePortal}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-border bg-white/70 dark:bg-card/70 backdrop-blur-md p-6 sm:p-8 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {portals[activePortal].role} Portal
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {portals[activePortal].features.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1.5 bg-secondary/80 dark:bg-secondary/40 text-xs font-medium px-3 py-1.5 rounded-full"
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <Link to="/login">
                  <Button
                    size="sm"
                    className="rounded-full px-5 font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    Open {portals[activePortal].role} Portal
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║        CAPABILITIES SECTION           ║
          ╚═══════════════════════════════════════╝ */}
      <section id="capabilities" className="py-20 sm:py-28 px-5 sm:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Built Different
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Not your average school app
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              Engineered with tools that actually make a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group rounded-2xl border border-border/60 bg-white/60 dark:bg-card/60 backdrop-blur-sm hover:border-primary/30 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <cap.icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cap.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║           CTA SECTION                 ║
          ╚═══════════════════════════════════════╝ */}
      <section id="cta" className="py-20 sm:py-28 px-5 sm:px-8 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-border/80 bg-white/80 dark:bg-card/85 backdrop-blur-md p-10 sm:p-16 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle inside gradient background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative z-10">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 relative z-10">
            Ready to level up your school?
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto relative z-10">
            Join schools already using ACADEX to connect their entire community and unlock smarter education.
          </p>
          <div className="flex flex-wrap gap-3 justify-center relative z-10">
            <Link to="/signup">
              <Button
                size="lg"
                className="h-12 px-8 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-sm font-semibold rounded-xl bg-white/40 dark:bg-card/40 backdrop-blur-sm border-border hover:bg-white/60 hover:dark:bg-card/60 transition-all"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ╔═══════════════════════════════════════╗
          ║              FOOTER                   ║
          ╚═══════════════════════════════════════╝ */}
      <footer className="border-t border-border py-8 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="ACADEX" className="h-5 w-auto opacity-60" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ACADEX Smart School
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
