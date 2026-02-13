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

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = roles.find((r) => r.id === selectedRole);
    if (role) navigate(role.path);
  };

  return (
    <div className="min-h-screen bg-background flex">
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
            Welcome
            <br />
            back.
          </h2>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Sign in to access your personalized dashboard and manage your school experience.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to home
          </Link>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Sign in</h1>
          <p className="text-muted-foreground text-sm mb-10">Choose your role and enter credentials.</p>

          {/* Role selector */}
          <div className="grid grid-cols-4 gap-2.5 mb-10">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-xs font-medium transition-all duration-200 ${
                  selectedRole === role.id
                    ? "border-foreground bg-foreground text-primary-foreground shadow-lg"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:shadow-md"
                }`}
              >
                <role.icon className="h-5 w-5" />
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-background"
              />
            </div>
            <Button type="submit" className="w-full h-12 font-semibold rounded-xl text-[15px] shadow-md hover:shadow-lg transition-shadow">
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
