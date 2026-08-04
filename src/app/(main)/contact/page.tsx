"use client";

import { useState } from "react";
import {
  Calculator,
  Zap,
  CheckCircle2,
  Send,
  Sparkles,
  Shield,
  Clock,
  Layers,
} from "lucide-react";

export default function ContactPage() {
  // Quote Estimator State
  const [platform, setPlatform] = useState<"nextjs" | "mobile" | "hybrid">("nextjs");
  const [teamSize, setTeamSize] = useState<number>(2);
  const [features, setFeatures] = useState<{ [key: string]: boolean }>({
    portal: true,
    ai: false,
    security: true,
    cloud: false,
  });

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleFeature = (key: string) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Price Calculation Logic
  const platformBase = platform === "nextjs" ? 4500 : platform === "mobile" ? 6000 : 8500;
  const teamCost = (teamSize - 1) * 2500;
  const featureCost =
    (features.portal ? 1800 : 0) +
    (features.ai ? 2500 : 0) +
    (features.security ? 1200 : 0) +
    (features.cloud ? 2000 : 0);

  const estimatedTotal = platformBase + teamCost + featureCost;
  const estimatedWeeks = Math.max(2, Math.round(12 / teamSize));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;
    setIsSubmitted(true);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-4">
          <Calculator className="w-3.5 h-3.5" />
          <span>Interactive Quote Estimator</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Calculate Your Project Scope <span className="gradient-text">& Investment</span>
        </h1>
        <p className="text-slate-400 mt-4 text-base sm:text-lg">
          Customize your engineering stack, client portal requirements, and squad size for an instant estimate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Estimator Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Platform Architecture */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-3">
              Step 1: Core Platform Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "nextjs", name: "Next.js Web Portal", price: "$4,500 base" },
                { id: "mobile", name: "React Native App", price: "$6,000 base" },
                { id: "hybrid", name: "Full Web + Mobile", price: "$8,500 base" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPlatform(item.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    platform === item.id
                      ? "bg-cyan-500/10 border-cyan-500 text-white shadow-md shadow-cyan-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">{item.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Squad Size */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-mono text-cyan-400 uppercase">
                Step 2: Dedicated Squad Size
              </label>
              <span className="text-xs font-mono text-slate-300">
                {teamSize} Engineer{teamSize > 1 ? "s" : ""} + Lead
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>1 Dev (Solo)</span>
              <span>3 Devs (Standard)</span>
              <span>5 Devs (Full Squad)</span>
            </div>
          </div>

          {/* Step 3: Add-on Capabilities */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <label className="block text-xs font-mono text-cyan-400 uppercase mb-3">
              Step 3: Add-on Platform Modules
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "portal", label: "Client Portal & Real-Time Dashboard", price: "+$1,800" },
                { key: "ai", label: "OpenAI / RAG Vector DB Integration", price: "+$2,500" },
                { key: "security", label: "SOC2 Compliance & Penetration Test", price: "+$1,200" },
                { key: "cloud", label: "Multi-Region AWS Infrastructure Setup", price: "+$2,000" },
              ].map((mod) => (
                <div
                  key={mod.key}
                  onClick={() => toggleFeature(mod.key)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    features[mod.key]
                      ? "bg-slate-900/90 border-cyan-500/50 text-white"
                      : "bg-slate-900/40 border-slate-800 text-slate-400"
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium">{mod.label}</div>
                    <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{mod.price}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features[mod.key]}
                    onChange={() => {}}
                    className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-950"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Estimate & Consultation Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Estimated Summary Card */}
          <div className="glass-card rounded-3xl p-6 border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-2">
              <span>Instant Scope Summary</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="text-4xl font-extrabold text-white tracking-tight mb-1">
              ${estimatedTotal.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 mb-6">
              <Clock className="w-3.5 h-3.5" /> Est. Delivery: ~{estimatedWeeks} Sprints ({estimatedWeeks * 2} Weeks)
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-4 mb-6 text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Architecture Base:</span>
                <span className="text-slate-200">${platformBase.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Squad Cost ({teamSize} Devs):</span>
                <span className="text-slate-200">${teamCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Add-on Modules:</span>
                <span className="text-slate-200">${featureCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Form */}
            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Estimate Request Received!</h3>
                <p className="text-xs text-slate-300">
                  Our Lead Technical Architect will review your scope and email your detailed proposal within 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Project Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Mention any specific timelines or legacy systems..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Lock Estimate & Request Consultation</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
