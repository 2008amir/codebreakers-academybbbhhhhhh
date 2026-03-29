import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StudentCourses = () => {
  const { user } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["student-courses", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground mb-6">My Courses</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted-foreground font-mono animate-pulse">Loading...</p>
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="cyber-card rounded-xl p-4">
                {course.thumbnail_url && (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                )}
                <h3 className="font-semibold text-foreground">{course.title}</h3>
                {course.category && (
                  <span className="inline-block text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded mt-1">
                    {course.category}
                  </span>
                )}
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

export default StudentCourses;
