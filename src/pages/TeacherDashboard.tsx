import { BookOpen, ClipboardCheck, AlertTriangle, BarChart3, UserCheck, FileText, ChevronRight, GraduationCap, ChevronLeft, Sparkles, BrainCircuit, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generateStudentGrowthTips, GrowthTips } from "@/lib/gemini";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "My Classes", id: "classes", icon: BookOpen },
  { label: "Attendance", id: "attendance", icon: UserCheck },
  { label: "Marks Entry", id: "marks", icon: ClipboardCheck },
  { label: "Assignments", id: "assignments", icon: FileText },
];

const TeacherDashboard = () => {
  const { currentUser, userName } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Real-time classes & attendance state
  const [classes, setClasses] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Real-time assignments state
  const [assignmentList, setAssignmentList] = useState<any[]>([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentClassId, setNewAssignmentClassId] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentImage, setAssignmentImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Real-time analytics state
  const [globalAttendanceStat, setGlobalAttendanceStat] = useState<string>("0%");
  const [allStudentsMap, setAllStudentsMap] = useState<Record<string, any[]>>({});
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [realFlaggedStudents, setRealFlaggedStudents] = useState<any[]>([]);
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [gradingId, setGradingId] = useState<string | null>(null);

  // AI Pedagogical Tips state
  const [selectedFlaggedStudent, setSelectedFlaggedStudent] = useState<any | null>(null);
  const [flaggedStudentTips, setFlaggedStudentTips] = useState<GrowthTips | null>(null);
  const [loadingFlaggedTips, setLoadingFlaggedTips] = useState(false);

  const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);
  const [allSubmissionsList, setAllSubmissionsList] = useState<any[]>([]);

  // Fetch teacher's classes
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", currentUser.uid);
      if (data && !error) {
        const mapped = data.map(item => ({
          id: item.id,
          teacherId: item.teacher_id,
          teacherName: item.teacher_name,
          subject: item.subject,
          className: item.class_name,
          createdAt: item.created_at
        }));
        setClasses(mapped);
        if (mapped.length > 0 && !selectedClassId) {
          setSelectedClassId(mapped[0].id);
        }
      }
    };

    fetchClasses();

    const channel = supabase
      .channel('classes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
        fetchClasses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Fetch students for all classes to calculate global attendance
  useEffect(() => {
    if (classes.length === 0) return;
    
    const fetchAllStudents = async () => {
      const classIds = classes.map(c => c.id);
      const { data, error } = await supabase
        .from("class_students")
        .select("*")
        .in("class_id", classIds);
      
      if (data && !error) {
        const map: Record<string, any[]> = {};
        classes.forEach(c => {
          map[c.id] = [];
        });
        data.forEach(item => {
          if (map[item.class_id]) {
            map[item.class_id].push({
              id: item.student_uid,
              studentUid: item.student_uid,
              studentName: item.student_name,
              currentAttendanceStatus: item.current_attendance_status
            });
          }
        });
        setAllStudentsMap(map);
      }
    };

    fetchAllStudents();

    const channel = supabase
      .channel('class-students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_students' }, () => {
        fetchAllStudents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classes]);

  // Calculate global attendance stat
  useEffect(() => {
    let enrolled = 0;
    let present = 0;
    Object.values(allStudentsMap).forEach(classStudentsArr => {
      classStudentsArr.forEach(student => {
        enrolled++;
        if (!student.currentAttendanceStatus || student.currentAttendanceStatus === "present") {
          present++;
        }
      });
    });
    if (enrolled === 0) setGlobalAttendanceStat("0%");
    else setGlobalAttendanceStat(`${Math.round((present / enrolled) * 100)}%`);
  }, [allStudentsMap]);

  // Fetch students & today's attendance for the selected class
  useEffect(() => {
    if (!selectedClassId) {
      setClassStudents([]);
      setLocalAttendance({});
      return;
    }

    const fetchClassStudentsAndAttendance = async () => {
      // 1. Fetch class students
      const { data: studentsData, error: studentsError } = await supabase
        .from("class_students")
        .select("*")
        .eq("class_id", selectedClassId);
      
      if (studentsData && !studentsError) {
        const mappedStudents = studentsData.map(item => ({
          id: item.student_uid,
          studentUid: item.student_uid,
          studentName: item.student_name
        }));
        setClassStudents(mappedStudents);

        // 2. Fetch today's attendance history records
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: historyData, error: historyError } = await supabase
          .from("attendance_history")
          .select("*")
          .eq("class_id", selectedClassId)
          .eq("date_str", todayStr);
        
        if (historyData && !historyError) {
          const attendanceMap: Record<string, 'present' | 'absent'> = {};
          historyData.forEach(record => {
            attendanceMap[record.student_uid] = record.status as 'present' | 'absent';
          });
          setLocalAttendance(attendanceMap);
        } else {
          setLocalAttendance({});
        }
      }
    };

    fetchClassStudentsAndAttendance();

    const channel = supabase
      .channel(`attendance-history-today-${selectedClassId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_history', filter: `class_id=eq.${selectedClassId}` }, () => {
        fetchClassStudentsAndAttendance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClassId]);

  // Fetch assignments for the teacher
  useEffect(() => {
    if (!currentUser) return;

    const fetchAssignments = async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("teacher_id", currentUser.uid);
      
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
        setAssignmentList(mapped);
      }
    };

    fetchAssignments();

    const channel = supabase
      .channel('assignments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);
  // Fetch submissions to calculate pending marks and flagged students
  useEffect(() => {
    if (!currentUser) return;

    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("teacher_id", currentUser.uid);
      
      if (data && !error) {
        const allSubs = data.map(item => ({
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
        
        setAllSubmissionsList(allSubs);
        const pending = allSubs.filter(s => s.grade === null);
        setPendingSubmissions(pending);
        
        const graded = allSubs.filter(s => s.grade !== null);
        const studentAverages: Record<string, { totalScore: number, count: number, name: string, subject: string }> = {};
        
        graded.forEach(s => {
          if (!studentAverages[s.studentUid]) {
            studentAverages[s.studentUid] = { totalScore: 0, count: 0, name: s.studentName, subject: s.subject };
          }
          studentAverages[s.studentUid].totalScore += s.grade;
          studentAverages[s.studentUid].count++;
        });
        
        const flagged: any[] = [];
        Object.keys(studentAverages).forEach(uid => {
          const avg = studentAverages[uid].totalScore / studentAverages[uid].count;
          if (avg < 50) {
            flagged.push({
              id: uid,
              name: studentAverages[uid].name,
              subject: studentAverages[uid].subject,
              avg: Math.round(avg),
              trend: "declining"
            });
          }
        });
        setRealFlaggedStudents(flagged);
      }
    };

    fetchSubmissions();

    const channel = supabase
      .channel('submissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchSubmissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);


  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newClassName || !currentUser) return;
    try {
      // Ensure profile exists in Supabase to satisfy foreign key constraint
      await supabase.from("profiles").upsert({
        id: currentUser.uid,
        name: userName || currentUser.displayName || "Unknown Teacher",
        email: currentUser.email || "",
        role: "teacher"
      });

      const { error } = await supabase.from("classes").insert({
        teacher_id: currentUser.uid,
        teacher_name: userName || "Unknown Teacher",
        subject: newSubject,
        class_name: newClassName
      });
      if (error) throw error;
      toast.success("Class created successfully!");
      setNewSubject("");
      setNewClassName("");
    } catch (error: any) {
      console.error("Error creating class", error);
      toast.error(error.message || "Failed to create class.");
    }
  };

  const handleMarkLocalAttendance = (studentUid: string, status: 'present' | 'absent') => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentUid]: status
    }));
  };

  const handleSelectFlaggedStudent = async (student: any) => {
    setSelectedFlaggedStudent(student);
    setLoadingFlaggedTips(true);
    setFlaggedStudentTips(null);

    try {
      // 1. Fetch student's grades for AI prompt
      const { data: submissions } = await supabase
        .from("submissions")
        .select("subject, grade")
        .eq("student_uid", student.id);

      const grouped: Record<string, { total: number; count: number }> = {};
      if (submissions) {
        submissions.forEach((s: any) => {
          if (s.subject && s.grade !== null) {
            if (!grouped[s.subject]) grouped[s.subject] = { total: 0, count: 0 };
            grouped[s.subject].total += s.grade;
            grouped[s.subject].count += 1;
          }
        });
      }
      const subjectsGrades = Object.entries(grouped).map(([name, stats]: any) => ({
        name,
        score: stats.count > 0 ? Math.round(stats.total / stats.count) : 0
      }));

      // 2. Fetch student's attendance history for AI prompt
      const { data: attendance } = await supabase
        .from("attendance_history")
        .select("status")
        .eq("student_uid", student.id);
      
      let rate = 100;
      if (attendance && attendance.length > 0) {
        const present = attendance.filter((a: any) => a.status === "present").length;
        rate = Math.round((present / attendance.length) * 100);
      }

      // 3. Call Gemini
      const tips = await generateStudentGrowthTips(student.name, subjectsGrades, rate);
      setFlaggedStudentTips(tips);
    } catch (err) {
      console.error("Error generating tips for flagged student:", err);
      toast.error("Failed to generate AI recommendations.");
    } finally {
      setLoadingFlaggedTips(false);
    }
  };


  const handleSaveAttendance = async () => {
    if (!selectedClassId || classStudents.length === 0) {
      toast.error("No class or students selected.");
      return;
    }
    setIsSavingAttendance(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      const upsertData = Object.entries(localAttendance).map(([studentUid, status]) => ({
        class_id: selectedClassId,
        student_uid: studentUid,
        date_str: todayStr,
        status: status
      }));

      if (upsertData.length > 0) {
        const { error } = await supabase
          .from("attendance_history")
          .upsert(upsertData, { onConflict: 'class_id,student_uid,date_str' });
        if (error) throw error;
        toast.success("Attendance saved successfully for today!");
      } else {
        toast.error("Please mark at least one student before saving.");
      }
    } catch (error: any) {
      console.error("Error saving attendance", error);
      toast.error(error.message || "Failed to save attendance.");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle || !newAssignmentClassId || !currentUser) {
      toast.error("Please fill in all fields.");
      return;
    }

    const selectedClass = classes.find(c => c.id === newAssignmentClassId);
    if (!selectedClass) return;

    setIsUploading(true);
    let fileUrl = "";
    let imageUrl = "";

    try {
      // Ensure profile exists in Supabase to satisfy foreign key constraint
      await supabase.from("profiles").upsert({
        id: currentUser.uid,
        name: userName || currentUser.displayName || "Unknown Teacher",
        email: currentUser.email || "",
        role: "teacher"
      });

      if (assignmentFile) {
        const sanitizedName = assignmentFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filePath = `${currentUser.uid}/${Date.now()}_${sanitizedName}`;
        const { data, error: uploadError } = await supabase.storage
          .from("assignments")
          .upload(filePath, assignmentFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("assignments")
          .getPublicUrl(filePath);
        fileUrl = publicUrl;
      }

      if (assignmentImage) {
        const sanitizedName = assignmentImage.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const imgPath = `images/${currentUser.uid}/${Date.now()}_${sanitizedName}`;
        const { data, error: uploadError } = await supabase.storage
          .from("assignments")
          .upload(imgPath, assignmentImage);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("assignments")
          .getPublicUrl(imgPath);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("assignments").insert({
        teacher_id: currentUser.uid,
        class_id: selectedClass.id,
        class_name: selectedClass.className,
        subject: selectedClass.subject,
        title: newAssignmentTitle,
        file_url: fileUrl,
        image_url: imageUrl,
        due_date: "Mar 01", 
        submitted: 0,
        total: 32
      });
      if (error) throw error;

      toast.success("Assignment created successfully!");
      setNewAssignmentTitle("");
      setNewAssignmentClassId("");
      setAssignmentFile(null);
      setAssignmentImage(null);
      setActiveTab("assignments");
    } catch (error: any) {
      console.error("Error creating assignment", error);
      if (error.message?.includes("Bucket not found") || JSON.stringify(error)?.includes("Bucket not found")) {
        toast.error("Supabase Storage bucket 'assignments' was not found. Please log in to your Supabase Console, navigate to Storage, and create a PUBLIC bucket named 'assignments'.");
      } else {
        toast.error(error.message || "Failed to create assignment");
      }
    } finally {
      setIsUploading(false);
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

  const handleGradeSubmission = async (submissionId: string) => {
    const gradeStr = gradeInputs[submissionId];
    if (!gradeStr) {
      toast.error("Please enter a grade.");
      return;
    }
    const grade = parseInt(gradeStr, 10);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      toast.error("Grade must be a number between 0 and 100.");
      return;
    }
    setGradingId(submissionId);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ grade, graded_at: new Date().toISOString() })
        .eq("id", submissionId);
      if (error) throw error;
      
      toast.success("Grade saved successfully!");
      setGradeInputs(prev => {
        const copy = { ...prev };
        delete copy[submissionId];
        return copy;
      });
    } catch (error: any) {
      console.error("Error grading submission", error);
      toast.error(error.message || "Failed to save grade.");
    } finally {
      setGradingId(null);
    }
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
            {/* Top Banner mapping to the UI theme */}
            <div className="bg-primary text-white rounded-2xl p-8 mb-8 relative overflow-hidden shadow-lg">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl font-bold mb-3">Welcome back, {userName || "Teacher"}</h1>
                <p className="text-white/80 leading-relaxed text-sm">
                  You have {classes.length} active classes in your domain. Check out your assignments and mark attendance.
                </p>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 min-w-[250px] opacity-20 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard icon={BookOpen} label="My Classes" value={classes.length.toString()} index={0} />
              <StatCard icon={ClipboardCheck} label="Pending Marks" value={pendingSubmissions.length.toString()} index={1} />
              <StatCard icon={AlertTriangle} label="Flagged Students" value={realFlaggedStudents.length.toString()} index={2} />
              <StatCard icon={UserCheck} label="Today's Attendance" value={globalAttendanceStat} index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="luxury-card-static p-6 lg:col-span-2 bg-card rounded-2xl shadow-sm border-0"
              >
                <h2 className="text-lg font-semibold mb-5">Flagged Students</h2>
                <div className="space-y-3">
                  {realFlaggedStudents.length === 0 && <p className="text-xs text-muted-foreground p-4 bg-secondary/30 rounded-xl">No students flagged based on current grades.</p>}
                  {realFlaggedStudents.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectFlaggedStudent(s)}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer ${
                        selectedFlaggedStudent?.id === s.id
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "bg-secondary/60 hover:bg-secondary"
                      }`}
                    >
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
                className="luxury-card-static p-6 bg-card rounded-2xl shadow-sm border-0"
              >
                <div className="flex items-start justify-between mb-5 gap-2">
                  <h2 className="text-base font-semibold flex-1 leading-tight">Current Assignments</h2>
                  <span className="text-sm text-primary font-medium cursor-pointer shrink-0" onClick={() => setActiveTab("assignments")}>See all</span>
                </div>
                {assignmentList.length === 0 && <p className="text-xs text-muted-foreground p-4 bg-secondary/30 rounded-xl">No assignments posted yet.</p>}
                <div className="space-y-4">
                  {assignmentList.slice(0, 3).map((a, index) => (
                     <div key={a.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" title={a.title}>{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Due: {a.dueDate}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-warning uppercase">Upcoming</p>
                      </div>
                    </div>
                  ))}
                </div>
            {/* AI Pedagogical Recommendations Card */}
            {selectedFlaggedStudent && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="luxury-card-static p-7 mt-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        AI Pedagogical Strategies: {selectedFlaggedStudent.name}
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles className="h-3 w-3" /> Teacher Assistant
                        </span>
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Custom intervention and support ideas generated by Gemini
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFlaggedStudent(null)}
                    className="self-end sm:self-auto"
                  >
                    Clear Selection
                  </Button>
                </div>

                {loadingFlaggedTips ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Analyzing student grades and attendance patterns for recommendations...
                    </p>
                  </div>
                ) : flaggedStudentTips ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {flaggedStudentTips.teacherTips.map((strategy, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-secondary/35 border border-border/40 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-2">
                            Strategy {String(idx + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm text-foreground leading-relaxed">{strategy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Failed to load recommendations. Try again.
                  </p>
                )}
              </motion.div>
            )}
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
            <div className="luxury-card-static p-7">
              <h2 className="text-lg font-semibold mb-6">Create New Class</h2>
              <form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleCreateClass}>
                <div className="space-y-1.5 flex-1 w-full">
                  <label className="text-sm font-medium">Subject Name</label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-border bg-secondary/20"
                    placeholder="e.g. Advanced Physics"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 flex-1 w-full">
                  <label className="text-sm font-medium">Class Group/Room</label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-border bg-secondary/20"
                    placeholder="e.g. Grade 12-B"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto h-10 px-8">Create</Button>
              </form>
            </div>

            <h2 className="text-lg font-semibold mt-8 mb-4">My Created Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.length === 0 && <p className="text-muted-foreground text-sm col-span-full">You haven't created any classes yet.</p>}
              {classes.map(cls => (
                <div key={cls.id} className="luxury-card-static p-6 flex flex-col justify-between hover:border-primary/30 transition-colors">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{cls.subject}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{cls.className}</p>
                  </div>
                  <Button variant="outline" className="w-full text-xs" onClick={() => { setActiveTab("attendance"); setSelectedClassId(cls.id); }}>
                    Manage Attendance
                  </Button>
                </div>
              ))}
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
                {pendingSubmissions.length === 0 && <p className="text-muted-foreground text-sm p-4 bg-secondary/20 rounded-xl">No pending submissions to grade. All caught up! 🎉</p>}
                {pendingSubmissions.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-border/50 hover:border-foreground/20 transition-all gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                        {p.studentName.split(" ").map((n: string) => n[0]).join("").substring(0, 2) || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p.studentName}</p>
                        <p className="text-xs text-muted-foreground">{p.subject} • {p.assignmentTitle}</p>
                        {p.fileUrl && (
                          <button 
                            onClick={() => handleDownloadFile(p.fileUrl)}
                            className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1 font-semibold bg-transparent border-0 p-0 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Download Submitted File
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        className="w-20 h-9 px-2 rounded-lg border border-border bg-secondary/20 text-sm text-center font-medium"
                        value={gradeInputs[p.id] || ""}
                        onChange={(e) => setGradeInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleGradeSubmission(p.id)}
                        disabled={gradingId === p.id}
                      >
                        {gradingId === p.id ? "Saving..." : "Save"}
                      </Button>
                    </div>
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
            {viewingAssignmentId ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => setViewingAssignmentId(null)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Assignments
                  </Button>
                </div>
                
                <div className="luxury-card-static p-7">
                  <h2 className="text-lg font-semibold mb-6">
                    Submissions for "{assignmentList.find(a => a.id === viewingAssignmentId)?.title}"
                  </h2>
                  
                  <div className="space-y-4">
                    {allSubmissionsList.filter(s => s.assignmentId === viewingAssignmentId).length === 0 ? (
                      <p className="text-muted-foreground text-sm p-4 bg-secondary/20 rounded-xl">No student submissions found for this assignment yet.</p>
                    ) : (
                      allSubmissionsList.filter(s => s.assignmentId === viewingAssignmentId).map((s) => (
                        <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-border/50 hover:border-foreground/20 transition-all gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                              {s.studentName.split(" ").map((n: string) => n[0]).join("").substring(0, 2) || "S"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{s.studentName}</p>
                              <p className="text-xs text-muted-foreground">Submitted: {new Date(s.submittedAt).toLocaleDateString()}</p>
                              {s.fileUrl && (
                                <button 
                                  onClick={() => handleDownloadFile(s.fileUrl)}
                                  className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1 font-semibold bg-transparent border-0 p-0 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Download Submitted File
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:shrink-0">
                            {s.grade !== null ? (
                              <span className="text-sm font-bold px-3 py-1 rounded bg-green-500/10 text-green-600">
                                Graded: {s.grade}/100
                              </span>
                            ) : (
                              <>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0-100"
                                  className="w-20 h-9 px-2 rounded-lg border border-border bg-secondary/20 text-sm text-center font-medium"
                                  value={gradeInputs[s.id] || ""}
                                  onChange={(e) => setGradeInputs(prev => ({ ...prev, [s.id]: e.target.value }))}
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => handleGradeSubmission(s.id)}
                                  disabled={gradingId === s.id}
                                >
                                  {gradingId === s.id ? "Saving..." : "Grade"}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Active Assignments</h2>
                  <Button size="sm" onClick={() => setActiveTab("create_assignment")}>Create Assignment</Button>
                </div>
                {assignmentList.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground bg-secondary/20 rounded-xl">
                    No assignments posted yet.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {assignmentList.map((a) => (
                    <div key={a.id} className="luxury-card-static p-6 group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{a.title}</h3>
                          <p className="text-xs text-muted-foreground">{a.subject} • {a.className}</p>
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full group-hover:bg-secondary"
                        onClick={() => setViewingAssignmentId(a.id)}
                      >
                        View Submissions <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
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
                <label className="text-sm font-medium">Select Class</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-border bg-secondary/20 text-sm"
                  required
                  value={newAssignmentClassId}
                  onChange={(e) => setNewAssignmentClassId(e.target.value)}
                >
                  <option value="" disabled>Choose a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.subject} - {cls.className}</option>
                  ))}
                </select>
              </div>
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
                  <input type="file" accept=".pdf" className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Photo/Image</label>
                  <input type="file" accept="image/*" className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={(e) => setAssignmentImage(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isUploading}>{isUploading ? "Uploading..." : "Post Assignment"}</Button>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Daily Attendance</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  📅 Today: <span className="font-semibold text-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Select Class:</span>
                <select 
                  className="h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 text-sm w-full sm:w-auto"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="" disabled>Choose...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.subject} - {cls.className}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="luxury-card-static overflow-hidden">
              <div className="bg-secondary/30 p-4 border-b border-border grid grid-cols-12 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-7 sm:col-span-8 px-4">Student Name</div>
                <div className="col-span-5 sm:col-span-4 text-center px-4">Status</div>
              </div>
              <div className="divide-y divide-border/50">
                {!selectedClassId && (
                  <div className="p-12 text-center flex flex-col items-center">
                    <GraduationCap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Please select a class above to view the student register.</p>
                  </div>
                )}
                {selectedClassId && classStudents.length === 0 && (
                  <div className="p-12 text-center flex flex-col items-center">
                    <UserCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">No students have registered for this class yet. They will appear here in real-time as they enroll.</p>
                  </div>
                )}
                
                {classStudents.map((student) => {
                  const status = localAttendance[student.id] || undefined;
                  return (
                    <div key={student.id} className="grid grid-cols-12 items-center p-4 hover:bg-secondary/10 transition-colors">
                      <div className="col-span-7 sm:col-span-8 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase shrink-0">
                          {student.studentName?.split(" ").map((n: string) => n[0]).join("").substring(0, 2) || "S"}
                        </div>
                        <span className="text-sm font-medium truncate" title={student.studentName}>{student.studentName}</span>
                      </div>
                      <div className="col-span-5 sm:col-span-4 flex justify-center gap-2">
                        <button
                          onClick={() => handleMarkLocalAttendance(student.id, "present")}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${status === "present"
                            ? "bg-green-500/10 text-green-600 border-green-500/30 shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-green-500/5 hover:text-green-500"
                            }`}
                        >
                          PRESENT
                        </button>
                        <button
                          onClick={() => handleMarkLocalAttendance(student.id, "absent")}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${status === "absent"
                            ? "bg-red-500/10 text-red-600 border-red-500/30 shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-red-500/5 hover:text-red-500"
                            }`}
                        >
                          ABSENT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Attendance Button */}
              {selectedClassId && classStudents.length > 0 && (
                <div className="p-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {Object.keys(localAttendance).length} of {classStudents.length} students marked.
                    {Object.keys(localAttendance).length < classStudents.length && (
                      <span className="text-amber-600 font-medium ml-1">Unmarked students will not be saved.</span>
                    )}
                  </p>
                  <Button 
                    onClick={handleSaveAttendance} 
                    disabled={isSavingAttendance || Object.keys(localAttendance).length === 0}
                    className="w-full sm:w-auto px-8"
                  >
                    {isSavingAttendance ? "Saving..." : "💾 Save Attendance"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
