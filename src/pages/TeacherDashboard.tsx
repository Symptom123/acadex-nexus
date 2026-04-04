import { BookOpen, ClipboardCheck, AlertTriangle, BarChart3, UserCheck, FileText, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "Marks Entry", id: "marks", icon: ClipboardCheck },
  { label: "Assignments", id: "assignments", icon: FileText },
  { label: "Attendance", id: "attendance", icon: UserCheck },
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

const pendingMarks = [
  { student: "Sarah Johnson", subject: "Mathematics", assignment: "Midterm Exam" },
  { student: "Michael Chen", subject: "Mathematics", assignment: "Practice Test" },
  { student: "Emily Davis", subject: "Mathematics", assignment: "Homework #4" },
];

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [assignmentList, setAssignmentList] = useState(assignments);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({
    "Sarah Johnson": "present",
    "John Doe": "absent",
    "Michael Chen": "present",
    "Emily Davis": "present",
    "Liam Parker": "present",
    "James Brown": "present",
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle) return;

    const newAssignment = {
      title: newAssignmentTitle,
      dueDate: "Mar 01",
      submitted: 0,
      total: 32
    };

    setAssignmentList([newAssignment, ...assignmentList]);
    setNewAssignmentTitle("");
    setActiveTab("assignments");
  };

  const toggleAttendance = (name: string, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [name]: status
    }));
  };

  return (
    <DashboardLayout
      title={activeTab === "overview" ? "Dashboard" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("_", " ")}
      role="Teacher"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
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
                className="luxury-card-static p-7"
              >
                <h2 className="text-lg font-semibold mb-5">Flagged Students</h2>
                <div className="space-y-3">
                  {flaggedStudents.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{s.avg}%</p>
                        <p className="text-[11px] font-medium text-destructive">{s.trend}</p>
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
                <h2 className="text-lg font-semibold mb-5">Current Assignments</h2>
                <div className="space-y-3">
                  {assignmentList.slice(0, 3).map((a) => (
                    <div key={a.title} className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                      <div>
                        <p className="text-sm font-semibold">{a.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {a.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{a.submitted}/{a.total}</p>
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-foreground rounded-full" style={{ width: `${(a.submitted / a.total) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === "marks" && (
          <motion.div
            key="marks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="luxury-card-static p-7">
              <h2 className="text-lg font-semibold mb-6">Pending Marks Entry</h2>
              <div className="space-y-4">
                {pendingMarks.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-xl border border-border/50 hover:border-foreground/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-sm font-bold">
                        {p.student.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p.student}</p>
                        <p className="text-xs text-muted-foreground">{p.subject} • {p.assignment}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Enter Marks</Button>
                  </div>
                ))}
              </div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Assignments</h2>
              <Button size="sm" onClick={() => setActiveTab("create_assignment")}>Create Assignment</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assignmentList.map((a, i) => (
                <div key={i} className="luxury-card-static p-6 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="text-xs text-muted-foreground">Mathematics • Grade 10-A</p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-secondary text-[10px] font-bold">ACTIVE</span>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Submission Rate</span>
                      <span className="font-medium">{Math.round((a.submitted / a.total) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-foreground" style={{ width: `${(a.submitted / a.total) * 100}%` }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-secondary">
                    View Submissions <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "create_assignment" && (
          <motion.div
            key="create_assignment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxury-card-static p-7"
          >
            <h2 className="text-lg font-semibold mb-6">Create New Assignment</h2>
            <form className="space-y-4 max-w-xl" onSubmit={handleCreateAssignment}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Assignment Title</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-border bg-secondary/20"
                  placeholder="e.g. Weekly Quiz #10"
                  required
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">PDF Document</label>
                  <input type="file" accept=".pdf" className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Photo/Image</label>
                  <input type="file" accept="image/*" className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Post Assignment</Button>
                <Button type="button" variant="outline" onClick={() => setActiveTab("assignments")}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mark Attendance - Grade 10-A</h2>
              <div className="text-sm text-muted-foreground">Feb 21, 2026</div>
            </div>

            <div className="luxury-card-static overflow-hidden">
              <div className="bg-secondary/30 p-4 border-b border-border grid grid-cols-12 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-8 px-4">Student Name</div>
                <div className="col-span-4 text-center px-4">Status</div>
              </div>
              <div className="divide-y divide-border/50">
                {Object.keys(attendanceRecords).map((name, i) => (
                  <div key={i} className="grid grid-cols-12 items-center p-4 hover:bg-secondary/10 transition-colors">
                    <div className="col-span-8 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-bold">
                        {name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <div className="col-span-4 flex justify-center gap-2">
                      <button
                        onClick={() => toggleAttendance(name, "present")}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${attendanceRecords[name] === "present"
                          ? "bg-green-500/20 text-green-600 border-green-500/30"
                          : "bg-secondary text-muted-foreground border-border opacity-40 hover:opacity-100"
                          }`}
                      >
                        PRESENT
                      </button>
                      <button
                        onClick={() => toggleAttendance(name, "absent")}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${attendanceRecords[name] === "absent"
                          ? "bg-red-500/20 text-red-600 border-red-500/30"
                          : "bg-secondary text-muted-foreground border-border opacity-40 hover:opacity-100"
                          }`}
                      >
                        ABSENT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-secondary/20 border-t border-border flex justify-end">
                <Button size="sm">Save Attendance</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
