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
          ? "bg-primary/10 text-primary shadow-sm font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
        : isActive
          ? "bg-white/20 text-white shadow-sm font-semibold"
          : "text-white/70 hover:text-white hover:bg-white/10"
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
    <div className="min-h-screen bg-transparent flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r-0 bg-primary text-primary-foreground p-6 print:hidden shadow-xl z-20">
        <div className="mb-10 px-2">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="ACADEX Logo" className="h-[2.1rem] w-auto" />
            <span className="text-xl font-bold tracking-tight text-white">ACADEX</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => renderNavItem(item, false))}
        </nav>

        <div className="pt-6 border-t border-white/20 mt-4">
          <Link to="/login" onClick={handleLogout}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col bg-[#f4f7fe] dark:bg-background h-screen overflow-y-auto">
        <header className="lg:hidden flex items-center justify-between p-5 border-b border-border bg-card sticky top-0 z-50 print:hidden">
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
              className="lg:hidden border-b border-border bg-card overflow-hidden print:hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => renderNavItem(item, true))}
                <Link to="/login" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground mt-2 hover:bg-secondary/85">
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
              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium mb-2">{role}</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
              {currentUser && <p className="text-sm text-muted-foreground mt-2">Welcome, {currentUser.email}</p>}
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
