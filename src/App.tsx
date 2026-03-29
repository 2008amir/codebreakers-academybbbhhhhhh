import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Courses from "./pages/Courses";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminExams from "./pages/admin/AdminExams";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminPosts from "./pages/admin/AdminPosts";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentLessons from "./pages/student/StudentLessons";
import StudentExams from "./pages/student/StudentExams";
import StudentSandbox from "./pages/student/StudentSandbox";
import StudentGrades from "./pages/student/StudentGrades";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentMessages from "./pages/student/StudentMessages";
import StudentFeed from "./pages/student/StudentFeed";
import StudentProfile from "./pages/student/StudentProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/lessons" element={<ProtectedRoute requiredRole="admin"><AdminLessons /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute requiredRole="admin"><AdminExams /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute requiredRole="admin"><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/posts" element={<ProtectedRoute requiredRole="admin"><AdminPosts /></ProtectedRoute>} />
            
            {/* Student routes */}
            <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute requiredRole="student"><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/lessons" element={<ProtectedRoute requiredRole="student"><StudentLessons /></ProtectedRoute>} />
            <Route path="/student/exams" element={<ProtectedRoute requiredRole="student"><StudentExams /></ProtectedRoute>} />
            <Route path="/student/sandbox" element={<ProtectedRoute requiredRole="student"><StudentSandbox /></ProtectedRoute>} />
            <Route path="/student/grades" element={<ProtectedRoute requiredRole="student"><StudentGrades /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute requiredRole="student"><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/leaderboard" element={<ProtectedRoute requiredRole="student"><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/messages" element={<ProtectedRoute requiredRole="student"><StudentMessages /></ProtectedRoute>} />
            <Route path="/student/feed" element={<ProtectedRoute requiredRole="student"><StudentFeed /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
