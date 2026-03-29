import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { LayoutDashboard, BookOpen, FileText, Terminal, ClipboardCheck, MessageSquare, Award, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";

const navItems = [
  { to: "/student", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/student/courses", label: "My Courses", icon: <BookOpen className="h-4 w-4" /> },
  { to: "/student/exams", label: "Exams", icon: <FileText className="h-4 w-4" /> },
  { to: "/student/sandbox", label: "Code Sandbox", icon: <Terminal className="h-4 w-4" /> },
  { to: "/student/grades", label: "Grades", icon: <Award className="h-4 w-4" /> },
  { to: "/student/attendance", label: "Attendance", icon: <ClipboardCheck className="h-4 w-4" /> },
  { to: "/student/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
];

const defaultCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #0a0f1a;
      color: #00ffaa;
    }
    h1 { font-size: 2rem; }
  </style>
</head>
<body>
  <h1>Hello, CodeBreakers! 🚀</h1>
  <script>
    console.log("Welcome to the sandbox!");
  </script>
</body>
</html>`;

const languages = [
  { value: "html", label: "HTML/CSS/JS" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
];

const StudentSandbox = () => {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("html");
  const [output, setOutput] = useState("");

  const runCode = () => {
    if (language === "html") {
      setOutput(code);
    } else if (language === "javascript") {
      try {
        const logs: string[] = [];
        const mockConsole = { log: (...args: any[]) => logs.push(args.join(" ")) };
        const fn = new Function("console", code);
        fn(mockConsole);
        setOutput(`<pre style="color:#00ffaa;font-family:monospace;padding:1rem;background:#0a0f1a;margin:0;min-height:100%">${logs.join("\n")}</pre>`);
      } catch (err: any) {
        setOutput(`<pre style="color:#ff5555;font-family:monospace;padding:1rem;background:#0a0f1a;margin:0">${err.message}</pre>`);
      }
    } else {
      setOutput(`<pre style="color:#ffaa00;font-family:monospace;padding:1rem;background:#0a0f1a;margin:0">Python execution requires a backend runtime. Enable Lovable Cloud to run Python code.</pre>`);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Student Portal">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-foreground">Code Sandbox</h2>
            <p className="text-sm text-muted-foreground">Write, run, and experiment with code</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <Button onClick={runCode} className="glow-btn bg-primary text-primary-foreground hover:bg-primary/90">
              <Play className="h-4 w-4 mr-2" /> Run
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: "calc(100vh - 220px)" }}>
          <div className="cyber-card rounded-xl overflow-hidden border border-border/50">
            <div className="bg-muted px-4 py-2 border-b border-border/50 text-xs font-mono text-muted-foreground">
              editor.{language === "html" ? "html" : language === "javascript" ? "js" : "py"}
            </div>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "JetBrains Mono, monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="cyber-card rounded-xl overflow-hidden border border-border/50">
            <div className="bg-muted px-4 py-2 border-b border-border/50 text-xs font-mono text-muted-foreground">
              output
            </div>
            {output ? (
              <iframe
                srcDoc={output}
                className="w-full h-full bg-background"
                sandbox="allow-scripts"
                title="output"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Click "Run" to see output
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSandbox;
