import AdminLayout from "@/components/AdminLayout";
import { Users, ChevronRight, Mail, Phone, MapPin, Lock, Unlock, X, Calendar, BookOpen, ClipboardCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  registration_number: string | null;
  avatar_url: string | null;
  created_at: string;
}

const AdminStudents = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Fetch student user IDs
  const { data: students, isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      if (!roles || roles.length === 0) return [];
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds).order("created_at", { ascending: false });
      return (profiles || []) as StudentProfile[];
    },
  });

  // Fetch enrollment counts per user
  const { data: enrollmentCounts } = useQuery({
    queryKey: ["admin-enrollment-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("user_id, course_id");
      const counts: Record<string, number> = {};
      (data || []).forEach((e) => {
        counts[e.user_id] = (counts[e.user_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Fetch lesson progress counts per user
  const { data: lessonCounts } = useQuery({
    queryKey: ["admin-lesson-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("lesson_progress").select("user_id, completed").eq("completed", true);
      const counts: Record<string, number> = {};
      (data || []).forEach((l) => {
        counts[l.user_id] = (counts[l.user_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ["admin-today-attendance"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("attendance").select("user_id, status").eq("date", today);
      const map: Record<string, string> = {};
      (data || []).forEach((a) => {
        map[a.user_id] = a.status;
      });
      return map;
    },
  });

  // Detail queries for selected student
  const { data: studentAttendance } = useQuery({
    queryKey: ["admin-student-attendance", selectedStudent?.user_id],
    enabled: !!selectedStudent,
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("*, courses(title)")
        .eq("user_id", selectedStudent!.user_id)
        .order("date", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const { data: studentEnrollments } = useQuery({
    queryKey: ["admin-student-enrollments", selectedStudent?.user_id],
    enabled: !!selectedStudent,
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("*, courses(title)")
        .eq("user_id", selectedStudent!.user_id);
      return data || [];
    },
  });

  const getAttendanceStatus = (userId: string) => {
    if (!todayAttendance) return "absent";
    return todayAttendance[userId] || "absent";
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">Students</h2>
            <p className="text-xs text-muted-foreground font-mono">
              {students?.length || 0} registered student{(students?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cyber-card rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : students && students.length > 0 ? (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4">Student</div>
              <div className="col-span-2 text-center">Today</div>
              <div className="col-span-3 text-center">Courses</div>
              <div className="col-span-3 text-center">Lessons</div>
            </div>

            {/* Student rows */}
            <div className="space-y-2">
              <AnimatePresence>
                {students.map((s, i) => {
                  const status = getAttendanceStatus(s.user_id);
                  const enrolled = enrollmentCounts?.[s.user_id] || 0;
                  const completed = lessonCounts?.[s.user_id] || 0;

                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedStudent(s)}
                      className="cyber-card rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]"
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Avatar + Name */}
                        <div className="col-span-4 flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs font-display shrink-0">
                            {s.full_name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{s.full_name || "Unnamed"}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{s.registration_number || "—"}</p>
                          </div>
                        </div>

                        {/* Attendance today */}
                        <div className="col-span-2 flex justify-center">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              status === "present"
                                ? "text-primary bg-primary/10 border border-primary/20"
                                : "text-muted-foreground bg-muted/50 border border-border/50"
                            }`}
                          >
                            {status === "present" ? "✓" : "—"}
                          </span>
                        </div>

                        {/* Course count */}
                        <div className="col-span-3 text-center">
                          <span className="text-sm font-bold text-foreground font-display">{enrolled}</span>
                          <p className="text-[9px] text-muted-foreground font-mono">enrolled</p>
                        </div>

                        {/* Lesson count */}
                        <div className="col-span-3 flex items-center justify-center gap-1">
                          <div className="text-center">
                            <span className="text-sm font-bold text-foreground font-display">{completed}</span>
                            <p className="text-[9px] text-muted-foreground font-mono">done</p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="cyber-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2 font-display">No Students Registered</h3>
            <p className="text-sm text-muted-foreground">Students will appear here once they register.</p>
          </div>
        )}
      </div>

      {/* Student Detail Sheet */}
      <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl bg-card border-border/50 overflow-y-auto">
          {selectedStudent && (
            <div className="space-y-6">
              {/* Profile header */}
              <SheetHeader className="text-left">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl font-display">
                    {selectedStudent.full_name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <SheetTitle className="text-lg font-display text-foreground">{selectedStudent.full_name}</SheetTitle>
                    <p className="text-xs text-primary font-mono">{selectedStudent.registration_number || "No ID"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Joined {new Date(selectedStudent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="cyber-card rounded-xl p-3 text-center">
                  <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold font-display text-foreground">{enrollmentCounts?.[selectedStudent.user_id] || 0}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">Courses</p>
                </div>
                <div className="cyber-card rounded-xl p-3 text-center">
                  <ClipboardCheck className="h-4 w-4 text-secondary mx-auto mb-1" />
                  <p className="text-lg font-bold font-display text-foreground">{lessonCounts?.[selectedStudent.user_id] || 0}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">Lessons</p>
                </div>
                <div className="cyber-card rounded-xl p-3 text-center">
                  <Calendar className="h-4 w-4 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold font-display text-foreground">{studentAttendance?.length || 0}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">Attendance</p>
                </div>
              </div>

              {/* Enrolled courses */}
              <div>
                <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Enrolled Courses</h4>
                {studentEnrollments && studentEnrollments.length > 0 ? (
                  <div className="space-y-2">
                    {studentEnrollments.map((e: any) => (
                      <div key={e.id} className="cyber-card rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{e.courses?.title || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Unlock className="h-4 w-4 text-primary/60" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cyber-card rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground font-mono">No courses enrolled</p>
                  </div>
                )}
              </div>

              {/* Attendance history */}
              <div>
                <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Attendance History</h4>
                {studentAttendance && studentAttendance.length > 0 ? (
                  <div className="space-y-1.5">
                    {studentAttendance.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="text-xs text-foreground">{(a.courses as any)?.title || "—"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{a.date}</p>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            a.status === "present"
                              ? "text-primary bg-primary/10"
                              : "text-destructive bg-destructive/10"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cyber-card rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground font-mono">No attendance records</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminStudents;
