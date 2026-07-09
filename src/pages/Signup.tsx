import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, User, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import heroVideo from "@/assets/acadexVid.mp4";
import logoImg from "@/assets/logo.png";

const roles = [
  { id: "admin", label: "Admin", icon: ShieldCheck, path: "/admin" },
  { id: "teacher", label: "Teacher", icon: User, path: "/teacher" },
  { id: "student", label: "Student", icon: GraduationCap, path: "/student" },
  { id: "parent", label: "Parent", icon: Users, path: "/parent" },
] as const;

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isGoogleLoading) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        const { error } = await supabase.from("profiles").insert({
          id: user.uid,
          name,
          email,
          phone,
          role: selectedRole,
          status: selectedRole === "admin" ? "pending" : "approved"
        });
        if (error) throw error;
      } catch (err) {
        console.error("Could not create user profile in Supabase", err);
      }

      sessionStorage.setItem("activeRole", selectedRole);
      if (selectedRole === "admin") {
        sessionStorage.setItem("adminStatus", "pending");
        toast.success("Admin account created! Awaiting approval from an existing administrator.");
        navigate("/admin"); // will show the waiting screen
      } else {
        toast.success("Account created successfully!");
        const role = roles.find((r) => r.id === selectedRole);
        if (role) navigate(role.path);
      }
    } catch (error: any) {
      console.error("Signup error", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (isLoading || isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let finalRole = selectedRole;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.uid)
          .single();

        if (data && !error && data.role) {
          if (data.role === "student" && selectedRole === "parent") {
            finalRole = "parent";
          } else {
            finalRole = data.role;
          }
        } else {
          const { error: insertErr } = await supabase.from("profiles").insert({
            id: user.uid,
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            role: selectedRole,
            status: selectedRole === "admin" ? "pending" : "approved"
          });
          if (insertErr) throw insertErr;
        }
      } catch (err) {
        console.error("Could not fetch or set user role in Supabase", err);
      }

      sessionStorage.setItem("activeRole", finalRole);
      toast.success("Signed up with Google successfully!");
      const roleObj = roles.find((r) => r.id === finalRole);
      if (roleObj) navigate(roleObj.path);
      else navigate("/");
    } catch (error: any) {
      console.error("Google signup error", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return; // Ignore these errors
      }
      toast.error(error.message || "Failed to sign up with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">

      {/* ── LEFT PANEL: Video (45% width, full height) ─────────────────────── */}
      <div className="hidden lg:block relative w-[45%] h-full flex-shrink-0 overflow-hidden">
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay — dark on left edge, fades to transparent */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        {/* Anchored top-left branding */}
        <div className="absolute top-10 left-10 z-10">
          <img src={logoImg} alt="Acadex" className="h-9 w-auto" />
        </div>

        {/* Bottom-left headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute bottom-12 left-10 z-10 max-w-sm"
        >
          <h2 className="font-heading text-4xl font-bold tracking-tight text-white leading-tight mb-3">
            Join our<br />community.
          </h2>
          <p className="text-white/65 text-base leading-relaxed">
            Create an account and start your academic journey today.
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: Form (45% width, scrollable) ──────────────────────── */}
      <div className="flex-1 flex flex-col px-6 py-6 lg:px-12 lg:py-10 bg-[#0a0a0f] overflow-y-auto">
        
        {/* Back link - normal flow at the top */}
        <div className="w-full flex justify-start mb-auto">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to home
          </Link>
        </div>

        {/* Centered Form */}
        <div className="flex-1 flex items-center justify-center w-full py-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[360px]"
          >

          <h1 className="font-heading text-3xl font-bold tracking-tight text-white mb-1">Create Account</h1>
          <p className="text-white/50 text-sm mb-7">
            Select your role and fill in your details.
          </p>

          {/* Role selector — horizontal pills */}
          <div className="flex flex-wrap gap-2 mb-7">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer
                  ${
                    selectedRole === role.id
                      ? "bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <role.icon className="h-3.5 w-3.5" />
                {role.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@school.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 font-semibold rounded-xl text-[15px] bg-primary text-white hover:bg-primary/90 shadow-[0_0_24px_rgba(139,92,246,0.35)] cursor-pointer transition-all duration-200 mt-1"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0f] px-3 text-white/40">Or continue with</span>
              </div>
            </div>

            {/* Google button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 font-semibold rounded-xl text-[15px] bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            {/* Footer link */}
            <p className="text-center text-sm text-white/40 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline cursor-pointer">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
