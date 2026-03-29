import AdminLayout from "@/components/AdminLayout";
import { Newspaper } from "lucide-react";

const AdminPosts = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground">Posts</h2>
      <div className="cyber-card rounded-xl p-12 text-center">
        <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2 font-display">No Posts Yet</h3>
        <p className="text-sm text-muted-foreground">Announcements and posts will appear here.</p>
      </div>
    </div>
  </AdminLayout>
);

export default AdminPosts;
