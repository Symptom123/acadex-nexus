import { Users, GraduationCap, AlertTriangle, ClipboardList, UserCheck, BarChart3, ChevronLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ReportCard from "@/components/ReportCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "Users", id: "users", icon: Users },
  { label: "Attendance", id: "attendance", icon: UserCheck },
  { label: "Reports", id: "reports", icon: ClipboardList },
];

const flaggedClasses = [
  { name: "Grade 10-A", issue: "3 students at risk", severity: "high" },
  { name: "Grade 8-B", issue: "Low attendance rate", severity: "medium" },
  { name: "Grade 12-C", issue: "Declining averages", severity: "high" },
];

const students = [
  { 
    id: "STU001",
    name: "Sarah Johnson", 
    grade: "10-A", 
    status: "At Risk", 
    avg: 42,
    attendance: "78%",
    marks: [
      { subject: "Mathematics", score: 35, grade: "F" },
      { subject: "Science", score: 45, grade: "D" },
      { subject: "English", score: 52, grade: "C" },
      { subject: "History", score: 38, grade: "F" },
    ]
  },
  { 
    id: "STU002",
    name: "Emma Williams", 
    grade: "8-B", 
    status: "Excellent", 
    avg: 92,
    attendance: "98%",
    marks: [
      { subject: "Mathematics", score: 95, grade: "A+" },
      { subject: "Science", score: 88, grade: "A" },
      { subject: "English", score: 94, grade: "A+" },
      { subject: "History", score: 91, grade: "A" },
    ]
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);

  return (
    <DashboardLayout 
      title={activeTab === "reports" ? "Report Generation" : "Dashboard"} 
      role="Administrator" 
      navItems={navItems.map(item => ({
        ...item,
        onClick: () => {
          setActiveTab(item.id);
          setSelectedStudent(null);
        },
        active: activeTab === item.id
      }))}
    >
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              <StatCard icon={Users} label="Total Students" value="1,247" change="+12%" index={0} />
              <StatCard icon={GraduationCap} label="Teachers" value="86" change="+3" index={1} />
              <StatCard icon={AlertTriangle} label="Flagged Classes" value="3" index={2} />
              <StatCard icon={UserCheck} label="Avg. Attendance" value="94%" change="+2%" index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="luxury-card-static p-7"
              >
                <h2 className="text-lg font-semibold mb-5">Flagged Classes</h2>
                <div className="space-y-3">
                  {flaggedClasses.map((cls) => (
                    <div
                      key={cls.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">{cls.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cls.issue}</p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                          cls.severity === "high"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {cls.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="luxury-card-static p-7"
              >
                <h2 className="text-lg font-semibold mb-5">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setActiveTab("reports")}>
                    <ClipboardList className="w-6 h-6" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setActiveTab("users")}>
                    <Users className="w-6 h-6" />
                    Manage Users
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {!selectedStudent ? (
              <div className="luxury-card-static p-7">
                <h2 className="text-lg font-semibold mb-6">Select Student to Generate Report</h2>
                <div className="space-y-3">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          {s.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {s.id} • Grade {s.grade}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Generate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)} className="no-print">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to List
                </Button>
                <ReportCard student={selectedStudent} />
              </div>
            )}
          </motion.div>
        )}

        {(activeTab === "users" || activeTab === "attendance") && (
          <motion.div
            key="other"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground"
          >
            <p className="text-lg font-medium">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management Coming Soon</p>
            <Button variant="link" onClick={() => setActiveTab("overview")}>Return to Overview</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;

