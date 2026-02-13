import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card p-6">
        <div className="mb-8">
          <Link to="/" className="text-lg font-semibold tracking-tight">ACADEX</Link>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{role}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link to="/login">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </Link>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <Link to="/" className="text-lg font-semibold tracking-tight">ACADEX</Link>
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
              className="lg:hidden border-b border-border bg-card overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-foreground text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
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
        <main className="flex-1 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-8">{title}</h1>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
