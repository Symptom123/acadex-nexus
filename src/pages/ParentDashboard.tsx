import { TrendingUp, CalendarCheck, Bell, BarChart3, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "Performance", id: "performance", icon: TrendingUp },
  { label: "Attendance", id: "attendance", icon: CalendarCheck },
  { label: "Notifications", id: "notifications", icon: Bell },
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
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout
      title={activeTab === "overview" ? "Dashboard" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      role="Parent"
      navItems={navItems.map(item => ({
        ...item,
        onClick: () => setActiveTab(item.id),
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
                <h2 className="text-lg font-semibold mb-5">Recent Notifications</h2>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((n) => (
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
          </motion.div>
        )}

        {activeTab === "performance" && (
          <motion.div
            key="performance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="luxury-card-static p-7"
          >
            <h2 className="text-lg font-semibold mb-6">Detailed Performance Analysis</h2>
            <div className="space-y-6">
              {childSubjects.map((s) => (
                <div key={s.name} className="p-5 rounded-2xl bg-secondary/20">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-lg">{s.name}</p>
                    <span className="text-2xl font-bold">{s.score}%</span>
                  </div>
                  <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-foreground" style={{ width: `${s.score}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Teacher feedback: Exceptional progress this term.</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="luxury-card-static p-7"
          >
            <h2 className="text-lg font-semibold mb-6">Attendance Record</h2>
            <div className="p-8 bg-foreground text-primary-foreground rounded-2xl mb-8 text-center">
              <p className="text-4xl font-bold mb-2">94%</p>
              <p className="text-sm opacity-60">Sarah's overall attendance for this academic year</p>
            </div>
            <div className="space-y-3">
              {[
                { date: "Yesterday", status: "Present" },
                { date: "Monday", status: "Present" },
                { date: "Last Friday", status: "Absent", reason: "Medical Appointment" },
              ].map((log, i) => (
                <div key={i} className="flex justify-between p-4 rounded-xl border border-border/50">
                  <span className="text-sm font-medium">{log.date}</span>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase ${log.status === 'Present' ? 'text-green-600' : 'text-red-500'}`}>
                      {log.status}
                    </p>
                    {log.reason && <p className="text-[10px] text-muted-foreground mt-0.5">{log.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {notifications.map((n) => (
              <div key={n.title} className="luxury-card p-6 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${n.type === "alert" ? "bg-red-500/10 text-red-500" : "bg-primary/5 text-primary"}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-[15px]">{n.title}</h3>
                    <span className="text-[11px] text-muted-foreground">{n.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This is a detailed notification message regarding {n.title.toLowerCase()}. Please contact the school office if you have any questions.
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ParentDashboard;
