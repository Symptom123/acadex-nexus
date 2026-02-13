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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <StatCard icon={Trophy} label="Overall Average" value="82.8%" change="+5%" index={0} />
        <StatCard icon={TrendingUp} label="Class Rank" value="#7" change="↑2" index={1} />
        <StatCard icon={CalendarCheck} label="Attendance" value="96%" index={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="luxury-card-static p-7"
        >
          <h2 className="text-lg font-semibold mb-6">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0, 0%, 7%)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="hsl(0, 0%, 7%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 92%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 62%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 62%)" domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(0, 0%, 92%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Area type="monotone" dataKey="score" stroke="hsl(0, 0%, 7%)" strokeWidth={2.5} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="luxury-card-static p-7"
        >
          <h2 className="text-lg font-semibold mb-5">Subject Scores</h2>
          <div className="space-y-3">
            {subjects.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">{s.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{s.grade}</span>
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
