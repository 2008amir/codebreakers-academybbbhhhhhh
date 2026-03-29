import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const AdminMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [messageText, setMessageText] = useState("");

  const { data: students } = useQuery({
    queryKey: ["admin-students-for-msg"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      if (!roles || roles.length === 0) return [];
      const ids = roles.map((r) => r.user_id);
      const { data } = await supabase.from("profiles").select("user_id, full_name, registration_number").in("user_id", ids);
      return data || [];
    },
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("sender_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        receiver_id: selectedStudent,
        content: messageText,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setMessageText("");
      setSelectedStudent("");
      setShowForm(false);
      toast.success("Message sent!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getStudentName = (id: string) => {
    return students?.find((s) => s.user_id === id)?.full_name || "Student";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold font-display text-foreground leading-tight">Messages &<br />Notifications</h2>
          <Button
            onClick={() => setShowForm(true)}
            className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs shrink-0"
          >
            <Bell className="h-4 w-4 mr-1" /> SEND NOTIFICATION
          </Button>
        </div>

        {/* Send Notification Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Send Notification</DialogTitle>
              <DialogDescription className="text-muted-foreground">Send a message to a student.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-muted border border-primary/30 rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none"
                >
                  <option value="">Select a student</option>
                  {students?.map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.full_name} {s.registration_number ? `(${s.registration_number})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono block mb-2">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="bg-muted border-primary/30 focus:border-primary"
                />
              </div>
              <Button
                onClick={() => sendMessage.mutate()}
                disabled={!selectedStudent || !messageText.trim() || sendMessage.isPending}
                className="w-full glow-btn bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold"
              >
                {sendMessage.isPending ? "SENDING..." : "SEND NOTIFICATION"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Messages list */}
        {isLoading ? (
          <p className="text-muted-foreground font-mono animate-pulse text-center py-12">Loading...</p>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="cyber-card rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground font-mono">
                      To: <span className="text-foreground font-semibold">{getStudentName(msg.receiver_id)}</span>
                    </p>
                    <p className="text-sm text-foreground mt-1">{msg.content}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                    <p className={`text-[11px] font-mono mt-0.5 ${msg.read ? "text-primary" : "text-muted-foreground"}`}>
                      {msg.read ? "Read" : "Unread"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-card rounded-xl p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2 font-display">No Messages</h3>
            <p className="text-sm text-muted-foreground">Messages you send will appear here.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
