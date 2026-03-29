import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { FileText, Plus, Trash2, ChevronDown } from "lucide-react";
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

const AdminExams = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", course_id: "", max_score: "100", due_date: "" });

  const { data: courses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, title").order("title");
      return data || [];
    },
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["admin-exams"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("*, courses(title)").order("created_at", { ascending: false });
      if (!data) return [];
      // Get submission counts for each exam
      const examIds = data.map((e) => e.id);
      const { data: subs } = await supabase
        .from("exam_submissions")
        .select("exam_id, graded")
        .in("exam_id", examIds);
      return data.map((exam) => {
        const examSubs = (subs || []).filter((s) => s.exam_id === exam.id);
        return {
          ...exam,
          submissionCount: examSubs.length,
          gradedCount: examSubs.filter((s) => s.graded).length,
        };
      });
    },
  });

  const createExam = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("exams").insert({
        title: form.title,
        description: form.description || null,
        course_id: form.course_id,
        exam_type: "assignment",
        max_score: parseInt(form.max_score) || 100,
        due_date: form.due_date || null,
        is_published: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setForm({ title: "", description: "", course_id: "", max_score: "100", due_date: "" });
      setShowForm(false);
      toast.success("Assignment created!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      toast.success("Deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold font-display text-foreground leading-tight">Assignments<br />& Exams</h2>
          <Button
            onClick={() => setShowForm(true)}
            className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> CREATE ASSIGNMENT
          </Button>
        </div>

        {/* Create Assignment Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-card border-border/50 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Create Assignment</DialogTitle>
              <DialogDescription className="text-muted-foreground">Add a new exam or assignment to a course.</DialogDescription>
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
                <label className="text-xs text-muted-foreground font-mono block mb-2">Title</label>
                <Input
                  placeholder="e.g. Midterm Exam"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-muted border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Description</label>
                <Textarea
                  placeholder="Assignment instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-muted border-primary/30 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-mono block mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="bg-muted border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-mono block mb-2">Max Score</label>
                  <Input
                    type="number"
                    value={form.max_score}
                    onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                    className="bg-muted border-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <Button
                onClick={() => createExam.mutate()}
                disabled={!form.title || !form.course_id || createExam.isPending}
                className="w-full glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold"
              >
                {createExam.isPending ? "CREATING..." : "CREATE ASSIGNMENT"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <p className="text-muted-foreground font-mono animate-pulse text-center py-12">Loading...</p>
        ) : exams && exams.length > 0 ? (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="cyber-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground font-mono text-sm">{exam.title}</h3>
                      {exam.courses && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {(exam.courses as any).title}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-muted-foreground">
                      {exam.description && <span>{exam.description}</span>}
                      {exam.due_date && (
                        <span>• Due: {new Date(exam.due_date).toLocaleDateString()}</span>
                      )}
                      <span>• Max: {exam.max_score} pts</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exam.submissionCount} submission(s) • {exam.gradedCount} graded
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    <button
                      onClick={() => { if (confirm("Delete?")) deleteExam.mutate(exam.id); }}
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
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2 font-display">No Assignments Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create assignments and exams for your courses.</p>
            <Button onClick={() => setShowForm(true)} className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs">
              <Plus className="h-4 w-4 mr-1" /> CREATE ASSIGNMENT
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminExams;
