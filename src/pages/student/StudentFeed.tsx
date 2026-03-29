import DashboardLayout from "@/components/DashboardLayout";
import { Newspaper } from "lucide-react";

const StudentFeed = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground mb-6">Announcements</h1>

        <div className="flex flex-col items-center justify-center py-32">
          <Newspaper className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-mono text-center">No announcements yet.</p>
          <p className="text-sm text-muted-foreground/60 text-center mt-1">
            Announcements from your instructors will appear here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentFeed;
