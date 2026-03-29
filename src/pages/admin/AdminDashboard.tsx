import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, BookOpen, FileText, MessageSquare, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Admin";

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [students, courses, lessons, exams, submissions] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }),
        supabase.from("exams").select("*", { count: "exact", head: true }),
        supabase.from("exam_submissions").select("*", { count: "exact", head: true }).eq("graded", false),
      ]);
      return {
        students: students.count || 0,
        courses: courses.count || 0,
        lessons: lessons.count || 0,
        exams: exams.count || 0,
        pendingSubmissions: submissions.count || 0,
      };
    },
  });

  const { data: recentMessages } = useQuery({
    queryKey: ["admin-recent-messages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const cards = [
    { label: "Students", value: stats?.students ?? 0, icon: Users, color: "text-primary", to: "/admin/students" },
    { label: "Courses", value: stats?.courses ?? 0, icon: BookOpen, color: "text-cyan-400", to: "/admin/courses" },
    { label: "Lessons", value: stats?.lessons ?? 0, icon: Upload, color: "text-purple-400", to: "/admin/lessons" },
    { label: "Assignments", value: stats?.exams ?? 0, icon: FileText, color: "text-pink-400", to: "/admin/exams" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground mb-0.5">
            Welcome, {firstName}
          </h2>
          <p className="text-muted-foreground text-xs font-mono">Admin Dashboard Overview</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={card.to} className="cyber-card rounded-xl p-4 block">
                <card.icon className={`h-5 w-5 ${card.color} mb-1.5`} />
                <p className={`text-2xl font-bold font-display ${card.color}`}>{card.value}</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{card.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pending grades */}
        {(stats?.pendingSubmissions ?? 0) > 0 && (
          <div className="cyber-card rounded-xl p-4">
            <p className="text-sm font-mono text-foreground">
              <span className="text-primary font-bold">{stats?.pendingSubmissions}</span> submission(s) pending grading
            </p>
          </div>
        )}

        {/* Recent activity */}
        <div>
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
          {recentMessages && recentMessages.length > 0 ? (
            <div className="space-y-2">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="cyber-card rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-mono">
                    Message • {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-foreground mt-0.5 line-clamp-1">{msg.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="cyber-card rounded-xl p-6 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-mono">No recent activity</p>
            </div>
          )}
        </div>

        {/* Quick actions hint */}
        <div className="cyber-card rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            Use the tabs below to manage your platform content.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
