import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, User, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        const role = roles.find((r) => r.id === selectedRole);
        if (role) navigate(role.path);
    };

    return (
        <div className="min-h-screen bg-transparent flex">
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 bg-foreground items-center justify-center p-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md"
                >
                    <p className="text-primary-foreground/60 text-sm font-medium tracking-[0.2em] uppercase mb-6">ACADEX</p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary-foreground leading-tight">
                        Join our
                        <br />
                        community.
                    </h2>
                    <p className="text-primary-foreground/70 text-lg leading-relaxed">
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
                    <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
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
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-[10px] font-medium transition-all duration-200 ${selectedRole === role.id
                                        ? "border-foreground bg-foreground text-primary-foreground shadow-lg"
                                        : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:shadow-md"
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
                        <Button type="submit" className="w-full h-11 font-semibold rounded-xl text-[14px] shadow-md hover:shadow-lg transition-shadow mt-4">
                            Create Account
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
