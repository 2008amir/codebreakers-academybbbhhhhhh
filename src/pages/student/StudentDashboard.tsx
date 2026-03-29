import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const { profile, user } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "User";

  const { data: courses } = useQuery({
    queryKey: ["student-courses", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").eq("is_published", true);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground mb-1">
          Welcome, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Your learning journey starts here.</p>

        {courses && courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="cyber-card rounded-xl p-4">
                <h3 className="font-semibold text-foreground">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32">
            <BookOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-mono text-center">No courses available yet.</p>
            <p className="text-sm text-muted-foreground/60 text-center mt-1">
              Check back later — your instructors are preparing content.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
