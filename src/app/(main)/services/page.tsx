"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function ServicesPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tiers = [
    {
      name: "Starter Sprint",
      tagline: "Ideal for MVP launches, feature additions, or targeted modernizations.",
      priceMonthly: 4900,
      priceAnnual: 3900,
      popular: false,
      features: [
        "1 Dedicated Full-Stack Developer",
        "Next.js 15 & React Architecture",
        "Standard Client Portal Access",
        "48-hour Support Response SLA",
        "Bi-weekly Milestone Reviews",
        "Automated CI/CD Pipeline Setup",
      ],
      cta: "Select Starter",
      gradient: "border-slate-800",
    },
    {
      name: "Enterprise Retainer",
      tagline: "Comprehensive engineering squad & dedicated client portal management.",
      priceMonthly: 9800,
      priceAnnual: 7800,
      popular: true,
      features: [
        "3 Dedicated Senior Engineers + Tech Lead",
        "Full Custom Client Portal & Analytics",
        "99.9% Uptime Guarantee & SLA",
        "Same-day Priority Support SLA",
        "Weekly Live Demo & Sprint Releases",
        "Custom AI / LLM Integrations",
        "SOC2 & Security Compliance Audits",
      ],
      cta: "Start Enterprise Sprint",
      gradient: "border-cyan-500/50 shadow-xl shadow-cyan-500/10",
    },
    {
      name: "Custom Product Squad",
      tagline: "Scale your engineering capability with end-to-end dedicated squad.",
      priceMonthly: 18500,
      priceAnnual: 14800,
      popular: false,
      features: [
        "Full Cross-Functional Engineering Squad",
        "Custom Domain Client Portal & White-Label",
        "24/7 Dedicated Slack/Teams Channel",
        "Multi-Cloud AWS / GCP Architecture",
        "Continuous Performance Optimization",
        "Quarterly Executive Architecture Reviews",
      ],
      cta: "Schedule Scope Call",
      gradient: "border-indigo-500/40",
    },
  ];

  const faqs = [
    {
      q: "How does the Client Portal access work for our team?",
      a: "Every active client receives dedicated admin and viewer credentials to your custom portal. You can view live sprint progress, review code pull requests, download deliverables, and communicate directly with your team in real time.",
    },
    {
      q: "Can we switch between monthly and annual billing?",
      a: "Yes! You can upgrade, downgrade, or switch billing frequency at the start of any billing cycle directly through your client billing dashboard.",
    },
    {
      q: "What tech stack do you specialize in?",
      a: "We specialize in Next.js (App Router, TypeScript, React Server Components), Tailwind CSS, Node.js microservices, Python AI pipelines (OpenAI/LangChain), and cloud deployment on Vercel, AWS, and Cloudflare Edge.",
    },
    {
      q: "What guarantees do you offer for code quality and security?",
      a: "All code undergoes strict automated linting, type-checking, and manual peer review before deployment. Enterprise tier clients receive quarterly security vulnerability audits and dedicated SLA uptime guarantees.",
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent Pricing & Service SLA</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Flexible Engineering <span className="gradient-text">Packages</span>
        </h1>
        <p className="text-slate-400 mt-4 text-base sm:text-lg">
          Transparent pricing with built-in client portal access, sprint guarantees, and dedicated engineering expertise.
        </p>

        {/* Annual / Monthly Toggle Switch */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!isAnnual ? "text-white" : "text-slate-400"}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 rounded-full bg-slate-800 border border-slate-700 p-1 relative transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Billing Frequency"
          >
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-medium flex items-center gap-2 ${isAnnual ? "text-white" : "text-slate-400"}`}>
            Annual Billing
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold">
              SAVE 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {tiers.map((tier, idx) => {
          const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;
          return (
            <div
              key={idx}
              className={`glass-card rounded-3xl p-8 border ${tier.gradient} relative flex flex-col justify-between ${
                tier.popular ? "bg-slate-900/80" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-xs px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular for Enterprises
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-xs mb-6 min-h-[36px]">{tier.tagline}</p>

                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">${price.toLocaleString()}</span>
                    <span className="text-slate-400 text-xs font-mono">/ month</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    {isAnnual ? "Billed annually ($" + (price * 12).toLocaleString() + "/yr)" : "Billed monthly"}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact"
                className={`w-full py-3.5 rounded-xl font-semibold text-sm text-center transition-all flex items-center justify-center gap-2 ${
                  tier.popular
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:opacity-95 shadow-lg shadow-cyan-500/20"
                    : "glass-card text-slate-200 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* SLA Spec Breakdown Table */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">SLA & Features Comparison</h2>
          <p className="text-slate-400 text-sm mt-2">Detailed technical service level agreement specs across plans</p>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Specification</th>
                  <th className="py-4 px-6 text-center">Starter</th>
                  <th className="py-4 px-6 text-center text-cyan-400">Enterprise</th>
                  <th className="py-4 px-6 text-center">Custom Squad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {[
                  { spec: "Client Portal Admin Accounts", starter: "2 Users", enterprise: "10 Users", custom: "Unlimited" },
                  { spec: "SLA Response Guarantee", starter: "48 Hours", enterprise: "Same-Day (4h)", custom: "Instant (1h)" },
                  { spec: "Dedicated Tech Lead", starter: "Shared", enterprise: "Dedicated", custom: "Dedicated Principal" },
                  { spec: "Security & Vulnerability Audits", starter: "Annual", enterprise: "Quarterly", custom: "Continuous CI/CD" },
                  { spec: "White-Label Portal Branding", starter: "—", enterprise: "Included", custom: "Full Custom Domain" },
                  { spec: "Code Repository Ownership", starter: "Full IP Transfer", enterprise: "Full IP Transfer", custom: "Full IP Transfer" },
                ].map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{row.spec}</td>
                    <td className="py-4 px-6 text-center text-slate-400 font-mono">{row.starter}</td>
                    <td className="py-4 px-6 text-center font-semibold text-cyan-300 font-mono bg-cyan-950/20">{row.enterprise}</td>
                    <td className="py-4 px-6 text-center text-indigo-300 font-mono">{row.custom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-xs font-mono text-slate-400 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => (
            <div
              key={fIdx}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                    openFaq === fIdx ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>
              {openFaq === fIdx && (
                <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
