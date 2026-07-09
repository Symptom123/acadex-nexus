import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  TrendingUp,
  CalendarCheck,
  Bell,
  BarChart3,
  BookOpen,
  Link2,
  UserPlus,
  Check,
  X,
  ChevronDown,
  Clock,
  Users,
  Mail,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { generateStudentGrowthTips, GrowthTips } from "@/lib/gemini";
import { BrainCircuit, Sparkles } from "lucide-react";

const navItems = [
  { label: "Overview", id: "overview", icon: BarChart3 },
  { label: "Performance", id: "performance", icon: TrendingUp },
  { label: "Attendance", id: "attendance", icon: CalendarCheck },
  { label: "Link Kids", id: "link-kids", icon: Link2 },
  { label: "Messages", id: "messages", icon: MessageSquare },
  { label: "Notifications", id: "notifications", icon: Bell },
];

interface LinkedChild {
  id: string;
  child_uid: string;
  child_name: string;
  child_email: string;
  status: string;
}

export default function ParentDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<any>(null);

  // Child linking
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [selectedChildUid, setSelectedChildUid] = useState<string | null>(null);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);

  // Messaging state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadAdminReplies, setUnreadAdminReplies] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attendance filters
  const [attendanceFilter, setAttendanceFilter] = useState("all");

  // AI Growth recommendation state
  const [aiGrowthTips, setAiGrowthTips] = useState<GrowthTips | null>(null);
  const [loadingAiTips, setLoadingAiTips] = useState(false);

  // Child data
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch linked children
  const fetchLinkedChildren = useCallback(async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("parent_child_links")
      .select("id, child_uid, status, profiles!parent_child_links_child_uid_fkey(name, email)")
      .eq("parent_uid", currentUser.uid);

    if (error) {
      console.error("Error fetching linked children:", error);
      // Fallback: try without the foreign key join
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("parent_child_links")
        .select("id, child_uid, child_email, child_name, status")
        .eq("parent_uid", currentUser.uid);
      if (!fallbackError && fallbackData) {
        const children: LinkedChild[] = fallbackData.map((link: any) => ({
          id: link.id,
          child_uid: link.child_uid,
          child_name: link.child_name || "Unknown",
          child_email: link.child_email || "",
          status: link.status,
        }));
        setLinkedChildren(children);
        // Auto-select first accepted child
        const accepted = children.filter((c) => c.status === "accepted");
        if (accepted.length > 0 && !selectedChildUid) {
          setSelectedChildUid(accepted[0].child_uid);
        }
      }
      return;
    }

    if (data) {
      const children: LinkedChild[] = data.map((link: any) => ({
        id: link.id,
        child_uid: link.child_uid,
        child_name: link.profiles?.name || "Unknown",
        child_email: link.profiles?.email || "",
        status: link.status,
      }));
      setLinkedChildren(children);
      // Auto-select first accepted child
      const accepted = children.filter((c) => c.status === "accepted");
      if (accepted.length > 0 && !selectedChildUid) {
        setSelectedChildUid(accepted[0].child_uid);
      }
    }
  }, [currentUser, selectedChildUid]);

  // Fetch parent profile + linked children
  useEffect(() => {
    if (!currentUser) return;
    const fetchProfile = async () => {
      const { data: parentProfile, error } = await supabase
        .from("profiles")
        .select("name, role, email")
        .eq("id", currentUser.uid)
        .single();
      if (!error && parentProfile) setProfile(parentProfile);
    };
    fetchProfile();
    fetchLinkedChildren();
  }, [currentUser, fetchLinkedChildren]);

  // Fetch child-specific data when a child is selected
  useEffect(() => {
    if (!selectedChildUid) {
      setSubjects([]);
      setAttendance([]);
      setNotifications([]);
      setAiGrowthTips(null);
      return;
    }

    const fetchChildData = async () => {
      // Find current child name
      const currentChild = linkedChildren.find((c) => c.child_uid === selectedChildUid);
      const childName = currentChild ? currentChild.child_name : "Student";

      // Subject performance
      let fetchedSubjects: any[] = [];
      const { data: subData, error: subError } = await supabase
        .from("submissions")
        .select("subject, grade")
        .eq("student_uid", selectedChildUid);
      if (!subError && subData) {
        const grouped: any = {};
        subData.forEach((rec: any) => {
          if (!grouped[rec.subject]) grouped[rec.subject] = { total: 0, count: 0 };
          if (rec.grade !== null) {
            grouped[rec.subject].total += rec.grade;
            grouped[rec.subject].count += 1;
          }
        });
        fetchedSubjects = Object.entries(grouped).map(([name, stats]: any) => ({
          name,
          score: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
          teacher: "",
        }));
        setSubjects(fetchedSubjects);
      }

      // Attendance history
      let fetchedAttendance: any[] = [];
      const { data: attData, error: attError } = await supabase
        .from("attendance_history")
        .select("date_str, status, class_id, classes(subject, class_name)")
        .eq("student_uid", selectedChildUid)
        .order("date_str", { ascending: false });
      if (!attError && attData) {
        fetchedAttendance = attData;
        setAttendance(attData);
      } else {
        console.error("Error fetching attendance:", attError);
        setAttendance([]);
      }

      // Notifications
      const { data: notifData, error: notifError } = await supabase
        .from("announcements")
        .select("title, date, type")
        .eq("student_uid", selectedChildUid)
        .order("date", { ascending: false })
        .limit(10);
      if (!notifError && notifData) setNotifications(notifData);

      // Generate AI Growth Tips
      setLoadingAiTips(true);
      try {
        const rate = fetchedAttendance.length
          ? Math.round(
              (fetchedAttendance.filter((a) => a.status === "present").length / fetchedAttendance.length) * 100
            )
          : 100;
        
        const tips = await generateStudentGrowthTips(childName, fetchedSubjects, rate);
        setAiGrowthTips(tips);
      } catch (err) {
        console.error("Error generating growth tips:", err);
      } finally {
        setLoadingAiTips(false);
      }
    };

    fetchChildData();
  }, [selectedChildUid, linkedChildren]);

  // ==================== MESSAGING FUNCTIONS ====================
  const fetchMessages = useCallback(async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("parent_messages")
      .select("*")
      .eq("parent_uid", currentUser.uid)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
      // Count unread admin replies
      const unread = data.filter(
        (m: any) => m.sender === "admin" && !m.is_read
      ).length;
      setUnreadAdminReplies(unread);
    }
  }, [currentUser]);

  // Mark admin messages as read when viewing messages tab
  const markAdminRepliesAsRead = useCallback(async () => {
    if (!currentUser) return;
    await supabase
      .from("parent_messages")
      .update({ is_read: true })
      .eq("parent_uid", currentUser.uid)
      .eq("sender", "admin")
      .eq("is_read", false);
    setUnreadAdminReplies(0);
  }, [currentUser]);

  // Fetch messages on mount + subscribe to changes
  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("parent-messages-" + currentUser?.uid)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parent_messages" },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === "messages" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Mark as read when entering messages tab
  useEffect(() => {
    if (activeTab === "messages") {
      markAdminRepliesAsRead();
    }
  }, [activeTab, markAdminRepliesAsRead]);

  const handleSendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return;
    setSendingMessage(true);

    try {
      const { error } = await supabase.from("parent_messages").insert({
        parent_uid: currentUser.uid,
        parent_name: profile?.name || currentUser.displayName || "Parent",
        parent_email: currentUser.email || "",
        sender: "parent",
        sender_name: profile?.name || currentUser.displayName || "Parent",
        message: newMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      } else {
        setNewMessage("");
        toast.success("Message sent to administration!");
        await fetchMessages();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
    }

    setSendingMessage(false);
  };

  // Send link request
  const handleSendLinkRequest = async () => {
    if (!currentUser || !linkEmail.trim()) return;
    setIsSendingLink(true);

    try {
      // Find the student by email
      const { data: studentProfile, error: findError } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("email", linkEmail.trim().toLowerCase())
        .single();

      if (findError || !studentProfile) {
        toast.error("No student found with that email address.");
        setIsSendingLink(false);
        return;
      }

      if (studentProfile.role !== "student" && studentProfile.role !== "Student") {
        toast.error("That email does not belong to a student account.");
        setIsSendingLink(false);
        return;
      }

      // Check if link already exists
      const { data: existing } = await supabase
        .from("parent_child_links")
        .select("id, status")
        .eq("parent_uid", currentUser.uid)
        .eq("child_uid", studentProfile.id)
        .single();

      if (existing) {
        toast.error(
          existing.status === "pending"
            ? "A link request is already pending for this student."
            : "This student is already linked to your account."
        );
        setIsSendingLink(false);
        return;
      }

      // Create the link request
      const { error: insertError } = await supabase.from("parent_child_links").insert({
        parent_uid: currentUser.uid,
        child_uid: studentProfile.id,
        child_name: studentProfile.name,
        child_email: studentProfile.email,
        parent_name: profile?.name || currentUser.displayName || "Parent",
        parent_email: currentUser.email || "",
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating link request:", insertError);
        toast.error("Failed to send link request. Please try again.");
      } else {
        toast.success(`Link request sent to ${studentProfile.name}!`);
        setLinkEmail("");
        fetchLinkedChildren();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
    }

    setIsSendingLink(false);
  };

  // Remove a link
  const handleRemoveLink = async (linkId: string) => {
    const { error } = await supabase.from("parent_child_links").delete().eq("id", linkId);
    if (!error) {
      toast.success("Link removed.");
      fetchLinkedChildren();
      if (linkedChildren.length <= 1) setSelectedChildUid(null);
    } else {
      toast.error("Failed to remove link.");
    }
  };

  const acceptedChildren = linkedChildren.filter((c) => c.status === "accepted");
  const pendingChildren = linkedChildren.filter((c) => c.status === "pending");
  const selectedChild = acceptedChildren.find((c) => c.child_uid === selectedChildUid);

  const overallAverage = subjects.length
    ? Math.round(subjects.reduce((a, s) => a + s.score, 0) / subjects.length)
    : 0;

  const attendanceRate = attendance.length
    ? Math.round(
        (attendance.filter((a) => a.status === "present").length / attendance.length) * 100
      )
    : 0;

  // Child selector component
  const ChildSelector = () => {
    if (acceptedChildren.length === 0) {
      return (
        <div className="mb-8 glass-panel p-5 flex items-center gap-4 border-dashed border-2 border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">No children linked yet</p>
            <p className="text-sm font-medium">
              Go to{" "}
              <button
                onClick={() => setActiveTab("link-kids")}
                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                Link Kids
              </button>{" "}
              to send a link request to your child.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-8 glass-panel p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
          {selectedChild?.child_name?.charAt(0) ?? "?"}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Viewing data for</p>
          <div className="relative">
            <button
              onClick={() => setChildDropdownOpen(!childDropdownOpen)}
              className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
            >
              {selectedChild?.child_name ?? "Select a child"}
              {acceptedChildren.length > 1 && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${childDropdownOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>
            {childDropdownOpen && acceptedChildren.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[200px]"
              >
                {acceptedChildren.map((child) => (
                  <button
                    key={child.child_uid}
                    onClick={() => {
                      setSelectedChildUid(child.child_uid);
                      setChildDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-secondary/60 transition-colors ${
                      child.child_uid === selectedChildUid
                        ? "bg-primary/5 text-primary font-semibold"
                        : ""
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
                      {child.child_name.charAt(0)}
                    </div>
                    <div>
                      <p>{child.child_name}</p>
                      <p className="text-[10px] text-muted-foreground">{child.child_email}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        {pendingChildren.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {pendingChildren.length} pending
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout
      title={
        activeTab === "overview"
          ? "Dashboard"
          : activeTab === "link-kids"
          ? "Link Kids"
          : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
      }
      role="Parent"
      navItems={navItems.map((item) => ({
        ...item,
        onClick: () => setActiveTab(item.id),
        active: activeTab === item.id,
        badge: item.id === "messages" ? unreadAdminReplies : undefined,
      }))}
    >
      <AnimatePresence mode="wait">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ChildSelector />

            {selectedChildUid && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
                  <StatCard
                    icon={TrendingUp}
                    label="Overall Average"
                    value={`${overallAverage}%`}
                    change="+5%"
                    index={0}
                  />
                  <StatCard
                    icon={CalendarCheck}
                    label="Attendance"
                    value={`${attendanceRate}%`}
                    index={1}
                  />
                  <StatCard
                    icon={Bell}
                    label="Notifications"
                    value={notifications.length.toString()}
                    index={2}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-7"
                  >
                    <h2 className="text-lg font-semibold mb-5">Subject Performance</h2>
                    <div className="space-y-3">
                      {subjects.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No performance data available yet.
                        </p>
                      )}
                      {subjects.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-semibold">{s.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-foreground rounded-full"
                                style={{ width: `${s.score}%` }}
                              />
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
                    className="glass-panel p-7"
                  >
                    <h2 className="text-lg font-semibold mb-5">Recent Notifications</h2>
                    <div className="space-y-3">
                      {notifications.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No notifications yet.
                        </p>
                      )}
                      {notifications.slice(0, 3).map((n) => (
                        <div
                          key={n.title}
                          className="flex items-center justify-between p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                n.type === "alert" ? "bg-destructive/10" : "bg-secondary"
                              }`}
                            >
                              <Bell
                                className={`h-3.5 w-3.5 ${
                                  n.type === "alert"
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <p className="text-sm font-semibold">{n.title}</p>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {n.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* AI Growth Recommendations Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-panel p-7 mt-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          AI Study Growth Recommendations
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" /> Smart Coach
                          </span>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Personalized action items based on grades and class attendance
                        </p>
                      </div>
                    </div>
                  </div>

                  {loadingAiTips ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <p className="text-sm text-muted-foreground animate-pulse">
                        AI is analyzing academic records and attendance compliance...
                      </p>
                    </div>
                  ) : aiGrowthTips ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {aiGrowthTips.studentTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-secondary/35 border border-border/40 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-2">
                              Recommendation {String(idx + 1).padStart(2, "0")}
                            </span>
                            <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Select a child to load recommendations.
                    </p>
                  )}
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* ==================== PERFORMANCE TAB ==================== */}
        {activeTab === "performance" && (
          <motion.div
            key="performance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChildSelector />
            {selectedChildUid ? (
              <div className="glass-panel p-7">
                <h2 className="text-lg font-semibold mb-6">Detailed Performance Analysis</h2>
                <div className="space-y-6">
                  {subjects.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      No performance data available yet.
                    </p>
                  )}
                  {subjects.map((s) => (
                    <div key={s.name} className="p-5 rounded-2xl bg-secondary/20">
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-semibold text-lg">{s.name}</p>
                        <span className="text-2xl font-bold">{s.score}%</span>
                      </div>
                      <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Teacher feedback: Keep up the good work.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Link a child to view performance data.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== ATTENDANCE TAB ==================== */}
        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ChildSelector />
            {selectedChildUid ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="glass-panel p-6 text-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                      Attendance Rate
                    </p>
                    <p className="text-4xl font-extrabold text-primary mb-1">{attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Overall compliance</p>
                  </div>
                  <div className="glass-panel p-6 text-center">
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-2">
                      Days Present
                    </p>
                    <p className="text-4xl font-extrabold text-green-600 mb-1">
                      {attendance.filter((a) => a.status === "present").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Out of {attendance.length} total sessions</p>
                  </div>
                  <div className="glass-panel p-6 text-center">
                    <p className="text-xs text-red-500 font-semibold uppercase tracking-wider mb-2">
                      Days Absent
                    </p>
                    <p className="text-4xl font-extrabold text-red-500 mb-1">
                      {attendance.filter((a) => a.status === "absent").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </div>
                </div>

                {/* Daily Record Log */}
                <div className="glass-panel p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Daily Attendance Log</h2>
                      <p className="text-sm text-muted-foreground">
                        Track daily check-ins for each subject class
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex gap-2 rounded-xl bg-secondary/50 p-1 border border-border/30 self-start sm:self-auto">
                      {["all", "present", "absent"].map((filterOpt) => (
                        <button
                          key={filterOpt}
                          onClick={() => setAttendanceFilter(filterOpt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                            attendanceFilter === filterOpt
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {filterOpt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                    {attendance.filter((log) => {
                      if (attendanceFilter === "present") return log.status === "present";
                      if (attendanceFilter === "absent") return log.status === "absent";
                      return true;
                    }).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border/50">
                        No matching attendance records found.
                      </p>
                    ) : (
                      attendance
                        .filter((log) => {
                          if (attendanceFilter === "present") return log.status === "present";
                          if (attendanceFilter === "absent") return log.status === "absent";
                          return true;
                        })
                        .map((log, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/35 transition-colors gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
                                  log.status === "present"
                                    ? "bg-green-500/10 text-green-600"
                                    : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {log.status === "present" ? "✓" : "✗"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold capitalize">
                                  {log.classes?.subject || "General Class"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {log.classes?.class_name || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-semibold text-muted-foreground">
                                {new Date(log.date_str).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <p
                                className={`text-[10px] font-bold uppercase mt-0.5 tracking-wider ${
                                  log.status === "present"
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                {log.status}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Link a child to view attendance records.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== LINK KIDS TAB ==================== */}
        {activeTab === "link-kids" && (
          <motion.div
            key="link-kids"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Send link request card */}
            <div className="glass-panel p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Link a Child</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your child's email to send a link request
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="child@school.com"
                    value={linkEmail}
                    onChange={(e) => setLinkEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendLinkRequest()}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                  />
                </div>
                <button
                  onClick={handleSendLinkRequest}
                  disabled={isSendingLink || !linkEmail.trim()}
                  className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isSendingLink ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Send Request
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Your child will receive the request and must accept it from their student
                portal before you can view their data.
              </p>
            </div>

            {/* Linked children list */}
            <div className="glass-panel p-7">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Linked Children</h2>
                <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  {acceptedChildren.length} linked · {pendingChildren.length} pending
                </span>
              </div>

              {linkedChildren.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">
                    No children linked yet. Send a link request above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedChildren.map((child) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            child.status === "accepted"
                              ? "bg-green-500/10 text-green-600"
                              : child.status === "pending"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {child.child_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{child.child_name}</p>
                          <p className="text-xs text-muted-foreground">{child.child_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            child.status === "accepted"
                              ? "bg-green-500/10 text-green-600"
                              : child.status === "pending"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {child.status === "accepted" && (
                            <Check className="inline h-3 w-3 mr-1" />
                          )}
                          {child.status === "pending" && (
                            <Clock className="inline h-3 w-3 mr-1" />
                          )}
                          {child.status}
                        </span>
                        <button
                          onClick={() => handleRemoveLink(child.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove link"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
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
            className="space-y-6"
          >
            {/* Compose new message card */}
            <div className="glass-panel p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Message Administration</h2>
                  <p className="text-sm text-muted-foreground">
                    Send a message to the school administration
                  </p>
                </div>
              </div>

              <div className="relative mb-3">
                <textarea
                  placeholder="Type your message here… (e.g., request for meeting, query about fees, report an issue)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono font-semibold">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono font-semibold">Shift+Enter</kbd> for new line
                </p>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Message
                </button>
              </div>
            </div>

            {/* Conversation thread */}
            <div className="glass-panel p-7">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Conversation</h2>
                <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="h-14 w-14 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-muted-foreground text-sm mb-1">No messages yet</p>
                  <p className="text-muted-foreground/60 text-xs">
                    Send a message above to start a conversation with the administration.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {messages.map((msg: any) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === "parent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] ${
                          msg.sender === "parent"
                            ? "order-1"
                            : "order-1"
                        }`}
                      >
                        {/* Sender label */}
                        <p className={`text-[10px] font-semibold mb-1 ${
                          msg.sender === "parent"
                            ? "text-right text-primary/70"
                            : "text-left text-indigo-500/70"
                        }`}>
                          {msg.sender === "parent" ? "You" : "Administration"}
                        </p>
                        {/* Bubble */}
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.sender === "parent"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-secondary text-foreground rounded-tl-sm border border-border/30"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p
                            className={`text-[10px] mt-2 ${
                              msg.sender === "parent"
                                ? "text-primary-foreground/50"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" · "}
                            {new Date(msg.created_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ==================== NOTIFICATIONS TAB ==================== */}
        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <ChildSelector />
            {notifications.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>
                  {selectedChildUid
                    ? "No notifications for this child."
                    : "Link a child to view notifications."}
                </p>
              </div>
            )}
            {notifications.map((n) => (
              <div key={n.title} className="luxury-card p-6 flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                    n.type === "alert"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-primary/5 text-primary"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-[15px]">{n.title}</h3>
                    <span className="text-[11px] text-muted-foreground">{n.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This is a detailed notification message regarding{" "}
                    {n.title.toLowerCase()}.
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
