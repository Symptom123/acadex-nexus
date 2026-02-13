import { Users, GraduationCap, AlertTriangle, ClipboardList, UserCheck, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion } from "framer-motion";

const navItems = [
  { label: "Overview", path: "/admin", icon: BarChart3 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Attendance", path: "/admin/attendance", icon: UserCheck },
  { label: "Reports", path: "/admin/reports", icon: ClipboardList },
];

const flaggedClasses = [
  { name: "Grade 10-A", issue: "3 students at risk", severity: "high" },
  { name: "Grade 8-B", issue: "Low attendance rate", severity: "medium" },
  { name: "Grade 12-C", issue: "Declining averages", severity: "high" },
];

const recentStudents = [
  { name: "Sarah Johnson", grade: "10-A", status: "At Risk", avg: 42 },
  { name: "Michael Chen", grade: "12-C", status: "Improving", avg: 68 },
  { name: "Emma Williams", grade: "8-B", status: "Excellent", avg: 92 },
  { name: "James Brown", grade: "10-A", status: "At Risk", avg: 38 },
  { name: "Olivia Davis", grade: "11-A", status: "Good", avg: 76 },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Dashboard" role="Administrator" navItems={navItems}>
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
          <h2 className="text-lg font-semibold mb-5">Student Profiles</h2>
          <div className="space-y-3">
            {recentStudents.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
                    {s.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Grade {s.grade}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{s.avg}%</p>
                  <p className={`text-[11px] font-medium ${
                    s.status === "At Risk" ? "text-destructive" :
                    s.status === "Excellent" ? "text-success" :
                    "text-muted-foreground"
                  }`}>{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
