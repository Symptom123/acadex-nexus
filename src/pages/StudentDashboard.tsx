import { Trophy, TrendingUp, CalendarCheck, BarChart3, FileText, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import studentBg from "@/assets/student-cover.png";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "Results", id: "results", icon: FileText },
  { label: "Attendance", id: "attendance", icon: CalendarCheck },
  { label: "Assignments", id: "assignments", icon: BookOpen },
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
  const [activeTab, setActiveTab] = useState("overview");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submittedAssignments, setSubmittedAssignments] = useState<string[]>(["Physics Lab Report"]);

  const handleSubmit = (title: string) => {
    setSubmitting(title);
    setTimeout(() => {
      setSubmittedAssignments(prev => [...prev, title]);
      setSubmitting(null);
    }, 1500);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[0] bg-cover bg-center pointer-events-none" 
        style={{ backgroundImage: `linear-gradient(hsl(var(--background) / 0.85), hsl(var(--background) / 0.85)), url(${studentBg})` }}
      />
      <div className="relative z-10 w-full bg-transparent flex min-h-screen flex-col">
        <DashboardLayout
          title={activeTab === "overview" ? "My Dashboard" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          role="Student"
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
          </motion.div>
        )}

        {activeTab === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="luxury-card-static p-7"
          >
            <h2 className="text-lg font-semibold mb-6">Academic Results</h2>
            <div className="space-y-4">
              {subjects.map((s) => (
                <div key={s.name} className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Term 2 Examination</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{s.score}/100</p>
                    <p className="text-xs font-semibold text-primary">Grade {s.grade}</p>
                  </div>
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
            <h2 className="text-lg font-semibold mb-6">Attendance History</h2>
            <div className="flex items-center gap-8 mb-8 p-6 bg-secondary/30 rounded-2xl">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Overall</p>
                <p className="text-3xl font-bold">96%</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Present</p>
                <p className="text-3xl font-bold">142</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Absent</p>
                <p className="text-3xl font-bold">6</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold mb-4">Detailed Log</p>
              {[
                { date: "Feb 18, 2026", status: "Present" },
                { date: "Feb 17, 2026", status: "Present" },
                { date: "Feb 16, 2026", status: "Absent", reason: "Fever" },
              ].map((log, i) => (
                <div key={i} className="flex justify-between p-3 px-4 rounded-lg bg-secondary/20 items-center">
                  <span className="text-sm">{log.date}</span>
                  <span className={`text-[10px] font-bold uppercase ${log.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                    {log.status} {log.reason && `• ${log.reason}`}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "assignments" && (
          <motion.div
            key="assignments"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">My Assignments</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: "Algebra Quiz #5", subject: "Mathematics", due: "Feb 25" },
                { title: "Physics Lab Report", subject: "Physics", due: "Feb 28" },
                { title: "English Essay", subject: "English", due: "Mar 05" },
              ].map((a, i) => (
                <div key={i} className="luxury-card-static p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-semibold text-lg">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.subject} • Due: {a.due}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {submittedAssignments.includes(a.title) ? (
                      <span className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20 uppercase">
                        Submitted
                      </span>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Button variant="outline" size="sm" className="pointer-events-none">
                            <BookOpen className="w-4 h-4 mr-2" /> Upload Work
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSubmit(a.title)}
                          disabled={submitting === a.title}
                        >
                          {submitting === a.title ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </DashboardLayout>
      </div>
    </>
  );
};

export default StudentDashboard;
