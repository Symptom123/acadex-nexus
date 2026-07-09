import { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
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
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import bgImg from "@/assets/background.png";

/* ─── Portal data for Bento Grid ─── */
const portals = [
  {
    role: "Admin",
    icon: Shield,
    desc: "Command center for the entire school ecosystem. Complete control.",
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    color: "from-blue-500/20 to-purple-500/20",
  },
  {
    role: "Teacher",
    icon: BookOpen,
    desc: "Gradebooks, assignments, and class management.",
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    role: "Student",
    icon: GraduationCap,
    desc: "Track academic growth.",
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    color: "from-orange-500/20 to-rose-500/20",
  },
  {
    role: "Parent",
    icon: Users,
    desc: "Stay connected with your child's journey.",
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    color: "from-indigo-500/20 to-cyan-500/20",
  },
];

/* ─── Capabilities ─── */
const capabilities = [
  {
    label: "Analytics",
    icon: Brain,
    title: "AI Predictions",
    desc: "Flag students who need support before it's too late.",
  },
  {
    label: "Dashboards",
    icon: BarChart3,
    title: "Live Metrics",
    desc: "Always current, always clear visualizations.",
  },
  {
    label: "Notifications",
    icon: Bell,
    title: "Instant Alerts",
    desc: "Keep everyone in the loop the moment it matters.",
  },
  {
    label: "Performance",
    icon: Zap,
    title: "Lightning Fast",
    desc: "Built for speed. Zero friction.",
  },
];

const Landing = () => {
  const [mobileNav, setMobileNav] = useState(false);

  // Parallax & Cursor Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useMotionValue(-500); // starts off screen
  const cursorY = useMotionValue(-500);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    
    // Parallax for Hero
    const targetX = (clientX / window.innerWidth - 0.5) * 2;
    const targetY = (clientY / window.innerHeight - 0.5) * 2;
    mouseX.set(targetX);
    mouseY.set(targetY);

    // Cursor Glow position
    cursorX.set(clientX);
    cursorY.set(clientY);
  };

  // Faster, more noticeable spring configuration for parallax
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const translateX = useSpring(useTransform(mouseX, [-1, 1], [80, -80]), springConfig);
  const translateY = useSpring(useTransform(mouseY, [-1, 1], [80, -80]), springConfig);

  // Smooth spring for cursor to lag slightly behind mouse for that premium feel
  const smoothCursorX = useSpring(cursorX, { damping: 40, stiffness: 300, mass: 0.5 });
  const smoothCursorY = useSpring(cursorY, { damping: 40, stiffness: 300, mass: 0.5 });

  return (
    <div 
      className="bg-background min-h-screen text-foreground selection:bg-primary/30 relative"
      onMouseMove={handleMouseMove}
    >
      {/* ══════════════════════════════════════
          CURSOR BLUE LIGHT
          ══════════════════════════════════════ */}
      <motion.div
        className="pointer-events-none fixed z-0 w-[400px] h-[400px] rounded-full bg-blue-500/40 blur-[100px] mix-blend-screen"
        style={{
          x: smoothCursorX,
          y: smoothCursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      
      {/* ══════════════════════════════════════
          BACKGROUND GLOW ORBS
          ══════════════════════════════════════ */}
      <motion.div 
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="glow-orb bg-primary/20 w-[600px] h-[600px] top-[-200px] left-[-200px] pointer-events-none" 
      />
      <motion.div 
        animate={{ y: [0, 50, 0], x: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="glow-orb bg-accent/20 w-[500px] h-[500px] top-[40%] right-[-100px] pointer-events-none" 
      />

      {/* ══════════════════════════════════════
          FLOATING NAVIGATION
          ══════════════════════════════════════ */}
      <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="nav-pill rounded-full px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between w-full max-w-4xl">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoImg} alt="ACADEX" className="h-7 w-auto" />
            <span className="font-heading font-bold text-[15px] tracking-tight text-white hidden sm:block">
              ACADEX
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#portals" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Portals</a>
            <a href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:block">
              <span className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer mr-4">
                Log in
              </span>
            </Link>
            <Link to="/signup" className="hidden md:block">
              <Button size="sm" className="rounded-full px-6 bg-white text-black hover:bg-white/90 font-semibold cursor-pointer">
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden text-white cursor-pointer p-1"
            >
              {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileNav && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl pt-28 px-6 md:hidden"
        >
          <div className="flex flex-col gap-6 text-center">
            <a href="#portals" onClick={() => setMobileNav(false)} className="text-2xl font-heading font-bold">Portals</a>
            <a href="#features" onClick={() => setMobileNav(false)} className="text-2xl font-heading font-bold">Features</a>
            <Link to="/login" onClick={() => setMobileNav(false)} className="text-2xl font-heading font-bold text-white/70">Log in</Link>
            <Link to="/signup" onClick={() => setMobileNav(false)}>
              <Button className="w-full rounded-full h-14 text-lg mt-4 bg-primary text-white hover:bg-primary/90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════ */}
      <section 
        className="relative min-h-screen w-full flex flex-col items-center justify-center pt-24 pb-12 px-4 overflow-hidden z-10"
      >
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <motion.img 
            style={{ x: translateX, y: translateY }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.25 }}
            transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            src={bgImg} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen origin-center" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        </div>

        <div className="flex flex-col items-center text-center max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8 backdrop-blur-md"
          >
            <span className="text-sm font-medium text-white/80">
              The smart school platform
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-[90px] font-bold leading-[1.1] md:leading-[1.05] tracking-tighter mb-6 px-2"
          >
            Manage your school at the <br className="hidden md:block"/>
            <span className="text-gradient-hero">speed of thought.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl font-medium mb-10"
          >
            Connect admins, teachers, students, and parents in one unified ecosystem powered by real-time intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0"
          >
            <Link to="/signup" className="w-full sm:w-auto block">
              <Button size="lg" className="w-full rounded-full px-8 h-14 text-lg font-bold bg-white text-black hover:bg-white/90">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto block">
              <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 text-lg font-bold border-white/20 bg-white/5 hover:bg-white/10 text-white">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PORTALS (BENTO GRID)
          ══════════════════════════════════════ */}
      <section id="portals" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">One platform.<br/>Four perfect experiences.</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Every role gets a meticulously crafted portal tailored exclusively to their needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal) => (
              <Link to="/login" key={portal.role} className={`glass-panel p-8 md:p-10 flex flex-col justify-between group cursor-pointer ${portal.className}`}>
                <div>
                  <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${portal.color} border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                    <portal.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-3">{portal.role}</h3>
                  <p className="text-white/60 leading-relaxed text-lg">{portal.desc}</p>
                </div>
                
                <div className="mt-12 flex items-center text-sm font-semibold text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Explore Portal <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CAPABILITIES
          ══════════════════════════════════════ */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-20">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Built for performance.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap) => (
              <div key={cap.title} className="glass-panel p-8 group flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                  <cap.icon className="h-6 w-6 text-white/70 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2">{cap.label}</div>
                  <h3 className="text-xl font-bold mb-2">{cap.title}</h3>
                  <p className="text-white/60">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
          ══════════════════════════════════════ */}
      <section className="py-24 md:py-32 px-6 relative z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center glass-panel p-8 sm:p-12 md:p-20 relative overflow-hidden rounded-3xl">
          {/* Inner CTA glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-50 pointer-events-none" />
          
          <h2 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold mb-6 relative z-10">Ready to leap forward?</h2>
          <p className="text-lg sm:text-xl text-white/60 mb-10 relative z-10 max-w-2xl mx-auto">
            Join the schools redefining education management with ACADEX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 w-full">
            <Link to="/signup" className="w-full sm:w-auto block">
              <Button size="lg" className="w-full h-14 rounded-full px-8 text-lg font-bold bg-white text-black hover:bg-white/90 cursor-pointer">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto block">
              <Button size="lg" variant="outline" className="w-full h-14 rounded-full px-8 text-lg font-bold border-white/20 bg-white/5 hover:bg-white/10 text-white cursor-pointer">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer className="py-12 px-6 border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <img src={logoImg} alt="ACADEX" className="h-6 w-auto" />
            <span className="text-sm font-semibold">© {new Date().getFullYear()} ACADEX</span>
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors">Login</Link>
            <Link to="/signup" className="text-sm text-white/50 hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
