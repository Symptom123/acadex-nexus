import { BookOpen, ClipboardCheck, AlertTriangle, BarChart3, UserCheck, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion } from "framer-motion";

const navItems = [
  { label: "Overview", path: "/teacher", icon: BarChart3 },
  { label: "Marks Entry", path: "/teacher/marks", icon: ClipboardCheck },
  { label: "Assignments", path: "/teacher/assignments", icon: FileText },
  { label: "Attendance", path: "/teacher/attendance", icon: UserCheck },
];

const flaggedStudents = [
  { name: "Sarah Johnson", subject: "Mathematics", avg: 38, trend: "declining" },
  { name: "James Brown", subject: "Mathematics", avg: 42, trend: "stable" },
  { name: "Liam Parker", subject: "Physics", avg: 45, trend: "declining" },
];

const assignments = [
  { title: "Algebra Quiz #5", dueDate: "Feb 15", submitted: 28, total: 32 },
  { title: "Physics Lab Report", dueDate: "Feb 18", submitted: 15, total: 32 },
  { title: "Essay: Climate Change", dueDate: "Feb 20", submitted: 8, total: 30 },
];

const TeacherDashboard = () => {
  return (
    <DashboardLayout title="Dashboard" role="Teacher" navItems={navItems}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={BookOpen} label="My Classes" value="4" index={0} />
        <StatCard icon={ClipboardCheck} label="Pending Marks" value="12" index={1} />
        <StatCard icon={AlertTriangle} label="Flagged Students" value="3" index={2} />
        <StatCard icon={UserCheck} label="Today's Attendance" value="96%" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Flagged Students</h2>
          <div className="space-y-3">
            {flaggedStudents.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{s.avg}%</p>
                  <p className="text-xs text-destructive">{s.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Assignments</h2>
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.title} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {a.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{a.submitted}/{a.total}</p>
                  <p className="text-xs text-muted-foreground">submitted</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
