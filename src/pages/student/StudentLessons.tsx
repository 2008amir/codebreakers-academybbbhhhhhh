import DashboardLayout from "@/components/DashboardLayout";
import { Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StudentLessons = () => {
  const { user } = useAuth();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["student-lessons", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*, courses(title)")
        .order("order_index", { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground mb-6">Lessons</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted-foreground font-mono animate-pulse">Loading...</p>
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="cyber-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{lesson.title}</h3>
                    {lesson.courses && (
                      <p className="text-xs text-primary font-mono">{(lesson.courses as any).title}</p>
                    )}
                    {lesson.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32">
            <Play className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-mono text-center">No lessons available yet.</p>
            <p className="text-sm text-muted-foreground/60 text-center mt-1">
              Lessons will appear here once your instructors add them.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentLessons;
