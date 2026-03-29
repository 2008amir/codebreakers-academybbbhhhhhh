import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Eye, EyeOff, Camera, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) { toast.error("Full name is required"); return; }
    if (!form.phone.trim()) { toast.error("Phone number is required"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setIsLoading(true);

    // Sign up
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setIsLoading(false);
      toast.error(error.message);
      return;
    }

    const userId = signUpData.user?.id;

    if (userId) {
      // Upload avatar if provided
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${userId}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (!uploadError) {
          const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = publicData.publicUrl;
        }
      }

      // Update profile with phone and avatar
      await supabase
        .from("profiles")
        .update({
          phone: form.phone,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        })
        .eq("user_id", userId);
    }

    setIsLoading(false);
    toast.success("Account created! You can now sign in.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-cyber-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-display neon-text">CodeBreakers</span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join the CodeBreakers Academy</p>
        </div>

        <div className="cyber-card rounded-xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Avatar upload */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-primary/40 hover:border-primary transition-colors group"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                    <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[8px] text-muted-foreground font-mono mt-0.5">Photo</span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Upload className="h-3 w-3 text-primary-foreground" />
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
                className="bg-muted border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="bg-muted border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                required
                className="bg-muted border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password *</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password *</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                className="bg-muted border-border"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full glow-btn bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
