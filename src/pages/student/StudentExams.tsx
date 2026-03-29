import DashboardLayout from "@/components/DashboardLayout";
import { FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StudentExams = () => {
  const { user } = useAuth();

  const { data: exams, isLoading } = useQuery({
    queryKey: ["student-exams", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("exams")
        .select("*, courses(title)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground mb-6">Assignments</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted-foreground font-mono animate-pulse">Loading...</p>
          </div>
        ) : exams && exams.length > 0 ? (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="cyber-card rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{exam.title}</h3>
                    {exam.courses && (
                      <p className="text-xs text-primary font-mono mt-0.5">{(exam.courses as any).title}</p>
                    )}
                    {exam.description && (
                      <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                    {exam.exam_type}
                  </span>
                </div>
                {exam.due_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Due: {new Date(exam.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32">
            <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-mono text-center">No assignments yet.</p>
            <p className="text-sm text-muted-foreground/60 text-center mt-1">
              Assignments will appear here when your instructors create them.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentExams;
