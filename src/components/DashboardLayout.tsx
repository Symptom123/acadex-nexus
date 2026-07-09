import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import AIAssistantWidget from "./AIAssistantWidget";

interface NavItem {
  label: string;
  path?: string;
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  active?: boolean;
  badge?: number | string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: string;
  navItems: NavItem[];
}

const DashboardLayout = ({ children, title, role, navItems }: DashboardLayoutProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const isActive = item.active !== undefined ? item.active : (item.path ? location.pathname === item.path : false);
    const content = (
      <>
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-grow text-left">{item.label}</span>
        {item.badge !== undefined && Number(item.badge) > 0 && (
          <span className="flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-bold rounded-full bg-red-500 text-white shadow-sm flex-shrink-0">
            {item.badge}
          </span>
        )}
      </>
    );

    const baseClass = `flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
      isMobile
        ? isActive
          ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] font-semibold"
          : "text-white/60 hover:text-white hover:bg-white/5"
        : isActive
          ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] font-semibold"
          : "text-white/60 hover:text-white hover:bg-white/5"
    }`;

    if (item.path) {
      return (
        <Link
          key={item.path}
          to={item.path}
          className={baseClass}
          onClick={() => setMobileOpen(false)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={item.id || item.label}
        onClick={() => {
          item.onClick?.();
          setMobileOpen(false);
        }}
        className={`${baseClass} w-full text-left`}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden text-foreground selection:bg-primary/30">
      {/* ══════════════════════════════════════
          BACKGROUND GLOW ORBS
          ══════════════════════════════════════ */}
      <div className="glow-orb bg-primary/20 w-[600px] h-[600px] top-[-200px] left-[-200px] pointer-events-none fixed" />
      <div className="glow-orb bg-accent/20 w-[500px] h-[500px] top-[40%] right-[-100px] pointer-events-none fixed" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel m-4 mr-0 rounded-2xl border-white/10 z-20 print:hidden flex-shrink-0 relative overflow-hidden">
        <div className="p-6 mb-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="ACADEX Logo" className="h-[2.1rem] w-auto" />
            <span className="text-xl font-bold tracking-tight text-white">ACADEX</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => renderNavItem(item, false))}
        </nav>

        <div className="p-4 border-t border-white/10 mt-4 bg-white/5">
          <Link to="/login" onClick={handleLogout}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        <header className="lg:hidden flex items-center justify-between p-5 border-b border-white/10 bg-background/50 backdrop-blur-xl sticky top-0 z-50 print:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="ACADEX Logo" className="h-8 w-auto" />
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-b border-white/10 bg-background/95 backdrop-blur-2xl overflow-hidden print:hidden absolute w-full z-40"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => renderNavItem(item, true))}
                <Link to="/login" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-white/60 mt-2 hover:bg-white/5 hover:text-white">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-10 lg:p-12 print:p-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-10 print:hidden">
              <p className="text-[11px] text-primary uppercase tracking-[0.2em] font-bold mb-2">{role}</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{title}</h1>
              {currentUser && <p className="text-sm text-white/60 mt-2">Welcome, {currentUser.email}</p>}
            </div>
            {children}
          </motion.div>
        </main>
        
        {/* Global AI Assistant */}
        <AIAssistantWidget role={role} />
      </div>
    </div>
  );
};

export default DashboardLayout;
