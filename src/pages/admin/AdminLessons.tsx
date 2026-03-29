import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const AdminLessons = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    video_url: "",
    content: "",
  });

  const { data: courses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, title").order("title");
      return data || [];
    },
  });

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*, courses(title)")
        .order("course_id")
        .order("order_index", { ascending: true });
      return data || [];
    },
  });

  const createLesson = useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase
        .from("lessons")
        .select("order_index")
        .eq("course_id", form.course_id)
        .order("order_index", { ascending: false })
        .limit(1);
      const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 1;

      const { error } = await supabase.from("lessons").insert({
        course_id: form.course_id,
        title: form.title,
        description: form.description || null,
        video_url: form.video_url || null,
        content: form.content || null,
        order_index: nextIndex,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      setForm({ course_id: "", title: "", description: "", video_url: "", content: "" });
      setShowForm(false);
      toast.success("Lesson added!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Lesson deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Group lessons by course
  const grouped = (lessons || []).reduce<Record<string, { courseName: string; items: typeof lessons }>>((acc, l) => {
    const courseTitle = l.courses ? (l.courses as any).title : "Unknown";
    if (!acc[l.course_id]) acc[l.course_id] = { courseName: courseTitle, items: [] };
    acc[l.course_id].items!.push(l);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold font-display text-foreground">Manage Lessons</h2>
          <Button
            onClick={() => setShowForm(true)}
            className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> ADD LESSON
          </Button>
        </div>

        {/* Add Lesson Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-card border-border/50 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Add Lesson</DialogTitle>
              <DialogDescription className="text-muted-foreground">Add a new lesson to a course.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Course</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="w-full bg-muted border border-primary/30 rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none"
                >
                  <option value="">Select a course</option>
                  {courses?.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Lesson Title</label>
                <Input
                  placeholder="e.g. Introduction to HTML"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Video URL (optional)</label>
                <Input
                  placeholder="https://youtube.com/..."
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  className="bg-muted border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Content</label>
                <Textarea
                  placeholder="Write your lesson content here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="bg-muted border-primary/30 focus:border-primary min-h-[120px]"
                />
              </div>
              <Button
                onClick={() => createLesson.mutate()}
                disabled={!form.title || !form.course_id || createLesson.isPending}
                className="w-full glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold"
              >
                {createLesson.isPending ? "ADDING..." : "ADD LESSON"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lessons grouped by course */}
        {isLoading ? (
          <p className="text-muted-foreground font-mono animate-pulse text-center py-12">Loading...</p>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([courseId, group]) => (
              <div key={courseId} className="space-y-3">
                <p className="text-sm font-mono text-primary">{group.courseName}</p>
                {group.items!.map((lesson) => (
                  <div key={lesson.id} className="cyber-card rounded-xl p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs font-mono shrink-0 mt-0.5">
                      {lesson.order_index}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm font-mono">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{lesson.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {lesson.video_url && (
                          <span className="text-[11px] font-mono text-primary">⏱ 1 min watch required</span>
                        )}
                        {lesson.content && (
                          <span className="text-[11px] font-mono text-primary">📄 Attached file</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Delete this lesson?")) deleteLesson.mutate(lesson.id);
                      }}
                      className="text-destructive/70 hover:text-destructive transition-colors shrink-0 mt-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-card rounded-xl p-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2 font-display">No Lessons Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add lessons to your courses for students to learn from.</p>
            <Button onClick={() => setShowForm(true)} className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs">
              <Plus className="h-4 w-4 mr-1" /> ADD LESSON
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLessons;
