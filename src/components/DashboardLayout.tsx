import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  path?: string;
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  active?: boolean;
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

  const renderNavItem = (item: NavItem) => {
    const isActive = item.active !== undefined ? item.active : (item.path ? location.pathname === item.path : false);
    const content = (
      <>
        <item.icon className="h-4 w-4" />
        {item.label}
      </>
    );

    const baseClass = `flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? "bg-foreground text-primary-foreground shadow-md"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
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
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card/50 backdrop-blur-sm p-8 print:hidden">
        <div className="mb-10">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="ACADEX Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-tight">ACADEX</span>
          </Link>
          <p className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-[0.2em] font-medium">{role} Portal</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(renderNavItem)}
        </nav>

        <div className="pt-6 border-t border-border">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between p-5 border-b border-border glass-surface sticky top-0 z-50 print:hidden">
          <Link to="/">
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
                {navItems.map(renderNavItem)}
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground mt-2">
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
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
