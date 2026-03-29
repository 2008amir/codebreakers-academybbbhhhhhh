import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { BookOpen, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const AdminCourses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "" });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createCourse = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").insert({
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        created_by: user!.id,
        is_published: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setForm({ title: "", description: "", category: "" });
      setShowForm(false);
      toast.success("Course created!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("courses").update({ is_published: !is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course updated!");
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Course deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold font-display text-foreground">Manage Courses</h2>
          <Button
            onClick={() => setShowForm(true)}
            className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> ADD COURSE
          </Button>
        </div>

        {/* Add Course Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-card border-border/50 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Add Course</DialogTitle>
              <DialogDescription className="text-muted-foreground">Create a new course for your students.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Course Title</label>
                <Input
                  placeholder="e.g. Frontend Development"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-muted border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Category</label>
                <Input
                  placeholder="e.g. Easy, Intermediate, Advanced"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-muted border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Description</label>
                <Textarea
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-muted border-primary/30 focus:border-primary"
                />
              </div>
              <Button
                onClick={() => createCourse.mutate()}
                disabled={!form.title || createCourse.isPending}
                className="w-full glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold"
              >
                {createCourse.isPending ? "CREATING..." : "CREATE COURSE"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <p className="text-muted-foreground font-mono animate-pulse text-center py-12">Loading...</p>
        ) : courses && courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="cyber-card rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground font-mono text-sm">{course.title}</h3>
                    {course.category && (
                      <p className="text-xs text-muted-foreground mt-0.5">{course.category}</p>
                    )}
                    <p className={`text-xs font-mono mt-0.5 ${course.is_published ? "text-primary" : "text-muted-foreground"}`}>
                      {course.is_published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <button
                      onClick={() => togglePublish.mutate({ id: course.id, is_published: course.is_published })}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={course.is_published ? "Unpublish" : "Publish"}
                    >
                      {course.is_published ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this course?")) deleteCourse.mutate(course.id); }}
                      className="text-destructive/70 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-card rounded-xl p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2 font-display">No Courses Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first course to get started.</p>
            <Button onClick={() => setShowForm(true)} className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs">
              <Plus className="h-4 w-4 mr-1" /> ADD COURSE
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCourses;
