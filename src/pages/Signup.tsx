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
                    role: selectedRole
                });
                if (error) throw error;
            } catch (err) {
                console.error("Could not create user profile in Supabase", err);
            }

            sessionStorage.setItem("activeRole", selectedRole);
            toast.success("Account created successfully!");
            const role = roles.find((r) => r.id === selectedRole);
            if (role) navigate(role.path);
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
                        role: selectedRole
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
        <div className="min-h-screen bg-transparent flex relative overflow-hidden">
            {/* Floating background moon-orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="moon-orb moon-orb-lg top-[-10%] right-[-5%] opacity-20" />
                <div className="moon-orb moon-orb-sm bottom-[10%] left-[-2%] opacity-20" />
            </div>

            {/* Left panel */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-indigo-950 to-slate-950 items-center justify-center p-16 relative">
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md relative z-10"
                >
                    <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-6">ACADEX</p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
                        Join our
                        <br />
                        community.
                    </h2>
                    <p className="text-white/70 text-lg leading-relaxed">
                        Create an account to start managing your academic journey with intelligent tools and real-time insights.
                    </p>
                </motion.div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                >
                    <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-medium">
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to home
                    </Link>

                    <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
                    <p className="text-muted-foreground text-sm mb-8">Select your role and fill in your details.</p>

                    {/* Role selector */}
                    <div className="grid grid-cols-4 gap-2.5 mb-8">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-[10px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${selectedRole === role.id
                                        ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                                        : "border-border bg-white/40 dark:bg-card/40 backdrop-blur-sm text-muted-foreground hover:border-primary/30 hover:shadow-md"
                                    }`}
                            >
                                <role.icon className="h-4 w-4" />
                                {role.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@school.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-sm font-medium">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-11 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full h-11 font-semibold rounded-xl text-[14px] shadow-md hover:shadow-lg transition-shadow mt-4">
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleGoogleSignup} 
                            disabled={isLoading || isGoogleLoading}
                            className="w-full h-11 font-semibold rounded-xl text-[14px] shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2 bg-white/5 dark:bg-black/20"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {isGoogleLoading ? "Connecting..." : "Google"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{" "}
                            <Link to="/login" className="text-foreground font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
