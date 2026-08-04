"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  MessageSquare,
  Download,
  Send,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Terminal,
  Search,
  Bell,
  Sparkles,
} from "lucide-react";

export default function PortalPage() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Configure Next.js 15 App Router & Server Actions", done: true, tag: "Architecture", date: "Jul 28" },
    { id: 2, text: "Integrate Stripe Webhooks & Subscription Sync", done: true, tag: "Payments", date: "Jul 29" },
    { id: 3, text: "Build Client Portal Real-Time Status Widgets", done: true, tag: "Frontend UI", date: "Jul 30" },
    { id: 4, text: "Perform Security Penetration Test & Audit", done: false, tag: "Security", date: "Aug 02" },
    { id: 5, text: "Deploy AWS Multi-Region Edge Worker Cache", done: false, tag: "DevOps", date: "Aug 05" },
  ]);

  const [messages, setMessages] = useState([
    { sender: "Devon Vance (Tech Lead)", text: "Hi Acme team! Sprint 4 build has passed all automated tests. Ready for your review.", time: "10:14 AM" },
    { sender: "Sarah Chen (Acme VP)", text: "Great news Devon! Reviewing the Stripe webhook integration right now.", time: "10:28 AM" },
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([...messages, { sender: "You (Client Admin)", text: inputMsg, time: "Just now" }]);
    setInputMsg("");
    setToastMsg("Message dispatched to lead engineering team!");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDownload = (filename: string) => {
    setToastMsg(`Preparing download for ${filename}...`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Portal Top Bar */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-extrabold text-cyan-400 text-lg">
              AC
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Acme Global Enterprise</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold">
                ACTIVE SPRINT 4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Project ID: <span className="font-mono text-slate-300">NX-ACME-8842</span> • Managed by NexusClients Lead Squad</p>
          </div>
        </div>

        {/* Health Meters */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
            <div className="text-slate-400">SLA Health Score</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 99.8% Perfect
            </div>
          </div>
          <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
            <div className="text-slate-400">Next Release</div>
            <div className="text-cyan-400 font-bold text-sm mt-0.5 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Aug 04 (3 Days)
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Tasks & Milestones + Telemetry */}
        <div className="lg:col-span-2 space-y-8">
          {/* Milestone Task Checklist Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                  Sprint Deliverables & Task Checklist
                </h2>
                <p className="text-xs text-slate-400 mt-1">Click tasks to toggle client sign-off status</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
                {completedCount} / {tasks.length} Signed Off
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 mb-6 border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Task Item List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    task.done
                      ? "bg-slate-900/40 border-slate-800 text-slate-400"
                      : "bg-slate-900/80 border-slate-700/80 text-white hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
                    />
                    <span className={`text-sm ${task.done ? "line-through text-slate-400" : "font-medium"}`}>
                      {task.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {task.tag}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{task.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure & Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>CI/CD Deployment Status</span>
                <Terminal className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white mb-1">Build #8492 Success</div>
              <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deployed to Vercel Production
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                Commit: <span className="text-slate-300">feat(stripe): add webhook signature validation</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Production API Performance</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white mb-1">38ms Avg Response</div>
              <div className="text-xs text-cyan-400 font-mono flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Cloudflare Edge Workers Active
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                Uptime SLA: <span className="text-slate-300">100.00% (Last 30 Days)</span>
              </div>
            </div>
          </div>

          {/* Deliverables Download Vault */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Artifact Vault & Deliverable Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Acme_Architecture_Blueprint_v2.pdf", size: "4.8 MB", date: "Jul 28" },
                { title: "Security_PenTest_Audit_Summary.pdf", size: "1.9 MB", date: "Jul 25" },
                { title: "Database_Schema_Export.sql", size: "840 KB", date: "Jul 22" },
                { title: "Brand_UI_Tokens_Theme.json", size: "320 KB", date: "Jul 15" },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono font-medium text-white truncate max-w-[170px]">{doc.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{doc.size} • {doc.date}</div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc.title)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Direct Client-Engineering Messaging */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between h-[640px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h2 className="font-bold text-white">Lead Squad Chat</h2>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Lead Architect Online" />
            </div>

            {/* Chat Thread */}
            <div className="space-y-4 my-4 overflow-y-auto max-h-[440px] pr-2 text-xs">
              {messages.map((msg, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-cyan-300">{msg.sender}</span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask lead engineer a question..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 flex-1 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white p-2.5 rounded-xl hover:opacity-95 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
