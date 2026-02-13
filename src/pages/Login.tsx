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
      <div className="hidden lg:flex flex-1 bg-secondary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Welcome back.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Sign in to access your personalized dashboard and manage your school experience.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>

          <h1 className="text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-muted-foreground text-sm mb-8">Choose your role and enter credentials.</p>

          {/* Role selector */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  selectedRole === role.id
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <role.icon className="h-4 w-4" />
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                className="h-11"
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
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-medium rounded-xl">
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
