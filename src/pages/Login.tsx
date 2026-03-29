import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Fetch role to redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (roles?.some((r) => r.role === "admin")) {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-display neon-text">CodeBreakers</span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue learning</p>
        </div>

        <div className="cyber-card rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-muted border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-muted border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full glow-btn bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
