import { TrendingUp, CalendarCheck, Bell, BarChart3, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion } from "framer-motion";

const navItems = [
  { label: "Overview", path: "/parent", icon: BarChart3 },
  { label: "Performance", path: "/parent/performance", icon: TrendingUp },
  { label: "Attendance", path: "/parent/attendance", icon: CalendarCheck },
  { label: "Notifications", path: "/parent/notifications", icon: Bell },
];

const childSubjects = [
  { name: "Mathematics", score: 85, teacher: "Mr. Wilson" },
  { name: "Physics", score: 78, teacher: "Ms. Garcia" },
  { name: "English", score: 92, teacher: "Mrs. Thompson" },
  { name: "Chemistry", score: 71, teacher: "Dr. Patel" },
];

const notifications = [
  { title: "Parent-Teacher Meeting", date: "Feb 20", type: "event" },
  { title: "Report Card Available", date: "Feb 14", type: "report" },
  { title: "Low attendance warning", date: "Feb 10", type: "alert" },
  { title: "Field trip permission slip", date: "Feb 8", type: "event" },
];

const ParentDashboard = () => {
  return (
    <DashboardLayout title="Dashboard" role="Parent" navItems={navItems}>
      <div className="mb-8 luxury-card-static p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold">SJ</div>
        <div>
          <p className="text-sm text-muted-foreground">Viewing for</p>
          <p className="text-lg font-semibold">Sarah Johnson — Grade 10-A</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <StatCard icon={TrendingUp} label="Overall Average" value="82%" change="+5%" index={0} />
        <StatCard icon={CalendarCheck} label="Attendance" value="94%" index={1} />
        <StatCard icon={Bell} label="Notifications" value="4" index={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="luxury-card-static p-7"
        >
          <h2 className="text-lg font-semibold mb-5">Subject Performance</h2>
          <div className="space-y-3">
            {childSubjects.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.teacher}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-sm font-bold">{s.score}%</span>
                </div>
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
          <h2 className="text-lg font-semibold mb-5">Notifications</h2>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.title} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${n.type === "alert" ? "bg-destructive/10" : "bg-secondary"}`}>
                    <Bell className={`h-3.5 w-3.5 ${n.type === "alert" ? "text-destructive" : "text-muted-foreground"}`} />
                  </div>
                  <p className="text-sm font-semibold">{n.title}</p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{n.date}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
