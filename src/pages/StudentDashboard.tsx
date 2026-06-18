import { Trophy, TrendingUp, CalendarCheck, BarChart3, FileText, BookOpen, GraduationCap, CheckCircle2, Users, Check, X, Clock, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import studentBg from "@/assets/student-cover.png";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "Classes", id: "classes", icon: GraduationCap },
  { label: "Results", id: "results", icon: FileText },
  { label: "Attendance", id: "attendance", icon: CalendarCheck },
  { label: "Assignments", id: "assignments", icon: BookOpen },
  { label: "Parent Requests", id: "parent-requests", icon: Users },
];

// Helper: Convert numeric score to letter grade
const getLetterGrade = (score: number): string => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
};

// Helper: Get month abbreviation from a timestamp or Date
const getMonthLabel = (timestamp: any): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("default", { month: "short" });
  } catch {
    return "N/A";
  }
};

const StudentDashboard = () => {
  const { currentUser, userName } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissionFiles, setSubmissionFiles] = useState<Record<string, File | null>>({});

  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState<string | null>(null);
  
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [parentRequests, setParentRequests] = useState<any[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Fetch all available classes
  useEffect(() => {
    const fetchAllClasses = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*");
      if (data && !error) {
        const mapped = data.map(item => ({
          id: item.id,
          teacherId: item.teacher_id,
          teacherName: item.teacher_name,
          subject: item.subject,
          className: item.class_name,
          createdAt: item.created_at
        }));
        setAllClasses(mapped);
      }
    };

    fetchAllClasses();

    const channel = supabase
      .channel('classes-all-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
        fetchAllClasses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch all assignments
  useEffect(() => {
    const fetchAllAssignments = async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*");
      if (data && !error) {
        const mapped = data.map(item => ({
          id: item.id,
          teacherId: item.teacher_id,
          classId: item.class_id,
          className: item.class_name,
          subject: item.subject,
          title: item.title,
          fileUrl: item.file_url,
          imageUrl: item.image_url,
          dueDate: item.due_date,
          submitted: item.submitted,
          total: item.total,
          createdAt: item.created_at
        }));
        setAllAssignments(mapped);
      }
    };

    fetchAllAssignments();

    const channel = supabase
      .channel('assignments-all-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => {
        fetchAllAssignments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch student's full submissions (not just IDs)
  useEffect(() => {
    if (!currentUser) return;

    const fetchMySubmissions = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_uid", currentUser.uid);
      
      if (data && !error) {
        const mapped = data.map(item => ({
          id: item.id,
          assignmentId: item.assignment_id,
          assignmentTitle: item.assignment_title,
          studentUid: item.student_uid,
          studentName: item.student_name,
          teacherId: item.teacher_id,
          classId: item.class_id,
          subject: item.subject,
          fileUrl: item.file_url,
          grade: item.grade,
          gradedAt: item.graded_at,
          submittedAt: item.submitted_at
        }));
        setMySubmissions(mapped);
      }
    };

    fetchMySubmissions();

    const channel = supabase
      .channel(`submissions-my-${currentUser.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `student_uid=eq.${currentUser.uid}` }, () => {
        fetchMySubmissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Determine which classes the current user is enrolled in
  useEffect(() => {
    if (!currentUser) return;

    const checkEnrollments = async () => {
      const { data, error } = await supabase
        .from("class_students")
        .select("class_id")
        .eq("student_uid", currentUser.uid);
      
      if (data && !error) {
        setEnrolledClassIds(data.map(item => item.class_id));
      }
    };

    checkEnrollments();

    const channel = supabase
      .channel(`class-students-my-${currentUser.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_students', filter: `student_uid=eq.${currentUser.uid}` }, () => {
        checkEnrollments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Fetch real attendance history
  useEffect(() => {
    if (!currentUser || enrolledClassIds.length === 0) return;

    const fetchAttendanceHistory = async () => {
      const { data, error } = await supabase
        .from("attendance_history")
        .select("*")
        .eq("student_uid", currentUser.uid);
      
      if (data && !error) {
        const mapped = data.map(item => ({
          id: item.id,
          classId: item.class_id,
          dateStr: item.date_str,
          status: item.status,
          markedAt: item.marked_at
        }));
        mapped.sort((a, b) => {
          const aTime = a.markedAt ? new Date(a.markedAt).getTime() : 0;
          const bTime = b.markedAt ? new Date(b.markedAt).getTime() : 0;
          return bTime - aTime;
        });
        setAttendanceLogs(mapped);
      }
    };

    fetchAttendanceHistory();

    const channel = supabase
      .channel(`attendance-history-my-${currentUser.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_history', filter: `student_uid=eq.${currentUser.uid}` }, () => {
        fetchAttendanceHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, enrolledClassIds]);

  // Fetch parent link requests
  useEffect(() => {
    if (!currentUser) return;

    const fetchParentRequests = async () => {
      const { data, error } = await supabase
        .from("parent_child_links")
        .select("id, parent_uid, parent_name, parent_email, status, created_at")
        .eq("child_uid", currentUser.uid);

      if (data && !error) {
        setParentRequests(data);
      }
    };

    fetchParentRequests();

    const channel = supabase
      .channel(`parent-requests-${currentUser.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_child_links', filter: `child_uid=eq.${currentUser.uid}` }, () => {
        fetchParentRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Handle accept/reject parent request
  const handleParentRequest = async (requestId: string, action: "accepted" | "rejected") => {
    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from("parent_child_links")
        .update({ status: action })
        .eq("id", requestId);

      if (error) {
        toast.error(`Failed to ${action === "accepted" ? "accept" : "reject"} request.`);
        console.error(error);
      } else {
        toast.success(
          action === "accepted"
            ? "Parent linked successfully! They can now view your data."
            : "Request rejected."
        );
        // Refresh the list
        const { data } = await supabase
          .from("parent_child_links")
          .select("id, parent_uid, parent_name, parent_email, status, created_at")
          .eq("child_uid", currentUser!.uid);
        if (data) setParentRequests(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    }
    setProcessingRequest(null);
  };

  const presentCount = attendanceLogs.filter(log => log.status === "present").length;
  const absentCount = attendanceLogs.filter(log => log.status === "absent").length;
  const totalCount = presentCount + absentCount;
  const attendanceRate = totalCount === 0 ? "0%" : `${Math.round((presentCount / totalCount) * 100)}%`;

  const handleRegister = async (classId: string) => {
    if (!currentUser) return;
    setIsRegistering(classId);
    try {
      // Ensure profile exists in Supabase to satisfy foreign key constraint
      await supabase.from("profiles").upsert({
        id: currentUser.uid,
        name: userName || currentUser.displayName || "Unknown Student",
        email: currentUser.email || "",
        role: "student"
      });

      const { error } = await supabase.from("class_students").insert({
        class_id: classId,
        student_uid: currentUser.uid,
        student_name: userName || "Unknown Student",
        current_attendance_status: "present"
      });
      if (error) throw error;
      toast.success("Successfully registered for class!");
      setEnrolledClassIds(prev => [...prev, classId]);
    } catch (error: any) {
      console.error("Registration error", error);
      toast.error(error.message || "Failed to register for the class.");
    } finally {
      setIsRegistering(null);
    }
  };

  const handleSubmit = async (assignment: any) => {
    if (!currentUser) return;
    setSubmitting(assignment.id);
    let fileUrl = "";

    try {
      // Ensure profile exists in Supabase to satisfy foreign key constraint
      await supabase.from("profiles").upsert({
        id: currentUser.uid,
        name: userName || currentUser.displayName || "Unknown Student",
        email: currentUser.email || "",
        role: "student"
      });

      const file = submissionFiles[assignment.id];
      if (file) {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filePath = `submissions/${currentUser.uid}/${Date.now()}_${sanitizedName}`;
        const { data, error: uploadError } = await supabase.storage
          .from("assignments")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("assignments")
          .getPublicUrl(filePath);
        fileUrl = publicUrl;
      }

      const { error } = await supabase.from("submissions").insert({
        assignment_id: assignment.id,
        assignment_title: assignment.title,
        student_uid: currentUser.uid,
        student_name: userName || "Unknown Student",
        teacher_id: assignment.teacherId,
        class_id: assignment.classId,
        subject: assignment.subject,
        file_url: fileUrl,
        grade: null
      });
      if (error) throw error;

      // Increment submitted count on assignment
      const { data: currentAssignment } = await supabase
        .from("assignments")
        .select("submitted")
        .eq("id", assignment.id)
        .single();
      
      const newSubmitted = (currentAssignment?.submitted || 0) + 1;
      await supabase
        .from("assignments")
        .update({ submitted: newSubmitted })
        .eq("id", assignment.id);

      toast.success("Assignment submitted successfully!");
      setSubmissionFiles(prev => {
        const copy = { ...prev };
        delete copy[assignment.id];
        return copy;
      });
    } catch (error: any) {
      console.error("Submission error", error);
      if (error.message?.includes("Bucket not found") || JSON.stringify(error)?.includes("Bucket not found")) {
        toast.error("Supabase Storage bucket 'submissions' was not found. Please log in to your Supabase Console, navigate to Storage, and create a PUBLIC bucket named 'submissions'.");
      } else {
        toast.error(error.message || "Failed to submit assignment.");
      }
    } finally {
      setSubmitting(null);
    }
  };

  const handleDownloadFile = async (fileUrl: string) => {
    try {
      let bucket = "assignments";
      let filePath = "";
      
      const assignmentsIndex = fileUrl.indexOf("/assignments/");
      const submissionsIndex = fileUrl.indexOf("/submissions/");
      
      if (assignmentsIndex !== -1) {
        bucket = "assignments";
        filePath = decodeURIComponent(fileUrl.substring(assignmentsIndex + "/assignments/".length));
      } else if (submissionsIndex !== -1) {
        bucket = "submissions";
        filePath = decodeURIComponent(fileUrl.substring(submissionsIndex + "/submissions/".length));
      } else {
        window.open(fileUrl, "_blank");
        return;
      }
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);
      
      if (error) throw error;
      
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filePath.split("/").pop() || "download");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error("Error downloading file:", err);
      toast.error(`Download failed: ${err.message || JSON.stringify(err)}. (Bucket: ${bucket}, Path: ${filePath})`);
    }
  };

  const myAssignments = allAssignments.filter(a => enrolledClassIds.includes(a.classId));
  const submittedAssignmentIds = mySubmissions.map(s => s.assignmentId);

  // Compute subject scores from graded submissions
  const subjectScores = useMemo(() => {
    const graded = mySubmissions.filter(s => s.grade !== null);
    const subjectMap: Record<string, { total: number; count: number }> = {};
    graded.forEach(s => {
      if (!subjectMap[s.subject]) subjectMap[s.subject] = { total: 0, count: 0 };
      subjectMap[s.subject].total += s.grade;
      subjectMap[s.subject].count++;
    });
    return Object.entries(subjectMap).map(([name, data]) => {
      const avg = Math.round(data.total / data.count);
      return { name, score: avg, grade: getLetterGrade(avg) };
    });
  }, [mySubmissions]);

  // Compute overall average
  const overallAverage = useMemo(() => {
    const graded = mySubmissions.filter(s => s.grade !== null);
    if (graded.length === 0) return "N/A";
    const avg = graded.reduce((sum, s) => sum + s.grade, 0) / graded.length;
    return `${Math.round(avg * 10) / 10}%`;
  }, [mySubmissions]);

  // Compute performance trend from graded submissions grouped by month
  const performanceData = useMemo(() => {
    const graded = mySubmissions.filter(s => s.grade !== null && (s.gradedAt || s.submittedAt));
    const monthMap: Record<string, { total: number; count: number; order: number }> = {};
    graded.forEach(s => {
      const ts = s.gradedAt || s.submittedAt;
      const label = getMonthLabel(ts);
      try {
        const date = ts?.toDate ? ts.toDate() : new Date(ts);
        const order = date.getFullYear() * 12 + date.getMonth();
        if (!monthMap[label]) monthMap[label] = { total: 0, count: 0, order };
        monthMap[label].total += s.grade;
        monthMap[label].count++;
      } catch { /* skip bad timestamps */ }
    });
    return Object.entries(monthMap)
      .map(([month, data]) => ({ month, score: Math.round(data.total / data.count), order: data.order }))
      .sort((a, b) => a.order - b.order);
  }, [mySubmissions]);

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
              <StatCard icon={Trophy} label="Overall Average" value={overallAverage} index={0} />
              <StatCard icon={TrendingUp} label="Subjects Enrolled" value={subjectScores.length.toString()} index={1} />
              <StatCard icon={CalendarCheck} label="Submissions" value={mySubmissions.length.toString()} index={2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="luxury-card-static p-7"
              >
                <h2 className="text-lg font-semibold mb-6">Performance Trend</h2>
                {performanceData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground text-sm">
                    <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
                    <p>No graded submissions yet. Your performance trend will appear here once your teacher grades your work.</p>
                  </div>
                ) : (
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
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 62%)" domain={[0, 100]} />
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
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="luxury-card-static p-7"
              >
                <h2 className="text-lg font-semibold mb-5">Subject Scores</h2>
                {subjectScores.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
                    <BookOpen className="w-10 h-10 mb-3 opacity-30" />
                    <p>No grades recorded yet. Submit assignments and get graded to see your subject averages here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjectScores.map((s) => (
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
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === "classes" && (
          <motion.div
            key="classes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold mb-6">Available Classes & Subjects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allClasses.length === 0 && (
                <div className="col-span-full p-8 text-center bg-secondary/20 rounded-2xl border border-border/50">
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">No classes are currently available.</p>
                </div>
              )}
              {allClasses.map((cls) => {
                const isEnrolled = enrolledClassIds.includes(cls.id);
                return (
                  <div key={cls.id} className="luxury-card-static p-6 flex flex-col justify-between hover:border-primary/30 transition-colors">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        {isEnrolled && (
                          <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold border border-green-500/20 uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Registered
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xl leading-tight mb-1">{cls.subject}</h3>
                      <p className="text-sm text-muted-foreground font-medium mb-1">{cls.className}</p>
                      <p className="text-xs text-muted-foreground mb-6">Teacher: {cls.teacherName}</p>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={isEnrolled ? "outline" : "default"}
                      disabled={isEnrolled || isRegistering === cls.id}
                      onClick={() => handleRegister(cls.id)}
                    >
                      {isRegistering === cls.id ? "Registering..." : (isEnrolled ? "Enrolled" : "Register Now")}
                    </Button>
                  </div>
                );
              })}
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
            {subjectScores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p>No results yet. Your academic results will appear here once your teacher grades your submissions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjectScores.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Average from graded submissions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{s.score}/100</p>
                      <p className="text-xs font-semibold text-primary">Grade {s.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <p className="text-3xl font-bold">{attendanceRate}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Present</p>
                <p className="text-3xl font-bold">{presentCount}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Absent</p>
                <p className="text-3xl font-bold">{absentCount}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold mb-4">Detailed Log</p>
              {attendanceLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records found.</p>
              ) : (
                attendanceLogs.map((log, i) => (
                  <div key={i} className="flex justify-between p-3 px-4 rounded-lg bg-secondary/20 items-center">
                    <span className="text-sm">{log.dateStr}</span>
                    <span className={`text-[10px] font-bold uppercase ${log.status === 'present' ? 'text-green-600' : 'text-red-600'}`}>
                      {log.status}
                    </span>
                  </div>
                ))
              )}
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
            {myAssignments.length === 0 && (
              <div className="text-center p-8 text-muted-foreground bg-secondary/20 rounded-xl">
                No assignments available yet. Register for classes to see assignments.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {myAssignments.map((a) => {
                const submission = mySubmissions.find(s => s.assignmentId === a.id);
                const isSubmitted = submittedAssignmentIds.includes(a.id);
                const isGraded = submission && submission.grade !== null;
                return (
                  <div key={a.id} className="luxury-card-static p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="font-semibold text-lg">{a.title}</h3>
                      <p className="text-sm text-muted-foreground">{a.subject} • {a.className} • Due: {a.dueDate}</p>
                      {(a.fileUrl || a.imageUrl) && (
                        <div className="flex gap-3 mt-2">
                          {a.fileUrl && <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline hover:text-primary/80">View PDF</a>}
                          {a.imageUrl && <a href={a.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline hover:text-primary/80">View Image</a>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {isGraded ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold border border-blue-500/20 uppercase">
                            Graded: {submission.grade}/100 ({getLetterGrade(submission.grade)})
                          </span>
                          {submission?.fileUrl && (
                            <button 
                              onClick={() => handleDownloadFile(submission.fileUrl)}
                              className="text-xs text-primary underline hover:text-primary/80 bg-transparent border-0 p-0 cursor-pointer"
                            >
                              Download My Submission
                            </button>
                          )}
                        </div>
                      ) : isSubmitted ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20 uppercase">
                            Submitted — Pending Grade
                          </span>
                          {submission?.fileUrl && (
                            <button 
                              onClick={() => handleDownloadFile(submission.fileUrl)}
                              className="text-xs text-primary underline hover:text-primary/80 bg-transparent border-0 p-0 cursor-pointer"
                            >
                              Download My Submission
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative">
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => setSubmissionFiles(prev => ({ ...prev, [a.id]: e.target.files?.[0] || null }))}
                            />
                            <Button variant="outline" size="sm" className="pointer-events-none">
                              <BookOpen className="w-4 h-4 mr-2" /> {submissionFiles[a.id] ? submissionFiles[a.id]?.name : "Upload Work"}
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSubmit(a)}
                            disabled={submitting === a.id}
                          >
                            {submitting === a.id ? "Submitting..." : "Submit"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==================== PARENT REQUESTS TAB ==================== */}
        {activeTab === "parent-requests" && (
          <motion.div
            key="parent-requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Info banner */}
            <div className="luxury-card-static p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Parent Link Requests</h2>
                <p className="text-sm text-muted-foreground">
                  When you accept a request, your parent will be able to see your grades, attendance, and notifications.
                </p>
              </div>
            </div>

            {/* Pending requests */}
            {parentRequests.filter(r => r.status === "pending").length > 0 && (
              <div className="luxury-card-static p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Requests
                </h3>
                <div className="space-y-3">
                  {parentRequests
                    .filter(r => r.status === "pending")
                    .map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-sm">
                            {req.parent_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{req.parent_name || "Parent"}</p>
                            <p className="text-xs text-muted-foreground">{req.parent_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleParentRequest(req.id, "accepted")}
                            disabled={processingRequest === req.id}
                            className="h-9 px-4 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                          >
                            {processingRequest === req.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleParentRequest(req.id, "rejected")}
                            disabled={processingRequest === req.id}
                            className="h-9 px-4 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Accepted parents */}
            {parentRequests.filter(r => r.status === "accepted").length > 0 && (
              <div className="luxury-card-static p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Linked Parents
                </h3>
                <div className="space-y-3">
                  {parentRequests
                    .filter(r => r.status === "accepted")
                    .map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-green-500/5 border border-green-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-sm">
                            {req.parent_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{req.parent_name || "Parent"}</p>
                            <p className="text-xs text-muted-foreground">{req.parent_email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Linked
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Rejected requests */}
            {parentRequests.filter(r => r.status === "rejected").length > 0 && (
              <div className="luxury-card-static p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  Rejected Requests
                </h3>
                <div className="space-y-3">
                  {parentRequests
                    .filter(r => r.status === "rejected")
                    .map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-sm">
                            {req.parent_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{req.parent_name || "Parent"}</p>
                            <p className="text-xs text-muted-foreground">{req.parent_email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-red-500/10 text-red-500">
                          Rejected
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {parentRequests.length === 0 && (
              <div className="text-center py-16">
                <Users className="h-14 w-14 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-muted-foreground text-sm">No parent link requests yet.</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Your parent can send a link request from their Parent portal.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
        </DashboardLayout>
      </div>
    </>
  );
};

export default StudentDashboard;
