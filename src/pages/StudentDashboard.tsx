import { Trophy, TrendingUp, CalendarCheck, BarChart3, FileText, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const navItems = [
  { label: "Overview", path: "/student", icon: BarChart3 },
  { label: "Results", path: "/student/results", icon: FileText },
  { label: "Attendance", path: "/student/attendance", icon: CalendarCheck },
];

const performanceData = [
  { month: "Sep", score: 72 },
  { month: "Oct", score: 68 },
  { month: "Nov", score: 75 },
  { month: "Dec", score: 80 },
  { month: "Jan", score: 78 },
  { month: "Feb", score: 85 },
];

const subjects = [
  { name: "Mathematics", score: 85, grade: "A" },
  { name: "Physics", score: 78, grade: "B+" },
  { name: "English", score: 92, grade: "A+" },
  { name: "Chemistry", score: 71, grade: "B" },
  { name: "History", score: 88, grade: "A" },
];

const StudentDashboard = () => {
  return (
    <DashboardLayout title="My Dashboard" role="Student" navItems={navItems}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={Trophy} label="Overall Average" value="82.8%" change="+5%" index={0} />
        <StatCard icon={TrendingUp} label="Class Rank" value="#7" change="↑2" index={1} />
        <StatCard icon={CalendarCheck} label="Attendance" value="96%" index={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0, 0%, 7%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(0, 0%, 7%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 92%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 62%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 62%)" domain={[50, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="hsl(0, 0%, 7%)" strokeWidth={2} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Subject Scores</h2>
          <div className="space-y-3">
            {subjects.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{s.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{s.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
