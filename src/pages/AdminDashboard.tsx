import { Users, GraduationCap, ClipboardList, UserCheck, BarChart3, ChevronLeft, BookOpen, Loader2, Edit2, Check, X, MessageSquare, Send, ChevronRight, Clock, Trash2, UserX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ReportCard from "@/components/ReportCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "Users", id: "users", icon: Users },
  { label: "Attendance", id: "attendance", icon: UserCheck },
  { label: "Reports", id: "reports", icon: ClipboardList },
  { label: "Messages", id: "messages", icon: MessageSquare },
];

const AdminDashboard = () => {
  const { currentUser, userStatus } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Role Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>("");

  // Real stats
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [todayAbsent, setTodayAbsent] = useState(0);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [todayAttendanceList, setTodayAttendanceList] = useState<any[]>([]);
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  // Messaging State
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch users
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (data && !error) {
      setFetchedUsers(data);
      setTotalStudents(data.filter((u: any) => u.role === "student").length);
      setTotalTeachers(data.filter((u: any) => u.role === "teacher").length);

      // If the currently logged-in admin has no status set (legacy account),
      // stamp them as 'approved' in the DB so they are never blocked.
      if (currentUser) {
        const myProfile = data.find((u: any) => u.id === currentUser.uid);
        if (myProfile && myProfile.role === "admin" && !myProfile.status) {
          await supabase
            .from("profiles")
            .update({ status: "approved" })
            .eq("id", currentUser.uid);
        }
      }
    }
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('admin-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleApproveAdmin = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", userId);
    
    if (error) {
      toast.error("Failed to approve admin.");
    } else {
      toast.success("Admin approved successfully!");
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      toast.error("Failed to delete user.");
    } else {
      toast.success(`${userName} has been removed.`);
      fetchUsers();
    }
  };

  // An admin is pending if their status is explicitly 'pending' OR if it's null/missing
  // (meaning the status column doesn't exist yet in Supabase or was never set)
  const isAdminPending = (user: any) =>
    user.role === "admin" && (user.status === "pending" || user.status === null || user.status === undefined);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from("classes").select("*");
      if (data && !error) {
        setTotalClasses(data.length);
        setClassesList(data.map(item => ({
          id: item.id,
          subject: item.subject,
          className: item.class_name,
          teacherName: item.teacher_name
        })));
      }
    };
    fetchClasses();

    const channel = supabase
      .channel('admin-classes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
        fetchClasses();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch today's attendance stats
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("attendance_history")
        .select("date_str, status, class_id, student_uid, profiles(name, email), classes(subject, class_name)")
        .eq("date_str", todayStr);
      
      if (data && !error) {
        setTodayPresent(data.filter((r: any) => r.status === "present").length);
        setTodayAbsent(data.filter((r: any) => r.status === "absent").length);
        setTodayAttendanceList(data);
      }
    };
    fetchTodayAttendance();

    const channel = supabase
      .channel('admin-attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_history' }, () => {
        fetchTodayAttendance();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch all parent message conversations
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("parent_messages")
      .select("parent_uid, parent_name, parent_email, created_at, message, is_read, id")
      .order("created_at", { ascending: false });

    if (data && !error) {
      // Group by parent_uid → take latest message per parent
      const map: Record<string, any> = {};
      data.forEach((msg: any) => {
        if (!map[msg.parent_uid]) {
          map[msg.parent_uid] = {
            parent_uid: msg.parent_uid,
            parent_name: msg.parent_name,
            parent_email: msg.parent_email,
            latest_message: msg.message,
            latest_at: msg.created_at,
            unread: 0,
          };
        }
        if (!msg.is_read && msg.sender !== "admin") map[msg.parent_uid].unread += 1;
      });
      const list = Object.values(map);
      setConversations(list);
      setUnreadCount(list.reduce((sum: number, c: any) => sum + c.unread, 0));
    }
  };

  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel("admin-parent-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "parent_messages" }, () => {
        fetchConversations();
        if (selectedConversation) fetchThread(selectedConversation.parent_uid);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConversation]);

  const fetchThread = async (parentUid: string) => {
    const { data, error } = await supabase
      .from("parent_messages")
      .select("*")
      .eq("parent_uid", parentUid)
      .order("created_at", { ascending: true });
    if (data && !error) {
      setConversationMessages(data);
      // Mark all parent messages as read
      await supabase
        .from("parent_messages")
        .update({ is_read: true })
        .eq("parent_uid", parentUid)
        .eq("sender", "parent");
      fetchConversations();
    }
  };

  const handleOpenConversation = async (conv: any) => {
    setSelectedConversation(conv);
    await fetchThread(conv.parent_uid);
  };

  const handleAdminReply = async () => {
    if (!adminReply.trim() || !selectedConversation || !currentUser) return;
    setSendingReply(true);
    const { error } = await supabase.from("parent_messages").insert({
      parent_uid: selectedConversation.parent_uid,
      parent_name: selectedConversation.parent_name,
      parent_email: selectedConversation.parent_email,
      sender: "admin",
      sender_name: "Administration",
      message: adminReply.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    });
    if (!error) {
      setAdminReply("");
      await fetchThread(selectedConversation.parent_uid);
    } else {
      toast.error("Failed to send reply.");
    }
    setSendingReply(false);
  };

  // Handle building and selecting a student report dynamically
  const handleSelectStudent = async (student: any) => {
    setLoadingReport(true);
    try {
      // 1. Fetch class students / classes details
      const { data: enrollments } = await supabase
        .from("class_students")
        .select(`
          class_id,
          classes (
            subject,
            class_name
          )
        `)
        .eq("student_uid", student.id);

      // 2. Fetch submissions for grades
      const { data: submissions } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_uid", student.id);

      // 3. Fetch attendance records
      const { data: attendance } = await supabase
        .from("attendance_history")
        .select("*")
        .eq("student_uid", student.id);

      // Aggregate subject scores
      const subjectGrades: Record<string, { totalScore: number; count: number }> = {};
      if (submissions) {
        submissions.forEach((sub: any) => {
          if (sub.subject && sub.grade !== null && sub.grade !== undefined) {
            if (!subjectGrades[sub.subject]) {
              subjectGrades[sub.subject] = { totalScore: 0, count: 0 };
            }
            subjectGrades[sub.subject].totalScore += sub.grade;
            subjectGrades[sub.subject].count += 1;
          }
        });
      }

      // Collect unique subjects
      const subjectsMap = new Map<string, string>();
      if (enrollments) {
        enrollments.forEach((e: any) => {
          if (e.classes) {
            subjectsMap.set(e.classes.subject, e.classes.class_name);
          }
        });
      }
      if (submissions) {
        submissions.forEach((sub: any) => {
          if (sub.subject) {
            subjectsMap.set(sub.subject, sub.class_name || "N/A");
          }
        });
      }

      // Build marks list
      const marks = Array.from(subjectsMap.entries()).map(([subject, className]) => {
        const stats = subjectGrades[subject];
        // If they have grades, average them, else standard default 85
        const score = stats ? Math.round(stats.totalScore / stats.count) : 85;
        
        const getLetterGrade = (s: number): string => {
          if (s >= 90) return "A+";
          if (s >= 80) return "A";
          if (s >= 70) return "B+";
          if (s >= 60) return "B";
          if (s >= 50) return "C";
          if (s >= 40) return "D";
          return "F";
        };

        return {
          subject,
          score,
          grade: getLetterGrade(score)
        };
      });

      // Default subjects if they are not in any classes yet
      const finalMarks = marks.length > 0 ? marks : [
        { subject: "Mathematics", score: 85, grade: "A" },
        { subject: "Science", score: 78, grade: "B+" },
        { subject: "English", score: 92, grade: "A+" }
      ];

      const avgScore = Math.round(finalMarks.reduce((sum, m) => sum + m.score, 0) / finalMarks.length);

      let attendanceRate = "100%";
      if (attendance && attendance.length > 0) {
        const presentCount = attendance.filter((a: any) => a.status === "present").length;
        attendanceRate = `${Math.round((presentCount / attendance.length) * 100)}%`;
      }

      const gradeName = Array.from(subjectsMap.values())[0] || "10-A";

      setSelectedStudent({
        id: student.id.substring(0, 8).toUpperCase(),
        name: student.name,
        grade: gradeName,
        avg: avgScore,
        attendance: attendanceRate,
        marks: finalMarks
      });
    } catch (err) {
      console.error("Error creating report:", err);
      toast.error("Failed to generate complete report card.");
    } finally {
      setLoadingReport(false);
    }
  };

  // Save modified user role
  const handleSaveRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: editingRole })
        .eq("id", userId);
      
      if (!error) {
        toast.success("User role updated successfully!");
        setEditingUserId(null);
        fetchUsers();
      } else {
        throw error;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const todayTotal = todayPresent + todayAbsent;
  const avgAttendance = todayTotal > 0 ? `${Math.round((todayPresent / todayTotal) * 100)}%` : "N/A";

  const realStudentsList = fetchedUsers.filter((u: any) => u.role === "student");

  if (userStatus === "pending") {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] top-[-100px] left-[-100px] pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px] bottom-[-80px] right-[-80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-12 flex flex-col items-center text-center max-w-lg w-full rounded-3xl relative z-10"
        >
          {/* Pulsing icon */}
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-primary/30 blur-md"
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"
            >
              <ShieldCheck className="w-12 h-12 text-primary" />
            </motion.div>
          </div>

          <h1 className="text-3xl font-bold mb-3 font-heading">Pending Approval</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
            Your admin account has been registered. An existing administrator needs to verify and approve your access before you can enter the portal.
          </p>

          {/* Status Steps */}
          <div className="w-full space-y-3 mb-10">
            {[
              { label: "Account Created", done: true },
              { label: "Awaiting Admin Approval", done: false, active: true },
              { label: "Access Granted", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? "bg-green-500/20 border border-green-500/40" :
                  step.active ? "bg-primary/20 border border-primary/40" :
                  "bg-white/5 border border-white/10"
                }`}>
                  {step.done ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : step.active ? (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  step.done ? "text-green-400" :
                  step.active ? "text-white" :
                  "text-muted-foreground"
                }`}>{step.label}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full rounded-full" onClick={() => { sessionStorage.clear(); window.location.href = "/"; }}>
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

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
        active: activeTab === item.id,
        badge: item.id === "messages" ? unreadCount : undefined,
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
              <StatCard icon={Users} label="Total Students" value={totalStudents.toString()} index={0} />
              <StatCard icon={GraduationCap} label="Teachers" value={totalTeachers.toString()} index={1} />
              <StatCard icon={BookOpen} label="Active Classes" value={totalClasses.toString()} index={2} />
              <StatCard icon={UserCheck} label="Today's Attendance" value={avgAttendance} index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-4 md:p-7"
              >
                <h2 className="text-lg font-semibold mb-5">Active Classes</h2>
                <div className="space-y-3">
                  {classesList.length === 0 && (
                    <p className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-xl">No classes have been created yet.</p>
                  )}
                  {classesList.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">{cls.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cls.className} • {cls.teacherName}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-green-500/10 text-green-600">
                        active
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-4 md:p-7"
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
            {loadingReport ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Calculating academic performance & loading records...</p>
              </div>
            ) : !selectedStudent ? (
              <div className="glass-panel p-4 md:p-7">
                <h2 className="text-lg font-semibold mb-6">Select Student to Generate Report</h2>
                <div className="space-y-3">
                  {realStudentsList.length === 0 && (
                    <p className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-xl">No students registered in the database.</p>
                  )}
                  {realStudentsList.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          {s.name ? s.name.split(" ").map((n: any) => n[0]).join("") : "ST"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {s.id.substring(0, 8).toUpperCase()} • {s.email}</p>
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

        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* ── Pending Admin Approvals Banner ── */}
            {fetchedUsers.filter(u => isAdminPending(u) && u.id !== currentUser?.uid).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-4 md:p-6 border border-yellow-500/30 bg-yellow-500/5"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-300 text-sm">Admin Approvals Required</h3>
                    <p className="text-xs text-yellow-400/70">The following accounts are awaiting your approval to access the admin portal.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {fetchedUsers
                    .filter(u => isAdminPending(u) && u.id !== currentUser?.uid)
                    .map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-400">
                            {user.name ? user.name.split(" ").map((n: string) => n[0]).join("") : "AD"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-8 px-4 text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                            onClick={() => handleApproveAdmin(user.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </motion.div>
            )}

            {/* ── All Users Table ── */}
            <div className="glass-panel p-4 md:p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">All Users</h2>
                <p className="text-sm text-muted-foreground">{fetchedUsers.length} total users</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-4 font-medium">Name</th>
                      <th className="pb-4 font-medium">Role</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Email</th>
                      <th className="pb-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {fetchedUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">No users registered yet.</td>
                      </tr>
                    )}
                    {fetchedUsers.map((user) => (
                      <tr key={user.id || user.email} className="group hover:bg-secondary/30 transition-colors">
                        <td className="py-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {user.name ? user.name.split(" ").map((n: string) => n[0]).join("") : "??"}
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td className="py-4">
                          {editingUserId === user.id ? (
                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value)}
                              className="px-2 py-1 rounded bg-secondary text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="admin">ADMIN</option>
                              <option value="teacher">TEACHER</option>
                              <option value="student">STUDENT</option>
                              <option value="parent">PARENT</option>
                            </select>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-semibold uppercase tracking-wider">
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          {isAdminPending(user) ? (
                            <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[11px] font-semibold uppercase tracking-wider">
                              Pending
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-[11px] font-semibold uppercase tracking-wider">
                              Approved
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-muted-foreground text-xs">{user.email}</td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {isAdminPending(user) && user.id !== currentUser?.uid && (
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleApproveAdmin(user.id)}
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                            )}
                            {editingUserId === user.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleSaveRole(user.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setEditingUserId(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setEditingRole(user.role);
                                }}
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Button>
                            )}
                            {/* Delete button — skip current logged-in user */}
                            {user.id !== currentUser?.uid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => handleDeleteUser(user.id, user.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="glass-panel p-4 md:p-7">
              <h2 className="text-lg font-semibold mb-2">Daily Attendance Overview</h2>
              <p className="text-xs text-muted-foreground mb-6">
                📅 Today: <span className="font-semibold text-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Present</p>
                  <p className="text-2xl font-bold">{todayPresent}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Absent</p>
                  <p className="text-2xl font-bold">{todayAbsent}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold">{avgAttendance}</p>
                </div>
              </div>
              {todayTotal === 0 ? (
                <div className="p-6 text-center bg-secondary/20 rounded-xl">
                  <UserCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No attendance has been recorded for today yet. Teachers can mark attendance from their dashboard.</p>
                </div>
              ) : (
                <div className="mt-8 border-t border-border/40 pt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-base font-semibold">Today's Student Attendance Log</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Showing students who were checked in today
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      {/* Search Input */}
                      <input
                        type="text"
                        placeholder="Search student or class…"
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
                        className="w-full sm:w-56 h-9 px-3 rounded-lg bg-secondary/50 border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background"
                      />

                      {/* Filter pills */}
                      <div className="flex gap-1.5 rounded-lg bg-secondary p-0.5 border border-border/30">
                        {["all", "present", "absent"].map((filterOpt) => (
                          <button
                            key={filterOpt}
                            onClick={() => setAttendanceFilter(filterOpt)}
                            className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-all ${
                              attendanceFilter === filterOpt
                                ? "bg-background text-foreground shadow-sm font-bold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {filterOpt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold">
                          <th className="pb-3 pl-2">Student Name</th>
                          <th className="pb-3">Email Address</th>
                          <th className="pb-3">Subject / class</th>
                          <th className="pb-3 text-right pr-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {todayAttendanceList
                          .filter((rec) => {
                            if (attendanceFilter === "present" && rec.status !== "present") return false;
                            if (attendanceFilter === "absent" && rec.status !== "absent") return false;
                            
                            if (attendanceSearch.trim()) {
                              const s = attendanceSearch.toLowerCase().trim();
                              const nameMatch = rec.profiles?.name?.toLowerCase().includes(s);
                              const emailMatch = rec.profiles?.email?.toLowerCase().includes(s);
                              const subjectMatch = rec.classes?.subject?.toLowerCase().includes(s);
                              const classMatch = rec.classes?.class_name?.toLowerCase().includes(s);
                              return nameMatch || emailMatch || subjectMatch || classMatch;
                            }
                            return true;
                          })
                          .map((rec, idx) => (
                            <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                              <td className="py-3 pl-2 font-medium">{rec.profiles?.name || "Unknown"}</td>
                              <td className="py-3 text-muted-foreground">{rec.profiles?.email || "N/A"}</td>
                              <td className="py-3 font-medium">
                                <span className="capitalize">{rec.classes?.subject || "General Class"}</span>{" "}
                                <span className="text-muted-foreground text-[10px]">({rec.classes?.class_name || "N/A"})</span>
                              </td>
                              <td className="py-3 text-right pr-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    rec.status === "present"
                                      ? "bg-green-500/10 text-green-600"
                                      : "bg-red-500/10 text-red-500"
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        {todayAttendanceList.filter((rec) => {
                          if (attendanceFilter === "present" && rec.status !== "present") return false;
                          if (attendanceFilter === "absent" && rec.status !== "absent") return false;
                          if (attendanceSearch.trim()) {
                            const s = attendanceSearch.toLowerCase().trim();
                            const nameMatch = rec.profiles?.name?.toLowerCase().includes(s);
                            const emailMatch = rec.profiles?.email?.toLowerCase().includes(s);
                            const subjectMatch = rec.classes?.subject?.toLowerCase().includes(s);
                            const classMatch = rec.classes?.class_name?.toLowerCase().includes(s);
                            return nameMatch || emailMatch || subjectMatch || classMatch;
                          }
                          return true;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-muted-foreground">
                              No matching attendance records found for today.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {/* ==================== MESSAGES TAB ==================== */}
        {activeTab === "messages" && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-[calc(100vh-180px)] flex gap-5"
          >
            {/* Conversation list */}
            <div className={`glass-panel flex flex-col ${selectedConversation ? "hidden md:flex w-72 flex-shrink-0" : "flex-1 md:flex-none md:w-80"}`}>
              <div className="p-5 border-b border-border/50">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Parent Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                {conversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
                {conversations.map((conv) => (
                  <button
                    key={conv.parent_uid}
                    onClick={() => handleOpenConversation(conv)}
                    className={`w-full text-left p-4 hover:bg-secondary/50 transition-colors flex items-start gap-3 ${
                      selectedConversation?.parent_uid === conv.parent_uid ? "bg-primary/5 border-l-2 border-primary" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {conv.parent_name?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{conv.parent_name || "Parent"}</p>
                        {conv.unread > 0 && (
                          <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.latest_message}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation thread */}
            {selectedConversation ? (
              <div className="glass-panel flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="p-5 border-b border-border/50 flex items-center gap-3">
                  <button
                    className="md:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors mr-1"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {selectedConversation.parent_name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedConversation.parent_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedConversation.parent_email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {conversationMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                          msg.sender === "admin"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-secondary text-foreground rounded-tl-sm"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.message}</p>
                        <p className={`text-[10px] mt-1.5 ${
                          msg.sender === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" · "}
                          {new Date(msg.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply input */}
                <div className="p-4 border-t border-border/50 flex gap-3">
                  <input
                    type="text"
                    placeholder="Type your reply…"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAdminReply()}
                    className="flex-1 h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                  />
                  <button
                    onClick={handleAdminReply}
                    disabled={sendingReply || !adminReply.trim()}
                    className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {sendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-14 w-14 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;

