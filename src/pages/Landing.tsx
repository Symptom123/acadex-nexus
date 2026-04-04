import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Shield, Users, Bell, BookOpen, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/cover.png";

const features = [
  {
    icon: Users,
    title: "User Management",
    description: "Seamlessly manage students, teachers, and parents with role-based access.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track academic progress with intuitive charts and detailed reports.",
  },
  {
    icon: Brain,
    title: "Smart Predictions",
    description: "ML-powered insights to identify students needing attention early.",
  },
  {
    icon: BookOpen,
    title: "Assignments",
    description: "Create, distribute, and track assignments effortlessly.",
  },
  {
    icon: Shield,
    title: "Attendance Tracking",
    description: "Monitor attendance for students and teachers in real time.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Keep parents and staff informed with instant alerts.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] },
  }),
};

import logoImg from "@/assets/logo.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-surface mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logoImg} alt="ACADEX Logo" className="h-9 sm:h-12 w-auto" />
            <div className="hidden sm:block">
              <span className="logo-glow text-xl">ACADEX</span>
            </div>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-medium">
              Sign In <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Subtle hero backdrop */}
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

          {/* ── Crescent moon decorations ── */}
          {/* Large moon – top-right */}
          <div
            className="moon-orb moon-orb-lg"
            style={{ top: "8%", right: "7%", opacity: 0.82 }}
          />
          {/* Medium moon – mid-left */}
          <div
            className="moon-orb moon-orb-md"
            style={{ top: "42%", left: "5%", opacity: 0.65, animationDelay: "-2s" }}
          />
          {/* Small moon – lower-right */}
          <div
            className="moon-orb moon-orb-sm"
            style={{ bottom: "12%", right: "18%", opacity: 0.5, animationDelay: "-4s" }}
          />
          {/* Extra-small accent – upper-left */}
          <div
            className="moon-orb moon-orb-sm"
            style={{ top: "15%", left: "14%", opacity: 0.38, animationDelay: "-1s",
                     width: 56, height: 56 }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">AI-Powered School Management</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] mb-8"
          >
            Education,
            <br />
            <span className="text-gradient">Reimagined.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A unified platform for administrators, teachers, students, and parents.
            Powered by intelligent analytics.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/login">
              <Button size="lg" className="h-13 px-10 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-13 px-10 text-base font-medium rounded-full">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10K+", label: "Students" },
            { value: "500+", label: "Teachers" },
            { value: "98%", label: "Satisfaction" },
            { value: "50+", label: "Schools" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Everything you need.
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Comprehensive tools designed for every role in your school.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="luxury-card p-8 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2.5">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center luxury-card-static p-16 md:p-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
            Ready to transform your school?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of schools already using ACADEX to deliver a smarter education experience.
          </p>
          <Link to="/login">
            <Button size="lg" className="h-13 px-10 text-base font-semibold rounded-full shadow-lg">
              Start Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground">© 2026 ACADEX Smart School</span>
          <span className="text-sm font-bold tracking-tight">ACADEX</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
