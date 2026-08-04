"use client";

import { useState } from "react";
import {
  Briefcase,
  ExternalLink,
  Code,
  Sparkles,
  Zap,
  X,
  Layers,
  CheckCircle,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  client: string;
  category: "Web Architecture" | "AI & LLM" | "Cloud & DevOps" | "FinTech";
  metric: string;
  metricLabel: string;
  summary: string;
  tech: string[];
  challenges: string[];
  results: string[];
  quote: string;
  author: string;
}

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      id: "acme-fintech",
      title: "Enterprise High-Frequency Settlement Engine",
      client: "Acme Financial Global",
      category: "FinTech",
      metric: "< 45ms",
      metricLabel: "Global Transaction Latency",
      summary: "Migrated legacy monolithic infrastructure to microservices on Next.js 15 and Cloudflare Edge Workers with zero downtime.",
      tech: ["Next.js 15", "TypeScript", "Stripe API", "Cloudflare Workers", "Redis"],
      challenges: [
        "Handling 12,000 requests per second during market open bursts.",
        "Strict compliance requirement for end-to-end PCI-DSS encryption.",
      ],
      results: [
        "Reduced transaction latency by 72% globally.",
        "Passed SOC2 Type II audit with 100% compliance score.",
      ],
      quote: "NexusClients transformed our core payment portal experience. Our users noticed instant speed improvements.",
      author: "Sarah Chen, Chief Technology Officer",
    },
    {
      id: "veridian-ai",
      title: "Real-Time Document Intelligence Portal",
      client: "Veridian Health Labs",
      category: "AI & LLM",
      metric: "98.8%",
      metricLabel: "OCR & LLM Extraction Precision",
      summary: "Integrated Retrieval-Augmented Generation (RAG) models to index millions of medical research documents instantly.",
      tech: ["Next.js App Router", "Python FastAPI", "OpenAI Embeddings", "Pinecone Vector DB"],
      challenges: [
        "Parsing complex tabular structures from multi-page medical PDFs.",
        "Ensuring HIPAA compliant encrypted client data pipeline.",
      ],
      results: [
        "Cut document review time from 4 hours down to 90 seconds.",
        "Engineered real-time streaming answer UI for researchers.",
      ],
      quote: "The RAG search accuracy and fluid client dashboard exceeded all our expectations.",
      author: "Dr. Marcus Vance, VP of Research",
    },
    {
      id: "hypercloud-portal",
      title: "Multi-Region Cloud Asset Management Portal",
      client: "HyperScale Networks",
      category: "Cloud & DevOps",
      metric: "99.99%",
      metricLabel: "Uptime SLA Maintained",
      summary: "Architected a unified glassmorphism dashboard monitoring 40+ Kubernetes clusters across AWS and GCP.",
      tech: ["Next.js", "Tailwind CSS", "GraphQL", "AWS Lambda", "Terraform"],
      challenges: [
        "Aggregating streaming telemetry metrics from 40+ global locations.",
        "Designing responsive dark-mode visualization for complex network graphs.",
      ],
      results: [
        "Unified 5 disparate monitoring tools into a single client portal.",
        "Saved $340,000 annually in redundant cloud monitoring licenses.",
      ],
      quote: "The live telemetry portal is now the daily cockpit for our entire operations team.",
      author: "Elena Rostova, Lead DevOps Architect",
    },
    {
      id: "lumina-ecommerce",
      title: "Global Luxury Brand E-Commerce Platform",
      client: "Lumina Maison Paris",
      category: "Web Architecture",
      metric: "3.4x",
      metricLabel: "Mobile Conversion Rate Boost",
      summary: "Engineered headless 3D interactive showcase catalog with dynamic multi-currency and localization support.",
      tech: ["Next.js 15", "Three.js", "Shopify Storefront API", "Tailwind CSS"],
      challenges: [
        "Achieving 60fps 3D product rendering on mobile web browsers.",
        "Sub-second page transitions across 14 language locales.",
      ],
      results: [
        "Achieved 99/100 Lighthouse performance rating.",
        "Increased organic conversion rates by 240% in first quarter.",
      ],
      quote: "Our online boutique looks like a futuristic art gallery. The craftsmanship is outstanding.",
      author: "Jean-Luc Moreau, Digital Strategy Director",
    },
  ];

  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-4">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Case Studies & Track Record</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Engineered for High-Impact <span className="gradient-text">Results</span>
        </h1>
        <p className="text-slate-400 mt-4 text-base sm:text-lg">
          Explore how we build web portals, AI architectures, and cloud solutions for industry leaders.
        </p>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {["All", "Web Architecture", "AI & LLM", "Cloud & DevOps", "FinTech"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold border border-cyan-400 shadow-md"
                  : "glass-card text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setActiveModalProject(project)}
            className="glass-card glass-card-hover rounded-3xl p-8 border border-slate-800 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-400">
                  {project.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{project.client}</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {project.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {project.summary}
              </p>

              {/* Metric Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-white tracking-tight">{project.metric}</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{project.metricLabel}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-mono group-hover:underline">
              <span>View Case Study Architecture</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Case Study Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl border border-slate-700 max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-xs font-mono text-cyan-400 mb-2">
              <span>{activeModalProject.category}</span>
              <span>•</span>
              <span>{activeModalProject.client}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {activeModalProject.title}
            </h2>

            {/* Impact Banner */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-cyan-300 uppercase">Primary Impact Metric</div>
                <div className="text-3xl font-extrabold text-white mt-1">{activeModalProject.metric}</div>
                <div className="text-xs text-emerald-400 font-mono">{activeModalProject.metricLabel}</div>
              </div>
              <Sparkles className="w-8 h-8 text-cyan-400 opacity-80" />
            </div>

            {/* Challenges & Solutions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider font-mono">Key Challenges</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeModalProject.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider font-mono">Results Delivered</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeModalProject.results.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Client Quote */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs italic text-slate-300 mb-6">
              "{activeModalProject.quote}"
              <div className="text-cyan-400 font-mono not-italic font-semibold mt-2">— {activeModalProject.author}</div>
            </div>

            <button
              onClick={() => setActiveModalProject(null)}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Close Case Study
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
